# Master Website Build Prompt

Paste everything in the code block below into a fresh AI coding session (Claude Code or similar,
in an empty folder). Fill in the 3 required inputs at the top. The AI does the rest — full site,
SEO, images verified by eye, visual self-check, deploy config.

````text
# ROLE
You are a senior SEO engineer + conversion-focused web developer + designer. Build a COMPLETE,
production-ready, static HTML/CSS/JS website deployable on Vercel and engineered to rank #1 in
classic SEO, Local SEO, AEO (answer engines), GEO (generative engines) and AI-EO (AI crawlers).
Work autonomously through every phase below. Do NOT stop to ask me to continue — research, build,
verify with your own eyes (screenshots), fix, and only report back when the VERIFICATION CHECKLIST
passes. Nothing may be duplicated. Every image must be verified by opening and looking at it.

# INPUTS (I provide only these three)
- BUSINESS NAME: {{NAME}}
- MAIN CITY: {{CITY}}   ← auto-derive ALL realistic surrounding cities/towns in the service radius.
- SERVICES: {{LIST EVERY SERVICE}}
- (Optional — ASK me for these once, then proceed; never invent them) DOMAIN, PHONE, EMAIL, YEAR
  ESTABLISHED, CREDENTIALS/CERTIFICATIONS, BRANDS INSTALLED, TYPICAL PRICE RANGES, HOURS, OWNER NAMES,
  form-recipient email(s). If prices/credentials/reviews are unknown, OMIT them — never fabricate.

# PHASE 0 — RESEARCH & PLAN FIRST (USE THE SEO AGENT — do not skip, do not guess)
Before writing a single line of HTML, use SEO research agents to drive BOTH the keyword targeting AND how
the whole site is organized. Spawn these in parallel and act on their findings:
1. KEYWORD-RESEARCH agent (web search): for EVERY service × the main city AND each surrounding city, find
   the high-intent commercial keywords ("[service] [city]", "[service] cost [city]", "[service] near me",
   "[city] [service]"), the cost/comparison/"how much / how long" question queries (AEO/voice), and any
   seasonal terms. Return a ranked keyword list grouped by intent and by service.
2. COMPETITOR agent (web search): find the top 3–5 sites ranking for the money terms in this city and report
   what makes them win — page types, content depth, schema, reviews/GBP signals, service×city coverage — as
   concrete patterns to match or beat.
3. SITE-ARCHITECTURE agent: turn that research into a SITE BLUEPRINT — the exact page list and URL tree, with
   EACH page mapped to exactly ONE primary keyword/intent (so no two pages compete → zero cannibalization),
   the hub-and-spoke internal-linking plan, and which surrounding cities and city×service combinations
   deserve a dedicated page. Output a keyword→URL map.
4. If improving an EXISTING site: an AUDIT agent — page inventory, title/meta/schema coverage, internal
   linking, cannibalization clusters, coverage gaps — as a prioritized fix list.
DELIVERABLE OF PHASE 0: a written SITE BLUEPRINT (URL tree + keyword→page map + internal-linking plan).
Build STRICTLY from that blueprint, and re-check every page against it so nothing overlaps. Keep using the
SEO agent throughout — for new keyword ideas, to sanity-check that two pages aren't targeting the same query,
and to source the local facts (permits, neighbourhoods, conditions) that make each city page genuinely unique.

# SITE ARCHITECTURE (hub-and-spoke; each page type = ONE distinct search intent → zero cannibalization)
1. Home — brand + "[primary service] [main city]" intent, with ALL sections listed under HOMEPAGE below.
2. /services/ hub + one page PER service (commercial intent). Nested sub-service pages where a service
   has clear sub-types (e.g. /services/concrete/driveways/).
3. /service-areas/ hub + one page PER city (local intent) + CITY×SERVICE pages
   (/service-areas/[city]/[service]/) — the biggest local-SEO lever. Each city page must be genuinely
   local (neighbourhoods, soil/site conditions, permits/authorities, landmarks) — NOT find-and-replace.
4. /solutions/ hub + one page PER common customer PROBLEM (question/"how to fix" intent) — captures AEO/voice.
5. /blog/ hub + cost/comparison/how-long/buyer-guide articles, author-attributed for E-E-A-T.
6. Trust/utility: /about/ (real people + credentials + story), /contact/, /faq/, /thank-you/ (noindex),
   /privacy/, /terms-of-service/, and an HTML /sitemap/.
7. (Optional) /lp/ paid landing pages — noindex,follow; keep OUT of sitemap.xml; keep crawlable in robots.

# HOMEPAGE SECTIONS (match this reference set, in order)
- Top call bar (credentials + click-to-call phone).
- Sticky header: logo, nav (Services / Service Areas / Solutions / Blog / About), prominent "Free Quote"
  button, mobile hamburger menu.
- HERO WITH A REAL IMAGE (see IMAGE INTEGRITY): background photo + dark overlay for contrast, eyebrow,
  H1, subhead, dual CTA (primary "Get a Free Quote" + phone), and a row of trust badges (licensed,
  certified, insured, warranty).
- Trust/stats bar (years in business, projects done, response time, rating* — omit rating if no real reviews).
- Services grid: cards with a REAL SVG icon each (not gradient blobs), title, one-line benefit, "learn more".
- Why-us section paired with an inline quote form (short, high-converting).
- Service-areas grid linking city pages.
- FAQ section (unique to the homepage).
- CTA band.
- Footer: brand blurb, services list, service-areas list, contact, legal links.

# QUOTE / CONTACT FORM (every form)
- Fields: name, email, phone, city, service, message. Label every field; validate required fields.
- A hidden HONEYPOT field (e.g. name="website") — if filled, silently drop.
- Server-side handler (Vercel serverless /api/quote) that: rate-limits, drops honeypot hits, and FILTERS
  B2B SOLICITATION (agencies pitching SEO/web-design/marketing TO the business). Hard-drop on signals a
  real customer never writes: "SEO", "backlinks", "link building", "guest post", "web design/development",
  "digital marketing", "rank on Google", "first page of Google", "we came across your website", "WordPress",
  "lead generation". Require 2 soft signals ("more leads", "grow your business", "free audit", "no obligation")
  or 1 soft + a link. IMPORTANT false-positive guard: only treat the bare acronym "SEO" as a signal inside
  the MESSAGE body, never in the name field (someone may be named "Seo"). Validate this filter against a set
  of real solicitations (must drop) and real customer messages incl. edge-case names (must pass).
- Email deliverability: send FROM the brand's own domain (matching From/domain), publish SPF+DKIM+DMARC,
  real recipients in To: (never Bcc:), include a text/plain part, pin Message-ID + envelope to the domain.
- On confirmed success redirect to /thank-you/ (which fires the conversion event). Dropped/spam submissions
  must NEVER reach /thank-you/ (route them to a neutral page) so they can't fire a false conversion.

# PER-PAGE TECHNICAL SEO (every page)
- Unique <title> (~50–60 chars) and meta description (~150–160), keyword-front-loaded. No duplicates anywhere.
- Exactly ONE self-referencing <link rel="canonical"> (absolute https + your single chosen host + trailing slash).
- <meta name="robots" content="index, follow"> (noindex only on /lp/ and /thank-you/).
- Open Graph + Twitter tags (type/title/description/url/image/image:alt/site_name/locale, twitter:card).
- Exactly one <h1>; logical h2/h3 outline. Semantic HTML5, mobile-first, WCAG AA (labels, focus, contrast).

# STRUCTURED DATA (JSON-LD) — full stack, valid to schema.org + Google Rich Results
- Site-wide LocalBusiness/Organization (NAP, geo, areaServed City list + GeoCircle, openingHours, sameAs,
  hasCredential) + WebSite node.
- Every page: BreadcrumbList.
- Service & city×service pages: Service (+ Offer/PriceSpecification ONLY if I gave real prices) + FAQPage.
- City pages: LocalBusiness scoped to that City + GeoCoordinates + FAQPage.
- Solutions: FAQPage and/or HowTo (steps).
- Blog: Article + author Person (real name/role) + datePublished/dateModified + FAQPage.
- Review/AggregateRating ONLY with real reviews — else omit. If used, keep aggregateRating on the homepage
  only, not on every page.

# DEDICATED FAQ ON EVERY PAGE
4–8 UNIQUE questions specific to that page's topic/city, mirrored in FAQPage JSON-LD. No FAQ question may
repeat anywhere on the site. Answers = concise, quotable ~40–55-word "atomic answers" AI engines can lift.
The visible FAQ text and the schema text must match exactly.

# NO DUPLICATION — HARD REQUIREMENT (verify with a script, not by feel)
- Zero duplicate <title>, meta description, canonical, or H1 across the whole site.
- Zero duplicate FAQ questions site-wide.
- For templated pages (e.g. city×service), body-content overlap must stay LOW. Measure 5-word-shingle
  Jaccard similarity between every same-type pair; keep it under ~15% (aim for <10%). If two pages exceed
  that, reword the shared boilerplate (cost tables, generic paragraphs, repeated FAQ answers) with distinct,
  locally-specific wording — keep facts/prices identical, change phrasing.
- Build city×service pages with a GENERATOR that reuses the exact header/footer boilerplate but injects
  UNIQUE per-city content (real neighbourhoods, soils, permit authorities, local geography). Never ship
  find-and-replace clones.

# IMAGE INTEGRITY — CRITICAL (verify every image by opening and LOOKING at it)
- FILENAMES LIE. Before using ANY image on a page, OPEN THE IMAGE FILE AND LOOK AT IT to confirm it depicts
  what the page is about. Never place (e.g.) a pool photo on a driveway page just because of its filename.
- Read the actual pixel dimensions of each image and set correct width+height (prevent layout shift/CLS).
- Every image: descriptive, keyword-aware alt text; modern format (WebP/AVIF) with fallback; lazy-load below
  the fold; the HERO image preloaded with fetchpriority="high".
- Every image must be VISIBLE (not hidden/broken/zero-size) and RELEVANT to its page. No broken image links.

# AEO / GEO / AI-EO
- /llms.txt at root: one-line summary; "Last updated" + cadence; Disambiguation (canonical domain; what NOT
  to confuse it with); Identity (site/email/phone/address/founded/geo bbox); Principals (real people+roles);
  Credentials; Authoritative external recognizers (directory/brand/GBP URLs); a numbered list of ATOMIC,
  DATED key facts (prices, specs, coverage) an LLM can cite verbatim.
- robots.txt: allow major search + AI crawlers explicitly (Googlebot, Bingbot, DuckDuckBot, Google-Extended,
  Applebot + Applebot-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot,
  anthropic-ai, PerplexityBot, Perplexity-User, CCBot, Amazonbot, Meta-ExternalAgent, MistralAI-User, YouBot,
  Bytespider). Disallow /api/. Reference the sitemap.
- Write copy entity-rich and extractable: define the entity early, consistent NAP everywhere, front-load a
  direct one-sentence answer, use tables/lists for specs and prices.

# VERCEL DEPLOYMENT — MUST BE DEPLOY-READY OUT OF THE BOX (zero manual fixup)
- vercel.json (valid JSON): "trailingSlash": true, "cleanUrls": false; a 301 forcing apex→www (pick ONE
  canonical host and 301 the other); 301s from any legacy /page.html → /page/; security headers on all routes
  (HSTS preload, X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy
  strict-origin-when-cross-origin, a sane Permissions-Policy); immutable long cache for /assets,/css,/js;
  short cache for sitemap/robots; correct Content-Type for sitemap.xml (application/xml) and llms.txt (text/plain).
- Generate sitemap.xml (indexable URLs only, with lastmod; exclude /lp/ and noindex pages), robots.txt,
  llms.txt, favicon set, and og:image.
- The form handler is a Vercel serverless function at /api/quote (Node). Include a package.json with its
  dependencies (e.g. nodemailer) and set "type":"module" if using ESM. Read SMTP/recipient config from
  ENVIRONMENT VARIABLES (SMTP_HOST/PORT/USER/PASS, EMAIL_FROM, recipients) — never hardcode secrets. Provide
  a .env.example and a short README listing every env var to set in Vercel and the DNS records (SPF/DKIM/DMARC)
  to publish. Add a .gitignore (node_modules, .vercel, .env).
- All asset paths are absolute ("/css/...", "/assets/...") so they resolve under Vercel's routing.
- DEPLOY-READINESS TEST before finishing: run `node --check` on every .js/api file (must pass); validate
  vercel.json, sitemap.xml and every JSON-LD block parse; serve the folder locally and confirm every page,
  partial, /robots.txt, /sitemap.xml and /llms.txt return 200 with no broken links or missing assets. State
  that a `vercel` deploy of this folder needs only the env vars set — nothing else.

# PERFORMANCE (Core Web Vitals)
Self-host fonts as WOFF2, preload the critical ones, font-display: swap, no render-blocking third-party CSS.
Preload the hero/LCP image; compress all images; set explicit dimensions. Minimal deferred JS. Target LCP
< 2.5s, CLS < 0.1, INP < 200ms.

# VISUAL SELF-VERIFICATION — DOUBLE-CHECK WITH YOUR OWN EYES
After building, and again after any fix:
1. Run a local static server.
2. Take SCREENSHOTS of every page TYPE at desktop (~1360px) AND mobile (~390px) widths using a real browser.
3. LOOK at each screenshot. Confirm: the hero image loads and text is readable over it; icons are real (not
   placeholder blobs); every image is visible and matches its page; layout isn't broken; nothing looks
   generic/AI-generated. Fix issues and RE-RENDER until it looks genuinely designed and correct.

# FINAL VERIFICATION CHECKLIST — report pass/fail on each; only claim done if all pass
1. Canonicalization: exactly one canonical/page; only ONE host resolves (other 301s); no page reachable at
   two URLs; every canonical absolute-https-trailing-slash.
2. No duplication: run the script — 0 duplicate titles/metas/canonicals/H1s; 0 duplicate FAQ questions;
   templated-page body overlap under ~15%.
3. Every page: unique title+meta, one H1, OG/Twitter, valid JSON-LD, a dedicated FAQ + FAQPage matching it.
4. Schema validates; no fabricated reviews/prices.
5. Images: EVERY image opened and confirmed to match its page; correct width/height; alt text; hero preloaded;
   no broken/hidden images.
6. AEO/GEO: llms.txt present + dated + atomic facts; robots.txt allows all listed AI crawlers; NAP consistent
   site-wide and matches llms.txt.
7. Vercel deploy-ready: vercel.json valid; redirects + headers + caching + content-types correct; sitemap
   excludes noindex/lp with correct lastmod; /api handler passes `node --check`; package.json + .env.example
   + .gitignore present; local serve returns 200 for every page, partial, robots.txt, sitemap.xml, llms.txt;
   `vercel` deploy would need only env vars set.
8. Conversion: every page has an above-the-fold CTA + click-to-call; form has validation + honeypot +
   server-side solicitation filter + a thank-you page; spam can't fire the conversion.
9. Visual: screenshots of every page type at desktop + mobile reviewed by eye; looks designed; all images
   visible and relevant.
State "All 9 checks passed" only if true; otherwise list failures, fix them, and re-verify before finishing.
````

## How to use it
1. Copy everything inside the code block into a fresh AI coding session (in an empty folder).
2. Replace `{{NAME}}`, `{{CITY}}`, `{{LIST EVERY SERVICE}}`. The AI will ask once for the optional details
   (phone, prices, credentials) — give it what you have; it won't invent numbers.
3. Let it run: it researches, builds, verifies every image and page visually, checks for duplicates, and
   only reports back when the checklist passes.
