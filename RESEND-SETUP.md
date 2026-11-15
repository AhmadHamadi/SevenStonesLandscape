# Resend setup for the quote form

Last checked: 2026-11-15. This repository is public. Never put an API key, webhook URL, `.env` file, or client submission data in Git.

## Current deployment state

- Vercel project: `seven-stones-landscape`; Git repository: `AhmadHamadi/SevenStonesLandscape`; Production branch: `main`.
- Production is still on commit `7a34658`. Quote-intake changes are on `codex/sevenstones-ghl-intake-preview` at `de7ad4c`; do not assume the Preview sender or webhook code is live in Production.
- Vercel has a Secret `RESEND_API_KEY` in Production scope. Its value was not read. Production `GHL_INBOUND_WEBHOOK_URL` is also a Secret; its value was not read.
- Preview intentionally has no Production email or GHL secrets. Do not copy production credentials into Preview just to test the form.
- At the last account check, `arvenogrowth.com` was verified for sending. The Preview code uses `Arveno Growth Website <website@arvenogrowth.com>` by default. This does not verify the sender configured in the older Production commit.

## How the handler chooses a transport

`api/quote.js` is the source of truth:

1. If `RESEND_API_KEY` is present, send through Resend.
2. If `SMTP_HOST` is also configured, SMTP is the fallback if Resend fails.
3. `EMAIL_FROM` overrides the sender; only use a sender address on a domain verified for that transport.
4. The handler sends an internal notification to the recipients in `api/quote.js`; the customer's address is used for `Reply-To`.

Do not rely on the legacy SMTP fallback until its mailbox, sender domain, and environment variables are verified. Keep all credentials server-side in Vercel or a local ignored environment file.

## Safe checks

- `npm test` and `node scripts/resend-verify-all.mjs` stub network calls. They exercise the handler and all listed form sources without sending email or calling GHL.
- `node scripts/resend-test.mjs domains` and `node scripts/resend-test.mjs status <email-id>` are read-only API calls and require `RESEND_API_KEY` in the environment.
- `ping`, `quote`, and `all` are real email sends. They now require `--send`, plus `RESEND_TEST_TO` (a controlled test inbox) and `RESEND_TEST_FROM` (a verified sender). Do not run them during routine QA or against customer addresses.

Example of an explicitly approved test send (do not paste credentials into the command or source):

```sh
RESEND_API_KEY="$RESEND_API_KEY" \
RESEND_TEST_TO="<controlled test inbox>" \
RESEND_TEST_FROM="<verified sender>" \
node scripts/resend-test.mjs ping --send
```

Use shell-managed environment values; never commit them. The command intentionally sends a real email.

## Release gate

A Ready Vercel deployment proves that the build completed. It does not prove email delivery or GHL intake. Before Production is updated, use an isolated approved test path, read back the CRM record chain, verify email and GHL independently, and confirm the sender and recovery behavior. The client workflow's inbound webhook trigger may incur per-execution charges; confirm the test destination and cost first. No live website form has been submitted as part of this review.
