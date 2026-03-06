/**
 * Vercel serverless function: accept quote form POST and email both addresses via Resend.
 * Environment variables: RESEND_API_KEY (required), EMAIL_FROM (optional).
 * Forms POST application/x-www-form-urlencoded; Vercel parses into req.body.
 */

const RECIPIENTS = [
  'john.scime.mcmaster@gmail.com',
  'ahmadhamadi2002@gmail.com',
];

const DEFAULT_FROM = 'Seven Stones Landscape <onboarding@resend.dev>';

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
  return `
    <p><strong>New quote request</strong> (from ${escapeHtml(fromPage)})</p>
    <table style="border-collapse: collapse; max-width: 480px;">
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Name</td><td style="padding: 6px 0;">${escapeHtml(body.first_name)} ${escapeHtml(body.last_name)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Email</td><td style="padding: 6px 0;">${escapeHtml(body.email)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Phone</td><td style="padding: 6px 0;">${escapeHtml(body.phone)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">City</td><td style="padding: 6px 0;">${escapeHtml(body.city)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Timeline</td><td style="padding: 6px 0;">${escapeHtml(body.timeline)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Services</td><td style="padding: 6px 0;">${escapeHtml(body.services)}</td></tr>
      <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Message</td><td style="padding: 6px 0;">${escapeHtml(body.message)}</td></tr>
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const body = normalizeBody(req.body);
  const botValue = body['bot-field'];
  if (botValue != null && String(botValue).trim() !== '') {
    return res.redirect(302, '/contact.html?submitted=1');
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const namePart = [body.first_name, body.last_name].filter(Boolean).map(String).join(' ').trim();
  const subject = namePart ? `Quote request from ${namePart}` : 'New quote request';
  const html = buildEmailBody(body);
  const replyTo = (body.email && String(body.email).trim()) ? String(body.email).trim() : undefined;

  try {
    const payload = {
      from,
      to: RECIPIENTS,
      subject,
      html,
    };
    if (replyTo) payload.reply_to = replyTo;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend API error:', response.status, err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  return res.redirect(302, '/contact.html?submitted=1');
}
