/**
 * The agreement, rendered for screen and for print.
 * Used by /tools/contract/ (preview) and /sign/ (what the customer reads).
 *
 * Wording comes from contract-model.js so there is only ever one copy of it.
 * This module builds a DOM node rather than an HTML string, so nothing the
 * customer typed is ever concatenated into markup.
 */

import {
  SIGNERS, AGENCY, buildClauses, money, longDate, priceBreakdown,
  referenceFor, COOLING_OFF_DAYS
} from './contract-model.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/** Renders the **bold** convention used by the clause strings, as real nodes. */
function rich(target, text) {
  for (const part of String(text).split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      target.appendChild(el('strong', null, part.slice(2, -2)));
    } else {
      target.appendChild(document.createTextNode(part));
    }
  }
  return target;
}

/** Paragraph strings, honouring the "- " list convention. */
function paragraphs(paras) {
  const frag = document.createDocumentFragment();
  let list = null;

  for (const para of paras) {
    if (para.startsWith('- ')) {
      if (!list) { list = el('ul', 'doc-list'); frag.appendChild(list); }
      rich(list.appendChild(el('li')), para.slice(2));
    } else {
      list = null;
      rich(frag.appendChild(el('p')), para);
    }
  }
  return frag;
}

function signatureSlot(image, placeholder) {
  const wrap = el('div', 'sig-slot');
  if (image) {
    const img = el('img');
    img.src = image;
    img.alt = 'Signature';
    wrap.appendChild(img);
  } else {
    wrap.appendChild(el('span', 'sig-placeholder', placeholder));
  }
  return wrap;
}

/**
 * @param {object}  d               contract data
 * @param {object}  opts
 * @param {string}  opts.repSignature     drawn signature for Seven Stones, if any
 * @param {string}  opts.clientSignature  drawn signature for the customer, if any
 * @param {string}  opts.clientSignedAt   long-form date the customer signed
 * @returns {HTMLElement}
 */
export function renderDocument(d, opts = {}) {
  const { repSignature = '', clientSignature = '', clientSignedAt = '' } = opts;

  const signer = SIGNERS[d.signerIndex] || SIGNERS[0];
  const clauses = buildClauses(d);
  const agreementDate = longDate(d.agreementDate);
  const p = priceBreakdown(d);
  const reference = referenceFor(d);

  const sheet = el('article', 'sheet');

  /* ---------- letterhead ---------- */
  const head = el('header', 'sheet-head');
  const brand = el('div', 'sheet-brand');
  const logo = el('img', 'sheet-logo');
  logo.src = AGENCY.logo;
  logo.alt = '';
  brand.appendChild(logo);
  const brandText = el('div');
  brandText.appendChild(el('div', 'sheet-name', AGENCY.legalName));
  brandText.appendChild(el('div', 'sheet-tag', 'ICPI-Certified Hardscape'));
  brand.appendChild(brandText);
  head.appendChild(brand);

  const contact = el('div', 'sheet-contact');
  for (const line of [AGENCY.site, AGENCY.email, AGENCY.phone]) {
    contact.appendChild(el('div', null, line));
  }
  head.appendChild(contact);
  sheet.appendChild(head);

  sheet.appendChild(el('h1', 'sheet-title', 'Work Agreement'));
  sheet.appendChild(el(
    'p', 'sheet-sub',
    `${agreementDate ? `Dated ${agreementDate}` : 'Dated ________________'} · Ref ${reference}`
  ));

  /* ---------- terms at a glance ---------- */
  const table = el('table', 'sheet-summary');
  const tbody = el('tbody');

  const row = (label, build) => {
    const tr = el('tr');
    tr.appendChild(el('th', null, label));
    const td = el('td');
    build(td);
    tr.appendChild(td);
    tbody.appendChild(tr);
  };

  row('Customer', (td) => {
    td.appendChild(el('strong', null, d.clientName || '________________'));
    if (d.clientContact && d.clientContact !== d.clientName) {
      td.appendChild(document.createTextNode(` — ${d.clientContact}`));
    }
    const sub = [d.clientEmail, d.clientPhone].filter(Boolean).join(' · ');
    if (sub) td.appendChild(el('div', 'muted', sub));
  });

  row('Property', (td) => {
    td.appendChild(document.createTextNode(d.siteAddress || d.clientAddress || '________________'));
  });

  row('Price', (td) => {
    if (!p) { td.appendChild(document.createTextNode('________________')); return; }
    td.appendChild(el('strong', null, money(p.total, d.currency)));
    td.appendChild(el('div', 'muted',
      `${money(p.base, d.currency)} plus HST at ${p.taxRate}% (${money(p.tax, d.currency)})`));
  });

  row('Payment', (td) => {
    if (!p) { td.appendChild(document.createTextNode('________________')); return; }
    const parts = [];
    if (p.deposit > 0) parts.push(`${money(p.deposit, d.currency)} deposit on signing`);
    for (const i of p.instalments) parts.push(`${money(i.value, d.currency)} ${i.label.toLowerCase()}`);
    td.appendChild(document.createTextNode(parts.join(', ')));
  });

  row('Dates', (td) => {
    const s = longDate(d.startDate);
    const c = longDate(d.completeDate);
    td.appendChild(document.createTextNode(
      s || c ? `${s || '________'} to ${c || '________'}` : '________________'
    ));
  });

  table.appendChild(tbody);
  sheet.appendChild(table);

  /* ---------- the cancellation notice, up front where it belongs ---------- */
  const notice = el('div', 'sheet-notice');
  notice.appendChild(el('strong', null, 'Your right to cancel. '));
  notice.appendChild(document.createTextNode(
    `This is a direct agreement under Ontario's Consumer Protection Act, 2002. You may cancel it for any ` +
    `reason within ${COOLING_OFF_DAYS} days of receiving your written copy. See clause ` +
    `${clauses.findIndex((c) => c.title === 'Your Right to Cancel') + 1}.`
  ));
  sheet.appendChild(notice);

  /* ---------- clauses ---------- */
  for (const c of clauses) {
    const section = el('section', 'clause');
    section.appendChild(el('h2', null, `${c.n}. ${c.title}`));
    const bodyWrap = el('div', 'clause-body');
    bodyWrap.appendChild(paragraphs(c.paras));
    section.appendChild(bodyWrap);
    sheet.appendChild(section);
  }

  /* ---------- signatures ---------- */
  const sigs = el('section', 'sheet-sigs');
  sigs.appendChild(el('p', 'sheet-sigs-lead',
    'The parties agree to the terms above and have signed on the dates shown.'));

  const grid = el('div', 'sig-grid');

  const block = (heading, image, placeholder, name, title, date) => {
    const b = el('div', 'sig-block');
    b.appendChild(el('div', 'sig-head', heading));
    b.appendChild(signatureSlot(image, placeholder));
    b.appendChild(el('div', 'sig-rule'));
    b.appendChild(el('div', 'sig-name', name));
    if (title) b.appendChild(el('div', 'sig-title', title));
    const dateWrap = el('div', 'sig-date');
    dateWrap.appendChild(el('div', 'sig-date-value', date || ' '));
    dateWrap.appendChild(el('div', 'sig-rule'));
    dateWrap.appendChild(el('div', 'sig-date-label', 'Date'));
    b.appendChild(dateWrap);
    return b;
  };

  grid.appendChild(block(
    `For ${AGENCY.name}`, repSignature, '(signature)',
    signer.name, signer.title, agreementDate
  ));
  grid.appendChild(block(
    `For ${d.clientName || 'the Customer'}`, clientSignature, '(signature)',
    d.clientContact || d.clientName || 'Print name',
    d.clientTitle || '', clientSignedAt
  ));

  sigs.appendChild(grid);
  sheet.appendChild(sigs);

  const footer = el('footer', 'sheet-foot');
  footer.appendChild(el('span', null, `${AGENCY.legalName} — Work Agreement`));
  footer.appendChild(el('span', null,
    `${d.clientName || 'Customer'}${agreementDate ? ` · ${agreementDate}` : ''} · ${reference}`));
  sheet.appendChild(footer);

  return sheet;
}

/** Shared stylesheet for the rendered document, on screen and in print. */
export const DOCUMENT_CSS = `
.sheet{background:#fff;color:#111;padding:38px 42px 30px;font-size:10.5pt;line-height:1.55;}
.sheet-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;
  border-bottom:2px solid #111;padding-bottom:14px;}
.sheet-brand{display:flex;align-items:center;gap:12px;}
.sheet-logo{width:52px;height:52px;object-fit:contain;}
.sheet-name{font-size:13pt;font-weight:800;letter-spacing:-.01em;line-height:1.1;}
.sheet-tag{margin-top:3px;font-size:7.5pt;font-weight:700;text-transform:uppercase;
  letter-spacing:.2em;color:#1B62B5;}
.sheet-contact{text-align:right;font-size:8pt;line-height:1.6;color:#333;}
.sheet-title{text-align:center;font-size:16pt;font-weight:800;letter-spacing:-.01em;margin:18px 0 2px;}
.sheet-sub{text-align:center;font-size:9pt;color:#555;margin:0 0 18px;}
.sheet-summary{width:100%;border-collapse:collapse;border:1px solid #ddd;font-size:9.5pt;margin-bottom:16px;}
.sheet-summary th{width:150px;background:#f7f7f7;padding:7px 10px;text-align:left;vertical-align:top;
  font-weight:700;border-bottom:1px solid #ddd;}
.sheet-summary td{padding:7px 10px;vertical-align:top;border-bottom:1px solid #ddd;}
.sheet-summary tr:last-child th,.sheet-summary tr:last-child td{border-bottom:0;}
.sheet-summary .muted{color:#555;font-size:9pt;margin-top:2px;}
.sheet-notice{border:1px solid #BDD4EA;border-left:3px solid #1B62B5;background:#E4EEF7;
  padding:10px 12px;font-size:9pt;line-height:1.6;color:#1a3350;margin-bottom:18px;}
.clause{margin-bottom:14px;break-inside:avoid;}
.clause h2{font-size:11.5pt;font-weight:700;margin:0 0 3px;}
.clause-body p{margin:5px 0;}
.clause-body .doc-list{margin:5px 0 5px 18px;padding:0;}
.clause-body .doc-list li{margin:3px 0;}
.sheet-sigs{margin-top:26px;border-top:2px solid #111;padding-top:16px;break-inside:avoid;}
.sheet-sigs-lead{font-size:9.5pt;margin:0 0 18px;}
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;}
.sig-head{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.15em;
  color:#555;margin-bottom:6px;}
.sig-slot{height:60px;display:flex;align-items:flex-end;}
.sig-slot img{max-height:58px;max-width:100%;object-fit:contain;object-position:left bottom;}
.sig-placeholder{font-size:8pt;font-style:italic;color:#999;}
.sig-rule{border-bottom:1px solid #111;}
.sig-name{font-size:9.5pt;font-weight:700;margin-top:5px;}
.sig-title{font-size:8.5pt;color:#555;}
.sig-date{margin-top:16px;}
.sig-date-value{font-size:9.5pt;min-height:14px;}
.sig-date-label{font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:#555;margin-top:3px;}
.sheet-foot{margin-top:26px;border-top:1px solid #ddd;padding-top:10px;display:flex;
  justify-content:space-between;gap:16px;font-size:7.5pt;color:#777;}
/* A long email or an unbroken address must wrap rather than widen the sheet;
   nothing here may cause the page to scroll sideways on a phone. */
.sheet-summary td,.sheet-summary th,.clause-body{overflow-wrap:anywhere;}
@media (max-width:680px){
  .sheet{padding:22px 18px;}
  .sheet-head{flex-direction:column;}
  .sheet-contact{text-align:left;}
  .sig-grid{grid-template-columns:1fr;gap:26px;}
  .sheet-summary th{width:88px;}
  .sheet-summary th,.sheet-summary td{padding:6px 8px;font-size:9pt;}
  .sheet-title{font-size:15pt;}
  .clause h2{font-size:11pt;}
}
`;
