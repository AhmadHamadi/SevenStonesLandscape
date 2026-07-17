/**
 * Vercel serverless function: accept quote form POST and email the team via SMTP.
 *
 * Production env (Vercel): set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Optional: EMAIL_FROM.
 * Forms POST application/x-www-form-urlencoded; Vercel parses into req.body.
 *
 * Deliverability rules this file depends on (see FORMS_SETUP.md):
 *  - Real recipients go in To:, never Bcc:. A message whose only real recipients are Bcc'd,
 *    addressed To: its own From:, is the classic bulk-mail shape and Gmail scores it as spam.
 *  - Every message carries a text/plain part. HTML-only is a standing SpamAssassin penalty.
 *  - The From: domain must be a domain we publish SPF+DKIM+DMARC for, and its display name
 *    must not claim an organisation that the domain does not belong to.
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';

const RECIPIENTS = [
  'info@sevenstoneslandscape.ca',
  'john.scime.mcmaster@gmail.com',
  'ahmadhamadi2002@gmail.com',
];

const DEFAULT_FROM = 'Seven Stones Landscape <forms@clinimedia.ca>';
const EMPTY_FALLBACK = '&mdash;';

const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX_REQUESTS = 12;
const RATE_MAP_MAX_KEYS = 1000;
const rateMap = new Map();

function escapeHtml(s) {
  if (s == null || s === '') return EMPTY_FALLBACK;
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeBody(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      return Object.fromEntries(new URLSearchParams(raw));
    } catch (_) {
      return {};
    }
  }
  return {};
}

function asTrimmedString(value) {
  if (value == null) return '';
  return String(value).trim();
}

function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function isReasonableName(name) {
  if (name.length < 2 || name.length > 100) return false;
  return /[A-Za-z]/.test(name) || /[^\u0000-\u007f]/.test(name);
}

function isReasonablePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function looksLikeSpamMessage(message) {
  if (!message) return false;

  const lower = message.toLowerCase();

  const hasExplicitLink = /(https?:\/\/|www\.)/i.test(lower);

  const spamPatterns = [
    /\b(posture|casino|crypto|forex|loan)\b/i,
    /\b(buy now|limited time|special offer|discount|free shipping)\b/i,
    /\b(telegram|whatsapp|signal)\b/i,
  ];

  const spamMatchCount = spamPatterns.reduce((count, pattern) => (
    count + (pattern.test(lower) ? 1 : 0)
  ), 0);

  // Require stronger evidence to avoid blocking legitimate long messages.
  return (hasExplicitLink && spamMatchCount >= 1) || spamMatchCount >= 2;
}

// The biggest source of junk on this form is B2B solicitation: agencies pitching SEO, web
// design, and digital marketing services TO Seven Stones. A homeowner asking for a landscaping
// quote never writes about "SEO", "backlinks", "ranking on Google", or "web design", so any one
// of these HARD signals is treated as near-certain solicitation and dropped. SOFT signals
// ("more leads", "grow your business", "free audit") are common enough in marketese but rare on
// a real lead, so they only drop when two co-occur, or one co-occurs with a link/hard signal.
// The blob scanned is name + message + subject-ish fields, because pitches often stuff the hook
// into the name or company field, not just the message.
// Scanned across name + message. The bare "SEO" acronym is handled separately (message-only)
// so a customer whose name is "Seo" (a common Korean surname) is never dropped.
const SOLICITATION_HARD = [
  /search engine optimi[sz]/i,
  /\bback[\s-]?links?\b/i,
  /\blink[\s-]?building\b/i,
  /\bguest[\s-]?post/i,
  /\bweb(?:site)?[\s-]?(?:design|develop|developer|development|redesign)/i,
  /\b(?:digital|online|internet|social media) marketing\b/i,
  /\blead[\s-]?gen(?:eration)?\b/i,
  /\bapp (?:design|development|developer)\b/i,
  /\b(?:mobile|android|ios) app\b/i,
  /\bwordpress\b/i,
  /\bui[\s\/]?ux\b/i,
  /\blogo design\b/i,
  /\bfirst page of google\b/i,
  /\b(?:top|page one|page 1) of google\b/i,
  /\brank(?:ing|ed)? (?:your|on|higher|#?1|top|first|on the first)/i,
  /\b(?:google|search engine|search)[\s-]?ranking/i,
  /\bwe (?:came across|noticed|found|visited|reviewed|checked|were looking at) your (?:web ?site|site|business online|page)\b/i,
  /\brank(?:ing)? (?:higher|on google|number one|#1|top of)/i,
  /\bincrease your (?:google|search) (?:ranking|visibility|presence)\b/i,
];

const SOLICITATION_SOFT = [
  /\bmore (?:traffic|leads|customers|clients|sales|enquir|inquir)/i,
  /\bincrease your (?:traffic|sales|leads|revenue|visibility|online presence)\b/i,
  /\bgrow your (?:business|revenue|sales|online presence)\b/i,
  /\bboost your (?:ranking|traffic|sales|business|visibility)/i,
  /\bfree (?:audit|website audit|seo audit|consultation|quote for your website|analysis)\b/i,
  /\bno[\s-]?obligation\b/i,
  /\baffordable (?:rates?|price|packages?)\b/i,
  /\breasonable (?:rates?|price|cost)\b/i,
  /\b(?:outsourc|offshore|dedicated) (?:developer|development|team|resources?)\b/i,
  /\bpartner(?:ship)? (?:opportunity|proposal)\b/i,
  /\bcold (?:email|outreach)\b/i,
];

// message = the free-text message (+ services); name = the name/company field. Scanning them
// separately lets the bare "SEO" acronym count only in the message, not a person's name.
function looksLikeSolicitation(message, name) {
  const msg = String(message || '').toLowerCase();
  const blob = `${name || ''} ${message || ''}`.toLowerCase();

  if (SOLICITATION_HARD.some((re) => re.test(blob))) return true;

  // Bare "SEO" / "S.E.O": trusted only in the message body.
  if (/\bs[\W_]?e[\W_]?o\b/i.test(msg)) return true;

  const hasLink = /(https?:\/\/|www\.)/i.test(blob);
  const softCount = SOLICITATION_SOFT.reduce(
    (count, re) => count + (re.test(blob) ? 1 : 0),
    0,
  );

  return softCount >= 2 || (hasLink && softCount >= 1);
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

// The Google Ads landing-page forms submit via fetch (X-Requested-With: fetch) and
// expect JSON back so the client can redirect ONLY on a confirmed success. Every other
// form on the site posts natively and still gets a 302 redirect to the contact page.
function wantsJson(req) {
  const xrw = String(req.headers['x-requested-with'] || '').toLowerCase();
  if (xrw === 'fetch') return true;
  return String(req.headers['accept'] || '').toLowerCase().includes('application/json');
}

function isRateLimited(ip) {
  const now = Date.now();

  if (rateMap.size > RATE_MAP_MAX_KEYS) {
    for (const [key, value] of rateMap.entries()) {
      if (now - value.firstSeen > RATE_WINDOW_MS) {
        rateMap.delete(key);
      }
    }
  }

  const current = rateMap.get(ip);
  if (!current || now - current.firstSeen > RATE_WINDOW_MS) {
    rateMap.set(ip, { firstSeen: now, count: 1 });
    return false;
  }

  current.count += 1;
  rateMap.set(ip, current);
  return current.count > RATE_MAX_REQUESTS;
}

function buildEmailBody(body) {
  const fromPage = body.form_source || 'website';
  const fullName = asTrimmedString(body.full_name) || EMPTY_FALLBACK;
  const message = asTrimmedString(body.message) || EMPTY_FALLBACK;
  const messageCapped = message.length > 2000 ? `${message.slice(0, 1997)}...` : message;

  return `
    <p><strong>New quote request</strong> (from ${escapeHtml(fromPage)})</p>
    <table style="border-collapse: collapse; max-width: 480px;">
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Name</td><td style="padding: 6px 0;">${escapeHtml(fullName)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Email</td><td style="padding: 6px 0;">${escapeHtml(body.email)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Phone</td><td style="padding: 6px 0;">${escapeHtml(body.phone)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">City</td><td style="padding: 6px 0;">${escapeHtml(body.city)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Project type</td><td style="padding: 6px 0;">${escapeHtml(body.project_type)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Service category</td><td style="padding: 6px 0;">${escapeHtml(body.services)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Timeline</td><td style="padding: 6px 0;">${escapeHtml(body.timeline)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Message</td><td style="padding: 6px 0;">${escapeHtml(messageCapped)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600; color:#888; font-size:12px;">Source</td><td style="padding: 6px 0; color:#888; font-size:12px;">${escapeHtml(fromPage)}</td></tr>
    </table>
  `.trim();
}

// Sent alongside the HTML as multipart/alternative. Gmail and SpamAssassin both penalise
// HTML-only mail (MIME_HTML_ONLY), and this is a plain data dump that reads fine as text.
function buildTextBody(body) {
  const fromPage = body.form_source || 'website';
  const message = asTrimmedString(body.message);
  const messageCapped = message.length > 2000 ? `${message.slice(0, 1997)}...` : message;
  const dash = '-';
  const row = (label, value) => `${label}: ${asTrimmedString(value) || dash}`;

  return [
    `New quote request (from ${fromPage})`,
    '',
    row('Name', body.full_name),
    row('Email', body.email),
    row('Phone', body.phone),
    row('City', body.city),
    row('Project type', body.project_type),
    row('Service category', body.services),
    row('Timeline', body.timeline),
    row('Message', messageCapped),
    '',
    `Source: ${fromPage}`,
  ].join('\n');
}

function buildSubject(body, fullName) {
  const src = String(body.form_source || '').toLowerCase();
  let tag = '';
  if (src.includes('ads-concrete')) tag = '[Concrete LP] ';
  else if (src.includes('ads-interlock')) tag = '[Interlock LP] ';
  else if (src.includes('hero')) tag = '[Homepage] ';
  else if (src.includes('contact')) tag = '[Contact page] ';
  else if (src.includes('service-hero-')) {
    const slug = src.replace('service-hero-', '').replace(/-/g, ' ');
    tag = `[Service: ${slug}] `;
  }
  return `${tag}Quote request from ${fullName || 'Customer'}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = normalizeBody(req.body);
  const ip = getClientIp(req);
  const ajax = wantsJson(req);

  // Silent drop for bots/spam: look like a success, but never route to the conversion
  // page (/thank-you/). For fetch clients we send them to the generic contact page so a
  // dropped submission can never fire the Google Ads conversion.
  const dropToContact = () => (
    ajax
      ? res.status(200).json({ ok: true, redirect: '/contact/?submitted=1' })
      : res.redirect(302, '/contact/?submitted=1')
  );

  if (isRateLimited(ip)) {
    // Quietly return success page for bot traffic.
    return dropToContact();
  }

  // Honeypot fields: treat as success but do not send.
  const botField = asTrimmedString(body['bot-field']);
  const websiteField = asTrimmedString(body.website);
  if (botField || websiteField) {
    return dropToContact();
  }

  const fullName = asTrimmedString(body.full_name);
  const email = asTrimmedString(body.email);
  const phone = normalizePhone(asTrimmedString(body.phone));
  const message = asTrimmedString(body.message);

  if (!fullName || (!email && !phone)) {
    return res.status(400).json({ error: 'Please provide your name and either email or phone.' });
  }

  if (!isReasonableName(fullName)) {
    return res.status(400).json({ error: 'Please provide a valid full name.' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (phone && !email && !isReasonablePhone(phone)) {
    return res.status(400).json({ error: 'Please provide a valid phone number.' });
  }

  if (looksLikeSpamMessage(message)) {
    return dropToContact();
  }

  // Drop B2B solicitation (agencies pitching SEO / web / marketing to us). Scan name + message;
  // pitches routinely stuff the company hook into the name field.
  const solicitationMessage = `${message} ${asTrimmedString(body.services)}`;
  if (looksLikeSolicitation(solicitationMessage, fullName)) {
    console.warn('Dropped solicitation submission from', ip);
    return dropToContact();
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT != null ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error('SMTP not configured: need SMTP_HOST, SMTP_USER, SMTP_PASS');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const normalized = {
    ...body,
    full_name: fullName,
    email,
    phone,
    message,
  };
  const subject = buildSubject(body, fullName);
  const html = buildEmailBody(normalized);
  const text = buildTextBody(normalized);
  const replyTo = email || undefined;
  const secure = port === 465;

  // SPF authenticates the envelope sender (Return-Path), not the From: header. Pinning the
  // envelope to the authenticated mailbox keeps Return-Path on the same domain we publish SPF
  // for, so SPF passes and aligns for DMARC even if EMAIL_FROM is overridden.
  const envelopeFrom = process.env.SMTP_ENVELOPE_FROM || user;
  const fromDomain = (from.match(/<([^>]+)>/)?.[1] || from).split('@')[1] || 'sevenstoneslandscape.ca';

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port || 465,
      secure,
      auth: { user, pass },
      ...(port === 587 && { requireTLS: true }),
    });

    const mailOptions = {
      from,
      // Real recipients belong in To:. Previously this addressed the message To: its own
      // From: and Bcc'd the actual team, which is indistinguishable from bulk mail to Gmail.
      to: RECIPIENTS.join(', '),
      subject,
      text,
      html,
      // Keep the Message-ID on the From: domain; a mismatch is an extra spam signal.
      messageId: `<${crypto.randomUUID()}@${fromDomain}>`,
      envelope: { from: envelopeFrom, to: RECIPIENTS },
      headers: {
        // Stops Gmail collapsing separate leads into one thread, and marks these as
        // transactional rather than promotional.
        'X-Entity-Ref-ID': crypto.randomUUID(),
        'Auto-Submitted': 'auto-generated',
      },
    };
    if (replyTo) mailOptions.replyTo = replyTo;

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  // Confirmed success (email sent). Fetch clients (the Google Ads landing-page forms)
  // get JSON and redirect themselves to /thank-you/, which fires the conversion. Native
  // form posts keep the original 302 to the contact thank-you message.
  if (ajax) {
    return res.status(200).json({ ok: true });
  }
  return res.redirect(302, '/contact/?submitted=1');
}
