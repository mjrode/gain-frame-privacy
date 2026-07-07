# Blog-post brief: How we moved trial→paid conversion from ~21% to ~44%

**Compiled 2026-07-07.** Handoff doc for the agent writing the founder-story blog post. Everything below is verified against RevenueCat (live pull 7/7), PostHog, the weekly MRR audits (`../../gain-frame/docs/audits/mrr/`), the 2026-06-11 growth deep-dive (`../../gain-frame/docs/audits/growth-deep-dive/2026-06-11.md`), and app-repo git history. Numbers include numerator/denominator wherever possible — quote them as-is, don't round into vaguer claims.

---

## 1. The story in one paragraph

In late May 2026, GainFrame's trial→paid conversion was the single worst metric in the business: **20.7% blended vs a 39.9% Health & Fitness industry median** (RevenueCat benchmark), and falling (Apr–May cohorts ran ~8–25%). We spent June fixing it — but the first move wasn't a paywall change, it was fixing *measurement* (our analytics missed ~80% of real conversions). Then: a paywall A/B test, re-gating features that had quietly become free, feature-specific preview paywalls, and onboarding experiments. Five weeks later the last four resolved weekly cohorts converted at **37.5% / 37.5% / 57.7% / 43.3% — blended 44% (46 of 104 trials)**, at or above the industry median. MRR went from **$634 → $925** (+46%) over the same stretch with **$0 ad spend**.

## 2. Headline numbers (before → after)

| Metric | Baseline (State of Growth, 5/29) | Now (7/5 audit + 7/7 live RC pull) | Source |
|---|---|---|---|
| Trial→paid conversion | 20.7% blended; Apr–May cohorts 8–25% | **~44% blended last 4 resolved cohorts (46/104)** | RC trial_conversion_rate chart |
| vs industry | 39.9% H&F median — we were ~half | at/above median | RevenueCat 2025 benchmark |
| Paywall view → trial start | ~13% (66/495, 90d) | **23.5%** (62/264, 30d) | PostHog funnel |
| Install → paying within 7d | 5.17% | **10.0%** (23/230, wk 6/21) | RC |
| MRR | $634.17 (5/24) | **$925** (7/7) | RC overview |
| Active subs | 122 | **198** | RC overview |
| Realized 30d LTV per payer | ~$18 | **$27.50–31.12** (maturing cohorts) | RC |
| Ad spend during the improvement | $0 | $0 (paid off since mid-May) | GA4 confirms Paid channel = 0 |

**Weekly trial cohorts, RC ground truth** (week start · trials → conversions · rate):

- Mar: 13→5 (38.5%), 18→5 (27.8%), 14→5 (35.7%), 23→10 (43.5%) — small, warm, organic
- Apr: 15→3 (20.0%), 22→3 (13.6%), 18→4 (22.2%), 13→1 (**7.7%**) — the collapse
- May (paid era): 37→5 (13.5%), 24→7 (29.2%), 16→2 (12.5%), 22→5 (22.7%)
- **Post-fix: 5/31 24→9 (37.5%) · 6/7 24→9 (37.5%) · 6/14 26→15 (57.7%) · 6/21 30→13 (43.3%, fully resolved)**
- 6/28 + 7/5 cohorts still maturing (16 + 13 pending) — do NOT quote their partial rates.

MRR weekly path (RC): 530.73 (5/13) → 634 (5/24) → 659.48 (6/2 rebaseline) → 684.83 (6/14) → 796.60 (6/21, +16.3% WoW) → 863.81 (6/28) → ~890 (7/5) → **925 (7/7)**. ARR ≈ $11.1K.

## 3. What we actually did (dated timeline, from git + audits)

### Phase 0 — Fix the measurement (June 2–11). The unsexy prerequisite.

We were flying blind: PostHog had logged **10 `trial_converted` events in 120 days vs ~48 real conversions in RevenueCat** (~80% missing). You cannot A/B test a paywall when you can't see who converts.

1. **RC→PostHog integration fix (~6/2)** — the integration was silently 401-ing because RevenueCat had a PostHog *Personal* API key (`phx_`) where the capture endpoint needs the *Project* key (`phc_`). One-line dashboard fix, weeks of blindness.
2. **Linked RC events to PostHog persons via `$posthogUserId`** (6/9, commit `d462ff5a`) — before this, server-side conversion events landed on split anonymous persons.
3. **Fixed client-side `trial_converted` detection** (6/11, `44eaffb8`) — the edge-based check missed the trial→paid boundary because RC's cache briefly reads "trial+inactive" at renewal, which fired `trial_expired` and permanently masked the conversion. Only 13 persons had *ever* fired the event vs ~59 real conversions. Fix: sticky "ever-trialed" flag + state-based detection + 1h grace window.

### Phase 1 — Paywall work (June 2–3)

4. **Re-gated features that had quietly become free** (6/2, `b66a1132`, shipped in v2.10 on 6/3): Recovery + Weekly Chapter back behind Pro, fixed a broken milestone gate, redesigned the Deep Dive preview (locked-section teaser). Free users had been getting Pro value for nothing.
5. **Launched the paywall A/B test** (exp live 6/3, PostHog experiment 374799, flag `paywall_variant`): **value-anchored variant** (value stack + live per-month price anchor derived from the yearly package) vs the trial-timeline control. Status as of 7/5: **value_anchored 30.1% paywall→trial (58/193) vs control 24.1% (46/191)** — +6pp absolute, ~+25% relative, 88.9% chance-to-win, *not yet statistically significant*. Decision date set for ~7/31. Still running as of 7/7.
6. **Feature-specific ("custom") paywalls** — an ongoing thread, not one commit: bespoke Coach paywall merged intro+paywall into one sheet (5/12); Deep Dive + muscle-score preview paywall sheets (4/30); Deep Dive preview redesign C3 (6/2); Backstory free tier shows "teaser bookends" — oldest + newest photo per ritual — as its own upsell surface (6/9); onboarding Deep Dive report preview with locked sections (6/12). The pattern: every premium feature shows a real, partially-unlocked preview instead of a generic gate.

### Phase 2 — Diagnose with the new data (June 11)

7. **Growth deep-dive** (`docs/audits/growth-deep-dive/2026-06-11.md`) — joined RC's per-customer records to PostHog behavior (332/374 subscribers matched, 89%). Findings that shaped everything after:
   - **The check-in ritual is the payer signature**: 43% of eventual payers had ≥2 check-in days vs 13% of never-payers (3.3× lift). Coach use 44% vs 21%; Deep Dive 57% vs 29%.
   - **Photo volume is the strongest activation predictor**: among single-session users, trial-start rate goes 0.7% → 12% → 28% → 63% as photos go 0 → 1–5 → 6–15 → 16–40. Zero photos ≈ zero conversions (7 of 676).
   - **The onboarding wall is poseSetup**: 806 abandon events (32% of all), average 12.4h parked; importPhotos second.
   - **A silent paywall regression**: a 4/29 commit had removed the cold-launch welcome paywall (the single largest new-user paywall surface) with no successor — paywall exposure among onboarding starters fell 38% → 21% over three 30-day windows.
   - **Ever-paid rate was actually 44.9%** (168/374 of everyone who ever trialed or purchased) — the paywall sells; the *trial* was what leaked.

### Phase 3 — Onboarding experiments (June 10–12, v2.11–2.12)

8. **Pose step reframed as "add a photo"** (6/10) with camera-vs-library tracking.
9. **Onboarding friction A/B** (`onboarding_friction_v2`, 6/11, `250d0699`): treatment = library-first CTA on poseSetup, face-optional copy, "remind me tonight" deferral (8pm local notification); importPhotos stripped to "Add 3 older photos. Get your trend." + 3 slots. Targeted directly at the two worst steps from the deep-dive. **Caveat: no clean readout documented** — install→onboarding-complete is still ~58% in the 7/5 audit, so don't claim this won.
10. **Onboarding Deep Dive report preview** (6/12, `bbd62cb1`) — AI analysis preview at the highest-intent onboarding moment, with locked Pro sections. Plus A2 import-choice variant, HealthKit prefill fix, better step analytics.
11. **Required sign-in** (6/12, `9808da9d`) — onboarding sign-in step lost its bypass (existing users got a 3-skip wall). Not a conversion play per se — account continuity so subscriptions and data follow the person.

### Phase 4 — Give the trial more to convert on (June 9–16, v2.12–2.13)

12. **Backstory** (photo-history import): scans the camera roll, finds up to 10 years of old progress photos, scores them server-side (Gemini Batch API), and builds the user's transformation history. Free tier gets teaser bookends per ritual; Pro scores everything. Shipped to release 6/14–6/15. This is the "get to 6+ photos fast" activation insight productized — a trial user who imports history has instantly more value at the paywall moment.

### Phase 5 — July follow-through (v2.19)

13. **Lite Deep Dive preview A/B** (`onboarding_deep_dive_lite`, 7/5, `382ec8c5`): the full onboarding Deep Dive cost ~1,230 output tokens/~9s per install; lite generates only what's actually shown (~1/3 cost, 3–4s) at onboarding's highest-converting step. 50% A/B; needs a proper variant readout before crediting.
14. **Coach fair-use daily cap for trial/promo users** (7/5) — margin protection as conversion volume grew (coach family = ~44–47% of LLM spend).
15. **RevenueCat webhook → Slack** (7/5) — growth + paywall events now visible in real time.

## 4. The honest caveats (the post MUST carry these — it's the brand)

- **Small cohorts.** 24–30 trials/week means ±10pp swings are noise. The honest claim is the 4-cohort blend: **~44% (46/104)** — not "57.7%!" from the best single week.
- **We can't cleanly attribute the win to any single change.** The improvement started with the 5/31 cohort — *before* several changes landed. Candidate causes, all plausibly contributing: (a) paid ads turned off mid-May, so trials reverted to high-intent organic users (March organic cohorts already converted at 28–43%); (b) Pro re-gating on 6/3; (c) the value-anchored paywall on half of traffic since 6/3; (d) Backstory giving trials more value; (e) measurement fixes making everything visible. The intent-mix reversal (a) is probably the biggest single factor and the post is more credible admitting it.
- **The paywall A/B is still not significant.** 88.9% chance-to-win ≠ a win. Decision date ~7/31.
- **What we planned but didn't move: onboarding abandonment.** Still ~42% (58.4% completion, unchanged since 5/29) despite the friction A/B. The biggest remaining leak.
- **Late-June momentum has a traffic confound**: CashStash TikTok sponsorship went live 7/3 (July 2 web spike: 1,956 users in a day, ~15–20× baseline; installs +51% WoW week of 6/28). That flatters MRR/installs — it does *not* explain the conversion-rate gains, which predate it.
- Churn ticked up (4.76% weekly wk 6/28 vs 3.59% baseline) as the big new cohorts hit first renewals — watch, not alarming. The June 11 deep-dive found 41/41 churned payers were monthly, median tenure 31 days.

## 5. Context the writer may want

- **Why conversion collapsed in the first place** (from State of Growth 5/29): March = few, warm, organic trials converting ~36–43%. April–May scaled volume with ~$5,674 of paid (TikTok/ASA/Reddit) whose cohorts converted and retained worse; blended conversion halved. CAC was ~$110–114/payer vs $18 LTV — deeply underwater, so paid was killed. That decision is prologue to this post (and is already covered in the published "I Spent $5,674 on App Ads" post — link it, don't re-tell it).
- **What this unlocks**: at ~44% conversion and $27–31 realized 30d LTV, the don't-do-list gate on paid ads (trial-conv ≥ ~30%) is cleared for the first time — a small capped ASA re-test (~$200) is under consideration for August after July cohorts confirm. Good forward-looking ending.
- **Targets**: 2-month target ($850 by 7/13) was hit 8 days early ($884 on 7/5). Growth since 6/2 rebaseline ≈ 6.4%/wk sustained, all organic.
- **Retention was never the problem** — W1 ~28–32%, W4 ~9.5%, at/above H&F benchmarks throughout. The post should resist the generic "we improved retention" framing; this was a conversion story.

## 6. Format / voice notes for the writing agent

- Category: **Founder story** on the gainframe.app blog (see existing grid — e.g. "I Spent $5,674 on App Ads. Here's Why I Stopped." / "In-App Surveys Got 189 Responses. My Cancel Emails Got Zero.").
- Use the `mike-writes` skill (Michael's build-in-public voice) and `blog-post-generator` for the pipeline.
- Title: flat and declarative with a real number; **no** AI-slop hooks ("Here's exactly what worked", "real numbers inside"). Candidates in the right shape:
  - "My Trial Conversion Was Half the Industry Median. Five Weeks Later It Isn't."
  - "Trial Conversion: 21% to 44% in Five Weeks, $0 Ad Spend"
  - "The First Fix Wasn't the Paywall. It Was the Analytics."
- Strong narrative beats: (1) analytics missing 80% of conversions — a one-character API-key bug (`phx_` vs `phc_`) as the opening confession; (2) discovering we'd accidentally *removed* our biggest paywall surface in April; (3) the honest "we can't fully take credit — turning off bad ads did some of this."
- Numbers to render as a table in the post: the before/after table (§2) and the weekly cohort series (§2).
