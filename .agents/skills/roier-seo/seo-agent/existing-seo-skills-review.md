# Existing SEO Skills Review

This note records what was reviewed from the existing repo skills and what was added to the reusable `seo-agent` pack.

## Reviewed Sources

These are historical source paths from the original SEVENSTONES repo. They are not required dependencies when copying the portable `seo-agent` folder into another project.

- `.agents/skills/seo/SKILL.md`
- `.agents/skills/seo-optimizer/SKILL.md`
- `.agents/skills/programmatic-seo/SKILL.md`
- `.agents/skills/roier-seo/SKILL.md`
- `.cursor/rules/seo.md`
- `.cursor/skills/*` and `.claude/skills/*` SEO copies were checked as mirrored skill sets.

## Useful Ideas Pulled Into The Agent Pack

### From `seo`

- Crawlability and robots.txt checks
- Meta robots and noindex handling
- Canonical URL checks
- Sitemap hygiene
- Title/meta/H1 checks
- Image alt text and dimensions
- Internal linking
- Structured data basics

### From `seo-optimizer`

- Keyword strategy by search intent
- Content quality and E-E-A-T
- Topic clusters
- Local SEO priority for service-area businesses
- Core Web Vitals awareness
- Schema opportunities

### From `programmatic-seo`

- Location page quality rules
- Unique value per page
- Avoiding doorway/thin pages
- Service + city page planning
- Comparison, integration, persona, glossary, and directory page patterns
- Scalable quality checks

### From `roier-seo`

- Lighthouse/PageSpeed audit thinking
- Framework-aware technical review
- Core Web Vitals implementation checks
- Accessibility basics
- Open Graph and Twitter card checks
- JSON-LD schema implementation patterns
- Performance fixes for images, fonts, and resources
- Framework-aware audit behavior
- Lighthouse/PageSpeed style measurement expectations

### From `.cursor/rules/seo.md`

- Always use the project SEO skills before SEO work
- Prioritize local business SEO for SEVENSTONES-style service businesses
- Use LocalBusiness schema, location keywords, and programmatic service + city pages carefully

## Improvements Added Beyond Existing Skills

- Universal website crawl/intake agent for URL-only, GBP-only, company-name-only, codebase-only, and mixed-input audits.
- Competitor evidence extraction agent for titles, meta descriptions, headings, schema, on-page signals, GBP-visible categories/services/descriptions, reviews, and evidence gaps.
- SEO measurement/reporting agent for GSC, GA4, GBP insights, rankings, lead tracking, baselines, and post-fix validation.
- Quick wins implementation agent for immediate simple optimization changes.
- External SEO tool benchmark comparing the pack against GSC, GBP, Lighthouse, Unlighthouse, crawler tools, rank trackers, and paid crawler workflows.
- Large codebase review protocol for monorepos, generated routes, CMS-driven sites, and framework-heavy projects.
- Agent pack optimization loop for improving instructions, workflows, benchmarks, and tests after real audits.
- Question-driven diagnostic mode for questions like "Why are we last on Google Maps?" and "Why are our SEO pages ranking last?"
- Google Search Console indexability agent for Page with redirect, Alternate page with proper canonical tag, Excluded by noindex, Discovered - currently not indexed, and Crawled - currently not indexed.
- GBP competitor category/service agent for Google Maps competitor analysis.
- QA improvement agent that checks all other agents for missing coverage, contradictions, unsupported claims, and risky SEO.
- Audit runbook that prevents running every agent by default.
- Explicit distinction between public website evidence, codebase evidence, GBP public evidence, GSC evidence, and assumptions.
- Support for local service, ecommerce, SaaS/B2B, publishers, directories, professional services, healthcare, legal, finance, nonprofit, education, restaurant, contractor, and service-area businesses.

## Current Verdict

The existing skills are useful references, but the reusable `seo-agent` pack is now broader and more operational. It can answer direct business questions, route partial inputs, coordinate specialist agents, and produce a prioritized implementation roadmap instead of only giving a technical checklist.
