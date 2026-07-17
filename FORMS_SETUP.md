# Form submissions on Vercel → SMTP

> ## ⚠️ Deliverability: why form emails were landing in spam
>
> Diagnosed 2026-07-15. There were two independent causes. **The code half is fixed. The DNS/mailbox half is not — it needs changes you must make in DNS and cPanel/Google Admin. Until step 9 is done, expect mail to keep landing in spam.**
>
> ### Fixed in `api/quote.js`
>
> | Problem | Why Gmail punished it |
> |---|---|
> | Message was addressed `To: forms@clinimedia.ca` (its own From:) with all three real recipients in **Bcc** | A message whose only real recipients are Bcc'd, addressed to its own sender, is the textbook shape of bulk/list mail. This was the single biggest signal. Real recipients now go in `To:`. |
> | **HTML-only** body, no text part | Standing SpamAssassin penalty (`MIME_HTML_ONLY`). Now sends `multipart/alternative` with a real text/plain part. |
> | `Message-ID` generated from the Vercel container hostname | Domain mismatch against `From:`. Now pinned to the From: domain. |
> | Envelope sender not pinned | SPF authenticates the **envelope** (Return-Path), not the `From:` header. Now pinned to the authenticated mailbox so SPF passes *and aligns* for DMARC. |
> | No `X-Entity-Ref-ID` | Gmail collapsed separate leads into one thread and clipped them. |
>
> ### NOT fixed — requires DNS + mailbox changes (step 9)
>
> 1. **Brand/domain mismatch.** Mail says `Seven Stones Landscape <forms@clinimedia.ca>`. The display name claims one company; the domain belongs to another. Gmail treats display-name/domain mismatch as an impersonation signal. **This is now the biggest remaining cause.**
> 2. **`sevenstoneslandscape.ca` has no DMARC record at all** (`_dmarc.sevenstoneslandscape.ca` → NXDOMAIN).
> 3. **`clinimedia.ca` DMARC is `p=none`** — monitoring only, so it earns no trust.
> 4. **Stale SPF.** `clinimedia.ca` publishes `ip4:69.90.221.129`, which is not the current mail host (`mail.clinimedia.ca` → `66.102.128.189`). Leftover from an old host.
> 5. **Shared reseller IP with generic PTR.** `66.102.128.189` reverses to `res-cp6.yyz2.websiteservername.com`, not `mail.clinimedia.ca`. Forward-confirmed reverse DNS fails, and you inherit the spam reputation of every other tenant on that box.
>
> **Recommended fix — send from the brand's own domain.** `sevenstoneslandscape.ca` already runs Google Workspace (`MX → smtp.google.com`, `SPF → include:_spf.google.com`). Sending `forms@sevenstoneslandscape.ca` → `info@sevenstoneslandscape.ca` is Google-to-Google *within the same domain*, which is about as deliverable as email gets, and it makes the From: domain match the brand. See **step 9**.

---

## Original setup notes (cPanel SMTP)

This site is deployed on **Vercel**. Form submissions are handled by a serverless function that sends one email to **both** team addresses using your **cPanel SMTP** settings. All form emails are sent **from forms@clinimedia.ca** so customers see one clear team address.

---

## 1. How it works

- Every form has **action="/api/quote"** and **method="POST"**.
- On submit, the browser sends the form to **`/api/quote`** (Vercel serverless function).
- The function checks hidden spam traps (**bot-field** and **website**), message spam patterns, and basic rate limits; suspicious submissions are silently dropped (no email sent).
- Otherwise it sends one email **from forms@clinimedia.ca** via your cPanel SMTP server to:
  - **info@sevenstoneslandscape.ca**
  - **ahmadhamadi2002@gmail.com**
- The user is redirected to **/contact/?submitted=1** and sees a thank-you message.

---

## 2. Get your cPanel SMTP details

In **cPanel** (for the account that hosts clinimedia.ca):

1. **Email Accounts** – Make sure **forms@clinimedia.ca** exists and note its password (or set one).
2. **Email Deliverability** or **Email Routing** – Find the **outgoing SMTP** settings. They’re often:
   - **Server:** `mail.clinimedia.ca` (or your server hostname, e.g. `box123.serversomething.com`)
   - **Port:** **465** (SSL, recommended) or **587** (TLS)
   - **Username:** `forms@clinimedia.ca` (full email)
   - **Password:** the password for forms@clinimedia.ca

If you’re not sure, check cPanel’s “Connect Devices” or “Configure SMTP” / “Manual Settings” for the exact host, port, and “secure” option.

---

## 3. Vercel environment variables

In **Vercel** → your project → **Settings** → **Environment Variables**, add:

| Name | Value | Environment |
|------|--------|-------------|
| **SMTP_HOST** | Your cPanel SMTP server (e.g. `mail.clinimedia.ca`) | Production (and Preview if you test there) |
| **SMTP_PORT** | `465` (SSL, recommended for cPanel) or `587` (TLS) | Production; default is 465 if omitted |
| **SMTP_USER** | `forms@clinimedia.ca` | Production |
| **SMTP_PASS** | Password for forms@clinimedia.ca | Production |

Optional:

| Name | Value |
|------|--------|
| **EMAIL_FROM** | Custom From line, e.g. `Seven Stones Landscape <forms@clinimedia.ca>`. If not set, the default is exactly that. |

---

## 4. Redeploy

After saving the env vars, **redeploy** the project (e.g. **Deployments** → … on latest → **Redeploy**) so the function gets the new SMTP config.

---

## 5. Verifying it’s connected

- On the **live** site, fill out any quote form and submit.
- You should:
  1. Be redirected to the contact page with a thank-you message.
  2. Receive the same email at **both** inboxes (info@sevenstoneslandscape.ca and ahmadhamadi2002@gmail.com), with the email **From: Seven Stones Landscape &lt;forms@clinimedia.ca&gt;** (or your custom **EMAIL_FROM**).

If the email doesn’t arrive, check **Vercel** → **Project** → **Logs** (or **Functions**) for SMTP errors. Common issues: wrong **SMTP_HOST** or **SMTP_PORT**, or cPanel only allowing SMTP from the server IP (in that case you may need to use a relay or “SMTP under SSL” from an allowed IP; Vercel’s IPs might need to be allowed in cPanel if your host restricts remote SMTP).

---

## 6. Form fields and “form_source”

All forms send: **full_name**, **email**, **phone**, **city**, **timeline**, **services**, **message**, and hidden **form_source** (hero, full, contact, hamilton, burlington, etc.). The email body includes “from [form_source]” so you can see which page was used.

---

## 7. Quick checklist

- [ ] **forms@clinimedia.ca** exists in cPanel and you know its password.
- [ ] cPanel SMTP host, port (465 or 587), and secure option noted.
- [ ] Vercel env vars **SMTP_HOST**, **SMTP_PORT**, **SMTP_USER**, **SMTP_PASS** set.
- [ ] **EMAIL_FROM** set (optional) if you want a different From line.
- [ ] Project redeployed.
- [ ] Test: submit the form; both inboxes receive the email **from forms@clinimedia.ca** and you see the thank-you page.

---

## 9. Fixing deliverability for real (do this — the code fix alone is not enough)

Goal: stop sending as `clinimedia.ca` and start sending as `sevenstoneslandscape.ca`, so the From: domain matches the brand and the mail is authenticated end to end.

### 9a. Create the sending mailbox in Google Workspace

1. **Google Admin** (admin.google.com) → **Directory** → **Users** → add user **`forms@sevenstoneslandscape.ca`**.
   - A full user works. A cheaper alternative is an alias on an existing user, but an alias cannot authenticate to SMTP — you need a real mailbox to send.
2. On that user, turn on **2-Step Verification**, then create an **App Password** (Google Account → Security → App passwords). This 16-character password is what goes in `SMTP_PASS`. A normal account password will not authenticate.

### 9b. Turn on DKIM for sevenstoneslandscape.ca

**`sevenstoneslandscape.ca` currently has no DKIM key published** (`google._domainkey.sevenstoneslandscape.ca` → NXDOMAIN). Without it, DMARC can only pass on SPF, which breaks on any forward.

1. **Google Admin** → **Apps** → **Google Workspace** → **Gmail** → **Authenticate email**.
2. Select `sevenstoneslandscape.ca`, choose **2048-bit**, click **Generate new record**.
3. Publish the TXT record it gives you at host **`google._domainkey`**.
4. Wait for propagation, then click **Start authentication** in Admin.

### 9c. Add DMARC for sevenstoneslandscape.ca

There is **no DMARC record at all** today. Add a TXT record:

| Host | Value |
|---|---|
| `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@sevenstoneslandscape.ca; adkim=s; aspf=s; pct=100` |

Start at `p=none` and read the aggregate reports for ~2 weeks. Once SPF+DKIM pass consistently, tighten to `p=quarantine`, then `p=reject`. **Do not jump straight to `p=reject`** — you will blackhole your own mail if anything is misaligned.

### 9d. Point Vercel at Google

**Vercel** → project → **Settings** → **Environment Variables** (Production):

| Name | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `forms@sevenstoneslandscape.ca` |
| `SMTP_PASS` | the 16-char **App Password** from 9a |
| `EMAIL_FROM` | `Seven Stones Landscape <forms@sevenstoneslandscape.ca>` |

`api/quote.js` already sets `requireTLS` on port 587 and pins the envelope sender to `SMTP_USER`, so SPF/DKIM/DMARC will all align once the DNS above is live. Then **redeploy**.

### 9e. Clean up clinimedia.ca (housekeeping, do regardless)

- Remove the stale `ip4:69.90.221.129` from the SPF record — it is not your mail host and every unnecessary mechanism costs you one of SPF's 10 DNS lookups.
- Raise DMARC off `p=none` once you have report data.

### 9f. Verify it actually worked

1. Send a test through the live form.
2. Open the received message in Gmail → **⋮** → **Show original**.
3. You must see **all three**:
   ```
   SPF:   PASS with domain sevenstoneslandscape.ca
   DKIM:  PASS with domain sevenstoneslandscape.ca
   DMARC: PASS
   ```
   If DKIM says `neutral` or is absent, 9b has not propagated yet.
4. Also send one test to **mail-tester.com** and confirm the score is **9/10 or better**.
5. Have anyone who previously found these in spam click **Report not spam** and add `forms@sevenstoneslandscape.ca` to their contacts. Reputation is per-recipient and sticky — the existing spam history against `forms@clinimedia.ca` is part of why this kept happening, and moving domains resets it.
