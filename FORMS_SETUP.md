# Website quote forms and Vercel intake

Last checked: 2026-11-15. This is an operational note for the public `SevenStonesLandscape` repository. Do not store credentials or customer submissions here. Production remains on `main`; the optional SMS-consent change is Preview-only until owner/legal approval and end-to-end verification.

## Current state

- Project: `seven-stones-landscape`, connected to `AhmadHamadi/SevenStonesLandscape`; `main` is the Vercel Production branch.
- Production remains on `main` commit `7a34658`.
- The reviewed intake code is on `codex/sevenstones-ghl-intake-preview` at `de7ad4c`. The Preview built successfully and the home page/forms were inspected without submission.
- `RESEND_API_KEY` and `GHL_INBOUND_WEBHOOK_URL` are Vercel Production Secrets. Their values were not read. Preview has no copies of those secrets, by design.
- The website project and domains are connected and valid. No Git reconnect or domain reset is needed.

## Form contract

All quote forms POST URL-encoded form data to `/api/quote`. The server expects:

- `full_name`, `email`, `phone`, and `address`
- `services` or `project_type`, depending on the form
- original `message`, `form_source`, and a stable `submission_id`
- optional `sms_consent=yes` when the visitor deliberately checks the unchecked-by-default estimate/scheduling SMS box
- honeypots `bot-field` and `website`

The server validates required fields, normalizes Canadian phone numbers, limits field lengths, rate-limits by IP, and applies honeypot/spam filters. The frontend must not claim a successful submission until the server responds successfully.

## What the server does

On the Preview branch, `/api/quote`:

1. Posts the original inquiry and per-submission consent evidence to the server-side `GHL_INBOUND_WEBHOOK_URL`.
2. Sends the internal notification through Resend, with SMTP as a configured fallback.

When checked, the webhook payload includes `sms_consent_this_submission`, the exact text shown, a wording version, server timestamp, and form source. When unchecked, it records `false` and leaves the evidence fields blank. This is per-enquiry evidence; do not map it to overwrite a contact's global DND or prior consent state. The workflow still needs matching custom-field mapping and readback before this data is considered stored in GHL.
3. Returns success only when both systems confirm receipt. If GHL fails but email succeeds, it returns `503` and tells the visitor to contact the team before resubmitting.

The `submission_id` and `Idempotency-Key` are correlation aids. The GHL Find Opportunity → Create Opportunity sequence is not an atomic lock, so it does not prove concurrent duplicate protection. The handler also does not have a durable outbox for recovery after provider failures. When all email transports fail, the current last-resort path writes submission details to Vercel logs; this is not a durable or privacy-minimized recovery system and is tracked for follow-up.

## Safe validation

Run locally from this project:

```sh
npm test
node --check api/quote.js
```

The test suite uses stubs for Resend and GHL. It checks form contracts, routing, all known form-source values, the explicit-send guard, the optional SMS-consent payload for checked/unchecked submissions, all 34 quote-form pages loading the shared consent script, and the GHL failure response. It does not send email, call a real webhook, create CRM records, or prove live delivery.

For Preview QA, open the pages and inspect the form structure; do not submit a real customer form. Do not add Production credentials to Preview. The GHL inbound webhook trigger is marked premium in the current account UI and may charge per execution; do not run a live test without an isolated destination and explicit cost approval.

## Production release gate

Do not merge or promote until the following are verified in an isolated, approved test setup:

- Owner and qualified reviewer approve the separate, optional SMS wording and updated Privacy/Terms copy; it remains unchecked and is not required for a quote.
- The Draft workflow maps the five per-submission consent fields to project-level fields and readback proves them without changing contact DND/previous consent.
- One synthetic submission creates/matches the right contact and one linked opportunity with all original fields.
- A sequential retry with the same submission ID does not create a second opportunity or duplicate team email.
- Provider failures have a documented, durable recovery path; no concurrent-duplicate guarantee is made without a passing concurrency test.
- Resend and GHL success are confirmed separately, and the approved sender is verified.
- The client-owned calendar, channel, AI usage stop, and customer-message controls are verified in HighLevel.

The current Production deployment does not contain the Preview intake commit. Do not change Production environment variables, submit a live form, publish the client workflow, or enable AI as part of Preview testing.
