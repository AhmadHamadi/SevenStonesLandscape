/**
 * POST /api/sign
 *
 * Called when a customer signs a Work Agreement on /sign. Emails a complete copy
 * to the customer and to the office, with the signed PDF attached and the drawn
 * signature embedded inline.
 *
 * The agreement travels in the signing link rather than a database, so this
 * endpoint reconstructs it from the same token the customer read, using the same
 * wording module the page rendered from. That is what stops the email and the
 * page from ever disagreeing.
 *
 * Transports mirror api/quote.js exactly: Resend first, SMTP fallback. See the
 * note on DEFAULT_RESEND_FROM below - it is not an oversight.
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import {
  decodeContract, buildClauses, money, longDate, priceBreakdown, linkExpiry,
  SIGNERS, AGENCY, LINK_EXPIRY_HOURS
} from '../tools/contract/contract-model.js';
import { archiveSignedContract } from './_archive.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/* sevenstoneslandscape.ca is registered on the Resend account but its domain
   verification has FAILED and the DNS records were never added at Wix. Resend
   refuses any send from an unverified domain, so defaulting to an @sevenstones
   address would 500 every signature. tradeleadsmarketing.com is verified on the
   same account, so it is the working sender until the DNS is fixed. Reply-To is
   always the Seven Stones office, so replies land in the right inbox.
   To switch over once DNS is done: set RESEND_FROM in Vercel. No code change. */
const DEFAULT_RESEND_FROM = 'Seven Stones Landscape <info@tradeleadsmarketing.com>';
const DEFAULT_SMTP_FROM = 'forms@clinimedia.ca';

const LIMITS = { typedName: 120, reference: 60, signedAt: 20, token: 12_000, filename: 200 };
const MAX_SIGNATURE_BYTES = 400_000;    // a drawn signature is a few tens of KB
/* base64, and it has to fit inside Vercel's 4.5MB request body alongside the token
   and the signature. A text PDF of this contract is well under 200KB, so 3MB is
   already generous; anything larger is a bug, not a long scope. */
const MAX_PDF_BYTES = 3_000_000;

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

const clean = (v, max) =>
  String(v ?? '').replace(/[\0-\b\v-\x1f\x7f]/g, '').trim().slice(0, max);

const isValidEmail = (e) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e)) && String(e).length <= 200;

/* Rate limit - best effort, per warm serverless instance. */
const hits = new Map();
const RATE_LIMIT_MAX = 6;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_LIMIT_MAX;
}

function clientIp(req) {
  const fwd = req?.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).trim();
  return req?.headers?.['x-real-ip'] || req?.socket?.remoteAddress || '';
}

/* ============================================================
   RENDERING
   The clause strings carry **bold** runs and "- " list lines. Both renderers
   below understand exactly those two conventions, so the email says the same
   thing as the page the customer signed.
   ============================================================ */

const boldToHtml = (s) => escapeHtml(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const boldToText = (s) => String(s).replace(/\*\*([^*]+)\*\*/g, '$1');

function clauseHtml(clause) {
  const blocks = [];
  let bullets = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      `<ul style="margin:6px 0 6px 18px;padding:0;">${
        bullets.map((b) => `<li style="margin:3px 0;">${boldToHtml(b)}</li>`).join('')
      }</ul>`
    );
    bullets = [];
  };
  for (const p of clause.paras) {
    if (p.startsWith('- ')) bullets.push(p.slice(2));
    else { flush(); blocks.push(`<p style="margin:6px 0;">${boldToHtml(p)}</p>`); }
  }
  flush();
  return `
    <h2 style="font-size:14px;font-weight:700;margin:18px 0 4px;color:#15202E;">
      ${clause.n}. ${escapeHtml(clause.title)}
    </h2>
    <div style="font-size:13px;line-height:1.6;color:#15202E;">${blocks.join('')}</div>`;
}

function clauseText(clause) {
  const lines = [`${clause.n}. ${clause.title.toUpperCase()}`, ''];
  for (const p of clause.paras) {
    lines.push(p.startsWith('- ') ? `  * ${boldToText(p.slice(2))}` : boldToText(p));
    lines.push('');
  }
  return lines.join('\n');
}

export function buildSignedEmail({ d, typedName, signedAtLong, reference, signatureCid, hasPdf }) {
  const signer = SIGNERS[d.signerIndex] || SIGNERS[0];
  const clauses = buildClauses(d);
  const p = priceBreakdown(d);
  const first = String(d.clientContact || d.clientName || '').trim().split(/\s+/)[0] || 'there';

  const subject = `Signed - ${d.clientName || 'Work Agreement'} (${reference})`;

  /* Deliberately plain. A signed contract is not a newsletter: no banner, no
     brand block, no coloured panels. A short note that reads like a person
     wrote it, with the agreement attached. */
  const facts = [
    ['Work at', d.siteAddress || d.clientAddress || '—'],
    ['Total', p ? `${money(p.total, d.currency)} (incl. HST)` : '—'],
    ...(p && p.deposit > 0 ? [['Deposit now', money(p.deposit, d.currency)]] : []),
    ...(p ? p.instalments.map((i) => [i.label, money(i.value, d.currency)]) : []),
    ...(d.paymentMethod ? [['Pay by', d.paymentMethod]] : []),
    ['Starts', longDate(d.startDate) || '—'],
    ['Finished by', longDate(d.completeDate) || '—']
  ];

  const html = `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#15202E;max-width:560px;margin:0 auto;padding:8px 4px;">
  <p>Hi ${escapeHtml(first)},</p>

  <p>Thanks - your agreement with ${escapeHtml(AGENCY.name)} is signed.
  ${hasPdf ? 'The full signed copy is attached to this email as a PDF.' : 'The full agreement is set out below.'}</p>

  <table style="border-collapse:collapse;font-size:15px;margin:18px 0;">
    <tbody>
      ${facts.map(([k, v]) => `
        <tr>
          <td style="padding:4px 18px 4px 0;color:#6B7688;">${escapeHtml(k)}</td>
          <td style="padding:4px 0;"><strong>${escapeHtml(v)}</strong></td>
        </tr>`).join('')}
    </tbody>
  </table>

  <p style="margin:18px 0;padding:12px 14px;background:#F4F7FA;border-radius:8px;font-size:14px;">
    <strong>You can still cancel.</strong> You have 10 days from today to cancel for any
    reason, and any deposit comes back within 15 days. Just reply to this email or call
    ${escapeHtml(AGENCY.phone)}.
  </p>

  <p style="font-size:14px;color:#6B7688;">
    Signed electronically on ${escapeHtml(signedAtLong)} by ${escapeHtml(typedName)},
    and by ${escapeHtml(signer.name)} for ${escapeHtml(AGENCY.name)}.
    <br><img src="cid:${signatureCid}" alt="Signature" style="max-height:38px;margin-top:6px;display:block;">
  </p>

  ${hasPdf ? '' : `
    <hr style="border:none;border-top:1px solid #C9D3DE;margin:22px 0;">
    ${clauses.map(clauseHtml).join('')}`}

  <p style="font-size:14px;color:#6B7688;margin-top:24px;">
    ${escapeHtml(signer.name)}<br>
    ${escapeHtml(AGENCY.name)}<br>
    ${escapeHtml(AGENCY.phone)} &middot; ${escapeHtml(AGENCY.email)}
  </p>
</div>`;

  const text = [
    `Hi ${first},`,
    '',
    `Thanks - your agreement with ${AGENCY.name} is signed.`,
    hasPdf ? 'The full signed copy is attached to this email as a PDF.'
           : 'The full agreement is set out below.',
    '',
    ...facts.map(([k, v]) => `${`${k}:`.padEnd(16, ' ')}${v}`),
    '',
    'YOU CAN STILL CANCEL. You have 10 days from today to cancel for any reason,',
    `and any deposit comes back within 15 days. Reply to this email or call ${AGENCY.phone}.`,
    '',
    `Signed electronically on ${signedAtLong} by ${typedName},`,
    `and by ${signer.name} for ${AGENCY.name}.`,
    ...(hasPdf ? [] : ['', '='.repeat(60), '', ...clauses.map(clauseText)]),
    '',
    signer.name,
    AGENCY.name,
    `${AGENCY.phone} - ${AGENCY.email}`
  ].join('\n');

  return { subject, html, text };
}

/* ============================================================
   TRANSPORTS
   ============================================================ */
/* Both transports carry the same deliverability headers api/quote.js settled on:
   X-Entity-Ref-ID stops Gmail collapsing separate agreements into one thread, and
   Auto-Submitted marks these transactional rather than promotional. See
   FORMS_SETUP.md for why those matter on this domain. */
const transactionalHeaders = (ref) => ({
  'X-Entity-Ref-ID': ref,
  'Auto-Submitted': 'auto-generated'
});

async function sendViaResend({ apiKey, from, to, replyTo, subject, html, text, attachments, idempotencyKey }) {
  const ref = crypto.randomUUID();
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Derived from the signature itself, not random: if Vercel re-invokes this
      // function the key is identical and Resend collapses the retry, so the
      // customer is never emailed two copies of the same signed agreement. A
      // genuine re-sign produces different ink and so a different key.
      'Idempotency-Key': idempotencyKey || ref
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo,
      subject,
      html,
      text,
      headers: transactionalHeaders(ref),
      attachments: attachments?.length
        ? attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            content_id: a.contentId
          }))
        : undefined
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json().catch(() => ({}));
}

async function sendViaSmtp({ host, port, secure, user, pass, from, to, replyTo, subject, html, text, attachments }) {
  const transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
    ...(port === 587 && { requireTLS: true }),
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000
  });

  const fromDomain = String(from).split('@')[1] || 'sevenstoneslandscape.ca';
  const ref = crypto.randomUUID();
  const recipients = Array.isArray(to) ? to : [to];

  return transporter.sendMail({
    from: `"${AGENCY.name}" <${from}>`,
    to: recipients.join(', '),
    replyTo,
    subject, html, text,
    // Keep Message-ID on the From: domain; a mismatch is an extra spam signal.
    messageId: `<${ref}@${fromDomain}>`,
    // SPF authenticates the envelope sender, not the From: header. Pinning the
    // envelope to the authenticated mailbox keeps Return-Path on a domain we
    // publish SPF for, so SPF passes and aligns for DMARC.
    envelope: { from: process.env.SMTP_ENVELOPE_FROM || user, to: recipients },
    headers: transactionalHeaders(ref),
    attachments: (attachments || []).map((a) => ({
      filename: a.filename,
      content: a.content,
      encoding: 'base64',
      cid: a.contentId
    }))
  });
}

/* ============================================================
   HANDLER
   ============================================================ */
export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || AGENCY.origin;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    if (body.length > 10_000_000) return res.status(413).json({ error: 'Payload too large' });
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      error: `Too many attempts from this connection. Please call ${AGENCY.phone} and we will finish it with you.`
    });
  }

  const token     = clean(body.token, LIMITS.token);
  const typedName = clean(body.typedName, LIMITS.typedName);
  const reference = clean(body.reference, LIMITS.reference) || 'SSL-AGREEMENT';
  const signedAt  = clean(body.signedAt, LIMITS.signedAt);
  const signature = String(body.signature || '');

  if (!token) return res.status(400).json({ error: 'This signing link is missing its agreement.' });
  if (typedName.length < 2) return res.status(400).json({ error: 'Please type your full name.' });

  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(signature);
  if (!m) return res.status(400).json({ error: 'Please sign in the signature box.' });
  if (m[1].length > MAX_SIGNATURE_BYTES) {
    return res.status(413).json({ error: 'That signature image is too large to send.' });
  }

  let d;
  try {
    d = decodeContract(token);
  } catch {
    return res.status(400).json({ error: 'This signing link could not be read. Please ask us to resend it.' });
  }

  /* The page blocks an expired link, but the page is the customer's browser and
     can be edited. The refusal that counts is this one. */
  if (linkExpiry(d).expired) {
    return res.status(410).json({
      error: `This signing link has expired. Links are good for ${LINK_EXPIRY_HOURS} hours - ` +
             `please ask us for a fresh one.`
    });
  }

  const signedAtLong = longDate(signedAt) || longDate(new Date().toISOString().slice(0, 10));
  const signatureCid = 'ss-customer-signature';

  /* Identical for a retry of this exact request, different for anything else.
     The token is in the hash on purpose: a corrected contract re-sent the same
     day to the same customer is a different agreement, and must not collide
     with the first one and be swallowed as a duplicate. */
  const idempotencyKey = crypto.createHash('sha256')
    .update(`${token}|${typedName}|${signedAt}|${m[1].slice(0, 512)}`)
    .digest('hex')
    .slice(0, 48);

  /* The PDF is built in the customer's browser and is optional: an older browser
     or a blocked CDN must not stop the signature from being recorded. */
  const rawPdf = String(body.pdfBase64 || '');
  const pdfOk = rawPdf.length > 0
    && rawPdf.length <= MAX_PDF_BYTES
    && /^[A-Za-z0-9+/=]+$/.test(rawPdf);
  if (rawPdf.length > MAX_PDF_BYTES) {
    return res.status(413).json({ error: 'That document is too large to email.' });
  }

  const safeName = clean(body.pdfFilename, LIMITS.filename)
    .replace(/[\\/:*?"<>|]+/g, '-') || `Seven Stones Work Agreement - ${reference}.pdf`;
  const pdfFilename = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

  const { subject, html, text } = buildSignedEmail({
    d, typedName, signedAtLong, reference, signatureCid, hasPdf: pdfOk
  });

  const office = process.env.MAIL_TO || AGENCY.email;
  /* Deduped case-insensitively: when the customer address is the office address -
     a test, or a job for ourselves - one copy is right, not two. */
  const recipients = [office];
  if (isValidEmail(d.clientEmail)
      && d.clientEmail.trim().toLowerCase() !== String(office).trim().toLowerCase()) {
    recipients.push(d.clientEmail.trim());
  }

  const attachments = [
    { filename: `signature-${reference}.png`, content: m[1], contentId: signatureCid }
  ];
  if (pdfOk) attachments.unshift({ filename: pdfFilename, content: rawPdf });

  const resendKey  = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || DEFAULT_RESEND_FROM;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secureEnv = process.env.SMTP_SECURE;
  const secure = secureEnv != null ? secureEnv === 'true' : port === 465;
  const smtpFrom = process.env.MAIL_FROM || DEFAULT_SMTP_FROM;
  const smtpConfigured = Boolean(host && user && pass);

  if (!resendKey && !smtpConfigured) {
    console.error('[sign] No transport configured: set RESEND_API_KEY, or SMTP_HOST/SMTP_USER/SMTP_PASS');
    return res.status(500).json({
      error: `Email is not configured on our end. Your signature was not sent — please call ${AGENCY.phone}.`
    });
  }

  /* The archive is a convenience for the office, never the record of the signature.
     A storage failure must not tell the customer their signing failed. */
  const archived = await archiveSignedContract({
    reference, d, typedName, signedAt, signedAtLong, signature, ip: clientIp(req)
  }).catch((err) => {
    console.error('[sign] Archive write failed:', err?.message || err);
    return false;
  });

  if (resendKey) {
    try {
      await sendViaResend({
        apiKey: resendKey, from: resendFrom, to: recipients, replyTo: office,
        subject, html, text, attachments, idempotencyKey
      });
      return res.status(200).json({ ok: true, via: 'resend', sentTo: recipients.length, pdf: pdfOk, archived });
    } catch (err) {
      console.error('[sign] Resend send failed:', err?.message || err);
      if (!smtpConfigured) {
        return res.status(502).json({
          error: `We could not email the signed copy. Please call ${AGENCY.phone} and we will send it manually.`
        });
      }
    }
  }

  try {
    await sendViaSmtp({
      host, port, secure, user, pass, from: smtpFrom, to: recipients, replyTo: office,
      subject, html, text, attachments
    });
    return res.status(200).json({ ok: true, via: 'smtp', sentTo: recipients.length, pdf: pdfOk, archived });
  } catch (err) {
    console.error('[sign] SMTP send failed:', err?.message || err);
    return res.status(502).json({
      error: `We could not email the signed copy. Please call ${AGENCY.phone} and we will send it manually.`
    });
  }
}
