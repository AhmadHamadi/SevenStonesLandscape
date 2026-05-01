# Large Codebase SEO Review Protocol

Use this protocol when the website repo is large, multi-app, monorepo-based, framework-heavy, or has many generated routes/pages.

## Goal

Review large codebases efficiently without missing SEO-critical implementation paths.

## Core Rule

Do not read every file line-by-line by default. First map the codebase, identify SEO ownership points, then inspect the files that control rendered output, crawling, indexing, routing, content, metadata, schema, performance, and tracking.

## Discovery Order

1. Identify project type:
   - Static HTML
   - Next.js
   - React/Vite
   - Astro
   - Nuxt/Vue
   - WordPress/theme
   - Shopify/theme
   - Laravel/Rails/Django
   - Headless CMS/frontend
   - Monorepo/multi-app

2. Identify routing:
   - App/page directories
   - Route configs
   - Dynamic routes
   - Service/location/product/category templates
   - Redirect rules
   - Middleware
   - Server config

3. Identify SEO control files:
   - Metadata components/helpers
   - Layout/head files
   - Sitemap generation
   - Robots generation
   - Canonical helpers
   - Schema helpers
   - Breadcrumb helpers
   - CMS data mappers
   - Image components
   - Analytics/tracking setup

4. Identify content sources:
   - Markdown/MDX
   - JSON/YAML/data files
   - CMS schemas
   - API loaders
   - Product/service/location datasets
   - Blog/article content

5. Identify generated output:
   - Build output if available
   - Public rendered HTML
   - Sitemap URLs
   - Important live pages
   - Redirect behavior

## Files To Prioritize

| Area | What To Look For |
|---|---|
| Routes/templates | Duplicate templates, missing metadata, dynamic slugs, city/service/product pages. |
| Head/metadata | Titles, descriptions, canonicals, robots, OG/Twitter, hreflang. |
| Sitemap/robots | Canonical 200 URLs only, no noindex/redirect/404 URLs, correct host/protocol. |
| Schema | LocalBusiness, Organization, Product, Article, FAQ, Breadcrumb, Service. |
| Content/data | Thin duplicated city/service/product pages, keyword targeting, proof, FAQs. |
| Internal links | Orphan pages, weak anchors, hubs, breadcrumbs, footer/nav links. |
| Redirects/canonicals | Conflicts, chains, wrong preferred URLs, www/non-www, trailing slash. |
| Images/performance | Missing alt, missing dimensions, huge images, LCP image, lazy loading. |
| JS rendering | Important content/links generated only client-side, metadata changed late. |
| Tracking | GA4, GSC, GBP, forms, calls, conversion events. |

## Large Repo Search Queries

Use fast search tools such as `rg` where available:

- `metadata`
- `<title`
- `description`
- `canonical`
- `robots`
- `noindex`
- `sitemap`
- `robots.txt`
- `schema.org`
- `application/ld+json`
- `LocalBusiness`
- `Organization`
- `Product`
- `BreadcrumbList`
- `FAQPage`
- `redirect`
- `permanentRedirect`
- `hreflang`
- `gtag`
- `analytics`
- `phone`
- `address`
- `serviceAreas`
- `city`
- `slug`

## Sampling Rules

For very large sites, inspect by page type:

- Homepage
- Top service/product/category page
- Top city/location page
- A weak/low-ranking page
- A high-value conversion page
- A blog/article page
- A generated/template page
- A page with GSC indexability issue
- A competitor-equivalent page

Then expand only where the pattern is risky.

## Output Requirements

### Codebase SEO Map

| Area | Files/Directories | SEO Responsibility | Risk |
|---|---|---|---|

### High-Risk Files

| File | Why It Matters | What To Inspect |
|---|---|---|

### Implementation Findings

| Priority | File/URL | Issue | Evidence | Fix |
|---|---|---|---|---|

### Needs Rendered Verification

| Page/Template | Why Code Alone Is Not Enough | How To Verify |
|---|---|---|

## Rules

- Do not assume source code equals rendered output; verify important pages when possible.
- Do not change generated files unless that is the established project workflow.
- Do not flag a pattern as sitewide until at least two representative examples confirm it.
- For monorepos, identify the deployed app before auditing unrelated packages.
- For CMS-driven sites, audit both templates and content/data.
- Preserve unrelated code changes and follow the repo's existing style.

