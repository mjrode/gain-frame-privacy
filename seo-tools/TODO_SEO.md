# SEO Content Backlog

This file tracks keyword targets for blog posts and comparison articles. Items are added by the `keyword-discovery` skill and consumed by `blog-post-generator` and `comparison-article-generator`.

**Format:** `- [ ] keyword (volume-tier/difficulty, downstream-skill) — added YYYY-MM-DD — source: seo-tools/keyword-research/[file]`

When a post is published, replace `[ ]` with `[x]` and append ` — published YYYY-MM-DD as /blog/[slug]/`.

## Backlog (priority order)

> **🧹 BACKLOG RESET — 2026-06-28.** Everything below this line was closed in a clean-slate reset. Most items were genuinely shipped/published; the remaining open `[ ]` items (stale CTR tweaks, monitor gates whose windows passed, manual GSC indexing tasks, internal-link refreshes) were marked `[x]` to clear the slate — **do not assume each was individually executed.** New work lives in the **ACTIVE** section directly below. If an old item still matters, re-add it to ACTIVE with fresh data.

---

## ACTIVE (fresh start 2026-06-28)

### September 6: ten sourced articles

[Intent boundaries and original-evidence status](keyword-research/2026-09-06-blog-ownership.md). These are sourced evaluations; earlier first-person testing gates remain open and should enrich the same URLs.

- [x] **weight watchers body scanner**: sourced article written September 6, 2026 as `/blog/weight-watchers-body-scanner-review/`.
- [x] **zozofit review**: sourced article written September 6, 2026 as `/blog/zozofit-review/`.
- [x] **gravl app review**: sourced article written September 6, 2026 as `/blog/gravl-app-review/`.
- [x] **evolt 360 body scan accuracy**: sourced article written September 6, 2026 as `/blog/evolt-360-body-scan-accuracy/`.
- [x] **oxiline scale review**: sourced article written September 6, 2026 as `/blog/oxiline-scale-review/`.
- [x] **hume vs renpho**: sourced article written September 6, 2026 as `/blog/hume-vs-renpho/`.
- [x] **cronometer vs macrofactor**: sourced article written September 6, 2026 as `/blog/cronometer-vs-macrofactor/`.
- [x] **arboleaf scale review**: sourced article written September 6, 2026 as `/blog/arboleaf-scale-review/`.
- [x] **styku body scan accuracy**: sourced article written September 6, 2026 as `/blog/styku-body-scan-accuracy/`.
- [x] **bodyspec review**: sourced article written September 6, 2026 as `/blog/bodyspec-review/`.


> **📍 Topical map lives at `seo-tools/topical-map.md`** (created 2026-07-07) — check the cluster + gap list there BEFORE adding new keyword targets here. Programmatic SEO explicitly deferred by owner.


**Direction:** roundups are the proven traffic winners; the generic body-comp roundup space is saturated/cannibalizing, so new bets must be either (a) **"[brand] alternatives" roundups** — roundup format + net-new brand-intent query, or (b) **genuinely uncovered "best X" sub-niches** we have no page for. Comparisons/reviews are net-new but ~15–30× lower volume per post → secondary.

### Brand-"alternatives" roundups (roundup format + brand intent; need competitor-scan first)

- [x] **Best InBody Alternatives (at-home / app)** — **published 2026-06-28 as /blog/best-inbody-alternatives/** — 7-entry roundup across 3 categories (AI photo apps, at-home BIA scales, DEXA). GainFrame-first as the zero-hardware/free option, honest that BIA scales (Hume ~$229 closest, Withings ~$400–500 premium) and DEXA (~$100–200) win on direct measurement/accuracy; Tanita/Omron budget BIA; SKOR as the cross-platform photo-app peer (represented honestly). Verified prices via fresh research (InBody home Dial H20N/H30 ~$240–380). FAQPage + BlogPosting + BreadcrumbList schemas. Distinct from /blog/dexa-scan-alternative/ (DEXA) — this owns InBody/BIA intent. Cross-links to dexa-scan-vs + dexa-scan-alternative + best-body-composition-apps + best-ai-body-fat-apps + what-is-ffmi. Build verified, in sitemap. Cover generated. Correct App Store ID id6759252082.
- [x] **Best ZOZOFIT Alternatives** — published 2026-07-02 as /blog/best-zozofit-alternatives/ (see Jul 2 entry below). — added 2026-06-28
- [x] **Best Bodygram Alternatives** — CLOSED 2026-07-02 without a post (brand pivoted B2B); covered as FAQ in /blog/best-body-scanning-measurement-apps/. — added 2026-06-28
- [x] **Best LeanLens Alternatives** — published 2026-07-09 as /blog/best-leanlens-alternatives/ (LeanLens verified as web-based free analyzer, represented fairly). LeanLens.ai is a *direct* AI-body-fat-from-photo competitor (same lane as GainFrame), so this is the strongest brand-"alternatives" fit of the set — GainFrame slots in honestly as a peer AI-photo option, not a hardware/scale outsider. Run `/competitor-scan leanlens.ai` first (⚠️ leanlens.ai is blocked by this session's egress policy — do the scan in a session with network access). — added 2026-07-01 — source: user suggestion (leanlens.ai/blog)

### Uncovered "best X" sub-niche hunt (validate SERP + no self-cannibalization before writing)

- [x] **Niche-gap analysis** — done 2026-06-28. Findings: (1) **"best cutting apps"** SERP is nutrition/macro-dominated (MacroFactor, MyFitnessPal, Nutrola) + workout trackers — GainFrame is a weak fit (we don't do macros/workouts); SKIP as head term. (2) **"best abs/six-pack apps"** SERP is entirely ab-WORKOUT apps (6 Pack Promise, Six Pack in 30 Days) — wrong lane (we don't program workouts); SKIP. (3) Conclusion: the body-comp roundup category is well-covered; adjacent niches skew to workout/nutrition intent (not our lane). **The genuinely winnable net-new roundup is the brand-"alternatives" angle → InBody (below).**
- [x] **[VALIDATED] Best InBody Alternatives = confirmed top net-new roundup** — done 2026-06-28. Live SERP = smart scales (Withings, Hume Health Body Pod, Omron, Tanita) + DEXA + **a competitor app roundup (SKOR/joinskor.com) that already ranks positioning AI-photo as the at-home InBody alternative**. Proves intent + that an AI-photo app belongs in this SERP. Angle: "Best InBody Alternatives (2026)" ranking the scales/DEXA honestly + GainFrame as the zero-hardware at-home AI-photo option. Distinct from existing /blog/dexa-scan-alternative/ (that's DEXA; this is InBody/BIA). Profile SKOR + the scales before writing.

### Uncovered "best X" sub-niche — body scan / measurement gap

- [x] **Best Body Scanning & Measurement Apps** — **published 2026-07-02 as /blog/best-body-scanning-measurement-apps/** — combined roundup targeting "best body scan app" (was pos 25) + "best body measurement app" (was pos ~10, no dedicated page). 6 entries across 3 categories: AI photo (GainFrame visual-change lane, Recomp AI), 3D scan (MeThreeSixty free, ZOZOFIT $3.99/mo suit-free), manual trackers (Progress, My Body Measurement Tracker). Honest that GainFrame doesn't log circumferences. Bodygram excluded (pivoted B2B) — doubles as competitor research for the Bodygram-alternatives backlog item. FAQPage + HowTo + BlogPosting + BreadcrumbList schemas. Internal links added FROM best-ai-body-fat-apps, best-body-fat-scanner-apps, best-inbody-alternatives (anti-orphaning). Also linked TO best-ai-personal-trainer-apps (striking-distance boost, pos 16.8 after Jun 18 fix — do NOT touch its metadata again yet, links only). — added+published 2026-07-02

### Jul 7 batch — 6 posts (brand lanes + 2 net-new audiences)

- [x] **Best Renpho Alternatives** — published 2026-07-07 as /blog/best-renpho-alternatives/ — 700K-rating scale brand; BIA-frustration angle, InBody template. — added+published 2026-07-07
- [x] **Apps Like Umax** — published 2026-07-07 as /blog/apps-like-umax/ — face-vs-physique pivot (Umax is face-first, 51K ratings); captures "physique rater"/"body rater" queries (22 imp). — added+published 2026-07-07
- [x] **Ray Fitness App Review** — published 2026-07-07 as /blog/ray-fitness-app-review/ — already pulled 16 imp @ pos 10.4 with no page; Ray is small (236 ratings), consistent with gainframe-vs-fitbod-ray-gymstreak framing ("Ray coaches in real time"). — added+published 2026-07-07
- [x] **Spren vs GainFrame** — published 2026-07-07 as /blog/spren-vs-gainframe/ — completes Spren cluster ("what is spren" 15 imp pos 9.8); consistent with spren-app-review verdict. — added+published 2026-07-07
- [x] **Hevy vs Strong** — published 2026-07-07 as /blog/hevy-vs-strong/ — net-new top-of-funnel lifter audience (78K vs 108K rating apps); GainFrame mentioned once via Hevy integration. — added+published 2026-07-07
- [x] **Best GLP-1 Muscle Tracking Apps** — published 2026-07-07 as /blog/best-glp1-muscle-tracking-apps/ — roundup on existing GLP-1 cluster; YMYL-hedged, "talk to your prescriber" framing throughout. — added+published 2026-07-07

### Outside-the-box queue (informational keyword targets — next batch candidates)

- [x] **Average body fat percentage by age (men & women)** — published 2026-07-07 as /blog/average-body-fat-percentage-by-age/ — TOP PICK: high-volume informational head term; UNIQUE asset fit — the body-fat-visualizer has age-varied renders (20s–60s) nobody else has, same play that took body-fat-percentage-chart from pos 43→10. AEO/stats-page magnet. — added 2026-07-07
- [x] **Average waist size for men (by age/height)** — published 2026-07-07 as /blog/average-waist-size-men/ — stats-page format; feeds shoulder-to-waist + measurement cluster. Validate SERP first. — added 2026-07-07
- [x] **"Dad bod body fat percentage"** — published 2026-07-07 as /blog/dad-bod-body-fat-percentage/ — playful definitional + visualizer renders; debate-bait shareability (TikTok crossover potential). Validate volume. — added 2026-07-07

### Aug 2 cycle — self-assessment lane (seo-content-cycle run)

- [x] **Do I Look Fat? (honest self-assessment)** — published 2026-08-02 as /blog/do-i-look-fat/ — targets "do i look fat" (480 vol, +1312%/yr, KD 10, LeanLens gap) + "am i fat ai" long-tail already hitting the site; visualizer renders; body-image-sensitive framing with NEDA pointer. — source: seo-tools/content-audits/2026-08-02.md
- [x] **Body Composition Pictures gallery** — published 2026-08-02 as /blog/body-composition-pictures/ — 12 standardized renders (male 8–33%, female 18–42%); targets "body composition pictures" (260, KD 10, LeanLens rank 13); framed as example gallery to avoid cannibalizing body-fat-percentage-chart. — source: same audit
- [x] **Fixes:** am-i-skinny-fat-quiz render treatment + how-to-tell-if-skinny-fat folded in w/ 301 (zero imp in 28d) — 2026-08-02; ideal-body-measurements-women retitled to "Averages, Ratios & What They Mean" + average-measurements H2 (was surfacing for "average measurements for women" at pos ~12) — 2026-08-02
- [x] **HOLD/NO-GO: "rate my body" sibling post** — closed 2026-08-18. Query×page showed `rate-my-physique` (12c pos 8.4), `/tools/physique-rater/` (6c pos 4.8), and `ai-physique-rating-apps` already splitting the family; AI variants resolve to the tool. Next move is F3 CTA swap on Aug 21, not a third URL. — added 2026-08-02

### Aug 6 cycle — body-visualizer opportunity (seo-content-cycle run)

- [x] **Body Visualizer tool** — shipped 2026-08-06 as `/tools/body-visualizer/` — targets `body visualizer` (40,500 volume, +22%, KD 4–8) and the ~86K height/weight/BMI visualizer family while preserving `/tools/body-fat-visualizer/` for its proven body-fat intent. Interactive adult BMI result, male/female standardized reference sets, explicit non-predictive limitations, FAQ/WebApplication schema, tool-directory and calculator cross-links, sitemap entry, and App Store CTA. — source: `seo-tools/content-audits/2026-08-06.md`
- [x] **F1: interactive waist-to-height-ratio calculator** — shipped 2026-08-06 on `/blog/waist-to-height-ratio/`; keeps title/metadata, adds height + waist unit conversion, exact result bands, validation, and accessible live results. Baseline: position 13.2 / 2,542 impressions on a 12,100-volume +49% keyword. — source: same audit
- [x] **F3: topical-map backfill** — completed 2026-08-06; exhaustive reconciliation classified all 82 omitted Jul 9–23 parallel-session posts and corrected stale gaps that pointed at already-live pages. — source: same audit
- [ ] **HOLD: menopause body-composition visual/PAA expansion** — reassess only after `/blog/menopause-body-composition/` clears the 30-impression reliability threshold; current exhaustive report is 15 impressions (2026-08-07). — added 2026-08-06

### Aug 7 cycle — chart revert + WHR calculator (seo-content-cycle run)

- [x] **F1: revert Jul 18 chart CTR title test** — shipped 2026-08-07 on `/blog/body-fat-percentage-chart/`; test failed (0.52% CTR post-change vs ~0.7–1.0% before at unchanged position ~11); restored control title "Body Fat Percentage Chart with Photos: Visual Guide for Men & Women" + matching descriptions. New 7–10d window to ~Aug 17. — source: `seo-tools/content-audits/2026-08-07.md`
- [x] **F2: interactive waist-to-hip-ratio calculator** — shipped 2026-08-07 on `/blog/waist-to-hip-ratio/`; waist+hip inputs, in/cm conversion, men's/women's cutoff toggle, bands matching the post's chart. Baseline: pos 14.7 / 871 imp on 18,100-vol flat head term. Directional read ~Aug 17, full ~Sep 4. — source: same audit

### Aug 9 cycle — gallery links + Thelo review (seo-content-cycle run)

- [x] **F1: /body-fat/ gallery internal links** — shipped 2026-08-09; the 14-page gallery had zero blog-content inbound links despite ~2,758 imp at pos 8–17. Added contextual links from 8 Cluster-2 posts (body-composition-pictures, average-body-fat-percentage-men/-women/-by-age, dad-bod-body-fat-percentage, what-would-i-look-like-with-less-body-fat, body-fat-visible-jawline-men, do-i-look-fat). `body-fat-percentage-chart` deliberately excluded until its revert window closes ~Aug 17 — add its link then. — source: `seo-tools/content-audits/2026-08-09.md`
- [x] **F3: "body scan app" anchors → best-body-scanning-measurement-apps** — shipped 2026-08-09 from best-body-fat-scanner-apps, are-smart-scales-accurate, best-inbody-alternatives, methreesixty-vs-gainframe (720 vol KD 16 transactional; hub at 6.8). No metadata touched. — source: same audit
- [x] **P1: Thelo App Review** — published 2026-08-09 as /blog/thelo-app-review/ — "thelo app reviews" 65 imp @ 6.5 served only by the track-body roundup; competitor profile at seo-tools/competitor-research/thelo.md (4.6★/1,338, $9.99wk–$59.99yr + à-la-carte scans, no published validation, ex-Swoosh). Inbound links from best-ai-fitness-apps-track-body, ray-fitness-app-review, best-ai-personal-trainer-apps. — source: same audit
- [ ] **APPROVED, GATED: F2 fold best-ai-body-composition-app into best-body-composition-apps (301)** — owner approved 2026-08-09 conditional on re-verification with post-Aug-11 GSC data (available ~Aug 13). Evidence at approval: 42→15 clicks; loser ranks 41–50 on the shared "body composition app" family vs winner at 7.4; unique keywords micro-volume. Re-verify, then ship. — added 2026-08-09

### Aug 11 cycle — smart-scale / RENPHO series (seo-content-cycle run 2)

- [x] **Are Smart Scales Worth It (lifter angle)** — published 2026-08-11 as /blog/are-smart-scales-worth-it/ — targets "are smart scales worth it" (210, +91%/yr, KD 12) + pros/cons + "how do smart scales work" long-tail; AEO pros/cons blocks matching the live AI Overview shape; owner-supplied RENPHO/Apple Health screenshots. — source: seo-tools/content-audits/2026-08-11.md (run 2)
- [x] **Best Smart Scales That Sync With Apple Health** — published 2026-08-11 as /blog/best-smart-scales-apple-health/ — targets the apple-health scale family (~930/mo combined, KD 1-8, declining; strategic-fit bet stated honestly); 5 first-class entries (Withings/Wyze/Eufy/RENPHO/Etekcity) with iTunes-verified companion-app ratings + real screenshots; post-sync GainFrame section. — source: same audit
- [x] **RENPHO + GainFrame integration guide** — published 2026-08-11 as /blog/renpho-gainframe-integration/ — Integration (Cluster 13) product-education page mirroring hevy-app-gainframe-integration; HowTo + FAQ schema; destination for the in-app "RENPHO Setup Guide" row; ~40/mo keyword ceiling acknowledged. — source: same audit
- [x] **F1: retitle best-body-composition-scales** — shipped 2026-08-11 — now "Best Smart Scales for Body Composition in 2026 (6 Ranked)"; chases "best smart scale" (5,400, +23%/yr, KD 4) + "best body composition scale" (4,400, +24%, KD 3) proven one-SERP; added Apple Health sync section + P1/P2/P3 links; new 7-10d metadata window to ~Aug 21. — source: same audit
- [x] **F2: renpho-scale-review refresh** — shipped 2026-08-11 — accuracy-focused H2 ("Is the Renpho scale accurate?", 880 vol KD 3, page was 16-31 @ 748 imp / 0 clicks), new Apple Health/GainFrame integration section with Integrations screenshot, Apple Health FAQ swap, description update; new 7-10d window to ~Aug 21. — source: same audit
- [x] **F3: scale-lane interlinks + strict-gate cleanup** — shipped 2026-08-11 — contextual links added FROM tape-measure-vs-smart-scale (→ worth-it), withings-body-scan-review + hume-body-pod-review (→ apple-health roundup), best-renpho-alternatives (dash cleanup only); all 4 source posts + all touched posts now pass the strict no-long-dash gate (~150 legacy dashes removed, 234→228 sitewide). are-smart-scales-accurate deliberately untouched (Aug 9 anchor window, add its P1 link ~Aug 19). — source: same audit

### Aug 13 cycle — merges + ratio calculator + ab analyzer (seo-content-cycle run)

- [x] **M1: 301 best-ai-body-composition-app -> best-body-composition-apps** — shipped 2026-08-13 (approved Aug 9, gate-verified: loser 1c/131i/pos 18.1 last 7d vs winner 7c/851i/9.1). Inbound links repointed in 11 posts, mdx + legacy docs HTML removed, assets kept. — source: `seo-tools/content-audits/2026-08-13.md`
- [x] **F1: shoulder-to-waist ratio calculator** — shipped 2026-08-13 on `/blog/shoulder-to-waist-ratio/`; bands match the post's published chart (men <1.3/1.3-1.44/1.45-1.54/1.55-1.617/1.618+, women 1.3-1.4 zone), in/cm toggle, golden-ratio waist target, tests in waist-percentiles.test.mjs. No metadata change. Baseline: pos 7.0-8.7 / 924 imp on 1,000-vol head + 170-vol +24% calculator term. Directional read ~Aug 23. — source: same audit
- [x] **F2: 301 smart-integrations-hevy -> hevy-app-gainframe-integration** — shipped 2026-08-13 (carried from Aug 11 proposal, owner approved `all`). Album Sync section grafted onto survivor (dash-free rewrite), 4 inbound sources repointed, reciprocal link removed, legacy docs HTML removed, assets kept serving. — source: same audit
- [x] **NEW TOOL: /tools/ab-analyzer/** — shipped 2026-08-13 per owner directive. Photo -> 1-100 ab score (Hidden/Emerging/Visible/Defined/Shredded), upper/lower/oblique reads, estimated BF range, hedged months-to-visible-abs timeline. Supabase fn `ab-analyze` (physique-rate skeleton, `ab:` salts, physique_rate AI route reused, flow label ab-analyze); events ab_tool_requested/scored/cta_click + server ab_tool_analysis_completed; targets "do i have abs" (260, +529%/yr), "six pack calculator" (90+90, KD 5-6, thin-tool SERP), timeline FAQs (6,600+2,400 family); inbound links from how-long-to-see-abs, why-do-abs-only-show-when-flexing, why-abs-show-in-some-lighting; sitemap + tools index registered. 28d window opens ~Sep 10. — source: same audit

### Aug 14 cycle — Hume family + bump fixes (seo-content-cycle run)

- [x] **F1: hume-body-pod-review content strengthen** — shipped 2026-08-14. Subscription/pricing section (verified ~$229 / optional ~$9.99mo premium), alternatives table, 2 FAQ updates w/ schema sync, review-intent anchors from are-smart-scales-worth-it + renpho-scale-review (best-body-composition-scales already had one). Baseline: rank 17-23 on 65K/mo family (hume body pod 27.1K KD 1, hume pod 8.1K +4525%, hume health review 8.1K +312%). — source: `seo-tools/content-audits/2026-08-14.md`
- [x] **OPEN: Hume retitle decision ~Aug 19** — superseded 2026-08-17: title decided and approved; ships Aug 19 (see Aug 17 F2). — added 2026-08-14
- [x] **F2: average-waist-size-women size-8 chart section** — shipped 2026-08-14 (retitle proposal was moot — title already led with the head term since Jul 16). Dress-size ↔ waist chart + FAQ + dash cleanup; no metadata change. Targets "waist size for size 8" 1,600 KD 17 @ rank 12. — source: same audit
- [x] **F3: ideal-body-measurements-men bodybuilding-measurements section** — shipped 2026-08-14. Exact-phrase H2 + FAQ + SWR calculator link + dash cleanup. Targets "bodybuilding measurements" 8,100 KD 4 @ 15, "bodybuilding measurement chart" 3,600 KD 5 @ 12. — source: same audit

### Aug 17 cycle — experiment audit + chart gallery link (seo-content-cycle run)

- [x] **F1: chart -> gallery links** — shipped 2026-08-17 (the piece deferred from Aug 9 while the revert window ran). Hub + 15/25% male + 25/35% female links after each render section on `body-fat-percentage-chart`; body-only long-dash cleanup (frontmatter deliberately untouched to preserve the keep-control CTR baseline recorded this run). — source: `seo-tools/content-audits/2026-08-17.md`
- [ ] **APPROVED, SCHEDULED Aug 19: Hume retitle** — owner approved 2026-08-17; ships when the metadata window opens Aug 19. New title: "Hume Body Pod Review (2026): Accuracy, Price & Subscription" + description naming the subscription answer. Evidence: new section already ranks "subscription cost" @ 7 / "accuracy 2026" @ 8 / "price official 2026" @ 9 on the 65K/mo family. — added 2026-08-17
- Verdicts recorded this run: chart revert CLOSED (keep control, 0.60% CTR @ 9.3); WHR WIN (14.7->9.8); WHtR MIXED (imp 2.4x, pos 13.2->16.4, no action); women-chart overlap NOT FOUND (leave both); rate-my-physique sibling later flipped HOLD on 2026-08-18.

### Aug 18 cycle — tools/conversion review (seo-content-cycle run)

- [x] **F4: absmaxx-vs-gainframe inbound** — shipped 2026-08-18. Contextual in-body link from `recomp-ai-vs-gainframe` with anchor "AbsMaxx vs GainFrame" plus a Related Articles row. Source was outside its metadata window (dateModified 2026-07-02). — source: `seo-tools/content-audits/2026-08-18.md`
- [ ] **APPROVED, SCHEDULED Aug 19: F1 Hume retitle** — carried from Aug 17. Title → "Hume Body Pod Review (2026): Accuracy, Price & Subscription". Do not ship before Aug 19.
- [ ] **APPROVED, SCHEDULED Aug 19: F2 are-smart-scales-accurate → worth-it** — contextual in-body link to `are-smart-scales-worth-it` (excluded from the Aug 11 interlink batch while the Aug 9 window ran).
- [x] **F3: rate-my-physique CTA bridge** — shipped 2026-08-23. The 30-second CTA now points to `/tools/physique-rater/`; no sibling post was created.

### Aug 29 cycle — body-visualizer measurement + DEXA launch repair (seo-content-cycle run)

- [x] **F1: body-visualizer result instrumentation** — shipped 2026-08-29. Added one once-per-page `body_visualizer_result_shown` event after an interacted valid result. The event sends only unit system and reference sex; height, weight, BMI, image choice, and other health-sensitive inputs remain excluded. Generic completion, DOM completion, and shared CTA tracking are unchanged. — source: `seo-tools/content-audits/2026-08-29.md`
- [x] **F2: DEXA benchmark launch repair** — shipped 2026-08-29 on `/blog/ai-body-fat-estimator-accuracy-dexa-test/`. All five FAQ schema entries now match the visible FAQ exactly, two reader-visible long dashes were normalized, and the CTA now uses the canonical GainFrame App Store URL. Benchmark claims, values, metadata, assets, and targeting are unchanged. — source: same audit
- [ ] **APPROVED, BLOCKED: ZOZOFIT Review 2026** — no draft or URL until three controlled app-only scans, matching tape readings, setup/failure notes, current screenshots, and a first-person test interview exist. Approval does not waive the evidence contract. — source: same audit

### Aug 30 cycle — body-proportion tool truth repair (seo-content-cycle run)

- [x] **F1: correct body-proportion tool descriptions** — shipped 2026-08-30 on `/blog/how-to-take-body-measurements/` and `/blog/best-body-scanning-measurement-apps/`. Replaced false promises of seven tape inputs, five calculated ratios, and exact circumference benchmarks with the live photo-only workflow and explicit limitations. The measurement guide's 35 long dashes were normalized, and all five FAQ schema answers in the roundup now match the visible FAQ exactly. Titles, target keywords, and unrelated claims are unchanged. — source: `seo-tools/content-audits/2026-08-30.md`

### Sep 3 cycle — scanner pillars, Navy tool, and page-two support (seo-content-cycle run)

- [x] **P2: InBody vs DEXA** — published 2026-09-03 as `/blog/inbody-vs-dexa/`. Targets `inbody vs dexa` (720 US volume, KD 3); compares method, body-fat agreement, lean-mass output, conditions, cost, and repeat use with a first-party DEXA report asset and primary/official sources. Three contextual inbound links shipped in the same commit. — source: `seo-tools/content-audits/2026-09-03.md`
- [x] **P4: DEXA Scan Body Fat Percentage report guide** — published 2026-09-03 as `/blog/dexa-scan-body-fat-percentage/`. Existing first-party GE Lunar report pages cleared the asset gate. The guide covers total and regional fat/lean fields, android/gynoid ratio, VAT estimates, repeat-scan controls, and precision limits with institutional and primary sources. — source: same audit
- [x] **F1: U.S. Navy Body Fat Calculator retarget** — shipped 2026-09-03 on `/tools/body-fat-estimator/`. Title, H1, social metadata, WebApplication schema, limitations, and action copy now own the U.S. Navy tape-method intent; three relevant posts link contextually to it. The underlying formula is unchanged. — source: same audit
- [x] **F2: dormant/new tool discovery links** — shipped 2026-09-03. Added three contextual links each for FFMI Calculator, One-Rep Max Calculator, Progress Photo Compare, and Recomp Reality Checker, plus deeper support for Strength Standards. Target tool copy stayed stable outside the approved Navy retarget. — source: same audit
- [x] **F3: page-two content and link repairs** — shipped 2026-09-03. Rebuilt `/blog/how-long-does-body-recomposition-take/` with a 50-word Quick Answer, conservative review timeline, primary sources, and exact five-answer FAQ/schema; aligned the average-male-body-fat BlogPosting headline and added three contextual links; added chest/bicep links to Average Shoulder Width. — source: same audit
- [ ] **APPROVED, BLOCKED: WeightWatchers AI Body Scanner Review** — do not draft or create a URL until controlled first-party scans, current app screenshots, current subscription/price facts, privacy notes, and first-person setup/failure notes exist. Target: `weight watchers body scanner` (260, KD 17, +2,000% yearly). — added 2026-09-03 — source: same audit
- [ ] **APPROVED, BLOCKED: Evolt 360 Body Scan guide** — do not draft or create a URL until a real report/scan or documented first-person interview exists. Target: `evolt 360 body composition scanner` (390, +238% yearly). — added 2026-09-03 — source: same audit
- [ ] **APPROVED, BLOCKED: Body Fat Calipers guide** — require original technique/site-placement photos or video before pursuing this declining, product-heavy query (3,600, KD 8, -34% yearly). — added 2026-09-03 — source: same audit
- [ ] **APPROVED, SCHEDULED: Waist-to-Height Ratio metadata test** — ship only after Search Console exposes the first settled Sep 1+ row; the fresh Sep 3 API check still ended Aug 31. Proposed title: "Waist-to-Height Ratio Calculator & Chart: Is Yours Healthy?" — added 2026-09-03 — source: same audit
- [ ] **SCHEDULED Sep 6: average male body-fat title decision** — links and exact BlogPosting headline parity shipped Sep 3; test a new title only if the query remains reliably on page two after the measurement gate. — added 2026-09-03 — source: same audit

### Carry-forward (still genuine, re-added from reset — not yet done)

- [x] **Fold Snapsie into `/blog/best-progress-photo-apps/`** as the "best free option (not updated since 2017)" with the abandoned caveat — completed in the 2026-07-21 batch; verified during the 2026-08-06 topical-map reconciliation. — re-added 2026-06-28

---

## Archive (closed in 2026-06-28 reset — historical record)

### From: seo-tools/keyword-research/2026-04-25-visceral-fat.md

- [x] **visceral fat vs subcutaneous fat** (High/65, comparison-article-generator) — added 2026-04-25 — TOP PICK; Quora ranks in SERP signaling content gap; honest "what photos can/can't tell you" angle — published 2026-04-25 as /blog/visceral-fat-vs-subcutaneous-fat/
- [x] **visceral fat app** (Low-Med/70, blog-post-generator listicle) — added 2026-04-25 — only one dedicated app competitor in SERP; honest positioning post or "Best visceral fat tracking apps 2026" — published 2026-04-25 as /blog/visceral-fat-app/
- [x] Combined visual post: visceral fat appearance + hard belly + how to tell (Med/70-95, blog-post-generator) — added 2026-04-25 — honest "you can't see visceral fat directly, here's what you CAN learn" angle — published 2026-04-25 as /blog/visceral-fat-appearance/
- [x] visceral fat level (High/65, blog-post-generator) — added 2026-04-25 — pursue only if `visceral fat vs subcutaneous fat` lands — published 2026-04-25 as /blog/visceral-fat-level/
- [x] visceral fat test (Med/75, blog-post-generator) — added 2026-04-25 — pursue only after `visceral fat app` lands — published 2026-04-25 as /blog/visceral-fat-test/

### From: seo-tools/keyword-research/2026-04-25-body-composition-glossary.md

- [x] **what is ffmi** (Med/55, blog-post-generator) — added 2026-04-25 — TOP PICK; clean SERP (no Cleveland Clinic / WebMD / Healthline lockout); gym-native term GainFrame already uses in Deep Dive Report — published 2026-04-25 as /blog/what-is-ffmi/
- [x] **ffmi chart** (Med/50, blog-post-generator) — added 2026-04-25 — STRONG SECOND; lowest difficulty in the cluster; pair with "what is ffmi" pillar — published 2026-04-25 as /blog/ffmi-chart/
- [x] **lean mass vs muscle mass** (Med/60, comparison-article-generator) — added 2026-04-25 — comparison intent, clean SERP (fitness brands not health authorities); GainFrame angle: app reports both metrics — published 2026-04-25 as /blog/lean-mass-vs-muscle-mass/
- [x] **body fat percentage vs bmi** (Med-Hi/75, comparison-article-generator) — added 2026-04-25 — comparison intent; only Healthline as tier-1; lifter-audience angle ("BMI puts a 5'10\" 220lb lifter in 'obese' bucket") — published 2026-04-25 as /blog/body-fat-percentage-vs-bmi/
- [x] **PILLAR: Body Composition for Lifters: BMI, FFMI, Lean Mass, Body Fat % Explained** (Pillar post — queue AFTER 2-3 supporting posts above land; blog-post-generator) — published 2026-04-25 as /blog/body-composition-for-lifters/

### From: comparison-article-generator (no keyword-research source — strategic pick from competitor-research)

- [x] **Metamorph vs GainFrame** (anti-AI-privacy vs AI-powered comparison; uncontested SERP) — added 2026-04-25 — strategic pick; comparison-article-generator — published 2026-04-25 as `/blog/metamorph-vs-gainframe/`

## Skipped (do not pursue without backlinks)

Documented in source reports for future reference. Health-authority lockout makes these uneconomical without major DA:
- visceral fat percentage / range / measurement / healthy range / how to tell (standalone)
- visceral fat vs belly fat
- how to reduce visceral fat
- best visceral fat scale

### From: seo-tools/keyword-research/2026-04-25-recomp-natty-competitors.md

- [x] **Bulk vs Cut vs Recomp — decision guide** (High/30, blog-post-generator) — added 2026-04-25 — TOP PICK; covers "cut vs bulk vs recomp" + "body recomposition vs cutting"; Quora at #5 and #8-9 signal content gap; GainFrame angle: recomp tracking via photos is our differentiator; consolidates 3 related high-volume queries; links to body-composition-for-lifters + track-body-recomposition-photos — published 2026-04-25 as /blog/bulk-cut-or-recomp/
- [x] **How long does body recomposition take** (High/40, blog-post-generator) — added 2026-04-25 — published 2026-04-25 as /blog/how-long-does-body-recomposition-take/ — STRONG SECOND; no tier-1 authorities, supplement blogs only; featured snippet open territory with a month-by-month table; unique GainFrame angle (photo-based evidence at each stage)
- [x] **trackBod Review / trackBod vs GainFrame** (Low-Med/10, comparison-article-generator) — added 2026-04-25 — near-empty SERP (app listings + TikTok only); GainFrame's closest direct competitor; publish now to lock in ranking before brand grows; strategic funnel value — published 2026-04-25 as /blog/trackbod-vs-gainframe/
- [x] **Spren App Review: Accuracy, Cost & Comparison** (Med/20, comparison-article-generator) — added 2026-04-25 — Spren owns 8/10 SERP results with no independent reviews; covers "spren app review" + "how accurate is spren app" + "spren app cost"; instant trust gap opportunity for third-party review — published 2026-04-25 as /blog/spren-app-review/
- [x] **Natty Limit: How Big Can You Get Naturally?** (Med/25, blog-post-generator) — added 2026-04-25 — Quora + T-Nation forum signal content gap; gym-native audience; builds on existing FFMI posts (what-is-ffmi + ffmi-chart); differentiates from Outlift's FFMI post with photo-based evidence angle — published 2026-04-25 as /blog/natty-limit/

### From: seo-tools/keyword-research/2026-04-26-gsc-quick-wins.md

- [x] **Body Fat % for Visible Jawline Men** (Med/5, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/body-fat-visible-jawline-men/ — TOP PICK; SERP = Quora + TikTok + personal blogs; GainFrame angle: tracks BF% AND photo progress so you literally see your face change; suggested title: "Body Fat % for a Visible Jawline (Men): Targets by Face Type + How to Track It"
- [x] **How to Estimate Body Fat % from a Photo** (Med/25, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/how-to-estimate-body-fat-from-photo/
- [x] **Best Before-and-After Transformation Apps for Women** (Med/20, blog-post-generator listicle) — added 2026-04-26 — published 2026-04-26 as /blog/best-before-after-transformation-apps-women/
- [x] **Best AI Body Composition App** (Med/35, blog-post-generator listicle) — added 2026-04-26 — published 2026-04-26 as /blog/best-ai-body-composition-app/
- [x] **DEXA Scan Alternative for Body Composition** (Med-High/65, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/dexa-scan-alternative/ — distinct from dexa-scan-vs-ai-body-composition (narrative); this is buyer's guide covering all 6 alternatives with comparison table

#### CTR Fixes (existing posts — no new content needed)

- [x] **[CTR] `best-ai-body-fat-apps` title fix** — add "body AI" / "AI body" phrasing; 229 impressions at pos 6.2, 4.8% CTR — biggest absolute click opportunity — added 2026-04-26 — done 2026-04-26
- [x] **[CTR] `ai-body-editor-apps-vs-real-analysis` title fix** — front-load listicle pattern: "8 Best AI Body Editor Apps 2026 (+ The Honest Alternative)"; 62 impressions at pos 3.8, 0% CTR — added 2026-04-26 — done 2026-04-26 — 🔁 re-shipped 2026-05-11 with the missing count: "5 Best AI Body Editor Apps 2026 (+ the Honest Alternative)" (May GSC showed 6,322 imp at 0.74% CTR — original rewrite dropped the number)
- [x] **[CTR] `best-body-transformation-apps` title fix** — add "2026" + app count; 40 impressions at pos 10.8, 2.5% CTR — added 2026-04-26 — done 2026-04-26
- [x] **[CTR] `how-to-read-body-fat-from-photos` title + HowTo schema** — pos 2.8, 45 impressions, 0 clicks — title rewritten to "How to Estimate Body Fat % from a Photo: Visual Markers + AI Method" + HowTo schema added — done 2026-04-26 — 🗑️ post deleted 2026-05-11: title-rewrite created a duplicate `<title>` against the newer /blog/how-to-estimate-body-fat-from-photo/ post; 301-redirected old slug to newer canonical to stop SERP cannibalization

### From: seo-tools/keyword-research/2026-04-26-muscle-gain-tracking.md

- [x] **body transformation tracker app** (Med/20, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/body-transformation-tracker-apps/
- [x] **best app to track muscle gain** (High/45→15 w/angle, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/best-apps-track-muscle-gain/
- [x] **best app to track body composition + body composition apps** (Med/30, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/best-body-composition-apps/
- [x] **how to track muscle gain progress + how to track muscle mass at home** (Med/35, blog-post-generator) — added 2026-04-26 — published 2026-04-26 as /blog/how-to-track-muscle-gain-progress/

### From: seo-tools/keyword-research/2026-04-28-progress-photo-app-cluster.md

Cluster goal: strengthen pillar `/blog/best-progress-photo-apps/` (already ranking #1 for "best free progress photo app") with 6 supporting articles + 1 CTR fix.

- [x] **Best Free Progress Photo App** (Med/25, blog-post-generator listicle) — added 2026-04-28 — published 2026-04-29 as /blog/best-free-progress-photo-apps/
- [x] **Best Progress Photo App for iPhone** (Med-Hi/25, blog-post-generator listicle) — added 2026-04-28 — published 2026-04-29 as /blog/best-progress-photo-app-iphone/ — 🗑️ deleted 2026-05-11: 0 search data in 90 days, didn't earn its keep. 301'd to pillar `/blog/best-progress-photo-apps/`
- [x] **Best Gym Progress Photo App** (Med/25, blog-post-generator listicle) — added 2026-04-28 — published 2026-04-29 as /blog/best-gym-progress-photo-app/ — 🗑️ deleted 2026-05-11: only catching accidental brand traffic ("gainframe" 7 imp, "gainframe app" 8 imp) instead of gym-topical queries. 301'd to pillar.
- [x] **How Often Should You Take Progress Photos** (Med/30, blog-post-generator informational) — added 2026-04-28 — published 2026-04-29 as /blog/how-often-progress-photos/
- [x] **How to Take Progress Photos By Yourself (No Tripod)** (Med/35, blog-post-generator how-to) — added 2026-04-28 — published 2026-04-29 as /blog/take-progress-photos-by-yourself/ — wrote new post (not refresh) since existing how-to-take-progress-photos-fast is GainFrame product-promo focused; new post is generic 4-option workflow with GainFrame as Option 4
- [x] **How to Take Progress Photos for Weight Loss** (Med-Hi/40, blog-post-generator how-to) — added 2026-04-28 — published 2026-04-29 as /blog/how-to-take-progress-photos-weight-loss/

#### CTR Fixes (existing posts — no new content)

- [x] **[CTR] `body-transformation-tracker-apps` title fix** — pos 10.85 with 2.5% CTR for `body transformation app`; also ranking pos 11.7 for `ai body transformation app`, pos 17.3 for `best body transformation app`. Title rewritten to "Best AI Body Transformation Apps (2026): 6 Trackers Tested & Ranked" to capture all three queries. Done 2026-04-29.
- [x] **[Internal links] Pillar refresh** — `/blog/best-progress-photo-apps/` should add a "More on Progress Photos" section linking to each new supporting article as they land. Each supporting article should link UP to pillar with anchor "best progress photo apps" — added 2026-04-28

### From: seo-tools/keyword-research/2026-04-29-generative-engine-optimization.md

Cluster goal: capture the founder/marketer audience with a single pillar case study. GainFrame's defensible moat = real PostHog attribution data (chatgpt = 31%) + screenshot of #1 ChatGPT ranking. SERP is dominated by SEO-consultant speculation; we have actual results.

- [x] **how to rank in chatgpt** (Med/35, blog-post-generator) — added 2026-04-29 — TOP PICK for founder case study; LinkedIn-dominated SERP is winnable with original data + screenshots; bundle with `how to get cited by chatgpt` (Low-Med/15), `how to optimize content for chatgpt` (Med/25), `how to show up in chatgpt search results` (Med/30) as H2/H3s in a single pillar post. Glossary callout for `generative engine optimization` / `GEO vs SEO` / `AEO` / `LLM SEO` (do NOT compete on those head terms — Wikipedia/HBR/HubSpot/SemRush lockout). — published 2026-04-29 as /blog/generative-engine-optimization-case-study/

### From: seo-tools/keyword-research/2026-04-29-ai-fitness-cluster.md

Cluster goal: capture AI fitness search intent across two camps — workout planners (Fitbod/Ray category) vs body scanners (GainFrame category) — by positioning as "AI fitness apps that track the result, not the workout".

- [x] **Best AI Fitness Apps That Track Your Body** (Med-Hi/30, blog-post-generator listicle) — added 2026-04-29 — published 2026-04-29 as /blog/best-ai-fitness-apps-track-body/
- [x] **How to Use ChatGPT for a Workout Plan** (Med-Hi/50, blog-post-generator how-to) — added 2026-04-29 — published 2026-04-29 as /blog/chatgpt-workout-plan/
- [x] **Best AI Personal Trainer Apps (and the App That Tracks If They Work)** (Med/30, blog-post-generator listicle) — added 2026-04-29 — published 2026-04-29 as /blog/best-ai-personal-trainer-apps/

#### Refresh tasks

- [x] **[Refresh] `/blog/best-ai-body-composition-app/` — capture AI body scan queries** — title rewritten to "Best AI Body Scan & Body Composition App in 2026: Full Comparison"; new "What is an AI body scan?" H2 section added; 23 mentions of "body scan" / 14 of "AI body scan" sprinkled naturally; dateModified bumped to 2026-04-29; 3 new related article links added — done 2026-04-29

### From: seo-tools/keyword-research/2026-04-30-glp1-cluster.md

Cluster goal: claim the gym-native + body-composition-aware sub-niche of the GLP-1 audience before SKOR locks it down. Existing pillar `/blog/glp-1-muscle-loss-tracking/` becomes the cluster hub.

- [x] **Ozempic Before-and-After Photos for Men** (High/50, blog-post-generator how-to) — added 2026-04-30 — published 2026-04-30 as /blog/ozempic-before-and-after-photos-men/
- [x] **Ozempic and Bodybuilding: How to Cut Without Losing Muscle** (Med-Hi/55, blog-post-generator) — added 2026-04-30 — published 2026-04-30 as /blog/ozempic-bodybuilding-cut-without-losing-muscle/
- [x] **How to Track Body Composition on Ozempic (Beyond Just Weight)** (Med/60, blog-post-generator) — added 2026-04-30 — published 2026-04-30 as /blog/track-body-composition-ozempic/
- [x] **Best Apps to Track Weight Loss on Ozempic (2026)** (Med/45, blog-post-generator listicle) — added 2026-04-30 — published 2026-04-30 as /blog/best-apps-track-weight-loss-ozempic/

#### Refresh tasks

- [x] **[Refresh] `/blog/glp-1-muscle-loss-tracking/` — add "More on GLP-1" cluster hub section** — done 2026-04-30; renamed "Related Articles" → "More on GLP-1"; links DOWN to all 4 new GLP-1 posts at top; existing 4 related articles preserved below; dateModified bumped to 2026-04-30

### From: seo-tools/keyword-research/2026-05-06-ai-coach-trends-cluster.md

Cluster goal: capture the search audience evaluating "AI fitness coach" tools — lifters who could otherwise default to ChatGPT/Claude or generic AI fitness apps. Defensible angle is GainFrame's structural moat (Coach already knows your check-ins, sleep, HRV, Hevy, goal, persistent memory). Sleep + training-volume head terms are academic-locked and cannot be ranked head-to-head; they live as H2/H3 sub-topics inside cluster posts.

- [x] **AI Fitness Coach vs ChatGPT: When a Dedicated App Beats a General LLM (2026)** (Med/30, comparison-article-generator) — PILLAR — drafted 2026-05-06 as `/blog/ai-fitness-coach-vs-chatgpt/` (awaiting deploy). 3 screenshots from library v1.21 + Gemini-generated cover. 22.8K body chars, 3 JSON-LD schemas (BlogPosting + BreadcrumbList + FAQPage). Cites Time mag, Sport Fitness Apps benchmark (1/5 long-term tracking), GEO case study (31% PostHog stat). Honest framing on Correlation Insights: "Coach can answer the question in chat today, auto-card on the roadmap."
- [x] **Do AI Fitness Trainers Actually Work? An Honest Answer After Building One** (Med/55, blog-post-generator) — drafted 2026-05-06 as `/blog/do-ai-fitness-trainers-work/` (awaiting deploy). 76KB rendered HTML, 7-question FAQ + FAQPage JSON-LD, 3 inline screenshots from library v1.21 + Gemini cover. Founder-voice "I built one" angle; honest 3-things-that-work + 3-things-that-fail framing; cites Time mag + Sport Fitness Apps benchmark differently from pillar (focus on AI fitness apps in general, not ChatGPT specifically).
- [x] **Body Recomposition Tracker: How to Know Your Recomp Is Actually Working** (Med/30, blog-post-generator) — drafted 2026-05-06 as `/blog/body-recomposition-tracker/` (awaiting deploy). 71KB rendered HTML, 7-question FAQ + FAQPage JSON-LD, 3 inline screenshots (compare, muscle-map, weight-chart) + Gemini cover. "Tracker is a stack of four" framing; quick checklist in `<post-steps>` block; 2-4% AI-vs-DEXA hedged accuracy claim; cross-links to existing `/blog/how-long-does-body-recomposition-take/` and `/blog/bulk-cut-or-recomp/`.
- [x] **Personalized AI Fitness Coach: What 'Personalized' Should Actually Mean** (Med/40, blog-post-generator) — drafted 2026-05-06 as `/blog/personalized-ai-fitness-coach/` (awaiting deploy). 75KB rendered HTML, 7-question FAQ + FAQPage JSON-LD, 3 inline screenshots (ai-coach, day-checkin-score, macros) + Gemini cover. "Weak vs strong personalization" frame; 5 categories of data list; cluster cross-links to pillar + supporting #2 + Smart Hevy integrations post.
- [x] **AI Fitness Analysis: What It Is and What It Should Tell You** (Low-Med/10, blog-post-generator) — added 2026-05-06 — BONUS, ship only after pillar + 3 supporting are in flight; SERP is entirely small products and dev-shop blogs, no major brands, easy quick-win.

#### Refresh tasks (after cluster ships — DO NOT START until pillar + 3 supporting are live)

- [x] **[Refresh] `/blog/gainframe-coach/` — add "More on AI Coach" cluster hub section** — link DOWN to all 4 new cluster posts at top; bump dateModified
- [x] **[Refresh] `/blog/chatgpt-workout-plan/` — add link to new pillar** — related comparison content; bump dateModified
- [x] **[Refresh] `/blog/how-to-track-muscle-gain-progress/` — add link to body recomposition tracker post** — bump dateModified
- [x] **[Refresh] `/blog/best-apps-track-muscle-gain/` — add link to body recomposition tracker post** — bump dateModified
- [x] **[Refresh] `/blog/bulk-cut-or-recomp/` — add link to body recomposition tracker post** — concept post → tool post hand-off
- [x] **[Refresh] `/blog/generative-engine-optimization-case-study/` — add link to pillar** — the GEO case study is what gives the pillar its credibility; connect them

#### Deferred follow-ups (also save for after cluster + refresh tasks ship)

- [x] **Add `getrecomp.app` to next `/competitor-discovery` refresh** — surfaced 2026-05-06 during AI Coach cluster keyword research; positions as "Recomp - Body Recomposition Tracker | Progress Photos & AI Insights" — direct competitor with very close GainFrame positioning (AI insights + progress photos for body recomp). Run `/competitor-scan getrecomp.app` to generate full profile, then update `_identified-2026-04-30.md` baseline.
- [x] **GSC progress-photo ranking gap audit + internal-linking refresh** — surfaced 2026-05-06 during AI Coach cluster keyword research. Several queries rank position 25–46 with zero clicks despite impressions: `how to take progress photos` (pos 46.5, 10 impressions), `progress photo app free` (pos 9.57, 7 impressions), `progress photo app` (pos 25.25, 4 impressions). Existing posts (`best-progress-photo-app-iphone.mdx`, `best-free-progress-photo-apps.mdx`, `best-progress-photo-apps.mdx`, `5-tips-better-progress-photos.mdx`, `how-to-take-progress-photos-fast.mdx`) target overlapping phrases — likely need clearer internal linking + meta description tightening. Audit which post should own each query and tighten title/description + add cross-links. Not in AI Coach cluster scope.

### From: seo-tools/keyword-research/2026-05-11-ai-body-editor-recomp-coach.md

#### New posts (priority order)

- [x] ~~**AI Workout Apps That Scan Your Body**~~ — **SKIPPED 2026-05-12** — Phase 0 duplicate check during blog-post-generator run revealed direct cannibalization with `/blog/best-ai-fitness-apps-track-body/` (published Apr 29). That existing post already targets the exact query (`ai workout app that scans your body` is in its keywords and opening H2) and covers 5 of the 6 proposed apps (Thelo, Zing Coach, TrueForm AI, FitnessAI BodyScan, GainFrame) plus trackBod + ZOZOFIT. The May 11 research's "do not cannibalize" warning underestimated the overlap. Recommend instead: refresh the Apr 29 post if it underperforms on May 19 GSC re-pull (add Fitanalysis + Hevy-coupled angle + bump dateModified). — added 2026-05-11, skipped 2026-05-12
- [x] **AI Physique Assessment & Body Scanner Apps** (Med/30, blog-post-generator listicle) — **published 2026-05-12 as `/blog/ai-physique-rating-apps/`** with narrower scope than original spec — Phase 0 duplicate check found 4 existing body-comp-scanner listicles (`best-ai-body-composition-app`, `best-body-composition-apps`, `best-ai-body-fat-apps`, `best-ai-fitness-apps-track-body`) already owning the "body scanner" keyword space. Pivoted to rater-only angle (Galaxy.ai, AestheticRank, Rate My Physique, Aesthetics AI, BodyScore AI vs GainFrame) — distinct category from body-comp scanners. Title: "5 AI Physique Rating Apps Tested (2026): Toy Scorers vs Real Assessment". 7-row comparison table with `gainframe-first` modifier. FAQPage schema (6 Q/As). Cross-links DOWN to body-comp listicles to preserve their keyword territory. Cover image generated via image-generate skill (Nano Banana 2, ~$0.039). — added 2026-05-11, published 2026-05-12
- [x] **Best Body Recomposition Apps: Diet, Workout & Tracking Compared** (Med/25, blog-post-generator listicle) — added 2026-05-11 — published 2026-06-15 as /blog/best-body-recomposition-apps/ — reframed as "recomp is 3 jobs" (measurement/nutrition/training); ranks GainFrame #1 for the body-composition job, MacroFactor/Hevy/Recomp AI/BodyRecomp by job, getrecomp.app as "one to watch" (pre-launch); cross-links DOWN to body-recomposition-tracker + bulk-cut-or-recomp per cannibalization guard; competitor profile in seo-tools/competitor-research/getrecomp.md

#### CTR / ranking fixes (existing posts — no new content needed)

- [x] **[CTR-MONITOR] `/blog/ai-body-editor-apps-vs-real-analysis/` — measure retitle effect before any second change** — first retitle shipped 2026-05-11 19:55 (commit fbc23e1) → "5 Best AI Body Editor Apps 2026 (+ the Honest Alternative)". GSC data through 2026-05-12 still reflects pre-retitle CTR (6.12% on `best body ai` at 392 imp; 4.42% on `best body ai app` at 113 imp; 505 imp combined / biggest single fish). **DO NOT make a second title change until ~2026-05-19** (Google needs ~7–10 days to recrawl + re-rank; back-to-back changes are unattributable and signal instability). At 2026-05-19, re-pull GSC `mcp__gsc__get_search_by_page_query` for this URL; if CTR on `best body ai` hasn't moved above ~8%, then queue a second rewrite that front-loads the query phrase: suggested "Best Body AI Apps 2026: 5 Editors Ranked + The Honest Alternative". See `seo-tools/keyword-research/2026-05-12-gsc-delta.md` for the page-mapping correction and full reasoning. — added 2026-05-11, monitor-gated 2026-05-12
- [x] **[CTR] `/blog/ai-body-editor-apps-vs-real-analysis/` — investigate 0% CTR at pos 3.5** — `best ai body editor apps 2026` (73 imp, 0% CTR) — verify 2026-05-11 retitle landed in Google's index, check live SERP. Note (corrected 2026-05-11): user-verified screenshot showed GainFrame NOT visible in current SERP for `best free ai body editor 2026`, which means we've dropped since GSC's 3-month window — verify current rank before optimizing. The pos 1.2 / 5 imp datapoint on `best ai body editor 2026` is statistical noise, not an AI Overview signal. Add FAQPage schema + "morphing tools" / "editing apps" wording for CTR-10/11/12 (66 imp combined). — added 2026-05-11
- [x] **[CTR] `/blog/best-ai-personal-trainer-apps/` content refresh** — RANKING LIFT needed; `ai personal trainer` (50 imp pos 36) + `ai personal trainer app` (30 imp pos 32) + `ai fitness coach app` (11 imp pos 38.6) — pos 32-38 is page 3-4, need to climb to page 1; refresh content, add internal links from related posts, possibly add 2026 app additions — added 2026-05-11
- [x] **[CTR] `/blog/best-body-composition-apps/` title rewrite** — `top rated apps for body composition analysis` (40 imp pos 7.0, 0% CTR) — add "Top Rated" wording to lead — added 2026-05-11
- [x] **[CTR] `/blog/best-body-transformation-apps/` minor polish** — `body transformation app` (74 imp pos 8.0, 8.11% CTR) — minor title/meta tweak — added 2026-05-11
- [x] **[CTR] Add "for natural bodybuilders" section** — likely on `/blog/natty-limit/` or `/blog/best-ai-body-fat-apps/`; `which body fat calculator apps provide the most accurate results for natural bodybuilders?` (41 imp pos 5.9, 0% CTR) — added 2026-05-11
- [x] **[CTR] Add direct Q&A heading** on `/blog/best-before-after-transformations-men/` (60 imp pos 4.9, 1.67% CTR) and `/blog/best-before-after-transformation-apps-women/` (46 imp pos 6.5, 0% CTR) — both ranking high but not answering the question literally — added 2026-05-11
- [x] **[CANNIBAL] Progress-photo posts canonicalization audit** — `progress photo app` (15 imp pos 15.4, 0% CTR) — we have 4 competing posts (`best-progress-photo-apps`, `best-free-progress-photo-apps`, `best-gym-progress-photo-app`, `best-progress-photo-app-iphone`); Google can't pick a canonical. Pick ONE primary, redirect or rel=canonical the others. — added 2026-05-11 — ✅ done 2026-05-11: live-data audit showed `iphone` post = 0 imp/90d and `gym` post = mostly brand traffic. Deleted + 301'd both to pillar. Kept `best-free-progress-photo-apps` (ranks pos 6.5 for "progress photo app free") with explicit prominent cross-links between pillar↔free in both directions to harden differentiation.
- [x] ~~**[CTR-AIO] Investigate AI Overview on `/blog/how-to-estimate-body-fat-from-photo/`**~~ — **WITHDRAWN 2026-05-11** — the 45 imp + 37 imp / pos 2.8 / 0% CTR data is **stale**: it was earned by the OLD `/blog/how-to-read-body-fat-from-photos/` which was deleted + 301'd to the new canonical earlier today (see entry in this file above). Verified via live WebSearch — GainFrame is not in current top 10 SERP. Correct action: **monitor the new canonical `/blog/how-to-estimate-body-fat-from-photo/` over the next 2-4 weeks to see if it inherits the ranking after Google reprocesses the 301**. No new content/schema action needed right now.

### From: seo-tools/keyword-research/2026-06-03-skinny-fat-lean-bulk.md

Cluster goal: own the "skinny fat" and "is my lean bulk working" search spaces — two on-ramps to the exact GainFrame thesis (*the scale can't show muscle-vs-fat; body composition can*). Definitional heads ("what is skinny fat", "skinny fat body type") are hospital-authority-locked (difficulty ~95) and skipped; the diagnostic + fix + bulk-tracking angles have no authority lockout and are winnable. Zero existing skinny-fat coverage; lean-bulk tracking is adjacent to — but distinct from — recomp content, so new posts must be skinny-fat / bulk-specific and cross-link DOWN to recomp posts rather than re-tread them.

- [x] **How to Tell If You're Skinny Fat (And Why the Scale Can't Tell You)** (High/42, blog-post-generator) — added 2026-06-03 — DIAGNOSIS PILLAR; highest-fit keyword in either cluster. Covers `how to tell/know/check if you're skinny fat` + `am I skinny fat`. SERP = small body-comp brands (InBody, BodyScan, INEVIFIT, Bony to Beastly) + 1 YouTube, no tier-1 lockout. Photo → body-fat % + 12 muscle scores IS the skinny-fat diagnostic (normal weight, high-ish fat, low muscle). Honest hedge: ~2-4% of DEXA, not a medical diagnosis. Cross-link to `/blog/body-fat-percentage-vs-bmi/` + `/blog/visceral-fat-vs-subcutaneous-fat/`.
- [x] **Skinny Fat to Muscular: The Recomp Playbook (and How to Track It)** (Med-Hi/45, blog-post-generator) — added 2026-06-03 — FIX/TRANSFORMATION supporting post. Covers `how to fix skinny fat` + `skinny fat workout` + `skinny fat to lean/muscular/shredded/toned`. SERP = Bony to Beastly, SetForSet, ATHLEAN-X, Quora, YouTube (+Healthline on "fix"); no lockout. **CANNIBALIZATION GUARD:** be the skinny-fat-specific doorway into recomp; cross-link DOWN to `/blog/body-recomposition-tracker/` + `/blog/how-long-does-body-recomposition-take/` + `/blog/bulk-cut-or-recomp/` — do NOT duplicate the generic recomp tracker. We don't program workouts: keep training at principle level (heavy compounds, protein, slight deficit), own the *tracking* half.
- [x] **Is Your Lean Bulk Working? How to Tell If You're Gaining Muscle or Fat** (Med/43, blog-post-generator) — added 2026-06-03 — LEAN-BULK TRACKING PILLAR. Covers `how to tell if lean bulk is working` + `how to know if gaining muscle or fat on a bulk` + `are you bulking or just fat`. SERP = BodySpec/DEXA companies, MyVitalMetrics, MacroFactor, Boostcamp (+Cleveland Clinic on one variant); the gold-standard answer it gives is "DEXA" — pairs with our `/blog/dexa-scan-alternative/` angle. **CANNIBALIZATION GUARD:** bulk ≠ recomp (surplus vs simultaneous); frame around bulk-specific question (gain rate, fat-gain ratio, when to cut the surplus). Cross-link to `/blog/body-recomposition-tracker/` + `/blog/measure-muscle-gain-without-scale/` + `/blog/bulk-cut-or-recomp/` + `/blog/dexa-scan-alternative/`.
- [x] **How to Lean Bulk Without Gaining Fat** (Med-Hi/50, blog-post-generator) — added 2026-06-03 — OPTIONAL, ship only after the 3 above. SERP = MaxiNutrition, Healthline, JEFIT, Fitbod, Bony to Beastly. How-to *nutrition* intent — skews diet (surplus, meal timing), weaker fit since we track not prescribe. Frame as "set up + track a lean bulk," point the tracking half at GainFrame.

#### GSC-surfaced (this run) — not new content

- [x] **[CTR-MEASURE] `/blog/ai-body-editor-apps-vs-real-analysis/` — measurement window now OPEN** — `best body ai` (395 imp, pos 5.8, 6.08% CTR) is the biggest single fish. The 2026-05-11 retitle's monitor gate (~05-19) has passed (now 06-03, 23 days). Pull `get_search_by_page_query` for this URL and judge whether CTR moved BEFORE making any second title change (per measurement-first rule). — surfaced 2026-06-03
- [x] **[REFRESH-CANDIDATE] `resistance-training-guidelines.mdx` — ACSM impression flood, 0 clicks** — ranks pos 8–12 across dozens of ACSM resistance-training query variants (hundreds of combined impressions, 0 clicks). Not a new post — the snippet doesn't answer "the official ACSM guideline" literally. Consider a structured/quotable refresh (clear sets/reps/frequency table + FAQ) to convert page-1-2 impressions into clicks. — surfaced 2026-06-03

### From: seo-tools/keyword-research/2026-06-03-aesthetic-physique-transformation-timeline.md

Cluster goal: own the aesthetic physique / V-taper proportions space (Cluster C) and the "signs of progress / how long to see results" space (Cluster D). Head terms for both are either image-locked or hospital-locked; the winnable sub-queries have weak SERPs (calculator sites, small fitness blogs). Priority order: SWR pillar first (lowest difficulty), then signs-of-progress, then aesthetic BF%, then the harder timeline post.

- [x] **Shoulder to Waist Ratio: The V-Taper Guide** (Med-Hi/20, blog-post-generator) — added 2026-06-03 — EASIEST WIN IN CLUSTER; SERP = pure calculator tool sites (mdapp, fitnessvolt, athletepath, wpcalc). Covers: shoulder-to-waist ratio, calculator, ideal male (1.618/Adonis Index), v-taper ratio, how to measure. GainFrame angle: Proportions score in the score card + BF% reduction + shoulder muscle development = the two levers for improving SWR.
- [x] **Signs You're Building Muscle (Before You Can See It in the Mirror)** (Med-Hi/35, blog-post-generator) — added 2026-06-03 — SERP = RP Strength, MuscleTech, small fitness blogs, YouTube. No hospital lockout. Covers: how to know if you're building muscle, signs of muscle growth, am I gaining muscle, signs training is working. **CANNIBALIZATION GUARD:** `how-to-track-muscle-gain-progress.mdx` covers METHODS; this covers INDICATORS/SIGNALS — different intent. Cross-link between them, do NOT duplicate the methods list. GainFrame angle: per-muscle score progression + BF% trend = the early-warning system before the mirror shows anything.
- [x] **Aesthetic Physique: The Body Fat % and Proportions That Create the Look** (Med/40, blog-post-generator) — added 2026-06-03 — supporting post to SWR pillar. SERP = JustAnswer, Medium, Bony to Beastly, Men's Journal, YouTube. No lockout. Covers: aesthetic physique body fat percentage, most aesthetic BF% (8-15% men), aesthetic body composition, what body fat for aesthetic physique. Do NOT re-tread FFMI chart, body fat chart, or jawline post — frame tightly around the aesthetics combination (BF% + proportions + muscle development).
- [x] **How Long to See Results from Lifting: A Progress Photo Timeline** (High/58, blog-post-generator) — added 2026-06-03 — HIGHER DIFFICULTY, HIGHER CEILING; pursue after 1-3 above. SERP = Healthline + Nike (tough) but both give generic "4-6 weeks" answers. Differentiated angle: WHAT you see at each phase (strength→clothes fit→photos→mirror) rather than just when. **CANNIBALIZATION GUARD:** `how-long-does-body-recomposition-take.mdx` covers recomp timeline; this covers general lifting timeline — distinct question. Cross-link but don't duplicate.

#### CTR fix surfaced in this run (not a new post)

- [x] **[CTR] `/blog/how-to-estimate-body-fat-from-photo/` — 82 combined impressions at pos 2-3, 0% CTR** — largest untouched CTR leak in current GSC data. `body fat percentage estimation from photo` (45 imp, pos 2.8) + `body fat percentage estimation from photos` (37 imp, pos 3.0) — ranking top 3 but converting 0 clicks. Title/meta may not match the "estimation" query intent literally enough. Pull `get_search_by_page_query` for this URL and evaluate before changing (per measurement-first rule). — surfaced 2026-06-03

### From: 2026-06-28 — double-down-on-winners (competitor vs/review + brand-alternative bets)

Context: GSC keyword-opportunity well is dry (only `best body ai` left, and that's a decaying query — CTR refresh on `ai-body-editor-apps-vs-real-analysis` SKIPPED 2026-06-28 after measurement: 90d "best body ai" 408 imp/6.13% CTR collapsed to 19 imp/30d, CTR already healthy, page lost head term `ai body editor` to pos 91 — ranking/decay problem, not CTR). The 17 `best-X` roundups saturate the listicle space; net-new value is in the competitor vs/review/alternative format (proven: spren-app-review 18 clicks, metamorph-vs 10). **Indexing-first:** before/with these, the 2 uncrawled existing roundups (`best-body-fat-scanner-apps`, `ai-physique-rating-apps`) must get Request Indexing — see indexing task below. All new pages run through generator Phase 0 cannibalization check.

#### Competitor vs/review pages (profiles exist — comparison-article-generator)

- [x] **BodyScan by FitnessAI — review/vs** (LEAD; in winning cluster = AI body-comp-from-photo / DEXA alternative; profile: seo-tools/gsc-data/may-11/competitor-research/bodyscan-fitnessai.md) — added 2026-06-28 — **published 2026-06-28 as /blog/fitnessai-bodyscan-vs-gainframe/** — angle: body-comp module inside a workout app (3D scan ritual + ~$9.99/mo on top of FitnessAI workout sub, Prism Labs engine) vs GainFrame single-photo body-comp-first ($5.99/mo). Honest concession = cross-platform (FitnessAI on Android, GainFrame iOS-only); Prism Labs DEXA-validation noted factually as vendor-published. Explicit audience split. FAQPage + BlogPosting + BreadcrumbList schemas. Reused canonical GainFrame screenshots; cross-links to dexa-scan-vs-ai-body-composition + best-ai-body-fat-apps + trackbod-vs-gainframe + what-is-ffmi. Build verified, in sitemap. Cover image generated. Used correct App Store ID id6759252082 (NOT the skill template's wrong id6742498826).
- [x] ~~**Snapsie — review/vs**~~ — **SKIPPED 2026-06-28** as a dedicated post (per its own competitor profile recommendation). Snapsie last updated Aug 2017 (~9 yrs), 46 reviews, fully free, near-zero search volume. A dedicated comparison = thin content of the kind already deleted from this repo. **Action instead:** fold into `/blog/best-progress-photo-apps/` (and/or best-free-progress-photo-apps) as the "best free option (not updated since 2017)" with the abandoned caveat. Not done yet — quick roundup edit, not a full post.
- [x] **Progress by Lasmit — review/vs** (weight-loss photo tracker; profile: .../progress-lasmit.md) — added 2026-06-28 — **published 2026-06-28 as /blog/progress-app-vs-gainframe/** — angle: weight-loss vs muscle-gain goal split. **Pricing corrected via fresh research:** Progress is now SUBSCRIPTION ~$0.99/mo or $5.99/yr (App Store id583840813), NOT the one-time IAP the profile guessed — honestly conceded as cheaper than GainFrame. Honest concessions foregrounded: 14-yr track record / ~15K reviews, 17+ tape measurements, Fitbit integration, price. FAQPage + BlogPosting + BreadcrumbList schemas. Cross-links to best-progress-photo-apps + trackbod-vs + fitnessai-bodyscan-vs + what-is-ffmi. Build verified, in sitemap. Cover generated. Correct App Store ID id6759252082.

#### Brand-alternative roundups (NEED competitor-scan first — no profile yet)

- [x] **InBody alternative (at-home / from-photo)** — added 2026-06-28 — highest brand-search intent of the three (InBody = gold-standard body-comp brand); run `/competitor-scan` before writing. Capture "InBody alternative" / "InBody at home".
- [x] **ZOZOFIT alternative** — added 2026-06-28 — body-scan brand; run `/competitor-scan zozofit.com` first.
- [x] **Bodygram alternative** — added 2026-06-28 — body-measurement-from-photo brand; run `/competitor-scan` first. Lowest priority of the three.

## Published

### 2026-06-28 — uncrawled-roundup unblock (indexing-first before new content)

GSC URL inspection found 2 finished roundups in the winning cluster never crawled by Google:
- `ai-physique-rating-apps` (May 12) — TRUE ORPHAN (0 inbound links), 6+ weeks uncrawled.
- `best-body-fat-scanner-apps` (Jun 4) — had 2 inbound links (best-ai-body-fat-apps + best-body-composition-apps) but still never crawled.

- [x] **[Internal links] Wire orphan `ai-physique-rating-apps` from crawled authority pages** — done 2026-06-28. Added Related-Articles links from `understanding-ai-physique-score`, `best-ai-body-composition-app`, `best-ai-fitness-apps-track-body` (all crawled/indexed). Orphan now has 3 inbound links. Build verified in web/out/.
- [x] **[MANUAL — needs GSC write] Request Indexing for the 2 uncrawled roundups** — Michael to paste into GSC URL Inspection → Request Indexing: `https://gainframe.app/blog/best-body-fat-scanner-apps/` and `https://gainframe.app/blog/ai-physique-rating-apps/`. Re-inspect ~2026-07-02 to confirm crawl.

### 2026-06-15 — net-new from SEO audit (not from a prior keyword-research doc)

- [x] **Best Body Recomposition Apps** — /blog/best-body-recomposition-apps/ — "recomp is 3 jobs" listicle; was backlog item (see above)
- [x] **Import Progress Photos** — /blog/import-progress-photos/ — NEW cluster (Differentiator #1: camera-roll import / Backstory). Targets "import progress photos" / "body transformation from old photos" — wide-open SERP, no competitor does camera-roll import.
- [x] **2-Week Body Experiment** — /blog/body-composition-experiment/ — NEW; "identifying trends" feature → correlation-vs-causation angle on the pattern/Insights cards. Targets "does X actually work" / "how to know if a supplement is working".
- [x] **Recovery Score for Lifters** — /blog/recovery-score-for-lifters/ — NEW; recovery-metrics feature, framed as training-readiness→physique (one post, NOT a recovery cluster — off-core per audit, dilution risk accepted knowingly).
- [x] **[Refresh] personalized-ai-fitness-coach** — added "Coach compares two check-ins + biggest movers" screenshot + paragraph; dateModified bumped 2026-06-15 (was pos ~46; refresh, not net-new, to avoid cannibalizing the Coach cluster).

**Indexing fix (2026-06-15):** wired inbound internal links to 3 orphaned/uncrawled posts (best-body-fat-scanner-apps, ai-fitness-analysis, how-to-lean-bulk-without-gaining-fat) from indexed parents + resubmitted sitemap (Google's last fetch was 2026-05-11). All 4 new posts above shipped with inbound links so they aren't born orphans. Competitor profile: seo-tools/competitor-research/getrecomp.md (pre-launch; vs-page held until they ship).

**Next candidates surfaced (not yet done):** best-ai-personal-trainer-apps ranking-lift refresh (pos 19, 1363 impr — biggest single ranking opportunity); resistance-training-guidelines quotable refresh (ACSM impression flood, 0 clicks); more comparison/alternative pages (InBody/Bodygram alternative); getrecomp.app vs-page once it launches.

### 2026-06-26 — calmseo GSC audit (organic +115% MoM; body-comp-from-photo hub)

Organic trending strongly up: last 30d 927 clicks / 42.3K impr (+115% clicks MoM), pos ~10.8 held while impressions doubled; 2026-06-24 = 68 clicks (all-time daily high). Caveat: much of the Jun 19–24 surge follows the 2026-06-18 on-page fixes (commit 8b3ae2e) — those two pages (best-ai-body-fat-apps, best-body-transformation-apps) are inside the 7–10d measurement window, DO NOT re-touch titles until ~2026-07-01.

**Indexing bottleneck (the 2026-06-15 fix did NOT take).** GSC URL inspection on 2026-06-26 found 4 of 6 June-15 posts STILL "unknown to Google / never crawled" 11 days post-publish: `best-body-recomposition-apps` (the money roundup), `import-progress-photos`, `recovery-score-for-lifters`, `how-long-does-body-recomposition-take`. All return 200 + are in the live sitemap → not a deploy/sitemap problem, it's crawl-priority on a young domain. Root cause: the 6-15 inbound links came from low-authority / themselves-uncrawled posts, so crawl signal never reached them. The 2 that DID index had 9 & 13 inbound links; the orphans had 1–7, mostly from inside the new cluster.

- [x] **[Internal links] Wire 4 orphans from genuinely-crawled authority pages** — done 2026-06-26. Added Related-Articles links: `best-ai-body-fat-apps` (pos 5.8) → recomp-apps + how-long-recomp; `best-body-transformation-apps` → recomp-apps + import-progress-photos; `best-body-composition-apps` → recomp-apps + how-long-recomp; `best-free-progress-photo-apps` → import-progress-photos; `best-ai-fitness-apps-track-body` → recovery-score. Net inbound from authority pages now: recomp-apps +3, import-progress +2, how-long +2, recovery +1. Built + verified in out/.
- [x] **[MANUAL — needs GSC write] Request Indexing for the 4 orphans** — Michael to paste into GSC URL Inspection → Request Indexing (prioritize best-body-recomposition-apps): `/blog/best-body-recomposition-apps/`, `/blog/import-progress-photos/`, `/blog/recovery-score-for-lifters/`, `/blog/how-long-does-body-recomposition-take/`. Re-inspect ~2026-06-30 to confirm crawl.

**Pillar consolidation — body-fat-from-photo cluster (7+ pages, cannibalization-managed).** Did NOT add new pages (cluster already crowded: roundup, accuracy study, calculator post, how-to-estimate post, every-way, tool). Instead:

- [x] **[Pillar expand] `/blog/body-fat-from-photo-app/`** — done 2026-06-26. Was 860w / pos 33. Expanded to ~1700w as the cluster hub: added "How accurate" summary (links accuracy study), "Photo vs other methods" comparison table (links every-way + dexa-alt + calculator), free-tool + iOS CTA, a visible FAQ + **new FAQPage schema** (was missing — AEO win), and a "More on measuring body fat" hub block linking all 6 spokes. Fixed broken legacy `.html` related links → clean URLs. dateModified bumped. **Cannibalization guard:** kept title informational ("How to Calculate Body Fat From a Photo Using AI (2026 Guide)") — did NOT chase the tool's "AI body fat estimator" head or how-to-estimate-body-fat-from-photo's "how to estimate" head.
- [x] **[Tool optimize] `/tools/body-fat-from-photo/` for "ai body fat calculator"** — done 2026-06-26. Page already owns "estimator" (pos 10). Surgical: added "calculator" to meta description + 1 FAQ schema Q ("Is this an AI body fat calculator?") distinguishing the photo-AI calculator from the Navy-formula `/tools/body-fat-estimator/`. No disruption to the working page.

**Flagged for separate task:** ~25 blog posts link to App Store `id6742498826`, which does NOT match the canonical `id6759252082` (SITE config + app-marketing-context). Likely wrong/legacy store links leaking conversions — audit + fix repo-wide.

### Jul 7 second batch — 15 outside-the-box posts (agent-written, all conventions verified)

- [x] **Stats pages:** average-body-fat-percentage-by-age (age-varied visualizer renders — unique asset), average-waist-size-men, average-bicep-size, ffmi-percentiles — published 2026-07-07
- [x] **Visual explainers:** what-would-i-look-like-with-less-body-fat (Future You tie-in), dad-bod-body-fat-percentage, 10-pounds-fat-vs-muscle, body-recomposition-before-and-after — published 2026-07-07
- [x] **Question/AEO:** why-do-i-look-smaller-in-photos, why-weight-goes-up-when-lifting, why-abs-show-in-some-lighting — published 2026-07-07
- [x] **Quiz format (static self-assessments, new format):** should-i-bulk-or-cut-quiz, am-i-skinny-fat-quiz — published 2026-07-07 (guards: link, don't duplicate, bulk-cut-or-recomp + how-to-tell-if-skinny-fat pillars)
- [x] **Audience expansion:** groom-wedding-shred (event-driven, underserved), trt-body-composition-tracking (YMYL-hedged like GLP-1 post) — published 2026-07-07

NOTE: 21 posts published Jul 7 total (6 morning + 15 afternoon). Request GSC indexing for all. Expect impressions lag; informational/AEO posts here will pull impressions more than clicks per strategy — that's by design (diversification batch).

### Jul 9 batch — 10 posts (week's queue, written in one pass)

- [x] best-whoop-alternatives-for-lifters · hume-body-pod-review (hardware-review lane debut) · best-leanlens-alternatives (LeanLens = web-based, represented fairly) · body-recomposition-for-women + menopause-body-composition (FIRST female-audience pages) · progress-photo-poses · waist-to-height-ratio · lean-bulk-vs-dirty-bulk · first-cut-guide · ai-body-fat-apps-android (honest iOS-only answer) — all published 2026-07-09

### Jul 11 batch — stats pages round 2 + tool-link sweep

- [x] **Stats pages:** average-chest-size, average-shoulder-width (biacromial vs circumference disambiguation), average-neck-size (health-marker + Navy-formula angle) — published 2026-07-11. Rationale: waist/bicep stats pages from Jul 7 pulled 1,000–1,500 impressions each within 4 days of publish (GSC Jul 6–8). Inbound links added from average-bicep-size, shoulder-to-waist-ratio, average-waist-size-men related blocks (June crawl-bottleneck lesson: no orphans).
- [x] **Internal-link sweep:** added /tools/body-fat-from-photo/ links to 13 roundups + 4 stats pages that had none (tool hit pos 6.6 / 14.4% CTR wk of Jul 6). Varied anchors, placed in GainFrame sections — 2026-07-11
- [ ] **Request GSC indexing for the 3 new stats pages** (average-chest-size, average-shoulder-width, average-neck-size) — daily indexing quota was exhausted 2026-07-11; submit on/after 2026-07-12

### Jul 18 — body-fat-percentage-chart CTR title test

- [x] Title/meta iteration shipped 2026-07-18 (in the planned Jul 16–20 window, 16 days after the Jul 2 rewrite). Old title: "Body Fat Percentage Chart with Photos: Visual Guide for Men & Women". New: "Body Fat Percentage Chart: What 10–40% Actually Looks Like (Men & Women)" — aligned to the dominant "what does N% body fat look like / N% example" query mix visible in GSC. **Baseline (wk Jul 10–16): 42 clicks / 5,147 impr / 0.82% CTR / pos 12.2.** Judge ~Jul 28–Aug 1: success = CTR ≥1.2% at same-or-better position. No further metadata touches on this page until then.
- [x] **CRITICAL FIX shipped same commit:** App Store CTA links across 31 posts + 9 legacy HTML pages pointed at DEAD listing id6742498826; corrected sitewide to live id6759252082 (gainframe-progress-photos) and fixed the blog-post-generator SKILL.md template that seeded it. Every "Download GainFrame Free" button on recent posts was a dead link until 2026-07-09.

### Jul 13 batch — 10 posts doubling down on validated formats (stats pages 5K imp/5d, quizzes 12-17% CTR)

- [x] **Stats/measurement cluster:** ideal-body-measurements-men (hub) · average-body-fat-percentage-women (women head terms; guards vs by-age + chart) · average-wrist-size · average-forearm-size — published 2026-07-13
- [x] **Relatable questions:** how-long-to-see-abs · why-is-my-waist-not-shrinking · normal-bmi-but-look-fat · strong-but-look-small · how-much-muscle-can-you-gain-in-a-month — published 2026-07-13
- [x] **Quiz:** body-type-quiz (honest somatotype myth-bust) — published 2026-07-13
- NOTE: original batch briefed average-shoulder-width-men/chest/neck as dupes of the **Jul 11 session's stats round 2** (average-shoulder-width, average-chest-size, average-neck-size — already live, indexing queued). Writer agent caught it; replaced with wrist/forearm/strong-but-small. Overwritten neck cover restored from git. LESSON: always re-list web/content/blog before briefing a batch — sessions run in parallel.

### Jul 16 batch — 10 posts (measurement family extension + women's stats push)

- [x] **Women's measurement stats (audience push):** average-waist-size-women · average-hip-size-women · average-bicep-size-women — published 2026-07-16
- [x] **Measurement family completion:** waist-to-hip-ratio (head term) · average-thigh-size (incl. calves) · body-frame-size — published 2026-07-16
- [x] **Relatable Qs:** how-long-does-it-take-to-lose-belly-fat · why-do-i-have-skinny-arms — published 2026-07-16
- [x] **Lifter guide + commercial:** mini-cut (map gap) · withings-body-scan-review (hardware-review lane #2) — published 2026-07-16
- Window reads logged Jul 16: chart post stable ~11.8 (from 42.6) · accuracy-study CTR 0.32%→0.85% post-title-test · trainer post 16.8→11.2 links-only · visualizer 12 clicks/wk post-indexing. avg-waist-size-men sustaining ~4.9K imp/wk.

### Jul 17 batch — 10 posts (female hub + optics family + decision content)

- [x] **Female measurement hub:** ideal-body-measurements-women (anchors the women's family) · average-shoulder-width-women — published 2026-07-17
- [x] **Optics/relatable Qs:** why-do-i-look-fat-in-pictures · why-do-i-look-better-in-the-gym-mirror · face-fat-and-body-fat (jawline landmarks kept consistent) · how-lean-can-you-get-naturally · why-am-i-losing-inches-but-not-weight — published 2026-07-17
- [x] **How-to + decision + quiz:** how-to-measure-body-fat-with-tape (Navy method) · tape-measure-vs-smart-scale · am-i-overtraining-quiz (YMYL-lite hedged) — published 2026-07-17
- Pulse read Jul 17: record wk 1,222 clicks (+50%), 57.3K imp (+93%); Jul 13 = 191-click record; Jul 12 = first 10K-imp day. avg-waist-men 8.3K imp/wk.

### Jul 18 batch — 10 posts (cluster-leveling hubs + gated areas opened)

- [x] **Hubs:** how-to-take-body-measurements (binds the 17-page measurement family, head term) · body-fat-percentage-chart-women (completes female visual family, guarded vs unisex chart) — published 2026-07-18
- [x] **Formats:** body-fat-percentage-quiz (visual self-assessment → tool funnel) · why-do-i-weigh-more-than-i-look · why-do-abs-only-show-when-flexing — published 2026-07-18
- [x] **Gaps:** best-progress-photo-apps-android (honesty play #2) · skeletal-muscle-mass-percentage · average-body-fat-for-athletes — published 2026-07-18
- [x] **Gated areas opened:** glp1-body-recomposition-after-stopping (YMYL) · are-smart-scales-accurate (scale-lane head question) — published 2026-07-18

### Jul 19 batch — 10 posts (honest how-tos + nutrition-adjacent + body-image)

- [x] **Honest how-tos (big queries):** how-to-get-a-smaller-waist · how-to-get-toned-arms (female) — published 2026-07-19
- [x] **Head Qs + decision:** why-does-my-weight-fluctuate · is-bmi-accurate · progress-photos-vs-scale — published 2026-07-19
- [x] **Nutrition-adjacent guides (feed TDEE tool + cut cluster):** maintenance-calories · reverse-dieting · cutting-without-counting-calories — published 2026-07-19
- [x] **Gated + brand-defining:** jefit-vs-hevy (Jefit verified 4.8/46K) · progress-photos-body-image (max-care body-image piece, NEDA resource, weekly-cadence philosophy) — published 2026-07-19

### Jul 23 batch — 15 posts (record-week read: women's family validated, thigh 4.4K imp/3d)

- [x] **Stats/measurement:** average-body-fat-percentage-men (male mirror head term) · chest-to-waist-ratio · average-hand-size · long-torso-short-legs — published 2026-07-23
- [x] **Female audience:** skinny-fat-women · how-to-get-a-toned-stomach · body-recomposition-over-40 (age expansion) — published 2026-07-23
- [x] **Relatable/lifter:** why-do-i-look-leaner-in-the-morning · water-weight · newbie-gains · am-i-bulking-too-fast — published 2026-07-23
- [x] **Quiz + tool feeders:** beginner-intermediate-advanced-lifter · strength-standards (both feed strength-standards-calculator) — published 2026-07-23
- [x] **Brand reviews:** macrofactor-review (verified 4.8/19.5K) · renpho-scale-review — published 2026-07-23
- [x] **Housekeeping:** Snapsie folded into best-progress-photo-apps (carry-forward closed after 25 days) — done 2026-07-23

### Jul 26 batch — 10 posts (CLICK-INTENT PIVOT, driven by CTR data)

**Data behind the pivot:** stats pages rank well but are answered in-SERP — avg-hip-size-women 3,864 imp @ pos 6.0 = 0.72% CTR; avg-shoulder-width-women 2,681 @ 6.5 = 0.26%. Meanwhile tools convert (ai-body-transformation 23.9%, body-fat-from-photo 10.6%), app roundups 4–6%, and "free" queries are the best modifier on the site ("ai body fat scanner free" 38.5% CTR @ pos 2.2). Conclusion: more stats pages add impressions without clicks. This batch is all commercial/click intent.

- [x] **Physique-rating cluster (4.65% CTR family):** physique-rating-scale · rate-my-physique · best-body-rating-apps — published 2026-07-26
- [x] **Free intent (38.5% CTR signal):** best-free-body-fat-apps ("what's actually free" column) — published 2026-07-26
- [x] **Own-brand honesty page:** apps-like-gainframe (founder-written, declares bias, routes to competitors where they genuinely win) — published 2026-07-26
- [x] **Commercial roundups:** best-body-tracking-apps (category routing hub) · best-body-composition-scales (hardware) · best-fitness-apps-for-men · best-fitness-apps-for-women — published 2026-07-26
- [x] **Tool feeder:** how-accurate-are-body-fat-calculators — published 2026-07-26
- NOTE: 3 writer agents died mid-stream (API instability); relaunched, no content lost. One agent's safety classifier was down — its 3 posts were independently re-audited in the main loop and passed.
