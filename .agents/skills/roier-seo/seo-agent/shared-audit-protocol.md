# Shared SEO Audit Protocol

Every agent in this folder must follow this protocol before producing recommendations.

## Partial Input Rule

The audit must work with any reasonable input combination:

- Website URL only
- Google Business Profile URL only
- Company name only
- Company name + city
- Company name + service/category
- Website URL + GBP URL
- Website URL + GBP URL + competitors
- Codebase only
- Codebase + live URL
- Search Console export only
- Any mix of the above

If the input is incomplete, continue with the available evidence, clearly mark assumptions, and list the missing data that would improve confidence.

## Required Behavior

1. Review the full website context available to the audit:
   - Public website URL
   - Source files and routes
   - Rendered pages if available
   - Sitemap URLs
   - Robots.txt
   - Redirect rules
   - Canonical tags
   - Metadata
   - Schema
   - Internal links
   - Google Search Console data if provided
   - Google Business Profile and competitor listings if provided
   - Client business brief if provided

2. Work as a team:
   - The Orchestrator owns final prioritization.
   - The Universal Website Crawl And Intake Agent owns the shared evidence base.
   - The Competitor Evidence Extraction Agent owns competitor page and GBP evidence collection.
   - Specialist agents own their narrow expertise.
   - Agents must hand off issues outside their scope instead of silently ignoring them.
   - Agents must flag conflicts with another agent's recommendation.
   - The QA Improvement Agent reviews all outputs before the final report.

3. Answer the user's actual question:
   - If the user asks "why are we last on Google Maps?", diagnose local pack/GBP causes first.
   - If the user asks "why are our SEO pages last?", diagnose indexability, intent, content quality, authority, cannibalization, and competitors first.
   - If the user asks "how do we improve SEO?", produce a prioritized roadmap, not a generic checklist.
   - If the user asks a narrow question, answer it directly and then add only the related audit findings.

4. Use evidence:
   - Every finding needs a URL, rendered page observation, file path, keyword, GSC issue, GBP factor, competitor, or code reference.
   - Label findings as Confirmed, Likely, or Needs verification.
   - Do not make claims from memory when data is missing.

5. Separate good exclusions from bad exclusions:
   - A non-indexed URL is not automatically a problem.
   - Redirected URLs, noindex utility pages, canonical alternates, 404s, and filtered URLs can be correct.
   - A URL is a problem when it should rank, should receive traffic, should be canonical, should be in the sitemap, or supports an important conversion path but is blocked, duplicated, weak, orphaned, or misconfigured.

6. Avoid risky SEO:
   - No fake reviews.
   - No keyword-stuffed GBP names.
   - No hidden content or fake schema.
   - No doorway pages.
   - No link schemes.
   - No unsupported claims, credentials, or awards.

## Tool Access And Evidence Limits

- These agents run on the LLM/model and tools available in the current environment.
- If web/browser/crawl tools are available, agents may inspect public pages and visible public listing data within compliance limits.
- If those tools are not available, agents must ask for URLs, screenshots, exports, or manual evidence.
- Do not invent hidden GBP categories, private services, rankings, traffic, backlinks, or Search Console data.
- Competitor evidence should be collected by `16-competitor-evidence-extraction-agent.md` before strategy agents compare gaps.
- Rankings cannot be guaranteed. Agents should improve controllable factors, measure outcomes, and disclose uncertainty.

## Shared Data Tables

Each audit should build or request these tables:

### URL Inventory

| URL | Source | Status | Indexable? | Canonical | Sitemap? | Internal Links | Page Type | Target Keyword | Notes |
|---|---|---|---|---|---|---|---|---|---|

### Data Access Level

| Source | Available? | Notes |
|---|---|---|
| Public website crawl | | |
| Codebase/repo | | |
| Google Search Console | | |
| Google Analytics/lead data | | |
| Google Business Profile owner access | | |
| Public GBP evidence | | |
| Competitor list | | |
| SEO tool exports | | |
| Browser/web/crawl tools | | |
| GSC/GA4/GBP reporting access | | |

### User Question And Root Cause

| User Question | Likely Root Cause Category | Evidence Needed | First Agent To Check |
|---|---|---|---|

### Keyword Map

| Keyword | Intent | Assigned Page | Competing Pages | City | Priority | Notes |
|---|---|---|---|---|---|---|

### Competitor Map

| Competitor | Channel | URL/GBP | City | Strength | Gap |
|---|---|---|---|---|---|

### Issue Ledger

| ID | Agent | Priority | Type | Evidence | Recommendation | Status |
|---|---|---|---|---|---|---|

## Priority Rules

- Critical: Blocks indexing, ranking, crawling, leads, tracking, or GBP eligibility for important pages.
- High: Strong ranking/local/traffic impact, likely to move business results.
- Medium: Useful improvement, but not blocking.
- Low: Cleanup, polish, or long-term improvement.

## Final QA Questions

Before the final report, confirm:

- Are all important pages crawlable and indexable?
- Are sitemap URLs canonical, 200-status, and intended to rank?
- Are noindex pages intentionally excluded?
- Are redirected URLs removed from sitemaps and internal links unless there is a reason?
- Are canonical alternates expected and pointing to the right preferred URL?
- Are important pages unique enough to be indexed?
- Are pages mapped to one primary keyword/search intent?
- Are any pages cannibalizing each other?
- Are GBP categories and services accurate and competitive?
- Are local ranking recommendations aligned with relevance, distance, and prominence?
- Are recommendations specific enough for a developer, content writer, or business owner to execute?
- Did the Orchestrator avoid running unnecessary duplicate specialists?
- Did the final answer clearly explain why the business is underperforming, not just list SEO tasks?
- Did the audit include a measurement plan when the goal is ongoing SEO improvement?
