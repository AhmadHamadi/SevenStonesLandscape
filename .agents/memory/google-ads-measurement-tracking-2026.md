# Google Ads Measurement And Tracking - May 2026

Measurement is the main competitive advantage for contractor Google Ads. Every recommendation should assume privacy loss, cookie loss, modeled conversions, spam leads, and offline sales unless proven otherwise.

## Conversion Architecture

- Primary conversions should represent business value, not every touch.
- Track raw lead actions, but optimize to qualified leads and converted/booked jobs as soon as enough data exists.
- Use separate conversion actions for:
  - Website form submit.
  - Phone call from ads.
  - Phone call from website.
  - LSA lead if applicable.
  - Qualified lead imported from CRM.
  - Converted/booked job imported from CRM.
  - Revenue or estimated value where available.
- Mark low-quality micro-actions as secondary, not primary, unless they are intentionally used for early learning.

## Enhanced Conversions And Offline Imports

- Enhanced conversions for leads help Google attribute offline conversions using first-party user-provided data such as email or phone.
- Google recommends enhanced conversions for leads as an upgraded approach for offline conversion import and says advertisers can use Data Manager, CRM integrations, Zapier, API, or imports depending on setup.
- For contractors, capture email and phone on lead forms whenever possible. Click-only call/email buttons provide weaker matching unless call tracking or other identifiers are captured.
- Import CRM lifecycle events quickly and consistently. Delayed or irregular uploads slow Smart Bidding learning.
- Do not backfill historical values when moving into value-based bidding unless Google guidance for the specific migration says otherwise.

## Call Tracking

- Use Google forwarding numbers for call assets/call ads when appropriate so calls can be tied to campaigns.
- Use website call tracking/DNI carefully. Preserve local SEO NAP consistency on crawlable content and swap numbers client-side only where appropriate.
- Define meaningful call conversions by duration, but audit call recordings or CRM outcomes because duration alone does not equal quality.
- For U.S./Canada and any two-party consent jurisdictions, review call recording settings and legal consent language before enabling or relying on AI/call recording features.

## Consent And Privacy

- Keep privacy policy language aligned with actual tracking: Google Ads conversion tracking, enhanced conversions, call tracking, CRM imports, analytics, and remarketing.
- Use Consent Mode where required by jurisdiction and consent setup.
- Never upload data the business is not permitted to use for ad measurement.
- Hashing does not remove the need for lawful collection, disclosure, and consent where required.

## Reporting Rhythm

- Daily during launch: spend, disapprovals, tracking fires, search terms, obvious junk, budget pacing.
- Weekly: lead quality by campaign/ad group/query, missed calls, qualified lead rate, booked jobs, negatives, location performance.
- Monthly: budget reallocation, landing page tests, offer tests, campaign structure, conversion goal quality, value/import health.

## Source Links

- Enhanced conversions for leads checklist: https://support.google.com/google-ads/answer/16782203
- Enhanced conversions/offline import upgrade guide: https://support.google.com/google-ads/answer/15479486
- Qualified leads and converted leads: https://support.google.com/google-ads/answer/11459091
- Offline conversion import FAQ: https://support.google.com/google-ads/answer/10029210
- Zapier offline conversion imports: https://support.google.com/google-ads/answer/9838158
- Call assets and call reporting: https://support.google.com/google-ads/answer/2453991
- Value-based bidding for Search: https://support.google.com/google-ads/answer/15099424

