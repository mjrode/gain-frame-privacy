# The GainFrame Playbook — Source Doc (2026-07-10)

Master inventory of every tool, service, pipeline, and strategy behind GainFrame,
compiled from deep sweeps of `gain-frame` (iOS app), `gain-frame-privacy` (marketing site),
and the global Claude Code skills/automation setup. This is the raw material for:

1. Blog post: "The playbook I use to run a profitable iOS app in 2026"
2. Long-form X post (role + stack format)
3. Infographic (flywheel diagram)

---

## The one-line thesis

Solo founder + Claude Code agents = a full company org chart. Every "department"
is a skill or pipeline. The differentiator isn't any single tool — it's that the
departments feed each other (analytics → content ideas → traffic → revenue →
analytics) and the founder only does taste, decisions, and posting.

---

## 1. DEV — building the app

**Core stack**
- Swift 5 / SwiftUI, iOS 17+, iPhone + iPad. Strict concurrency (`complete`).
- SwiftData for persistence (photos via `@Attribute(.externalStorage)`).
- XcodeGen (`project.yml` is source of truth; `.xcodeproj` untracked).
- CocoaPods + SPM, fastlane via Bundler (Ruby 3.4).
- Apple frameworks: HealthKit (weight/BF/workouts/sleep/HRV/VO2), Vision,
  AVFoundation camera, WidgetKit + App Intents, push, BackgroundTasks,
  Sign in with Apple, universal links.

**On-device AI**
- Google MLKit: PoseDetectionAccurate, SegmentationSelfie, FaceDetection.
- Apple Vision for image analysis.

**AI backend (Supabase)**
- 30 Deno edge functions; 24 SQL migrations.
- `coach-chat`: streaming Gemini with 17 function-calling tools (metrics, photo
  scores, Hevy workouts, Strava activities, image gen, physique projection, memory).
- Reports v2 pipeline (9 generate-* functions + cron + worker queue).
- All model tiers on `gemini-3.5-flash` (moved off 3.1-pro: 35–44s → 10–15s).
- Gemini is the ONLY LLM in the app. Claude is the dev/ops layer, Gemini the product layer.
- `cost-alert-cron` watches AI spend; a scheduled Claude agent runs a "prompt diet"
  analysis pulling per-module prompt instrumentation from PostHog (coach ≈ $257/mo).

**Quality / QA**
- Crashlytics (dSYM upload script) + Firebase Analytics.
- 53 XCTest files (logic/engine heavy: scoring, coach tools, recovery engine).
- RocketSim CLI + `verify-on-sim` skill: Claude builds, installs, launches, and
  DRIVES the app in the simulator to prove features work (not just green builds).
- `release-test-plan` skill generates manual QA checklists per version.
- GitHub Actions CI on edge functions only (lint/typecheck + prompt-size ratchet).

**Release automation**
- fastlane lanes: `beta` (TestFlight), `release`, `bump` (version+tag), 
  `sync_metadata` (all 9 locales), `upload_screenshots` (auto-mirrors en-US→GB/AU,
  es-ES→MX), match code signing (certs repo).
- `/release` slash command: detects new-release vs follow-up build, drafts release
  notes from git log, bumps, tags, ships. One command = App Store submission.
- `/issues` slash command: GitHub Issues as the work tracker (P0–P3 + theme labels);
  `/issues next` picks top-priority and starts working it.

**AI-assisted dev setup**
- CLAUDE.md + AGENTS.md encode architecture rules, design system, build rules.
- ~60 iOS capability skills (healthkit, swiftdata, swiftui-*, storekit, etc.).
- MCP servers wired into the repo: PostHog, GA4, Supabase, RocketSim/argent.

---

## 2. REVENUE — monetization & pricing

- **RevenueCat** (SDK 5.x): entitlement "GainFrame Pro", monthly + yearly,
  yearly has 7-day free trial (monthly does not).
- Paywall variants: standard (trial-timeline-led) vs challenger (per-month price
  anchor) — plus contextual paywalls (Deep Dive, muscle scores, chapter).
- **Live pricing experiment**: RevenueCat "Higher Price" experiment running
  (90-day window in dashboard).
- **revenuecat-webhook edge function → Slack**: real-time alerts for
  INITIAL_PURCHASE / RENEWAL / CANCELLATION / BILLING_ISSUE / paywall exits.
  Enables "founder DMs churned users" play.
- **`revenuecat` skill**: Claude queries RC v2 REST API directly (no CSV exports).
- **`mrr-audit` skill**: recurring audit pulling RevenueCat + PostHog + GA,
  compared against indie-sustainable targets ($850 → $1.6K → $3K → $6K MRR at
  1/3/6/12 months). Writes dated reports to `docs/audits/mrr/`.
- Claude analyzes the numbers and helps make calls (e.g., trial re-gating,
  paywall A/B priorities, kill-paid-ads decision).

**Numbers bank (pulled live from RevenueCat 2026-07-10)**
- MRR: **$943** (live). Weekly trend: $631 → $649 → $652 → $685 → $797 → $864 → $944
  (weeks of 5/25 → 7/6). **+45% in the past month.** ARR run-rate ≈ $11.3K.
- **203 active subscriptions**, **30 active trials**.
- Last 28 days: $2,917 revenue, 1,101 new customers, 1,464 active users.
- Trial→paid: 20.7% → 44% (46 of 104 trials) in 5 weeks, $0 ad spend.
  (Blog post published: trial-conversion-21-to-44)
- 4.9★, launched March 11 2026.
- Re-pull on publish day: `python3 ~/.claude/skills/revenuecat/scripts/rc.py metrics`

---

## 3. MARKETING — content & distribution

**The website (gainframe.app)**
- Next.js 16 static export on Cloudflare Pages ($0 hosting). Push to main = deploy.
- Landing page + `/get` conversion page with LIVE stats (Cloudflare Function pulls
  App Store rating via iTunes API + lifter count via PostHog HogQL, 6h edge cache).
- Promo video: paid a Reddit motion designer **$49** — beat the founder's own
  screen recording. (Published blog post: paid-49-for-promo-video)

**Free tools (engineering as marketing)**
- 11 free tools: AI body-fat-from-photo scanner (backed by public `bf-estimate`
  edge function, rate-limited 1/day/fingerprint) + 10 calculators (TDEE, macro,
  FFMI, one-rep-max, strength standards, calorie deficit, etc.).

**Blog / build-in-public**
- 141 MDX posts. Founder-story engine: `founder-posts` skill generates
  metric-dense build-in-public posts + companion Reddit posts with matplotlib charts.
- `mike-writes` skill = voice profile (flat declarative titles, no AI-slop hooks);
  `humanize` + `ai-check` skills strip AI tells before publishing.
- Reddit = founder-story distribution (r/SideProject, r/iOSProgramming,
  r/EntrepreneurRideAlong).

**TikTok / Instagram (3 deterministic pipelines, ~$0.04/slide)**
- `/tiktok`: "GainFrame Guy" mascot comics — Gemini Nano Banana draws ONLY the
  mascot art; ALL text composited deterministically with Pillow (zero styling
  drift, raw art cached for free re-compose). 156 carousels made, ~88 posted.
  Plug cadence: GainFrame mentioned 1-in-3 carousels, final slide only.
- `/tiktok-apps`: app-listicle carousels, 100% Pillow, real App Store assets via
  iTunes API. GainFrame planted mid-list (#3–4) among Strava/Hevy so it reads as
  an established peer.
- `/instagram-panel`: myth-bust + contrast "debate-bait" panels (best performer:
  question-fear hooks like "WILL CARDIO KILL YOUR GAINS?").
- All pipelines sync finished slides to iCloud → TikTok-Drafts for manual posting.

**UGC / creators**
- TikTok creator brief prepared (docs/marketing/tiktok-creator-brief.md).
- "Founding Creator" application program running (inbound: @devontecycles).
- Loom clipping workflow for creator content.

**X (@GainFrameApp)**
- `gainframe-tweets` skill: drafts build-in-public posts from git commits +
  releases + RevenueCat revenue, in founder voice. Audience = indie devs.

**Email**
- Resend: trainer waitlist → Resend Audience + notify email (B2B "AI Body Scans
  Your Clients Will Trust" waitlist page). Unsubscribe page + email-unsubscribe
  edge function + send-email pipeline with cron.

**Paid ads (the graveyard — a key story)**
- Total ~$5,674 over 3 months: TikTok $1,881, Apple Search Ads $2,498 (443
  installs, $5.64 CPI), Reddit $1,295 (~0 tracked conversions).
- CAC ~$114/payer vs LTV $18 → all paid killed after May 10.
- Growth reverted to organic floor, then compounded via SEO + TikTok.
  (Published post: spent-5k-on-app-ads)

**ASO**
- fastlane metadata in 9 locales, keywords field tuned, screenshot sets per locale
  auto-mirrored. ASO skill library (aso-optimize, aso-full-audit, aso-competitor,
  market-movers, market-pulse chart tracking).
- Name: "GainFrame: Gym Progress Photos" / Subtitle: "AI Body Fat Tracker & Coach".

---

## 4. SEO — the compounding channel

- **Workflow (5-stage skill pipeline, $0 tool spend — no Ahrefs/SEMrush):**
  product-context → competitor-discovery → competitor-scan → keyword-discovery
  (free signals: Google autocomplete + SERP + GSC via MCP; appends TODO_SEO.md
  backlog) → blog-post-generator OR comparison-article-generator.
- 148 indexable URLs (141 posts + 11 tools + landing pages). Topical map maintained.
- Proven winners: roundups ("best X") + "[Competitor] vs GainFrame" comparisons
  drive clicks; informational posts pull impressions only (AEO/zero-click).
- Core money cluster: AI body-fat estimation (hub post ~170 clicks/wk).
- Organic traffic 15x in 90 days (published post: organic-traffic-15x-90-days).
- GSC via MCP: Claude pulls trend/queries/movers, cross-references site changes.
- Discipline rules (learned the hard way): measure before iterating (no metadata
  touches within 7–10 days), verify indexing before writing more, programmatic
  SEO explicitly rejected ("no AI-slop page factories").

---

## 5. ANALYTICS — measurement layer

- **PostHog** (app + web, dual-tracked with GA4 since Jul 8): funnels, retention,
  DAU/WAU/MAU, feature flags, session tracking. North Star dashboard checked daily.
- **GA4**: website property + app property. **GSC**: search performance.
- **Slack alerts** (#posthog-alerts, #gainframe-feedback): website download
  clicks, BF scanner runs, RevenueCat purchase/churn events, in-app feedback bot.
- **Supabase**: survey_responses table = ground truth for surveys (PostHog
  surveys UI captured only 47%).
- **Durable analytics store in-repo** (`analytics/`): dated raw pulls from
  RevenueCat, PostHog, GA4, GSC, App Store Connect CSVs, ad-spend exports +
  industry benchmarks + synthesis docs. Claude reads/writes it every audit.
- **Measurement-first doctrine**: found PostHog missed ~80% of trial conversions
  (RC cache edges unobservable) → fixed instrumentation BEFORE optimizing.
  "Fix measurement first" is the repeated lesson.
- Crisp (support chat) + Featurebase (public feature-request board) close the
  qualitative loop.

---

## 6. THE AGENT LAYER (the actual unlock — "other")

- Claude Code is the operating system: ~30 custom skills across content, SEO,
  social, revenue, dev, QA. Each is a hiring decision that didn't happen.
- The org chart framing:
  - Chief of SEO: keyword-discovery + blog-post-generator + GSC MCP
  - Head of Content: tiktok/tiktok-apps/instagram-panel pipelines
  - CFO: mrr-audit + revenuecat skills
  - Release manager: /release + fastlane
  - QA engineer: verify-on-sim + RocketSim
  - Data analyst: PostHog/GA4/GSC MCPs + analytics store
  - Ghostwriter: mike-writes + founder-posts + gainframe-tweets
- Scheduled agents: nightly "prompt diet" cost-optimization routine (PostHog
  instrumentation → Gemini cost cuts).
- MCP backbone: PostHog, Supabase, GSC, GA4, Slack, Firebase, RevenueCat (REST).
- Determinism doctrine: where AI output quality drifts (slide text), replace the
  AI with code (Pillow) and keep AI only for what it's uniquely good at (art, prose).

---

## Story bank (published posts to link/reference)
- spent-5k-on-app-ads ($5.7K paid ads → CAC $114 vs LTV $18 → killed paid)
- trial-conversion-21-to-44 (measurement fix + paywall work, $0 spend)
- organic-traffic-15x-90-days (SEO compounding)
- paid-49-for-promo-video ($49 Reddit freelancer beat DIY)
- two-months-launching-second-app

## Blog post skeleton (suggested)
1. Hook: the numbers (MRR trajectory, 4 months in, solo, ~$X/mo total tool spend)
2. The org chart: every department is an agent
3. Dev stack (ship fast, verify on sim, one-command releases)
4. Product AI (Gemini everywhere, cost discipline)
5. Growth: what failed ($5.7K ads) → what worked (SEO + TikTok factories + free tools)
6. Revenue ops (RevenueCat + Slack alerts + audits)
7. Measurement doctrine (fix tracking first)
8. The actual playbook checklist (numbered, stealable)

## Caveats before publishing
- Rotate/scrub secrets in gain-frame repo before any screenshots (Slack token in
  project.yml, PostHog bearer in .mcp.json, gemini-api-keys.txt, Firebase admin JSON).
- Refresh MRR/sub numbers on publish day via mrr-audit (numbers above are from
  6/28 audit and 7/7 brief).
- ~2.3x double-count trap in ASA search-terms exports; use campaign-level totals.
