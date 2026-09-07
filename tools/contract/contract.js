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
  DEFAULTS, SERVICE_LIBRARY, SIGNERS, PAYMENT_PLANS, AGENCY,
  priceBreakdown, money, signingUrl, coveringEmail, contractGaps,
  todayISO, ESTIMATE_OVERRUN_CAP
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
const SELECT_FIELDS = ['paymentPlan'];

function buildServices() {
  const host = $('services');
  host.textContent = '';
  for (const s of SERVICE_LIBRARY) {
    const row = document.createElement('label');
    row.className = 'svc';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.value = s.id;
    box.checked = d.services.includes(s.id);
    box.addEventListener('change', () => {
      const set = new Set(d.services);
      box.checked ? set.add(s.id) : set.delete(s.id);
      // Preserve library order so the printed list never shuffles between edits.
      d.services = SERVICE_LIBRARY.filter((x) => set.has(x.id)).map((x) => x.id);
      update();
    });

    const text = document.createElement('span');
    text.textContent = s.label;
    const desc = document.createElement('small');
    desc.textContent = s.desc;
    text.appendChild(desc);

    row.append(box, text);
    host.appendChild(row);
  }
}

function buildCustomList() {
  const host = $('customList');
  host.textContent = '';
  d.customServices.forEach((value, i) => {
    const row = document.createElement('div');
    row.className = 'custom-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Anything not in the list above';
    input.addEventListener('input', () => { d.customServices[i] = input.value; update({ skipCustom: true }); });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => { d.customServices.splice(i, 1); update(); });

    row.append(input, remove);
    host.appendChild(row);
  });
}

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
    ? `Link is ${len} characters — trim the scope or exclusions, some mail clients break past 8000.`
    : `${len} characters.`;
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
      d.services = Array.isArray(d.services) ? d.services : [...DEFAULTS.services];
      d.customServices = Array.isArray(d.customServices) ? d.customServices : [];
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
  if (!opts.skipCustom) buildCustomList();
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
  node.addEventListener('input', () => update({ skipCustom: true }));
  node.addEventListener('change', () => update({ skipCustom: true }));
}

$('addCustom').addEventListener('click', () => {
  d.customServices.push('');
  update();
  const rows = $('customList').querySelectorAll('input');
  rows[rows.length - 1]?.focus();
});

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
  d = { ...DEFAULTS, services: [...DEFAULTS.services], customServices: [] };
  d.agreementDate = todayISO();
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to remove */ }
  writeForm();
  buildServices();
  update();
});

/* ------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------ */
load();
buildSelects();
if (!d.agreementDate) d.agreementDate = todayISO();
writeForm();
buildServices();
update();

document.title = `Contract Creator | ${AGENCY.name}`;
