# GainFrame Marketing Deep Dive — What's Working, What's Broken, and What to Do Next

## Your Stated Request vs. Your Underlying Intent

**What you asked:** "What am I doing wrong? What can I do that I'm not doing?"

**What you actually need:** A clear diagnosis of *why* your paid and organic channels aren't converting at scale, a brutally honest assessment of which activities are worth continuing vs. killing, and a prioritized 5-move playbook you can execute *this week* as a solo dev with limited budget and time.

You're not lacking effort — you've tried Reddit, TikTok, Apple Ads, Google Ads, email, blog SEO, and your landing page. The problem is *leaky funnels and wrong-channel-fit*, not missing channels.

---

## 📊 The Data Tells a Clear Story

### Your Funnel Right Now

| Stage | Number | Conversion |
|-------|--------|------------|
| App Store Impressions | 3,740 | — |
| Product Page Views | 1,340 | 35.8% of impressions |
| Downloads | 181 | **7.47% CVR** (actually good!) |
| Started Trial / Purchased | ~32 customers | **~17.7%** of downloads |
| Currently Active (paying + trial) | ~31 (14 paid + 17 trial) | — |
| Cancelled after purchase (no trial) | ~10 | — |
| Cancelled during trial | ~7 | — |
| Still on free trial | ~8 | — |
| Active paid subscribers | ~5-6 | — |
| **MRR** | **$53** | — |

### Subscription Breakdown (from your CSV)

From the 32 records:

| Status | Count | % |
|--------|-------|---|
| **Active** (past trial, paying) | 2 | 6.3% |
| **Free trial** (still active) | 8 | 25.0% |
| **Cancelled** (paid but turned off auto-renew) | 10 | 31.3% |
| **Cancelled trial** (cancelled during trial) | 7 | 21.9% |
| **Other/recently purchased** | 5 | 15.6% |

> [!WARNING]
> **Your trial-to-paid conversion is bleak.** Of people who start a trial, roughly **47%** cancel *during* the trial, and of those who convert to paid, **most turn off auto-renew immediately** (10 of 12 paid purchases have `auto_renew_intent = false`). This tells you people are trying the Pro features, **not finding enough value to justify the price during the trial window**, and leaving.

### What's Normal? (Industry Benchmarks)

| Metric | Your Number | Industry Average | Verdict |
|--------|-------------|-----------------|---------|
| App Store CVR (impression→download) | 7.47% | 3-8% for Health/Fitness | ✅ **Good** |
| Download→Trial start | ~17% | 5-15% | ✅ **Above average** |
| Trial→Paid conversion | ~15-20% | 40-60% (for apps with good activation) | ❌ **Very low** |
| First-month churn post-trial | ~80%+ | 30-50% | ❌ **Very high** |
| MRR at 181 downloads | $53 | — | Needs 10x to be meaningful |

**The good news:** People *find* your app and *download* it at a healthy rate. Your App Store listing is doing its job.

**The bad news:** Once inside the app, something is breaking. People try Pro, don't feel the value, and leave. **This is your #1 problem and it's not a marketing problem — it's a product/activation problem.**

---

## 📣 Channel-by-Channel Diagnosis

### 1. Reddit ✅ Best Channel (Keep, but evolve)
- Your Hevy subreddit post with before/after screenshots drove most installs
- **Why it worked:** Real transformation photo + relevant community + not salesy
- **Why it can't be replicated easily:** Other fitness subs have stricter self-promo rules and you can't keep posting the same format
- **Fix:** You need *other people* posting about you. More on this below.

### 2. TikTok ⚠️ Wrong Format
- 5K and 15K views → only 3-4 users
- **That's a 0.02-0.04% conversion rate**, which is actually normal for TikTok top-of-funnel content
- TikTok is a *brand awareness* tool, not a direct-response tool for a $5-30/yr app
- **Verdict:** Organic TikTok is worth doing for SEO + social proof, but **stop paying to boost TikTok posts**. The math doesn't work at your price point.

### 3. Apple Search Ads ❌ Too Early to Judge
- 2 installs in a week is bad, but Apple Search Ads need 2-4 weeks of data to optimize
- Budget is likely too low or keywords are too broad
- **Fix before killing:** Ensure you're bidding on high-intent, low-competition long-tail keywords like "body composition tracker", "progress photo app", "AI body fat scanner" — NOT "fitness app" or "body transformation"
- Check your match types — use Exact Match for the first month

### 4. Google Ads ❌ Kill Immediately
- 0 impressions with $611/month budget = **your campaign is misconfigured**
- Google Ads for iOS app installs is notoriously difficult and expensive (typical CPI is $2-5 for fitness)
- With 0 impressions, your ad likely failed approval, has targeting issues, or bidding is set too low
- **Verdict:** Stop spending. Fix Apple Search Ads first (people are *already searching* in the App Store). Google UAC can wait until you have $1K+ MRR.

### 5. Blog/SEO ✅ Long Game Asset (Keep)
- Getting traction for specific keywords is great
- Blog posts like "Best AI Body Editor Apps" capture search intent beautifully
- **Keep writing 1-2 posts per month.** This compounds over time.
- **Missing:** Your blog posts send people to the App Store but you have NO email capture on the blog. Add a lead magnet.

### 6. Email (Mailchimp) ⚠️ Dried Up Because No New Inputs
- 160 emails is a tiny list
- The "well ran dry" because you're not adding new emails — your landing page likely has no prominent email capture anymore (confirmed: I audited your landing page and the only CTA is "Download on the App Store")
- **Fix:** Add a lead magnet email capture above the fold. Even something simple: "Get our free guide: How to Take the Perfect Progress Photo"

### 7. Landing Page 🟡 Beautiful But Leaky
Your landing page at gainframe.app looks **premium** — dark theme, great copy ("Your physique, decoded."), clear feature list. But:
- **Only one CTA:** Download on the App Store
- **No email capture** for people who aren't ready to download
- **No social proof** (no testimonials, no "X users", no ratings, no before/after transformations)
- **No video** showing the app in action
- People who visit from your blog, Reddit, or TikTok and aren't ready to commit → **lost forever**

---

## 🎯 Top 5 Ideas — Ranked by Effort, Complexity, and Impact

### Idea 1: Fix the Trial Experience (Product Fix, Not Marketing)
| Effort | Complexity | Impact |
|--------|-----------|--------|
| 🟡 Medium | 🟡 Medium | 🔴 **HIGHEST** |

**Why this is #1:** You're losing 47-80% of trial users. If you fix this one thing, every marketing dollar you spend works 2-4x harder. No amount of traffic will save a leaky bucket.

**Specific actions:**
1. **Add an in-app onboarding that delivers a "wow moment" in the first 5 minutes.** Force a first photo analysis during onboarding — not optional. The user should see their body comp analysis *before* they even see the rest of the app.
2. **Send push notifications at Day 1, 3, and 5 of the trial** reminding them to take their first/second photo and showing what Pro unlocks
3. **Add a "trial ending" screen** at Day 5-6 that shows them what they'll lose — their report history, their trend data, their comparison ability
4. **Track exactly where trial users drop off** — do they never take a photo? Take one photo but never come back? Come back but never compare? You need analytics events (Firebase/PostHog) to answer this

---

### Idea 2: Weaponize Your Power Users
| Effort | Complexity | Impact |
|--------|-----------|--------|
| 🟢 Low | 🟢 Low | 🟡 **High** |

**Why this matters:** You have users who *email you weekly*. One wants to join the project. These are your most underutilized asset.

**Specific actions:**
1. **Create a "GainFrame Insiders" group** (Discord or iMessage group) — invite your top 5-10 most engaged users. Ask them to share their transformation screenshots on Reddit/Twitter/etc. Provide them with a referral code.
2. **The user who wants to work with you** — immediately onboard them as a "community manager." Give them a free Pro account. Ask them to post in Hevy, r/fitness, r/bodybuilding, r/bodyweightfitness using *their own* before/after screenshots
3. **Ask 3 of your best users to leave App Store reviews** right now. You likely have very few reviews, which kills conversion for anyone who finds you via search.
4. **Get video testimonials** from 2-3 users showing their phone, opening the app, and narrating their experience. These are 10x more powerful than any TikTok you'll make yourself.

---

### Idea 3: Add Social Proof + Email Capture to Landing Page
| Effort | Complexity | Impact |
|--------|-----------|--------|
| 🟢 Low | 🟢 Low | 🟡 **High** |

**Your landing page looks like a $50K startup built it, but converts like a ghost town.** Fix:

1. **Add a testimonial section** with 2-3 real user quotes (ask your power users)
2. **Add an email capture popup/section:** "Get our free guide: How to Take the Perfect Progress Photo"  or "Join 160+ fitness trackers — weekly tips on tracking your physique." This turns blog traffic into an asset.
3. **Add a "how it works" video** — even a 30-second screen recording of using the app. People need to *see* the magic, not just read about it.
4. **Add a "before/after" showcase** section — with permission from your users. This is the single most compelling content for fitness apps. Your Reddit post proved it.

---

### Idea 4: Reddit Community Seeding (Systematically)
| Effort | Complexity | Impact |
|--------|-----------|--------|
| 🟡 Medium | 🟢 Low | 🟡 **High** |

**Why your follow-up Reddit posts haven't worked:** You're likely posting *as the founder* in subs where you have no history. Reddit's algorithm and communities punish this.

**The fix:**
1. **Stop self-promoting.** Instead, become a genuine contributor in 3-4 subreddits: r/fitness, r/bodybuilding, r/GYM, r/naturalbodybuilding, r/Hevy
2. **Comment on other people's progress posts** for 2-3 weeks: offer genuine advice, compliment their work, share your own journey
3. **Then post your own progress** — same format as your hit post. This time show 2+ months of progress tracked in the app. The screenshot IS the ad.
4. **Arm your community manager/power user** to do the same in 2-3 different subs simultaneously
5. **Target niche subs** with less moderation: r/naturalbodybuilding (22K), r/bodyrecomposition (48K), r/leangains (392K), r/Brogress (325K — literally a sub for progress photos)

---

### Idea 5: Fix Your Apple Search Ads (Don't Kill — Optimize)
| Effort | Complexity | Impact |
|--------|-----------|--------|
| 🟡 Medium | 🟡 Medium | 🟡 Medium |

**2 installs in a week suggests misconfiguration, not a bad channel.** Apple Search Ads have some of the highest intent traffic you can buy.

**Steps:**
1. **Switch to Exact Match keywords only** for the first 30 days
2. **Target these specific keywords:** "body composition app", "progress photo tracker", "AI body fat", "body fat scanner", "physique tracker", "muscle progress tracker", "body analysis app"
3. **Set a max CPT (Cost Per Tap) of $1.50** and track for 2 weeks
4. **Create a Custom Product Page** variation in App Store Connect that matches the ad — show the AI analysis result as the first screenshot
5. **Daily budget: $5-10** — don't overspend until you find a keyword that converts
6. **Kill Google Ads entirely.** Reallocate that $611/month to Apple Search Ads and content creation

---

## 🧠 The Deeper Truth

You're doing a lot of *top-of-funnel* marketing (TikTok, Google Ads, Reddit posts) but your **mid-funnel is completely missing** and your **bottom-of-funnel is broken.**

```
                    YOUR PROBLEM MAP
    ┌──────────────────────────────────────────────┐
    │         TOP OF FUNNEL (Awareness)             │
    │  Reddit, TikTok, Blog, Ads                    │
    │  Status: ✅ Working okay at small scale       │
    ├──────────────────────────────────────────────┤
    │         MID FUNNEL (Consideration)            │
    │  Email nurture, social proof, testimonials    │
    │  Status: ❌ MISSING                           │
    │  → No email capture on landing page           │
    │  → No testimonials                            │
    │  → No video demos                             │
    │  → No "see it in action" content              │
    ├──────────────────────────────────────────────┤
    │         BOTTOM OF FUNNEL (Activation)         │
    │  First app experience, trial conversion       │
    │  Status: ❌ BROKEN                            │
    │  → 47% trial cancellation                     │
    │  → 80%+ paid churn                            │
    │  → No onboarding that forces "aha moment"     │
    │  → No retention triggers during trial         │
    └──────────────────────────────────────────────┘
```

**Spending money on the top of the funnel when the bottom is broken is literally pouring water through a sieve.**

---

## ❌ What to Stop Doing Immediately

1. **Google Ads** — 0 impressions, misconfigured, wrong channel. Kill it. Save $611/month.
2. **Paying to boost TikTok posts** — 15K views → 3 users is unacceptable ROI at your budget. Organic-only.
3. **Sending emails to your 160 list without replenishing it** — You're burning a finite resource. Add email capture first.

## ✅ What to Do This Week (Priority Order)

1. **Talk to 3-5 trial churners.** Email or push-notify your cancelled_trial users: "Hey, you tried GainFrame Pro and cancelled. I'm the solo dev — would love 60 seconds of your time. What was missing?" This is the most valuable thing you can do.
2. **Ask your most engaged users for App Store reviews.** Right now. Today. Reviews compound.
3. **Add email capture to gainframe.app.** Takes 30 minutes with Mailchimp embed. "Free guide: Perfect Progress Photos" or "Weekly physique tracking tips."
4. **Onboard your community volunteer.** Give them Pro access, a simple brief ("Post your progress using GainFrame in r/Brogress, r/leangains"), and let them run.
5. **Fix Apple Search Ads** — switch to Exact Match, niche keywords, $5/day. Give it 3 weeks.

---

## 🔮 Follow-Up Questions You Should Ask Next

1. **"Can you help me build an in-app analytics event system so I can see exactly where trial users drop off?"** — Without this data, you're guessing about activation. You need events like `first_photo_taken`, `first_report_viewed`, `second_photo_taken`, `comparison_viewed`, `trial_paywall_shown`.

2. **"Can you help me design an automated email sequence for trial users?"** — Day 0: Welcome + take your first photo. Day 2: "Here's what your first report means." Day 5: "Compare your first two photos." Day 6: "Your trial ends tomorrow — here's what you'll lose." This alone could double trial conversion.

3. **"What would a referral/share system look like inside the app?"** — Your Reddit hit proved that before/after screenshots are your best marketing. What if every comparison had a "Share to Reddit/Instagram" button with GainFrame branding? Turn every user into a distribution channel.
