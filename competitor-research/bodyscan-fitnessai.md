# Competitor Profile: BodyScan (by FitnessAI)

**Last scanned:** 2026-04-25
**Primary surface:** Full website + iOS app
**Product page:** https://www.fitnessai.com/bodyscan
**Parent site:** https://www.fitnessai.com/
**Sitemap:** https://www.fitnessai.com/sitemap.xml
**Scope:** Product page + parent sitemap

---

## Positioning

- **Tagline / hero:** "BodyScan" (the product name IS the hero)
- **Subheadline (verified):** "Measure your lean muscle mass and body fat, and track your progress with just your iPhone camera, all at a fraction of the cost of a DEXA scan."
- **Developer:** FitnessAI (parent app) — BodyScan is a sub-product/feature, not a standalone company
- **Primary CTA:** "Download Now" → start.fitnessai.com (subscription-driven onboarding)
- **Target audience signals:** Fitness app users in the broader FitnessAI ecosystem. Workout-app primary, body comp secondary.

### Critical positioning insight

**BodyScan is NOT a standalone product.** It's a feature within FitnessAI (a workout-tracking app). Their /sitemap shows 80+ blog posts, 500+ exercise directory pages, recipe pages, and creator/partnership landing pages — this is a **comprehensive fitness platform**, with body composition as ONE module.

This is meaningfully different from Spren (body comp first) and trackBod (body comp only). FitnessAI's approach: lead with workouts, upsell body comp.

---

## Pricing

**Pricing not separately listed on the BodyScan product page.** Subscription is implied via the "Download Now" CTA.

From earlier verification fetch: **$9.99/month** quoted as the BodyScan tier. Need to verify whether this is the BodyScan-only price or the bundled FitnessAI Pro tier.

⚠️ **PRICING DATA INCOMPLETE.** Recommend a follow-up fetch on `start.fitnessai.com` or the in-app paywall to confirm exact tier structure and what's included.

---

## Advertised Features

(From product page, verbatim)
- Measure lean muscle mass and body fat
- Track progress with iPhone camera
- Body fat percentage
- Lean muscle mass measurements
- Waist circumference
- Metabolic estimates
- 3D bodymap scan technology
- Machine learning analysis

### Accuracy claims (the headline)
- "Cutting-edge accuracy, with a validation paper published in the European Journal of Clinical Medicine"
- "The most accurate biometric phone scanner on the market" (their claim, not independent)
- "Nearly as accurate as an expensive DEXA scan"
- References peer-reviewed validation paper in **Nature** — DOI s41430-024-01424-w

⚠️ **Important note:** The DOI s41430-024-01424-w is the **same paper** cited by Spren on their site. Both companies appear to be citing the same independent research. Worth investigating whether the underlying technology is shared (e.g. a common third-party algorithm both products license) or whether they each independently use the same study as a reference benchmark.

**Notable absence:** No camera roll batch import. No per-muscle-group scoring (12 groups). No Future Physique prediction. No Hevy integration. No progress photo timeline.

---

## Content Footprint

### Sitemap structure (substantial)
- **80+ blog posts** at /blog/* — covering strength training fundamentals, nutrition science, workout psychology, training methodology
- **500+ exercise directory pages** at /exercise/* — heavy programmatic SEO (one page per exercise: barbell, dumbbell, cable, machine, bodyweight)
- **5 recipe pages** at /recipes/* (currently with placeholder Latin URLs — likely WIP or staging artifacts)
- **4 blog authors** (named — Alyssa Gonzalez, Jake Mor, Orli Cole, Shayna Paolucci) — Jake Mor is likely the founder
- **Multiple promotional landing pages** — flash sales, partnership pages, creator landing pages
- **Two URLs for body scan:** `/body-scan` AND `/bodyscan` — possible URL duplication / redirect issue worth noting

### Categories
- Fitness
- Startups
- Tech

The "Startups" and "Tech" blog categories are unusual for a fitness app — they may publish about company building.

---

## Overlap with GainFrame's existing content

GainFrame and FitnessAI overlap on body composition educational content:
- `every-way-to-measure-body-fat` — overlaps with FitnessAI's body scan content
- `dexa-scan-vs-ai-body-composition` — direct overlap with FitnessAI's DEXA-comparison positioning
- `ai-body-fat-photo-accuracy-study` — overlap with FitnessAI's accuracy claims

Likely heavy overlap on **strength training / resistance training content** (FitnessAI has 80+ posts in this area):
- GainFrame has `resistance-training-guidelines`
- GainFrame has `from-score-to-action-target-training`

FitnessAI's content footprint is **much larger** — they have 5-10× the blog content.

---

## Topics they cover but GainFrame does NOT

(High-confidence gaps based on sitemap categories)

- 500+ individual exercise pages (programmatic SEO play GainFrame has not done)
- Training methodology + workout science deep-dives
- Recipes / nutrition meal pages
- Fitness "startup" + "tech" content (probably founder content marketing)
- Multiple promotional / partnership landing pages

**Most of these are off-axis for GainFrame** — a solo dev shouldn't try to compete with FitnessAI's 500+ exercise directory. But the body comp content overlap is real.

---

## Notes for comparison article writing

If `comparison-article-generator` ever writes "BodyScan / FitnessAI vs GainFrame":

- **Verified pricing:** $9.99/mo BodyScan tier (need verification of what's bundled). **Higher than GainFrame ($5.99/mo)**.
- **Verified accuracy claim:** Validation paper in Nature DOI s41430-024-01424-w. SAME paper Spren cites — flag this in the comparison.
- **Verified target audience:** Broader fitness app users (FitnessAI ecosystem). Body comp is a feature, not the core.
- **Known limitations (from missing features):**
  - No camera roll batch import
  - No per-muscle-group scoring (only body fat / lean muscle / waist)
  - No Future Physique prediction
  - No Hevy integration (FitnessAI is itself a workout app — they're a competitor on workout tracking too, but they don't integrate with external workout apps)
  - No progress photo timeline as a primary feature
  - BodyScan is not the headline product — it's an upsell within FitnessAI
- **Verified strengths to acknowledge:**
  - Validation paper in Nature — strong credibility
  - Massive content footprint (80+ blog posts, 500+ exercise pages) — they've done programmatic SEO
  - Founder Jake Mor has visible presence
  - "Most accurate biometric phone scanner on the market" claim, even if self-asserted, signals confidence
  - 3D bodymap scan — different visual technology than Spren's algorithmic photo analysis
  - Bundled with workout tracking (FitnessAI) — broader value if user wants both
- **Honest framing:** BodyScan-by-FitnessAI is a body-comp feature inside a workout-tracking app. The comparison should acknowledge this — **a user choosing FitnessAI is choosing a workout app first, body comp second.** GainFrame is the inverse: progress-photo / body-comp first, with workout integration via Hevy. Different product centers of gravity.
- **Pricing is genuinely competitive:** GainFrame's $5.99/mo undercuts BodyScan's $9.99/mo. But BodyScan bundles workouts, so per-feature value comparison favors BodyScan if the user wanted workouts anyway.

---

## Methodology

- WebFetch: BodyScan product page + parent sitemap (2 calls)
- Sitemap revealed parent site is FitnessAI — much larger than the BodyScan product alone
- Did NOT verify exact pricing tiers (placeholder $9.99/mo from earlier verification — needs follow-up)
- Did NOT verify the Nature paper directly
- Did NOT scan FitnessAI's blog content individually

**Open question:** Does BodyScan share the underlying algorithm with Spren? Both cite the same Nature paper. Worth follow-up before writing a comparison article that involves both.

**Last refresh:** 2026-04-25 — refresh quarterly.
