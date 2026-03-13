# Form submissions on Vercel → both emails

This site is deployed on **Vercel**. Form submissions are handled by a serverless function that sends one email to **both** addresses using **Resend**. No Netlify or Make.com needed.

---

## 1. How it works

- Every form has **action="/api/quote"** and **method="POST"**.
- On submit, the browser sends the form to **`/api/quote`** (Vercel serverless function).
- The function checks the **bot-field** (honeypot); if it’s filled, it treats the submission as spam and doesn’t email.
- Otherwise it sends one email via **Resend** to:
  - **john.scime.mcmaster@gmail.com**
  - **ahmadhamadi2002@gmail.com**
- The user is redirected to **/contact.html?submitted=1** and sees a thank-you message.

---

## 2. What you need to do (one-time)

### 1) Resend account and API key

1. Sign up at [resend.com](https://resend.com) (free tier is enough).
2. In the Resend dashboard, create an **API Key** and copy it (starts with `re_`).
3. (Optional) Add and verify a domain so the “From” address is e.g. `quotes@sevenstoneslandscape.ca`. Until then, emails are sent from Resend’s default (e.g. `onboarding@resend.dev`).

### 2) Vercel environment variables

1. In **Vercel**: your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `RESEND_API_KEY`  
     **Value:** your Resend API key (e.g. `re_xxxxxxxx`).  
     **Environment:** Production (and Preview if you want to test there).
3. (Optional) If you verified a domain in Resend and want a custom “From”:
   - **Name:** `EMAIL_FROM`  
     **Value:** `Seven Stones Landscape <quotes@yourdomain.com>`  
     (Replace with your real domain.)

### 3) Redeploy

After saving the env vars, trigger a new deploy (e.g. **Deployments** → … on latest → **Redeploy**) so the function gets the new variables.

---

## 3. Verifying it’s connected

- **Right project:** In Vercel you should be in the project that deploys this repo (same Git repo or same “Import”).
- **API route:** After deploy, the route **`/api/quote`** is available at your Vercel URL (e.g. `https://yoursite.vercel.app/api/quote`).
- **Test:** On the **live** site, fill out any quote form and submit. You should:
  1. Be redirected to the contact page with a thank-you message.
  2. Receive the same email at **both** inboxes (check spam the first time).

If the email doesn’t arrive, check **Vercel** → **Project** → **Logs** (or **Functions**) for errors, and confirm **RESEND_API_KEY** is set and redeployed.

---

## 4. Form fields and “form_source”

All forms send the same fields: **first_name**, **last_name**, **email**, **phone**, **city**, **timeline**, **services**, **message**, and a hidden **form_source** so you can see where the submission came from:

| form_source   | Page / form              |
|---------------|--------------------------|
| hero          | Home hero form           |
| full          | Home full quote section  |
| contact       | Contact page             |
| hamilton      | Hamilton service area    |
| burlington    | Burlington service area  |
| oakville      | Oakville service area    |
| ancaster      | Ancaster service area    |
| dundas        | Dundas service area      |
| waterdown     | Waterdown service area   |
| stoney-creek  | Stoney Creek service area|
| milton        | Milton service area      |
| mississauga   | Mississauga service area |

The email body includes “from [form_source]” so you can tell which page was used.

---

## 5. Code audit (Vercel + form logic)

Verified so you can be sure every line is correct:

- **api/quote.js**
  - Only **POST** is accepted; other methods get 405 with `Allow: POST`.
  - **req.body** is normalized: if Vercel passes an object (normal case), it’s used; if body is a string (e.g. raw), it’s parsed with `URLSearchParams` so form data is never lost.
  - **Honeypot:** if `bot-field` has any non-empty value, the request is treated as spam: **no email** is sent, and the user is still **302 redirected** to `/contact.html?submitted=1` (so bots don’t see a different response).
  - **RESEND_API_KEY** is checked before doing anything; if missing, the function returns 500 and does not redirect.
  - **Subject:** uses “Quote request from [first last]” when name is present, otherwise “New quote request”.
  - **reply_to** is set only when the submitter’s email is non-empty (trimmed), so Resend never gets an invalid reply_to.
  - **One response only:** every path does exactly one of: `res.redirect(302, ...)`, `res.status(405).json(...)`, or `res.status(500).json(...)` with an explicit `return`, so the response is never sent twice.
- **Forms (all pages)**
  - Every form uses **action="/api/quote"**, **method="POST"**, hidden **form_source**, and honeypot **bot-field**; no Netlify-specific attributes.
- **Thank-you**
  - Success and spam both redirect to **/contact.html?submitted=1**. The contact page has **#form-thank-you**; **main.js**’s `showFormThankYou()` runs on load (in all injectAndInit paths) and shows that block when `?submitted` is in the URL, so the user always sees the thank-you message after a valid or spam submit.

---

## 6. Quick checklist

- [ ] Resend account created; API key copied.
- [ ] Vercel env var **RESEND_API_KEY** set (and **EMAIL_FROM** if you use a custom domain).
- [ ] Project redeployed after adding env vars.
- [ ] Test: submit the form on the live site; both inboxes receive the email and you see the thank-you page.
