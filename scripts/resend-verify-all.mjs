/**
 * Offline end-to-end check of api/quote.js over EVERY form_source on the site.
 *
 *   node scripts/resend-verify-all.mjs
 *
 * Stubs global.fetch so the Resend call is captured instead of sent: no email
 * leaves the machine and nobody's inbox is touched. Asserts, per page, that the
 * handler produced the right subject tag, both recipients, a Reply-To, and both
 * an HTML and a text part. Run this after touching the template or the handler.
 */

process.env.RESEND_API_KEY = 'test-key-not-used-offline';

const sent = [];
global.fetch = async (url, opts) => {
  sent.push({ url, body: JSON.parse(opts.body), headers: opts.headers });
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
      city: 'Burlington',
      services: 'Interlock & Hardscaping',
      timeline: 'Spring 2027',
      message: 'Replacing a cracked asphalt driveway, about 620 sq ft, plus a front walkway.',
      form_source: source,
    },
  }, res);

  const problems = [];
  if (sent.length !== 1) problems.push(`expected 1 send, got ${sent.length}`);
  const b = sent[0]?.body;
  if (b) {
    if (!b.to?.includes('info@sevenstoneslandscape.ca')) problems.push('missing team recipient');
    if (!b.to?.includes('ahmadhamadi2002@gmail.com')) problems.push('missing personal recipient');
    if (b.reply_to !== 'daniel.reyes.test@gmail.com') problems.push('Reply-To not set to customer');
    if (!b.html?.includes('New quote request')) problems.push('no HTML part');
    if (!b.text?.includes('New quote request')) problems.push('no text part');
    if (!b.headers?.['X-Entity-Ref-ID']) problems.push('no X-Entity-Ref-ID');
    if (!b.subject?.includes('Daniel Reyes')) problems.push('name missing from subject');
    // The From domain must be one Resend has verified, or the send 400s at the API.
    if (!b.from?.includes('@tradeleadsmarketing.com')) problems.push(`unverified From: ${b.from}`);
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

console.log(`\n${pass}/${SOURCES.length} form sources passed`);
if (failures.length) process.exit(1);
