# External SEO Tool Benchmark

Use this file to compare the SEO agent pack against common SEO audit tools and open-source crawlers. The goal is not to copy tools, but to make sure the agent pack covers their useful checks and adds strategic judgment.

## Tool Categories Reviewed

### Google Search Console

Strengths:

- Real Google query, page, click, impression, CTR, and average position data.
- Page indexing reasons and URL Inspection.
- Core Web Vitals field data when available.

Agent pack coverage:

- `12-google-search-indexability-agent.md`
- `17-seo-measurement-reporting-agent.md`
- `00-audit-orchestrator.md`

Gap to remember:

- Requires verified property access or exports.

### Google Business Profile

Strengths:

- Owner dashboard data for GBP performance, services, categories, reviews, calls, clicks, messages, and profile content.
- Public listings show useful competitor evidence, but not every field is visible.

Agent pack coverage:

- `05-local-seo-google-maps-agent.md`
- `13-gbp-competitor-categories-services-agent.md`
- `16-competitor-evidence-extraction-agent.md`
- `17-seo-measurement-reporting-agent.md`

Gap to remember:

- Some categories/services/metrics require owner access, screenshots, API access, or exports.

### Lighthouse / PageSpeed Insights

Strengths:

- Performance, accessibility, best practices, SEO, and PWA checks.
- Useful diagnostics for LCP, INP/TBT, CLS, image optimization, render-blocking resources, accessibility, and basic SEO.

Agent pack coverage:

- `03-technical-seo-code-agent.md`
- `10-core-web-vitals-ux-conversion-agent.md`
- `17-seo-measurement-reporting-agent.md`

Gap to remember:

- Lighthouse is page-level and does not replace full-site crawl, keyword strategy, local SEO, GSC diagnosis, or competitor analysis.

### Unlighthouse

Strengths:

- Open-source site-wide Lighthouse scanning.
- Discovers URLs from robots.txt, sitemap, internal links, and project files.
- Useful for multi-page performance, accessibility, SEO summaries, titles, descriptions, links, and social images.

Agent pack coverage:

- `15-universal-website-crawl-intake-agent.md`
- `03-technical-seo-code-agent.md`
- `10-core-web-vitals-ux-conversion-agent.md`
- `18-seo-quick-wins-implementation-agent.md`

Gap to remember:

- Detection is strong; strategic prioritization still needs agents.

### LibreCrawl / SiteOne Crawler / SEO Crawler Tools

Strengths:

- Site crawling at scale.
- Meta tags, headings, canonicals, schema, redirects, 404s, hreflang, Open Graph, Twitter Cards, internal links, PageSpeed, accessibility, security, and exports.
- Some support JavaScript rendering with browser automation.

Agent pack coverage:

- `15-universal-website-crawl-intake-agent.md`
- `16-competitor-evidence-extraction-agent.md`
- `03-technical-seo-code-agent.md`
- `12-google-search-indexability-agent.md`
- `02-page-mapping-cannibalization-agent.md`

Gap to remember:

- Crawl tools do not know business priority, lead value, GBP owner metrics, or whether a page should exist.

### Screaming Frog / Sitebulb / Enterprise Crawlers

Strengths:

- Deep technical crawl diagnostics, custom extraction, JavaScript rendering, bulk exports, GSC/GA integration, redirects, canonicals, duplicate content, response codes, hreflang, structured data, and crawl visualizations.

Agent pack coverage:

- The agent pack should ingest their exports when available.
- `15`, `03`, `12`, `02`, and `14` should interpret crawl exports and turn them into prioritized work.

Gap to remember:

- Paid crawler exports are evidence sources, not final strategy.

### Rank Trackers / Local Grid Tools

Strengths:

- Keyword ranking snapshots by city, device, search location, or map grid.
- Useful for monitoring local visibility and identifying proximity issues.

Agent pack coverage:

- `05-local-seo-google-maps-agent.md`
- `13-gbp-competitor-categories-services-agent.md`
- `17-seo-measurement-reporting-agent.md`

Gap to remember:

- Rankings vary by location, personalization, and time. Treat as snapshots, not absolute truth.

## What Our Agent Pack Adds

The agent pack should outperform single-purpose tools by combining:

- Crawl evidence
- Code evidence
- Public rendered evidence
- GSC data
- GBP data
- Competitor evidence
- Local ranking context
- Cannibalization analysis
- Keyword/page mapping
- Business priority
- Implementation effort
- Measurement plan
- QA review
- One-time audit roadmap

## Tool-Informed Best Practices To Preserve

- Always separate detection from prioritization.
- Always identify the source of evidence.
- Use crawlers for broad coverage and agents for diagnosis.
- Use GSC for real Google search/indexing data.
- Use GBP owner data when available for local SEO.
- Use Lighthouse/PageSpeed for page experience diagnostics, but do not treat scores as the whole SEO audit.
- Use competitor extraction for evidence, not copying.
- Use local rank/grid data as snapshots.
- Do not invent missing data.

## Recommended Evidence Stack For Best One-Time Audits

Minimum:

- Website URL
- GBP URL if local
- Top services/products
- Target city/cities
- 3-5 competitors

Better:

- GSC export
- GA4 landing page/conversion data
- GBP insights screenshots/export
- Current rankings or local grid snapshot
- Crawl export

Best:

- Codebase
- Live URL
- GSC access/export
- GA4 access/export
- GBP owner access/export
- Competitor URLs and GBP links
- Lighthouse/PageSpeed reports
- Crawl export from a crawler
- Lead tracking/call tracking data

