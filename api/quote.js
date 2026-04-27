/**
 * Vercel serverless function: accept quote form POST and email both addresses via SMTP.
 *
 * Production env (Vercel): set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Optional: EMAIL_FROM.
 * Forms POST application/x-www-form-urlencoded; Vercel parses into req.body.
 */

import nodemailer from 'nodemailer';

const RECIPIENTS = [
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
    /\b(posture|casino|crypto|forex|loan|seo service|guest post)\b/i,
    /\b(buy now|limited time|special offer|discount|free shipping)\b/i,
    /\b(telegram|whatsapp|signal)\b/i,
  ];

  const spamMatchCount = spamPatterns.reduce((count, pattern) => (
    count + (pattern.test(lower) ? 1 : 0)
  ), 0);

  // Require stronger evidence to avoid blocking legitimate long messages.
  return (hasExplicitLink && spamMatchCount >= 1) || spamMatchCount >= 2;
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
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

  if (isRateLimited(ip)) {
    // Quietly return success page for bot traffic.
    return res.redirect(302, '/contact/?submitted=1');
  }

  // Honeypot fields: treat as success but do not send.
  const botField = asTrimmedString(body['bot-field']);
  const websiteField = asTrimmedString(body.website);
  if (botField || websiteField) {
    return res.redirect(302, '/contact/?submitted=1');
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
    return res.redirect(302, '/contact/?submitted=1');
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
  const subject = buildSubject(body, fullName);
  const html = buildEmailBody({
    ...body,
    full_name: fullName,
    email,
    phone,
    message,
  });
  const replyTo = email || undefined;
  const secure = port === 465;

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
      to: RECIPIENTS,
      subject,
      html,
    };
    if (replyTo) mailOptions.replyTo = replyTo;

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  return res.redirect(302, '/contact/?submitted=1');
}
