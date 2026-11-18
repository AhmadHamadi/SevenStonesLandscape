import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const mainJs = await readFile(join(root, 'js/main.js'), 'utf8');
const serviceConsentText = 'By sending my request, I agree that Seven Stones Landscape may text me about this quote, including scheduling an in-person estimate visit.';

assert.ok(mainJs.includes("serviceConsent.name = 'sms_transactional_consent'"), 'quote forms must record service SMS agreement');
assert.ok(mainJs.includes("serviceConsent.value = 'yes'"), 'quote submission must send affirmative service agreement');
assert.ok(mainJs.includes(serviceConsentText), 'quote forms must disclose that submission agrees to quote-related texts');
assert.ok(mainJs.includes("consent.innerHTML = 'By sending my request"), 'service SMS disclosure must be adjacent to the submit action');
assert.ok(mainJs.includes("honeypot.className = 'form-honeypot'"), 'shared form script must add an invisible bot honeypot');
assert.ok(!mainJs.includes("checkbox.type = 'checkbox'"), 'shared quote forms must not inject SMS checkboxes');
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
assert.match(privacy, /Submitting a quote request is an affirmative agreement to receive service-related text messages/i);
assert.match(terms, /<h2>SMS and Text Message Consent<\/h2>/i);
assert.match(terms, /Reply STOP to opt out or HELP for help/i);
assert.match(terms, /Mobile carriers are not liable for delayed or undelivered messages/i);
assert.match(terms, /you must be at least 18 years old/i);

const smsOptIn = await readFile(join(root, 'sms-opt-in/index.html'), 'utf8');
assert.match(smsOptIn, /action="\/api\/quote"/i);
assert.match(smsOptIn, /name="sms_transactional_consent"/i);
assert.match(smsOptIn, /name="sms_marketing_consent"/i);
assert.match(smsOptIn, /type="checkbox"[^>]*name="sms_transactional_consent"/i, 'SMS preference form must keep separate optional choices');
assert.doesNotMatch(smsOptIn, /type="checkbox"[^>]*\bchecked\b/i, 'SMS choices must start unchecked');
assert.match(smsOptIn, /\/privacy\//i);
assert.match(smsOptIn, /\/terms-of-service\//i);

console.log(`ok  ${quoteForms} quote forms show service-text consent, privacy/terms, and bot-trap support`);
