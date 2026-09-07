/**
 * Real-browser test of the signing page.
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/test-signing-browser.js
 *   node scripts/test-signing-browser.js http://localhost:3000   (or any origin)
 *
 * Not part of `npm test`, because it needs a browser download. It is the only
 * test that proves the things that actually matter to a customer:
 *   - the signature pad captures a real drawn stroke as real pixels;
 *   - the form refuses to submit until they have drawn one;
 *   - the PDF the browser builds is one page and has the signature in it.
 *
 * jsdom cannot do any of that - its canvas is a stub, so a pad that captured
 * nothing would still pass every other test in this repo.
 *
 * The /api/sign/ call is intercepted, so running this sends no email.
 */

import { chromium } from 'playwright';

const ORIGIN = process.argv[2] || 'https://www.sevenstoneslandscape.ca';

// Resolved against this file, so the script works from any working directory.
// Note: no pathToFileURL here - the URL is already a file: URL on every platform.
const m = await import(new URL('../tools/contract/contract-model.js', import.meta.url).href);

const d = {
  ...m.DEFAULTS,
  clientName: 'Browser Test', clientContact: 'Jane Whitfield',
  clientEmail: 'test@example.com', clientPhone: '(905) 555-0134',
  siteAddress: '18 Ridgemount Ave, Hamilton, ON',
  agreementDate: m.todayISO(), startDate: '2026-09-22', completeDate: '2026-10-10',
  projectPrice: '28500', depositPercent: 15, paymentMethod: 'Cash or e-transfer',
  scope: '450 sq ft rear interlock patio, Unilock Beacon Hill Flag\n8 inch compacted granular A base\nTwo-tier seat wall, 14 ft',
  exclusions: 'Deck removal\nPermit fees'
};
const url = m.signingUrl(d, ORIGIN);

let passed = 0;
const failures = [];
const test = async (name, fn) => {
  try { await fn(); passed++; console.log('  ok    ' + name); }
  catch (err) { failures.push([name, err.message]); console.log('  FAIL  ' + name); }
};
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

/** Counts pixels with any alpha - the only honest way to know ink landed. */
const inkedPixels = (locator) => locator.evaluate((c) => {
  const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] !== 0) n++;
  return n;
});

/** Draws a signature-shaped squiggle with real mouse movement. */
async function drawOn(page) {
  // Mouse coordinates are viewport-relative and the pad sits below the fold on a
  // phone, so it has to be scrolled on screen or the stroke lands on nothing.
  await page.locator('canvas.pad').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await page.locator('canvas.pad').boundingBox();
  const midY = box.y + box.height / 2;
  await page.mouse.move(box.x + 30, midY);
  await page.mouse.down();
  for (let i = 0; i <= 40; i++) {
    await page.mouse.move(box.x + 30 + i * 6, midY + Math.sin(i / 3) * 26);
  }
  await page.mouse.up();
  await page.waitForTimeout(200);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });  // a phone

let captured = null;
await page.route('**/api/sign/**', async (route) => {
  captured = JSON.parse(route.request().postData() || '{}');
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
});

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

console.log(`\n  signing page: ${ORIGIN}\n`);
await page.goto(url, { waitUntil: 'networkidle' });

await test('the page renders the agreement', async () => {
  ok(await page.locator('.paper .sheet').count() === 1, 'no document rendered');
  const txt = await page.locator('body').innerText();
  ok(txt.includes('450 sq ft rear interlock patio'), 'the work is missing');
  ok(txt.includes('$32,205'), 'the total is missing');
});

await test('no JavaScript errors on load', () => {
  ok(errors.length === 0, errors.join(' | '));
});

await test('the signature canvas has a real width, not collapsed to 1px', async () => {
  const box = await page.locator('canvas.pad').boundingBox();
  ok(box.width > 200, 'canvas is only ' + box.width + 'px wide');
  const bitmap = await page.locator('canvas.pad').evaluate((c) => c.width);
  ok(bitmap > 200, 'canvas bitmap is only ' + bitmap + 'px');
});

await test('the pad starts blank', async () => {
  ok(await inkedPixels(page.locator('canvas.pad')) === 0, 'pad had ink before anyone drew');
});

await test('it refuses to submit before a signature is drawn', async () => {
  await page.locator('#typedName').fill('Jane Whitfield');
  await page.locator('.agree input[type=checkbox]').check();
  await page.locator('.submit').click();
  await page.waitForTimeout(400);
  const errs = await page.locator('.err-msg:visible').allInnerTexts();
  ok(errs.some((e) => /sign in the box/i.test(e)), 'no signature error: ' + errs.join(' | '));
  ok(captured === null, 'it posted without a signature');
});

await test('drawing leaves real ink on the pad', async () => {
  await drawOn(page);
  const n = await inkedPixels(page.locator('canvas.pad'));
  ok(n > 500, 'only ' + n + ' inked pixels - the stroke did not register');
  ok(await page.locator('.padwrap.inked').count() === 1, 'pad not marked as inked');
});

await test('Clear wipes it, and it can be drawn again', async () => {
  await page.locator('.pad-label button').click();
  await page.waitForTimeout(200);
  ok(await inkedPixels(page.locator('canvas.pad')) === 0, 'Clear did not wipe the pad');
  await drawOn(page);
  ok(await inkedPixels(page.locator('canvas.pad')) > 500, 'could not draw again after Clear');
});

await test('signing posts the drawn signature and a PDF', async () => {
  await page.locator('.submit').click();
  await page.waitForTimeout(6000);   // the PDF library loads from a CDN
  ok(captured, 'nothing was posted');
  ok(/^data:image\/png;base64,/.test(captured.signature), 'signature is not a PNG data URL');
  ok(captured.signature.length > 2000,
     'signature is only ' + captured.signature.length + ' chars - probably blank');
  ok(captured.pdfBase64 && captured.pdfBase64.length > 3000, 'no PDF attached');
});

await test('the PDF is one page with the signature embedded as an image', () => {
  const buf = Buffer.from(captured.pdfBase64, 'base64');
  ok(buf.subarray(0, 5).toString() === '%PDF-', 'not a PDF');
  ok(buf.includes(Buffer.from('%%EOF')), 'PDF not terminated');
  const raw = buf.toString('latin1');
  const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok(pages === 1, 'PDF is ' + pages + ' pages, should be one');
  ok(/\/Subtype\s*\/Image/.test(raw), 'no image - the signature did not embed');
  ok(/\/Font/.test(raw), 'no font - the text is not selectable');
  console.log('        (' + pages + ' page, ' + Math.round(buf.length / 1024) + 'KB)');
});

await test('the page confirms it was signed and repeats the cancellation right', async () => {
  const txt = await page.locator('body').innerText();
  ok(/Signed\. Thank you\./i.test(txt), 'no confirmation: ' + txt.slice(0, 140));
  ok(/10 days/.test(txt), 'confirmation drops the cancellation right');
});

await test('no JavaScript errors across the whole flow', () => {
  ok(errors.length === 0, errors.join(' | '));
});

await browser.close();

console.log(`\n  BROWSER: ${passed} passed, ${failures.length} failed\n`);
for (const [name, msg] of failures) console.error(`  FAIL  ${name}\n        ${msg}`);
process.exit(failures.length ? 1 : 0);
