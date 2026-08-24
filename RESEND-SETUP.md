# Resend — Seven Stones form email

Everything about how this site sends email. Last verified **2026-08-24**.

## Where the key lives

**`RESEND-API-KEY.txt`** in the project root. Plain text, gitignored, never committed.
Key name in the Resend dashboard: **SEVEN STONES** (full access).

Vercel cannot read that file. For the live site the same key must also be set as an
environment variable — see *Going live* below.

## Commands

```
node scripts/resend-test.mjs domains        # domains + verification state
node scripts/resend-test.mjs ping           # one plain deliverability probe
node scripts/resend-test.mjs quote          # one realistic lead, real template
node scripts/resend-test.mjs all [filter]   # one email per subject variant
node scripts/resend-test.mjs status <id>    # delivery state of a sent email

node scripts/resend-verify-all.mjs          # offline: all 34 form sources, sends nothing
```

`resend-verify-all.mjs` stubs `fetch`, so it exercises the real handler without sending
anything. Run it after any change to `api/quote.js`. It must print **34/34**.

## How sending works

`api/quote.js` is the only email path on the site. All 34 forms POST to `/api/quote`.

Transport is chosen at runtime:

| Condition | Transport |
|---|---|
| `RESEND_API_KEY` set | **Resend** (preferred) |
| otherwise, `SMTP_*` set | nodemailer / cPanel SMTP (legacy fallback) |
| neither | 500, logged |

Both transports build the **same** subject, HTML and text from the same three functions,
so a lead looks identical either way. Resend is preferred because it signs DKIM itself
from a verified domain, which is the actual fix for the spam problem in `FORMS_SETUP.md`.

Recipients (`RECIPIENTS` in `api/quote.js`): `info@sevenstoneslandscape.ca`,
`ahmadhamadi2002@gmail.com`. Both go in `To:`, never Bcc. `Reply-To` is the customer.

## Subject lines

`buildSubject()` tags by `form_source`:

| Source | Subject |
|---|---|
| `ads-concrete-landing` | `[Concrete LP] Quote request from NAME` |
| `ads-interlock-landing` | `[Interlock LP] Quote request from NAME` |
| `service-hero-*` (20 pages) | `[Service: retaining walls] Quote request from NAME` |
| `hero` | `[Homepage] Quote request from NAME` |
| `contact` | `[Contact page] Quote request from NAME` |
| city pages + `full` (12) | `Quote request from NAME` (no tag) |

> **Fixed 2026-08-24.** `service-hero-*` was previously tested *after* the bare `hero`
> check. Every service-page source contains the substring `hero`, so all 20 service pages
> were mislabeled `[Homepage]` and the `[Service: ...]` branch never ran. The service test
> now runs first. Historical service leads in the inbox carry the wrong `[Homepage]` tag.

## Limits — do not abuse

Confirmed from live API response headers:

- **Rate limit: 10 requests/second.** Header `ratelimit-policy: 10;w=1`. Exceeding it
  returns 429. The batch loop in `resend-test.mjs` sleeps 600 ms between sends, well under.

Plan quotas are **not exposed by the API** — confirm the current plan at
resend.com/settings/billing. Resend's free tier is 3,000 emails/month / 100 per day;
paid tiers start at 50,000/month.

Real volume for this site is far below any tier: one email per genuine lead, and the
handler already drops bots, spam and B2B solicitation before sending. Additional limits
that already protect the quota:

- **Rate limiting per IP:** 12 submissions per 10 minutes (`RATE_MAX_REQUESTS`).
- **Honeypots:** `bot-field` and `website` — filled means silent drop, no send.
- **Solicitation filter:** SEO/web-design pitches dropped before sending.

**Keep test volume low.** `resend-test.mjs all` sends 7 emails per run. Use
`resend-verify-all.mjs` (sends nothing) for routine checking, and reserve real sends for
confirming inbox placement.

## Account state (2026-08-24)

| Domain | Status |
|---|---|
| `tradeleadsmarketing.com` | **verified, sending enabled — this is the live sender** |
| `sevenstoneslandscape.ca` | added but `not_started`; unused for now, DNS never published |

Sending identity is **`Seven Stones Landscape <info@tradeleadsmarketing.com>`**, set as
`DEFAULT_RESEND_FROM` in `api/quote.js`. All test sends so far: `delivered`, zero bounces,
zero complaints.

The `From` default is deliberately **transport-aware**:

| Transport | Default From | Why |
|---|---|---|
| Resend | `info@tradeleadsmarketing.com` | the only verified domain; anything else 400s |
| SMTP fallback | `forms@clinimedia.ca` | the mailbox SMTP authenticates against |

`EMAIL_FROM` overrides either. This means setting **`RESEND_API_KEY` alone is safe** — no
second variable is required for the forms to work.

## Going live

Set one environment variable in Vercel → project → Settings → Environment Variables
(Production):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the key from `RESEND-API-KEY.txt` |

Redeploy. The handler switches to Resend automatically; the existing `SMTP_*` variables can
stay untouched as a fallback. Do **not** set `EMAIL_FROM` unless you intend to override the
sender — if you do, it must be on a Resend-verified domain.

### Verify after deploying

1. Submit a real form on the live site.
2. Confirm it arrives at `info@sevenstoneslandscape.ca` and `ahmadhamadi2002@gmail.com`.
3. Gmail → **Show original** → SPF, DKIM and DMARC should read **PASS**
   (Resend signs DKIM for `tradeleadsmarketing.com` automatically).
4. Check the subject carries the right tag for the page you submitted from.

### Optional, later

To send as the brand domain instead, verify `sevenstoneslandscape.ca` in Resend (it is
already added — publish the TXT `resend._domainkey`, MX `send`, and TXT `send` records shown
in the dashboard), then set `EMAIL_FROM` to `Seven Stones Landscape
<forms@sevenstoneslandscape.ca>`. Nothing else changes.
