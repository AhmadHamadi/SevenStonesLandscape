/**
 * The contract creator: /tools/contract/
 *
 * Fills a form, renders the live document beside it, and produces the signing
 * link plus a covering email ready to paste into a mail client.
 *
 * The whole agreement travels inside the signing link, so nothing is written to
 * a server until the customer actually signs.
 */

import {
  DEFAULTS, SIGNERS, PAYMENT_PLANS, PAYMENT_METHODS, DEPOSIT_PRESETS, AGENCY,
  priceBreakdown, money, signingUrl, coveringEmail, contractGaps,
  ESTIMATE_OVERRUN_CAP, LINK_EXPIRY_HOURS
} from './contract-model.js';
import { renderDocument, DOCUMENT_CSS } from './document.js';
import { createSignaturePad, validSignature } from './signature-ink.js';

const $ = (id) => document.getElementById(id);
const KEY = 'ss-contract-draft-v1';
const SIGNATURE_KEY = 'ss-office-signatures-v1';

/* The document stylesheet lives in document.js so /sign and /tools/signed cannot
   drift from it. Inject it once. */
const style = document.createElement('style');
style.textContent = DOCUMENT_CSS;
document.head.appendChild(style);

let d = { ...DEFAULTS };
let savedSignatures = {};

try {
  const stored = JSON.parse(localStorage.getItem(SIGNATURE_KEY) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    for (const [index, value] of Object.entries(stored)) {
      if (SIGNERS[Number(index)] && validSignature(value)) savedSignatures[index] = value;
    }
  }
} catch (e) { /* storage unavailable: drawing still works for this session */ }

const signaturePad = createSignaturePad($('repSignaturePad'), (value) => {
  const index = String(d.signerIndex);
  if (value) savedSignatures[index] = value;
  else delete savedSignatures[index];
  d.repSignature = value;
  try {
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(savedSignatures));
    $('repSignatureStatus').textContent = value
      ? `${SIGNERS[d.signerIndex].name}'s signature is saved in this browser.`
      : `${SIGNERS[d.signerIndex].name} has no saved signature.`;
  } catch (e) {
    $('repSignatureStatus').textContent = 'Could not save in this browser. Keep this page open until you print or copy the link.';
  }
  update({ skipRead: true });
});

function showSignerSignature() {
  d.repSignature = savedSignatures[d.signerIndex] || '';
  signaturePad.load(d.repSignature);
  $('repSignatureStatus').textContent = d.repSignature
    ? `${SIGNERS[d.signerIndex].name}'s signature is saved in this browser.`
    : `${SIGNERS[d.signerIndex].name} has no saved signature.`;
}

/* ------------------------------------------------------------------
   Field wiring
   ------------------------------------------------------------------ */
const TEXT_FIELDS = [
  'clientName', 'clientContact', 'clientTitle', 'siteAddress',
  'clientEmail', 'clientPhone', 'agreementDate', 'startDate', 'completeDate',
  'projectPrice', 'scope', 'exclusions'
];
const NUMBER_FIELDS = ['taxRate', 'depositPercent', 'signerIndex'];
const SELECT_FIELDS = ['paymentPlan', 'paymentMethod'];
const CHECKBOX_FIELDS = ['includeAgreementDate', 'includeStartDate', 'includeCompleteDate'];
const CHECKBOX_TARGETS = {
  includeAgreementDate: 'agreementDate', includeStartDate: 'startDate',
  includeCompleteDate: 'completeDate'
};

function buildSelects() {
  const plan = $('paymentPlan');
  plan.textContent = '';
  for (const p of PAYMENT_PLANS) {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.label;
    plan.appendChild(o);
  }

  const signer = $('signerIndex');
  signer.textContent = '';
  SIGNERS.forEach((s, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = `${s.name} — ${s.title}`;
    signer.appendChild(o);
  });
  // Keep the selector hidden only when there is no choice to make.
  signer.closest('.f').hidden = SIGNERS.length < 2;

  const method = $('paymentMethod');
  method.textContent = '';
  for (const m of PAYMENT_METHODS) {
    const o = document.createElement('option');
    o.value = m;
    o.textContent = m;
    method.appendChild(o);
  }

  const presets = $('depositPresets');
  presets.textContent = '';
  for (const v of DEPOSIT_PRESETS) {
    const o = document.createElement('option');
    o.value = String(v);
    presets.appendChild(o);
  }
}

function readForm() {
  for (const id of TEXT_FIELDS) d[id] = $(id).value;
  for (const id of NUMBER_FIELDS) {
    const raw = $(id).value;
    d[id] = raw === '' ? DEFAULTS[id] : Number(raw);
  }
  for (const id of CHECKBOX_FIELDS) {
    d[id] = $(id).checked;
    const inputId = CHECKBOX_TARGETS[id];
    $(inputId).disabled = !d[id];
    if (!d[id]) {
      $(inputId).value = '';
      d[inputId] = '';
    }
  }
  for (const id of SELECT_FIELDS) d[id] = $(id).value;
}

function writeForm() {
  for (const id of TEXT_FIELDS) $(id).value = d[id] ?? '';
  for (const id of NUMBER_FIELDS) $(id).value = d[id] ?? '';
  for (const id of CHECKBOX_FIELDS) {
    $(id).checked = Boolean(d[id]);
    const inputId = CHECKBOX_TARGETS[id];
    $(inputId).disabled = !$(id).checked;
  }
  for (const id of SELECT_FIELDS) $(id).value = d[id] ?? '';
}

/* ------------------------------------------------------------------
   Derived output
   ------------------------------------------------------------------ */
function renderTotals() {
  const host = $('totals');
  host.textContent = '';
  const p = priceBreakdown(d);

  if (!p) {
    const row = document.createElement('div');
    row.className = 't';
    row.append(Object.assign(document.createElement('span'), { textContent: 'Enter a price' }));
    host.appendChild(row);
    $('capNote').textContent = '';
    return;
  }

  const line = (label, value, grand) => {
    const row = document.createElement('div');
    row.className = grand ? 't grand' : 't';
    row.append(
      Object.assign(document.createElement('span'), { textContent: label }),
      Object.assign(document.createElement('b'), { textContent: value })
    );
    host.appendChild(row);
  };

  line('Total', money(p.total, d.currency), true);
  if (p.deposit > 0) line(`Deposit ${p.depositPercent}%`, money(p.deposit, d.currency));
  p.instalments.slice(0, 2).forEach((i, index) =>
    line(index === 0 ? 'First payment' : 'Second payment', money(i.value, d.currency)));

  $('capNote').textContent =
    `The Consumer Protection Act caps the final price at ${money(p.cap, d.currency)} ` +
    `(this agreement plus ${ESTIMATE_OVERRUN_CAP}%) unless they agree to extras in writing.`;
}

function renderGaps() {
  const host = $('gaps');
  host.textContent = '';
  const gaps = contractGaps(d);

  if (!gaps.length) {
    host.className = 'gaps ok';
    host.textContent = 'Ready to send.';
    return;
  }
  host.className = 'gaps bad';
  host.appendChild(Object.assign(document.createElement('div'), {
    textContent: 'Still needed before this goes out:'
  }));
  const ul = document.createElement('ul');
  for (const g of gaps) {
    ul.appendChild(Object.assign(document.createElement('li'), { textContent: g }));
  }
  host.appendChild(ul);
}

function renderLinkAndEmail() {
  const url = signingUrl(d);
  const { subject, body } = coveringEmail(d, url);
  $('signLink').value = url;
  $('emailSubject').value = subject;
  $('emailBody').value = body;

  // A URL past ~8k risks being refused by a mail client or a proxy. Warn well before.
  const len = url.length;
  const warn = len > 6000;
  $('linkLen').textContent = warn
    ? `Link is ${len} characters — trim the description, some mail clients break past 8000.`
    : `Good for ${LINK_EXPIRY_HOURS} hours from when you copy it. ${len} characters.`;
  $('linkLen').style.color = warn ? 'var(--bad)' : '';
}

function renderPreview() {
  const host = $('doc');
  host.textContent = '';
  host.appendChild(renderDocument(d));
}

/* ------------------------------------------------------------------
   Persistence
   ------------------------------------------------------------------ */
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    const badge = $('saved');
    badge.classList.add('on');
    clearTimeout(save._t);
    save._t = setTimeout(() => badge.classList.remove('on'), 1200);
  } catch (e) { /* private mode, or full: the draft simply is not kept */ }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      d = { ...DEFAULTS, ...saved };
      if (!Object.hasOwn(saved, 'includeAgreementDate')) d.includeAgreementDate = Boolean(d.agreementDate);
      if (!Object.hasOwn(saved, 'includeStartDate')) d.includeStartDate = Boolean(d.startDate);
      if (!Object.hasOwn(saved, 'includeCompleteDate')) d.includeCompleteDate = Boolean(d.completeDate);
    }
  } catch (e) { /* corrupt draft: fall back to defaults rather than dying on load */ }
}

/* Writing to localStorage on every keystroke of a long scope blocks the main
   thread; the render is instant but the write can wait. */
let saveTimer;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}

function update(opts = {}) {
  if (!opts.skipRead) readForm();
  renderTotals();
  renderGaps();
  renderLinkAndEmail();
  renderPreview();
  scheduleSave();
}

/* ------------------------------------------------------------------
   Wiring
   ------------------------------------------------------------------ */
for (const id of [...TEXT_FIELDS, ...NUMBER_FIELDS, ...SELECT_FIELDS, ...CHECKBOX_FIELDS]) {
  const node = $(id);
  node.addEventListener('input', () => {
    if (id === 'signerIndex') { d.signerIndex = Number(node.value); showSignerSignature(); }
    update();
    if (id === 'signerIndex') save();
  });
  node.addEventListener('change', () => {
    if (id === 'signerIndex') { d.signerIndex = Number(node.value); showSignerSignature(); }
    update();
    if (id === 'signerIndex') save();
  });
}

$('clearRepSignature').addEventListener('click', () => signaturePad.clear());

for (const btn of document.querySelectorAll('[data-copy]')) {
  btn.addEventListener('click', async () => {
    const field = $(btn.getAttribute('data-copy'));
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(field.value);
    } catch (e) {
      // Clipboard API needs a secure context; select it so Ctrl+C still works.
      field.focus();
      field.select();
      btn.textContent = 'Press Ctrl+C';
      setTimeout(() => { btn.textContent = original; }, 2200);
      return;
    }
    btn.textContent = 'Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1600);
  });
}

window.addEventListener('beforeprint', () => {
  const sheet = document.querySelector('.sheet');
  if (!sheet) return;
  const printableHeight = 11 * 96 - 2 * (7 * 96 / 25.4);
  const currentZoom = Number.parseFloat(getComputedStyle(sheet).zoom) || 1;
  const naturalHeight = sheet.getBoundingClientRect().height / currentZoom;
  const scale = Math.min(0.78, printableHeight / naturalHeight);
  sheet.style.zoom = String(scale);
});

window.addEventListener('afterprint', () => {
  const sheet = document.querySelector('.sheet');
  if (sheet) sheet.style.removeProperty('zoom');
});

$('print').addEventListener('click', () => window.print());

$('archive').addEventListener('click', () => { window.location.href = '/tools/signed/'; });

$('clear').addEventListener('click', () => {
  if (!confirm('Clear this contract and start a new one?')) return;
  d = { ...DEFAULTS };
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to remove */ }
  writeForm();
  showSignerSignature();
  update();
});

/* ------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------ */
load();
buildSelects();
writeForm();
showSignerSignature();
update();

document.title = `Contract Creator | ${AGENCY.name}`;
