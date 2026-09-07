/**
 * Builds the signed agreement as a real PDF, in the browser.
 *
 * Text is laid out from the same buildClauses() data the page renders, so the PDF
 * is selectable, searchable, and small - not a screenshot. jsPDF is pulled from a
 * CDN on demand rather than bundled, because this site has no build step.
 *
 * Every entry point here is best-effort by design: if the CDN is blocked or the
 * library throws, signing must still succeed and the email still goes out. The
 * PDF is a convenience, never the record.
 */

import {
  AGENCY, SIGNERS, buildClauses, money, longDate, priceBreakdown, referenceFor
} from './contract-model.js';

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

let loader = null;

/** Loads jsPDF once and resolves with the constructor. */
function loadJsPDF() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = JSPDF_URL;
    s.async = true;
    s.onload = () => {
      const ctor = window.jspdf?.jsPDF;
      ctor ? resolve(ctor) : reject(new Error('jsPDF loaded but exposed no constructor'));
    };
    s.onerror = () => reject(new Error('Could not load the PDF library'));
    document.head.appendChild(s);
  }).catch((err) => { loader = null; throw err; });

  return loader;
}

/* The letterhead mark, fetched once and kept as a data URL so the PDF letterhead
   matches the document on screen. Best-effort like everything else here: if it
   cannot be fetched the contract simply prints without it. */
let logoPromise = null;
function loadLogo() {
  if (logoPromise) return logoPromise;
  logoPromise = fetch(AGENCY.logo)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`logo ${r.status}`))))
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('logo unreadable'));
      reader.readAsDataURL(blob);
    }))
    .catch(() => null);
  return logoPromise;
}

/* Letter portrait, 12mm margins, in points. */
const PAGE = { w: 612, h: 792, margin: 32 };
const INK = [17, 17, 17];
const MUTED = [85, 85, 85];
const BRAND = [27, 98, 181];
const RULE = [205, 213, 222];

/**
 * @param {object} d
 * @param {object} opts
 * @param {string} opts.clientSignature  data:image/png;base64,... drawn signature
 * @param {string} opts.clientSignedAt   long-form date
 * @param {string} opts.typedName        name the customer typed
 * @returns {Promise<{blob:Blob, base64:string, filename:string}>}
 */
export async function buildPdf(d, opts = {}) {
  const JsPDF = await loadJsPDF();
  const { clientSignature = '', clientSignedAt = '', typedName = '' } = opts;

  const doc = new JsPDF({ unit: 'pt', format: 'letter', compress: true });
  const signer = SIGNERS[d.signerIndex] || SIGNERS[0];
  const clauses = buildClauses(d);
  const p = priceBreakdown(d);
  const reference = referenceFor(d);
  const agreementDate = longDate(d.agreementDate);
  const contentW = PAGE.w - PAGE.margin * 2;

  let y = PAGE.margin;

  /* ---- pagination helpers ------------------------------------------------ */
  const footer = () => {
    const n = doc.internal.getNumberOfPages();
    doc.setPage(n);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text(`${AGENCY.legalName} — Work Agreement · ${reference}`, PAGE.margin, PAGE.h - 22);
    doc.text(`Page ${n}`, PAGE.w - PAGE.margin, PAGE.h - 22, { align: 'right' });
  };

  const room = (need) => {
    if (y + need <= PAGE.h - 34) return;
    footer();
    doc.addPage();
    y = PAGE.margin;
  };

  /** Draws **bold** runs inline, wrapping across the content width. */
  const richText = (text, x, width, size, leading) => {
    const runs = String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => (
      part.startsWith('**') && part.endsWith('**')
        ? { t: part.slice(2, -2), bold: true }
        : { t: part, bold: false }
    ));

    doc.setFontSize(size).setTextColor(...INK);
    let cx = x;
    room(leading);

    for (const run of runs) {
      doc.setFont('helvetica', run.bold ? 'bold' : 'normal');
      // Split on spaces but keep them, so wrapping never welds two words together.
      for (const word of run.t.split(/(\s+)/)) {
        if (!word) continue;
        const w = doc.getTextWidth(word);
        if (cx + w > x + width && cx > x) {
          y += leading;
          room(leading);
          cx = x;
          if (/^\s+$/.test(word)) continue;   // no leading space on a fresh line
        }
        doc.text(word, cx, y);
        cx += w;
      }
    }
    y += leading;
  };

  /* ---- letterhead -------------------------------------------------------- */
  const mark = await loadLogo();
  let nameX = PAGE.margin;
  if (mark) {
    try {
      doc.addImage(mark, 'PNG', PAGE.margin, y - 2, 34, 34, undefined, 'FAST');
      nameX = PAGE.margin + 42;
    } catch (e) { /* a bad logo must not cost us the contract */ }
  }

  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...INK);
  doc.text(AGENCY.legalName, nameX, y + 18);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED);
  doc.text([AGENCY.site, AGENCY.email, AGENCY.phone], PAGE.w - PAGE.margin, y + 6, {
    align: 'right', lineHeightFactor: 1.5
  });

  /* Three 8pt contact lines at 1.5 spacing put the last baseline at y+30, so the
     rule has to clear that - at y+28 it struck straight through the phone number. */
  y += 40;
  doc.setDrawColor(...INK).setLineWidth(1.2).line(PAGE.margin, y, PAGE.w - PAGE.margin, y);
  y += 20;

  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...INK);
  doc.text('Work Agreement', PAGE.w / 2, y, { align: 'center' });
  y += 12;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...MUTED);
  doc.text(
    `${agreementDate ? `Dated ${agreementDate}` : 'Dated ________'} · Ref ${reference}`,
    PAGE.w / 2, y, { align: 'center' }
  );
  y += 18;

  /* ---- terms at a glance ------------------------------------------------- */
  const summary = [
    ['Customer', [d.clientName, d.clientContact && d.clientContact !== d.clientName ? `— ${d.clientContact}` : '']
      .filter(Boolean).join(' ') || '________'],
    ['Property', d.siteAddress || d.clientAddress || '________'],
    ['Price', p ? `${money(p.total, d.currency)}  (${money(p.base, d.currency)} plus HST at ${p.taxRate}%)` : '________'],
    ['Payment', p
      ? [p.deposit > 0 ? `${money(p.deposit, d.currency)} deposit on signing` : '',
         ...p.instalments.map((i) => `${money(i.value, d.currency)} ${i.label.toLowerCase()}`)]
        .filter(Boolean).join(', ')
      : '________'],
    ['Dates', (longDate(d.startDate) || longDate(d.completeDate))
      ? `${longDate(d.startDate) || '________'} to ${longDate(d.completeDate) || '________'}`
      : '________']
  ];

  const labelW = 96;
  for (const [label, value] of summary) {
    const lines = doc.setFont('helvetica', 'normal').setFontSize(9)
      .splitTextToSize(String(value), contentW - labelW - 10);
    const rowH = Math.max(13, lines.length * 10 + 4);
    room(rowH);

    doc.setDrawColor(...RULE).setLineWidth(0.5);
    doc.line(PAGE.margin, y - 9, PAGE.w - PAGE.margin, y - 9);
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...INK);
    doc.text(label, PAGE.margin, y);
    doc.setFont('helvetica', 'normal').setTextColor(...INK);
    doc.text(lines, PAGE.margin + labelW, y);
    y += rowH;
  }
  doc.setDrawColor(...RULE).line(PAGE.margin, y - 8, PAGE.w - PAGE.margin, y - 8);
  y += 10;

  /* ---- clauses ----------------------------------------------------------- */
  for (const c of clauses) {
    room(30);
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...INK);
    doc.text(`${c.n}. ${c.title}`, PAGE.margin, y);
    y += 13;

    for (const para of c.paras) {
      if (para.startsWith('- ')) {
        room(12);
        doc.setFont('helvetica', 'normal').setFontSize(8.8).setTextColor(...INK);
        doc.text('•', PAGE.margin + 8, y);
        richText(para.slice(2), PAGE.margin + 20, contentW - 20, 8.8, 10.6);
      } else {
        richText(para, PAGE.margin, contentW, 8.8, 10.6);
      }
      y += 1.5;
    }
    y += 6;
  }

  /* ---- signatures -------------------------------------------------------- */
  room(118);
  y += 8;
  doc.setDrawColor(...INK).setLineWidth(1.2).line(PAGE.margin, y, PAGE.w - PAGE.margin, y);
  y += 15;

  doc.setFont('helvetica', 'normal').setFontSize(8.8).setTextColor(...INK);
  doc.text('The parties agree to the terms above and have signed on the dates shown.', PAGE.margin, y);
  y += 20;

  const colW = (contentW - 34) / 2;
  const colX = [PAGE.margin, PAGE.margin + colW + 34];
  const top = y;

  const signatureBlock = (x, heading, image, name, title, date) => {
    let cy = top;
    doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...MUTED);
    doc.text(heading.toUpperCase(), x, cy);
    cy += 38;

    if (image) {
      try {
        // Fit inside the slot without distorting; the pad is 2:1 or wider.
        doc.addImage(image, 'PNG', x, cy - 33, Math.min(colW, 150), 33, undefined, 'FAST');
      } catch (e) { /* a corrupt data URL must not lose the whole PDF */ }
    }

    doc.setDrawColor(...INK).setLineWidth(0.8).line(x, cy, x + colW, cy);
    cy += 12;
    doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...INK);
    doc.text(String(name || ''), x, cy);
    cy += 11;
    if (title) {
      doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...MUTED);
      doc.text(String(title), x, cy);
      cy += 11;
    }
    cy += 12;
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...INK);
    doc.text(String(date || ' '), x, cy);
    cy += 4;
    doc.setDrawColor(...INK).setLineWidth(0.8).line(x, cy, x + colW, cy);
    cy += 10;
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text('DATE', x, cy);
    return cy;
  };

  const a = signatureBlock(colX[0], `For ${AGENCY.name}`, '', signer.name, signer.title, agreementDate);
  const b = signatureBlock(
    colX[1], `For ${d.clientName || 'the Customer'}`, clientSignature,
    typedName || d.clientContact || d.clientName, d.clientTitle, clientSignedAt
  );
  y = Math.max(a, b) + 20;

  if (clientSignature) {
    room(26);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text(
      `Signed electronically on ${clientSignedAt} by ${typedName}. ` +
      `An electronic signature has the same effect as a signature in ink.`,
      PAGE.margin, y
    );
  }

  footer();

  const who = String(d.clientName || 'agreement').replace(/[^A-Za-z0-9 \-]/g, '').trim() || 'agreement';
  const filename = `Seven Stones Work Agreement - ${who}${d.agreementDate ? ` - ${d.agreementDate}` : ''}.pdf`;

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  const base64 = String(dataUri).slice(String(dataUri).indexOf(',') + 1);

  return { blob, base64, filename };
}

/** Triggers a download of the built PDF. */
export async function downloadPdf(d, opts = {}) {
  const { blob, filename } = await buildPdf(d, opts);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
