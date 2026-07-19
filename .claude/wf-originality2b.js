export const meta = {
  name: 'sevenstones-originality-2b',
  description: 'Rewrite the templated Action-Plan prose block on the 6 remaining solutions pages (sol-b retry) into unique problem-specific content',
  phases: [ { title: 'Rewrite', detail: '3 agents x 2 pages, rewrite block uniquely' }, { title: 'Verify', detail: 'duplicate scan confirms markers on <=1 page' } ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const RULES = `Repo root: ${ROOT}.
PROBLEM: each assigned solutions/*/index.html page still contains a VERBATIM templated prose block (duplicate content). It is 4 templated <p> paragraphs in the "Action Plan for Homeowners" section (the first Action-Plan paragraph and any clearly page-specific paragraphs are already unique - leave those). Marker sentences to find/replace: "We build solution-first plans that align structural correction, drainage, and finish restoration", "When repairs are complete, we review adjacent surfaces and transitions to reduce new stress points", "We design for site-specific behavior so repairs remain reliable through Ontario weather cycles", "This prevents duplicated spending and improves long-term performance", "This integrated approach protects patios, driveways, lawns, and retaining features together", "That is why two homes on the same street can require different methods", "If needed, projects can be phased by urgency and budget while preserving technical integrity", "Every lot behaves differently based on slope, subgrade, and existing hardscape", "Document when and where symptoms appear, especially after storms and spring thaw", "Avoid repeated short-term patching until root causes are confirmed", "A structured inspection and written scope helps prioritize high-impact corrections before cosmetic upgrades".
TASK: REWRITE those templated paragraphs so every sentence is UNIQUE to THAT page's specific problem (interlock repair, patio sinking, retaining-wall repair, yellow/dying sod, uneven interlock lippage, or yard grading/2% slope). Use the real diagnostic steps, failure mechanism, fix method, and Ontario/Halton-Till/freeze-thaw detail for THAT problem. ZERO sentences shared with any other page.
- Human contractor voice, not AI: no formulaic filler, no "Whether you", no crawler-speak, commas not em-dashes, varied structure.
- Keep length comparable; keep ALL existing internal links (pillar/service links) and the credential/CTA lines; do not touch schema or prices.
After editing, confirm JSON-LD parses and links resolve. Report per page what you rewrote.
NOTE: "We provide practical local solutions across Hamilton, Burlington, Oakville..." inside the site-wide CTA band is a legitimate shared call-to-action - do NOT treat it as the block; leave it.`
phase('Rewrite')
const B=[
 {k:'b1', s:'solutions/interlock-repair/index.html and solutions/patio-sinking/index.html'},
 {k:'b2', s:'solutions/retaining-wall-repair/index.html and solutions/uneven-interlock/index.html'},
 {k:'b3', s:'solutions/sod-turning-yellow/index.html and solutions/yard-grading-drainage/index.html (yard-grading-drainage is an informational OBC-2%-slope page; keep that angle while making the block unique)'},
]
const done=await parallel(B.map(g=>()=>agent(`${RULES}\nYOUR PAGES: ${g.s}. Grep the marker sentences on each, rewrite the templated paragraphs uniquely.`,{label:`rewrite:${g.k}`,phase:'Rewrite'})))
phase('Verify')
const verify=await agent(`READ-ONLY. ${ROOT}. Python cross-page duplicate scan: strip <script>/<style>/<header>/<footer>/<nav> + tags, split body into 55-300 char sentences, EXCLUDE form microcopy, the credential/NAP lines (e.g. "ICPI-certified, $5M insured, 5-year workmanship warranty", "Serving Hamilton, Burlington, Oakville"), service-card blurbs, and the site-wide CTA "We provide practical local solutions across". Then report any REMAINING body sentence appearing on 3+ pages. SPECIFICALLY confirm these now appear on <=1 page: "We build solution-first plans", "When repairs are complete, we review adjacent surfaces", "Every lot behaves differently", "A structured inspection and written scope", "Avoid repeated short-term patching", "If needed, projects can be phased by urgency". Also confirm 0 invalid JSON-LD and 0 broken internal links site-wide. Give pass/fail with the remaining-duplicates list + counts.`,{label:'verify',phase:'Verify'})
return {done,verify}
