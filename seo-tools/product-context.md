# GainFrame — Product Context

> **Last updated:** 2026-04-25
> **Refresh cadence:** Quarterly, or whenever a major product change ships (new tier, removed feature, audience pivot, brand refresh).
> **Consumed by:** `keyword-discovery`, `competitor-discovery`, `competitor-scan`, `blog-post-generator`, `comparison-article-generator`
> **Operational metrics (MRR, conversion, ASA performance) live in:** `../gain-frame/app-marketing-context.md`

---

## Implementation Override (read this first)

GainFrame is an **iOS-only solo-developer project**. Body composition is estimated from photos via **Google Gemini AI** — this is **NOT direct measurement** like DEXA or BIA scales. Photos are sent to Gemini for inference but **never persisted on any server**; results are stored on-device via SwiftData with no account required.

Free tier hard-caps at **25 photos lifetime** (not a trial — a permanent ceiling). Pro is **$5.99/mo or $39.99/yr** via RevenueCat.

GainFrame sits at the intersection of **two competitor classes** that an article writer might confuse:
- **AI body composition apps** (trackBod, Spren, BodyScan/FitnessAI) — these compete on AI/scoring accuracy
- **Progress photo apps** (Progress by Lasmit, PhotoJourney, Shapez, Snapsie) — these compete on photo storage / side-by-side comparison

GainFrame competes with both. Articles should never describe GainFrame as exclusively one or the other — its unique position is doing both AND adding the camera-roll-import + future-physique-prediction features that no competitor in either class has.

Built specifically for **serious gym-goers (intermediate lifters, 18-35)** — NOT casual fitness users, NOT general weight-loss audiences. Voice should be gym-native.

---

## Tagline & Pitch

- **Tagline:** *See your gains, frame by frame.*
- **Elevator pitch:** *See what your mirror can't tell you.*
- **Web hero (alternate):** *The AI body composition app. See the body you're building.*
- **Compressed:** *The AI body composition app for gym-goers.*

---

## Category & Platform

- **App Store primary category:** Health & Fitness
- **App Store secondary category:** Photo & Video
- **Marketing positioning:** AI body composition app for serious gym-goers
- **Platform:** **iOS only** — no Android port planned, opted out of Mac and Vision Pro
- **App Store ID:** 6759252082
- **Bundle ID:** `com.gainframe.GainFrame`
- **Website:** https://gainframe.app
- **Launched:** 2026-03-11

---

## Target Audience

**Primary (where 80% of marketing should aim):**
- Serious gym-goers, 18-35
- Intermediate lifters, natural bodybuilders, recomp-focused trainees
- Already users of Hevy / Strong / JEFIT for workout tracking — track lifts but lack visual progress tracking
- Take gym selfies regularly but rarely revisit / organize them

**Secondary:**
- Anyone on a body recomp / muscle gain / weight loss journey who wants measurable progress beyond the scale
- People with months-to-years of accumulated camera roll gym photos with no way to compare them

**Psychographic signals:**
- Values consistency and measurable progress over motivation
- Trusts data + AI but expects on-device privacy
- Wants to share transformations but cares about face-blur / background-removal options

---

## Features (8)

1. **AI Deep Dive** — Tap any photo to get a comprehensive AI report: physique score (1-100), body fat %, BMI, FFMI, lean mass, 12 individual muscle group scores (Needs Work → Developing → Strong), posture/symmetry analysis, and calculated daily macro targets.

2. **AI Deep Dive Compare** — Select two photos for a side-by-side breakdown with body fat delta, weight delta, FFMI shift, per-muscle-group progression, and a shareable comparison card.

3. **Future Physique** — Pick a pose and a 3/6/12-month timeline. AI generates a projected image of your future physique with predicted stats and trajectory.

4. **Smart Import** — Select hundreds of photos from your camera roll. AI classifies each by pose (Front, Back, Side, Flexed, Custom) and sorts chronologically. Non-body photos auto-skipped.

5. **Compare with Precision** — Side-by-side or swipe-slider comparison with auto body alignment (no tripod). Stats overlay (weight, body fat %, AI score) directly on each photo. Smart filters surface Most Improved, Peak Physique, and Best vs. Worst.

6. **Throwback** — Auto-selected best Then-vs-Now pair with body fat / weight / score deltas and a one-tap shareable card.

7. **Ghost Overlay Camera** — Transparent overlay of your last photo on the live viewfinder so you match your exact pose without a tripod.

8. **Privacy & Sharing** — Built-in face blur, background removal, transformation collages, and shareable analysis cards. All exports are watermark-free for Pro users.

---

## Integrations

- **Apple Health (HealthKit)** — weight chart sync, height, DOB, workout data
- **Hevy (workout API)** — workout volume (exercises, sets, reps, total tonnage) auto-attached to that day's photo
- **Google Gemini** — vision + physique scoring (the AI engine)
- **Apple Vision + Google MLKit** — on-device pose detection, face detection, segmentation
- **WidgetKit** — iOS home screen widgets
- **RevenueCat** — subscription management

---

## Pricing Tiers

| Tier | Price | Key inclusions / limits |
|---|---|---|
| **Free** | $0 | Up to **25 photos lifetime** (hard cap, not a trial). Camera capture, manual import, grid/timeline, basic compare. **No AI Deep Dive, no Future Physique, no album sync.** All exports carry a watermark. |
| **Pro Monthly** | **$5.99 / mo** | Unlimited photos, AI Deep Dive Reports, Future Physique Prediction, Album Sync, watermark-free exports |
| **Pro Yearly** | **$39.99 / yr** | Same as Monthly, ~44% cheaper per month |

**Notes:**
- Free tier is gated by *lifetime total photo count*, not by feature usage trials
- Watermarks are always applied on free, never on Pro
- Reels feature currently disabled behind a feature flag (do not mention as live)

---

## Differentiators (5)

These are verifiable, specific capabilities that competitors do NOT have. Use them in comparison articles and feature framing.

1. **Camera roll import with AI pose classification** — Every other progress-photo and body-comp app makes you start from scratch. GainFrame imports your existing camera roll, auto-classifies each photo by pose (Front/Back/Side/Flexed), and skips non-body photos. **No competitor in either class (AI body comp OR progress photos) does this.**

2. **AI body composition from a single selfie — no tripod required** — Competitors like Progress AI Timelapse literally show floor markings and tripod legs in their screenshots. GainFrame uses ML-based auto-alignment so any existing gym selfie or mirror shot becomes a usable progress photo.

3. **AI-generated Future Physique prediction** — Pick a pose + 3/6/12 month timeline. AI generates a *projected image* of your future body with predicted body fat, FFMI, weight, and per-muscle trajectory. **Zero competitors offer this feature.**

4. **12 muscle group scores with progression labels** — Each muscle group rated Needs Work → Developing → Strong, with sub-group granularity (Upper vs. Lower Chest, Front vs. Rear Delts). Most competitors give a single body fat number or no muscle-level analysis at all.

5. **Hevy workout integration** — Workout volume from Hevy (exercises, sets, reps, total tonnage) auto-attaches to the photo taken that day. **Zero competitors integrate with workout tracking apps.** This is a unique loop: photo + same-day workout context.

---

## Honest Limitations (5)

These are GainFrame's truthful limitations. Use them in content for E-E-A-T credibility — honest hedging beats overselling.

1. **iOS only — no Android port planned.** Solo dev. Web-only and Android users have to look elsewhere.

2. **AI estimates, not clinical measurements.** Body fat %, BMI, FFMI, muscle scores are approximations from a vision model. Within ~2-4% of DEXA for most users — but **not a medical device**. Should not be used for diagnosis or treatment.

3. **Photos are sent to Google's Gemini API for inference.** They are never stored on any server (no cloud sync, no account required) but they DO leave the device temporarily during analysis. Users who want pure on-device AI should know this upfront.

4. **Free tier hard-caps at 25 photos lifetime.** This is a permanent ceiling, not a free trial. Serious users hit this fast and need Pro to continue.

5. **New product (43 days live as of 2026-04-23).** Smaller review count than older competitors (Progress by Lasmit has 9.1K reviews; PhotoJourney has 88; GainFrame has 20). Trust signal is still being built — content should not pretend the app has a years-long track record.

---

## Brand Voice

1. **Confident, not hype-y.** Data-driven claims with specific numbers. Avoid "amazing", "revolutionary", "game-changing" and motivation quotes.

2. **Gym-native vocabulary.** Use lifter language: poses, macros, recomp, FFMI, cut/bulk, RIR, time under tension. Avoid generic fitness language ("get fit", "burn fat", "tone up").

3. **Privacy-forward.** "Your photos stay on your device" is treated as a first-class feature, not a footnote. Mention privacy posture explicitly in any post that touches data handling.

4. **The recurring theme:** *"You did the hard work, the AI reveals the data."* The user is the hero; the AI is the instrument. Never frame the AI as the hero.

5. **Honest about limitations.** Use hedged language for accuracy claims ("studies generally report...", "within ~2-4% of DEXA") rather than absolute claims. This is on-brand AND a Helpful Content guideline win.

---

## Team / Founder

**Michael Rode** — solo founder and builder. Senior software engineer with 15 years in backend / devops, 20 years of lifting experience. GainFrame is a one-person side project.

Supporting collaborator: **Alan** — UX research, surveys, demo videos.

Use this for credibility framing in posts where founder bona fides matter (e.g. "Built by an engineer who lifts" / "Made by a lifter, not a fitness brand"). Do not embellish — solo dev is a strength when honestly framed (focused product, no enterprise bloat) but a limitation when articles imply team scale.

---

## Sources

| Field | Source(s) |
|---|---|
| Implementation override | Synthesized from `app-marketing-context.md` + `paid_vs_free_tier.md` + `seo-tools/competitor-research/_identified-2026-04-25.md` |
| Tagline + pitch | `../gain-frame/app-marketing-context.md` (line 43-44) + `../gain-frame/docs/app_description.md` (line 11) |
| Category + platform | `../gain-frame/app-marketing-context.md` (lines 17-19) |
| Target audience | `../gain-frame/docs/app_description.md` (lines 18-37) |
| Features | `../gain-frame/docs/app_description.md` (lines 41-123, condensed from 10 to 8) |
| Integrations | `../gain-frame/app-marketing-context.md` (lines 156-162) + `../gain-frame/docs/app_description.md` (lines 114-118) |
| Pricing | `../gain-frame/docs/paid_vs_free_tier.md` (entire file) |
| Differentiators | `../gain-frame/docs/app_description.md` (lines 127-143) + `../gain-frame/docs/competitive_analysis_modern.md` |
| Honest limitations | `../gain-frame/docs/aso-metadata.md` (line 78-79 disclaimer) + `../gain-frame/app-marketing-context.md` (line 140 constraints) + `../gain-frame-privacy/index.html` FAQ (Gemini disclosure) + `paid_vs_free_tier.md` (free tier limits) |
| Brand voice | `../gain-frame/app-marketing-context.md` (lines 46-47) + `../gain-frame/docs/app_description.md` (lines 184-188) |
| Team / founder | `../gain-frame/app-marketing-context.md` (line 138) + product knowledge of solo founder |

---

## Refresh log

- **2026-04-25:** Initial creation. Sources scanned: `app-marketing-context.md`, `app_description.md`, `paid_vs_free_tier.md`, `aso-metadata.md`, `competitive_analysis_modern.md`, `index.html`. Synthesized 10 features → 8, 13 differentiators → 5, multiple disclaimers → 5 honest limitations. No conflicts requiring user resolution.
