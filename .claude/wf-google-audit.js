export const meta = {
  name: 'sevenstones-google-audit',
  description: 'Read-only Google Search Console readiness audit: indexability, rich-results schema, content uniqueness, human-tone, E-E-A-T, cannibalization across every page',
  phases: [
    { title: 'Review', detail: 'agents review page groups across GSC/quality dimensions' },
    { title: 'Cannibalize', detail: 'site-wide keyword/intent overlap analysis' },
    { title: 'Synthesize', detail: 'consolidated prioritized GSC-readiness report' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const CHECK = `Repo root: ${ROOT}. READ-ONLY — make NO file edits. For each page in scope, check these dimensions and report only concrete, file-specific issues (a clean page returns no findings; do not invent issues):
1. indexability (GSC will-it-index): self-referencing absolute https://www. canonical present; not accidentally noindex; has <title>, meta description, exactly one <h1>, <meta viewport>, <html lang>; not blocked by robots; appears in sitemap.xml if indexable.
2. schema-rich-results (what GSC Rich Results flags): every JSON-LD parses; Article has headline+image+author(Person)+datePublished+publisher; FAQPage mainEntity Q/A matches visible text; LocalBusiness has name+address+telephone+url; BreadcrumbList positions sequential; no future dates; no aggregateRating without on-page reviews.
3. content-uniqueness: is the body substantively unique, or near-duplicate/boilerplate shared with sibling pages (city-swapped templates)? Flag pages whose main content is templated with little unique local substance.
4. human-tone (Google helpful-content / "hidden" AI text): does it read like a knowledgeable human wrote it, or robotic/templated/keyword-stuffed/em-dash-filler? Flag machine-sounding passages.
5. eeat: first-hand experience signals, named author with credentials, specific local detail, authoritative external citations. Flag thin E-E-A-T.
6. internal-linking: does the page link to relevant sibling pages and receive contextual links (not orphaned)? (Note: a linking pass may be running concurrently, so report only clear orphans.)
Return structured findings.`
const SCHEMA = { type:'object', additionalProperties:false, required:['pages_reviewed','findings','strengths'], properties:{
  pages_reviewed:{type:'integer'},
  findings:{type:'array', items:{ type:'object', additionalProperties:false, required:['file','dimension','severity','issue'], properties:{
    file:{type:'string'}, dimension:{type:'string'}, severity:{type:'string',enum:['critical','important','minor']}, issue:{type:'string'}, recommendation:{type:'string'} }}},
  strengths:{type:'array', items:{type:'string'}} } }

phase('Review')
const GROUPS = [
  { key:'core', scope:'index.html, about/index.html, contact/index.html, faq/index.html, services/index.html, solutions/index.html, service-areas/index.html' },
  { key:'services', scope:'every services/**/index.html page' },
  { key:'hubs', scope:'every service-areas/<city>/index.html HUB page (11)' },
  { key:'citysvc-1', scope:'service-areas/{ancaster,burlington,dundas,grimsby,hamilton}/<service>/index.html' },
  { key:'citysvc-2', scope:'service-areas/{milton,mississauga,mount-hope,oakville,stoney-creek,waterdown}/<service>/index.html' },
  { key:'solutions', scope:'every solutions/*/index.html page' },
  { key:'blogs-1', scope:'the FIRST half (alphabetical) of blog/*/index.html' },
  { key:'blogs-2', scope:'the SECOND half (alphabetical) of blog/*/index.html' },
]
const reviews = await parallel(GROUPS.map(g => () => agent(
`${CHECK}\nYOUR SCOPE: ${g.scope}. Enumerate with Glob, review each page. Be a strict Google quality rater.`,
  { label:`review:${g.key}`, phase:'Review', schema:SCHEMA })))

phase('Cannibalize')
const cannib = await agent(
`READ-ONLY. ${ROOT}. Site-wide keyword-cannibalization + mutual-support analysis. Using Bash/Python, extract <title>, <h1>, canonical, and primary keyword intent for every indexable page. Identify:
1. Pairs/sets of pages targeting the SAME primary keyword + SAME city + SAME intent (true cannibalization where pages compete). Distinguish from legitimate variants (different city, or informational-vs-commercial intent, which is fine).
2. Any page that should be the canonical target for a query but is out-competed by a weaker page.
3. Whether the page network mutually supports (hub/spoke, informational->commercial linking) or has gaps.
Report specific competing pairs with the recommended canonical target and the fix (differentiate / re-point internal links). Do NOT recommend deletions.`,
  { label:'cannibalization', phase:'Cannibalize', schema:{type:'object',additionalProperties:false,required:['competing_sets','notes'],properties:{competing_sets:{type:'array',items:{type:'object',additionalProperties:false,required:['pages','keyword','recommendation'],properties:{pages:{type:'array',items:{type:'string'}},keyword:{type:'string'},recommendation:{type:'string'}}}},notes:{type:'string'}}} })

phase('Synthesize')
const all = reviews.filter(Boolean).flatMap(r => r.findings || [])
const crit = all.filter(f=>f.severity==='critical')
const summary = await agent(
`Consolidate this Google-readiness audit into a prioritized report for the site owner.
Total findings: ${all.length} (critical: ${crit.length}). Findings JSON: ${JSON.stringify(all).slice(0,9000)}
Cannibalization JSON: ${JSON.stringify(cannib).slice(0,3000)}
Produce: (1) a GSC ACCEPTANCE verdict (will every page be indexable/valid? yes/no + blockers), (2) CRITICAL issues to fix (deduped, grouped by type, with file lists), (3) IMPORTANT improvements, (4) cannibalization verdict, (5) top strengths. Be concrete and honest. If the site is essentially clean, say so plainly.`,
  { label:'synthesize', phase:'Synthesize' })

return { totalFindings: all.length, critical: crit.length, bySeverity: { critical: crit.length, important: all.filter(f=>f.severity==='important').length, minor: all.filter(f=>f.severity==='minor').length }, cannibalization: cannib, report: summary, rawFindings: all }
