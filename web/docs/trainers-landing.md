# `/trainers` Landing Page — Deployment Runbook

This document covers everything needed to make the trainer waitlist landing
page live. Most of the page works out of the box (static content + analytics);
the parts that need configuration are:

1. The Stripe Payment Link the deposit button points to
2. Resend Audience + API key for the soft email-capture form
3. Cloudflare Pages environment variables for the API function

Once those are in place, push to `main` and the page deploys automatically.

---

## 1. Stripe Payment Link (deposit flow)

The deposit button on `/trainers/` and the final CTA both link to
`SITE.trainerDepositUrl` (defined in [`lib/site.ts`](../lib/site.ts)).
Default value is a placeholder — replace it before launch.

### Create the Payment Link

1. Log in to the Stripe dashboard
2. Products → **Create product**
   - Name: `GainFrame for Trainers — Founding Member Deposit`
   - Description: `$50 deposit applied to first month at the founding rate of $5/client/mo. Locks in founding pricing for 12 months. Refundable within 30 days if the V1 product does not ship or does not fit your workflow.`
   - One-time price: **$50.00 USD**
3. Save the product
4. Payment links → **Create payment link**
   - Choose the product above
   - Quantity: not adjustable
   - Collect customers' email addresses: **on**
   - Collect customers' phone numbers: off
   - Add custom field: `Active clients today` (Number, optional)
   - Add custom field: `What app(s) are you using today?` (Text, optional)
   - Confirmation page: **Redirect to your website**
   - Redirect URL: `https://gainframe.app/trainers/thanks/`
5. Copy the resulting `https://buy.stripe.com/…` URL

### Wire it into the site

Edit [`lib/site.ts`](../lib/site.ts) and replace the placeholder:

```ts
trainerDepositUrl: "https://buy.stripe.com/REPLACE_WITH_PAYMENT_LINK",
```

with the real Payment Link URL. Commit, push, deploy.

### Monitoring

- Stripe dashboard → Payments → filter by the trainer product
- Each deposit triggers an automatic receipt to the customer's email
- Customer email + custom-field answers come through on the payment record

### Refund path (if validation fails)

If the 21-day window closes with fewer than 5 deposits:

1. Stripe dashboard → each payment → **Refund payment** (full refund)
2. Email each depositor a short note explaining the validation didn't hit
   threshold and the deposit is back on their card
3. Pause the Payment Link (Payment links → … → Deactivate) so no new
   deposits come in
4. Optional: replace `trainerDepositUrl` with the link to a "we're not
   building this right now" page, or 404 the `/trainers/` route via
   `next.config.ts` redirects

---

## 2. Resend Audience (waitlist email capture)

The soft-CTA form on `/trainers/` POSTs to `/api/trainer-waitlist`, which is
a Cloudflare Pages Function defined in
[`functions/api/trainer-waitlist.ts`](../functions/api/trainer-waitlist.ts).
It adds the contact to a Resend Audience and fires an internal notification
email to Mike.

### Create the Resend Audience

1. Log in to the Resend dashboard
2. Audiences → **Create audience**
   - Name: `Trainer Waitlist`
3. Copy the audience ID (UUID) from the URL or the audience detail page —
   this becomes `RESEND_TRAINER_AUDIENCE_ID`

### API key

If you don't already have a production Resend API key:

1. Resend dashboard → API Keys → **Create API Key**
   - Name: `gainframe-pages`
   - Permission: `Sending access` (the Pages function needs to send emails too)
   - Domain: gainframe.app (assumes you've already verified it)
2. Copy the `re_…` key — this becomes `RESEND_API_KEY`

### Verify the notification "from" address

The function defaults to sending notifications `from: noreply@gainframe.app`.
That address must be a verified sender on your Resend-verified gainframe.app
domain. If you'd rather use a different from address, set `NOTIFY_EMAIL_FROM`
in env vars.

---

## 3. Cloudflare Pages env vars

In the Cloudflare dashboard → Pages → `gain-frame-privacy` project → Settings
→ Environment variables, add the following to **both Production and Preview**:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | `re_…` from step 2 |
| `RESEND_TRAINER_AUDIENCE_ID` | audience UUID from step 2 |
| `NOTIFY_EMAIL_TO` | `michaelrode44@gmail.com` (optional — defaults to this) |
| `NOTIFY_EMAIL_FROM` | `noreply@gainframe.app` (optional — defaults to this) |

After saving, redeploy from the dashboard so the function picks up the env
vars. Test by submitting the form on `/trainers/` (use a real email of yours)
and verify:

- A Resend audience contact is created
- A notification email lands in `michaelrode44@gmail.com`

---

## 4. Verifying everything end-to-end (pre-launch checklist)

Before sharing the URL with trainers, run through:

- [ ] `lib/site.ts` → `trainerDepositUrl` points to the live Stripe link
- [ ] Hit the live `/trainers/` page in an incognito window
- [ ] Click "Reserve founding-member spot" → opens Stripe Checkout in a new tab
- [ ] Complete a test deposit using your own card ($50)
- [ ] Stripe redirects to `/trainers/thanks/`
- [ ] You receive a Stripe receipt + 24-hour personal note from Mike
- [ ] Stripe dashboard shows the payment with email + custom-field answers
- [ ] Refund the test payment in Stripe
- [ ] Submit the waitlist form with a different email
- [ ] Notification email lands in `michaelrode44@gmail.com`
- [ ] Resend audience shows the new contact
- [ ] Hit `/trainers/` on a real mobile device — layout looks correct

---

## 5. DM reply template for the original trainer

Send the following (via the existing chat thread) once the page is live:

> Hey! Good news — I actually scoped out a way to make GainFrame work for
> trainers and put together a founding-member spot for the trainers who
> reached out. Here's the early page:
>
> **https://gainframe.app/trainers/**
>
> Two things I'd love your input on:
>
> 1. Does the pitch on that page describe how you'd actually use it? If
>    something's off or missing, tell me — you'd be one of the first
>    trainers shaping the V1.
> 2. Would you be open to me using the line you sent me ("yours is the
>    most accurate, none of the apps combine future projections with the
>    body scan") as anonymous social proof on the page? I'd quote it
>    without your name — just "personal trainer, App Store user" — but
>    wanted to ask before doing it.
>
> The $50 deposit on the page locks in $5/client/mo for the first 12
> months (vs $8/client/mo standard) and is fully refundable if I don't
> ship something you can use. I'm collecting founding deposits for ~3
> weeks; if 5+ trainers commit, I start the build immediately.
>
> Either way, thanks for the push to actually look at this — it's the
> kind of expansion I've been thinking about and your message made me
> commit to figuring it out. Let me know your thoughts.

If she gives permission for the quote, attribute it on the page as
"Personal trainer, App Store user" (the page already shows that label —
no code change needed). If she'd rather we use her first name + city, edit
the `.tr-quote-attr` line in
[`app/trainers/page.tsx`](../app/trainers/page.tsx).

---

## 6. Distribution checklist (post-launch)

In rough priority order:

- [ ] Reply to the original DM trainer with the template above
- [ ] Post in r/personaltraining (read sub rules; this is a sub that
      tolerates polite founders sharing tools — keep it humble, not a launch)
- [ ] Post in r/PersonalTrainer (same vibe)
- [ ] DM 5–10 trainer Instagram accounts you've engaged with — short note
      asking if they'd take a look + share feedback
- [ ] Post in 2–3 large Facebook trainer groups ("Personal Trainer Network",
      "Online Coaches", etc.) — search Facebook for "personal trainer group"
      to find the active ones
- [ ] One build-in-public X post acknowledging the audience pivot
- [ ] Ask the DM trainer (if she's onboard) to share with her network

Track in the [Stripe dashboard](https://dashboard.stripe.com/) for deposits
and the Resend audience for soft-signups. Set a calendar reminder for 21
days from launch to decide go/no-go on the build.

---

## 7. Success criteria

From the plan in `~/.claude/plans/i-have-a-request-expressive-quilt.md`:

| Deposits in 21 days | Decision |
|---|---|
| **≥5** | Commit to V1 build (~5–7 weeks) |
| **3–4** | Strong signal, not enough. Do user interviews; consider direct sales to 1:1 confirm |
| **1–2** | Soft signal. Don't build yet; learn what's missing |
| **0** | Kill cleanly. Refund deposits, archive the page, move on |

---

## File map

- `app/trainers/page.tsx` — main landing page
- `app/trainers/TrainerWaitlistForm.tsx` — client component for the soft-CTA form
- `app/trainers/thanks/page.tsx` — post-deposit confirmation page
- `public/styles/trainers-page.css` — page-scoped stylesheet
- `functions/api/trainer-waitlist.ts` — Cloudflare Pages Function for the form
- `lib/site.ts` → `trainerDepositUrl` — the Stripe Payment Link URL (replace before launch)
