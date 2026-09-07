/**
 * The signed-contract archive: /tools/signed/
 *
 * Lists what customers have actually signed and re-renders any one of them from
 * the stored contract data, using the same document module the customer saw.
 *
 * The listing holds customer contact details and signature images, so the API is
 * behind a passphrase. It is kept in sessionStorage - it dies with the tab rather
 * than sitting in localStorage on a shared laptop.
 */

import { money, longDate, priceBreakdown, AGENCY } from '../contract/contract-model.js';
import { renderDocument, DOCUMENT_CSS } from '../contract/document.js';
import { downloadPdf } from '../contract/pdf.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const TOKEN_KEY = 'ss-archive-token';

const style = document.createElement('style');
style.textContent = DOCUMENT_CSS;
document.head.appendChild(style);

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

let records = [];
let filter = '';

function token() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
}
function setToken(v) {
  try { v ? sessionStorage.setItem(TOKEN_KEY, v) : sessionStorage.removeItem(TOKEN_KEY); }
  catch (e) { /* private mode: the passphrase is simply asked for again */ }
}

/* ------------------------------------------------------------------
   Passphrase gate
   ------------------------------------------------------------------ */
function showGate(message) {
  app.textContent = '';
  const box = el('div', 'gate');
  box.appendChild(el('h2', null, 'Office access'));
  box.appendChild(el('p', null,
    'This page lists signed customer contracts. Enter the archive passphrase to open it.'));

  if (message) box.appendChild(el('div', 'err', message));

  const label = el('label', null, 'Passphrase');
  label.setAttribute('for', 'pass');
  const input = el('input');
  input.type = 'password';
  input.id = 'pass';
  input.autocomplete = 'current-password';

  const go = el('button', 'primary', 'Open');
  go.type = 'button';

  const submit = () => {
    if (!input.value.trim()) return;
    setToken(input.value.trim());
    load();
  };
  go.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  box.append(label, input, go);
  app.appendChild(box);
  input.focus();
}

/* ------------------------------------------------------------------
   Load
   ------------------------------------------------------------------ */
async function load() {
  if (!token()) { showGate(); return; }

  app.textContent = '';
  app.appendChild((() => {
    const e = el('div', 'empty');
    e.appendChild(el('h2', null, 'Loading…'));
    return e;
  })());

  let res;
  try {
    res = await fetch(`/api/signed/?k=${encodeURIComponent(token())}`, {
      headers: { 'X-Archive-Token': token() }
    });
  } catch (err) {
    return showMessage('bad', 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 401) {
    setToken('');
    return showGate('That passphrase was not right.');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 503) {
    return showMessage('warn',
      `${data.error || 'The archive is not set up.'} ${data.setup || ''}`,
      'CONTRACT_ARCHIVE_TOKEN');
  }
  if (!res.ok) {
    return showMessage('bad', data.error || 'Could not read the archive.');
  }
  if (!data.configured) {
    return showMessage('warn',
      data.setup || 'No storage is connected yet, so nothing is being archived.',
      'BLOB_READ_WRITE_TOKEN');
  }

  records = Array.isArray(data.records) ? data.records : [];
  render();
}

function showMessage(kind, text, codeHint) {
  app.textContent = '';
  const box = el('div', `msg ${kind}`);
  box.appendChild(document.createTextNode(text));
  if (codeHint) {
    box.appendChild(document.createTextNode(' Missing setting: '));
    box.appendChild(el('code', null, codeHint));
    box.appendChild(document.createTextNode('.'));
  }
  app.appendChild(box);
}

/* ------------------------------------------------------------------
   Render
   ------------------------------------------------------------------ */
function matches(r) {
  if (!filter) return true;
  const hay = [
    r.reference, r.typedName, r.customer?.name, r.customer?.contact,
    r.customer?.email, r.customer?.phone, r.customer?.property
  ].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(filter);
}

function render() {
  app.textContent = '';

  const search = el('div', 'search');
  const input = el('input');
  input.type = 'search';
  input.placeholder = 'Search by name, address, email, or reference';
  input.value = filter;
  input.addEventListener('input', () => {
    filter = input.value.trim().toLowerCase();
    renderRows(list);
  });
  search.appendChild(input);
  app.appendChild(search);

  const list = el('div', 'rows');
  app.appendChild(list);
  renderRows(list);
}

function renderRows(list) {
  list.textContent = '';
  const shown = records.filter(matches);

  if (!shown.length) {
    const empty = el('div', 'empty');
    empty.appendChild(el('h2', null, records.length ? 'Nothing matches that search' : 'Nothing signed yet'));
    empty.appendChild(el('p', null, records.length
      ? 'Try a different name or reference.'
      : 'Signed agreements will appear here automatically.'));
    list.appendChild(empty);
    return;
  }

  for (const r of shown) list.appendChild(rowFor(r));
}

function rowFor(r) {
  const d = r.contract || {};
  const p = priceBreakdown(d);

  const row = el('div', 'row');

  const head = el('div', 'row-head');
  head.setAttribute('role', 'button');
  head.tabIndex = 0;

  const sig = el('div', 'row-sig');
  if (r.signature) {
    const img = el('img');
    img.src = r.signature;
    img.alt = `Signature of ${r.typedName || 'customer'}`;
    sig.appendChild(img);
  }
  head.appendChild(sig);

  const main = el('div', 'row-main');
  main.appendChild(el('b', null, r.customer?.name || r.typedName || 'Customer'));
  main.appendChild(el('span', null, r.customer?.property || '—'));
  main.appendChild(el('div', 'ref', r.reference || ''));
  head.appendChild(main);

  const meta = el('div', 'row-meta');
  meta.appendChild(el('div', 'price', p ? money(p.total, d.currency) : '—'));
  meta.appendChild(el('div', 'when', `Signed ${r.signedAtLong || longDate(r.signedAt) || '—'}`));
  head.appendChild(meta);

  row.appendChild(head);

  const bodyWrap = el('div', 'row-body');
  const actions = el('div', 'row-actions');

  const pdfBtn = el('button', null, 'Download PDF');
  pdfBtn.type = 'button';
  pdfBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const original = pdfBtn.textContent;
    pdfBtn.disabled = true;
    pdfBtn.textContent = 'Building…';
    try {
      await downloadPdf(d, {
        clientSignature: r.signature || '',
        clientSignedAt: r.signedAtLong || longDate(r.signedAt) || '',
        typedName: r.typedName || ''
      });
    } catch (err) {
      alert('Could not build the PDF. Use Print instead.');
    }
    pdfBtn.disabled = false;
    pdfBtn.textContent = original;
  });
  actions.appendChild(pdfBtn);

  const printBtn = el('button', null, 'Print');
  printBtn.type = 'button';
  printBtn.addEventListener('click', (e) => { e.stopPropagation(); window.print(); });
  actions.appendChild(printBtn);

  if (r.customer?.email) {
    const mail = el('button', null, 'Email customer');
    mail.type = 'button';
    mail.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `mailto:${encodeURIComponent(r.customer.email)}` +
        `?subject=${encodeURIComponent(`Your Seven Stones agreement (${r.reference})`)}`;
    });
    actions.appendChild(mail);
  }

  bodyWrap.appendChild(actions);

  const host = el('div', 'doc-host');
  bodyWrap.appendChild(host);
  row.appendChild(bodyWrap);

  // Render the document only when opened; 200 contracts is 200 full documents.
  let built = false;
  const toggle = () => {
    const opening = !row.classList.contains('open');
    row.classList.toggle('open', opening);
    if (opening && !built) {
      built = true;
      host.appendChild(renderDocument(d, {
        clientSignature: r.signature || '',
        clientSignedAt: r.signedAtLong || longDate(r.signedAt) || ''
      }));
    }
  };
  head.addEventListener('click', toggle);
  head.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });

  return row;
}

/* ------------------------------------------------------------------
   Wiring
   ------------------------------------------------------------------ */
$('refresh').addEventListener('click', load);
$('newContract').addEventListener('click', () => { window.location.href = '/tools/contract/'; });

document.title = `Signed Contracts | ${AGENCY.name}`;
load();
