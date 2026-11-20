# Seven Stones lead system and reusable GHL baseline

Checked 2026-11-20. This file is the operating checklist for the Seven Stones website → HighLevel flow and the reusable base for future Arveno client locations. It distinguishes verified settings from the setup still needed before a production snapshot. Never copy a client's webhook, field IDs, calendar connection, sender, OAuth, contacts, or private conversation data into another account.

## Target operating model (not all live yet)

| Opportunity stage | What it means | Automation | Owner action |
| --- | --- | --- | --- |
| Contacting | New quote request received; awaiting estimate booking | Create/update contact; create one project per unique submission; send one approved, consent-gated first reply | Review new lead if no booking starts |
| Follow-up Needed | Customer has not booked or needs a person | One bounded service follow-up, then create a call task and notify assigned salesperson | Call the customer; record outcome |
| Appointment Booked | On-site estimate visit is confirmed | Move the matching project; send appointment confirmation/reminders | Attend the visit |
| No-show / Reschedule | Visit missed or needs a new time | Stop lead nurture; offer rescheduling only if configured | Contact customer if rescheduling stalls |
| Quote Sent | Estimate has been sent | Start a short, capped quote follow-up only where consent and timing allow | Send/adjust quote; log important context |
| Accepted | Quote approved; job won | Stop lead nurture; create an internal handoff/task if configured | Schedule crew and do the work |
| Completed | Job finished | Send one neutral review request if configured | Close out job |
| Lost | Customer declined, was not serviceable, or chose someone else | Stop all sales follow-up | Record a simple loss reason |

Keep stages few and unambiguous. The current Seven Stones pipeline is `Contacting` → `Follow-up Needed` → `Appointment Booked` → `No-show / Reschedule` → `Quote Sent` → `Accepted` → `Completed`; it has no explicit Lost stage. Do not rename or migrate live stages until the existing opportunities and workflow references have been checked. `Accepted` currently serves as the won outcome.

## What is verified in Seven Stones (2026-11-20)

- The website has 35 quote/SMS preference forms using shared `js/main.js` and `POST /api/quote`. The endpoint validates fields, preserves a submission ID, uses a hidden honeypot, rate-limits and filters common junk. This reduces spam; it does not guarantee bots cannot submit.
- The server sends the form facts and allowlisted UTM/ad click IDs to the GHL inbound webhook and internal email. Email is configured to use `Seven Stones Landscape <info@arvenogrowth.com>` when the production Resend transport is configured; subject includes the source page and submitter. A provider-accepted email does not prove inbox delivery.
- The current intake workflow is set to Publish. It maps contact name/email/phone/source and address, finds an opportunity by exact `Submission Reference = submissionId`, ends safely when it already exists, and otherwise creates an opportunity in `Service Projects` → `Contacting` with name, property address, service, original message, and submission reference. This supports sequential retry handling; search-then-create is not atomic, so concurrent duplicate deliveries have not been proven safe.
- Contact source is hardcoded to `Seven Stones Website`. The web payload includes UTMs and click IDs, but those campaign values are not mapped into GHL opportunity fields. Google Ads/source reporting in GHL is therefore not verified.
- The website currently sends `sms_transactional_consent=yes` for every quote submission because it uses an inline disclosure beside the submit action. The workflow sends its first estimate SMS only when the field is `True`. Do not treat this implicit field as proof of compliant optional consent or enable blanket texting. HighLevel A2P review guidance expects explicit optional SMS consent; resolve the form choice and verify stored consent before enabling broad sends.
- `Seven Stones Estimate Assistant` is deployed for inbound SMS to all contacts and has appointment booking and human handover actions. This means it can reply to inbound messages; it does not by itself start the first outbound text. The intake workflow's separate SMS action starts that conversation when its consent condition passes. AI auto-follow-up scenarios were Off at last inspection; the test chat says its messages are not sent to contacts; email AI is not configured.
- The appointment-confirmed workflow is published and first finds an open `Service Projects` opportunity in `Contacting`, then moves the found opportunity to `Appointment Booked`. It chooses the most recently created match in that stage, so a returning contact with multiple open projects could still attach the booking to the wrong project. Store and use an exact opportunity/project reference before claiming this edge case is solved. No recent workflow execution was observed.
- The user's Google Calendar account is connected in HighLevel. This does not verify the bookable calendar, public booking link, visit duration, owner hours, timezone, service-area rules, property-address handling, reminders, or conflict checking. Seven Stones needs an in-person estimate at the customer's property.
- No verified one-day AI follow-up → manual-call task path, owner SMS alert for every lifecycle event, quote-sent nurture, completion/review workflow, or GHL campaign attribution was observed. The owner must monitor opportunities and call leads who do not book until those flows are built and tested. Website email notifications are not AI email replies.
- Published status is not proof of a live website submission. No recent intake execution was visible. End-to-end proof still requires an owner-controlled test contact and number, followed through `submissionId → contactId → opportunityId → appointmentId`.

## Automation rules

Automate predictable work: capture the form once; preserve project facts; assign the lead; send one approved first response; offer only real calendar availability; move the exact project on confirmed booking; send bounded reminders; create a clearly named call task when the AI cannot book; stop on opt-out, human takeover, booking, or closed status; and send one neutral review request after work is genuinely complete.

Keep judgment with the contractor: decide whether the job is in the service area, inspect the property, prepare/send the quote, call a stalled lead, decide won/lost, schedule crews, perform work, and resolve complaints. AI must not invent prices, project scope, service coverage, availability, or completion status. The original form message stays intact; any AI qualification summary belongs in a separate field.

For each distinct project use its own opportunity. Never use “latest opportunity” as the project identity. A booking must preserve the relationship to the correct project through booking, reschedule, and cancellation. Use one first-message path and one follow-up owner to avoid duplicate texts. Quote follow-up is triggered by the `Quote Sent` stage, not by lead creation; stop when accepted/lost or opted out.

## Reusable onboarding: keep it to one page per client

Reuse the structure; replace these client-specific values every time:

1. **Business:** legal/brand name, services, service area, estimate type, hours, timezone, support email/phone, privacy/terms URLs.
2. **People:** owner and sales rep, assignment rule, notification target, task owner, access roles.
3. **Pipeline:** stage labels/IDs, won and lost outcomes, required custom fields and field IDs.
4. **Website intake:** endpoint, one webhook, form fields, exact source page, submission ID, UTM/click-ID fields, spam controls, email sender/recipient/subject.
5. **Messaging:** sender/channel, consent language/version and stored evidence, stop/help behavior, allowed message types, business-hour window, usage payer and budget.
6. **Calendar/AI:** actual calendar and booking link, owner, availability/buffers, on-site address handling, AI knowledge/fallback, human handoff, booking-to-opportunity reference.
7. **Release:** test contact/number, duplicate submission, new project for returning contact, consent absent/present, opt-out, booking, no booking/manual task, quote won/lost, completion, provider failure, exact pass/fail evidence.

Load a snapshot as configuration only. Reconnect user-owned Google/Outlook calendars, phone/SMS registration, email provider, domains, sender IDs, AI billing and other OAuth services per client. Inspect every workflow trigger, filter, action, branch, assignment, sender, and publish switch after import. Remove sample records. Use a test contact and keep outbound messaging disabled until the client authorizes the test destination and the consent path is verified.

## Readiness gate and current blockers

Do not call this a production-ready, transferable snapshot until all these pass in the Seven Stones location:

- Change SMS capture from an automatically true quote-submit flag to the client-approved, explicitly optional consent model; read back the consent evidence in GHL before any outbound send.
- Map website page/source, UTMs and ad click IDs to defined GHL fields and verify a website lead and a tagged test Google Ads lead.
- Configure exact opportunity context on appointment creation so multiple projects for one contact cannot be confused.
- Confirm the real on-site estimate calendar, user, link, hours, visit address, timezone, availability and conflict checking.
- Build the single first-reply path, one-day bounded follow-up, manual-call task/notification, booked branch, quote-sent follow-up, won/lost stop logic, and completed-job review request. Validate STOP/DND and human takeover at every messaging branch.
- Run controlled end-to-end tests and inspect provider logs plus CRM record IDs. Verify email and GHL outcomes independently, failure behavior, duplicate sequential and concurrent deliveries, and the actual inbound AI reply.
- Record SMS/AI/workflow costs and who pays. Phone/SMS, HighLevel subscription, AI usage, email, and any premium workflow execution fees may be separate; verify current account billing rather than assuming they are included.

Until these checks pass, the reliable demo claim is limited to: **the website captures a quote and sends it to the configured GHL/email providers; GHL is designed to create/update the contact and create a project opportunity.** Automatic customer texting, AI booking for every lead, owner SMS alerts, true Google Ads attribution, and a transferable production snapshot remain unproven or blocked above.
