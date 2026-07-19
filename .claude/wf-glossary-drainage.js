export const meta = {
  name: 'sevenstones-glossary-drainage',
  description: 'Build a hardscaping terms glossary page (AI-citable) and finish the drainage cluster hub-link rebalance, then verify',
  phases: [
    { title: 'Build', detail: 'create glossary page + rebalance drainage internal links' },
    { title: 'Verify', detail: 'JSON valid, sitemap + links resolve' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const CANON = `Seven Stones Landscape, Hamilton/Halton Ontario, ICPI certified, since 2013. Domain https://www.sevenstoneslandscape.ca/ (https+www+trailing slash). Author Person @id .../#riaad (Riaad), publisher @id .../#business. STYLE: human expert, concrete, local; commas not em-dashes; visible apostrophes &#x27;, ampersands &amp;; JSON-LD straight apostrophes, no double-quotes in text. No aggregateRating/Review on any non-homepage page.`

phase('Build')
const build = await parallel([
  () => agent(
`Repo root: ${ROOT}. Create a NEW glossary page at blog/hardscaping-terms-glossary-ontario/index.html.
${CANON}
METHOD: Read blog/how-long-does-interlock-last-ontario/index.html as the EXACT structural template; replicate all boilerplate (head, nav, footer, JSON-LD scaffolding pattern) verbatim, swap only page-specific content.
SET: title ~"Hardscaping & Landscaping Terms Glossary (Ontario) | Seven Stones", meta description 140-160 chars, canonical https://www.sevenstoneslandscape.ca/blog/hardscaping-terms-glossary-ontario/, og tags, exactly one h1, Article schema (datePublished/dateModified 2026-06-17, author #riaad, publisher #business), BreadcrumbList (Home>Blog>this).
CONTENT: define 14-18 terms a homeowner meets in quotes, each a short standalone definition (2-4 sentences) good for AI extraction: polymeric sand, 3/4-clear stone (clear vs dense-grade), compacted granular base, geotextile / non-woven fabric, edge restraint, Halton Till clay, freeze-thaw, frost heave, 4000 PSI air-entrained concrete, control joints (saw-cut), cure-and-seal, exposed aggregate, stamped concrete, geogrid, armour stone, segmental retaining wall, ICPI certification, weeping tile / sock pipe. Use an <h2> per term or a definition list. ALSO add a FAQPage JSON-LD whose questions are "What is <term>?" for the 8 most-searched terms, with answer text matching the visible definitions EXACTLY. Add 3-5 contextual internal links to relevant service/blog pages (verify each exists before linking).
VERIFY before returning: every JSON-LD block parses; one h1; canonical/title/description present; FAQ schema text matches visible. Report what you built. Do NOT edit sitemap or other files.`,
    { label:'build:glossary', phase:'Build' }),
  () => agent(
`Repo root: ${ROOT}. Finish the drainage-cluster hub-and-spoke rebalance (DIFFERENTIATE, do not delete any page).
${CANON}
The HUB is solutions/yard-drainage-ontario/index.html (broad term). The SPOKES are solutions/{backyard-drainage,flooding-backyard,lawn-drainage-problems,water-pooling-yard,yard-grading-drainage}/index.html. solutions/flood-proof-your-property/index.html is currently ORPHANED (no sibling links).
DO:
1. On EACH of the 5 spoke pages, ensure ONE natural contextual body link UP to the hub /solutions/yard-drainage-ontario/ (e.g. "part of a complete yard drainage plan"). Skip if already present.
2. On the hub page, ensure it links DOWN to each of the 5 spokes (in body or a related-solutions list). Add any missing.
3. Connect the orphan: add a contextual link to /solutions/flood-proof-your-property/ from at least 2 of the drainage pages (hub + one spoke) where it fits naturally.
Place links inside existing prose/markup; no link dumps; do not break existing HTML; verify every link target exists on disk.
VERIFY: every link you added resolves to a real file; JSON-LD on edited pages still parses. Report exactly what you changed per file.`,
    { label:'fix:drainage-links', phase:'Build' }),
])

phase('Verify')
const verify = await agent(
`READ-ONLY. Repo root: ${ROOT}. Validate: (1) blog/hardscaping-terms-glossary-ontario/index.html exists, has valid JSON-LD in every block, one h1, canonical/title/description, and its FAQPage question text matches the visible definitions; (2) add it to sitemap.xml if not present (one <url>, loc .../blog/hardscaping-terms-glossary-ontario/, lastmod 2026-06-17, changefreq monthly, priority 0.7, matching existing blog entry format) and confirm well-formed XML; (3) the drainage hub solutions/yard-drainage-ontario/ is now linked from the 5 spoke pages and links back to them, and flood-proof-your-property is linked from >=2 pages; (4) all internal links touched resolve to real files. Report pass/fail per check.`,
  { label:'verify', phase:'Verify' })

return { build, verify }
