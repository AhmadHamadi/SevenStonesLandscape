/**
 * Offline test for the contract creator and signing system.
 *
 *   node scripts/test-contract.js
 *
 * Stubs global fetch and nodemailer, so nothing is sent and no key is needed.
 * Exercises the money arithmetic, the link codec, the clause builder, and the
 * /api/sign handler end to end including its failure paths.
 */

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

/* ------------------------------------------------------------------
   Harness
   ------------------------------------------------------------------ */
let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    const r = fn();
    if (r instanceof Promise) {
      return r.then(
        () => { passed++; },
        (err) => { failures.push([name, err]); }
      );
    }
    passed++;
  } catch (err) {
    failures.push([name, err]);
  }
  return Promise.resolve();
}

/* ------------------------------------------------------------------
   Stubs, installed before any module that might touch them
   ------------------------------------------------------------------ */
const sent = [];
globalThis.fetch = async (url, opts = {}) => {
  sent.push({ url: String(url), body: JSON.parse(opts.body || '{}') });
  return {
    ok: true, status: 200,
    json: async () => ({ id: 'stub-email-id' }),
    text: async () => ''
  };
};

/* A minimal res object shaped like the one Vercel hands a function. */
function mockRes() {
  const res = {
    statusCode: null, payload: null, headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    json(o) { this.payload = o; return this; },
    end() { return this; }
  };
  return res;
}

const mockReq = (body, headers = {}) => ({
  method: 'POST',
  headers: { 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250) + 1}`, ...headers },
  body,
  socket: { remoteAddress: '10.0.0.1' }
});

/* ------------------------------------------------------------------ */
const model = await import(pathToFileURL('./tools/contract/contract-model.js').href);
const {
  DEFAULTS, SERVICE_LIBRARY, PAYMENT_PLANS, AGENCY,
  money, amount, longDate, todayISO, slugify,
  priceBreakdown, encodeContract, decodeContract, packContract, unpackContract,
  signingUrl, referenceFor, buildClauses, contractGaps, coveringEmail, selectedServices,
  COOLING_OFF_DAYS, ESTIMATE_OVERRUN_CAP
} = model;

const sample = {
  ...DEFAULTS,
  clientName: 'Jane & Mark Whitfield',
  clientContact: 'Jane Whitfield',
  clientEmail: 'jane@example.com',
  clientPhone: '905-555-0134',
  siteAddress: '18 Ridgemount Ave, Hamilton, ON',
  agreementDate: '2026-09-07',
  startDate: '2026-09-22',
  completeDate: '2026-10-10',
  projectPrice: '28500',
  services: ['interlock', 'steps'],
  scope: '450 sq ft rear patio\n8 inch granular A base',
  exclusions: 'Deck removal\nPermit fees'
};

/* ==================================================================
   MONEY
   ================================================================== */
await test('money formats CAD and keeps a deliberate zero', () => {
  assert.equal(money(28500, 'CAD'), '$28,500.00'.replace('.00', ''));
  assert.equal(money(0, 'CAD'), '$0');
  assert.equal(money('1234.5', 'CAD'), '$1,234.50');
});

await test('money rejects junk rather than printing $0', () => {
  assert.equal(money('', 'CAD'), null);
  assert.equal(money('abc', 'CAD'), null);
  assert.equal(money(null, 'CAD'), null);
  assert.equal(money(undefined, 'CAD'), null);
  assert.equal(money(-5, 'CAD'), null);
  assert.equal(money('-5000', 'CAD'), null);
  assert.equal(amount('-5000'), null);
  assert.equal(priceBreakdown({ ...DEFAULTS, projectPrice: '-5000' }), null);
});

await test('money strips currency symbols a user pasted in', () => {
  assert.equal(money('$28,500', 'CAD'), '$28,500');
});

await test('amount parses and rejects the same way', () => {
  assert.equal(amount('$28,500'), 28500);
  assert.equal(amount('abc'), null);
  assert.equal(amount(''), null);
});

/* ==================================================================
   PRICE BREAKDOWN — the arithmetic a customer will check
   ================================================================== */
await test('breakdown computes tax, total, deposit', () => {
  const p = priceBreakdown(sample);
  assert.equal(p.base, 28500);
  assert.equal(p.tax, 3705);              // 13%
  assert.equal(p.total, 32205);
  assert.equal(p.deposit, 3220.5);        // 10%
  assert.equal(p.balance, 28984.5);
});

await test('instalments always re-add to the balance exactly', () => {
  for (const plan of PAYMENT_PLANS.map((p) => p.id)) {
    for (const price of ['28500', '10000', '33333.33', '0.03', '7', '19999.99']) {
      for (const dep of [0, 10, 33, 50, 100]) {
        const p = priceBreakdown({ ...sample, projectPrice: price, paymentPlan: plan, depositPercent: dep });
        const sum = p.instalments.reduce((a, i) => a + i.value, 0);
        assert.ok(
          Math.abs(sum - p.balance) < 0.005,
          `${plan} @ ${price} dep ${dep}%: instalments ${sum} vs balance ${p.balance}`
        );
        assert.ok(
          Math.abs(p.deposit + sum - p.total) < 0.005,
          `${plan} @ ${price} dep ${dep}%: deposit+instalments != total`
        );
      }
    }
  }
});

await test('breakdown returns null with no price, so nothing prints $0', () => {
  assert.equal(priceBreakdown({ ...sample, projectPrice: '' }), null);
  assert.equal(priceBreakdown({ ...sample, projectPrice: 'tbd' }), null);
});

await test('zero deposit produces no deposit line but still balances', () => {
  const p = priceBreakdown({ ...sample, depositPercent: 0 });
  assert.equal(p.deposit, 0);
  assert.equal(p.balance, p.total);
});

await test('overrun cap is the total plus ten percent', () => {
  const p = priceBreakdown(sample);
  assert.equal(p.cap, Math.round(p.total * 1.1 * 100) / 100);
  assert.equal(ESTIMATE_OVERRUN_CAP, 10);
});

/* ==================================================================
   LINK CODEC
   ================================================================== */
await test('codec round-trips every field', () => {
  const back = decodeContract(encodeContract(sample));
  for (const k of Object.keys(sample)) {
    if (k === 'signatureData') continue;
    assert.deepEqual(back[k], sample[k], `field ${k} did not survive`);
  }
});

await test('codec survives accents, ampersands, quotes, newlines, emoji', () => {
  const tricky = {
    ...sample,
    clientName: 'Ünïcode & Sons "Ltd" <script>',
    scope: 'line one\nline two\ttabbed\nrésumé café 🚧',
    exclusions: "don't remove the 100% \\ backslash"
  };
  const back = decodeContract(encodeContract(tricky));
  assert.equal(back.clientName, tricky.clientName);
  assert.equal(back.scope, tricky.scope);
  assert.equal(back.exclusions, tricky.exclusions);
});

await test('codec handles a very long scope without corrupting it', () => {
  const long = { ...sample, scope: 'A detailed line of scope text.\n'.repeat(400) };
  assert.equal(decodeContract(encodeContract(long)).scope, long.scope);
});

await test('token is url-safe: no +, /, or = to be mangled in a mail client', () => {
  assert.match(encodeContract(sample), /^[A-Za-z0-9\-_]+$/);
});

await test('empty values are dropped from the token then rebuilt from defaults', () => {
  const packed = packContract({ ...DEFAULTS, clientName: 'X' });
  assert.equal(packed.sc, undefined, 'empty scope should not be packed');
  assert.equal(unpackContract(packed).scope, '');
  assert.equal(unpackContract(packed).clientTitle, DEFAULTS.clientTitle);
});

await test('a tampered numeric falls back rather than silently changing the money', () => {
  const d = unpackContract({ ...packContract(sample), tr: 'evil', dp: 999, wy: -4 });
  assert.equal(d.taxRate, DEFAULTS.taxRate);
  assert.equal(d.depositPercent, DEFAULTS.depositPercent);
  assert.equal(d.warrantyYears, DEFAULTS.warrantyYears);
});

await test('an unknown payment plan falls back instead of dropping instalments', () => {
  const d = unpackContract({ ...packContract(sample), pl: 'freebie' });
  assert.equal(d.paymentPlan, DEFAULTS.paymentPlan);
  assert.ok(priceBreakdown(d).instalments.length > 0);
});

await test('malformed tokens throw rather than half-decoding', () => {
  assert.throws(() => decodeContract('not-base64!!'));
  assert.throws(() => decodeContract(Buffer.from('[1,2,3]').toString('base64url')));
  assert.throws(() => decodeContract(Buffer.from('"a string"').toString('base64url')));
});

await test('the drawn signature is never encoded into the link', () => {
  const withSig = { ...sample, signatureData: 'data:image/png;base64,AAAA' };
  assert.equal(JSON.stringify(packContract(withSig)).includes('AAAA'), false);
  assert.equal(decodeContract(encodeContract(withSig)).signatureData, '');
});

/* ==================================================================
   SIGNING URL
   ================================================================== */
await test('signing url is on the canonical host with a trailing slash', () => {
  const url = signingUrl(sample);
  assert.ok(url.startsWith('https://www.sevenstoneslandscape.ca/sign/'), url);
  assert.match(url, /\/sign\/[a-z0-9-]+\/\?a=[A-Za-z0-9\-_]+$/);
});

await test('signing url survives a name that slugifies to nothing', () => {
  assert.match(signingUrl({ ...sample, clientName: '!!!' }), /\/sign\/agreement\/\?a=/);
});

await test('a url built from the creator decodes back on the sign page', () => {
  const url = signingUrl(sample);
  const token = new URL(url).searchParams.get('a');
  assert.equal(decodeContract(token).clientName, sample.clientName);
});

await test('reference is stable and filename-safe', () => {
  assert.equal(referenceFor(sample), referenceFor(sample));
  assert.match(referenceFor(sample), /^SSL-[A-Z0-9]*-\d{6}$/);
});

/* ==================================================================
   CLAUSES
   ================================================================== */
await test('clauses are numbered from one with no gaps', () => {
  const c = buildClauses(sample);
  c.forEach((clause, i) => assert.equal(clause.n, i + 1));
});

await test('dropping the warranty renumbers the rest and breaks nothing', () => {
  const withW = buildClauses(sample);
  const without = buildClauses({ ...sample, warrantyYears: 0 });
  assert.equal(without.length, withW.length - 1);
  without.forEach((clause, i) => assert.equal(clause.n, i + 1));
  assert.ok(!without.some((c) => /Workmanship Warranty/.test(c.title)));
  assert.ok(without.some((c) => c.title === 'Your Right to Cancel'));
});

await test('the cancellation clause is always present and states 10 days', () => {
  for (const variant of [sample, { ...sample, warrantyYears: 0 }, DEFAULTS]) {
    const c = buildClauses(variant);
    const cancel = c.find((x) => x.title === 'Your Right to Cancel');
    assert.ok(cancel, 'cancellation clause missing');
    assert.ok(cancel.paras.join(' ').includes(`${COOLING_OFF_DAYS} days`));
  }
});

await test('the price clause states the 10 percent statutory cap', () => {
  const price = buildClauses(sample).find((c) => c.title === 'Price and Payment');
  assert.ok(price.paras.join(' ').includes('Consumer Protection Act'));
  assert.ok(price.paras.join(' ').includes('$35,425.50'));  // 32205 * 1.1
});

await test('an empty contract still builds every clause without throwing', () => {
  const c = buildClauses(DEFAULTS);
  assert.ok(c.length >= 9);
  for (const clause of c) {
    assert.ok(clause.title);
    assert.ok(Array.isArray(clause.paras) && clause.paras.length);
    for (const p of clause.paras) assert.equal(typeof p, 'string');
  }
});

await test('scope and exclusions become bullet lines under The Work', () => {
  const work = buildClauses(sample).find((c) => c.title === 'The Work');
  const joined = work.paras.join('\n');
  assert.ok(joined.includes('- 450 sq ft rear patio'));
  assert.ok(joined.includes('- Deck removal'));
  assert.ok(joined.includes('Not included'));
});

await test('custom services appear alongside library ones', () => {
  const d = { ...sample, customServices: ['Fountain reinstall', '  ', ''] };
  const picked = selectedServices(d).map((s) => s.label);
  assert.ok(picked.includes('Fountain reinstall'));
  assert.equal(picked.filter((l) => !l.trim()).length, 0, 'blank custom lines must be dropped');
});

await test('service order follows the library, not click order', () => {
  const a = selectedServices({ ...sample, services: ['steps', 'interlock'] }).map((s) => s.id);
  const b = selectedServices({ ...sample, services: ['interlock', 'steps'] }).map((s) => s.id);
  assert.deepEqual(a, b);
});

await test('every library service id is unique', () => {
  const ids = SERVICE_LIBRARY.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

/* ==================================================================
   GAPS + EMAIL
   ================================================================== */
await test('a complete contract reports no gaps', () => {
  assert.deepEqual(contractGaps(sample), []);
});

await test('gaps name the CPA-required dates', () => {
  const g = contractGaps({ ...sample, startDate: '', completeDate: '' });
  assert.ok(g.some((x) => /Start date/i.test(x)));
  assert.ok(g.some((x) => /Completion date/i.test(x)));
});

await test('gaps catch a missing price, email, name and address', () => {
  const g = contractGaps(DEFAULTS);
  for (const want of ['Customer name', 'Customer email', 'Property address', 'Price for the work']) {
    assert.ok(g.some((x) => x.includes(want)), `expected a gap for ${want}, got ${g.join(' | ')}`);
  }
});

await test('covering email carries the link, the money, and the cancellation note', () => {
  const url = signingUrl(sample);
  const { subject, body } = coveringEmail(sample, url);
  assert.ok(subject.includes('Jane & Mark Whitfield'));
  assert.ok(body.includes(url));
  assert.ok(body.includes('$32,205'));
  assert.ok(body.includes(`${COOLING_OFF_DAYS} days`));
  assert.ok(body.includes('Jane'), 'should greet by first name');
  assert.ok(body.includes(AGENCY.phone));
});

await test('covering email degrades gracefully on an empty contract', () => {
  const { body } = coveringEmail(DEFAULTS, 'https://example.com');
  assert.ok(body.includes('Hi there,'));
  assert.ok(!body.includes('undefined'));
  assert.ok(!body.includes('null'));
});

/* ==================================================================
   DATES
   ================================================================== */
await test('longDate does not shift a day across a timezone', () => {
  assert.equal(longDate('2026-01-01'), 'January 1, 2026');
  assert.equal(longDate('2026-12-31'), 'December 31, 2026');
});

await test('longDate rejects junk', () => {
  for (const bad of ['', null, undefined, 'nonsense', '2026-13']) assert.equal(longDate(bad), null);
});

await test('todayISO is a valid yyyy-mm-dd', () => {
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(longDate(todayISO()));
});

await test('slugify produces url-safe output and never empties', () => {
  assert.equal(slugify('Jane & Mark Whitfield'), 'jane-mark-whitfield');
  assert.equal(slugify('!!!'), 'agreement');
  assert.match(slugify('Ünïcode Ltd'), /^[a-z0-9-]+$/);
});

/* ==================================================================
   /api/sign HANDLER
   ================================================================== */
process.env.RESEND_API_KEY = 'test-key-not-real';
const signApi = await import(pathToFileURL('./api/sign.js').href);
const handler = signApi.default;

const goodToken = encodeContract(sample);
const goodSig = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
const goodBody = () => ({
  token: goodToken, signature: goodSig, typedName: 'Jane Whitfield',
  signedAt: '2026-09-07', reference: referenceFor(sample)
});

await test('a valid signature sends and reports resend', async () => {
  sent.length = 0;
  const res = mockRes();
  await handler(mockReq(goodBody()), res);
  assert.equal(res.statusCode, 200, JSON.stringify(res.payload));
  assert.equal(res.payload.ok, true);
  assert.equal(res.payload.via, 'resend');
  assert.equal(sent.length, 1);
});

await test('it emails the office and the customer', async () => {
  sent.length = 0;
  await handler(mockReq(goodBody()), mockRes());
  const to = sent[0].body.to;
  assert.ok(to.includes(AGENCY.email), 'office not on the email');
  assert.ok(to.includes('jane@example.com'), 'customer not on the email');
  assert.equal(to.length, 2);
});

await test('a customer with no email still sends to the office alone', async () => {
  sent.length = 0;
  const token = encodeContract({ ...sample, clientEmail: '' });
  await handler(mockReq({ ...goodBody(), token }), mockRes());
  assert.deepEqual(sent[0].body.to, [AGENCY.email]);
});

await test('an invalid customer email is not used as a recipient', async () => {
  sent.length = 0;
  const token = encodeContract({ ...sample, clientEmail: 'not an email' });
  await handler(mockReq({ ...goodBody(), token }), mockRes());
  assert.deepEqual(sent[0].body.to, [AGENCY.email]);
});

await test('a customer address equal to the office is not emailed twice', async () => {
  sent.length = 0;
  const token = encodeContract({ ...sample, clientEmail: AGENCY.email.toUpperCase() });
  await handler(mockReq({ ...goodBody(), token }), mockRes());
  assert.deepEqual(sent[0].body.to, [AGENCY.email], 'duplicate recipient');
});

await test('reply-to is the Seven Stones office, not the unverified sender', async () => {
  sent.length = 0;
  await handler(mockReq(goodBody()), mockRes());
  assert.equal(sent[0].body.reply_to, AGENCY.email);
});

await test('the PDF is attached when the browser supplied one', async () => {
  sent.length = 0;
  const pdfBase64 = Buffer.from('%PDF-1.4 stub').toString('base64');
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), pdfBase64, pdfFilename: 'Agreement.pdf' }), res);
  assert.equal(res.payload.pdf, true);
  const names = sent[0].body.attachments.map((a) => a.filename);
  assert.ok(names.includes('Agreement.pdf'), names.join(','));
  assert.equal(sent[0].body.attachments.length, 2, 'PDF plus signature image');
});

await test('signing still succeeds when the browser could not build a PDF', async () => {
  sent.length = 0;
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), pdfBase64: '' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.pdf, false);
  assert.equal(sent[0].body.attachments.length, 1, 'signature image only');
});

await test('a filename with path characters is sanitised', async () => {
  sent.length = 0;
  const pdfBase64 = Buffer.from('%PDF').toString('base64');
  await handler(mockReq({ ...goodBody(), pdfBase64, pdfFilename: '../../etc/passwd' }), mockRes());
  const name = sent[0].body.attachments[0].filename;
  assert.ok(!name.includes('/') && !name.includes('\\'), name);
  assert.ok(name.toLowerCase().endsWith('.pdf'), name);
});

await test('a non-base64 pdf payload is refused rather than attached', async () => {
  sent.length = 0;
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), pdfBase64: '<script>alert(1)</script>' }), res);
  assert.equal(res.payload.pdf, false);
  assert.equal(sent[0].body.attachments.length, 1);
});

await test('a missing token is refused', async () => {
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), token: '' }), res);
  assert.equal(res.statusCode, 400);
});

await test('an unreadable token is refused with a human message', async () => {
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), token: 'garbage!!!' }), res);
  assert.equal(res.statusCode, 400);
  assert.match(res.payload.error, /resend it/i);
});

await test('a short name is refused', async () => {
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), typedName: 'J' }), res);
  assert.equal(res.statusCode, 400);
});

await test('a missing or non-png signature is refused', async () => {
  for (const sig of ['', 'data:image/jpeg;base64,AAA', 'javascript:alert(1)']) {
    const res = mockRes();
    await handler(mockReq({ ...goodBody(), signature: sig }), res);
    assert.equal(res.statusCode, 400, `accepted ${sig}`);
  }
});

await test('an oversized signature is refused', async () => {
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), signature: `data:image/png;base64,${'A'.repeat(400_001)}` }), res);
  assert.equal(res.statusCode, 413);
});



await test('GET is rejected with Allow: POST', async () => {
  const res = mockRes();
  await handler({ ...mockReq({}), method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
});

await test('OPTIONS preflight returns 204 with CORS headers', async () => {
  const res = mockRes();
  await handler({ ...mockReq({}), method: 'OPTIONS' }, res);
  assert.equal(res.statusCode, 204);
  assert.ok(res.headers['access-control-allow-origin']);
});

await test('responses are marked no-store', async () => {
  const res = mockRes();
  await handler(mockReq(goodBody()), res);
  assert.match(res.headers['cache-control'], /no-store/);
});

await test('a JSON string body is parsed like Vercel would', async () => {
  const res = mockRes();
  await handler(mockReq(JSON.stringify(goodBody())), res);
  assert.equal(res.statusCode, 200);
});

await test('rate limiting kicks in on the seventh attempt from one ip', async () => {
  const ip = '203.0.113.99';
  let last;
  for (let i = 0; i < 8; i++) {
    last = mockRes();
    await handler(mockReq(goodBody(), { 'x-forwarded-for': ip }), last);
  }
  assert.equal(last.statusCode, 429);
  assert.match(last.payload.error, /call/i);
});

await test('with no transport configured it fails loudly rather than silently', async () => {
  const key = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  const res = mockRes();
  await handler(mockReq(goodBody()), res);
  assert.equal(res.statusCode, 500);
  assert.match(res.payload.error, /not configured/i);
  process.env.RESEND_API_KEY = key;
});

await test('a Resend failure with no SMTP fallback returns 502, not a false success', async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 422, text: async () => 'domain not verified', json: async () => ({}) });
  const res = mockRes();
  await handler(mockReq(goodBody()), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.payload.error, /could not email/i);
  globalThis.fetch = real;
});

await test('the signed email carries the deliverability headers quote.js proved out', async () => {
  sent.length = 0;
  await handler(mockReq(goodBody()), mockRes());
  const h = sent[0].body.headers || {};
  assert.ok(h['X-Entity-Ref-ID'], 'no X-Entity-Ref-ID: Gmail will thread agreements together');
  assert.equal(h['Auto-Submitted'], 'auto-generated');
});

await test('each send carries a distinct threading reference', async () => {
  sent.length = 0;
  await handler(mockReq(goodBody()), mockRes());
  await handler(mockReq(goodBody()), mockRes());
  assert.notEqual(sent[0].body.headers['X-Entity-Ref-ID'], sent[1].body.headers['X-Entity-Ref-ID']);
});

await test('an oversized pdf is refused below Vercel own body limit', async () => {
  const res = mockRes();
  await handler(mockReq({ ...goodBody(), pdfBase64: 'A'.repeat(3_000_001) }), res);
  assert.equal(res.statusCode, 413);
});

/* ==================================================================
   SIGNED EMAIL CONTENT
   ================================================================== */
await test('the signed email states the cancellation right in both parts', () => {
  const { subject, html, text } = signApi.buildSignedEmail({
    d: sample, typedName: 'Jane Whitfield', signedAtLong: 'September 7, 2026',
    reference: 'SSL-TEST-260907', signatureCid: 'cid1', hasPdf: true
  });
  assert.ok(subject.includes('Jane & Mark Whitfield'));
  assert.ok(html.includes('Consumer Protection Act'));
  assert.ok(text.includes('YOUR RIGHT TO CANCEL'));
  assert.ok(html.includes('cid:cid1'), 'signature must be embedded inline');
  assert.ok(html.includes('attached to this email as a PDF'), 'does not say the PDF is attached');
});

await test('with the PDF attached the email is short and does not repeat the clauses', () => {
  const { html, text } = signApi.buildSignedEmail({
    d: sample, typedName: 'Jane Whitfield', signedAtLong: 'September 7, 2026',
    reference: 'SSL-TEST-260907', signatureCid: 'c', hasPdf: true
  });
  assert.equal((html.match(/<h2/g) || []).length, 0, 'clauses repeated despite the PDF');
  assert.ok(html.length < 9000, `html is ${html.length} bytes, still a wall of text`);
  assert.ok(text.split(String.fromCharCode(10)).length < 40, 'plain text is still a wall of text');
  assert.ok(/attached to this email as a PDF/.test(html), 'does not say where the agreement is');
});

await test('without a PDF the full agreement is still in the email', () => {
  const { html, text } = signApi.buildSignedEmail({
    d: sample, typedName: 'Jane Whitfield', signedAtLong: 'x',
    reference: 'r', signatureCid: 'c', hasPdf: false
  });
  for (const c of buildClauses(sample)) {
    assert.ok(html.includes(c.title), `fallback email missing clause: ${c.title}`);
    assert.ok(text.includes(c.title.toUpperCase()), `fallback text missing: ${c.title}`);
  }
});

await test('the short email still carries the money, dates and cancellation right', () => {
  const { html, text } = signApi.buildSignedEmail({
    d: sample, typedName: 'Jane Whitfield', signedAtLong: 'September 7, 2026',
    reference: 'SSL-TEST-260907', signatureCid: 'c', hasPdf: true
  });
  assert.ok(html.includes('$32,205'), 'total missing');
  assert.ok(html.includes('September 22, 2026'), 'start date missing');
  assert.ok(html.includes('Consumer Protection Act'), 'cancellation right missing');
  assert.ok(html.includes(`cid:c`), 'signature not embedded');
  assert.ok(text.includes('YOUR RIGHT TO CANCEL'), 'text lacks the cancellation right');
  assert.ok(text.includes('Jane Whitfield'), 'text lacks the signer');
});

await test('the signed email escapes html a customer typed', () => {
  const nasty = { ...sample, clientName: '<img src=x onerror=alert(1)>' };
  const { html } = signApi.buildSignedEmail({
    d: nasty, typedName: '<script>alert(2)</script>', signedAtLong: 'x',
    reference: 'r', signatureCid: 'c', hasPdf: false
  });
  assert.ok(!html.includes('<img src=x'), 'client name was not escaped');
  assert.ok(!html.includes('<script>alert(2)'), 'typed name was not escaped');
  assert.ok(html.includes('&lt;script&gt;'));
});

await test('the signed email carries every clause the page showed', () => {
  const { html, text } = signApi.buildSignedEmail({
    d: sample, typedName: 'J W', signedAtLong: 'x', reference: 'r', signatureCid: 'c', hasPdf: false
  });
  for (const clause of buildClauses(sample)) {
    assert.ok(html.includes(clause.title), `html missing clause: ${clause.title}`);
    assert.ok(text.includes(clause.title.toUpperCase()), `text missing clause: ${clause.title}`);
  }
});

await test('bold markers are rendered, never leaked as asterisks', () => {
  const { html, text } = signApi.buildSignedEmail({
    d: sample, typedName: 'J W', signedAtLong: 'x', reference: 'r', signatureCid: 'c', hasPdf: false
  });
  assert.ok(!html.includes('**'), 'raw ** left in the html');
  assert.ok(!text.includes('**'), 'raw ** left in the text');
  assert.ok(html.includes('<strong>'));
});

/* ==================================================================
   ARCHIVE
   ================================================================== */
const archive = await import(pathToFileURL('./api/_archive.js').href);

await test('archive reports itself unconfigured without a blob token', async () => {
  const t = process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  assert.equal(archive.archiveConfigured(), false);
  assert.equal(await archive.archiveSignedContract({ reference: 'r', d: sample }), false);
  assert.deepEqual(await archive.listSignedContracts(), { configured: false, records: [] });
  if (t) process.env.BLOB_READ_WRITE_TOKEN = t;
});

await test('signing succeeds even though nothing is archived', async () => {
  const res = mockRes();
  await handler(mockReq(goodBody()), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.archived, false);
});

const signedApi = await import(pathToFileURL('./api/signed.js').href);

await test('the archive endpoint refuses to open without a passphrase set', async () => {
  const t = process.env.CONTRACT_ARCHIVE_TOKEN;
  delete process.env.CONTRACT_ARCHIVE_TOKEN;
  const res = mockRes();
  await signedApi.default({ method: 'GET', headers: {}, query: {} }, res);
  assert.equal(res.statusCode, 503);
  if (t) process.env.CONTRACT_ARCHIVE_TOKEN = t;
});

await test('the archive endpoint rejects a wrong passphrase', async () => {
  process.env.CONTRACT_ARCHIVE_TOKEN = 'correct-horse';
  const res = mockRes();
  await signedApi.default({ method: 'GET', headers: { 'x-archive-token': 'wrong' }, query: {} }, res);
  assert.equal(res.statusCode, 401);
});

await test('a wrong-length passphrase is rejected without throwing', async () => {
  process.env.CONTRACT_ARCHIVE_TOKEN = 'correct-horse';
  const res = mockRes();
  await signedApi.default({ method: 'GET', headers: { 'x-archive-token': 'x' }, query: {} }, res);
  assert.equal(res.statusCode, 401);
});

await test('the right passphrase gets through and reports the store state', async () => {
  process.env.CONTRACT_ARCHIVE_TOKEN = 'correct-horse';
  delete process.env.BLOB_READ_WRITE_TOKEN;
  const res = mockRes();
  await signedApi.default({ method: 'GET', headers: { 'x-archive-token': 'correct-horse' }, query: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.configured, false);
  assert.ok(res.payload.setup, 'should explain how to switch it on');
});

await test('the archive endpoint is marked noindex', async () => {
  process.env.CONTRACT_ARCHIVE_TOKEN = 'correct-horse';
  const res = mockRes();
  await signedApi.default({ method: 'GET', headers: { 'x-archive-token': 'correct-horse' }, query: {} }, res);
  assert.match(res.headers['x-robots-tag'], /noindex/);
  assert.match(res.headers['cache-control'], /no-store/);
});

/* ==================================================================
   END TO END — the journey the customer actually takes
   ================================================================== */
await test('creator link -> decode -> sign -> both parties emailed', async () => {
  // 1. John fills the creator and it produces a link.
  const url = signingUrl(sample);
  assert.deepEqual(contractGaps(sample), [], 'creator should report it is ready to send');

  // 2. The covering email carries that exact link.
  const { body } = coveringEmail(sample, url);
  assert.ok(body.includes(url));

  // 3. The customer opens it; the sign page decodes the same agreement.
  const token = new URL(url).searchParams.get('a');
  const decoded = decodeContract(token);
  assert.equal(decoded.clientName, sample.clientName);
  assert.equal(decoded.projectPrice, sample.projectPrice);

  // 4. What they read matches what John built, clause for clause.
  assert.deepEqual(
    buildClauses(decoded).map((c) => `${c.n}. ${c.title}`),
    buildClauses(sample).map((c) => `${c.n}. ${c.title}`)
  );
  assert.equal(priceBreakdown(decoded).total, priceBreakdown(sample).total);

  // 5. They sign; the API emails a copy to both parties with the PDF attached.
  sent.length = 0;
  const res = mockRes();
  await handler(mockReq({
    token, signature: goodSig, typedName: 'Jane Whitfield',
    signedAt: '2026-09-07', reference: referenceFor(decoded),
    pdfBase64: Buffer.from('%PDF-1.4 stub').toString('base64'),
    pdfFilename: 'Seven Stones Work Agreement - Jane.pdf'
  }), res);

  assert.equal(res.statusCode, 200, JSON.stringify(res.payload));
  assert.equal(res.payload.pdf, true, 'the PDF should have been attached');
  const mail = sent[0].body;
  assert.ok(mail.to.includes(AGENCY.email), 'office not emailed');
  assert.ok(mail.to.includes(sample.clientEmail), 'customer not emailed');
  assert.equal(mail.attachments.length, 2, 'expected the PDF and the signature image');

  // 6. The email states the same total the customer signed.
  assert.ok(mail.html.includes('$32,205'), 'email total does not match the contract');
  assert.ok(mail.text.includes('Jane Whitfield'), 'signer missing from the plain-text part');
});

await test('the customer and the office receive the identical document', async () => {
  sent.length = 0;
  await handler(mockReq(goodBody()), mockRes());
  // One send, both recipients: nobody gets a different version of what was signed.
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.to.length, 2);
});

/* ------------------------------------------------------------------ */
console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
for (const [name, err] of failures) {
  console.error(`  FAIL  ${name}\n        ${err.message.split('\n')[0]}`);
}
process.exit(failures.length ? 1 : 0);
