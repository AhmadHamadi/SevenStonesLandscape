export const meta = {
  name: 'sevenstones-concrete-content',
  description: 'Build 2 new concrete-cluster blog pages (lifespan + 3-way comparison), integrate into sitemap + internal links, then verify',
  phases: [
    { title: 'Build', detail: 'create 2 new blog pages cloning existing template' },
    { title: 'Integrate', detail: 'add to sitemap.xml + internal links from related pages' },
    { title: 'Verify', detail: 'JSON valid, sitemap + links resolve' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const CANON = `CANONICAL FACTS (use exactly; never invent): Seven Stones Landscape, +1 (289) 700-0312, info@sevenstoneslandscape.ca, founded 2013, Hamilton ON, Mon-Sat 7 AM-7 PM, $5M liability, WSIB, 5-year workmanship warranty, ICPI certified, Landscape Ontario member, authorized Unilock & Techo-Bloc installer. Domain: https://www.sevenstoneslandscape.ca/ (https+www+trailing slash). PRICES: interlock driveway 2-car 400-600 sqft $28,000-$48,000 ($55-80/sqft), lasts 25-40 yrs; concrete driveway 2-car $14,000-$24,000 all-in, lasts 25-35 yrs; asphalt driveway 2-car roughly $4,000-$9,000 ($7-13/sqft, MARKET-TYPICAL context only - Seven Stones does NOT install asphalt), lasts 12-20 yrs. Concrete spec: 5 inch 4000 PSI air-entrained over 6 inch 3/4-clear base, saw-cut joints, cure-and-seal, reseal every 3-5 yrs on a siloxane sealer; Halton Till clay. Author entity Person @id https://www.sevenstoneslandscape.ca/#riaad (Riaad, Owner & Project Manager, ICPI). Publisher @id https://www.sevenstoneslandscape.ca/#business.`
const STYLE = `STYLE: write like a human expert, NOT AI. Specific, concrete, local (Hamilton/Burlington/Oakville, Halton Till clay, freeze-thaw, road salt). Use commas not em-dashes. Visible HTML apostrophes as &#x27;, ampersands as &amp;. In JSON-LD use straight apostrophes, no double-quotes inside answer text. No fluff, no keyword-stuffing. Lead with a direct, quotable answer (good for AI Overviews).`

const PAGES = [
  { slug: 'how-long-does-concrete-driveway-last-ontario',
    template: 'blog/how-long-does-interlock-last-ontario/index.html',
    brief: `New blog page answering "How long does a concrete driveway last in Ontario?". Lead answer: a properly built concrete driveway lasts 25 to 35 years in Ontario (vs 25 to 40 for interlock). Cover: what drives lifespan (4000 PSI air-entrained mix, 6-inch base on Halton Till clay, drainage, saw-cut control joints, year-one siloxane sealer, reseal every 3-5 yrs, salt exposure), why Ontario concrete fails early (low air entrainment, thin base, skipped sealing, frost heave), signs it is failing, repair vs replace, and a short comparison to interlock lifespan. Include a FAQ section (5-6 Qs) with FAQPage schema matching visible text. Title ~"How Long Does a Concrete Driveway Last in Ontario? (2026 Guide)". Internal-link to /services/concrete/driveways/, /blog/why-ontario-concrete-cracks-2026-guide/, /blog/concrete-driveway-cost-hamilton-2026/.` },
  { slug: 'interlock-vs-concrete-vs-asphalt-driveway-cost',
    template: 'blog/interlock-vs-stamped-concrete-cost-comparison/index.html',
    brief: `New blog page: "Interlock vs Concrete vs Asphalt Driveway Cost in Ontario (2026)". A 3-way head-to-head. Lead answer with the canonical 2-car (400-600 sqft) ranges: asphalt roughly $4,000-$9,000 (cheapest, lasts 12-20 yrs), concrete $14,000-$24,000 all-in (25-35 yrs), interlock $28,000-$48,000 (most expensive, lasts 25-40 yrs and repairs invisibly). Include a comparison TABLE (cost, lifespan, maintenance, repairability, looks, best-for). Be truthful: interlock is the premium option - it costs the most up front AND over its life, but lasts longest, repairs invisibly, and adds the most curb appeal/resale; asphalt is cheapest but shortest-lived and needs resealing; concrete is the middle. Do NOT claim interlock is cheapest long-term. Note Seven Stones installs interlock and concrete (not asphalt). FAQ section (5-6 Qs) + FAQPage schema matching visible. Internal-link to /service-areas/hamilton/interlock-driveways/, /service-areas/hamilton/concrete-driveways/, /blog/interlock-driveway-cost-hamilton-burlington-oakville/.` },
]

const PAGE_SCHEMA = { type:'object', additionalProperties:false, required:['created_path','json_valid','title','word_count'], properties:{ created_path:{type:'string'}, title:{type:'string'}, word_count:{type:'integer'}, json_valid:{type:'boolean'}, internal_links:{type:'array',items:{type:'string'}}, notes:{type:'string'} } }

phase('Build')
const built = await parallel(PAGES.map(p => () => agent(
`Repo root: ${ROOT}. Create a NEW blog page at blog/${p.slug}/index.html.
${CANON}
${STYLE}
METHOD: Read the existing page ${p.template} and use it as the EXACT structural template. Replicate ALL boilerplate verbatim: the full <head> structure, the top-bar/nav, the footer, the JSON-LD scaffolding pattern (Article + FAQPage + BreadcrumbList), the breadcrumb markup, the byline. Then replace ONLY the page-specific content with new material.
SET correctly for the new page: <title>, meta description (140-160 chars), <link rel=canonical> to https://www.sevenstoneslandscape.ca/blog/${p.slug}/, og:url/og:title/og:description/og:image, exactly ONE <h1>, Article schema headline/description/url/mainEntityOfPage/datePublished "2026-06-16"/dateModified "2026-06-16"/author Person #riaad/publisher #business, a BreadcrumbList (Home > Blog > this page), and a FAQPage whose questions EXACTLY match the visible FAQ text.
CONTENT BRIEF: ${p.brief}
Write 900-1400 words of genuinely useful, locally-specific content. Do NOT add aggregateRating/Review schema. Do NOT edit sitemap.xml or any other file in this phase (integration happens later) - only create blog/${p.slug}/index.html.
VERIFY before returning: every JSON-LD block parses as valid JSON; exactly one h1; canonical/og/title/description present. Report created_path, title, word_count, json_valid, and the internal_links you embedded.`,
  { label:`build:${p.slug}`, phase:'Build', schema:PAGE_SCHEMA })))

const ok = built.filter(Boolean).filter(b=>b.json_valid)
phase('Integrate')
const integrate = await agent(
`Repo root: ${ROOT}. Two new blog pages were created: ${ok.map(b=>b.created_path).join(', ')}.
1. Add BOTH to sitemap.xml: insert a <url> entry for each (loc https://www.sevenstoneslandscape.ca/blog/<slug>/, lastmod 2026-06-16, changefreq monthly, priority 0.7) following the EXACT format of existing blog <url> entries. Do not duplicate if already present.
2. Add ONE contextual internal link to each new page from 2 relevant existing pages (e.g. the related blogs / service pages named in each brief), placed naturally in body prose - do not create link dumps, do not break existing markup.
VERIFY: sitemap.xml is well-formed XML; the 2 new <loc>s resolve to real files; the internal links you added resolve. Report exactly what you changed.`,
  { label:'integrate', phase:'Integrate' })

phase('Verify')
const verify = await agent(
`READ-ONLY. Repo root: ${ROOT}. Validate: (1) blog/${PAGES[0].slug}/index.html and blog/${PAGES[1].slug}/index.html exist and every JSON-LD block in each parses as valid JSON; (2) both new URLs appear exactly once in sitemap.xml; (3) each new page has exactly one <h1>, a canonical, a title, and a meta description; (4) no duplicate <title> vs other pages. Report pass/fail per check with specifics.`,
  { label:'verify', phase:'Verify' })

return { built: ok, integrate, verify }
