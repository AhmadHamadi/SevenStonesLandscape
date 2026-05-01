# SEO Agent Pack Test Plan

Use this file to test whether the agent pack is ready to import into any website audit.

## Structural Tests

- [ ] README lists every numbered agent file.
- [ ] Orchestrator lists every specialist agent.
- [ ] Every agent has Role, Primary Goal, Analyze, Deliverables, and Rules sections where appropriate.
- [ ] Every agent requires evidence for recommendations.
- [ ] Every agent follows `shared-audit-protocol.md`.
- [ ] The pack includes agents for technical SEO, content, keywords, cannibalization, local SEO, GBP, Maps, competitors, schema, authority, performance, AI visibility, Search Console indexability, and QA.
- [ ] The pack includes a universal intake/crawl process for public URL-only audits.
- [ ] The pack includes competitor extraction for titles, meta descriptions, H1/H2s, schema, GBP categories/services when visible or supplied, and evidence gaps.
- [ ] The pack includes measurement/reporting tests for GSC, GA4, GBP insights, leads, baselines, and post-fix validation.
- [ ] The runbook prevents running every specialist by default.
- [ ] One-time audits use `one-time-audit-output-template.md`.
- [ ] One-time audits include simple changes to do now.
- [ ] The pack is benchmarked against external SEO tools and crawlers.
- [ ] The pack includes a large-codebase review protocol.
- [ ] The pack includes an optimization loop for improving instructions, benchmarks, workflows, and tests after audits.
- [ ] The pack includes AI crawlability checks for Google AI eligibility, OpenAI crawler controls, snippet controls, text extractability, and entity clarity.

## One-Time Audit Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| User wants one full audit and plan | Run one-time comprehensive audit mode and output direct answer, root causes, priority roadmap, measurement plan, and 30/60/90 plan. |
| User only provides URL | Build public evidence, identify gaps, and mark GSC/GBP/code assumptions clearly. |
| User provides URL + GBP + competitors | Run intake, competitor extraction, local/GBP, keyword, cannibalization, content, technical, measurement, and QA. |
| User asks for the "best possible suggestions" | Prioritize by impact, evidence, effort, and business value; avoid generic checklist advice. |
| User asks for simple changes now | Run Quick Wins Implementation Agent and separate do now, do today, do this week, and do this month. |

## Public URL Audit Scenario Tests

Run these test scenarios against the Universal Website Crawl And Intake Agent and Orchestrator:

| Scenario | Expected Agent Decision |
|---|---|
| Only website URL is provided | Build public evidence from homepage, navigation, robots.txt, sitemap, rendered metadata, schema, internal links, and key page types. |
| URL plus GBP link is provided | Build both website and GBP evidence, then run local/GBP specialists. |
| Future client has no code access | Mark code-level fixes as "Needs implementation access" and still audit public SEO. |
| Large site has thousands of pages | Crawl representative samples by template and request full crawl exports if needed. |
| Business type is unclear | Infer likely type from public evidence and mark as "Needs client confirmation." |
| Company name only is provided | Identify likely official website/GBP and mark identity confidence; ask for confirmation if ambiguous. |
| GBP URL only is provided | Build GBP evidence first, use website link from GBP if available, and mark website SEO as limited if no URL exists. |
| User asks "why are we last on Google Maps?" | Run question-driven diagnostic mode, focus on local ranking root causes, then provide prioritized fixes. |
| User asks "why are our SEO pages last?" | Check indexability, intent, cannibalization, content quality, internal links, authority, and competitors before recommending rewrites. |

## Competitor Extraction Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| Competitor URL is provided | Extract status, title, meta description, H1, H2 outline, canonical, robots, schema, local/trust signals, and CTA. |
| Competitor GBP link is provided | Extract visible/supplied name, website, categories, services, reviews, photos, hours, description, and evidence gaps. |
| GBP services/categories are not visible | Mark as "Not visible" or "Needs owner/tool access"; do not guess. |
| Site blocks crawling or requires CAPTCHA/login | Do not bypass; use allowed browser-visible evidence, exports, or ask for manual data. |
| Local pack ranking is checked once | Record keyword, city/location, date, and treat it as a snapshot, not permanent truth. |
| Competitor has keyword-stuffed business name | Flag as possible policy/spam risk; do not recommend copying it. |

## Measurement Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| Client asks "are we improving?" | Establish baseline, KPI map, date range, source, and reporting cadence. |
| No GA4/GSC/GBP access | Mark measurement gaps and request access/exports; do not invent traffic or ranking data. |
| Leads increased but tracking is broken | Flag attribution risk before claiming SEO success. |
| Maps ranking changed after one check | Treat as a snapshot and require keyword, city/location, device, and date. |
| SEO fixes were deployed | Create post-fix validation plan using crawl, GSC inspection, GSC performance, GA4, and GBP insights where applicable. |
| User asks to rank first | State that rankings cannot be guaranteed; focus on controllable improvements and measurement. |

## AI Crawlability Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| User asks how to improve AI crawlability | Check Google indexability/snippet eligibility, robots, OpenAI crawler controls, text extraction, structured data, entity clarity, and helpful content. |
| Page is noindex | Mark as ineligible for normal Google Search and Google AI features unless intentionally excluded. |
| Page uses nosnippet/max-snippet | Explain it can limit snippets and direct input for Google AI features; verify business intent. |
| OAI-SearchBot is disallowed | Explain this can affect ChatGPT search visibility; confirm business preference before changing. |
| GPTBot is disallowed | Explain this relates to model-training crawl; do not recommend allowing unless business wants it. |
| Important content is only in images/PDF/video | Recommend HTML text equivalents and structured summaries. |
| Site has llms.txt | Review it as optional documentation, not a Google AI requirement. |
| Agent suggests special AI schema | Reject unless it is normal structured data that matches visible page content. |

## Quick Wins Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| Missing title on important page | Recommend a specific title fix if page intent is known. |
| Sitemap includes redirected URL | Recommend removing redirected URL and including canonical 200 URL. |
| GBP has missing services that business truly offers | Add services and support them with website content where possible. |
| Important service page has no internal links | Recommend contextual internal links from homepage/service hub. |
| Page has weak CTA | Recommend clear call/quote/contact CTA if conversion is the page goal. |
| Fix requires redesign or major content production | Do not classify as quick win; move to roadmap. |

## Large Codebase Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| Monorepo with multiple apps | Identify deployed app before auditing unrelated packages. |
| Framework-heavy site | Find metadata, sitemap, robots, schema, route, and content generation logic first. |
| CMS-driven site | Audit both templates and content/data sources. |
| Thousands of pages | Sample by page type and expand only where pattern risk is confirmed. |
| Source code differs from rendered output | Mark as needing rendered verification and inspect live output when possible. |

## Optimization Loop Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| Audit missed an edge case | Update agent instructions and add a validation/test case. |
| Two agents duplicated work | Improve runbook routing or handoff rules instead of adding another agent. |
| New SEO tool benchmark is useful | Add it to `external-seo-tool-benchmark.md` and update tests if needed. |
| LLM made unsupported claims | Strengthen evidence rules and QA checks. |

## Search Console Indexability Scenario Tests

Run these test scenarios against the Search Console Indexability Agent:

| Scenario | Expected Agent Decision |
|---|---|
| Important service page has `noindex` | Critical issue; remove noindex meta/header and retest with URL Inspection. |
| Thank-you page has `noindex` | Likely intentional; confirm it is not in sitemap and not meant to rank. |
| Old URL shows Page with redirect | Usually OK if redirect is intentional; remove old URL from sitemap/internal links and ensure target is indexable. |
| Money page redirects unexpectedly | Critical issue; inspect redirect rule and restore/canonicalize the intended page. |
| Alternate page with proper canonical tag | Usually OK if duplicate points to the preferred canonical; verify canonical is expected and indexed. |
| Important page canonicalizes to a different page | High/Critical issue; fix canonical and internal links. |
| Discovered - currently not indexed | Diagnose crawl priority, internal links, sitemap inclusion, thin/duplicate content, server issues, and page value. |
| Sitemap URL returns 404, redirect, noindex, or non-canonical | High issue; sitemap should contain only canonical indexable URLs. |
| Page has noindex but is blocked by robots.txt | Explain Google may not see the noindex if crawling is blocked; fix based on intended outcome. |
| HTTP and HTTPS versions both accessible | Pick HTTPS canonical, redirect HTTP, verify sitemap/internal links use HTTPS. |
| www and non-www both accessible | Pick preferred host, redirect alternate, verify canonicals and sitemap. |
| Trailing slash and non-trailing slash both accessible | Normalize one version with redirects/canonicals/internal links. |
| Important content appears only after JavaScript interaction | Flag rendering/indexability risk and ask for rendered HTML/browser evidence. |
| X-Robots-Tag noindex is set in headers | Treat the header as a possible indexing blocker even when HTML looks fine. |
| Google-selected canonical differs from user canonical | Investigate duplicate signals, internal links, sitemap choice, and content similarity. |
| Internal search/filter pages are indexable | Usually recommend noindex/canonical/robots strategy depending on crawl and index goals. |

## GBP Competitor Scenario Tests

Run these test scenarios against the GBP Competitor Categories Services Agent:

| Scenario | Expected Agent Decision |
|---|---|
| Competitors use a more specific primary category | Recommend the most accurate specific category, not keyword stuffing. |
| Competitors list services missing from our GBP | Add legitimate services with accurate descriptions if the business truly offers them. |
| Competitor business names contain keywords | Do not copy spam; flag possible spam separately. |
| Competitors have more reviews and better rating | Build compliant review acquisition and response plan. |
| Competitors have stronger photos/videos | Recommend real project/team/service photos, not stock filler. |
| Business is far from searcher/target city | State proximity limitation clearly; improve relevance/prominence without promising proximity can be fully overcome. |
| Competitor uses spammy keyword-stuffed name | Flag possible spam/policy issue; do not copy the tactic. |
| GBP category is too broad | Recommend the most accurate specific category supported by the real business. |
| GBP service exists but website has no matching page/content | Add or improve supporting website content before relying on GBP service alone. |
| Service-area business hides address | Audit service area, local proof, city landing pages, reviews, and prominence without assuming a visible address is required. |

## Cannibalization Scenario Tests

| Scenario | Expected Agent Decision |
|---|---|
| Homepage and service page both target same service keyword | Decide which page owns the keyword; retarget one page or adjust internal links. |
| Two city pages differ only by city name | Flag duplicate/thin location page risk and require unique local proof. |
| Blog post ranks for money keyword while service page does not | Use blog as support page; strengthen service page and internal links. |

## Final Output Tests

- [ ] Final report separates confirmed issues from assumptions.
- [ ] Final report states the audit mode and data access level.
- [ ] Final report includes priority, evidence, impact, effort, and owner.
- [ ] Final report distinguishes website fixes from GBP fixes.
- [ ] Final report includes a 30/60/90 day roadmap.
- [ ] Final report includes no fake claims, no fake reviews, no fake schema, no keyword-stuffed business names, and no doorway page recommendations.
