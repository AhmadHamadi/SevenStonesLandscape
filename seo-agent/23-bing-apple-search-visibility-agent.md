# Agent 23: Bing + Apple Search Visibility

Before auditing, follow `shared-audit-protocol.md`.

## Purpose

Capture the two largest underexploited search/AI surfaces in 2026:

1. **Bing** -- drives ChatGPT browsing (87% citation match with Bing top 10), Microsoft Copilot, Bing AI, Edge sidebar AI. Most sites get 3% organic traffic from Bing and ignore it -- but every ChatGPT citation passes through the Bing index.
2. **Apple Maps + Apple Business** -- local-business usage in BrightLocal 2026 Consumer Review Survey **doubled from 14% to 27% YoY** while Google's local share fell 12 points. Apple Intelligence on 1B+ iOS devices. Apple Business Connect unified into **"Apple Business"** on April 14, 2026 across 200+ countries. Apple Maps Ads launching Summer 2026 (US + Canada).

Optimize these in parallel with the Google work. Skipping them now leaks 15-25% of contractor lead potential.

## Hard rules

1. **Verify Bing Webmaster Tools** on every site. The AI Performance Report is the only first-party AI citation telemetry any engine offers.
2. **Install IndexNow** for instant Bing/Yandex/DuckDuckGo indexing of content updates.
3. **Claim Apple Business** for every local business -- free, low effort, high return as Apple Maps share grows.
4. **NAP exactness** across Google Business Profile, Bing Places, Apple Business -- same legal name, same address format, same phone format. NAP drift on Apple/Bing is invisible to most owners and quietly suppresses citations.
5. **Do not block bingbot or Applebot.** Doing so removes the site from ChatGPT browsing + all Apple Intelligence/Siri surfaces.

## Part A -- Bing

### Bing Webmaster Tools setup

1. Verify the site at `bing.com/webmasters` (DNS TXT, HTML file, or meta tag). Use the same email as the GBP/GSC owner where possible.
2. Submit XML sitemap (same one as Google).
3. **Connect Google Search Console** -- Bing imports your GSC sitemaps and properties automatically. Skip the manual sitemap step on subsequent properties.
4. Enable URL Inspection.
5. Configure crawl control if needed (most sites do not).

### Bing AI Performance Report (public preview Feb 9, 2026; expanded April 27, 2026)

This is the **only first-party citation telemetry any AI engine offers in 2026**. Use it.

**What it shows:**
- Total citations across Copilot, Bing AI, ChatGPT Search (via Bing grounding partnership).
- Average cited pages.
- Grounding query intent (the actual queries that triggered citations).
- Topic labels per citation.
- GEO recommendations (Microsoft's own surface for "what to fix").
- Page-level activity (which URLs are being cited most).
- Citation trend over time.

**How to use it:**
- Check monthly. Treat as the AEO equivalent of GSC.
- Identify top-cited pages -> reinforce their atomic-fact structure.
- Identify zero-citation pages that should be cited -> check schema, indexability, freshness, atomic-fact passage presence.
- Cross-reference grounding queries with GBP and GSC keyword data to find queries the site captures across SERPs but not in AI surfaces.

### IndexNow

- Submit URL updates to Bing instantly (also Yandex, DuckDuckGo, Naver).
- Google has not adopted IndexNow as of May 2026 -- use GSC API for Google.
- Implementation:
  - WordPress: install Bing Webmaster IndexNow plugin (one-click).
  - Static / Next.js / custom: POST to `api.indexnow.org/IndexNow` with API key on every content change.
  - Cloudflare: enable IndexNow at Speed -> Optimization (one toggle).

### Bing Places for Business

- Separate listing from GBP (`bingplaces.com`).
- Free.
- Mirror NAP, categories, hours, services, photos from GBP exactly.
- Bing Places "Import from Google" tool pulls the GBP listing -- verify and edit afterward (categories sometimes don't translate).
- For contractors:
  - Primary category: "Landscape Contractor" / "Paving Contractor" / "Hardscape" as applicable.
  - Service area: same cities as GBP areaServed.
  - Photos: upload separately (Bing Places does not pull GBP photos).
- Pin a couple of branded posts/updates if available.

### Bing-specific technical checks

- **Robots.txt:** allow `bingbot`, `Bingbot-EnterpriseSearch`, `AICopilot`.
- **Backlinks:** Bing's index reflects different referring domains than Google. Audit at Bing WMT -> Backlinks.
- **Schema:** identical JSON-LD parsing to Google. No Bing-specific schema.
- **OG tags:** Bing parses Open Graph for snippet rendering more than Google does -- make sure `og:title`, `og:description`, `og:image` are complete.

## Part B -- Apple Business + Apple Maps

### Apple Business setup (formerly Apple Business Connect)

1. Claim at `business.apple.com`.
2. Verify business via the unified Apple Business flow (April 2026 update merged Apple Business Connect, Essentials, and Manager into one).
3. Fill all sections:
   - Legal business name (no keyword stuffing -- same rule as GBP).
   - Address (hide for service-area businesses; verify in backend).
   - Phone, email, website.
   - Hours (set seasonal variations explicitly).
   - Photos: upload 4:3 landscape, high-res. Apple Maps prefers landscape over square.
   - Categories -- primary + secondary.
   - **Showcases** -- Apple's equivalent of GBP Posts. Push seasonal promotions, new services, before/after project highlights. These show inside Apple Maps place cards and influence Apple Intelligence answers.
4. Connect Apple Pay / Tap to Pay if applicable (signals "active business" to Apple).
5. Enable Branded Caller ID (free, raises iPhone trust signals when calling customers).

### Apple Maps optimization

- Apple Maps cards are the primary surface Apple Intelligence cites for local businesses.
- Photo cadence: monthly upload of 3-5 jobsite photos.
- Customer reviews via the Apple "Ratings" feature (separate from Yelp).
- **Sync NAP exactly** to GBP, Bing Places, HomeStars, Houzz, BBB, Landscape Ontario directory. NAP drift across these directly weakens Apple Intelligence entity disambiguation.

### Apple Intelligence + Siri citation signals (current)

1. High Apple Maps presence for the business name in the service area.
2. Wikipedia article (even a stub) plus Wikidata QID for the entity.
3. `sameAs` chain in Organization schema pointing to Apple Business listing URL, Wikipedia, Wikidata, GBP, LinkedIn, Facebook.
4. Open Graph + Twitter Cards on every page.
5. Apple News publisher status (irrelevant for most contractors).

### Apple Maps Ads (launching Summer 2026, US + Canada)

- Self-serve product through Apple Search Ads dashboard.
- Bid on place-card surface for queries near your service area.
- Watch for rollout schedule -- early-mover advantage in low-competition local categories.
- Expected CPCs for contractor categories: similar to Apple Search Ads ($1-$5 range for non-app categories projected).

### Apple-specific edge cases for contractors

- **Service-area businesses without storefront** -- hide address; set service area as list of cities; Apple Maps places the business at the verified address but does not show it.
- **Multi-location franchise** -- claim each location separately in Apple Business; cross-link via `branchOf` schema on the website.
- **Brand vs DBA** -- register the legal name; add DBA via the listing's "Also known as" field if available.

## Part C -- Unified verification across Google, Bing, Apple

The single highest-ROI weekly task: NAP cross-check audit.

| Field | GBP | Bing Places | Apple Business | HomeStars | Houzz | BBB | Landscape Ontario |
|---|---|---|---|---|---|---|---|
| Legal name | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Phone | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Address (or hidden + same service area) | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Website URL | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Primary category | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Hours | [x] | [x] | [x] | -- | -- | -- | -- |
| Photos cadence | weekly | monthly | monthly | quarterly | quarterly | as updated | as updated |
| Last updated | <= 30 days | <= 60 days | <= 60 days | <= 90 days | <= 90 days | annual | annual |

Run this check **quarterly minimum**, monthly if the business is actively running ads or making service changes.

## Deliverables

1. **Bing Webmaster Tools verification status** -- verified / not verified; sitemap submitted; URL Inspection working.
2. **Bing AI Performance Report snapshot** -- total citations last 30 days, top 5 cited pages, top 5 grounding queries, any zero-citation gaps.
3. **IndexNow installation status** -- yes/no; ping count last 30 days.
4. **Bing Places listing status** -- claimed / unclaimed; completeness %; NAP match with GBP.
5. **Apple Business listing status** -- claimed / unclaimed; completeness %; NAP match with GBP/Bing Places.
6. **Apple Maps place-card audit** -- does the business appear when searched on iOS Maps in service-area cities? Show-up rate per city.
7. **NAP cross-check matrix** -- fill the table above for the site under audit.
8. **Robots.txt directive audit** -- confirm bingbot, Bingbot-EnterpriseSearch, AICopilot, Applebot, Applebot-Extended all allowed.
9. **30/60/90-day Bing + Apple roadmap** -- explicit, dated actions.

## Cross-references

- AI engine source-pool mapping -> Agent 21.
- `sameAs` chain construction -> Agent 08.
- GBP setup, categories, review velocity -> Agent 05.
- Robots.txt AI bot matrix -> Agent 03.
- AI citation measurement stack -> Agent 21.

## Sources (load on demand)

- Bing AI Performance Report (Public Preview, Feb 2026) -- `blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview`
- Microsoft Ads -- AI Performance Dashboard (March 2026 expansion) -- `about.ads.microsoft.com/en/blog/post/march-2026/the-ai-performance-dashboard-your-view-into-where-your-brand-appears-across-the-ai-web`
- Apple Business unification (April 14, 2026) -- `pinmeto.com/blog/apple-business-connect-now-apple-business`
- BrightLocal 2026 Consumer Review Survey -- `brightlocal.com/research/local-consumer-review-survey`
- IndexNow vs Indexing API vs Sitemaps -- `crawlwp.com/indexnow-vs-google-indexing-api-vs-sitemaps`
- About Applebot -- `support.apple.com/en-us/119829`
- Apple Intelligence training/privacy -- `support.apple.com/en-us/120320`
- Bingbot documentation -- `bing.com/toolbox/bingbot.json`
- Apple-Google Gemini partnership (May 2026) -- `9to5mac.com/2026/05/06/apple-may-have-just-made-one-of-the-most-important-new-siri-announcements`
