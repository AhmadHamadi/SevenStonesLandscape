/**
 * Resend diagnostics and explicitly opt-in test sends.
 *
 * Read-only:
 *   node scripts/resend-test.mjs domains
 *   node scripts/resend-test.mjs status <email-id>
 *
 * Real sends require --send and RESEND_API_KEY, RESEND_TEST_TO (a controlled inbox),
 * and RESEND_TEST_FROM (a verified sender). The script never reads project key files.
 * It reuses the handler's subject/body builders, but does not exercise the live form.
 */

import crypto from 'node:crypto';
import { buildSubject, buildEmailBody, buildTextBody } from '../api/quote.js';

// This script can send real email. It never reads a key from a project file.
const TEST_TO = process.env.RESEND_TEST_TO;
const FROM = process.env.RESEND_TEST_FROM;

function apiKey() {
  if (!process.env.RESEND_API_KEY) throw new Error('Set RESEND_API_KEY in the environment.');
  return process.env.RESEND_API_KEY;
}

async function resend(path, options = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
  return json;
}

// Mirrors the mailOptions block in api/quote.js exactly: same subject, same
// html, same text, same Reply-To, same anti-threading headers.
async function sendLead(body) {
  const fullName = String(body.full_name || '').trim();
  const payload = {
    from: FROM,
    to: [TEST_TO],
    subject: buildSubject(body, fullName),
    text: buildTextBody(body),
    html: buildEmailBody(body),
    headers: {
      'X-Entity-Ref-ID': crypto.randomUUID(),
      'Auto-Submitted': 'auto-generated',
    },
  };
  if (body.email) payload.reply_to = body.email;

  const out = await resend('/emails', { method: 'POST', body: JSON.stringify(payload) });
  console.log(`  sent  ${out.id}  ${payload.subject}`);
  return out.id;
}

const SAMPLE = {
  full_name: 'QA Test Lead',
  email: 'qa@example.invalid',
  phone: '+1 202-555-0100',
  city: 'Example City',
  project_type: 'Test project',
  services: 'Test service',
  message: 'Synthetic Resend template check; not a customer enquiry.',
  form_source: 'hero',
};

// One per branch of buildSubject(), so every subject line the live site can
// produce gets eyeballed in the inbox.
const VARIANTS = [
  { form_source: 'hero',                                    label: 'Homepage hero' },
  { form_source: 'contact',                                 label: 'Contact page' },
  { form_source: 'ads-concrete-landing',                    label: 'Google Ads concrete LP' },
  { form_source: 'ads-interlock-landing',                   label: 'Google Ads interlock LP' },
  { form_source: 'service-hero-services-retaining-walls',   label: 'Service page' },
  { form_source: 'burlington',                              label: 'City page (no tag)' },
  { form_source: 'full',                                    label: 'Full form (no tag)' },
];

const [mode, ...args] = process.argv.slice(2);
const sendApproved = args.includes('--send');
const arg = args.find((value) => value !== '--send');
const sendModes = new Set(['ping', 'quote', 'all']);

if (sendModes.has(mode)) {
  if (!sendApproved) throw new Error(`Refusing to send: ${mode} requires the explicit --send flag.`);
  if (!TEST_TO || !FROM) throw new Error('Set RESEND_TEST_TO and RESEND_TEST_FROM to a controlled test inbox and verified sender.');
}

if (mode === 'domains') {
  const d = await resend('/domains');
  for (const dom of d.data) {
    console.log(`${dom.status.padEnd(10)} ${dom.name}  sending=${dom.capabilities?.sending}`);
  }
} else if (mode === 'ping') {
  const out = await resend('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from: FROM,
      to: [TEST_TO],
      subject: 'Resend connectivity probe',
      text: 'Plain probe. If this is in the inbox, Resend delivery is healthy.',
      html: '<p>Plain probe. If this is in the inbox, Resend delivery is healthy.</p>',
    }),
  });
  console.log('sent', out.id);
} else if (mode === 'quote') {
  await sendLead(SAMPLE);
} else if (mode === 'all') {
  // Optional substring filter: `all service` re-sends just the service-page variant.
  const picked = arg ? VARIANTS.filter((v) => v.form_source.includes(arg)) : VARIANTS;
  for (const v of picked) {
    console.log(`${v.label}:`);
    await sendLead({ ...SAMPLE, form_source: v.form_source });
    await new Promise((r) => setTimeout(r, 600)); // Resend allows 10 req/s; this is just to keep inbox ordering readable
  }
} else if (mode === 'status') {
  if (!arg) throw new Error('Provide the Resend email ID to inspect.');
  const e = await resend(`/emails/${arg}`);
  console.log(`${e.last_event.padEnd(12)} ${e.subject}  -> ${e.to.join(', ')}`);
} else {
  console.log('usage: node scripts/resend-test.mjs domains|status <id>|ping --send|quote --send|all [filter] --send');
  console.log('For send modes, set RESEND_API_KEY, RESEND_TEST_TO, and RESEND_TEST_FROM.');
}
