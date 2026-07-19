export const meta = {
  name: 'sevenstones-internal-links',
  description: 'Wire blog/solutions/faq content into city service pages (priority: Hamilton/Burlington/Oakville/Milton), fix glossary orphan, add authoritative external links where missing',
  phases: [
    { title: 'Link', detail: 'batched agents add relevant contextual internal + external links' },
    { title: 'Verify', detail: 'links resolve, orphans fixed, no link-dumps, JSON valid' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const RULES = `Repo root: ${ROOT}.
PRIORITY CITIES (target these first when linking to city service pages): Hamilton, Burlington, Oakville, Milton.
LINKING RULES (this is authority-building, NOT spam):
- Add only TOPICALLY-RELEVANT contextual links, placed naturally inside EXISTING prose sentences. NO "related links" dumps, NO lists of city links, NO stuffing.
- Per page, add AT MOST 3-4 new internal links total. Quality over quantity. Skip a link if it is not genuinely relevant or already present.
- Link to a city service page ONLY if the file exists on disk: check service-areas/<city>/<service>/index.html. If the priority city lacks that service page, link to the general /services/<service>/ page instead (verify it exists). NEVER link a path you have not verified exists.
- Topic -> service mapping: interlock/paver/driveway -> interlock-driveways (or /services/interlock-patios/); patio -> patio-contractors (or /services/interlock-patios/); concrete -> concrete-driveways (or /services/concrete/driveways/); retaining wall -> retaining-walls (or /services/retaining-walls/); drainage/grading/flooding -> /services/yard-grading/ or service-areas/<city>/yard-grading-drainage/; pool -> pool-surrounds (or /services/pools-and-pool-surrounds/); flagstone/walkway -> flagstone-installation / stone-walkway-installation; sod/lawn -> /services/sod-installation/.
- GLOSSARY: where a page meaningfully uses a term (polymeric sand, 3/4-clear stone, geotextile, Halton Till, edge restraint, frost heave, control joints, geogrid, armour stone, etc.), add ONE link to /blog/hardscaping-terms-glossary-ontario/ on the first natural mention. The glossary currently has ZERO inbound links - help fix that.
- NEW PAGES: where relevant, link to /blog/how-long-does-concrete-driveway-last-ontario/ and /blog/interlock-vs-concrete-vs-asphalt-driveway-cost/.
- Do NOT change prices, facts, headings, or rewrite copy. Do NOT break HTML. Use commas not em-dashes; &#x27; / &amp; in visible HTML.
- AFTER editing each page: confirm every link you added resolves to a real file, and every JSON-LD block still parses.
Report per page: links added (href + anchor text).`

phase('Link')
const GROUPS = [
  { key:'blogs-1', scope:'the FIRST third (alphabetical) of blog/*/index.html posts' },
  { key:'blogs-2', scope:'the MIDDLE third (alphabetical) of blog/*/index.html posts' },
  { key:'blogs-3', scope:'the LAST third (alphabetical) of blog/*/index.html posts' },
  { key:'solutions', scope:'every solutions/*/index.html page' },
  { key:'faq-core', scope:'faq/index.html, contact/index.html, blog/index.html, service-areas/index.html, solutions/index.html. For these, also add ONE authoritative EXTERNAL link where none exists and it is natural (e.g. ICPI https://www.icpi.org/ or Landscape Ontario https://landscapeontario.com/), rel="noopener", in body content only.' },
]
const linked = await parallel(GROUPS.map(g => () => agent(
`${RULES}
YOUR SCOPE: ${g.scope}. Enumerate the files with Glob, then for EACH page apply the linking rules. Skip pages that already have strong, relevant internal links (do not pad them).`,
  { label:`link:${g.key}`, phase:'Link' })))

phase('Verify')
const verify = await agent(
`READ-ONLY. ${ROOT}. Validate with Bash/Python:
1. Every internal href="/..." across all **/index.html resolves to a real file (report broken count, must be 0).
2. Inbound contextual link counts (grep files containing href to each): /blog/hardscaping-terms-glossary-ontario/ must now be >=3; /blog/how-long-does-concrete-driveway-last-ontario/ and /blog/interlock-vs-concrete-vs-asphalt-driveway-cost/ each >=3. Report actual counts.
3. Every JSON-LD block on all pages still parses (report invalid count, must be 0).
4. Over-linking check: flag any single page where more than 8 internal links were newly added in this run (potential spam) - compare against git diff if possible, else report pages with unusually dense link additions.
Report pass/fail per check with specifics.`,
  { label:'verify', phase:'Verify' })

return { linked, verify }
