/**
 * Vercel serverless function: accept quote form POST and email both addresses via SMTP (e.g. cPanel).
 *
 * Production env (Vercel): set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Optional: EMAIL_FROM.
 * Example for cPanel: host = mail.clinimedia.ca, port = 465 (SSL), user = forms@clinimedia.ca.
 * Forms POST application/x-www-form-urlencoded; Vercel parses into req.body.
 * Spam: honeypot (bot-field) + server-side validation (name + email or phone required).
 */

import nodemailer from 'nodemailer';

const RECIPIENTS = [
  'john.scime.mcmaster@gmail.com',
  'ahmadhamadi2002@gmail.com',
];

const DEFAULT_FROM = 'Seven Stones Landscape <forms@clinimedia.ca>';

function escapeHtml(s) {
  if (s == null || s === '') return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailBody(body) {
  const fromPage = body.form_source || 'website';
  const fullName = (body.full_name != null && String(body.full_name).trim()) ? String(body.full_name).trim() : '—';
  const message = (body.message != null && String(body.message).trim()) ? String(body.message).trim() : '—';
  const messageCapped = message.length > 2000 ? message.slice(0, 1997) + '...' : message;
  return `
    <p><strong>New quote request</strong> (from ${escapeHtml(fromPage)})</p>
    <table style="border-collapse: collapse; max-width: 480px;">
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Name</td><td style="padding: 6px 0;">${escapeHtml(fullName)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Email</td><td style="padding: 6px 0;">${escapeHtml(body.email)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Phone</td><td style="padding: 6px 0;">${escapeHtml(body.phone)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">City</td><td style="padding: 6px 0;">${escapeHtml(body.city)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Timeline</td><td style="padding: 6px 0;">${escapeHtml(body.timeline)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Services</td><td style="padding: 6px 0;">${escapeHtml(body.services)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Message</td><td style="padding: 6px 0;">${escapeHtml(messageCapped)}</td></tr>
    </table>
  `.trim();
}

/** Normalize req.body: Vercel parses urlencoded to object; fallback if string or missing. */
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT != null ? parseInt(process.env.SMTP_PORT, 10) : 465; // 465 = SSL (recommended for cPanel)
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error('SMTP not configured: need SMTP_HOST, SMTP_USER, SMTP_PASS');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const body = normalizeBody(req.body);

  // Honeypot: if bot filled "Leave this empty", treat as success but do not send email
  const botValue = body['bot-field'];
  if (botValue != null && String(botValue).trim() !== '') {
    return res.redirect(302, '/contact/?submitted=1');
  }

  // Require at least name and one contact method so we don't send empty or junk emails
  const fullName = (body.full_name != null && String(body.full_name).trim()) ? String(body.full_name).trim() : '';
  const email = (body.email != null && String(body.email).trim()) ? String(body.email).trim() : '';
  const phone = (body.phone != null && String(body.phone).trim()) ? String(body.phone).trim() : '';
  if (!fullName || (!email && !phone)) {
    return res.status(400).json({ error: 'Please provide your name and either email or phone.' });
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const namePart = fullName || 'Customer';
  const subject = `Quote request from ${namePart}`;
  const html = buildEmailBody(body);
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
