export const meta = {
  name: 'sevenstones-audit-fixes',
  description: 'Fix Google-audit findings: render missing visible FAQs, remove false badges, de-SEO crawler-addressing filler, resolve /solutions cannibalization',
  phases: [
    { title: 'Fix', detail: 'parallel agents: FAQ render, badges, helpful-content, cannibalization' },
    { title: 'Verify', detail: 'schema matches visible, no false claims, no crawler-prose, links resolve' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const BASE = `Repo root: ${ROOT}. After editing, ensure every JSON-LD block on each changed page still parses as valid JSON and every internal link resolves. Style: commas not em-dashes; visible HTML apostrophes &#x27;, ampersands &amp;. Do NOT change prices/facts. Report exactly what changed per file.`

phase('Fix')
const fixes = await parallel([
  // C1: render visible FAQ matching the orphaned FAQPage schema
  () => agent(`${BASE}
TASK (critical, structured-data policy): services/decks-and-pergolas/index.html and services/fences-and-staining/index.html each have a FAQPage JSON-LD block (6 Q&A) in <head> but NO visible FAQ section on the page. RENDER a visible FAQ section on each page whose question + answer text EXACTLY matches the schema.
METHOD: read each page's FAQPage JSON-LD to get the 6 Q&A. Read another services page that HAS a visible FAQ (e.g. services/retaining-walls/index.html or services/sod-installation/index.html) to copy the EXACT visible FAQ HTML pattern (section + faq-list + faq-item + faq-question button + faq-answer-inner). Insert the new visible FAQ section near the end of the main content (before the final CTA/related section), populated with the 6 schema Q&A verbatim. Do not alter the schema.
VERIFY: visible faq-question count == 6 == schema mainEntity count on each page; answer text matches; JSON still valid.`,
    { label:'fix:c1-faq', phase:'Fix' }),
  // C2: remove false accreditation badges
  () => agent(`${BASE}
TASK (critical, E-E-A-T/false-claim): about/index.html around lines 332-340 shows "BBB Accredited" and "HomeStars Best of" trust badges that are placeholders (an adjacent HTML comment says to add profile links "when available"). The business is NOT verifiably accredited there. REMOVE both the "BBB Accredited" and "HomeStars Best of" badge elements (and the now-stale placeholder comment). Leave the genuine ICPI and Landscape Ontario badges intact. Do not break the surrounding badge-row layout (if removing leaves an empty container, keep valid markup).
VERIFY: no "BBB Accredited" or "HomeStars Best of" text remains in about/index.html; ICPI + Landscape Ontario badges still present; JSON valid.`,
    { label:'fix:c2-badges', phase:'Fix' }),
  // I1: de-SEO crawler-addressing filler
  () => agent(`${BASE}
TASK (helpful-content / human-tone): about 15 services pages contain "seo-content-boost" / "seo-depth-boost" sections with sentences that openly address search engines or name target keywords as keywords, e.g. "From an SEO and customer-experience perspective, this page is designed to answer high-intent searches like ...". This reads machine-written and violates Google helpful-content guidance.
Scope: services/index.html and services pages including interlock-patios, retaining-walls, sod-installation, yard-grading, walkways, landscape-stone, pools-and-pool-surrounds, front-yard-landscaping, backyard-landscaping, concrete, concrete/driveways, concrete/stamped-patios, concrete/exposed-aggregate, concrete/steps-walkways. Use Grep to find the offending sentences (search "designed to answer", "high-intent search", "from an SEO", "search queries like", "keywords", "this page", "this guide is designed").
FIX: REWRITE each offending passage into natural, customer-facing prose that conveys the SAME useful information without addressing crawlers or listing keywords-as-keywords. If a sentence has no value except SEO signalling, delete it. Keep genuinely helpful content. Keep each section coherent. Do NOT keyword-stuff. Preserve any existing internal links.
VERIFY: no remaining crawler-addressing phrases on these pages; JSON valid; report per-file what was rewritten/removed.`,
    { label:'fix:i1-helpful-content', phase:'Fix' }),
  // Cannibalization
  () => agent(`${BASE}
TASK (cannibalization, NO deletions): resolve 3 /solutions overlaps by re-pointing links and re-angling, per the Google audit.
1) interlock-repair-hamilton ORPHAN: (a) in service-areas/hamilton/index.html, find the internal anchor pointing to /solutions/interlock-repair/ and repoint it to /solutions/interlock-repair-hamilton/ (the city page should be the hub's interlock-repair link). (b) In solutions/interlock-repair/index.html (province pillar), add ONE contextual body link DOWN to /solutions/interlock-repair-hamilton/ as the Hamilton spoke, and make its lead copy emphasize Ontario/Halton (not Hamilton specifically) so the city page wins the city query. Verify both files exist.
2) yard-grading-drainage RE-ANGLE: solutions/yard-grading-drainage/index.html currently competes with services/yard-grading/ and solutions/yard-drainage-ontario/ on the head term. Re-angle it to a NARROW informational subtopic: update its <title>, <h1>, meta description and intro to focus on "OBC 2% slope and lot grading explained / why grading fails on clay" (educational), NOT a transactional "yard grading & drainage contractor" page. Add a clear contextual link to services/yard-grading/ as the conversion CTA and to solutions/yard-drainage-ontario/ as the broader guide. Do not change factual specs.
3) DRAINAGE PILLAR/SPOKE: make solutions/backyard-drainage/ the pillar. On solutions/{flooding-backyard,water-pooling-yard,lawn-drainage-problems,flood-proof-your-property}/index.html ensure each links UP to solutions/backyard-drainage/ (pillar) AND to services/yard-grading/ (conversion). Keep each page's distinct symptom focus; do not duplicate.
VERIFY: all repointed/added links resolve; titles/H1 updated on yard-grading-drainage; JSON valid; report every change.`,
    { label:'fix:cannibalization', phase:'Fix' }),
])

phase('Verify')
const verify = await agent(`READ-ONLY. ${ROOT}. Validate via Bash/Python:
1. services/decks-and-pergolas/ and services/fences-and-staining/: visible faq-question count == FAQPage schema mainEntity count (6 each), and JSON valid.
2. about/index.html: contains NO "BBB Accredited" and NO "HomeStars Best of".
3. The ~15 services pages: report any remaining crawler-addressing phrases ("designed to answer","high-intent search","from an SEO","keywords"). Must be 0.
4. service-areas/hamilton/ links to /solutions/interlock-repair-hamilton/; solutions/interlock-repair/ links to it too. yard-grading-drainage title/h1 no longer leads with transactional "contractor" head term.
5. Site-wide: 0 broken internal links, 0 invalid JSON-LD blocks.
Report pass/fail per check with specifics.`,
  { label:'verify', phase:'Verify' })

return { fixes, verify }
