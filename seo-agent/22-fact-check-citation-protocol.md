# Agent 22: Fact-Check & Citation Protocol

Before auditing, follow `shared-audit-protocol.md`.

## Purpose

Block factual fabrications from reaching production. The pack previously allowed a fabricated Burlington bylaw number into a published blog post (`Public Tree Bylaw 098-2025` cited as private-property tree law -- the actual private-property bylaw is `040-2022` amended by `100-2025`). This agent owns the verification layer that every factual claim must pass before it leaves draft.

This protocol fires inside Agent 04 (content/EEAT), Agent 07 (location pages), Agent 11 (AI-visibility content), Agent 20 (review-creator), and any GBP-post or service-description workflow.

## Hard rules

1. **Every statutory, regulatory, governmental, or municipal claim must cite a primary source URL** -- the actual municipal/provincial/federal site, not a third-party blog quoting it.
2. **Statistics, prices, and benchmarks must cite either** (a) a primary source URL, (b) an internal first-party dataset reference, or (c) be hedged ("typically", "roughly", "in our experience") with a date.
3. **Personal-name claims** (engineer, inspector, official, supplier rep) must be verifiable through a public registry or directory.
4. **Any "bylaw number, code section, certification ID, license number, association membership"** must be re-verified via the issuing authority's site within 14 days of publication.
5. **Date a fact:** every claim has a "current as of YYYY-MM-DD" marker. Facts older than 12 months get re-verified at the annual content review.
6. **If a claim cannot be sourced, it does not ship.** Rewrite to remove the unverifiable detail or hedge to opinion ("based on our project experience, ...").

## Claim taxonomy -- what needs citing vs. what does not

| Claim type | Citation required? | Example |
|---|---|---|
| **Must cite -- primary source** | Always | Municipal bylaw number, building code section, provincial/federal regulation, license/certification ID, industry standard reference (ASTM, ICPI spec, OBC clause). |
| **Must cite -- primary or hedge** | Always | Cost benchmarks, statistics, "X% of homeowners", market data, climate/soil data, jurisdictional turnaround times. |
| **Should cite -- third-party acceptable** | Strongly preferred | Trade-association recommendations, manufacturer specifications, news events, court cases, government reports. |
| **First-party hedge OK** | Allowed without external citation | "In our experience installing pavers in Hamilton since 2013, projects typically run $X-$Y depending on...". Voice must clearly mark it as first-party experience. |
| **General knowledge -- no citation needed** | No | "Freeze-thaw cycles damage concrete." (Truism, not specific claim.) |
| **Fabrication risk -- high** | Block | Specific bylaw numbers, specific dollar fines, specific permit fees, specific named officials, specific dates of legislative changes -- these are the high-fabrication-rate categories. |

## Verification workflow (any factual claim)

```
1. Identify the claim type from the taxonomy above.
2. If "Must cite":
   a. Find the primary source URL (municipal site, provincial registry, .gov, association directory).
   b. Verify the claim verbatim against the source.
   c. Record the URL + verification date in the page's `verified-sources` block.
   d. If the source contradicts the claim, REWRITE the claim or DROP it.
3. If "Should cite":
   a. Find at least one authoritative third-party URL.
   b. Verify within 7 days of publication.
4. If "First-party hedge":
   a. Confirm the voice clearly marks the claim as experiential ("we", "in our experience", "on our projects").
   b. Add a year stamp if the claim is cost/benchmark related ("as of 2026").
5. If unverifiable:
   a. REWRITE to remove the specific.
   b. If the page falls below substance, FLAG for redraft with a verifiable angle.
```

## Bylaw / regulation verification (contractor-specific)

For Hamilton/Burlington/Oakville/Milton/Halton hardscape claims, the **primary sources** are:

| Jurisdiction | Authoritative source |
|---|---|
| City of Hamilton bylaws | `hamilton.ca/government/by-laws-traffic-info` and the searchable bylaw registry |
| City of Burlington bylaws | `burlington.ca/en/by-laws-and-animal-services/by-law-search.aspx` -- PDF library, search by year + number |
| Town of Oakville bylaws | `oakville.ca/townhall/bylaws.html` |
| Town of Milton bylaws | `milton.ca/en/townhall/bylaws.aspx` |
| Region of Halton | `halton.ca` |
| Conservation Halton | `conservationhalton.ca/permits-and-approvals` |
| Conservation Hamilton | `conservationhamilton.ca` |
| Ontario Building Code | `ontario.ca/laws/regulation/120332` (current consolidation) |
| Niagara Escarpment Commission | `escarpment.org` |
| Tree Care Industry Association (ICPI parent for some specs) | `tcia.org` |
| ICPI (Interlocking Concrete Pavement Institute) | `icpi.org` |
| Landscape Ontario | `horttrades.com` |

**Before citing any bylaw number, confirm:**
1. The bylaw number is real (search the city's bylaw library).
2. The bylaw governs what you are claiming it governs (read the title and scope, not just the number).
3. The bylaw is in force (not repealed or amended).
4. If amended, cite both the original and amending bylaw (e.g., "Private Tree Bylaw 040-2022, as amended by 100-2025").

**Common contractor fabrication categories -- flag these specifically:**

- "Bylaw [number] requires X" -- verify number, scope, force date.
- "Fines start at $X" -- verify against the bylaw's penalty schedule, not a news article.
- "Permit timeline is X weeks" -- these vary; use city-published service standards or hedge with a date.
- "Permit fee is $X" -- fees update annually. Date the citation or hedge with a range.
- "Engineered drawings required for walls over X feet/metres" -- verify against the current OBC and municipal bylaw, both.

## Statistics & benchmark verification

For any numeric claim (cost, percentage, count, time):

1. **Source class A -- primary research** (Statistics Canada, CMHC, Ontario Building Officials Association, government white paper). Cite directly.
2. **Source class B -- industry association** (Landscape Ontario survey, ICPI publication, NCMA paper, BBB report). Cite with title + year.
3. **Source class C -- third-party publication** (Whitespark, BrightLocal, Sterling Sky, peer-reviewed study). Acceptable for SEO/digital claims, not regulatory.
4. **Source class D -- competitor or random blog** -- NEVER use as a primary citation. Find the source they cite and use that.
5. **First-party data** -- internal pricing, internal project counts, internal customer surveys. Mark clearly as first-party. Use sparingly to avoid appearing self-promotional.

## Citation format on the page

Every page with verifiable claims should carry one of these visible structures:

**Inline (best for blog posts):** Plain-text citation in the sentence: "Burlington's Private Tree Bylaw 040-2022 (amended Dec 2025 by 100-2025) requires..."

**Visible References block (best for AEO):** A `<h2>References</h2>` section at the bottom listing each primary source with title + URL + access date. Perplexity and Claude both weight this block heavily.

**HTML/Schema-level (do not skip):**
- `<cite>` tags around source attributions in body text.
- `ClaimReview` schema for fact-checked claims when applicable.
- Outbound links to primary sources marked `rel="noopener"` (not `nofollow` -- primary-source outbound links signal authority).

## Pre-publish factual-verification checklist (every page)

```
[ ] Every bylaw number / code section / regulation citation has a primary-source URL recorded.
[ ] Every dollar figure has a year stamp or hedge.
[ ] Every "X% of customers/projects/jobs" is either first-party (mark it) or has a third-party citation.
[ ] Every named person, official, or supplier is publicly verifiable.
[ ] Every certification, license, or association mentioned has a directory-page URL recorded.
[ ] The page carries a visible "Last updated YYYY-MM-DD" date.
[ ] The References block (where applicable) lists all primary sources.
[ ] No fabricated specific (bylaw number, fee, fine, deadline) made it past verification.
[ ] First-party claims are clearly marked as experiential, not regulatory.
[ ] If the page covers regulated work (permits, codes), a person with subject-matter expertise has signed off.
```

## Verified-sources block (internal record per page)

For every page that ships, save a record at `content-sources/<slug>.md`:

```
---
page: /blog/<slug>/
verified-by: <person/agent>
verified-on: 2026-05-11
next-review: 2027-05-11
---

## Claims & sources

- CLAIM: Burlington's Private Tree Bylaw 040-2022 (amended by 100-2025) requires Tree Protection Permit for trees >=20 cm DBH on private property within Burlington's Urban Planning Area.
  SOURCE: https://www.burlington.ca/en/by-laws-and-animal-services/resources/By-laws/By-law-Search/2022-By-laws/040-2022-By-law.pdf
  ACCESSED: 2026-05-11
  CONFIDENCE: high

- CLAIM: Burlington Pool Enclosure Bylaw 074-2005 requires fence + self-closing self-latching gate.
  SOURCE: https://www.burlington.ca/en/by-laws-and-animal-services/resources/By-laws/By-law-Search/074-2005-By-law.pdf
  ACCESSED: 2026-05-11
  CONFIDENCE: high
```

This block is not user-facing; it's the audit trail for re-verification at annual review.

## Recovery workflow (if a fabricated claim is found in production)

1. **Identify** -- which page, which line, which schema field.
2. **Verify the correct value** via primary source.
3. **Fix in all locations** -- body text, FAQ schema, FAQPage visible HTML, related-content snippets, sitemap if URL changed.
4. **Update `dateModified`** in the Article schema.
5. **Re-submit to Google Search Console** (URL Inspection -> Request Indexing).
6. **Re-submit via IndexNow** for Bing.
7. **Update the `verified-sources` block** for that page.
8. **Root-cause analysis** -- log how the fabrication slipped through (which step failed). Update Agent 04 / Agent 11 prompts to close the gap.

## Cross-references

- All content agents (04, 07, 11) must invoke this protocol before publishing.
- Agent 14 (QA) must verify presence of `verified-sources` block as part of QA.
- Agent 20 (review-creator) must not insert specific dollar fines, bylaw numbers, or municipal claims into review drafts without verification.
- Agent 18 (quick wins) must not include claim-modification tasks without flagging for verification.

## Why this exists

The bylaw 098-2025 fabrication shipped because:
1. No agent owned factual verification as a gate.
2. Content briefs had no `sources` field.
3. Reviewer/QA agents checked structure, not factual accuracy.
4. AI engines were already citing the error against the post (Agent 3 of the May 2026 pack-audit caught it post-publication).

This protocol closes that gap. The cost of one fabricated regulatory claim ranking is months of reputational damage and AI engines learning the wrong fact about your service area.
