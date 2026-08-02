# TikTok App-Listicle Post Log

## 2026-05-28 — 5 Body-Fat AI Apps, Ranked
- Slug: 5-body-fat-ai-apps-ranked
- Format: ranked
- Apps: 5 (GainFrame at #3) — Spren #1, MeThreeSixty #2, GainFrame #3, ZOZOFIT #4, Abody.ai #5
- Status: Done (first worked example of ranked format)
- Rev 2026-05-28 (blog-sourced): rebuilt to source from the blog post
  `web/content/blog/best-ai-body-fat-apps.mdx` (the ranked "other style" the user asked for).
  Carried the blog's thesis onto GainFrame's #3 slide — "within 0.4% of a real DEXA scan",
  12 muscle groups, tracks trends + compares — and into the caption ("#3 is the only one
  checked against a real DEXA scan"). GainFrame held at #3 per brand rule (blog ranks it #1).
  Lineup is NOW: Spren #1, ZOZOFIT #2, GainFrame #3, Recomp AI #4, Abody.ai #5.
  Competitor substitution forced by the App Store: the blog's two named rivals are unfetchable —
  Formfy (id6468893498) is delisted (no body-fat app surfaces for "formfy" now) and the blog's
  Recomp AI id (6479535498) is dead. Used the live "Recomp AI – 3D Body Scanner" (id6752960004)
  to keep the blog tie; Abody.ai #5 carries Formfy's "fast snapshot, no tracking" foil. All apps
  pinned by `id:` for determinism. ZOZOFIT + Recomp AI return 0 API screenshots → clean
  logo-panel fallback; Spren/GainFrame/Abody have heroes. Cover "5 AI Body-Fat Apps" /
  "I ranked 5 — but I kept #3." 7 slides, synced to iCloud.

## 2026-05-28 — 5 Fitness Apps Every Enthusiast Needs
- Slug: 5-fitness-apps-every-enthusiast-needs
- Format: editorial
- Apps: 5 (GainFrame at #4) — Strava, Hevy, MyFitnessPal, GainFrame, Nike Run Club
- GainFrame shots: dashboard.png + deep-dive-compare.png (from docs/assets/tiktok-screenshots/)
- Status: Done (first worked example of editorial format)
- Rev 2026-05-28: swapped GainFrame shots to dashboard + deep-dive-compare; fixed detail-slide
  blur — screenshots now crop to a readable card (crop_to_aspect) instead of squeezing two full
  phones to ~340px wide
- Rev 2026-05-28 (b): the raw screenshot cards looked messy, so GainFrame now ships as TWO
  standalone full-bleed slides built from its App Store promo mockups (app-store2.png body-fat,
  then app-store1.png growth). New `full_slides` spec field + render_full_slide(): flood-fills
  the studio-gray bg to pure white (#FFFFFF) and centers the mockup; counter-free on purpose.
  Carousel is now 8 slides (cover, Strava, Hevy, MFP, GF×2, Nike, outro); displayed counters
  stay slot-based (1/5, 2/5, 3/5, —, —, 5/5).
- Rev 2026-05-28 (c): full-bleed promo slides rejected as off-style. Reverted GainFrame to ONE
  clean two-card detail slide matching the Strava layout — `local_screenshots`
  [dashboard.png, deep-dive-compare.png] (data screen + before/after, so the cards read as
  distinct). Removed the `full_slides` field + render_full_slide() + flood_white() entirely;
  carousel back to 7 slides (cover, Strava, Hevy, MFP, GF, Nike, outro), counters 1/5…5/5.
  Lesson: GainFrame uses the same raw-screenshot card treatment as every other app; no bezel
  mockups or promo images (baked-in headline/gray bg crop badly into cards).

## 2026-05-29 — 5 AI Trainer Apps
- Slug: 5-ai-personal-trainer-apps-ranked
- Format: ranked
- Apps: 5 (GainFrame at #3) — Ray #1, Fitbod #2, GainFrame #3, GymStreak #4, FitnessAI #5
- GainFrame hero: docs/app-screenshots/1.21/ai-coach (local single hero)
- Cover "5 AI Trainer Apps" / accent "AI" / sub "I ranked 5 — but #3 is the only one that knows if it's working."
- Hook: the others program your workouts; #3 tells you if they're working (reads physique from a photo).
- 0-shot logo panels: Ray (#1), FitnessAI (#5). FitnessAI pinned with `name` override (store name "FitnessAI: Gym Workout Plan").
- GF cons: "Doesn't program lifts", "iOS only". Caption CTA "GainFrame is free on iOS." Status: Done.

## 2026-05-29 — 5 Progress Photo Apps
- Slug: 5-progress-photo-apps-ranked
- Format: ranked
- Apps: 5 (GainFrame at #3) — Photo Compare #1, Selfie A Day #2, GainFrame #3, Progress #4, MyFitnessPal #5
- GainFrame hero: docs/app-screenshots/1.21/post-check-in-photo-score (local single hero)
- Cover "5 Progress Photo Apps" / accent "Photo" / sub "I ranked 5 — but #3 is the only one that actually reads the photo."
- Hook: everyone else stores/aligns your photos; #3 reads them (body-fat % + 12 muscle scores from one pic).
- 0-shot logo panels: Progress (#4, `name` override "Progress"), MyFitnessPal (#5).
- GF con: "iOS only (for now)". Caption CTA "GainFrame is free on iOS." Status: Done.

## 2026-05-29 — 5 Muscle Growth Apps
- Slug: 5-muscle-gain-apps-ranked
- Format: ranked
- Apps: 5 (GainFrame at #3) — Hevy #1, JEFIT #2, GainFrame #3, Strong #4, Shapez #5
- GainFrame hero: docs/app-screenshots/1.21/muscle-map (local single hero)
- Cover "5 Muscle Growth Apps" / accent "Muscle" / sub "Loggers track your lifts — but #3 tracks the muscle itself."
- Hook: four are lift loggers (the input); #3 scores the actual output — 12 muscle groups from one photo.
- 0-shot logo panels: none (all four competitors return App Store heroes). `name` overrides: JEFIT, Strong.
- GF con: "Doesn't log lifts". Caption CTA "GainFrame is free on iOS." Status: Done.

## 2026-05-29 — 5 AI Apps for Your Whole Body
- Slug: 5-ai-fitness-apps-whole-body
- Format: editorial
- Apps: 5 (GainFrame at #3) — WHOOP, Cal AI, GainFrame, Runna, Fitbod
- GainFrame shots: dashboard.png + deep-dive-compare.png (two-card detail, from docs/assets/tiktok-screenshots/)
- Cover "5 AI Apps for Your Whole Body" / accent "AI" / GF tagline "Owns your physique."
- Theme: each AI app owns one signal — recovery (WHOOP) / nutrition (Cal AI) / physique (GainFrame) / cardio (Runna) / lifting (Fitbod).
- 0-shot logo card: WHOOP (editorial render_card fallback). Caption CTA "GainFrame is free on iOS." Status: Done.

## 2026-05-29 — 5 Apps for a GLP-1 Cut
- Slug: 5-glp1-ozempic-cut-apps
- Format: editorial
- Apps: 5 (GainFrame at #3) — Shotsy, Cal AI, GainFrame, Hevy, MacroFactor
- GainFrame shots: dashboard.png + deep-dive-compare.png (two-card detail)
- Cover "5 Apps for a GLP-1 Cut" / accent "GLP-1" / sub "The scale can't tell fat from muscle. These can." / GF tagline "Fat loss, not muscle."
- Hook: on a GLP-1 the scale drops — but is it fat or muscle? #3 reads both from a photo.
- 0-shot logo cards: Shotsy (`name` override), MacroFactor. Dropped the smart-scale slot (scale is the hook's foil, not a list item) to cap logo cards at 2.
- Caption CTA "GainFrame is free on iOS." Status: Done.
## 2026-07-30 — The Best Gym Apps: Iceberg
- Slug: gym-apps-iceberg-gainframe
- Format: two-slide iceberg meme
- Apps: FitnessAI, Fitbod, Strong, Hevy, GymStreak, GainFrame
- Status: Done
