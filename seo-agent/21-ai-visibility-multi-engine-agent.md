# Agent 21: AI Visibility Multi-Engine (AEO / GEO)

Before auditing, follow `shared-audit-protocol.md` and `ai-crawlability-protocol.md`.

## Purpose

Win citations across the engines that now intercept queries before the user reaches a SERP: **ChatGPT, Google Gemini / AI Overviews / AI Mode, Perplexity, Microsoft Copilot / Bing AI, Apple Intelligence, Claude, Meta AI, Grok**. Classic organic rank no longer transfers reliably: only **38% of AI Overview citations come from top-10 organic** (down from 76% in 2025), and **only 11% of cited domains overlap across platforms** (Profound, 2026). Optimize for citations explicitly.

This agent is the master AEO/GEO operator. It complements Agent 11 (AI search visibility on-page mechanics), Agent 23 (Bing + Apple specifics), and Agent 09 (off-site authority).

## Hard rules

1. Optimize for the **citation slot inside the AI answer**, not for being the link beneath it. Cited brands inside Google AIO see **+35% organic CTR** and **+91% paid CTR**; non-cited brands lose the full 61% AIO CTR drop.
2. **Atomic-fact passages** (40-75 words) cited 2.3-3.1x more than long-form prose. Every H2/H3 must open with one self-contained answer capsule before any elaboration.
3. **No internal links inside the answer capsule.** Links break extraction. Elaborate, then link.
4. **Allow citation-class user agents** in robots.txt by default. Block training bots only if there is a content moat to protect -- never block search-time fetchers.
5. **llms.txt is currently a dud** (John Mueller compared it to the meta keywords tag, May 2026). Keep one for hygiene; allocate zero optimization effort.
6. **Reddit + Wikipedia + YouTube** dominate citation share across engines. Earned co-presence on these three platforms is the single biggest lever after on-page atomic facts.
7. **Freshness** is the strongest Perplexity lever and a real ChatGPT/AIO factor. Stamp every page with a visible `Last updated YYYY-MM-DD` plus current-year statistics.

## Engine-by-engine playbook

### 1. ChatGPT (OpenAI)

- **User agents:** `GPTBot` (training), `OAI-SearchBot` (ChatGPT Search index), `ChatGPT-User` (live user-triggered fetch).
- **IP verification:** `openai.com/gptbot.json`, `openai.com/searchbot.json`, `openai.com/chatgpt-user.json`. Reverse-DNS to `*.openai.com`.
- **Source pool:** OpenAI's own index plus Bing web grounding (Microsoft partnership). ChatGPT-cited URLs overlap with Bing's top 10 at **87%**.
- **llms.txt:** Documented, but production fetch rate <0.1%. Treat as not respected.
- **Robots.txt directives (default allow):**
  ```
  User-agent: GPTBot
  Allow: /
  User-agent: OAI-SearchBot
  Allow: /
  User-agent: ChatGPT-User
  Allow: /
  ```
- **Top citation signals:** referring-domain authority (>32k RDs = 2x citation rate); third-party review presence (Trustpilot/G2/Yelp = 3x lift for branded/comparison queries); Reddit/Wikipedia co-mention; top 30% of page = 44.2% of all extracted citations.
- **Format that wins:** answer-first H2/H3 hierarchy; 40-75 word answer capsules with no inline links; comparison tables; FAQ blocks matching real query phrasing; dated "Last updated" plus current-year stats; 1,500-2,500 words total.
- **Schema that matters:** Article + Organization + Person (author) + FAQPage + Product/Review + AggregateRating. Sparse schema underperforms zero schema (41.6% vs 59.8% citation rate).

### 2. Google Gemini, AI Overviews (AIO), AI Mode

- **User agents:** `Googlebot`, `Googlebot-Smartphone` (ranking + AIO grounding pool); `Google-Extended` (Gemini training opt-out token, not a separate crawler); `Google-Agent` (new in 2026, AI agent fetches).
- **IP verification:** `developers.google.com/search/apis/ipranges/googlebot.json`.
- **Source pool:** Same Googlebot-built index as classic Search. AIO and AI Mode use organic ranking pool as candidate set, then rerank with a generative layer. AI Mode performs deeper retrieval per query than AIO. Only **13.7% overlap** between AIO citations and AI Mode citations.
- **Robots.txt directives:**
  ```
  User-agent: Googlebot
  Allow: /
  User-agent: Google-Extended
  Allow: /
  ```
  Blocking `Google-Extended` does NOT remove citations from AIO (grounding uses the standard organic index).
- **Top citation signals:** organic top-10 ranking (necessary but not sufficient); semantic completeness (r=0.87 in Wellows 2026); entity density in Knowledge Graph (15+ connected entities = 4.8x lift); E-E-A-T signals (in 96% of cited pages); structured data (3.1x lift); subscribed-publisher boost (May 2026 AIO feature).
- **What gets cited:** YouTube (200x advantage over any other video source), Wikipedia + Reddit (each in ~25% of all AIOs), Forbes/NYT/Healthline/Investopedia for editorial verticals, .gov/.edu for YMYL.
- **Format that wins:** 2-sentence definition + key-stat lede; data table with one proprietary metric; 3+ unique data points (4x lift); inline image with descriptive alt text (multimodal selected 156% more often); embedded YouTube where natural.
- **Schema that matters:** Article, Organization, Product, Review/AggregateRating, FAQPage, HowTo, LocalBusiness, BreadcrumbList, VideoObject. Attribute-rich = 61.7% citation rate.

### 3. Perplexity

- **User agents:** `PerplexityBot` (index crawler), `Perplexity-User` (live user fetch).
- **IP verification:** `perplexity.com/perplexitybot.json`, `perplexity.com/perplexity-user.json`. **Cloudflare documented stealth UAs** when Perplexity's declared bot is blocked -- verify via reverse DNS, never UA alone.
- **Source pool:** Perplexity's index + real-time RAG on every query (visits ~10 pages, cites 3-4). Three-layer reranker with XGBoost L3 gate that filters for entity clarity and authoritativeness. Manually curated authority lists boost GitHub, Amazon, LinkedIn, Reddit, established news.
- **Robots.txt directives:**
  ```
  User-agent: PerplexityBot
  Allow: /
  User-agent: Perplexity-User
  Allow: /
  ```
- **Top citation signals:** **Freshness** (most aggressive of any engine -- 82% of cited content published in last 30 days); explicit reference section with primary sources; entity clarity (brand named in title, H1, schema, first paragraph); authority-domain co-occurrence (GitHub/LinkedIn/Reddit/Wikipedia raise odds); news content overweighted.
- **What gets cited:** Reddit threads (24% of citations Jan 2026), news <30 days old, documentation pages, pages with explicit References blocks.
- **Format that wins:** news-style inverted pyramid; 1-2 sentence factual lede; dated byline; inline links to primary sources; **References block at bottom**. 500-1,200 words is enough -- freshness beats length.

### 4. Microsoft Copilot / Bing AI

- **User agents:** `bingbot/2.0` (organic + AI grounding); `Bingbot-EnterpriseSearch` (M365 Copilot enterprise grounding); `AICopilot` (Copilot direct citation fetches).
- **IP verification:** `bing.com/toolbox/bingbot.json`.
- **Source pool:** Bing's organic index. Copilot's candidate pool = sites that rank in Bing for the query. **Bing is the most underexploited lever** -- most sites have stale or partial Bing indexing.
- **Robots.txt directives:**
  ```
  User-agent: bingbot
  Allow: /
  User-agent: Bingbot-EnterpriseSearch
  Allow: /
  User-agent: AICopilot
  Allow: /
  ```
- **Top citation signals:** Bing organic rank (NOT Google rank); Bing Webmaster Tools verified status with submitted XML sitemap; **IndexNow ping freshness**; schema completeness; backlinks from sites Bing already crawls deeply.
- **Measurement edge:** **Bing Webmaster Tools "AI Performance" report** (public preview Feb 9, 2026; expanded April 27, 2026) -- the only first-party citation reporting any AI engine offers. Total citations, average cited pages, grounding query intent, page-level activity. **Use this.** Detailed playbook in Agent 23.

### 5. Apple Intelligence + Siri

- **User agents:** `Applebot` (Spotlight, Siri Suggestions, Safari); `Applebot-Extended` (training opt-out token).
- **IP verification:** Reverse DNS to `*.applebot.apple.com`.
- **Source pool:** Applebot-built index. As of May 2026, AI-powered Siri ("Siri 2.0") still delayed. Apple confirmed Gemini partnership (announced May 6, 2026) for upcoming Siri -- **optimizing for Gemini ~ optimizing for future Siri**. Target ship: iOS 27 / WWDC June 8, 2026.
- **Robots.txt directives:**
  ```
  User-agent: Applebot
  Allow: /
  User-agent: Applebot-Extended
  Allow: /
  ```
- **Top citation signals:** high Apple Maps presence for local entities; Wikipedia + Wikidata structured presence with `sameAs`; Open Graph + Twitter Card completeness.
- **What gets cited:** Wikipedia, Apple Maps, Yelp, official .com domains, Apple News publishers.
- **Format that wins:** short, factual entity descriptions linkable to Wikidata QIDs. Apple is **entity-graph-driven**, not passage-driven. Apple Business Connect unified into "Apple Business" on April 14, 2026 (200+ countries). Apple Maps local-business usage **doubled from 14% to 27% YoY** (BrightLocal 2026). Apple Maps Ads launch Summer 2026 (US + Canada).

### 6. Claude (Anthropic)

- **User agents:** `ClaudeBot` (training), `Claude-User` (live fetch in claude.ai), `Claude-SearchBot` (search index), `claude-code` (Claude Code CLI WebFetch).
- **IP verification:** Reverse DNS to `anthropic.com` / `claude.ai`.
- **Source pool:** Web search uses **Brave Search** as primary grounding (Claude-Brave citation overlap = 86.7%). Claude-SearchBot builds Anthropic-owned coverage.
- **llms.txt:** Anthropic publicly supports; production fetch rate still very low. Treat as nominally supported.
- **Robots.txt directives:**
  ```
  User-agent: ClaudeBot
  Allow: /
  User-agent: Claude-User
  Allow: /
  User-agent: Claude-SearchBot
  Allow: /
  User-agent: claude-code
  Allow: /
  ```
- **Top citation signals:** strong Brave Search ranking; **conservative, verification-friendly content** (Claude is the most citation-skeptical engine); explicit sources, dates, authorship; Wikipedia and primary-source domains favored.
- **What gets cited:** Wikipedia, official documentation, .gov, .edu, primary research with disclosed methodology.
- **Format that wins:** Wikipedia-style -- declarative, dated, sourced. Inline citations with visible references. **Avoid hyperbole** -- Claude downweights marketing tone.

### 7. Meta AI

- **User agents:** `meta-externalagent` (training + AI indexing), `meta-externalfetcher` (live fetch), `facebookexternalhit` (OG preview).
- **Source pool:** Meta's index + social graph data (FB/IG/Threads/WhatsApp). Compliance with robots.txt has been inconsistent.
- **Top citation signals:** verified Meta-platform presence; OG metadata completeness; Wikipedia entity disambiguation.

### 8. DeepSeek, Mistral, xAI Grok

- **DeepSeek:** No declared UA -- appears as generic browser. No reliable robots.txt hook. Optimize Bing/Google organic + Reddit/GitHub presence.
- **Mistral (Le Chat):** `MistralAI-User` for live fetch. No automatic training crawler.
- **Grok:** Spoofed iPhone Safari UA (intentional cloaking). Cannot reliably block via robots.txt. Win via strong X presence, Bing organic, Reddit, GitHub.

## The unified citation-acquisition playbook (helps ALL engines)

1. **40-75 word atomic answer capsules** under every H2 question heading. Self-contained, no internal links inside the capsule, no hedging.
2. **Fully populated JSON-LD schema** -- Article + Organization + Person (author with `sameAs`) + Product/Review/FAQPage as applicable.
3. **Visible "Last updated YYYY-MM-DD"** plus current-year statistics in the body.
4. **3+ unique data points per page** (proprietary survey, internal benchmark, exclusive case study) -- 4x citation lift.
5. **Comparison tables and named frameworks.** Pages opening with a number, definition, or named framework cited 2-3x more.
6. **Third-party review profile parity** -- Trustpilot/G2/Capterra/Yelp (or HomeStars/Houzz/BBB for contractors). ~3x citation lift for branded/comparison queries.
7. **Wikipedia + Wikidata entity disambiguation** with `sameAs` wired into Organization schema. Required for Apple, helpful everywhere. See Agent 08.
8. **Reddit + YouTube co-presence.** Reddit ~ 40% of all AI citations; YouTube has 200x advantage in AIO. Plan 1-2 helpful Reddit comments/month in relevant subs (no spam) + a YouTube channel for the entity.
9. **References block at bottom** linking to primary sources.
10. **Allow all citation-class user agents** in robots.txt.

## The 5 things that only help one engine (do NOT optimize blindly)

1. **Bing Webmaster Tools verification + IndexNow** -- only Copilot/Bing AI care directly (but it's the only first-party citation telemetry, so still ship it).
2. **Apple Maps listing + Wikidata QID** -- disproportionately Apple Intelligence / future Siri.
3. **Brave Search ranking** -- uniquely matters for Claude.
4. **X (Twitter) presence** -- only Grok cares.
5. **Google subscribed-publisher status** -- only inside Google AIO, only for paid publishers.

## Citation measurement stack (May 2026)

| Tool | Engines covered | Pricing floor |
|------|------------------|----------------|
| Bing Webmaster Tools -- AI Performance | Copilot, Bing AI, ChatGPT (via Bing grounding) | **Free -- start here** |
| Otterly.AI | ChatGPT, Perplexity, AIO, AI Mode, Gemini, Copilot | $29/mo |
| AthenaHQ | ChatGPT, Gemini, Perplexity, DeepSeek, AIO | $295/mo |
| Profound | Major engines + enterprise SOC2/HIPAA | $399/mo |
| Hall | ChatGPT, AIO, Gemini, Claude, Copilot, Perplexity, Meta AI, DeepSeek | mid-tier |
| xSeek | ChatGPT, Perplexity, Gemini, Claude, Grok, DeepSeek | mid-tier |

Default contractor stack: **Bing WMT (free)** + **Otterly.AI ($29/mo)** + manual fixed-query prompt set across all six engines, sampled weekly.

## Deliverables (for any audit)

1. **Per-engine citation snapshot** -- for 10 target queries, check current citation across ChatGPT/Gemini/Perplexity/Copilot/Claude/Apple Intelligence. Note which engines cite us, which cite competitors, which cite nobody.
2. **Robots.txt diff** -- current state vs the directives in this agent. Flag any blocked citation-class UAs.
3. **Atomic-fact audit** -- top 20 ranking pages: do they open with a 40-75 word self-contained answer under H1 and each H2? Flag pages that bury the answer.
4. **Entity-graph snapshot** -- Wikipedia status, Wikidata QID status, `sameAs` chain completeness (GBP, Apple Business, LinkedIn, Facebook, HomeStars, Houzz, BBB, ICPI directory).
5. **Reddit + YouTube co-presence audit** -- is the brand mentioned organically in r/[relevant subs]? Is there an active YouTube channel? Brand mention rate across the top-3 subreddits relevant to the business.
6. **Per-engine measurement plan** -- which tool/process tracks citation lift for each engine, monthly.
7. **Citation-acquisition roadmap** -- prioritized 30/60/90-day actions per engine.

## Cross-references

- Atomic-fact passage construction + banned phrases -> Agent 11.
- Fact-citation gate before publishing claims -> Agent 22.
- Bing Webmaster Tools setup, AI Performance Report parsing, Apple Business optimization -> Agent 23.
- Reddit/Quora seeding, brand listicle pitching -> Agent 09.
- Wikidata + sameAs chain implementation -> Agent 08.

## Sources (load on demand)

- Princeton GEO paper -- arxiv.org/abs/2311.09735
- Profound AI Citation Patterns -- tryprofound.com/blog/ai-platform-citation-patterns
- ALM Corp AI Overview citations drop -- almcorp.com/blog/google-ai-overview-citations-drop-top-ranking-pages-2026/
- SE Roundtable / Mueller on llms.txt -- seroundtable.com/google-does-not-endorse-llms-txt-40789.html
- OpenAI bot docs -- platform.openai.com/docs/bots
- Perplexity crawler docs -- docs.perplexity.ai/docs/resources/perplexity-crawlers
- Cloudflare on Perplexity stealth crawlers -- blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/
- Anthropic crawler docs -- privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Apple Applebot -- support.apple.com/en-us/119829
- Bing AI Performance -- blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- BrightLocal 2026 Consumer Review Survey (Apple Maps doubling) -- brightlocal.com/research/local-consumer-review-survey/
