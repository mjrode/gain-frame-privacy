# GainFrame — State of Growth

**Pulled 2026-05-29** · sources: RevenueCat (90d weekly), PostHog (app), GA4 (web), GSC (organic), industry benchmarks (RevenueCat 2025 / Business of Apps). Raw data under `raw/2026-05-29/`.

> ✅ Updated 2026-05-29 with your ad-spend exports (TikTok/Reddit/Apple Ads) and App Store Connect data — spend→growth correlation (Section 6) is complete.
>
> 🔧 **The early-May spike was driven by BOTH paid channels — TikTok ($987 in the week of 5/3) AND Apple Search Ads ($1,185 in the week of 5/10, plus $383 the week before).** Total paid over 3 months ≈ **$5,674** (TikTok $1,881, ASA **$2,498**, Reddit **$1,295**). ASA wound down after the May-10 burst (a ~$568 inefficient tail in May 11–29) and is now ON_HOLD → installs reverted to the organic floor. _(Your original read — "thousands on Apple Search Ads in early May" — was correct.)_
>
> ✅ **ASA total confirmed: $2,498** (authoritative campaign-level report, Feb 1–May 29, all ad groups: Automated $2,160 + Core Keywords $338; 443 installs, $5.64 CPI). Note: the `detailed-apple-ads.csv` search-terms file sums to ~$4,979 for the Automated group alone — **inflated ~2.3×** by ASA attribution double-counting (one install/spend spread across many auto-discovered search terms). **Never sum a search-terms report for spend totals** — use the campaign/ad-group level.

---

## TL;DR — the one decision

**Focus the next few weeks on trial → paid conversion. But first fix conversion *measurement* — PostHog can't currently see ~80% of who pays, so we're flying blind on what drives conversion. Do NOT restart paid ads, and do NOT prioritize retention — retention is already a strength.**

- **MRR is still growing ($634) but the growth rate fell off a cliff** — from ~22–33%/wk in early May to ~4–5%/wk the last two weeks. Your "flat-lined" instinct is half-right: *new-customer volume* and *MRR velocity* flattened; absolute MRR/subs still tick up.
- **The flatness is app-side and paid-driven.** App installs reverted from the early-May **paid peak** (TikTok + Apple Search Ads; 359, 331/wk) back to the organic floor (~120/wk) once paid stopped. Meanwhile the **website is growing** (~doubled Mar→May). The bought volume left; the organic engine is fine.
- **The single biggest gap vs industry is trial→paid conversion: ~20.7% blended vs a 39.9% Health & Fitness median** (RevenueCat aggregate — reliable) — and it has *fallen* to ~10–25% in Apr/May from ~36–43% in March.
- **Retention is at/above benchmark.** Coach usage *correlates* with much higher retention, but that's a small-N, selection-biased signal (see §2) — a hypothesis to test, **not** a proven lever, and **not** shown to drive conversion (see §3).

---

## 1. New users over the last 3 months

### App (installs / new customers) — peaked on paid, reverted to organic
| Week | Installs (PostHog) | New customers (RC) | Phase |
|------|-----|-----|-------|
| 03-22 → 04-26 | 67–185 | 117–177 | Organic baseline (~120–175/wk) |
| **05-03** | **359** | **387** | 🔴 Paid burst (TikTok $987 + ASA $383) |
| **05-10** | **331** | **366** | 🔴 Paid burst (ASA $1,185) |
| 05-17 | 142 | 157 | All paid stopped — decay begins |
| 05-24* | 96 | 104 | Back to organic floor (*partial wk → ~112–121 projected) |

**Read:** Top-of-funnel did **not** grow — it spiked on paid then fell back to where organic was. The last two weeks only *feel* flat because we're comparing against the paid peak.

### Web (GA4) — actually growing
Website new users ~doubled: **~160–260/wk in March → ~350–400/wk in May** (excluding the Mar 9–15 bot anomaly of 1,420). 90-day channel mix: **Direct 2,082 · Organic Social 1,302 · Organic Search 880** new users — paid is negligible on web. Organic search clicks (GSC) also ~doubled (peak 151/wk on 5/3, softened to ~58–69 the last 3 weeks but well above the March ~30–50 baseline).

**The disconnect worth noting:** web traffic is climbing but app installs are flat → there's a **web → install gap** (a cheap, organic growth lever for later — see Section 7).

## 2. What makes a user stick around (activation drivers)

Weekly retention (returning = `app_session_start`), by what the user did:

| Cohort | W1 | W2 | W4 |
|--------|----|----|----|
| Baseline install | ~17–30% | ~9–15% | ~10–12% |
| Did **first check-in** | ~28–43% | ~15–30% | ~15–20% |
| Used **AI Coach** | **~58–81%** | **~47–50%** | (feature too new) |

Coach usage shows the largest gap — but **read this as correlation, not proven causation:**
- **Small cohorts** (45 / 26 / 16 users) → wide error bars.
- **Selection bias / reverse causation:** people who open the Coach are *already* the motivated ones. Coach usage *correlates* with retention; we have **not** shown it *causes* it. Proving that needs an A/B test or matched-cohort comparison (neither run here).

Completing the onboarding first check-in is a solid secondary driver (+50–80% on W4), same caveat. Paid ASA cohorts (5/3, 5/10) retained *worse* than organic (W1 21%/17% vs 27–30%) — bought installs, weak intent.

**Implication:** retention is at/above benchmark, so it's not the problem. The Coach is a *promising hypothesis* for activation — ~22–26% of trial/subscription starters have touched it (room to surface it more) — but it's a bet to test, not a settled lever.

## 3. What makes a trial convert to paid

- **RC trial→paid conversion collapsed:** March 38% / 28% / 36% / 43% → April–May 20% / 14% / 22% / 8% / 11% / 25% / 13%. Blended **20.7%** (RevenueCat — reliable for the *rate*).
- Likely causes (plausible, not proven): **(a) intent dilution** — March had few, warm, organic trials (13–23/wk) converting at ~36%; as volume scaled (37–43/wk in May, much of it paid) conversion halved; **(b) paid-cohort quality** — ASA-week trials convert and retain worse.
- ⚠️ **We cannot currently measure *what* drives an individual trial to convert.** PostHog logged only **10 `trial_converted` events in 120 days** vs RevenueCat's **~48** — it's missing **~80%** of conversions. The coach-vs-no-coach conversion split is **4 vs 5 users** → statistically meaningless. So any claim that "engaged/Coach users convert better" is **unsupported by our data** (an earlier draft of this report asserted it — that was wrong).
- **This is the real blocker:** conversion is the focus stage, but we're blind on its drivers until per-user paid conversion is reliably tracked. See §7①.

## 4. What gets users to start a free trial

90-day funnel (ordered, 14-day window):

| Step | Users | Conv | Drop |
|------|-------|------|------|
| Installed | 1,729 | 100% | — |
| Onboarding completed | 1,002 | **57.9%** | 🔴 42% abandon onboarding |
| Paywall viewed | 495 | 28.6% | |
| Trial started | 66* | — | 🔴 only ~13% of paywall viewers start a trial |

Two pre-trial leaks: **42% never finish onboarding**, and **paywall→trial is only ~13%**. (Looser, non-strict counting puts install→trial-start ~11%, which is near the H&F top decile — but the ordered path shows where intent leaks.) Web landing pages feed the top of this; the onboarding step and paywall offer are the controllable friction points.

## 5. Retention vs industry — we're a strength here

| Metric | GainFrame | H&F benchmark | Verdict |
|--------|-----------|---------------|---------|
| W1 retention | ~17–30% (Coach 58–81%) | 15–20% median, 30% top | ✅ at/above |
| W4 / D30 retention | ~10–12% | 8–12% fitness | ✅ at benchmark |
| Trial → paid | **20.7%** (Apr–May ~15%) | **39.9% median** | 🔴 **well below** |
| Monthly churn | ~12–13%/mo (3.2%/wk) | 10–15% typical | ✅ normal |

Sources in `benchmarks/industry-benchmarks.md`. **Retention and churn are fine to good. Trial→paid is the outlier.**

## 6. Ad spend → growth correlation _(complete)_

**Total paid over 3 months: ~$5,674** — TikTok **$1,881**, Apple Search Ads **$2,498** (443 installs, $5.64 CPI, ON_HOLD), Reddit **$1,295**. Full table in `raw/2026-05-29/spend-acquisition-correlation.tsv`.

**Reddit ($1,295)** was a **late-March Traffic campaign** ($447 wk 3/22 + $848 wk 3/29) that drove **~0 tracked app conversions** — a poor-ROI awareness test, since stopped. (Note: the earlier `Total Reddit Ad spend.csv` showed only $117 — it was incomplete; the by-date export `reddit-by-date.csv` is correct.) ASA weekly split below is through May 10 with a ~$568 tail in May 11–29.

| Week | TikTok$ | ASA$ | Paid total | ASC downloads | Store conv% | RC new cust | MRR WoW |
|------|--------:|-----:|-----------:|--------------:|------------:|------------:|--------:|
| 04-19 | 164 | 153 | 317 | 134 | 37% | 145 | +22% |
| 04-26 | 110 | 32 | 142 | 185 | 32% | 177 | +29% |
| **05-03** | **987** | **383** | **1,370** | **397** | 43% | **387** | +33% |
| **05-10** | 0 | **1,185** | **1,185** | **353** | 47% | **366** | +22% |
| 05-17 | 0 | 0 | **0** | 144 | 57% | 157 | +4% |
| 05-24 | 0 | 0 | **0** | 82 | 52% | 104 | +5% |

**What the data shows:**
- The early-May spike was **paid on both channels**: TikTok $987 (week of 5/3) + Apple Search Ads $1,568 (across late-Apr→May 10, incl. a **$1,185 ASA burst** in the 5/10 week). ~**$2,587** of paid drove downloads from ~185 to ~397/353 and new customers to 387/366.
- **Paid wound down after May 10** (TikTok $0; ASA only a ~$568 tail in May 11–29, then ON_HOLD) → downloads fell 144→82 and new customers 157→104, back to the organic floor. The "flat-lined" feeling is exactly this paid→off cliff. (That late-May ASA tail bought almost nothing — installs fell *while* it ran — which is why pausing it was right.)
- Unit economics: ~$2,587 burst → ~**470 incremental new customers** ≈ **$5.5 each**; at ~5% → paid → ~**$110 CAC per paying customer vs LTV ~$18** → **deeply underwater. Cutting paid was the right call.**
- Those paid cohorts also **retained worse** (W1 17–21% vs 27–30% organic) and converted worse on trial→paid — quantity over quality.
- ✅ This **refutes** "flat-line = growth is broken." Cutting removed *unprofitable* volume; the organic engine (web 2×, SEO 2×, Coach retention) is intact and compounding. The lesson is **don't restart paid** — fix conversion of the organic traffic you already get.

**App Store listing is healthy, not a bottleneck:** store conversion (downloads ÷ product-page-views) ran **30–57%** Apr–May — above the ~25–35% norm. Don't spend effort on the store listing; the leak is *inside* the app (onboarding → paywall → trial → paid).

## 7. Where to focus — ranked

**① PRIMARY — FIX CONVERSION MEASUREMENT (prerequisite for everything below).** Trial→paid is the focus stage (20.7% vs 39.9% median, the highest-$ leverage — moving to median roughly *doubles* subscriber yield from the same traffic). But **PostHog can't see ~80% of conversions** (10 logged vs RC's ~48 in 120d), so we cannot diagnose *why* trials convert or test fixes with confidence.
- **Pipe RevenueCat conversions into PostHog** (RC webhook → a reliable `paid_converted` event with the RC customer id), or fix the existing `trial_converted` / `subscription_started` instrumentation. Source of truth = RC.
- Until this exists, every conversion-driver claim (including the Coach one) is a guess.

**② Test the activation hypotheses — don't assume them.** Once ① lands:
- **Surface the AI Coach more widely** (it already lives in onboarding; ~74–78% of trial/sub starters never touch it). Treat as an **A/B test**: show Coach prominently during the trial for half of new trials, compare RC conversion. _Coach→retention is only a correlation today — prove the conversion link before betting the roadmap on it._
- **In-trial nudges before the trial-end charge** (check-in streak, progress recap); consider lengthening the trial toward the 5–9 days H&F top performers use. A/B each.
- **Diagnose the Mar→May conversion drop:** segment by acquisition source and pull the paywall/trial-offer change history — intent dilution vs a paywall regression?

**③ Plug the two pre-trial leaks** (these *are* measurable today): 42% onboarding abandonment (inspect `onboarding_step_viewed` / `onboarding_abandoned` by step) and 13% paywall→trial (test offer, placement, timing).

**④ KEEP WARM (don't over-invest): organic top-of-funnel.** Web + SEO + social are healthy and growing — keep feeding them, but they aren't the bottleneck. Cheap upside is the **web→install gap** (web 2× but installs flat) — a later experiment.

**⑤ DON'T: restart paid ads** (CAC ≫ LTV) **or chase retention** (already above benchmark).

---

### Numbers behind the headline
- MRR: 357.67 (4/26) → 474.82 (5/3, +32.8%) → 578.55 (5/10, +21.9%) → 603.16 (5/17, +4.3%) → **634.17 (5/24, +5.1%)**. Active subs 100 (5/13) → **122**. Active trials 35 → **19**.
- 1-month target (6/13) realistic **$850**; at the current ~5%/wk we'd reach ~$700 — **behind**, because targets were set during the 22%/wk paid bump. Re-baseline against the organic run-rate.
- DAU ~60–78 (from 125 peak) · WAU **272 (halved from 550 peak 5/14)** · MAU ~1,189 (plateauing, will dip as the ASA cohort ages out). WAU/MAU ~23% (was ~50%) — the recent decline is the paid cohort churning out, consistent with everything above.
