export const meta = {
  name: 'sevenstones-originality-2',
  description: 'Rewrite the second templated prose block duplicated across ~10 solutions pages into unique, problem-specific human content',
  phases: [
    { title: 'Rewrite', detail: 'agents rewrite the shared solutions block uniquely per page' },
    { title: 'Verify', detail: 'cross-page duplicate scan confirms zero duplicate body prose' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const RULES = `Repo root: ${ROOT}.
PROBLEM: ~10 solutions/*/index.html pages share a VERBATIM templated prose block (duplicate-content / originality violation). Marker sentences include: "We provide practical local solutions across Hamilton, Burlington, Oakville...", "We build solution-first plans that align structural correction, drainage, and finish restoration", "When repairs are complete, we review adjacent surfaces and transitions to reduce new stress points", "We design for site-specific behavior so repairs remain reliable through Ontario weather cycles", "This prevents duplicated spending and improves long-term performance", "This integrated approach protects patios, driveways, lawns, and retaining features together", "That is why two homes on the same street can require different methods", "If needed, projects can be phased by urgency and budget while preserving technical integrity", "Every lot behaves differently based on slope, subgrade, and existing hardscape", "Document when and where symptoms appear, especially after storms and spring thaw", "Avoid repeated short-term patching until root causes are confirmed", "A structured inspection and written scope helps prioritize high-impact corrections before cosmetic upgrades". This block usually sits in the "Local Considerations" / "Action Plan" / data-block sections.
TASK: On EACH solutions page in your scope that contains this block, REWRITE the templated prose so it is UNIQUE to that page's SPECIFIC problem (e.g. backyard drainage vs sinking patio vs leaning retaining wall vs yellow sod vs uneven interlock). Requirements:
- Make every sentence specific to THAT problem: the actual diagnostic steps, failure mechanism, fix method, and local Ontario/Halton-Till/freeze-thaw detail for THAT issue. ZERO sentences shared with any other page.
- Sound like an experienced human contractor, not AI: no formulaic filler, no "Whether you", no crawler-speak, commas not em-dashes, vary structure.
- Keep roughly the same length; keep existing internal links (incl. the pillar/service links added earlier) and the credential fact line; keep schema/prices untouched (canonical: interlock $28-48k, concrete $14-24k all-in, patio $22-42k, retaining wall $350-900/linear ft).
After editing, confirm JSON-LD parses and links resolve. Report per page what you rewrote.`
phase('Rewrite')
const G=[
 {k:'sol-a', s:'these solutions pages IF they contain the block: solutions/backyard-drainage/, solutions/flooding-backyard/, solutions/lawn-drainage-problems/, solutions/water-pooling-yard/, solutions/flood-proof-your-property/ (use Grep on the marker sentences to confirm)'},
 {k:'sol-b', s:'these solutions pages IF they contain the block: solutions/interlock-repair/, solutions/patio-sinking/, solutions/uneven-interlock/, solutions/retaining-wall-repair/, solutions/sinking-steps-repair/, solutions/sod-turning-yellow/, solutions/curb-appeal-roi/, solutions/flagstone-mastery-guide/, solutions/yard-grading-drainage/, solutions/yard-drainage-ontario/, solutions/interlock-repair-hamilton/ (use Grep to confirm which still contain the marker sentences; some were partly rewritten already - only rewrite remaining shared prose)'},
]
const done=await parallel(G.map(g=>()=>agent(`${RULES}\nYOUR SCOPE: ${g.s}. Grep the marker sentences to find which pages still share them, then rewrite each uniquely.`,{label:`rewrite:${g.k}`,phase:'Rewrite'})))
phase('Verify')
const verify=await agent(`READ-ONLY. ${ROOT}. Cross-page duplicate scan with Python: strip <script>/<style>/<header>/<footer>/<nav> and tags, split body into 55-300 char sentences, report any that still appear on 3+ different pages (exclude form microcopy and the factual credential line "ICPI certified, Landscape Ontario member, authorized Unilock and Techo-Bloc" and service-card blurbs). SPECIFICALLY confirm each marker sentence ("We provide practical local solutions across", "We build solution-first plans", "When repairs are complete, we review adjacent surfaces", "Every lot behaves differently", "A structured inspection and written scope", "Avoid repeated short-term patching") now appears on AT MOST 1 page. Also confirm 0 invalid JSON-LD and 0 broken internal links site-wide. List any remaining 3+-page body sentences with counts; give pass/fail.`,{label:'verify',phase:'Verify'})
return {done,verify}
