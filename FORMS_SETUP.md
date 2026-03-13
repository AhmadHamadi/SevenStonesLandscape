# Form submissions on Vercel → cPanel SMTP (forms@clinimedia.ca)

This site is deployed on **Vercel**. Form submissions are handled by a serverless function that sends one email to **both** team addresses using your **cPanel SMTP** settings. All form emails are sent **from forms@clinimedia.ca** so customers see one clear team address.

---

## 1. How it works

- Every form has **action="/api/quote"** and **method="POST"**.
- On submit, the browser sends the form to **`/api/quote`** (Vercel serverless function).
- The function checks the **bot-field** (honeypot); if it’s filled, it treats the submission as spam and doesn’t email.
- Otherwise it sends one email **from forms@clinimedia.ca** via your cPanel SMTP server to:
  - **john.scime.mcmaster@gmail.com**
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
  2. Receive the same email at **both** inboxes (john.scime.mcmaster@gmail.com and ahmadhamadi2002@gmail.com), with the email **From: Seven Stones Landscape &lt;forms@clinimedia.ca&gt;** (or your custom **EMAIL_FROM**).

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
