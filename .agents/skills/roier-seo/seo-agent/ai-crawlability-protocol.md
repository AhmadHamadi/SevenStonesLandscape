# AI Crawlability And AI Search Protocol

Use this protocol when auditing AI search visibility, AI crawler access, answer-engine readability, or "AIEO/GEO" recommendations.

## Core Principle

AI crawlability starts with normal search crawlability and useful content. Do not recommend fake "AI SEO hacks." The strongest recommendations should also improve users' ability to understand the page.

## Official Baseline

### Google AI Overviews / AI Mode

Google states that the same foundational SEO practices apply to AI features in Search. To be eligible as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to appear in Google Search with a snippet.

Check:

- Page is crawlable by Googlebot.
- Page is indexable.
- Page is snippet-eligible and not blocked by `nosnippet` or overly restrictive snippet controls.
- Important content is available as textual content and HTML text, not only images, video, canvas, or PDF files.
- Internal links make important pages discoverable.
- Structured data matches visible page content.
- Business Profile and Merchant data are up to date when relevant.
- Page follows Search policies and helpful content principles.

Controls that can reduce AI feature usage in Google Search:

- `noindex`
- `nosnippet`
- `data-nosnippet`
- `max-snippet`
- Googlebot blocking in robots.txt

### OpenAI Crawlers

OpenAI crawler controls are separate by purpose:

- `OAI-SearchBot`: search visibility in ChatGPT search features.
- `GPTBot`: crawling that may be used for model training.
- `ChatGPT-User`: user-initiated browsing/actions; not automatic web crawling.

Do not treat these as the same. A site may allow search visibility while disallowing model-training crawl, depending on business preference.

### Perplexity

Perplexity documents separate agents by purpose:

- `PerplexityBot`: search/indexing behavior used to surface and link websites in Perplexity results.
- `Perplexity-User`: user-requested page access from inside Perplexity; not the same as automatic crawling.

If the business wants visibility in Perplexity answers, check whether `PerplexityBot` can access important public pages. If it is disallowed, explain the visibility tradeoff and confirm business preference before changing robots.txt. Also check WAF rules and IP allowlists when the robots.txt policy looks correct but Perplexity still cannot fetch the site.

### Anthropic / Claude

Anthropic documents separate Claude/Anthropic agents by purpose:

- `ClaudeBot`: model-training crawl preference.
- `Claude-User`: user-directed retrieval from Claude.
- `Claude-SearchBot`: search quality and search visibility/indexing behavior.

Check the current Anthropic documentation before changing robots.txt because crawler names and purposes can evolve. Separate Claude/Anthropic crawl permissions from Google Search, OpenAI search, and model-training preferences.

### Google / Gemini Controls

Googlebot access affects Google Search and Google AI features in Search. `Google-Extended` is a separate robots.txt product token that affects some Google AI product uses and should not be confused with normal Googlebot indexing. Do not block Googlebot when the goal is Search or Google AI visibility.

### LLMs.txt

`llms.txt` can be reviewed if present, but it is not a guaranteed standard for search visibility. Do not claim it is required for Google AI features. Treat it as optional documentation for AI tools, not a replacement for crawlable, indexable, helpful web pages.

## AI Crawlability Checks

### Access And Controls

| Check | Why It Matters |
|---|---|
| Robots.txt allows relevant search crawlers | Blocked pages cannot be crawled normally. |
| Googlebot access | Needed for Google Search and AI features in Search. |
| OAI-SearchBot policy | Affects ChatGPT search visibility. |
| GPTBot policy | Indicates whether content may be crawled for model training. |
| PerplexityBot policy | Affects Perplexity crawl/index behavior. |
| Perplexity-User policy | Affects user-requested Perplexity fetch behavior; not automatic indexing. |
| ClaudeBot policy | Affects Anthropic model-training crawl preference. |
| Claude-User policy | Affects user-directed Claude retrieval. |
| Claude-SearchBot policy | Affects Anthropic/Claude search visibility and search quality crawling. |
| Anthropic/Claude crawler policy | Affects Anthropic/Claude crawler access depending on current bot purpose. |
| Google-Extended policy | Affects certain Google AI product uses, not normal Googlebot indexing. |
| Important pages are not `noindex` | Noindex blocks search eligibility. |
| Snippet controls are intentional | `nosnippet` and restrictive `max-snippet` can limit AI/search preview usage. |
| CDN/WAF does not block crawlers | Infrastructure can block legitimate crawlers even when robots.txt allows them. |
| Pages return stable 200 status | Errors, redirects, and soft 404s reduce crawl/use reliability. |

### Extractability

| Check | Why It Matters |
|---|---|
| Main content is HTML text, not only images/video/canvas/PDF | AI/search systems need extractable text. |
| Important content is present in rendered HTML | Client-only content may be missed or delayed. |
| Headings outline the page clearly | Helps humans and systems understand structure. |
| FAQs answer real user questions | Helps direct answers and long-tail discovery. |
| Tables/lists summarize facts clearly | Improves extraction and comparison. |
| PDFs and images have HTML equivalents where important | HTML is easier to crawl, parse, and cite. |

### Entity And Trust

| Check | Why It Matters |
|---|---|
| Organization/person/product/service/entity names are consistent | Reduces ambiguity. |
| About/contact/location details are clear | Supports trust and local/entity understanding. |
| Authors, reviewers, or business credentials are visible where relevant | Especially important for YMYL topics. |
| Claims are supported by proof | Avoids unsupported AI-answer bait. |
| Structured data matches visible content | Reinforces entity clarity without spam. |
| Reviews/testimonials are real and visible if marked up | Prevents fake schema risk. |

### Answer Readiness

| Check | Why It Matters |
|---|---|
| Page answers the primary query early | Helps users and summaries understand the page quickly. |
| Short answer blocks are factual and page-specific | Useful for extraction, snippets, and conversions. |
| Comparison/cost/process sections are clear | AI search often answers multi-part queries. |
| Local service pages include city/service proof | Helps local relevance and reduces doorway risk. |
| Content is updated when facts change | AI/search systems should not find stale claims. |

## Deliverables

### AI Crawlability Audit

| URL | Access Issue | Extractability Issue | Entity/Trust Issue | Fix | Priority |
|---|---|---|---|---|---|

### AI Crawler Controls

| Crawler/Control | Current Status | Business Intent | Recommendation |
|---|---|---|---|
| Googlebot | | | |
| OAI-SearchBot | | | |
| GPTBot | | | |
| ChatGPT-User | | | |
| Google-Extended | | | |
| PerplexityBot | | | |
| Perplexity-User | | | |
| ClaudeBot | | | |
| Claude-User | | | |
| Claude-SearchBot | | | |
| `nosnippet`/`max-snippet` | | | |

### Answer Block Opportunities

| Page | Query/Intent | Suggested Answer Block | Evidence Needed |
|---|---|---|---|

### AI Search Quick Wins

| Task | Page | Why It Helps | Effort |
|---|---|---|---|

## Rules

- Do not claim AI visibility can be guaranteed.
- Do not claim special schema is required for Google AI Overviews or AI Mode.
- Do not recommend allowing training crawlers unless that matches the business owner's preference.
- Do not confuse search/index crawlers with model-training crawlers.
- Verify current crawler documentation before editing robots.txt rules for AI crawlers.
- Do not hide content from users while exposing it to crawlers.
- Do not create generic AI-written blocks with unsupported claims.
- Prioritize crawlable, indexable, helpful, trustworthy, well-structured pages.
