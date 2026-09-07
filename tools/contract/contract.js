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
  todayISO, ESTIMATE_OVERRUN_CAP, LINK_EXPIRY_HOURS
} from './contract-model.js';
import { renderDocument, DOCUMENT_CSS } from './document.js';

const $ = (id) => document.getElementById(id);
const KEY = 'ss-contract-draft-v1';

/* The document stylesheet lives in document.js so /sign and /tools/signed cannot
   drift from it. Inject it once. */
const style = document.createElement('style');
style.textContent = DOCUMENT_CSS;
document.head.appendChild(style);

let d = { ...DEFAULTS };

/* ------------------------------------------------------------------
   Field wiring
   ------------------------------------------------------------------ */
const TEXT_FIELDS = [
  'clientName', 'clientContact', 'clientTitle', 'clientAddress', 'siteAddress',
  'clientEmail', 'clientPhone', 'agreementDate', 'startDate', 'completeDate',
  'projectPrice', 'scope', 'exclusions'
];
const NUMBER_FIELDS = ['taxRate', 'depositPercent', 'warrantyYears', 'signerIndex'];
const SELECT_FIELDS = ['paymentPlan', 'paymentMethod'];

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
  // One signer today; the control is noise until there are two.
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
  for (const id of SELECT_FIELDS) d[id] = $(id).value;
}

function writeForm() {
  for (const id of TEXT_FIELDS) $(id).value = d[id] ?? '';
  for (const id of NUMBER_FIELDS) $(id).value = d[id] ?? '';
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

  line('Subtotal', money(p.base, d.currency));
  line(`HST ${p.taxRate}%`, money(p.tax, d.currency));
  line('Total', money(p.total, d.currency), true);
  if (p.deposit > 0) line(`Deposit ${p.depositPercent}%`, money(p.deposit, d.currency));
  for (const i of p.instalments) line(i.label, money(i.value, d.currency));

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
for (const id of [...TEXT_FIELDS, ...NUMBER_FIELDS, ...SELECT_FIELDS]) {
  const node = $(id);
  node.addEventListener('input', () => update());
  node.addEventListener('change', () => update());
}

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

$('print').addEventListener('click', () => window.print());

$('archive').addEventListener('click', () => { window.location.href = '/tools/signed/'; });

$('clear').addEventListener('click', () => {
  if (!confirm('Clear this contract and start a new one?')) return;
  d = { ...DEFAULTS };
  d.agreementDate = todayISO();
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to remove */ }
  writeForm();
  update();
});

/* ------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------ */
load();
buildSelects();
if (!d.agreementDate) d.agreementDate = todayISO();
writeForm();
update();

document.title = `Contract Creator | ${AGENCY.name}`;
