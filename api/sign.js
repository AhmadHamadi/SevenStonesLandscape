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
  decodeContract, buildClauses, selectedServices, money, longDate, priceBreakdown,
  SIGNERS, AGENCY
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
  const services = selectedServices(d).map((s) => s.label);
  const agreementDate = longDate(d.agreementDate) || '—';

  const subject = `Signed agreement — ${d.clientName || 'Customer'} and ${AGENCY.name} (${reference})`;

  const payment = p
    ? [
        p.deposit > 0 ? `${money(p.deposit, d.currency)} deposit on signing` : '',
        ...p.instalments.map((i) => `${money(i.value, d.currency)} ${i.label.toLowerCase()}`)
      ].filter(Boolean).join(', ')
    : '—';

  const summaryRows = [
    ['Customer', `${d.clientName || '—'}${d.clientContact && d.clientContact !== d.clientName ? ` — ${d.clientContact}` : ''}`],
    ['Property', d.siteAddress || d.clientAddress || '—'],
    ['Agreement date', agreementDate],
    ['Work starts', longDate(d.startDate) || '—'],
    ['Complete by', longDate(d.completeDate) || '—'],
    ['Total payable', p ? money(p.total, d.currency) : '—'],
    ['Payment', payment],
    ['Work', services.length ? services.join(', ') : '—'],
    ['Reference', reference]
  ];

  const html = `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#15202E;max-width:640px;margin:0 auto;">
  <div style="background:#134A8A;padding:20px 24px;">
    <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#BDD4EA;font-weight:700;">
      ${escapeHtml(AGENCY.legalName)}
    </div>
    <div style="font-size:20px;font-weight:800;color:#FFFFFF;margin-top:6px;">
      Signed Work Agreement
    </div>
  </div>
  <div style="height:3px;background:#1B62B5;"></div>

  <div style="border:1px solid #C9D3DE;border-top:none;background:#fff;padding:24px;">
    <p style="font-size:13px;line-height:1.6;margin:0 0 16px;">
      This agreement was signed electronically on <strong>${escapeHtml(signedAtLong)}</strong> by
      <strong>${escapeHtml(typedName)}</strong> for
      <strong>${escapeHtml(d.clientName || 'the Customer')}</strong>, and by
      <strong>${escapeHtml(signer.name)}</strong> for ${escapeHtml(AGENCY.name)}.
      ${hasPdf ? 'The signed PDF is attached. ' : ''}Keep this email for your records.
    </p>

    <div style="background:#E4EEF7;border-left:3px solid #1B62B5;padding:11px 13px;font-size:13px;line-height:1.6;margin:0 0 18px;">
      <strong>Your right to cancel.</strong> This is a direct agreement under Ontario's
      Consumer Protection Act, 2002. You may cancel it for any reason within 10 days of
      receiving this copy, and any deposit is refunded within 15 days. Reply to this email
      or call ${escapeHtml(AGENCY.phone)}.
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #C9D3DE;">
      <tbody>
        ${summaryRows.map(([k, v], i) => `
          <tr${i < summaryRows.length - 1 ? ' style="border-bottom:1px solid #E3E9EF;"' : ''}>
            <td style="padding:8px 10px;background:#F4F7FA;width:150px;vertical-align:top;font-weight:700;">${escapeHtml(k)}</td>
            <td style="padding:8px 10px;">${escapeHtml(v)}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <hr style="border:none;border-top:2px solid #15202E;margin:26px 0 8px;" />

    ${clauses.map(clauseHtml).join('')}

    <hr style="border:none;border-top:2px solid #15202E;margin:26px 0 16px;" />

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:16px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#6B7688;font-weight:700;">
            For ${escapeHtml(AGENCY.name)}
          </div>
          <div style="height:44px;"></div>
          <div style="border-bottom:1px solid #15202E;"></div>
          <div style="font-size:13px;font-weight:700;margin-top:6px;">${escapeHtml(signer.name)}</div>
          <div style="font-size:12px;color:#6B7688;">${escapeHtml(signer.title)}</div>
          <div style="font-size:12px;margin-top:8px;">${escapeHtml(agreementDate)}</div>
        </td>
        <td style="width:50%;vertical-align:top;padding-left:16px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#6B7688;font-weight:700;">
            For ${escapeHtml(d.clientName || 'the Customer')}
          </div>
          <div style="height:44px;">
            <img src="cid:${signatureCid}" alt="Signature" style="max-height:44px;display:block;" />
          </div>
          <div style="border-bottom:1px solid #15202E;"></div>
          <div style="font-size:13px;font-weight:700;margin-top:6px;">${escapeHtml(typedName)}</div>
          <div style="font-size:12px;color:#6B7688;">
            ${escapeHtml(d.clientTitle || '')}${d.clientName ? `, ${escapeHtml(d.clientName)}` : ''}
          </div>
          <div style="font-size:12px;margin-top:8px;">${escapeHtml(signedAtLong)}</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="font-size:11px;color:#6B7688;text-align:center;padding:14px;">
    ${escapeHtml(AGENCY.legalName)} · ${escapeHtml(AGENCY.phone)} · ${escapeHtml(AGENCY.email)}
  </div>
</div>`;

  const text = [
    'SIGNED WORK AGREEMENT',
    AGENCY.legalName,
    '',
    `Signed electronically on ${signedAtLong} by ${typedName} for ${d.clientName || 'the Customer'},`,
    `and by ${signer.name} for ${AGENCY.name}.`,
    hasPdf ? 'The signed PDF is attached.' : '',
    '',
    'YOUR RIGHT TO CANCEL: this is a direct agreement under Ontario\'s Consumer Protection',
    'Act, 2002. You may cancel for any reason within 10 days of receiving this copy, and any',
    `deposit is refunded within 15 days. Reply to this email or call ${AGENCY.phone}.`,
    '',
    ...summaryRows.map(([k, v]) => `${`${k}:`.padEnd(18, ' ')}${v}`),
    '',
    '='.repeat(64),
    '',
    ...clauses.map(clauseText),
    '='.repeat(64),
    '',
    `For ${AGENCY.name}:  ${signer.name}, ${signer.title}   ${agreementDate}`,
    `For ${d.clientName || 'the Customer'}:  ${typedName}   ${signedAtLong}`,
    '',
    `${AGENCY.legalName} · ${AGENCY.phone} · ${AGENCY.email}`
  ].filter((l) => l !== '').join('\n');

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

  const signedAtLong = longDate(signedAt) || longDate(new Date().toISOString().slice(0, 10));
  const signatureCid = 'ss-customer-signature';

  /* Stable across retries of this exact signature, different for a genuine re-sign. */
  const idempotencyKey = crypto.createHash('sha256')
    .update(`${reference}|${typedName}|${signedAt}|${m[1].slice(0, 512)}`)
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
