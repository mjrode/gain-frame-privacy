# Beta Tester Migration Tracker

## How to Find All Engaged Testers

> [!TIP]
> **App Store Connect → Your App → TestFlight → Testers tab** shows every tester's email, session count, crash count, and feedback. Click **Feedback** to see all submitted feedback tied to the tester's email — even feedback that felt "anonymous" in notifications.

### Steps to Identify Remaining Engaged Testers
1. Go to [App Store Connect](https://appstoreconnect.apple.com) → GainFrame → TestFlight
2. Click your test group → **Testers** tab
3. Sort by **Sessions** (descending) — high session count = engaged users
4. Check the **Feedback** section — anyone who submitted feedback is a top candidate
5. Cross-reference with the list below and add any missing names

---

## Tier 1: Top Engaged Testers (Personal Email + Free Year of Pro)

These users gave meaningful feedback and deserve a personal thank-you + free year of Pro.

| # | Name | Email | Feedback Summary | Personal Email Sent | Free Year Given | Review Requested |
|---|------|-------|-----------------|---------------------|-----------------|-----------------|
| 1 | Allen Salama | allen.salama@gmail.com | | ☐ | ☐ | ☐ |
| 2 | Stefano Mazzuca | stefano.mazzuca@sunrise.ch | | ☐ | ☐ | ☐ |
| 3 | Dan | dan@thugsandwich.co.uk | | ☐ | ☐ | ☐ |
| 4 | Charlie Ryan | chazman1616@gmail.com | | ☐ | ☐ | ☐ |
| 5 | Sarat | sagatbabu@gmail.com | | ☐ | ☐ | ☐ |
| 6 | Nathan Bratby | nathanbratby@gmail.com | | ☐ | ☐ | ☐ |
| 7 | Daniel Bell | daniel.bell87@gmail.com | | ☐ | ☐ | ☐ |
| 8 | Hamza | lowhigher1@gmail.com | | ☐ | ☐ | ☐ |

> **Action**: Fill in the "Feedback Summary" column with what each person contributed, so you can reference it in your personal email. Check TestFlight feedback to add any additional engaged testers you discover.

---

## Tier 2: Broader Beta Users (All 87 — Mailchimp Blast)

These get the bulk Mailchimp email with a free month of Pro.

- [ ] Segment Mailchimp list for TestFlight users
- [ ] Draft email using template from [go-live-plan.md](./go-live-plan.md#broader-beta-user-email-all-87)
- [ ] Schedule send for 1 week before launch

---

## Personal Email Template (Tier 1)

```
Subject: Thank you, [Name] — you helped build GainFrame

Hey [Name],

I wanted to reach out personally because your feedback during the beta genuinely shaped GainFrame. [Mention specific feedback they gave — e.g., "Your suggestion about the ghost overlay alignment made the whole feature work better."]

GainFrame is about to go live on the App Store, and I'd love to give you a free year of Pro as a thank-you. [Instructions for redeeming — promo code or RevenueCat grant].

One favor — if you have a minute on launch day, an honest App Store review would mean the world. Early reviews are critical for a new app, and yours would carry real weight.

Thanks again for being part of this from the beginning.

— Michael
```

---

## RevenueCat: Granting Free Pro Access

> [!IMPORTANT]
> Use RevenueCat's **Promotional Entitlements** to grant free access:
> 1. Go to [RevenueCat Dashboard](https://app.revenuecat.com) → GainFrame → Customers
> 2. Search by the tester's App Store email (may differ from TestFlight email)
> 3. Click the customer → **Grant Promotional Entitlement**
> 4. Select the Pro entitlement → Set duration to 1 year (Tier 1) or 1 month (Tier 2)
>
> **Alternative**: Create promo codes in App Store Connect under **Promo Codes** (limited to 100 per app version per period).
