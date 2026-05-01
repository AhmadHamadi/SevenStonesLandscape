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
- Page is eligible for snippets.
- Important content is available in textual form.
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
| Important pages are not `noindex` | Noindex blocks search eligibility. |
| Snippet controls are intentional | `nosnippet` and restrictive `max-snippet` can limit AI/search preview usage. |
| CDN/WAF does not block crawlers | Infrastructure can block legitimate crawlers even when robots.txt allows them. |
| Pages return stable 200 status | Errors, redirects, and soft 404s reduce crawl/use reliability. |

### Extractability

| Check | Why It Matters |
|---|---|
| Main content is text, not only images/video/canvas | AI/search systems need extractable text. |
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
- Do not hide content from users while exposing it to crawlers.
- Do not create generic AI-written blocks with unsupported claims.
- Prioritize crawlable, indexable, helpful, trustworthy, well-structured pages.

