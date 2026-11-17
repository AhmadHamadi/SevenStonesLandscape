/**
 * Offline end-to-end check of api/quote.js over EVERY form_source on the site.
 *
 *   node scripts/resend-verify-all.mjs
 *
 * Stubs global.fetch so both the GHL webhook and Resend calls are captured: no
 * webhook is called and no email leaves the machine. Asserts every form source,
 * preserves the original enquiry fields, and checks the GHL-failure fallback.
 */

process.env.RESEND_API_KEY = 'test-key-not-used-offline';
process.env.GHL_INBOUND_WEBHOOK_URL = 'https://ghl.example.invalid/quote-test';

const sent = [];
const ghl = [];
const SMS_CONSENT_TEXT = 'I agree to receive text messages from Seven Stones Landscape about this estimate request and scheduling. Message frequency varies; message and data rates may apply. Reply STOP to opt out, HELP for help. Consent is not required to purchase.';
let failGhl = false;
global.fetch = async (url, opts) => {
  if (String(url) === process.env.GHL_INBOUND_WEBHOOK_URL) {
    ghl.push({ url: String(url), body: JSON.parse(opts.body), headers: opts.headers });
    return failGhl
      ? { ok: false, status: 503, text: async () => 'stub failure' }
      : { ok: true, status: 200, json: async () => ({ accepted: true }) };
  }
  sent.push({ url: String(url), body: JSON.parse(opts.body), headers: opts.headers });
  return { ok: true, status: 200, json: async () => ({ id: 'stub' }) };
};

const { default: handler } = await import('../api/quote.js');

// Every form_source that appears in the HTML, scraped 2026-08-24.
const SOURCES = [
  'hero', 'contact', 'full', 'ads-concrete-landing', 'ads-interlock-landing',
  'ancaster', 'burlington', 'dundas', 'grimsby', 'hamilton', 'milton',
  'mississauga', 'mount-hope', 'oakville', 'stoney-creek', 'waterdown',
  'service-hero-solutions-backyard-drainage',
  'service-hero-services-backyard-landscaping',
  'service-hero-services-benches-and-fire-pits',
  'service-hero-services-concrete',
  'service-hero-services-concrete-driveways',
  'service-hero-services-concrete-exposed-aggregate',
  'service-hero-services-concrete-stamped-patios',
  'service-hero-services-concrete-steps-walkways',
  'service-hero-services-decks-and-pergolas',
  'service-hero-services-fences-and-staining',
  'service-hero-services-front-yard-landscaping',
  'service-hero-services-interlock-patios',
  'service-hero-services-landscape-stone',
  'service-hero-services-pools-and-pool-surrounds',
  'service-hero-services-retaining-walls',
  'service-hero-services-sod-installation',
  'service-hero-services-walkways',
  'service-hero-services-yard-grading',
];

function mockRes() {
  const r = { statusCode: null, payload: null, redirectedTo: null };
  r.setHeader = () => r;
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (p) => { r.payload = p; return r; };
  r.redirect = (c, loc) => { r.statusCode = c; r.redirectedTo = loc; return r; };
  return r;
}

let pass = 0;
const failures = [];

for (const [i, source] of SOURCES.entries()) {
  sent.length = 0;
  ghl.length = 0;
  const submissionId = `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
  const res = mockRes();
  await handler({
    method: 'POST',
    // Unique IP per call: the handler rate-limits at 12 requests per IP per
    // 10 minutes, which would silently drop most of this sweep otherwise.
    headers: { 'x-forwarded-for': `203.0.113.${i + 1}` },
    socket: { remoteAddress: `203.0.113.${i + 1}` },
    body: {
      full_name: 'Daniel Reyes',
      email: 'daniel.reyes.test@gmail.com',
      phone: '905-555-0142',
      address: '22 Example Street, Burlington, ON L7M 1A1',
      submission_id: submissionId,
      city: 'Burlington',
      form_page_path: '/service-areas/burlington/?utm_source=private#section',
      referrer_host: 'https://www.google.com/search?q=private',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring-landscaping',
      utm_content: 'patio-ad',
      utm_term: 'landscaping quote',
      gclid: 'test-click-id',
      services: 'Interlock & Hardscaping',
      timeline: 'Spring 2027',
      message: 'Replacing a cracked asphalt driveway, about 620 sq ft, plus a front walkway.',
      form_source: source,
      sms_consent: i % 2 === 0 ? 'yes' : '',
    },
  }, res);

  const problems = [];
  if (sent.length !== 1) problems.push(`expected 1 email, got ${sent.length}`);
  if (ghl.length !== 1) problems.push(`expected 1 GHL intake call, got ${ghl.length}`);
  const b = sent[0]?.body;
  const g = ghl[0]?.body;
  if (b) {
    if (!b.to?.includes('info@sevenstoneslandscape.ca')) problems.push('missing team recipient');
    if (!b.to?.includes('ahmadhamadi2002@gmail.com')) problems.push('missing personal recipient');
    if (b.reply_to !== 'daniel.reyes.test@gmail.com') problems.push('Reply-To not set to customer');
    if (!b.html?.includes('New quote request')) problems.push('no HTML part');
    if (!b.text?.includes('New quote request')) problems.push('no text part');
    if (!b.text?.includes('Property address: 22 Example Street, Burlington, ON L7M 1A1')) problems.push('email property address was not kept raw');
    if (!b.text?.includes('Form city context: Burlington')) problems.push('email did not label city-page context separately');
    if (b.text?.includes('22 Example Street, Burlington, ON L7M 1A1, Burlington')) problems.push('email appended unverified city context to property address');
    if (!b.headers?.['X-Entity-Ref-ID']) problems.push('no X-Entity-Ref-ID');
    if (!b.subject?.includes('Daniel Reyes')) problems.push('name missing from subject');
    // Resend currently verifies arvenogrowth.com; catch regressions to unverified senders.
    if (!b.from?.includes('@arvenogrowth.com')) problems.push(`unverified From: ${b.from}`);
  }
  if (g) {
    if (g.submissionId !== submissionId) problems.push('GHL submission reference changed');
    if (g.full_name !== 'Daniel Reyes') problems.push('GHL full name missing');
    if (g.email !== 'daniel.reyes.test@gmail.com') problems.push('GHL email missing');
    if (!g.phone?.startsWith('+1')) problems.push('GHL phone not normalized');
    if (g.address !== '22 Example Street, Burlington, ON L7M 1A1') problems.push('GHL address changed');
    if (g.form_city_context !== 'Burlington') problems.push('GHL page-city context missing');
    if (g.form_page_path !== '/service-areas/burlington/') problems.push('GHL form page path missing');
    if (g.referrer_host !== 'www.google.com') problems.push('GHL referrer host missing');
    if (g.utm_source !== 'google' || g.utm_medium !== 'cpc') problems.push('GHL UTM source/medium missing');
    if (g.utm_campaign !== 'spring-landscaping' || g.utm_content !== 'patio-ad') problems.push('GHL UTM campaign/content missing');
    if (g.utm_term !== 'landscaping quote' || g.gclid !== 'test-click-id') problems.push('GHL UTM term/click ID missing');
    if (g.services !== 'Interlock & Hardscaping') problems.push('GHL service missing');
    if (g.message !== 'Replacing a cracked asphalt driveway, about 620 sq ft, plus a front walkway.') problems.push('GHL original message changed');
    if (g.form_source !== source) problems.push('GHL form source changed');
    const consent = i % 2 === 0;
    if (g.sms_consent_this_submission !== consent) problems.push('SMS consent choice missing or incorrect');
    if (consent && g.sms_consent_text !== SMS_CONSENT_TEXT) problems.push('SMS consent wording missing or changed');
    if (consent && g.sms_consent_version !== 'quote-sms-v1-2026-11') problems.push('SMS consent version missing');
    if (consent && (!g.sms_consent_at || Number.isNaN(Date.parse(g.sms_consent_at)))) problems.push('SMS consent timestamp missing');
    if (consent && g.sms_consent_source !== source) problems.push('SMS consent source missing');
    if (!consent && (g.sms_consent_text || g.sms_consent_at || g.sms_consent_version || g.sms_consent_source)) problems.push('unchecked form recorded as SMS consent');
  }
  if (res.statusCode !== 302 && res.statusCode !== 200) problems.push(`status ${res.statusCode}`);

  if (problems.length) {
    failures.push(`${source}: ${problems.join('; ')}`);
    console.log(`FAIL  ${source.padEnd(50)} ${problems.join('; ')}`);
  } else {
    pass += 1;
    console.log(`ok    ${source.padEnd(50)} ${b.subject}`);
  }
}

failGhl = true;
sent.length = 0;
ghl.length = 0;
const fallbackRes = mockRes();
await handler({
  method: 'POST',
  headers: { 'x-forwarded-for': '203.0.113.200' },
  socket: { remoteAddress: '203.0.113.200' },
  body: {
    full_name: 'Daniel Reyes', email: 'daniel.reyes.test@gmail.com', phone: '905-555-0142',
    address: '22 Example Street, Burlington, ON L7M 1A1', submission_id: '00000000-0000-4000-8000-000000000999',
    services: 'Interlock & Hardscaping', message: 'Offline fallback test', form_source: 'contact',
  },
}, fallbackRes);
const fallbackPassed = fallbackRes.statusCode === 503 && sent.length === 1 && ghl.length === 1
  && fallbackRes.payload?.error?.includes('Please contact the team before submitting again');
console.log(`${fallbackPassed ? 'ok' : 'FAIL'}  GHL failure returns 503 after the internal email fallback`);
if (!fallbackPassed) failures.push('GHL failure fallback was not handled safely');

console.log(`\n${pass}/${SOURCES.length} form sources passed`);
if (failures.length) process.exit(1);
