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
 * LEGAL SHAPE. This is a business-to-consumer contract: a hardscape contractor and
 * a homeowner. That makes it a "direct agreement" under Ontario's Consumer
 * Protection Act, 2002 whenever it is signed away from the company's own premises,
 * which is nearly always. Three things follow, and they are why this clause set is
 * not the marketing agreement it was adapted from:
 *   - the customer gets 10 days to cancel for any reason (CPA s.43);
 *   - the final price may not exceed the estimate by more than 10% (CPA s.10);
 *   - the agreement must state what is being done, itemised, and when it starts
 *     and ends (O. Reg. 17/05 s.35).
 * The clauses below are written to satisfy all three. Have a lawyer read them
 * before the first one goes out.
 */

export const SIGNERS = [
  { name: 'John Scime', title: 'Owner, Seven Stones Landscape' }
];

export const SERVICE_LIBRARY = [
  { id: 'interlock',  label: 'Interlock patio or walkway',      desc: 'Excavation, compacted granular base, bedding course, paver installation, edge restraint, and polymeric sand.' },
  { id: 'driveway',   label: 'Interlock driveway',              desc: 'Full-depth excavation and base build rated for vehicle loading, paver installation, edge restraint, and polymeric sand.' },
  { id: 'concrete',   label: 'Concrete flatwork',               desc: 'Forming, granular base, reinforcement, placement, finishing, and control joints cut to spacing.' },
  { id: 'stamped',    label: 'Stamped or exposed aggregate concrete', desc: 'Concrete flatwork with a stamped pattern or exposed aggregate finish, including release agent and cure and seal.' },
  { id: 'steps',      label: 'Steps and landings',              desc: 'Construction of steps and landings in pre-cast, natural stone, or poured concrete, set on a compacted base.' },
  { id: 'retaining',  label: 'Retaining wall',                  desc: 'Engineered base, block or natural stone wall construction, drainage stone, filter fabric, and backfill.' },
  { id: 'stone',      label: 'Natural stone or flagstone',      desc: 'Flagstone or natural stone installation on a compacted base or mortar bed, including cutting and fitting.' },
  { id: 'firepit',    label: 'Fire pit, bench, or seating wall', desc: 'Construction of a fire feature, seat wall, or built-in bench in matching hardscape material.' },
  { id: 'pool',       label: 'Pool surround or pool deck',       desc: 'Hardscape surround to a pool, including base, coping where specified, and surface installation.' },
  { id: 'grading',    label: 'Yard grading',                    desc: 'Regrading of the lot to shed water away from the structure, including topsoil placement and finish grade.' },
  { id: 'drainage',   label: 'Drainage work',                   desc: 'Drainage correction, which may include catch basins, weeping tile, downspout extensions, or a dry well as specified.' },
  { id: 'sod',        label: 'Sod installation',                desc: 'Site preparation, topsoil placement, sod laying, and initial rolling, with watering instructions handed over.' },
  { id: 'garden',     label: 'Garden beds and planting',        desc: 'Bed construction, soil, edging, plant material, and mulch as specified.' },
  { id: 'fence',      label: 'Fencing or staining',             desc: 'Fence construction, repair, or staining as specified, including post setting.' },
  { id: 'deck',       label: 'Deck or pergola',                 desc: 'Construction of a deck or pergola on footings sized for the structure and the soil.' },
  { id: 'repair',     label: 'Repair or lifting of existing hardscape', desc: 'Lifting, re-levelling, re-sanding, or rebuilding of existing hardscape that has settled or failed.' },
  { id: 'removal',    label: 'Demolition and removal',          desc: 'Removal and lawful disposal of existing surfaces, structures, or spoil from the site.' }
];

/** How the balance is split after the deposit. Mirrors tools/estimate-contract/. */
export const PAYMENT_PLANS = [
  { id: 'startComplete', label: 'Half on start, half on completion' },
  { id: 'thirds',        label: 'Thirds: start, midpoint, completion' },
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
  clientAddress: '',
  siteAddress: '',
  clientEmail: '',
  clientPhone: '',

  agreementDate: '',
  startDate: '',
  completeDate: '',
  currency: 'CAD',

  projectPrice: '',
  taxRate: 13,
  depositPercent: 10,
  paymentPlan: 'startComplete',

  services: ['interlock'],
  customServices: [],
  scope: '',
  exclusions: '',

  warrantyYears: 5,
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
  } else if (d.paymentPlan === 'thirds') {
    const a = round2(balance / 3);
    const b = round2(balance / 3);
    instalments = [
      { label: 'On start', value: a },
      { label: 'At midpoint', value: b },
      { label: 'On completion', value: round2(balance - a - b) }
    ];
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
  ['projectPrice', 'pp'], ['taxRate', 'tr'], ['depositPercent', 'dp'], ['paymentPlan', 'pl'],
  ['services', 'sv'], ['customServices', 'cs'], ['scope', 'sc'], ['exclusions', 'ex'],
  ['warrantyYears', 'wy'], ['signerIndex', 'si']
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
    if (full === 'customServices' && Array.isArray(v)) v = v.filter((x) => String(x).trim());
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
  d.customServices = Array.isArray(d.customServices) ? d.customServices : [];
  d.services = Array.isArray(d.services) ? d.services : [];
  d.signerIndex = Number(d.signerIndex) || 0;
  // A tampered or truncated numeric must not silently become 0 and change the money.
  const tr = Number(d.taxRate);
  d.taxRate = Number.isFinite(tr) && tr >= 0 && tr <= 100 ? tr : DEFAULTS.taxRate;
  const dp = Number(d.depositPercent);
  d.depositPercent = Number.isFinite(dp) && dp >= 0 && dp <= 100 ? dp : DEFAULTS.depositPercent;
  const wy = Number(d.warrantyYears);
  d.warrantyYears = Number.isFinite(wy) && wy >= 0 ? wy : DEFAULTS.warrantyYears;
  if (!PAYMENT_PLANS.some((p) => p.id === d.paymentPlan)) d.paymentPlan = DEFAULTS.paymentPlan;
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

export function signingUrl(d, origin = AGENCY.origin) {
  // trailingSlash is on in vercel.json, so emit the slash rather than let a 308 rewrite it.
  return `${origin}/sign/${slugify(d.clientName)}/?a=${encodeContract(d)}`;
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

/** Services actually selected, library entries plus any custom lines. */
export function selectedServices(d) {
  return [
    ...SERVICE_LIBRARY.filter((s) => d.services.includes(s.id)),
    ...(d.customServices || [])
      .filter((x) => String(x).trim())
      .map((label) => ({ id: label, label, desc: '' }))
  ];
}

const BLANK = '________________';

/**
 * Builds the numbered clauses. Paragraph strings may contain **bold** runs and
 * "- " list lines; every renderer understands those two conventions and nothing
 * else, which keeps screen, email, and plain text identical.
 */
export function buildClauses(d) {
  const services = selectedServices(d);
  const p = priceBreakdown(d);

  const agreedOn = longDate(d.agreementDate) || BLANK;
  const startOn = longDate(d.startDate) || BLANK;
  const finishOn = longDate(d.completeDate) || BLANK;
  const site = d.siteAddress || d.clientAddress || BLANK;
  const years = Number(d.warrantyYears) || 0;

  const clauses = [];
  const add = (title, paras) => clauses.push({ n: clauses.length + 1, title, paras });

  add('Parties and Property', [
    `This Work Agreement (the **"Agreement"**) is made on ${agreedOn} between ` +
    `**${AGENCY.legalName}** ("Seven Stones", "we", "us") of ${AGENCY.address}, ` +
    `${AGENCY.email}, ${AGENCY.phone}, and ` +
    `**${d.clientName || BLANK}** ("you", "the Customer")` +
    `${d.clientAddress ? ` of ${d.clientAddress}` : ''}` +
    `${d.clientContact && d.clientContact !== d.clientName ? `, represented by ${d.clientContact}` : ''}.`,
    `The work will be carried out at **${site}** (the **"Property"**).`
  ]);

  add('The Work', [
    'Seven Stones will supply the labour, materials, and equipment to carry out the following (the **"Work"**):',
    ...(services.length
      ? services.map((s) => `- **${s.label}.**${s.desc ? ` ${s.desc}` : ''}`)
      : [`- ${BLANK}`]),
    ...(String(d.scope || '').trim()
      ? ['Agreed details and measurements:', ...String(d.scope).trim().split(/\n+/).map((l) => `- ${l.trim()}`)]
      : []),
    ...(String(d.exclusions || '').trim()
      ? ['**Not included in this Agreement:**', ...String(d.exclusions).trim().split(/\n+/).map((l) => `- ${l.trim()}`)]
      : []),
    'Anything not listed above is not included, and will be quoted separately in writing before it is started.'
  ]);

  add('Dates', [
    `Work is scheduled to begin on **${startOn}** and to be substantially complete by **${finishOn}**.`,
    'These dates assume workable ground and weather. Hardscape and concrete cannot be installed properly in ' +
    'frozen, saturated, or freezing conditions, and sod cannot be laid into ground that will not take it. ' +
    'Where weather, a permit or locate delay, or a delay by the Customer prevents work from proceeding, the ' +
    'dates move by the length of that delay and neither party is in breach. Seven Stones will tell the ' +
    'Customer of any change to the schedule as soon as it is known.'
  ]);

  const priceLines = [];
  if (p) {
    priceLines.push(`- **Price for the Work: ${money(p.base, d.currency)}**, plus HST at ${p.taxRate}%${p.tax ? ` (${money(p.tax, d.currency)})` : ''}.`);
    priceLines.push(`- **Total payable: ${money(p.total, d.currency)}.**`);
    if (p.deposit > 0) {
      priceLines.push(`- **Deposit: ${money(p.deposit, d.currency)}** (${p.depositPercent}%), due on signing.`);
    }
    for (const inst of p.instalments) {
      priceLines.push(`- **${inst.label}: ${money(inst.value, d.currency)}.**`);
    }
  } else {
    priceLines.push(`- **Price for the Work: ${BLANK}.**`);
  }

  add('Price and Payment', [
    ...priceLines,
    `All amounts are in ${d.currency}. Invoices are payable on receipt. Seven Stones is responsible for ` +
    'paying its own workers, suppliers, and subcontractors out of these amounts.',
    p
      ? `**The final price will not exceed ${money(p.cap, d.currency)}** - this Agreement plus ` +
        `${ESTIMATE_OVERRUN_CAP}% - unless the Customer agrees in writing to additional work under the next clause. ` +
        'This limit is required by section 10 of the Consumer Protection Act, 2002.'
      : `**The final price will not exceed this Agreement by more than ${ESTIMATE_OVERRUN_CAP}%** unless the ` +
        'Customer agrees in writing to additional work under the next clause. This limit is required by ' +
        'section 10 of the Consumer Protection Act, 2002.'
  ]);

  add('Changes and Extras', [
    'Either party may propose a change to the Work. **No extra work will be carried out, and no extra charge ' +
    'will be made, until the change and its price are agreed in writing** - an email or a text message ' +
    'confirming both is enough.',
    'Some conditions cannot be seen until the ground is opened: buried concrete or fill, unsuitable subgrade, ' +
    'a spring or a high water table, or existing structures that will not hold. If one is found, Seven Stones ' +
    'will stop, show the Customer what has been uncovered, and price the additional work before continuing.'
  ]);

  add('Site Conditions, Access, and Locates', [
    'The Customer agrees to:',
    '- give access to the Property on working days, and to water and power where the Work needs them;',
    '- move vehicles, furniture, planters, and personal property out of the work area before the start date;',
    '- point out any private underground services the Customer knows of - irrigation lines, low-voltage ' +
    'lighting, pool lines, invisible fencing, septic beds, or private gas or electrical runs to a garage or shed.',
    'Seven Stones will arrange a public utility locate before excavating, as the law requires. **A public ' +
    'locate does not cover private lines**, and Seven Stones is not responsible for damage to a private ' +
    'service that was not pointed out beforehand.',
    'Heavy equipment and material deliveries mark ground. Some rutting of lawn and driveway along the ' +
    'access route is normal and is made good as described in the Work above, but only where it is listed there.'
  ]);

  add('Permits and Approvals', [
    'Where the Work needs a municipal permit, a conservation authority approval, or a pool enclosure ' +
    'inspection, the party named in the Work above is responsible for obtaining it. Where the Work is not ' +
    'listed as including permits, the Customer is responsible for them and for any fee.',
    'The Customer confirms they own the Property or have the owner\'s authority to have this Work done, and ' +
    'that the Work does not breach a registered easement, right of way, or condominium or subdivision rule. ' +
    'Where a survey is needed to establish a property line, it is the Customer\'s to provide.'
  ]);

  if (years > 0) {
    add(`Workmanship Warranty (${years} year${years === 1 ? '' : 's'})`, [
      `Seven Stones warrants its workmanship for **${years} year${years === 1 ? '' : 's'}** from the date the ` +
      'Work is substantially complete. On interlock and hardscape that covers base settlement, edge restraint ' +
      'failure, joint loss, and base-related movement. On concrete it covers settlement, control joint failure, ' +
      'and finish defects.',
      'Manufactured products carry their own manufacturer warranty, which on Unilock and Techo-Bloc pavers is ' +
      'often a lifetime limited warranty on structural integrity. Seven Stones will register that warranty for ' +
      'the Customer at handover where the manufacturer requires it.',
      '**This warranty does not cover:**',
      '- efflorescence, the natural white bloom that clears from new concrete pavers on its own;',
      '- natural colour and texture variation in natural stone, and normal fading;',
      '- damage from third-party excavation, or from work by others on or under the Work;',
      '- vehicle loading on a surface built and priced for foot traffic;',
      '- de-icing salt used against the care guidance handed over at completion;',
      '- ground movement caused by tree roots, a new drainage condition, or a change to the grade made after ' +
      'completion by someone other than Seven Stones;',
      '- ordinary wear, neglect, or damage from an event outside either party\'s control.',
      'To make a claim, tell Seven Stones in writing within the warranty period and give reasonable access to ' +
      'inspect. Where a claim is valid, Seven Stones will repair the affected area at its own cost. Nothing in ' +
      'this clause takes away any right the Customer has under the Consumer Protection Act, 2002.'
    ]);
  }

  add('Insurance and Responsibility', [
    'Seven Stones carries commercial general liability insurance and WSIB coverage on its employees, and will ' +
    'provide a Certificate of Insurance and a WSIB Clearance Certificate to the Customer on request.',
    'Seven Stones is responsible for damage it causes to the Property through its own negligence. It is not ' +
    'responsible for indirect or consequential loss. Neither party is liable for a failure caused by an event ' +
    'outside its reasonable control.'
  ]);

  add('Your Right to Cancel', [
    `Because this Agreement is signed somewhere other than the Seven Stones place of business, it is a ` +
    `**direct agreement** under Ontario's **Consumer Protection Act, 2002**.`,
    `**You may cancel this Agreement for any reason within ${COOLING_OFF_DAYS} days of receiving your written ` +
    `copy.** You do not have to give a reason. To cancel, tell Seven Stones in writing - email to ` +
    `${AGENCY.email}, a letter, or any other written notice showing an intention to cancel is enough. It takes ` +
    `effect when you send it, not when we receive it.`,
    'If you cancel within that period, Seven Stones will refund any deposit or payment within **15 days**. ' +
    'You may also have the right to cancel this Agreement for up to one year in the circumstances the Act sets out.',
    'Beyond that period, either party may end this Agreement in writing. Where the Customer ends it after work ' +
    'or material ordering has begun, the Customer pays for the work performed and the material ordered to that ' +
    'point, and nothing more.'
  ]);

  add('General', [
    'This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada that ' +
    'apply in it. It is the entire agreement between the parties on this subject and replaces any earlier ' +
    'quote, discussion, or proposal. Changes must be agreed in writing by both parties. If any clause is found ' +
    'unenforceable, the rest of the Agreement stays in force.',
    'Nothing in this Agreement takes away or limits a right the Customer has under the Consumer Protection ' +
    'Act, 2002; where a term of this Agreement conflicts with that Act, the Act prevails.',
    'An electronic signature applied through the Seven Stones signing page has the same effect as a signature ' +
    'in ink, and both parties consent to signing and receiving this Agreement electronically.'
  ]);

  return clauses;
}

/** What is still missing before this agreement can go out. */
export function contractGaps(d) {
  const gaps = [];
  if (!String(d.clientName).trim())    gaps.push('Customer name');
  if (!String(d.clientEmail).trim())   gaps.push('Customer email (needed to send it)');
  if (!String(d.siteAddress).trim() && !String(d.clientAddress).trim()) {
    gaps.push('Property address');
  }
  if (priceBreakdown(d) === null)      gaps.push('Price for the work');
  if (selectedServices(d).length === 0) gaps.push('At least one service');
  if (!d.agreementDate) gaps.push('Agreement date');
  if (!d.startDate)     gaps.push('Start date (required by the Consumer Protection Act)');
  if (!d.completeDate)  gaps.push('Completion date (required by the Consumer Protection Act)');
  return gaps;
}

/* ============================================================
   THE COVERING EMAIL
   Written out in full so it can be copied straight into a mail client.
   ============================================================ */
export function coveringEmail(d, url) {
  const signer = SIGNERS[d.signerIndex] || SIGNERS[0];
  const p = priceBreakdown(d);
  const services = selectedServices(d).map((s) => s.label);
  const who = d.clientName || '[Customer]';
  const first = String(d.clientContact || d.clientName || '').trim().split(/\s+/)[0] || 'there';

  const subject = `Your Seven Stones agreement - ${who}`;

  const moneyLines = p
    ? [
        `- Price for the work: ${money(p.base, d.currency)} plus HST. Total ${money(p.total, d.currency)}.`,
        ...(p.deposit > 0 ? [`- Deposit: ${money(p.deposit, d.currency)} on signing.`] : []),
        ...p.instalments.map((i) => `- ${i.label}: ${money(i.value, d.currency)}.`)
      ]
    : ['- Price: [to be filled in]'];

  const body = [
    `Hi ${first},`,
    '',
    `Thanks for having us out. Here is the agreement for ${d.siteAddress || d.clientAddress || 'your property'}, ` +
    'attached as a PDF and linked below so you can sign it online.',
    '',
    'The short version:',
    ...moneyLines,
    d.startDate ? `- Start: ${longDate(d.startDate)}.` : '',
    d.completeDate ? `- Substantially complete by: ${longDate(d.completeDate)}.` : '',
    services.length ? `- Included: ${services.join(', ')}.` : '',
    Number(d.warrantyYears) > 0 ? `- Workmanship warranty: ${d.warrantyYears} years.` : '',
    '',
    'To sign, open this link and scroll to the bottom:',
    url,
    '',
    'It takes about a minute. Sign with your finger or your mouse, and a copy of the signed agreement comes ' +
    'to you by email straight away.',
    '',
    `Worth knowing: because we signed this at your place rather than ours, you have ${COOLING_OFF_DAYS} days ` +
    'to cancel for any reason. Nothing gets ordered before then unless you tell us to go ahead.',
    '',
    'Any questions before you sign, just reply here or give me a call.',
    '',
    signer.name,
    signer.title,
    `${AGENCY.phone} - ${AGENCY.email}`
  ].filter((line) => line !== '').join('\n');

  return { subject, body };
}
