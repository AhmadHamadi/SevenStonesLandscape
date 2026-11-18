# Website quote intake and reusable GHL baseline

This is the source-of-truth checklist for Seven Stones Landscape's website intake and a reusable baseline for future Arveno client sub-accounts. Account IDs, webhook URLs, credentials, calendar IDs, and client-specific details must always be re-verified for each client; never copy those values from this document.

## Seven Stones website flow

- All 35 quote and SMS preference forms use the shared `js/main.js` script and POST to `/api/quote`.
- Quote form fields include `full_name`, `email`, `phone`, `address`, `services`, `message`, `form_source`, and a stable `submission_id`.
- Quote forms disclose beside the submit button that submitting agrees to service-related texts about that quote and scheduling. This is limited to the request, estimate, and arranging an in-person estimate; it is not promotional consent. The separate `/sms-opt-in/` page retains optional, unchecked service and marketing choices.
- The server forwards per-submission consent text, version, timestamp, source, and service/marketing flags to GHL. GHL custom-field mapping and readback are still required before calling that evidence stored or using it to gate an outbound AI step.
- Every quote form receives an invisible honeypot (static or injected by the shared script). The server drops filled honeypots and also validates fields, rate-limits requests, and filters common spam/solicitations. This reduces bot submissions but is not a CAPTCHA or a guarantee that every bot is blocked.
- The website sends internal quote notification email through Resend when configured, from `Seven Stones Landscape <info@arvenogrowth.com>`. The subject includes the source page and submitter name. The current internal recipients are configured in `api/quote.js`.
- The success page/state is shown only after the server accepts both GHL and the configured email transport. HTTP success confirms provider acceptance, not inbox placement or human review.

## Current Seven Stones GHL state (checked 2026-11-17)

- Location: Seven Stones Landscape, Mount Hope, Ontario. Reconfirm location before every edit or test.
- Workflow list: `Website Form Intake - Contact + Opportunity` is Published, with 2 total enrollments and 0 active at time checked.
- Its visible flow creates/matches a contact, finds an opportunity by submission reference, and creates an opportunity only when the match is not found. The create action targets the `Service Projects` pipeline and `Contacting` stage.
- The flow does **not** start Conversation AI, book appointments, or create a follow-up task/notification. Do not tell the business these actions are automated yet.
- Recommended simple pipeline for the demo and future home-service accounts: `Contacting` → `Estimate Booked` or `AI Follow-Up` → `Manual Follow-Up` → `Quote Sent` → `Job Won` → `Job Completed`; use `Job Lost` as the closed-lost outcome. Preserve the existing project pipeline and adjust stage labels only after checking current opportunities and their stage dependencies.
- Recommended automation: on a consented new quote, assign the salesperson and let AI offer an in-person property estimate slot; a booking moves to `Estimate Booked`. If no booking, wait one day and send one service-related AI follow-up; if still no reply or booking after another day, move to `Manual Follow-Up`, create an assigned task named `Call lead to arrange on-site estimate` due next business day, and notify the salesperson. The salesperson makes the call and moves the opportunity to the correct next stage. When work is manually marked `Job Completed`, send a neutral Google review request to every completed customer without filtering by satisfaction.
- The AI dashboard showed no conversations or appointment bookings for the selected range. The old Conversation AI agent was previously observed Off. A live form should not be described as triggering an AI booking attempt until the published workflow includes a consent-gated Conversation AI step and a successful controlled test.
- Calendar settings showed one active calendar named `ggh`; the appointment list showed no upcoming appointments. Its public booking link, meeting type/location, working hours, owner availability, and Google Calendar conflict sync were not verified. For this contractor, the target booking is an **in-person estimate visit at the homeowner's property**, not an office consultation. Confirm calendar name, duration, visit-address handling, service area, timezone, availability, and sync before connecting the AI.
- No manual follow-up task is currently created by the intake flow. Until AI booking and a no-booking fallback are implemented and tested, the owner must check new opportunities and contact the lead manually.

## Reusable setup for future sub-accounts

Use this short baseline, then customize only documented client details:

1. Verify the exact client sub-account, timezone, owner/staff, contact channels, pipeline, calendars, active workflows, sender, AI plan/usage controls, and billing responsibility. Never infer account identity from a browser tab or reuse another client's secrets or IDs.
2. Keep one website intake endpoint and one inbound-webhook workflow. Do not run a second website-side CRM creation path or overlapping opportunity trigger.
3. Keep contact identity on the contact. Keep each distinct project on its own opportunity, including service, property/site address, original scope/message, source page, and submission reference. Match retries by that reference; do not select a contact's latest opportunity or overwrite a prior project.
4. Use the client's real booking outcome. For in-person home-service estimates, collect/confirm the property address and book the estimate visit in the correct calendar, owner, timezone, and availability. Do not use a generic meeting calendar or treat a phone call as a site visit.
5. After contact/opportunity creation, start Conversation AI only for submissions with the agreed, recorded service-text consent. The agent should answer only about the inquiry, gather missing project details, and offer available estimate-visit slots. Keep promotional messaging separate and optional.
6. Add the fallback branch: if no appointment is booked after the chosen AI attempt and one follow-up, move the opportunity to `Manual Follow-Up`, create a clearly named call task for the assigned salesperson with a due date and in-app notification, and stop further AI messages. If an appointment is booked, move it to `Estimate Booked` and route to visit confirmation/reminders instead. Test both branches before publish.
7. Keep external messaging off during test submissions. Use a controlled test contact and confirm each link in `submissionId → contactId → opportunityId → appointmentId`, then test no-booking fallback, duplicate submission, reschedule, cancellation, STOP/DND, and provider failure.
8. Publish only after field mapping/readback, assignment, calendar details, consent gates, duplicate handling, owner notifications, pricing/usage, and recovery behavior are verified. Record the exact test result and remaining owner actions for each sub-account.

## Current release and limitations

The quote-intake code is being updated in this branch to replace the quote-form SMS checkbox with a clear affirmative disclosure beside the submit action and to ensure all quote forms have a honeypot. Promotional consent remains separate and unchecked. The live GHL workflow remains limited to contact/opportunity handling; no claim of automatic SMS, AI booking, or a task fallback is valid until those GHL steps are configured, consent is mapped/read back, and the booking/no-booking paths pass controlled tests.
