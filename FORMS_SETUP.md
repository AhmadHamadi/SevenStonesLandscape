# Form submissions → both emails (automatic)

This site uses **Netlify Forms**. All forms use the same form name **`quote`**. When someone fills the form and clicks send, you can have **both** email addresses get the submission automatically — no manual forwarding, no Make.com required (unless you want it).

---

## 1. Bot prevention (already done)

- Every form has a **honeypot** field: `name="bot-field"` in a hidden paragraph with class `form-honeypot`.
- Netlify ignores submissions where the honeypot is filled (treated as spam).
- CSS in `css/styles.css` hides the honeypot off-screen so bots that fill all fields still hit it.

---

## 2. Single form: `quote`

There is **only one Netlify form** on the site: **`quote`**. A hidden field **`form_source`** indicates where the submission came from (hero, full, contact, hamilton, burlington, oakville, ancaster, dundas, waterdown, stoney-creek, milton, mississauga).

**Fields on every submission:** `first_name`, `last_name`, `email`, `phone`, `city`, `timeline`, `services`, `message`, `form_source`.

---

## 3. How to know Netlify is connected to this website

- **Right site:** In Netlify, the site you’re logged into should be the one that **deploys this project** (same Git repo — e.g. GitHub/GitLab/Bitbucket — or the same “Deploy manually” build). The site name and URL (e.g. `yoursite.netlify.app` or your custom domain) are what you use for this website.
- **Forms tab:** After the site has been deployed at least once, go to **Site dashboard → Forms**. You should see a form named **`quote`**. If you see it, Netlify has detected the form on this site and will receive submissions.
- **Test:** On the **live** site (the Netlify URL or your domain), fill out any quote form and click send. Then in Netlify go to **Forms → quote → Submissions**. If the test submission appears there, the site and form are connected. If you’ve already set up email notifications, both inboxes should also receive the notification for that test.

If you don’t see a form named `quote` under Forms, make sure the latest code (with `data-netlify="true"` and `name="quote"` on the form) has been deployed, then trigger a new deploy and check again.

---

## 4. Option A — Netlify only (no Make): both emails automatically

**Easiest:** Use Netlify’s built-in email notifications so both inboxes get every submission. No webhooks, no Make, no code.

1. In **Netlify**: open your site → **Site configuration** → **Notifications** (or **Integrations**).
2. Under **Form submission notifications**, click **Add notification** (or **New notification**).
3. Choose **Email notification**.
4. Select the form **`quote`** (or “Notify for all form submissions” if that’s the only form).
5. Enter the first email: **john.scime.mcmaster@gmail.com**.
6. Save.
7. **Add a second notification**: click **Add notification** again → **Email notification** → same form **`quote`** → enter the second email: **ahmadhamadi2002@gmail.com** → Save.

After that, every time someone submits the form, **both** addresses receive the notification email from Netlify automatically. You don’t send anything to Make or do anything manually.

If your Netlify UI only allows one email per notification type, add two separate “Email notification” entries (one per address). If you don’t see a way to add a second email notification, use Option B below.

---

## 5. Option B — Netlify + Make.com (also automatic after one-time setup)

If you need custom email content, or Netlify won’t let you add two email notifications for the same form:

1. In **Netlify**: **Form submission notifications** → **Add notification** → **Outgoing webhook**. Set the URL to your **Make.com webhook** URL.
2. In **Make.com**: Create a scenario with **Webhooks → Custom webhook** as the trigger, then add **Email** (e.g. Gmail) modules to send to **john.scime.mcmaster@gmail.com** and **ahmadhamadi2002@gmail.com** (two modules, or one with both in the To field if your app supports it). Build subject/body from the webhook payload (`first_name`, `last_name`, `email`, `phone`, `form_source`, etc.).
3. Turn the scenario **on**.

Once that’s set up, form submit → Netlify sends to Make → Make sends to both emails. No manual step when someone fills the form.

---

## Quick checklist

**Confirm connection:** Netlify dashboard → your site → **Forms** → form **`quote`** is listed. Submit once on the live site and check **Forms → quote → Submissions** (and your email).

**Option A — Netlify only:**

- [ ] Netlify → Notifications → Form submission notifications.
- [ ] Add **Email notification** for form `quote` → **john.scime.mcmaster@gmail.com**.
- [ ] Add **Email notification** for form `quote` → **ahmadhamadi2002@gmail.com**.
- [ ] Test: submit the form once; confirm both inboxes receive the email.
