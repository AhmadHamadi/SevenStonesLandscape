/**
 * The signing page: /sign/<customer-slug>/?a=<token>
 *
 * Lives under /tools/contract/ rather than /sign/ on purpose: the vercel.json
 * rewrite /sign/(.*) -> /sign/index.html would otherwise also match this file's
 * own URL, and the page would try to load itself as its script.
 *
 * The whole agreement rides in the ?a= token, so this page needs no database and
 * no lookup - it decodes, renders, and takes a signature. On submit it builds the
 * PDF in the browser and posts it with the signature to /api/sign, which emails a
 * copy to the customer and to the office.
 */

import {
  decodeContract, AGENCY, longDate, todayISO, referenceFor, COOLING_OFF_DAYS,
  linkExpiry, LINK_EXPIRY_HOURS
} from './contract-model.js';
import { renderDocument, DOCUMENT_CSS } from './document.js';
import { buildPdf } from './pdf.js';

const $ = (id) => document.getElementById(id);
const app = $('app');

const style = document.createElement('style');
style.textContent = DOCUMENT_CSS;
document.head.appendChild(style);

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/* ------------------------------------------------------------------
   Decode
   ------------------------------------------------------------------ */
function fail(title, message, withPhone = true) {
  app.textContent = '';
  const box = el('div', 'state');
  box.appendChild(el('h1', null, title));
  box.appendChild(el('p', null, message));
  if (withPhone) {
    const p = el('p');
    p.appendChild(document.createTextNode('Call us on '));
    const a = el('a', null, AGENCY.phone);
    a.href = `tel:+1${AGENCY.phone.replace(/\D/g, '')}`;
    p.appendChild(a);
    p.appendChild(document.createTextNode(' and we will send you a fresh link.'));
    box.appendChild(p);
  }
  app.appendChild(box);
}

const token = new URLSearchParams(window.location.search).get('a');
if (!token) {
  fail('This link is missing its agreement',
    'The signing link looks incomplete. It may have been cut in half by your email app.');
  throw new Error('no token');
}

let d;
try {
  d = decodeContract(token);
} catch (err) {
  fail('We could not read this link',
    'The agreement in this link could not be opened. It may have been truncated in transit.');
  throw err;
}

const expiry = linkExpiry(d);
if (expiry.expired) {
  fail('This signing link has expired',
    `Signing links are good for ${LINK_EXPIRY_HOURS} hours. This one has run out, so it can no ` +
    'longer be signed.');
  throw new Error('link expired');
}

const reference = referenceFor(d);

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */
$('topbar').hidden = false;
$('topName').textContent = d.clientName || 'Your agreement';
$('topRef').textContent = reference;
document.title = `Sign your agreement | ${AGENCY.name}`;

app.textContent = '';

const lead = el('div', 'lead');
lead.appendChild(el('h1', null,
  `${String(d.clientContact || d.clientName || '').trim().split(/\s+/)[0] || 'Hello'}, here is your agreement to sign`));
lead.appendChild(el('p', null,
  'Have a read through, then sign at the bottom. It takes about a minute, and a copy comes to you by ' +
  'email the moment you are done.'));
const rights = el('div', 'rights');
rights.appendChild(el('strong', null, 'You are not locked in. '));
rights.appendChild(document.createTextNode(
  `Because we signed this at your place rather than ours, you can cancel for any reason within ` +
  `${COOLING_OFF_DAYS} days of getting your copy, and any deposit comes back within 15 days.`));
lead.appendChild(rights);
app.appendChild(lead);

const paper = el('div', 'paper');
paper.appendChild(renderDocument(d));
app.appendChild(paper);

/* ------------------------------------------------------------------
   Signature pad
   ------------------------------------------------------------------ */
const box = el('div', 'signbox');
box.id = 'signbox';
box.appendChild(el('h2', null, 'Sign here'));
box.appendChild(el('p', 'sub', 'Use your finger on a phone, or your mouse on a computer.'));

const padLabel = el('div', 'pad-label');
padLabel.appendChild(el('span', null, 'Your signature'));
const clearBtn = el('button', null, 'Clear');
clearBtn.type = 'button';
padLabel.appendChild(clearBtn);
box.appendChild(padLabel);

const padwrap = el('div', 'padwrap');
const canvas = el('canvas', 'pad');
canvas.setAttribute('aria-label', 'Signature pad');
padwrap.appendChild(canvas);
padwrap.appendChild(el('span', 'padhint', 'Sign here'));
box.appendChild(padwrap);
const sigErr = el('div', 'err-msg');
sigErr.hidden = true;
box.appendChild(sigErr);

const nameField = el('div', 'f');
const nameLabel = el('label', null, 'Type your full name');
nameLabel.setAttribute('for', 'typedName');
const nameInput = el('input');
nameInput.type = 'text';
nameInput.id = 'typedName';
nameInput.autocomplete = 'name';
nameInput.value = d.clientContact || d.clientName || '';
nameField.append(nameLabel, nameInput);
const nameErr = el('div', 'err-msg');
nameErr.hidden = true;
nameField.appendChild(nameErr);
box.appendChild(nameField);

const agreeWrap = el('label', 'agree');
const agreeBox = el('input');
agreeBox.type = 'checkbox';
agreeWrap.appendChild(agreeBox);
agreeWrap.appendChild(document.createTextNode(
  'I have read this agreement, I agree to its terms, and I am authorised to sign it.'));
box.appendChild(agreeWrap);
const agreeErr = el('div', 'err-msg');
agreeErr.hidden = true;
box.appendChild(agreeErr);

const submit = el('button', 'submit', 'Sign and send');
submit.type = 'button';
box.appendChild(submit);

const sendFail = el('div', 'sendfail');
sendFail.hidden = true;
box.appendChild(sendFail);

app.appendChild(box);

const foot = el('div', 'footnote');
foot.appendChild(document.createTextNode(`${AGENCY.legalName} · `));
const footTel = el('a', null, AGENCY.phone);
footTel.href = `tel:+1${AGENCY.phone.replace(/\D/g, '')}`;
foot.appendChild(footTel);
foot.appendChild(document.createTextNode(' · '));
const footMail = el('a', null, AGENCY.email);
footMail.href = `mailto:${AGENCY.email}`;
foot.appendChild(footMail);
app.appendChild(foot);

/* ---- pad mechanics ----------------------------------------------------- */
const ctx = canvas.getContext('2d');
let drawing = false;
let inked = false;

function sizePad() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  // Re-sizing clears the bitmap, so keep what was drawn and put it back.
  const previous = inked ? canvas.toDataURL('image/png') : '';

  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#15202E';

  if (previous) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = previous;
  }
}

const point = (e) => {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};

canvas.addEventListener('pointerdown', (e) => {
  drawing = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
  const p = point(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  // A tap with no drag should still leave a mark.
  ctx.lineTo(p.x + 0.01, p.y);
  ctx.stroke();
  e.preventDefault();
});

canvas.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const p = point(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  if (!inked) { inked = true; padwrap.classList.add('inked'); }
  e.preventDefault();
});

const endStroke = () => {
  if (!drawing) return;
  drawing = false;
  if (!inked) { inked = true; padwrap.classList.add('inked'); }
  padwrap.classList.remove('err');
  sigErr.hidden = true;
};
canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);
canvas.addEventListener('pointerleave', endStroke);

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  inked = false;
  padwrap.classList.remove('inked');
});

sizePad();
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(sizePad, 180);
});

$('jump').addEventListener('click', () => {
  document.getElementById('signbox').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ------------------------------------------------------------------
   Submit
   ------------------------------------------------------------------ */
submit.addEventListener('click', async () => {
  let bad = false;

  if (!inked) {
    sigErr.textContent = 'Please sign in the box above.';
    sigErr.hidden = false;
    padwrap.classList.add('err');
    bad = true;
  }
  if (nameInput.value.trim().length < 2) {
    nameErr.textContent = 'Please type your full name.';
    nameErr.hidden = false;
    nameInput.classList.add('err');
    bad = true;
  } else {
    nameErr.hidden = true;
    nameInput.classList.remove('err');
  }
  if (!agreeBox.checked) {
    agreeErr.textContent = 'Please confirm you have read and agree to the terms.';
    agreeErr.hidden = false;
    bad = true;
  } else {
    agreeErr.hidden = true;
  }
  if (bad) return;

  submit.disabled = true;
  submit.textContent = 'Sending…';
  sendFail.hidden = true;

  const signature = canvas.toDataURL('image/png');
  const signedAt = todayISO();
  const signedAtLong = longDate(signedAt);
  const typedName = nameInput.value.trim();

  // Best effort: a browser that cannot build the PDF still gets to sign.
  let pdf = null;
  try {
    pdf = await buildPdf(d, { clientSignature: signature, clientSignedAt: signedAtLong, typedName });
  } catch (err) {
    console.warn('[sign] PDF build failed, sending without it:', err?.message || err);
  }

  try {
    /* Trailing slash on purpose: vercel.json sets trailingSlash, so /api/sign
       308s to /api/sign/ and the browser re-uploads the whole body -- signature
       and PDF included -- a second time. Posting to the settled URL skips that. */
    const res = await fetch('/api/sign/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        signature,
        typedName,
        signedAt,
        reference,
        pdfBase64: pdf?.base64 || '',
        pdfFilename: pdf?.filename || ''
      })
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || 'We could not send the signed copy.');
    }

    done(pdf);
  } catch (err) {
    submit.disabled = false;
    submit.textContent = 'Try again';
    sendFail.textContent =
      `${err.message || 'Something went wrong sending that.'} ` +
      `Your signature has not been sent — please call ${AGENCY.phone} and we will finish it with you.`;
    sendFail.hidden = false;
  }
});

function done(pdf) {
  app.textContent = '';
  $('topbar').hidden = true;

  const box = el('div', 'state done');
  box.appendChild(el('h1', null, 'Signed. Thank you.'));
  box.appendChild(el('p', null,
    `A copy of the signed agreement is on its way to ${d.clientEmail || 'your email'}${
      pdf ? ', with the PDF attached' : ''}. We have a copy too.`));
  box.appendChild(el('p', null,
    `Remember you can cancel for any reason within ${COOLING_OFF_DAYS} days. ` +
    `Just reply to that email or call us.`));

  if (pdf) {
    const dl = el('p');
    const a = el('a', null, 'Download your copy now');
    a.href = URL.createObjectURL(pdf.blob);
    a.download = pdf.filename;
    dl.appendChild(a);
    box.appendChild(dl);
  }

  const call = el('p');
  call.appendChild(document.createTextNode(`${AGENCY.legalName} · `));
  const tel = el('a', null, AGENCY.phone);
  tel.href = `tel:+1${AGENCY.phone.replace(/\D/g, '')}`;
  call.appendChild(tel);
  box.appendChild(call);

  app.appendChild(box);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
