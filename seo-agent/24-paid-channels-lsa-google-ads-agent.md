# Agent 24: Paid Channels -- LSA, Google Ads, Apple/Bing Ads (Contractor)

Before auditing, follow `shared-audit-protocol.md`.

## Purpose

Paid search is the fastest lever for contractor lead-gen. SEO + AEO compound over months; paid leads start within hours. This agent covers Local Service Ads (Google Guaranteed), Google Ads (Search + Performance Max), Microsoft Ads, and the upcoming Apple Maps Ads -- specifically for service-area contractors (landscapers, hardscapers, roofers, plumbers, builders).

This agent is invoked when:
- The business has cash flow to support paid acquisition ($300+/week minimum).
- Organic SEO has not yet built enough momentum to fill the pipeline.
- The business is launching in a new service area where organic has zero presence.
- The business is in peak season and wants to capture overflow demand.

## Hard rules

1. **LSA first when eligible** -- pay-per-lead beats pay-per-click on qualified contractor traffic. Google Guaranteed badge displays above paid and organic, including AIO citation slots.
2. **No paid campaign without conversion tracking.** Enhanced conversions + GA4 first-party data feed is now mandatory in 2026 (cookie/Consent Mode loss = 25-35% attribution gap without it).
3. **Customer Match migration** -- Google Ads API disabled Customer Match uploads from inactive developer tokens April 1, 2026. Migrate to Data Manager API.
4. **Performance Max requires >=30 conversions/month** before Smart Bidding stabilizes. Below that threshold, use Search campaigns with manual or Maximize Conversions bidding.
5. **LSA and GBP reviews are separate systems.** LSA reviews don't show on GBP and vice versa. Push every closed job to both pipelines.
6. **Do not duplicate keywords across LSA + Search + PMax.** Negative-keyword each channel against the others to avoid bidding against yourself.

## Part A -- Local Service Ads (Google Guaranteed)

### Eligibility for contractors (2026)

Landscaping and hardscape categories are eligible (rolled out 2024-25 in most North American markets). Required:

- License (where applicable per category; landscape contracting is unlicensed in Ontario but ICPI/Landscape Ontario membership is signal).
- General liability insurance certificate.
- Background check (Pinkerton or Google's contracted provider).
- Active GBP listing.
- Email + phone reachable during business hours.

### Cost benchmarks (May 2026, GTA contractor)

| Category | Cost per lead | Weekly spend floor |
|---|---|---|
| Landscaping (general) | $25-$60 | $300 |
| Hardscape / Paving | $40-$90 | $400 |
| Snow removal (seasonal) | $20-$45 | $200 |
| Lawn care | $20-$40 | $200 |
| Tree service | $35-$75 | $300 |
| Pool installation | $80-$200 | $500 |

ROAS for strong-review contractors: 8-15x. Below 4x usually indicates either weak reviews, poor lead handling, or misaligned service categories.

### LSA ranking factors (in order of weight)

1. **Review count and recency** -- #1 factor. Sustained 4-8 reviews/month with high ratings.
2. **Response time to LSA leads** -- must answer calls/messages within minutes during business hours. Missed leads degrade ranking fast.
3. **Job completion rate** -- Google tracks lead -> booked job conversion.
4. **Service category alignment** -- must accurately reflect what you actually do.
5. **Business profile completeness** -- photos, hours, services, license/insurance docs.
6. **Geographic reach** -- set realistic service area, not max radius (Google penalizes overreach).

### LSA review system

- Reviews on LSA are separate from GBP reviews. Customers leave LSA reviews via a Google-sent email after a tracked LSA lead.
- Push every customer to leave both LSA review AND GBP review. They strengthen different surfaces.
- Reply to all LSA reviews within 24 hours.

### LSA setup checklist

1. Sign up at `localservicesads.google.com`.
2. Pick primary category + up to 3 secondary categories.
3. Set service area (city list, not radius for SAB).
4. Upload license + insurance docs.
5. Complete background check.
6. Set weekly budget -- start at $300, scale based on lead quality + booked rate.
7. Set bidding mode: "Maximize Leads" (default) or "Max Per Lead" (cap-based control).
8. Enable Booking Service (if available in category) -- direct calendar booking inside LSA.

## Part B -- Google Ads (Search)

### When to run Search vs Performance Max

- **Under 30 conversions/month**: Search campaigns only. Manual or Maximize Conversions bidding.
- **30+ conversions/month**: Add Performance Max for upper-funnel + audience signal expansion.
- **100+ conversions/month**: PMax + Demand Gen + Search, with audience segmentation.

### Search campaign structure for contractors

Recommended account structure:

```
Account
+-- Campaign: Branded
|   +-- Ad group: [Business Name] + variants
+-- Campaign: Core Services -- Hardscape
|   +-- Ad group: Interlock / Pavers
|   +-- Ad group: Retaining Walls
|   +-- Ad group: Driveway Pavers
|   +-- Ad group: Patio Pavers
+-- Campaign: Core Services -- Lawn / Landscape
|   +-- Ad group: Landscape Design
|   +-- Ad group: Sod Installation
|   +-- Ad group: Lawn Maintenance
+-- Campaign: Seasonal -- Snow Removal (Nov-Mar)
+-- Campaign: Competitor (optional, cost-of-ad-rank trap)
```

### Keyword match types in 2026

- **Phrase match** is the workhorse -- Broad match has expanded too aggressively post-2024 to be safe without strong negative lists.
- **Exact match** for highest-intent transactional queries ([paver patio installer Hamilton]).
- **Broad match** ONLY with: aggressive negative-keyword list + Smart Bidding + >=50 conversions/month for the campaign.

### Negative keyword starter list (contractor)

```
diy
how to
free
job
career
salary
hiring
plans
software
images
photos
pictures
ideas
designs
inspiration
youtube
reddit
wikipedia
```

Add per-vertical: kits, equipment, rental, supply, wholesale (unless those are part of the business).

### Ad creative basics

- Use Responsive Search Ads (RSA) with at least 8 headlines + 4 descriptions.
- Pin H1 = brand name; H2 = primary service; H3 = location.
- Use ad extensions: location, call, sitelinks, callouts, structured snippets, image, lead form.
- Match landing page H1 + meta description to ad copy.

## Part C -- Performance Max (PMax) for Contractors

### Asset group structure for a hardscape contractor

```
PMax Campaign -- Hardscape
+-- Asset Group: Patios / Pavers
|   +-- Landing page: /services/paver-patios/
|   +-- Audience signal: Past customers + lookalikes + custom intent (paver patio installer)
|   +-- Image assets: 4-6 patio project photos
+-- Asset Group: Retaining Walls
|   +-- Landing page: /services/retaining-walls/
|   +-- Audience signal: home renovation intenders + custom intent
+-- Asset Group: Driveways
|   +-- Landing page: /services/driveways/
+-- Asset Group: Outdoor Living (pergolas, fire pits)
    +-- Landing page: /services/outdoor-living/
```

### PMax audience signal (post-cookie era)

- **Customer Match list** -- upload past customer emails + phones via Data Manager API (Customer Match via Google Ads API is disabled as of April 1, 2026).
- **Lookalike from Customer Match** -- Google generates similar audiences from the seed list.
- **Custom intent** -- keywords that signal in-market for the service.
- **In-market segments** -- Home & Garden / Home Improvement / Outdoor Living.

### PMax launch checklist

1. >=30 conversions/month verified in account.
2. Enhanced conversions enabled at GTM/GA4.
3. Conversion values set on lead form / phone call.
4. Customer Match list uploaded (>=1,000 records ideally).
5. 4-6 asset groups, one per service vertical.
6. Image assets: original project photos (no stock -- Google's 2026 quality scoring penalizes stock heavily).
7. Final URL expansion: ON, with URL-exclusion list for non-service pages (cart, login, careers, blog if not lead-driving).
8. Brand exclusions: ON (route branded queries to a Search Brand campaign).

### Brand-exclusion strategy

Without brand exclusions, PMax cannibalizes branded Search traffic at full CPC. Always:
- Run a separate Search Brand campaign with low CPC (Quality Score 10).
- Add brand terms to PMax Brand Exclusions.

## Part D -- Microsoft Ads (for Bing + Copilot + ChatGPT Search)

Cheap, underexploited. ChatGPT Search runs on the Bing index, so Microsoft Ads inventory now appears inside ChatGPT for many query types.

### Setup

1. Sign up at `ads.microsoft.com`.
2. **Import from Google Ads** (one-click) -- campaigns, ad groups, keywords, ads, extensions all import.
3. Adjust bids -- Bing CPCs are typically 30-50% lower than Google for the same keywords.
4. Set up Universal Event Tracking (UET) tag.
5. Enable enhanced conversions equivalent (Microsoft Clarity integration + UET).
6. Watch the **Copilot audience network** -- Microsoft started monetizing Copilot answer surfaces in late 2025. Native ad placements inside Copilot results are now part of the Microsoft Audience Network ad inventory.

## Part E -- Apple Maps Ads (launching Summer 2026)

- Self-serve via Apple Search Ads dashboard.
- Bid on place-card surface for queries near service area.
- Early-mover advantage in contractor categories -- most competitors will not have set up by Q3 2026.
- Expected CPCs for non-app categories: $1-$5 range projected.
- Required: claimed Apple Business listing (see Agent 23).

## Part F -- Conversion tracking 2026

### Required stack

1. **GA4** with enhanced measurement, Server-side GTM where possible.
2. **Google Ads + GA4 linked** -- import conversions from GA4 to Google Ads.
3. **Enhanced conversions** -- first-party hashed email/phone passed back to Google for de-anonymization. 25-35% attribution recovery vs Consent Mode default.
4. **Offline conversion import** -- when a closed job is billed in CRM, push back to Google Ads as conversion. This is what teaches Smart Bidding which leads turn into revenue.
5. **Call tracking** -- CallRail, WhatConverts, or Google's own forwarding number with call recording.
6. **Form tracking** -- both submit event and Google Ads conversion fire on form submission.

### Microsoft Ads parallel stack

- UET tag + enhanced conversions (Microsoft's equivalent launched Q1 2026).
- Bing call tracking via Microsoft's forwarding number or third-party.

## Deliverables

1. **Paid channel mix recommendation** -- for this contractor's budget and stage, which mix of LSA / Search / PMax / Microsoft Ads / Apple Maps Ads.
2. **LSA eligibility check + setup plan** -- categories, service area, weekly budget, review pipeline integration.
3. **Google Ads account audit** (if existing) -- structure, match types, negative lists, ad extensions, landing page alignment, conversion tracking.
4. **Conversion tracking audit** -- GA4 + Google Ads link, enhanced conversions, offline import, call tracking, form tracking.
5. **Budget allocation** -- weekly spend across channels with expected lead volume.
6. **Negative keyword starter list** for the vertical.
7. **30/60/90-day paid roadmap** with launch sequence and review cadence.

## Cross-references

- GBP setup and review velocity -> Agent 05.
- Conversion tracking technical setup -> Agent 10.
- Customer Match data preparation -> Agent 17.
- AI search citation impact of paid (PMax can boost Cited-brand AIO lift) -> Agent 21.
- Bing-side paid + organic alignment -> Agent 23.

## Sources (load on demand)

- LSA Guide for Contractors 2026 -- `jweis.com/blog/local-service-ads-guide-contractors`
- Citadel Hardscape Marketing LSA -- `citadelhardscapemarketing.com/google-local-service-ads`
- Performance Max Lead Gen 2026 -- `yeezypay.io/blog/google-performance-max-lead-generation-practical-2`
- ALM Corp PMax 2026 -- `almcorp.com/blog/google-ads-performance-max-2026-strategy-guide`
- ALM Corp Customer Match April 2026 -- `almcorp.com/blog/google-ads-api-customer-match-disabled-april-2026`
- Microsoft Ads Copilot inventory -- `about.ads.microsoft.com`
- Apple Search Ads (Maps Ads parent platform) -- `searchads.apple.com`
