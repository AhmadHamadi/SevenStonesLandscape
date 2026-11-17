import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const mainJs = await readFile(join(root, 'js/main.js'), 'utf8');
const consentText = 'I agree to receive text messages from Seven Stones Landscape about this estimate request and scheduling. Message frequency varies; message and data rates may apply. Reply STOP to opt out, HELP for help. Consent is not required to purchase.';

assert.ok(mainJs.includes("checkbox.name = 'sms_consent'"), 'shared form script must create an SMS consent field');
assert.ok(mainJs.includes("checkbox.value = 'yes'"), 'checked consent must submit the affirmative value');
assert.ok(mainJs.includes(consentText), 'the checkbox must display the approved consent wording');
assert.ok(!/checkbox\.(?:checked|required)\s*=\s*true/.test(mainJs), 'consent must not be preselected or required');
assert.ok(mainJs.includes("pagePathField.name = 'form_page_path'"), 'shared form script must capture the exact form page path');
assert.ok(mainJs.includes('new URLSearchParams(window.location.search)'), 'tracking capture must read URL parameters without storing the full URL');
assert.ok(mainJs.includes("'utm_source'"), 'shared form script must capture allowlisted UTM fields');
assert.ok(mainJs.includes("'gclid'"), 'shared form script must capture the Google click ID when present');
assert.ok(mainJs.includes('new URL(document.referrer).hostname'), 'shared form script must capture referrer host only');

const htmlFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'assets', 'dist', 'coverage'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}
await walk(root);

let quoteForms = 0;
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  const forms = html.match(/<form\b[^>]*\baction=["'][^"']*\/api\/quote[^"']*["'][^>]*>/gi) || [];
  if (!forms.length) continue;
  quoteForms += forms.length;
  assert.match(html, /<script\b[^>]*\bsrc=["'][^"']*\/?js\/main\.js(?:\?[^"']*)?["']/i, `${relative(root, path)} must load the shared form script`);
}
assert.equal(quoteForms, 35, 'expected all 35 known quote and SMS opt-in forms to use the shared form script');

const privacy = await readFile(join(root, 'privacy/index.html'), 'utf8');
const terms = await readFile(join(root, 'terms-of-service/index.html'), 'utf8');
assert.match(privacy, /<h2>SMS Text Messages<\/h2>/i);
assert.match(privacy, /optional checkboxes that are unchecked by default/i);
assert.match(terms, /<h2>SMS and Text Message Consent<\/h2>/i);
assert.match(terms, /Reply STOP to opt out or HELP for help/i);

const smsOptIn = await readFile(join(root, 'sms-opt-in/index.html'), 'utf8');
assert.match(smsOptIn, /action="\/api\/quote"/i);
assert.match(smsOptIn, /name="sms_transactional_consent"/i);
assert.match(smsOptIn, /name="sms_marketing_consent"/i);
assert.doesNotMatch(smsOptIn, /type="checkbox"[^>]*\bchecked\b/i, 'SMS choices must start unchecked');
assert.match(smsOptIn, /\/privacy\//i);
assert.match(smsOptIn, /\/terms-of-service\//i);

console.log(`ok  ${quoteForms} quote forms load the optional, unchecked SMS-consent field; privacy and terms copy is present`);
