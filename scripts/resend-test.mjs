/**
 * Resend practice/verification harness for the Seven Stones quote form.
 *
 *   node scripts/resend-test.mjs domains        list domains + verification state
 *   node scripts/resend-test.mjs ping           one plain deliverability probe
 *   node scripts/resend-test.mjs quote          one realistic lead, real template
 *   node scripts/resend-test.mjs all [filter]   one email per subject-tag variant
 *   node scripts/resend-test.mjs status <id>    delivery state of a sent email
 *
 * It imports buildSubject/buildEmailBody/buildTextBody straight out of
 * api/quote.js, so what lands in the inbox is byte-identical to what the live
 * SMTP path produces. If the production template changes, this follows it.
 *
 * The API key is read from RESEND-API-KEY.txt at the project root (gitignored).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import crypto from 'node:crypto';
import { buildSubject, buildEmailBody, buildTextBody } from '../api/quote.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Practice sends go here only. Production recipients live in api/quote.js.
const TEST_TO = 'ahmadhamadi2002@gmail.com';

// Must match DEFAULT_RESEND_FROM in api/quote.js so test mail is indistinguishable
// from production mail. tradeleadsmarketing.com is the verified sending domain.
const FROM = 'Seven Stones Landscape <info@tradeleadsmarketing.com>';

function apiKey() {
  const raw = readFileSync(join(ROOT, 'RESEND-API-KEY.txt'), 'utf8');
  const match = raw.match(/\bre_[A-Za-z0-9_]+/);
  if (!match) throw new Error('No re_... key found in RESEND-API-KEY.txt');
  return match[0];
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
  full_name: 'Daniel Reyes',
  email: 'daniel.reyes.test@gmail.com',
  phone: '905-555-0142',
  city: 'Burlington',
  project_type: 'Interlock driveway',
  services: 'Interlock & Hardscaping',
  timeline: 'Spring 2027',
  message: 'Looking to replace a cracked asphalt driveway, roughly 620 sq ft, plus a walkway to the front door. Would like a quote and a rough timeline.',
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

const [mode, arg] = process.argv.slice(2);

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
  const e = await resend(`/emails/${arg}`);
  console.log(`${e.last_event.padEnd(12)} ${e.subject}  -> ${e.to.join(', ')}`);
} else {
  console.log('usage: node scripts/resend-test.mjs domains|ping|quote|all|status <id>');
}
