export const meta = {
  name: 'sevenstones-optimization-sweep',
  description: 'Audit every indexable page for concrete on-page SEO/AEO/accessibility defects, apply only safe surgical fixes, then validate site-wide',
  phases: [
    { title: 'Audit', detail: 'read-only auditors fan out across all page groups' },
    { title: 'Fix', detail: 'apply only enumerated safe fixes per group, self-verify' },
    { title: 'Verify', detail: 'site-wide JSON / duplicate / broken-link validation' },
  ],
}

const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'

const CANON = `
CANONICAL FACTS — treat these as ground truth. Flag (audit) or correct (fix) ANY deviation:
- Name: Seven Stones Landscape | Phone: +1 (289) 700-0312 | Email: info@sevenstoneslandscape.ca | Founded: 2013
- Address: Hamilton, ON, CA | Hours: Monday-Saturday, 7 AM-7 PM | $5M liability | WSIB | 5-year workmanship warranty
- Credentials: ICPI Certified, Landscape Ontario member, authorized Unilock & Techo-Bloc installer
- Canonical domain form everywhere: https://www.sevenstoneslandscape.ca/ (https + www + trailing slash)
- PRICES (2026): interlock driveway 2-car 400-600 sqft = $28,000-$48,000 ($55-80/sqft); concrete driveway 2-car = $14,000-$24,000 all-in; interlock patio 400-600 sqft = $22,000-$42,000 ($42-68/sqft); retaining wall = $350-$900 per linear foot; interlock lasts 25-40 yrs, concrete 25-35
- Base specs: 8-inch compacted 3/4-clear limestone base under driveways, 6-inch under patios, geotextile on clay, polymeric sand, edge restraint
- Entity: LocalBusiness @id = "https://www.sevenstoneslandscape.ca/#business"; sameAs = facebook, instagram, icpi.org, landscapeontario.com, unilock.com, techo-bloc.com, share.google GBP
- aggregateRating/Review schema may exist ONLY on the homepage (index.html). NEVER add ratings to any other page.
`

// page groups (each agent enumerates its own files within scope)
const GROUPS = [
  { key: 'core',      scope: 'the core pages: index.html, about/index.html, contact/index.html, faq/index.html' },
  { key: 'solutions', scope: 'every solutions/*/index.html page' },
  { key: 'services',  scope: 'every services/**/index.html page (includes services/concrete/* sub-pages)' },
  { key: 'hubs',      scope: 'every service-areas/<city>/index.html city HUB page (11 of them, NOT the deeper service sub-pages)' },
  { key: 'citysvc-1', scope: 'service-areas/{ancaster,burlington,dundas,grimsby}/<service>/index.html pages' },
  { key: 'citysvc-2', scope: 'service-areas/{hamilton,milton}/<service>/index.html pages' },
  { key: 'citysvc-3', scope: 'service-areas/{mississauga,mount-hope,oakville,stoney-creek,waterdown}/<service>/index.html pages' },
  { key: 'blog-1',    scope: 'the FIRST half (alphabetical) of blog/*/index.html posts' },
  { key: 'blog-2',    scope: 'the SECOND half (alphabetical) of blog/*/index.html posts' },
]

const AUDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['pages_audited', 'findings'],
  properties: {
    pages_audited: { type: 'integer' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['file', 'type', 'severity', 'detail', 'safe_to_autofix'],
        properties: {
          file: { type: 'string' },
          type: { type: 'string', description: 'one of: invalid-json-ld, broken-internal-link, missing-alt, off-canonical-fact, wrong-price, missing-canonical, missing-title, missing-description, multiple-h1, no-h1, thin-content, ai-looking-text, weak-eeat, missing-internal-links, other' },
          severity: { type: 'string', enum: ['critical', 'important', 'minor'] },
          detail: { type: 'string', description: 'exact problem incl. line/old value' },
          safe_to_autofix: { type: 'boolean', description: 'true only for mechanical fixes: broken link, missing alt, wrong price vs canonical, invalid json, missing canonical/title/description, off-canonical NAP fact' },
        },
      },
    },
  },
}

const FIX_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['files_changed', 'fixes_applied', 'json_all_valid', 'links_all_resolve', 'notes'],
  properties: {
    files_changed: { type: 'integer' },
    fixes_applied: { type: 'array', items: { type: 'string' } },
    json_all_valid: { type: 'boolean' },
    links_all_resolve: { type: 'boolean' },
    notes: { type: 'string', description: 'judgment-call items deliberately NOT auto-fixed, for human review' },
  },
}

const auditPrompt = (g) => `READ-ONLY audit. Repo root: ${ROOT}. Audit ${g.scope}. Make NO file changes in this phase.
${CANON}
For EACH page, check and report concrete, file-specific defects only (do not invent issues; a clean page returns no findings):
1. invalid-json-ld: any <script type="application/ld+json"> block that does not parse as valid JSON.
2. broken-internal-link: any href="/..." whose target index.html does not exist on disk (verify with the filesystem).
3. missing-alt: any <img> with no alt attribute or empty alt that is not a decorative/JS-populated image.
4. off-canonical-fact / wrong-price: any phone, email, hours, warranty, founding year, domain form, or PRICE that deviates from CANONICAL FACTS above.
5. missing-canonical / missing-title / missing-description: head tag absent.
6. multiple-h1 / no-h1: must be exactly one <h1>.
7. thin-content: main content under ~300 words of real text.
8. ai-looking-text: obviously templated/robotic phrasing or em-dash-heavy filler that reads machine-generated.
9. weak-eeat: blog Article with no real Person author, or service page with no first-hand/credential signal.
10. missing-internal-links: a money page with no contextual internal links to related pages.
Set safe_to_autofix=true ONLY for mechanical, unambiguous fixes (types 1-6). Set false for content/judgment items (7-10).
Use Glob/Bash to enumerate your scope and a JSON parser to validate schema. Return structured findings.`

const fixPrompt = (g, findings) => `Repo root: ${ROOT}. Apply fixes to ${g.scope}.
${CANON}
Here are the audited findings for your pages (JSON):
${JSON.stringify(findings)}

RULES — this is surgical repair, NOT rewriting:
- Apply ONLY findings with safe_to_autofix=true: fix invalid JSON-LD, correct broken internal links (point to the right existing page or remove the link), add a concise accurate alt to images missing it, correct any off-canonical fact/price to the CANONICAL value, add a missing canonical/title/description.
- For wrong prices: use the exact canonical ranges. For schema: keep it valid.
- DO NOT keyword-stuff, DO NOT pad or lengthen content, DO NOT rewrite good copy, DO NOT add ratings to non-homepage pages, DO NOT change anything not in the findings. Over-optimization is penalized.
- Match the site's existing voice: commas not em-dashes; visible HTML uses &#x27; for apostrophes and &amp; for ampersands.
- Leave judgment items (thin-content, weak-eeat, ai-looking, missing-internal-links) UNCHANGED and list them in notes for human review.
AFTER editing, VERIFY: every JSON-LD block on every changed page parses as valid JSON, and every internal link you touched resolves to a real file. Report json_all_valid and links_all_resolve honestly (false if anything fails).`

phase('Audit')
const results = await pipeline(
  GROUPS,
  (g) => agent(auditPrompt(g), { label: `audit:${g.key}`, phase: 'Audit', schema: AUDIT_SCHEMA }).then(r => ({ g, audit: r })),
  ({ g, audit }) => {
    const autofix = (audit?.findings || []).filter(f => f.safe_to_autofix)
    if (!autofix.length) return { g: g.key, skipped: true, findings: audit?.findings?.length || 0 }
    return agent(fixPrompt(g, autofix), { label: `fix:${g.key}`, phase: 'Fix', schema: FIX_SCHEMA })
      .then(fx => ({ g: g.key, fix: fx, total_findings: audit.findings.length, autofixed: autofix.length }))
  }
)

phase('Verify')
const verify = await agent(
  `READ-ONLY site-wide validation. Repo root: ${ROOT}. Using Bash/Python:
1. Parse EVERY <script type="application/ld+json"> block in every **/index.html — report count of invalid blocks (must be 0) and list any file with invalid JSON.
2. Extract <title> and meta description from every indexable (non-noindex) index.html — report any EXACT duplicates across pages (must be 0).
3. Extract every internal href="/..." across all pages and report any that do not resolve to an existing index.html on disk (broken links).
4. Confirm no page other than index.html contains "aggregateRating".
Return a concise pass/fail report with exact counts and any offending files.`,
  { label: 'verify:site', phase: 'Verify' }
)

return {
  groups: results.map(r => r && (r.g || r)).filter(Boolean),
  perGroup: results,
  siteVerification: verify,
}
