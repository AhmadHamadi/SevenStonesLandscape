/**
 * Real-browser test of the two office pages: the creator and the archive.
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/test-office-browser.js
 *   node scripts/test-office-browser.js http://localhost:3000
 *
 * Not part of `npm test`, because it needs a browser download. It covers what
 * jsdom cannot: real layout. It was written after a fixed three-column dates row
 * clipped the completion date out of view at desktop widths - a field the
 * Consumer Protection Act requires - which every assertion-based test missed
 * because the value was set correctly, just invisible.
 *
 * It also proves the creator makes no network calls at all, and that the archive
 * refuses to show a customer contract without the passphrase.
 *
 * Nothing is sent: the creator does not call the API, and the archive is read-only.
 */
import { chromium } from 'playwright';

const ORIGIN = process.argv[2] || 'https://www.sevenstoneslandscape.ca';
let passed = 0; const failures = [];
const test = async (n, f) => { try { await f(); passed++; console.log('  ok    ' + n); }
  catch (e) { failures.push([n, e.message]); console.log('  FAIL  ' + n); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log(); console.log('  office pages: ' + ORIGIN); console.log();
const browser = await chromium.launch();

/* ================= CREATOR ================= */
{
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`${ORIGIN}/contract`, { waitUntil: 'networkidle' });

await test('creator loads with no JS errors', () => ok(errors.length === 0, errors.join(' | ')));

await test('the service checkboxes are gone, one description box remains', async () => {
  ok(await page.locator('#services').count() === 0, 'service checkboxes still there');
  ok(await page.locator('#scope').count() === 1, 'no description box');
});

await test('cash is offered as a payment method', async () => {
  const opts = await page.locator('#paymentMethod option').allTextContents();
  ok(opts.includes('Cash'), opts.join(', '));
  ok(opts.length >= 5, 'only ' + opts.length + ' options');
});

await test('deposit presets are offered', async () => {
  ok(await page.locator('#depositPresets option').count() >= 5, 'no deposit presets');
});

await test('an empty form lists what is missing', async () => {
  const g = await page.locator('#gaps').innerText();
  for (const want of ['Customer name', 'Price for the work', 'Description of the work',
                      'Start date', 'Completion date']) {
    ok(g.includes(want), 'gap missing: ' + want + '  (' + g.replace(/\n/g, ' ') + ')');
  }
});

await test('filling the seven required fields reaches Ready to send', async () => {
  await page.fill('#clientName', 'Jane & Mark Whitfield');
  await page.fill('#clientEmail', 'jane@example.com');
  await page.fill('#siteAddress', '18 Ridgemount Ave, Hamilton, ON');
  await page.fill('#startDate', '2026-09-22');
  await page.fill('#completeDate', '2026-10-10');
  await page.fill('#projectPrice', '28500');
  await page.fill('#scope', '450 sq ft rear interlock patio\n8 inch granular A base');
  await page.waitForTimeout(400);
  const g = await page.locator('#gaps').innerText();
  ok(/Ready to send/.test(g), 'still gapped: ' + g.replace(/\n/g, ' '));
});

await test('the totals and the statutory cap are right', async () => {
  const t = await page.locator('#totals').innerText();
  ok(t.includes('$32,205'), 'total wrong: ' + t.replace(/\n/g, ' '));
  ok(t.includes('$3,220.50'), 'deposit wrong');
  ok((await page.locator('#capNote').innerText()).includes('$35,425.50'), 'cap wrong');
});

await test('the live preview shows the finished contract', async () => {
  const s = await page.locator('#doc .sheet').innerText();
  ok(s.includes('450 sq ft rear interlock patio'), 'work missing');
  ok(!/ICPI/i.test(s), 'ICPI present');
  ok(await page.locator('#doc .clause').count() === 3, 'clause count is not 3');
});

await test('the signing link and covering email are produced', async () => {
  const link = await page.inputValue('#signLink');
  ok(link.startsWith(ORIGIN + "/sign/jane-mark-whitfield/?a="), 'bad link: ' + link.slice(0, 70));
  const body = await page.inputValue('#emailBody');
  ok(body.includes(link), 'email body does not carry the same link');
  ok(body.includes('$32,205'), 'email lacks the total');
  ok((await page.inputValue('#emailSubject')).includes('Jane'), 'bad subject');
  ok((await page.locator('#linkLen').innerText()).includes('48 hours'), 'no expiry note');
});

await test('the link the customer would open actually decodes and renders', async () => {
  const link = await page.inputValue('#signLink');
  const p2 = await browser.newPage();
  const errs2 = [];
  p2.on('pageerror', (e) => errs2.push(e.message));
  await p2.goto(link, { waitUntil: 'networkidle' });
  const txt = await p2.locator('body').innerText();
  ok(/here is your agreement to sign/i.test(txt), 'sign page did not render: ' + txt.slice(0, 100));
  ok(txt.includes('450 sq ft rear interlock patio'), 'work missing on the sign page');
  ok(txt.includes('$32,205'), 'total missing on the sign page');
  ok(errs2.length === 0, errs2.join(' | '));
  await p2.close();
});

await test('the creator itself sends nothing to the server', async () => {
  const calls = [];
  page.on('request', (r) => { if (/\/api\//.test(r.url())) calls.push(r.url()); });
  await page.fill('#projectPrice', '31000');
  await page.waitForTimeout(600);
  ok(calls.length === 0, 'creator called the API: ' + calls.join(', '));
});

await test('no JS errors after driving the whole form', () => ok(errors.length === 0, errors.join(' | ')));
await page.close();
}

/* ================= ARCHIVE ================= */
{
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`${ORIGIN}/tools/signed/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

await test('archive loads with no JS errors', () => ok(errors.length === 0, errors.join(' | ')));

await test('archive asks for a passphrase before it fetches anything', async () => {
  const txt = await page.locator('body').innerText();
  ok(/Office access/i.test(txt), 'no passphrase gate: ' + txt.slice(0, 140).replace(/\n/g, ' '));
  ok(await page.locator('input[type=password]').count() === 1, 'no passphrase field');
  ok(await page.locator('.row').count() === 0, 'contracts rendered before any passphrase');
});

await test('entering a passphrase explains the setup rather than breaking', async () => {
  await page.fill('input[type=password]', 'anything-at-all');
  await page.locator('.gate button').click();
  await page.waitForTimeout(1500);
  const txt = await page.locator('body').innerText();
  ok(/not set up|CONTRACT_ARCHIVE_TOKEN|passphrase was not right/i.test(txt),
     'unexpected state: ' + txt.slice(0, 200).replace(/\n/g, ' '));
  ok(await page.locator('.row').count() === 0, 'contracts shown without a valid passphrase');
});

await test('the archive never exposes contracts without a passphrase', async () => {
  const res = await page.request.get(`${ORIGIN}/api/signed/`);
  ok([401, 503].includes(res.status()), 'archive API returned ' + res.status());
  const body = await res.text();
  ok(!/signature|clientEmail|"records":\[\{/.test(body), 'API leaked data: ' + body.slice(0, 120));
});

await test('a wrong passphrase is refused', async () => {
  const res = await page.request.get(`${ORIGIN}/api/signed/?k=definitely-not-it`);
  ok([401, 503].includes(res.status()), 'wrong passphrase returned ' + res.status());
});
await page.close();
}

await browser.close();
console.log(`\n  OFFICE PAGES: ${passed} passed, ${failures.length} failed\n`);
for (const [n, m] of failures) console.error(`  FAIL  ${n}\n        ${m}`);
process.exit(failures.length ? 1 : 0);
