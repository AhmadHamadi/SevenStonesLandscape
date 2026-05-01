# SEO Agent Pack

Reusable SEO audit agents for coded websites, public URL-only audits, future client websites, local businesses, service-area sites, ecommerce sites, city pages, and Google Business Profile ranking work.

Use this folder by copying `seo-agent/` into any website repo or by referencing it during a public website audit. Start with `shared-audit-protocol.md`, `audit-runbook.md`, and `00-audit-orchestrator.md`. Each agent should produce findings with evidence, page URLs or file paths, priority, and recommended fixes.

## Required Support Files

- `shared-audit-protocol.md`
  - Required operating rules for every agent.
  - Defines how agents share evidence, classify issues, avoid risky SEO, and decide whether non-indexed URLs are intentional or harmful.

- `audit-input-template.md`
  - Intake form for website, business, city, competitor, GSC, GA4, GBP, ranking, crawl, and backlink data.

- `audit-runbook.md`
  - Shows which agents to run for public URL audits, coded website audits, local GBP/Maps audits, ecommerce audits, programmatic SEO audits, and Search Console emergencies.
  - Prevents running every specialist when a smaller team is enough.

- `agent-test-plan.md`
  - Test scenarios for indexability, GBP competitor gaps, cannibalization, and final audit readiness.

- `one-time-audit-output-template.md`
  - Final report format for one-time audits, including direct answer, root causes, evidence, priorities, and a 30/60/90 plan.

- `external-seo-tool-benchmark.md`
  - Compares the agent pack against GSC, GBP, Lighthouse, Unlighthouse, crawl tools, rank trackers, and paid crawler workflows.

- `ai-crawlability-protocol.md`
  - Rules and checks for Google AI features, OpenAI crawler controls, text extractability, snippet controls, entity clarity, and AI search readiness.

- `large-codebase-review-protocol.md`
  - Efficient review process for large repos, monorepos, generated routes, CMS-driven sites, and framework-heavy projects.

- `existing-seo-skills-review.md`
  - Notes what was reviewed from the existing project SEO skills and what was improved in this reusable agent pack.

- `validate-seo-agent-pack.ps1`
  - Reusable validation script that checks files, references, coverage terms, scenarios, protocol links, and ASCII cleanliness.

## Lean Execution Rule

Do not run every agent by default. Use `audit-runbook.md` to choose the smallest useful team.

Most audits should start with:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `16-competitor-evidence-extraction-agent.md` when competitor evidence is needed
- The 4-8 relevant specialist agents
- `18-seo-quick-wins-implementation-agent.md` for simple changes that can be done now
- `17-seo-measurement-reporting-agent.md` when tracking, reporting, or ongoing improvement is needed
- `19-agent-pack-optimization-loop-agent.md` after substantial audits to improve instructions, workflows, benchmarks, and tests
- `14-agent-qa-improvement-agent.md`

For one-time audits, finish with `one-time-audit-output-template.md`.

## Tool And Model Reality

These Markdown files are agent instructions, not a standalone crawler or API.

- They use whatever LLM/model is running them.
- They use whatever tools that environment provides: browser, web search, HTTP fetch, crawler, Lighthouse, Search Console exports, GBP screenshots, SEO tools, or codebase access.
- If tool access is missing, the agents must ask for URLs, GBP links, screenshots, exports, or manual data.
- The agents must not invent competitor data, GBP categories, services, reviews, or rankings.
- Public web extraction must respect robots.txt, site terms, rate limits, and access controls.

## Recommended Agent Team

1. `00-audit-orchestrator.md`
   - Coordinates the audit.
   - Assigns tasks to the other agents.
   - Combines findings into a final priority roadmap.

2. `15-universal-website-crawl-intake-agent.md`
   - Turns any URL, GBP link, codebase, crawl export, or client brief into a shared evidence base.
   - Makes the pack work for public websites, coded websites, and future client audits.

3. `01-keyword-strategy-agent.md`
   - Finds the best keywords the website and each page should rank for.
   - Groups keywords by intent, page type, funnel stage, and city.

4. `02-page-mapping-cannibalization-agent.md`
   - Checks whether multiple pages are fighting for the same keyword.
   - Creates a page-to-keyword map and recommends merges, redirects, rewrites, or new targets.

5. `03-technical-seo-code-agent.md`
   - Reviews public rendered pages and/or codebase implementation for indexability, metadata, schema, canonical tags, sitemap, robots, headings, internal links, speed risks, and structured data.

6. `04-on-page-content-eeat-agent.md`
   - Reviews content quality, search intent match, expertise, trust, proof, FAQs, and conversion usefulness.

7. `05-local-seo-google-maps-agent.md`
   - Reviews local ranking factors, Google Maps visibility, city signals, GBP optimization, reviews, citations, proximity, relevance, and prominence.

8. `06-competitor-serp-gap-agent.md`
   - Compares the site against organic and local competitors.
   - Finds content gaps, SERP feature gaps, backlink/citation gaps, title/H1 patterns, and homepage/service page positioning.

9. `07-programmatic-location-pages-agent.md`
   - Audits or plans scalable service + city/location pages.
   - Prevents thin, duplicated, doorway-style pages.

10. `08-schema-entity-trust-agent.md`
   - Audits schema, entity clarity, LocalBusiness data, NAP consistency, organization trust signals, authorship, reviews, and social/entity corroboration.

11. `09-authority-backlinks-citations-agent.md`
   - Audits off-page authority, backlinks, local citations, brand mentions, partnerships, directories, and local prominence opportunities.

12. `10-core-web-vitals-ux-conversion-agent.md`
   - Audits Core Web Vitals, mobile UX, performance, accessibility basics, and conversion friction that can hurt SEO outcomes.

13. `11-ai-search-visibility-agent.md`
   - Audits visibility for AI answers, LLM retrieval, entity clarity, concise answer blocks, `llms.txt`, and content extractability.

14. `12-google-search-indexability-agent.md`
   - Diagnoses Google Search Console Page indexing reasons such as redirects, canonical alternates, noindex, discovered/crawled not indexed, robots, sitemap, and canonical problems.

15. `13-gbp-competitor-categories-services-agent.md`
   - Compares top GBP competitors, especially primary categories, secondary categories, services, reviews, photos, attributes, service areas, and profile completeness.

16. `14-agent-qa-improvement-agent.md`
   - Reviews all agent outputs, finds contradictions, tests coverage, removes generic advice, and improves the final audit before delivery.

17. `16-competitor-evidence-extraction-agent.md`
   - Extracts competitor website and GBP evidence such as titles, meta descriptions, H1/H2s, schema, local signals, GBP categories/services when visible or supplied, reviews, photos, and descriptions.

18. `17-seo-measurement-reporting-agent.md`
   - Creates measurement plans for GSC, GA4, GBP insights, rankings, local pack snapshots, leads, conversions, and post-fix validation.

19. `18-seo-quick-wins-implementation-agent.md`
   - Turns audit findings into simple immediate optimization changes: do now, do today, do this week, and do this month.

20. `19-agent-pack-optimization-loop-agent.md`
   - Reviews audit performance and improves the agent pack instructions, benchmarks, workflows, templates, and tests.

## What This Covers

- Keyword research and keyword-to-page mapping
- Public URL-only website audits
- Codebase/repo SEO audits
- Client website and business audits
- Search intent matching
- On-page SEO
- Technical SEO
- Code-level SEO implementation
- Metadata, canonicals, robots, sitemap, redirects
- Google Search Console indexability reasons
- Page with redirect
- Alternate page with proper canonical tag
- Excluded by noindex tag
- Discovered and crawled currently not indexed
- Schema and entity optimization
- Internal linking
- Content quality and E-E-A-T
- Cannibalization and duplicate intent
- Programmatic SEO and location pages
- Local SEO
- Google Business Profile optimization
- GBP competitor categories and services
- Google Maps ranking factors
- Competitor SERP gap analysis
- Competitor website extraction: titles, meta descriptions, H1s, headings, schema, local/trust signals
- GBP competitor extraction: categories, services, descriptions, reviews, photos, attributes when visible or supplied
- Review, citation, and local authority signals
- Off-page authority, backlinks, and brand mentions
- Core Web Vitals and mobile page experience
- AI search visibility and answer-engine readiness
- AI crawlability, crawler controls, snippet eligibility, text extractability, and entity clarity
- Audit QA, contradiction checks, and self-improvement
- Measurement, reporting, baselines, post-fix validation, and ongoing improvement
- Quick wins and simple optimization changes that can be done immediately
- Comparison against external SEO tools and crawler workflows
- Large codebase and monorepo SEO review workflows
- Optimization loop for improving agent instructions and tests over time
- Prioritization by impact and effort

## Ranking Expectation

The pack is designed to improve controllable SEO, GBP, and local ranking factors. It cannot guarantee first-place rankings because Google rankings depend on competition, proximity, query intent, authority, timing, personalization, and algorithmic systems outside our control.

## Suggested Workflow

1. Collect inputs using `audit-input-template.md`.
2. Load `shared-audit-protocol.md`.
3. Load `audit-runbook.md`.
4. For one-time audits, load `one-time-audit-output-template.md`.
5. Run `00-audit-orchestrator.md`.
6. Run `15-universal-website-crawl-intake-agent.md` to build the evidence base.
7. Run `16-competitor-evidence-extraction-agent.md` when competitor evidence is part of the question.
8. Run only the relevant specialist agents.
9. Run `18-seo-quick-wins-implementation-agent.md` to extract immediate changes from the findings.
10. Run `17-seo-measurement-reporting-agent.md` when baseline tracking or ongoing reporting is needed.
11. Run `14-agent-qa-improvement-agent.md`.
12. Run `19-agent-pack-optimization-loop-agent.md` after substantial audits when agent instructions/tests should be improved.
13. Combine outputs into:
   - Critical technical fixes
   - Simple changes to do now
   - Search Console indexability fixes
   - Keyword/page map
   - Cannibalization fixes
   - Local SEO and GBP action plan
   - GBP competitor category/service gap plan
   - Content rewrite plan
   - New page opportunities
   - Schema/entity improvements
   - Measurement and reporting plan
   - 30/60/90 day SEO roadmap

## Official Reference Baseline

Use these as the source-of-truth baseline when agent recommendations conflict:

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search technical requirements: https://developers.google.com/search/docs/essentials/technical
- Google helpful, reliable, people-first content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search Console Page indexing report: https://support.google.com/webmasters/answer/7440203
- Google Search Console URL Inspection tool: https://support.google.com/webmasters/answer/9012289
- Google canonicalization guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google noindex guidance: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Google Business Profile local ranking guidance: https://support.google.com/business/answer/7091
- Google Business Profile category guidance: https://support.google.com/business/answer/14368911
- Google Business Profile services guidance: https://support.google.com/business/answer/9455399
- Google Business Profile quality guidelines: https://support.google.com/business/answer/3038177
- Google robots.txt guidance: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google image SEO best practices: https://developers.google.com/search/docs/appearance/google-images
- Google title link best practices: https://developers.google.com/search/docs/appearance/title-link
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google AI features and your website: https://developers.google.com/search/docs/appearance/ai-overviews
- Google robots meta and snippet controls: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- OpenAI crawlers: https://platform.openai.com/docs/gptbot
- Web.dev Core Web Vitals: https://web.dev/articles/vitals

## Output Standard

Every finding should include:

- Priority: Critical, High, Medium, Low
- Type: Technical, Indexability, Content, Keyword, Local, GBP, GBP Competitor, Schema, Internal Link, Cannibalization, Authority, UX, AI Search
- Evidence: URL, file path, keyword, competitor, or code reference
- Problem
- Why it matters
- Recommended fix
- Expected impact
- Effort: Small, Medium, Large
