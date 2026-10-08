/**
 * Single source of truth for the Seven Stones Landscape Work Agreement.
 *
 * Imported by four places that must never disagree:
 *   tools/contract/contract.js   - the creator page John fills in
 *   tools/contract/document.js   - the rendered document, shown on both pages
 *   sign/sign.js                 - the page the customer opens to sign
 *   api/sign.js                  - the email both parties receive afterwards
 *
 * Plain ES module with no dependencies and no build step, so the browser loads it
 * with <script type="module"> and the Vercel function imports it directly. The
 * rest of this site is hand-written static HTML; adding a bundler for two pages
 * would have put all 213 existing pages behind a build.
 *
 * Clause bodies are plain strings with **bold** markers rather than markup, so the
 * same wording renders to the screen, to an HTML email, and to plain text without
 * three copies drifting apart.
 *
 * The generated agreement currently contains the work description and price/payment
 * schedule. Keep the shared renderers and link codec in sync when changing it.
 */

export const SIGNERS = [
  { name: 'John Scime', title: 'On behalf of Seven Stones Landscape' },
  { name: 'Riaad Hamadi', title: 'On behalf of Seven Stones Landscape' }
];

/** How the customer pays. Cash is a real option on a job this size, so it is listed. */
export const PAYMENT_METHODS = [
  'E-transfer',
  'Cheque',
  'Cash',
  'Cash or e-transfer',
  'E-transfer, cheque or cash',
  'Credit card'
];

/** Common deposit sizes, so the usual case is one click rather than typing. */
export const DEPOSIT_PRESETS = [0, 10, 15, 20, 25, 30, 50];

/** A signing link is good for this long. Short enough that a stale link cannot be
 *  signed months later against a price that has moved; long enough for a weekend. */
export const LINK_EXPIRY_HOURS = 48;

/** How the balance is split after the deposit. Mirrors tools/estimate-contract/. */
export const PAYMENT_PLANS = [
  { id: 'startComplete', label: 'Two payments: start and completion' },
  { id: 'completion',    label: 'Full balance on completion' }
];

export const AGENCY = {
  name: 'Seven Stones Landscape',
  legalName: 'Seven Stones Landscape & Hardscape',
  email: 'info@sevenstoneslandscape.ca',
  phone: '(289) 700-0312',
  site: 'sevenstoneslandscape.ca',
  // The apex domain 301s to www in vercel.json. Signing links must be built on the
  // canonical host so the ?a= token never rides through a redirect.
  origin: 'https://www.sevenstoneslandscape.ca',
  address: 'Mount Hope, Ontario',
  logo: '/assets/images/logo.png'
};

/** Ontario CPA s.10 caps an estimate overrun at 10%. Stated here so it is set once. */
export const ESTIMATE_OVERRUN_CAP = 10;

/** Days to cancel a direct agreement for any reason under CPA s.43. */
export const COOLING_OFF_DAYS = 10;

export const DEFAULTS = {
  clientName: '',
  clientContact: '',
  clientTitle: 'Homeowner',
  siteAddress: '',
  clientEmail: '',
  clientPhone: '',

  agreementDate: '',
  startDate: '',
  completeDate: '',
  includeAgreementDate: false,
  includeStartDate: false,
  includeCompleteDate: false,
  currency: 'CAD',

  projectPrice: '',
  taxRate: 13,
  depositPercent: 10,
  paymentPlan: 'startComplete',
  paymentMethod: 'E-transfer, cheque or cash',
  issuedAt: 0,
  nonce: '',

  scope: '',
  exclusions: '',

  signerIndex: 0,
  signatureData: ''           // never encoded into a link, see packContract
};

/* ============================================================
   FORMATTING
   ============================================================ */

/** Formats a fee. Returns null only when absent or unparseable - a deliberate $0
 *  still renders, because a waived charge is a real term. */
export function money(value, currency = 'CAD') {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  // Catch the sign before stripping it: "-5000" cleans to "5000", which would put a
  // positive number on the contract for a negative input and hide the mistake.
  if (/^-/.test(raw)) return null;
  const cleaned = raw.replace(/[^0-9.]/g, '');
  // Stripping non-numerics turns "abc" into "", and Number("") is 0 - which would
  // silently print a $0.00 price into a contract. Require a real digit.
  if (!/\d/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(n);
}

/** Raw number behind a money field, or null. Used for the payment arithmetic. */
export function amount(value) {
  const trimmed = String(value ?? '').trim();
  if (/^-/.test(trimmed)) return null;   // same trap as money(); see above
  const raw = trimmed.replace(/[^0-9.]/g, '');
  if (!/\d/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Parses yyyy-mm-dd as a local date, so the day never shifts a timezone. */
export function longDate(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'agreement';
}

/* ============================================================
   THE MONEY
   One function so the creator page, the document, the signing page and the
   email can never show the customer four different payment schedules.
   ============================================================ */
export function priceBreakdown(d) {
  const base = amount(d.projectPrice);
  if (base === null) return null;

  const rate = Number(d.taxRate);
  const taxRate = Number.isFinite(rate) && rate >= 0 ? rate : 0;
  const tax = round2(base * taxRate / 100);
  const total = round2(base + tax);

  const depPct = Number(d.depositPercent);
  const depositPercent = Number.isFinite(depPct) && depPct >= 0 && depPct <= 100 ? depPct : 0;
  const deposit = round2(total * depositPercent / 100);
  const balance = round2(total - deposit);

  // Split the balance so the parts always re-add to the total exactly; the last
  // instalment absorbs the rounding remainder rather than leaving a stray cent.
  let instalments;
  if (d.paymentPlan === 'completion') {
    instalments = [{ label: 'On completion', value: balance }];
  } else {
    const a = round2(balance / 2);
    instalments = [
      { label: 'On start', value: a },
      { label: 'On completion', value: round2(balance - a) }
    ];
  }

  const cap = round2(total * (1 + ESTIMATE_OVERRUN_CAP / 100));
  return { base, taxRate, tax, total, depositPercent, deposit, balance, instalments, cap };
}

/* ============================================================
   LINK CODEC
   The agreement travels inside the signing link, so there is no database to keep
   in sync and no record to go stale. Keys are one or two characters to keep the
   URL short. The drawn signature is deliberately left out - far too large for a
   URL, and the countersignature is attested by name and date on the signing page.
   ============================================================ */

const PACK_KEYS = [
  ['clientName', 'n'], ['clientContact', 'c'], ['clientTitle', 't'],
  ['clientAddress', 'a'], ['siteAddress', 'sa'], ['clientEmail', 'e'], ['clientPhone', 'p'],
  ['agreementDate', 'ad'], ['startDate', 'sd'], ['completeDate', 'cd'], ['currency', 'cu'],
  ['includeAgreementDate', 'iad'], ['includeStartDate', 'isd'], ['includeCompleteDate', 'icd'],
  ['projectPrice', 'pp'], ['taxRate', 'tr'], ['depositPercent', 'dp'], ['paymentPlan', 'pl'],
  ['paymentMethod', 'pm'], ['issuedAt', 'ia'], ['nonce', 'nc'],
  ['scope', 'sc'], ['exclusions', 'ex'],
  ['signerIndex', 'si']
];

function utf8ToBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  // Chunked so a long scope cannot blow the argument limit on apply().
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  const b64 = typeof btoa === 'function'
    ? btoa(bin)
    : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUtf8(s) {
  const b64 = String(s).replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = typeof atob === 'function'
    ? atob(b64 + pad)
    : Buffer.from(b64 + pad, 'base64').toString('binary');
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function packContract(d) {
  const out = {};
  for (const [full, short] of PACK_KEYS) {
    let v = d[full];
    // Drop anything absent or empty; unpack rebuilds it from DEFAULTS.
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    out[short] = v;
  }
  return out;
}

export function unpackContract(packed) {
  const d = { ...DEFAULTS };
  for (const [full, short] of PACK_KEYS) {
    if (packed[short] !== undefined) d[full] = packed[short];
  }
  // Older signing links predate the include-date checkboxes; preserve their dates.
  if (packed.iad === undefined) d.includeAgreementDate = Boolean(d.agreementDate);
  if (packed.isd === undefined) d.includeStartDate = Boolean(d.startDate);
  if (packed.icd === undefined) d.includeCompleteDate = Boolean(d.completeDate);
  d.signerIndex = Number(d.signerIndex) || 0;
  // A tampered or truncated numeric must not silently become 0 and change the money.
  const tr = Number(d.taxRate);
  d.taxRate = Number.isFinite(tr) && tr >= 0 && tr <= 100 ? tr : DEFAULTS.taxRate;
  const dp = Number(d.depositPercent);
  d.depositPercent = Number.isFinite(dp) && dp >= 0 && dp <= 100 ? dp : DEFAULTS.depositPercent;
  if (!SIGNERS[d.signerIndex]) d.signerIndex = DEFAULTS.signerIndex;
  if (!PAYMENT_PLANS.some((p) => p.id === d.paymentPlan)) d.paymentPlan = DEFAULTS.paymentPlan;
  if (!PAYMENT_METHODS.includes(d.paymentMethod)) d.paymentMethod = DEFAULTS.paymentMethod;
  const ia = Number(d.issuedAt);
  d.issuedAt = Number.isFinite(ia) && ia > 0 ? ia : 0;
  return d;
}

export function encodeContract(d) {
  return utf8ToBase64Url(JSON.stringify(packContract(d)));
}

export function decodeContract(token) {
  const parsed = JSON.parse(base64UrlToUtf8(token));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Malformed agreement token');
  }
  return unpackContract(parsed);
}

/**
 * Builds the signing link for one customer.
 *
 * Stamped with the moment it was made, so it can expire. That timestamp also
 * makes every link unique even when two customers somehow have identical
 * details - no two people ever share a link.
 */
export function signingUrl(d, origin = AGENCY.origin) {
  const stamped = {
    ...d,
    issuedAt: Math.floor(Date.now() / 1000),
    // Second-resolution stamps collide if two links are made in the same second;
    // the nonce makes every issued link distinct regardless.
    nonce: Math.random().toString(36).slice(2, 8)
  };
  // trailingSlash is on in vercel.json, so emit the slash rather than let a 308 rewrite it.
  return `${origin}/sign/${slugify(d.clientName)}/?a=${encodeContract(stamped)}`;
}

/**
 * How much life is left in a signing link.
 *
 * A link with no stamp is treated as still valid: those were issued before
 * expiry existed, and refusing them would be a worse failure than honouring
 * them. Everything issued from now on carries a stamp.
 */
export function linkExpiry(d, now = Date.now()) {
  const issuedAt = Number(d && d.issuedAt) || 0;
  if (!issuedAt) return { stamped: false, expired: false, expiresAt: null, hoursLeft: null };

  const expiresAt = (issuedAt + LINK_EXPIRY_HOURS * 3600) * 1000;
  const msLeft = expiresAt - now;
  return {
    stamped: true,
    expired: msLeft <= 0,
    expiresAt: new Date(expiresAt),
    hoursLeft: Math.max(0, Math.ceil(msLeft / 3600000))
  };
}

/** Stable reference shown on the document, the email, and the archive row. */
export function referenceFor(d) {
  const slug = slugify(d.clientName).toUpperCase().replace(/-/g, '').slice(0, 6);
  const date = String(d.agreementDate || '').replace(/-/g, '').slice(2) || '000000';
  return `SSL-${slug || 'AGREE'}-${date}`;
}

/* ============================================================
   THE AGREEMENT ITSELF
   ============================================================ */

const BLANK = '________________';

/**
 * Builds the numbered clauses. Paragraph strings may contain **bold** runs and
 * "- " list lines; every renderer understands those two conventions and nothing
 * else, which keeps screen, email, and plain text identical.
 */
export function buildClauses(d) {
  const p = priceBreakdown(d);

  const startOn = d.includeStartDate ? longDate(d.startDate) : '';
  const finishOn = d.includeCompleteDate ? longDate(d.completeDate) : '';

  const clauses = [];
  const add = (title, paras) => clauses.push({ n: clauses.length + 1, title, paras });

  /* 1. THE WORK -------------------------------------------------------- */
  /* One description, typed on the creator page. Each line becomes a bullet, so
     John writes the job the way he would on the paper pad and it lays out. */
  const described = String(d.scope || '').trim().split(/\n+/)
    .map((l) => l.trim()).filter(Boolean);

  add('The Work', [
    ...(described.length ? described : [BLANK]),
    ...(String(d.exclusions || '').trim()
      ? ['**Not included:** ' + String(d.exclusions).trim().split(/\n+/)
          .map((l) => l.trim()).filter(Boolean).join('; ') + '.']
      : []),
    ...(startOn ? [`Work starts **${startOn}**, weather and ground conditions permitting.`] : []),
    ...(finishOn ? [`Substantial completion is expected by **${finishOn}**, weather and ground conditions permitting.`] : [])
  ]);

  /* 2. PRICE AND PAYMENT ----------------------------------------------- */
  const lines = [];
  if (p) {
    lines.push(`- **Total: ${money(p.total, d.currency)}**`);
    if (p.deposit > 0) {
      lines.push(`- Deposit: **${money(p.deposit, d.currency)}** (${p.depositPercent}%) on signing`);
    }
    p.instalments.slice(0, 2).forEach((i, index) => {
      lines.push(`- ${index === 0 ? 'First payment' : 'Second payment'}: **${money(i.value, d.currency)}** ${i.label.toLowerCase()}`);
    });
  } else {
    lines.push(`- Price ${BLANK}`);
  }
  if (String(d.paymentMethod || '').trim()) {
    lines.push(`Payable by **${d.paymentMethod}**.`);
  }
  add('Price and Payment', lines);

  return clauses;
}

/** What is still missing before this agreement can go out. */
export function contractGaps(d) {
  const gaps = [];
  if (!String(d.clientName).trim())    gaps.push('Customer name');
  if (!String(d.clientEmail).trim())   gaps.push('Customer email (needed to send it)');
  if (!String(d.siteAddress).trim()) gaps.push('Property address');
  if (priceBreakdown(d) === null)      gaps.push('Price for the work');
  if (!String(d.scope).trim())         gaps.push('Description of the work');
  if (d.includeAgreementDate && !d.agreementDate) gaps.push('Agreement date');
  if (d.includeStartDate && !d.startDate) gaps.push('Start date');
  if (d.includeCompleteDate && !d.completeDate) gaps.push('Completion date');
  return gaps;
}

/* ============================================================
   THE COVERING EMAIL
   Written out in full so it can be copied straight into a mail client.
   ============================================================ */
export function coveringEmail(d, url) {
  const signer = SIGNERS[d.signerIndex] || SIGNERS[0];
  const p = priceBreakdown(d);
  const who = d.clientName || '[Customer]';
  const first = String(d.clientContact || d.clientName || '').trim().split(/\s+/)[0] || 'there';

  const subject = `Your Seven Stones agreement - ${who}`;

  const moneyLines = p
    ? [
        `- Total: ${money(p.total, d.currency)}.`,
        ...(p.deposit > 0 ? [`- Deposit: ${money(p.deposit, d.currency)} on signing.`] : []),
        ...p.instalments.slice(0, 2).map((i, index) =>
          `- ${index === 0 ? 'First payment' : 'Second payment'}: ${money(i.value, d.currency)} ${i.label.toLowerCase()}.`)
      ]
    : ['- Price: [to be filled in]'];

  const body = [
    `Hi ${first},`,
    '',
    `Thanks for having us out. Here is the agreement for ${d.siteAddress || 'your property'}, ` +
    'attached as a PDF and linked below so you can sign it online.',
    '',
    'The short version:',
    ...moneyLines,
    d.includeStartDate && d.startDate ? `- Start: ${longDate(d.startDate)}.` : '',
    d.includeCompleteDate && d.completeDate ? `- Substantially complete by: ${longDate(d.completeDate)}.` : '',
    '',
    'To sign, open this link and scroll to the bottom:',
    url,
    '',
    'It takes about a minute. Sign with your finger or your mouse, and a copy of the signed agreement comes ' +
    'to you by email straight away.',
    '',
    'Any questions before you sign, just reply here or give me a call.',
    '',
    signer.name,
    signer.title,
    `${AGENCY.phone} - ${AGENCY.email}`
  ].filter((line) => line !== '').join('\n');

  return { subject, body };
}
