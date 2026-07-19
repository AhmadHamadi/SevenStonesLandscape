export const meta = {
  name: 'sevenstones-originality',
  description: 'Rewrite the templated content block duplicated across ~13 pages into unique, page-specific, human-sounding content',
  phases: [
    { title: 'Rewrite', detail: 'batched agents rewrite the shared block uniquely per page' },
    { title: 'Verify', detail: 'cross-page duplicate scan confirms originality' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const RULES = `Repo root: ${ROOT}.
PROBLEM: these pages share a VERBATIM templated content block (originality violation). The block contains sentences like "A strong project outcome starts with accurate scoping", "We assess access constraints, grade behavior, tie-ins to existing structures, and how water moves during storms", "Surface finishes can look similar on day one, but long-term performance depends on what is built below", "This approach protects budget while keeping quality standards high", "How to Evaluate Contractors for This Work", "Planning, Pricing, and Long-Term Value", "In Ontario, freeze-thaw and seasonal moisture expose weak preparation quickly". It usually sits in a "seo-content-boost"/"seo-depth-boost"/data-block section.
TASK: On EACH page in your scope, find that templated block and REWRITE its prose so it is UNIQUE to this page and genuinely useful. Requirements:
- Make it SPECIFIC to THIS page's exact service AND city/area (e.g. flagstone walkways in Oakville vs stone walkways in Milton vs concrete steps in Hamilton). Use real, concrete detail for that service: materials, base/prep specs, local soil/freeze-thaw, neighbourhoods, what changes the quote, how to compare bids FOR THAT SERVICE.
- ZERO shared sentences with any other page. Vary sentence structure, openings, and wording. Do NOT just swap the city name into the same template.
- Sound like a knowledgeable human contractor wrote it, NOT AI: no formulaic filler ("In today's world", "When it comes to", "Whether you are"), no keyword stuffing, no crawler-addressing, commas not em-dashes.
- Keep it roughly the same length (do not pad). Keep any existing internal links and the section's place in the page. Use canonical facts only (interlock driveway $28-48k, concrete driveway $14-24k all-in, patio $22-42k, retaining wall $350-900/linear ft; 8-inch driveway base / 6-inch patio; ICPI, $5M, WSIB, 5-yr warranty, since 2013). Do NOT change prices or schema.
After editing each page, confirm JSON-LD still parses and internal links resolve. Report per page what you rewrote.`

phase('Rewrite')
const GROUPS = [
  { key:'flagstone', scope:'every service-areas/<city>/flagstone-installation/index.html that contains the templated block' },
  { key:'walkways', scope:'every service-areas/<city>/stone-walkway-installation/index.html AND service-areas/waterdown/patio-installation/index.html that contains the templated block' },
  { key:'steps-misc', scope:'service-areas/hamilton/concrete-steps/index.html, service-areas/hamilton/concrete-walkways/index.html, and any other service-areas/<city>/<service>/index.html containing the templated block (use Grep to find them all)' },
  { key:'solutions', scope:'solutions/interlock-repair-hamilton/index.html, solutions/sinking-steps-repair/index.html, solutions/yard-drainage-ontario/index.html, and any other solutions/*/index.html containing the templated block' },
]
const done = await parallel(GROUPS.map(g => () => agent(
`${RULES}\nYOUR SCOPE: ${g.scope}. Use Grep to confirm which of your pages contain the templated block (search "A strong project outcome starts with accurate scoping" and "How to Evaluate Contractors for This Work"), then rewrite each uniquely.`,
  { label:`rewrite:${g.key}`, phase:'Rewrite' })))

phase('Verify')
const verify = await agent(
`READ-ONLY. ${ROOT}. Run a cross-page duplicate-content scan with Python: extract visible text from every **/index.html (strip <script>/<style>/tags), split into sentences of length 40-300 chars, and report any body sentence that still appears on 3 OR MORE different pages (exclude obvious chrome/CTA like nav, footer, "Get a Free Quote", "ICPI-certified, $5M insured, 5-year workmanship warranty", form microcopy).
SPECIFICALLY confirm these templated sentences now appear on AT MOST 1 page each: "A strong project outcome starts with accurate scoping", "We assess access constraints, grade behavior", "Surface finishes can look similar on day one", "How to Evaluate Contractors for This Work", "This approach protects budget while keeping quality standards high".
Also confirm: 0 invalid JSON-LD blocks site-wide, 0 broken internal links. Report the remaining list of any sentences still on 3+ pages (with counts) and pass/fail.`,
  { label:'verify', phase:'Verify' })

return { done, verify }
