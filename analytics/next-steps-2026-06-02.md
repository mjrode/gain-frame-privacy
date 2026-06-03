# GainFrame — Next Steps (2026-06-02)

**Purpose**: hand-off document to continue the growth work in a new chat session. Self-contained — read this top-to-bottom and you have everything you need. Sister document to [state-of-growth-2026-05-29.md](./state-of-growth-2026-05-29.md), which is the canonical source of truth for the underlying analysis.

**Status as of 2026-06-02 (Tuesday)**:
- MRR: $659.48 (was $530.73 on 5/13 — up 24% in 20 days, but rate decaying to ~4-5%/wk post-paid)
- Active subs: 127
- Active trials: 23
- ARPU: $5.19/sub/mo (was $5.31, slight slip)
- Weekly churn: 3.59% (= ~14.4% monthly = ~85% annual) — slightly above H&F median of 10-13% monthly
- Goal table v3 in `~/.claude/skills/mrr-audit/config/targets.json` — 1mo $725/$800, 12mo $3.5K/$7K (indie-sustainable band $3-10K MRR)

**The binding constraint**: trial→paid conversion is **20.7% blended** (Apr-May ~15%), declining from 36-43% in March. Industry H&F median is **39.9%**. Closing this gap roughly doubles subscriber yield from existing traffic. Every action below either fixes this directly or unblocks measuring it.

**What we will NOT do**:
- Restart paid ads (true CAC $110 vs LTV $18 — deeply underwater)
- Over-invest in retention features (already at/above benchmark)
- Ship more sticky features (Coach + Monthly Reports are great but only 25-30% / 3-7% of subs ever use them — discovery problem, not roadmap problem)

---

## Three priorities for the next 2-4 weeks

Sequenced because Priority 1 is the prerequisite for Priorities 2-3 to be meaningfully measurable.

### 🚨 Priority 1: Diagnose 42% onboarding abandonment

**Why this first**: this leak is measurable today with existing PostHog instrumentation. No prerequisite work. And the 42% abandonment is the largest single leak in the entire funnel.

**Current state**:
- Install → Onboarding completed: **57.9%** (1,002 of 1,729 in 90d window)
- Onboarding → Paywall viewed: 28.6%
- Paywall → Trial started: ~13%
- Trial → Paid: 20.7%

So we lose 42% of installs before they even see the paywall. If we lift onboarding completion from 58% to 70%, that's 12 percentage points of installs that flow into the rest of the funnel — a ~20% lift on every downstream metric, free.

**How to diagnose**:

Run this PostHog query for the last 60 days, filtered to non-test accounts:

```
query-trends with event = onboarding_step_viewed
breakdown by `step_name` or `step_index` property
math = unique users
interval = day or week (whichever shows trend cleaner)
```

Then separately, query `onboarding_abandoned` with the same breakdown — that surfaces explicit abandons (vs silent drop-offs).

**What we're looking for**:
1. **The cliff**: which step does the user drop-off rate jump? Look at unique-users-by-step. If step 3 has 1,200 viewers and step 4 has 600, that's the cliff.
2. **Time on step**: pair with `onboarding_step_time` to see if the abandoned step is also the longest-dwell step. Long dwell + high abandon = frustration. Short dwell + high abandon = users leaving without engaging.
3. **Abandonment source**: which `onboarding_attribution_selected` value (organic vs paid source) has the worst completion? If paid TikTok cohorts abandon more, that's intent-quality not UX.

**Definition of done**:
- A ranked list of the 3-5 worst-performing onboarding steps with quantified drop-off
- Hypothesis for each one (UX friction? Slow load? Confusing copy? Permission prompt fatigue?)
- A specific fix or A/B test variant for the worst step

**Expected impact if fixed well**: lifting onboarding completion from 58% → 70% adds ~12 points of throughput to every downstream metric. At current install volume (~150/wk organic), that's ~18 extra users per week reaching the paywall.

**Estimated effort**: 2-3 hours of PostHog analysis. Fix implementation depends on what's found.

---

### 🧪 Priority 2: A/B test the paywall

**Why this**: 13% paywall→trial conversion is the second measurable pre-trial leak. Even +3 percentage points = +23% more trial starts.

**Current state**:
- Of 495 users who viewed paywall (90d), only ~66 started a trial
- We don't know which paywall element is the bottleneck — needs structured testing

**What to test (pick ONE for the first test, then iterate)**:

#### Test A: Trial length — 7 days vs 14 days
- Hypothesis: longer trial = more time to find value = higher trial→paid even if more "tire kickers" start
- Variant A (control): 7-day trial
- Variant B: 14-day trial
- Primary metric: trial→paid conversion (RC)
- Secondary: trial-start rate from paywall view (PostHog)

Industry data: H&F top performers run 5-9 day trials. 14d is outside that range, so this test might HURT trial→paid. Consider it speculative.

#### Test B: Annual-first vs Monthly-first emphasis
- Hypothesis: leading with annual locks in retention (annual sub LTV ~2.5x monthly), but monthly may feel less commitment
- Variant A (control): current paywall layout
- Variant B: annual plan shown first/larger, with "save X%" badge
- Primary metric: trial→paid conversion at 7 days
- Secondary: % of paid subs on annual (ARPU mix)

#### Test C: Social proof copy
- Hypothesis: adding specific user numbers/results lifts trust
- Variant A (control): current paywall copy
- Variant B: same but with "Used by 1,700+ lifters tracking their progress" + a real before/after collage
- Primary metric: paywall→trial-start rate
- Secondary: trial→paid

**Recommended first test**: **Test C (social proof)**. Lowest risk, fastest to ship, doesn't affect billing logic. If wins, you bank the lift and move on to Test B.

**Sample size math**:
- Current paywall views: ~55/week
- Current paywall→trial rate: 13%
- To detect a lift from 13% → 18% with 80% power, p<0.05: need ~440 paywall views per arm = ~16 weeks of data at current volume
- **Way too slow.** Need to either: (a) lower bar to 80% power / p<0.10, (b) pool tests across multiple weeks at less granularity, or (c) skip stat-rigor and just go on directional signal after 2-3 weeks

**Practical recommendation**: run the test with ~4 weeks of data, accept "directional" rather than "statistically significant" results, and treat lifts >2 percentage points as wins. Indie apps don't need conference-paper rigor.

**Definition of done**:
- One concrete variant shipped behind a feature flag
- 4 weeks of data collected
- Clear winner declared OR concluded "no detectable difference, try next test"

**Estimated effort**: 1-2 hours to design + spec, 3-5 hours to build (depending on paywall infrastructure), 4 weeks to collect data.

**BLOCKED BY**: needs RC → PostHog working (priority 0) to measure trial→paid downstream of the variant. Until that's fixed, you can measure paywall→trial-start in PostHog but not trial→paid, and the latter is the metric that matters most.

---

### 🧪 Priority 3: A/B test Coach surfacing during trial

**Why this**: Coach has the strongest correlation with retention in our data (58-81% W1 retention among Coach users vs 17-30% baseline). The State of Growth doc explicitly flagged this as the highest-impact activation test to run.

**Critical caveat**: this correlation is NOT proven causation. Coach users may simply be the most motivated users to begin with. The whole point of this A/B test is to **prove or disprove that surfacing Coach causes higher conversion + retention.**

**Current state**:
- Coach launched 2026-05-06
- Adoption peaked at 52% of paying subs in launch week, settled at 25-30% steady state
- 74-78% of trial/subscription starters never touch Coach
- Coach users send 7-10 messages/week (high stickiness once activated)

**Test design**:

- **Variant A (control)**: current trial onboarding — Coach is discoverable but not pushed
- **Variant B**: on Day 1 of trial, push Coach as the "next thing to try" with a guided first message (e.g., "Try asking the Coach: 'How am I doing?' — it'll analyze your photos and give you a real answer")
- **Primary metric**: trial→paid conversion at 7 days (measured via RC, not PostHog `trial_converted` until that's fixed)
- **Secondary metrics**:
  - % of trial users who fire `coach_message_sent` within 24h of trial start (target: ≥50% in variant B vs ~25% in control)
  - W1 retention for trial users (target: variant B ≥ control + 5 points)
- **Sample size**: at ~50 trial starts/week, with 25% baseline Coach activation in control, detecting a doubling to 50% in variant B requires ~80 trials per arm = ~4 weeks

**Mechanic to implement**:
- Feature flag on `trial_started` event firing
- 50/50 split (control vs prominent Coach push)
- Variant B: trigger a one-time modal/screen on first app open after trial starts, prompting them to try the Coach with a suggested first question

**Definition of done**:
- Feature flag deployed
- 4 weeks of data collected on both arms
- One of three outcomes:
  1. **Coach drives conversion**: lift of ≥5 points in trial→paid → roll out variant B, double-down on Coach in marketing
  2. **Coach drives retention but not conversion**: lift in W1/W4 retention but not trial→paid → keep variant B for retention value, but don't rely on it for revenue forecasts
  3. **No detectable lift**: either Coach isn't the lever we hoped, or surfacing matters less than usage quality → move on, focus on Priority 1 + 2

**Estimated effort**: 1-2 hours to design + spec, 4-6 hours to implement the trial-day-1 prompt, 4 weeks to collect data.

**BLOCKED BY**: needs RC → PostHog working (priority 0) for clean trial→paid measurement, OR fallback to comparing RC's trial-converted count by feature-flag variant.

---

## Reference materials

All of these should be read before starting on the priorities above:

| File | What it has |
|------|-------------|
| [state-of-growth-2026-05-29.md](./state-of-growth-2026-05-29.md) | Canonical analysis: paid attribution (3 channels, $5,674 spend), retention vs benchmark, trial conv collapse, channel-level CAC math. **The single most important doc.** |
| `~/.claude/projects/-Users-michael-rode-code-project-gain-frame/memory/project_mrr_goal_model.md` | v3 goal table, what to do / what not to do, paid-channel facts |
| `~/.claude/projects/-Users-michael-rode-code-project-gain-frame/memory/project_feature_adoption_baseline.md` | Coach + Monthly Reports adoption baseline (2026-06-02) |
| `~/.claude/skills/mrr-audit/config/targets.json` | Machine-readable v3 targets + "explicit don't do" list |
| `~/.claude/skills/mrr-audit/SKILL.md` | The audit runbook itself — Step 4 references the State of Growth doc as canonical |
| `~/.claude/skills/revenuecat/scripts/rc.py` | RC v2 API client (now supports `metrics` and `chart` commands) |
| `raw/2026-05-29/` (in this repo) | Raw data exports underlying the State of Growth doc |

---

## Open questions / decisions needed

Things the user must answer before some of the priorities can move:

### Q1: Is the RC → PostHog integration fixed?

**Diagnosed 2026-06-02**: RC was firing events correctly (correct names, full payload). PostHog rejected with 401 "API key is not valid: personal_api_key" — the API key in RC was a PostHog Personal API Key (`phx_`) but the `/capture` endpoint requires a Project API Key (`phc_`).

**Fix in progress**: replace the API key in RC dashboard → Integrations → PostHog with the Project API Key (PostHog → Settings → Project → "Project API Key", starts with `phc_`). Save. New events flow within minutes.

**Caveat**: failed events from the past 20 days won't backfill — RC gives up after 6 retries. Forward-flowing data starts the moment the key is fixed.

**Once flowing, the payload is high-quality**: includes `rc_subscription_status` as a `$set` person property (enables instant Pro-only cohort filtering), `entitlement_ids`, `product_id`, `currency`, `revenue`, `period_type` (TRIAL vs NORMAL), and `$appsflyerId` for cross-tool joining. Sufficient for any trial-conversion-driver analysis without needing app-side instrumentation changes.

**Until this is fixed, Priorities 2 and 3 can be DESIGNED but not properly MEASURED downstream.** Priority 1 (onboarding diagnosis) doesn't need this.

### Q2: How willing is the user to ship code at the rate priorities require?

The user is on a full-time job, doing GainFrame nights/weekends. Estimated total effort across Priorities 1-3:
- Priority 1: 2-3 hours analysis + variable fix time (probably 2-4 hours)
- Priority 2: 1-2 hours design + 3-5 hours build + 4 weeks data
- Priority 3: 1-2 hours design + 4-6 hours build + 4 weeks data

Total upfront: ~15-25 hours of focused work, then mostly waiting. If user can do ~5-10 hrs/week on GainFrame, plan is to land all three within 4 weeks.

### Q3: Should we revise the goal table again before next audit?

v3 targets re-baselined to organic compounding on 2026-06-02. If Priorities 1-3 land and trial→paid moves materially, we should revise UP. If they don't move the needle in 4-6 weeks, we should revise DOWN further.

Decision point: next audit run (2026-06-09 if weekly cadence holds).

### Q4: What's the contingency if RC → PostHog cannot be fixed?

Alternative paths:
- AppsFlyer has `rc_trial_converted_event: 12` already flowing (per 2026-05-13 dashboard check). Could use that as the conversion source instead of PostHog if the RC integration stays broken.
- RC v2 charts API gives aggregate trial conversion rates but not per-user attribution — fine for the audit, not fine for A/B test measurement.
- Could write our own RC webhook → PostHog Capture API bridge (small Vercel/Lambda function). ~2 hours of engineering, complete control. Bookmarked as Plan C if RC's native integration can't be made to work.

---

## How to resume in a new chat

Paste this into the new session as the opening prompt:

> I want to continue the GainFrame growth work. Please read these in order before doing anything:
> 1. `~/code/project/gain-frame-privacy/analytics/next-steps-2026-06-02.md` (this doc — the plan)
> 2. `~/code/project/gain-frame-privacy/analytics/state-of-growth-2026-05-29.md` (the analysis behind the plan)
> 3. `~/.claude/projects/-Users-michael-rode-code-project-gain-frame/memory/project_mrr_goal_model.md` (goal table + don't-do list)
> 4. `~/.claude/projects/-Users-michael-rode-code-project-gain-frame/memory/project_feature_adoption_baseline.md` (Coach + Monthly Reports baseline)
>
> Then tell me where we are on Priority 1, 2, and 3, and what the next action is.

That's enough context for a fresh session to pick up cold without re-deriving anything.
