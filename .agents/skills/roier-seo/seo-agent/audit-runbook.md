# SEO Agent Audit Runbook

Use this runbook to choose the smallest useful agent team for each audit. Do not run every specialist by default.

## Core Principle

The agent pack is modular. The Orchestrator decides which agents are required based on the audit type, available data, business model, and risk. Specialists are only used when their scope materially improves the audit.

## Audit Modes

### One-Time Comprehensive Audit Mode

Use when the user wants the best possible one-time audit and implementation plan.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `16-competitor-evidence-extraction-agent.md` when competitors, GBP, or ranking comparisons are involved
- The smallest relevant specialist set for the business type and question
- `18-seo-quick-wins-implementation-agent.md`
- `17-seo-measurement-reporting-agent.md`
- `14-agent-qa-improvement-agent.md`
- `19-agent-pack-optimization-loop-agent.md` after the audit if the pack should learn from missing coverage or weak output

Final output must use `one-time-audit-output-template.md`.

Required deliverable:

- Direct answer to the user's question
- Root-cause diagnosis
- Evidence-backed priority roadmap
- Simple changes to do now
- Website SEO fixes
- GBP/local fixes if relevant
- Competitor gap plan
- GSC/indexability plan
- Cannibalization/page map
- Measurement plan
- 30/60/90 day implementation plan

### 0. Question-Driven Diagnostic Mode

Use when the user asks a direct business question, such as:

- "Why are we last on Google Maps?"
- "Why are our SEO pages ranking last?"
- "Why is this competitor beating us?"
- "Why are we not getting leads?"
- "What should we fix first?"
- "Here is a company name, website, or GBP link. Tell me what is wrong."

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `16-competitor-evidence-extraction-agent.md` if competitors are named or ranking comparison is requested
- The smallest relevant specialist set below
- `17-seo-measurement-reporting-agent.md` if the user wants ongoing improvement, reporting, lead tracking, or proof that fixes worked
- `18-seo-quick-wins-implementation-agent.md` if the user wants simple changes they can make now
- `14-agent-qa-improvement-agent.md`

If the question is about Google Maps or GBP, add:

- `05-local-seo-google-maps-agent.md`
- `13-gbp-competitor-categories-services-agent.md`
- `09-authority-backlinks-citations-agent.md`
- `17-seo-measurement-reporting-agent.md` when GBP insights, leads, or ranking progress need tracking

If the question is about organic SEO pages ranking poorly, add:

- `01-keyword-strategy-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `03-technical-seo-code-agent.md`
- `04-on-page-content-eeat-agent.md`
- `06-competitor-serp-gap-agent.md`
- `12-google-search-indexability-agent.md` when GSC/indexing evidence exists or pages may not be indexed.

Output a root-cause answer first, then a prioritized fix plan.

### 1. Public URL Audit

Use when the only input is a website URL, business type, and maybe a target city.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `16-competitor-evidence-extraction-agent.md` when competitor pages are part of the audit
- `01-keyword-strategy-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `03-technical-seo-code-agent.md`
- `04-on-page-content-eeat-agent.md`
- `06-competitor-serp-gap-agent.md`
- `14-agent-qa-improvement-agent.md`

Add `17-seo-measurement-reporting-agent.md` when baseline metrics, GSC/GA4/GBP reporting, lead tracking, or monthly SEO progress reporting are needed.

Add if local:

- `05-local-seo-google-maps-agent.md`
- `13-gbp-competitor-categories-services-agent.md`
- `09-authority-backlinks-citations-agent.md`

### 2. Coded Website Audit

Use when a repo/codebase is available.

For large repos, monorepos, framework-heavy apps, or CMS-driven projects, load `large-codebase-review-protocol.md` before running technical/code agents.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `03-technical-seo-code-agent.md`
- `12-google-search-indexability-agent.md`
- `01-keyword-strategy-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `08-schema-entity-trust-agent.md`
- `10-core-web-vitals-ux-conversion-agent.md`
- `14-agent-qa-improvement-agent.md`

Add `17-seo-measurement-reporting-agent.md` when fixes need post-launch validation.

Add `07-programmatic-location-pages-agent.md` only if the site has many location, service-area, comparison, template, product, or directory pages.

### 3. Local Business And Google Maps Audit

Use when auditing a contractor, clinic, restaurant, local service business, home service company, or service-area business.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `16-competitor-evidence-extraction-agent.md`
- `05-local-seo-google-maps-agent.md`
- `13-gbp-competitor-categories-services-agent.md`
- `01-keyword-strategy-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `04-on-page-content-eeat-agent.md`
- `09-authority-backlinks-citations-agent.md`
- `14-agent-qa-improvement-agent.md`

Add `17-seo-measurement-reporting-agent.md` for GBP insights, local ranking snapshots, calls, forms, leads, and local SEO progress reporting.

Add `12-google-search-indexability-agent.md` if Search Console data is available or key pages are not indexed.

### 4. Search Console Indexability Emergency

Use when the main problem is "pages are not indexed" or GSC shows Page with redirect, Alternate page with proper canonical tag, Excluded by noindex, Discovered - currently not indexed, Crawled - currently not indexed, Duplicate, Soft 404, Not found, or Server error.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `12-google-search-indexability-agent.md`
- `03-technical-seo-code-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `14-agent-qa-improvement-agent.md`

Add `17-seo-measurement-reporting-agent.md` when validating whether fixed pages become indexable, gain impressions, and receive organic clicks/leads.

### 5. Ecommerce Audit

Use for product/category/collection stores.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `01-keyword-strategy-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `03-technical-seo-code-agent.md`
- `04-on-page-content-eeat-agent.md`
- `08-schema-entity-trust-agent.md`
- `10-core-web-vitals-ux-conversion-agent.md`
- `14-agent-qa-improvement-agent.md`

Focus especially on category pages, faceted navigation, product schema, duplicate/filter URLs, canonicalization, image SEO, internal linking, reviews, availability, pricing, and merchant trust signals.

### 6. Programmatic SEO Or Location Page Audit

Use for service + city pages, directory pages, comparison pages, templates, integrations, or pages created at scale.

Run:

- `00-audit-orchestrator.md`
- `15-universal-website-crawl-intake-agent.md`
- `07-programmatic-location-pages-agent.md`
- `02-page-mapping-cannibalization-agent.md`
- `12-google-search-indexability-agent.md`
- `04-on-page-content-eeat-agent.md`
- `14-agent-qa-improvement-agent.md`

## Duplication Rules

- `03-technical-seo-code-agent.md` checks implementation and rendered technical SEO.
- `12-google-search-indexability-agent.md` diagnoses Google Search Console/indexing states. Use both only when indexability is a serious issue or GSC data exists.
- `05-local-seo-google-maps-agent.md` audits the whole local ranking system.
- `13-gbp-competitor-categories-services-agent.md` compares GBP categories/services against competitors. Use both for serious local/Maps work.
- `06-competitor-serp-gap-agent.md` is for organic SERP competitors.
- `13-gbp-competitor-categories-services-agent.md` is for Google Maps/GBP competitors.
- `16-competitor-evidence-extraction-agent.md` collects competitor evidence. It does not replace strategy agents; it feeds them.
- `17-seo-measurement-reporting-agent.md` tracks outcomes and reporting. It does not replace SEO diagnosis; it proves whether work improved results.
- `18-seo-quick-wins-implementation-agent.md` turns audit findings into simple immediate changes. It does not replace deeper fixes.
- `19-agent-pack-optimization-loop-agent.md` improves the agent pack after audits. It does not replace QA or the final SEO report.
- `08-schema-entity-trust-agent.md` should not invent schema; it only validates and recommends schema that matches visible content.

## Input Combination Routing

| Input Provided | First Move | Confidence Note |
|---|---|---|
| Website URL only | Run public URL audit and infer business model from site evidence. | Mark GBP/local conclusions as needing GBP evidence. |
| GBP URL only | Run GBP/local intake and request or discover website URL if visible. | Mark website SEO conclusions as limited if no website is available. |
| Company name only | Search/identify likely website and GBP using name, city, and service if available. | If multiple matches exist, ask for confirmation before final recommendations. |
| Company name + city/service | Identify likely official site, GBP, and local competitors. | Mark identity match as confirmed only when NAP/brand evidence aligns. |
| Website URL + GBP URL | Run public URL/local GBP audit. | Best default for local business audits. |
| Codebase + live URL | Compare code implementation against rendered public output. | Strongest for implementation fixes. |
| GSC export only | Run Search Console indexability emergency mode and ask for URL/domain if missing. | Strong for indexing diagnosis, weaker for content/local causes. |

## "Why Are We Last?" Root Cause Matrix

| Symptom | First Checks | Likely Agents |
|---|---|---|
| Last on Google Maps | GBP category, services, reviews, proximity, service area, verification, photos, local landing page, citations, competitor prominence. | `16`, `05`, `13`, `09`, `06` |
| Pages ranking last organically | Indexability, keyword intent mismatch, thin content, duplicate/cannibalized pages, weak internal links, weak authority, competitor content depth. | `16`, `12`, `01`, `02`, `04`, `06`, `09` |
| Important page not showing in Google | GSC status, robots, noindex, canonical, redirect, sitemap, internal links, content uniqueness. | `12`, `03`, `02` |
| Competitor always outranks us | SERP intent, authority, local prominence, content depth, reviews, schema, page experience. | `16`, `06`, `05`, `13`, `04`, `09`, `10` |
| Site gets traffic but no leads | Conversion path, CTA clarity, trust proof, forms, mobile UX, page intent mismatch, tracking gaps. | `10`, `04`, `01`, `18`, `17` |

Machine-readable route notes:

- MAPS_LAST_ROUTE: 16,05,13,09,06
- SEO_PAGES_LAST_ROUTE: 16,12,01,02,04,06,09
- COMPETITOR_BEATS_US_ROUTE: 16,06,05,13,04,09,10
- TRAFFIC_NO_LEADS_ROUTE: 10,04,01,17
- QUICK_WINS_ROUTE: 18
- OPTIMIZATION_LOOP_ROUTE: 19

## Example Request

Input:

> This business is a contractor in Hamilton. Here is their website URL and GBP link. Compare competitors on Google Maps and tell us how to improve.

Run:

1. `00-audit-orchestrator.md`
2. `15-universal-website-crawl-intake-agent.md`
3. `16-competitor-evidence-extraction-agent.md`
4. `05-local-seo-google-maps-agent.md`
5. `13-gbp-competitor-categories-services-agent.md`
6. `01-keyword-strategy-agent.md`
7. `02-page-mapping-cannibalization-agent.md`
8. `04-on-page-content-eeat-agent.md`
9. `09-authority-backlinks-citations-agent.md`
10. `18-seo-quick-wins-implementation-agent.md`
11. `17-seo-measurement-reporting-agent.md`
12. `14-agent-qa-improvement-agent.md`

Output:

- Website SEO fixes
- Simple changes to do now
- GBP category/service fixes
- Google Maps competitor gap
- Review/photo/service-area plan
- Cannibalization and page map
- New service/city page opportunities
- Measurement/reporting plan
- 30/60/90 day roadmap
