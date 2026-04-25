---
name: Competitor Discovery
description: Identify and classify competitors for GainFrame using free SERP, alternative-search, and community-recommendation signals. Outputs a ranked, classified list (Direct / Adjacent / Content) ready to feed competitor-scan for deep profiling.
triggers:
  - "identify competitors"
  - "find competitors"
  - "competitor discovery"
  - "who are our competitors"
  - "discover competitors"
  - "/competitor-discovery"
---

# Competitor Discovery Skill

## Overview

Replicates the "who are we actually competing with?" step that GrowGanic does behind the scenes. **Comes BEFORE `competitor-scan`** in the pipeline:

```
competitor-discovery → list of classified competitors
        ↓
competitor-scan → per-competitor profile files
        ↓
keyword-discovery + comparison-article-generator
```

**Why this is separate from `competitor-scan`:** Different question, different signals. Scan profiles a competitor you already know about (you give it a URL). Discovery finds the competitor in the first place — it doesn't take URLs as input, it produces them as output.

**Three classes of competitor this skill identifies:**

1. **Direct** — same product type, same audience. (For GainFrame: other AI body composition apps.)
2. **Adjacent** — different product, but competes for the same SERPs and the same user dollars. (Smart scales, DEXA providers, body composition test labs.)
3. **Content** — pure content site (no product) that ranks on our target keywords. Can't be "beaten" head-to-head, but they're who you're displacing in SERPs. (Healthline, WebMD, Examine.com, Cleveland Clinic.)

The skill also classifies **out-of-scope** results (Wikipedia, government sites, stock photos) so you can ignore them quickly.

---

## The Workflow

### Phase 0: Inputs

Ask the user for the minimum context needed:

1. **Product / category description** — one sentence. e.g. `AI body composition app for lifters` or `body fat estimation from a photo`. If not provided, default to the GainFrame description from `index.html` or `about.html`.
2. **Optional: 1-2 known competitor names** to seed alternative-search discovery (e.g. `bodywhat`). Skip if user has none.
3. **Optional: 3-5 target keywords per feature axis** to seed SERP-based discovery. If not provided, derive from the product description AND its secondary feature axes (see Phase 1 below).
4. **Platform focus** — default `all` (web + iOS + Android). Alternatives: `ios-only`, `android-only`, `web-only`. **This significantly affects classification:** under `ios-only` (e.g. for iOS-first apps like GainFrame), web-only browser tools that rank for the same keywords get demoted from "Direct" to a separate "Web-only direct (SERP competitors, not App Store competitors)" bucket — they compete for SEO but NOT for the user's App Store choice.
5. **Output detail** — default `full` (all three classes + out-of-scope reasoning). Alternative: `direct-only` for a fast-scan when the user just wants direct app competitors.

### Phase 1: SERP-Based Discovery

For each target keyword (process in parallel), run `WebSearch` and capture every unique domain from the top 10 results.

**IMPORTANT — Secondary product axes:** If the product overlaps multiple feature categories, run a SEPARATE keyword batch for EACH axis. Without this, you miss half the competitive landscape. Example from GainFrame:

- **Axis 1 — AI body composition core:** `AI body composition app`, `body fat from photo`, `body composition tracker`, `body fat percentage app`, `AI body fat estimator`
- **Axis 2 — Progress photo tracking core:** `best progress photo app iOS`, `progress photo tracking app iPhone`, `fitness progress photo app comparison`, `side by side body progress photo app`

A user choosing GainFrame might be evaluating it against either class — a pure progress photo app like `Progress` (theprogressapp.com) is just as much a competitor as an AI body fat app like BodyScan, even though they don't overlap on features. **Ask the user to enumerate ALL feature axes, not just the primary one.**

For GainFrame's space, sensible default keywords if user provides none:
- Axis 1 (AI body comp): `AI body composition app`, `body fat from photo`, `body composition tracker`, `body fat percentage app`, `AI body fat estimator`
- Axis 2 (progress photo tracking): `best progress photo app iOS`, `progress photo tracking app iPhone`, `fitness progress photo app comparison`

**Output of Phase 1:** Deduplicated domain list across all SERPs (and all axes), with a count of how many target keywords each domain ranked for AND which axis each appeared in. Mark domains that appear across multiple axes — those are the top-tier competitors.

### Phase 2: Alternative-Search Discovery

For each known competitor (if user provided any), run these searches in parallel:

- `[competitor] alternatives`
- `alternatives to [competitor]`
- `apps like [competitor]`
- `[competitor] vs` (captures comparison pages — these are gold)

Also run general "best [category]" searches:

- `best [category] apps`
- `best [category] tools`
- `top [category] [year]`

Extract every product/brand name mentioned in titles + snippets. These are competitor candidates.

**Bonus signal:** any domain that has a `/vs-[competitor]` or `/alternative-to-[competitor]` page is positioning itself as your competitor's alternative — which means it's also positioning against you (or could be).

### Phase 3: Community Recommendation Discovery

Real users in the niche know who the competitors are better than search engines. Run these searches in parallel:

- `reddit [category] recommendations`
- `reddit best [category] app`
- `reddit [known competitor] alternative`
- `[forum / community in the niche] [category]` (e.g. `bodybuilding.com forum body composition app`)

Read the snippets — they often list 3-5 product names by name. Capture each unique name.

**Don't WebFetch every Reddit thread** — the snippets and titles are usually enough, and Reddit fetches are slow. Only fetch a thread if its title is exactly the question you're trying to answer (e.g. "What's the best body composition tracking app in 2026?").

### Phase 4: Verification + Classification

For each unique candidate domain/brand from Phases 1-3, do a fast classification check.

**Step 1: Quick triage by domain pattern (no fetch needed):**

- `wikipedia.org`, `*.gov`, `*.edu`, `who.int` → **out-of-scope (reference)**
- `gettyimages.com`, `istockphoto.com`, `shutterstock.com`, `adobe.com/stock`, `freepik.com`, `dreamstime.com` → **out-of-scope (image search)**
- `amazon.com`, `ebay.com`, `walmart.com`, `target.com` → **out-of-scope (marketplace)** unless the candidate IS a product brand sold there
- `reddit.com`, `quora.com`, `stackexchange.com`, `t-nation.com` (forums) → **out-of-scope (community)** but capture the brand names mentioned in those threads as separate candidates
- `youtube.com` → **out-of-scope (video)** unless it's an official channel of a product brand

**Step 2: For remaining candidates, do a quick `WebFetch` of the homepage** (parallel batches of 5-8) and look for:

- **Direct competitor signals:**
  - "Sign up" / "Download" / "Get started" / "Try free" CTAs
  - Pricing page in nav
  - Features grid mentioning the same capabilities as GainFrame (body fat estimation, body composition, photo analysis, etc.)
  - App Store / Google Play links (PRIMARY signal under `ios-only` or `android-only` focus — if no app store link, demote to "Web-only direct")
  - Same target audience callout (lifters, fitness enthusiasts)
  → Classify as **Direct** (under `ios-only` focus, only if iOS app store link is present)
  → Classify as **Web-only direct** (under `ios-only` focus, when no iOS app store link is found despite all other direct signals being present — these compete for SEO but not App Store users)

- **Adjacent competitor signals:**
  - Sells a product but in a different category (smart scale, DEXA scan, calipers, body composition lab service)
  - Mentions body composition / body fat / muscle mass but their primary product is different
  - Could still appear in SERPs alongside GainFrame
  → Classify as **Adjacent**

- **Content competitor signals:**
  - No product / no pricing / no signup
  - Article-heavy site (blog or magazine layout)
  - "Subscribe to newsletter" rather than "Sign up"
  - Health/medical authority signals (.org, hospital names, expert bylines)
  → Classify as **Content**

- **Out-of-scope (deeper signal needed):**
  - Off-topic — not actually about body composition / fitness
  - Defunct / parked / 404
  → Classify as **Out-of-scope** with reason

**Step 3: Score each direct/adjacent competitor by relevance:**

- `+3` if ranked on 3+ of your target keywords (Phase 1 signal)
- `+2` if mentioned in 2+ alternative-search results (Phase 2 signal)
- `+2` if mentioned in 2+ Reddit/community threads (Phase 3 signal)
- `+1` per `/vs-[brand]` page they have (signal of competitive positioning)
- `+2` if their target audience matches GainFrame's stated audience (lifters / serious trainees)

Higher score = higher priority for `competitor-scan` deep-dive.

### Phase 5: Output

#### 5a. Write the discovery report

Create `/Users/michael.rode/code/project/gain-frame-privacy/competitor-research/_identified-[YYYY-MM-DD].md`:

```markdown
# Competitor Discovery: [Category description]

**Generated:** YYYY-MM-DD
**Inputs:**
- Product description: [...]
- Seed competitors: [...]
- Target keywords: [...]

## Discovery summary

- N candidates surfaced across SERP + alternative-search + community signals
- M classified as **Direct** competitors
- P classified as **Adjacent** competitors
- Q classified as **Content** competitors
- R triaged as **Out-of-scope**

## Direct competitors (priority order)

These compete head-to-head with GainFrame. Run `competitor-scan` on the top 3-5.

### 1. [Brand name]
- **URL:** [...]
- **Relevance score:** N/10
- **Signals:** [e.g. "Ranks for 4 of 5 target keywords; mentioned in 3 Reddit threads; has /vs-fitcommit page"]
- **Quick read:** [1-line take on what they do, from homepage hero]
- **Recommended next step:** Run `competitor-scan` → comparison article candidate

### 2. [...]

## Adjacent competitors (informational)

These compete for the same SERPs but sell something different. Worth knowing about; not all need a full scan.

### Smart scales
- [Brand 1] — [URL] — [1-line]
- [Brand 2] — [URL] — [1-line]

### Body composition labs / scans
- [Brand 1] — [URL] — [1-line]
- ...

## Content competitors (SERP context only)

You can't compete with these on product, but they dominate informational SERPs. Note them so `keyword-discovery` knows what authority lockout looks like in this niche.

- Healthline (healthline.com) — major health authority, ranks broadly
- Cleveland Clinic (my.clevelandclinic.org) — hospital authority
- WebMD (webmd.com) — major health authority
- ...

## Out-of-scope (logged, then ignored)

| Domain | Reason |
|---|---|
| en.wikipedia.org | reference site |
| gettyimages.com | image search intent |
| ... | ... |

## Recommended actions

1. **Immediate:** Run `competitor-scan` on the top [N] direct competitors:
   ```
   /competitor-scan [brand1, brand2, brand3]
   ```

2. **Optional:** Scan top 1-2 adjacent competitors if their content footprint is large (a smart scale brand with a serious blog can be a content competitor too).

3. **Skip:** Do not scan content competitors — there's nothing to "profile" since they don't sell a competing product. Their topics will surface naturally via `keyword-discovery` SERP analysis.

## Methodology notes

- Phase 1 SERP capture: queried [N] keywords, captured top 10 domains each
- Phase 2 alternative search: queried "[X] alternatives", "alternatives to [X]", "apps like [X]" for each seed competitor
- Phase 3 community signals: searched Reddit + forum threads, extracted brand mentions from titles/snippets
- Phase 4 verification: classified by domain pattern + homepage fetch (parallel batches of 8)
- Limitations: cannot estimate competitor traffic without paid tools; cannot detect competitors that don't rank on target keywords AND aren't mentioned in alternative-search/community results (the "stealth competitor" problem)
```

#### 5b. Summarize for the user

In chat:
- N candidates surfaced
- Top 5 direct competitors by name with one-line "why" each
- Path to the full report
- Suggested next step: "Run `competitor-scan` on these top 3? `/competitor-scan [brand1, brand2, brand3]`"

---

## Rules & Constraints

- **Never invent competitors.** Only list brands that actually surfaced in real SERP / alternative-search / community results.
- **Always classify before recommending.** A brand listed under "Direct" without verification is misleading. If you can't fetch their homepage to confirm classification, mark them as **Unverified** and let the user decide.
- **Cap homepage verification fetches at 30 per run.** If Phases 1-3 surface more than 30 candidates, prioritize those with the highest relevance score (Phase 4 step 3) and verify only those.
- **Distinguish brand mentions from random word matches.** If a Reddit snippet mentions "FitCommit" three times in one thread, that's a real signal. If a competitor name appears once in a generic listicle of 50 apps, that's noise.
- **Don't conflate adjacent and direct.** A smart scale that mentions body composition is **adjacent**, not direct. Direct = same product type. Adjacent = different product, same SERP. The distinction matters because direct gets a comparison article; adjacent rarely does.
- **Output goes in `competitor-research/`** alongside profile files. Use `_identified-[date].md` prefix to distinguish from per-competitor profiles.
- **Refresh cadence:** quarterly by default, or whenever you discover a new competitor mentioned by a user / in a review.

---

## Integration with Other Skills

**Upstream:** None. This is the first step in the competitor pipeline — user-invoked.

**Downstream:**
- **`competitor-scan`** — receives the prioritized "Direct" list and produces deep profiles. The user runs this skill next, passing the top 3-5 direct competitors as input.
- **`keyword-discovery`** — can read the Content competitor list to anticipate which authority sites will dominate target SERPs (informs the hospital-lockout heuristic).

When this skill finishes, suggest running `competitor-scan` on the top direct competitors.

---

## Reference Files

- `/Users/michael.rode/code/project/gain-frame-privacy/product-context.md` — **READ THIS FIRST.** Authoritative source for product description, platform focus, target audience, and differentiators. Use it to derive Phase 0 inputs (product description, platform focus, secondary product axes) when the user doesn't supply them. The "Implementation Override" paragraph in particular tells you which competitor sub-classes matter (e.g. for GainFrame: AI body comp apps AND progress photo apps — both axes need separate keyword batches).
- `/Users/michael.rode/code/project/gain-frame-privacy/competitor-research/` — output directory (created if absent; shared with `competitor-scan`)
- `/Users/michael.rode/code/project/gain-frame-privacy/.agent/skills/competitor-scan/SKILL.md` — downstream consumer
- `/Users/michael.rode/code/project/gain-frame-privacy/.agent/skills/keyword-discovery/SKILL.md` — secondary consumer (Content competitor list)
- `/Users/michael.rode/code/project/gain-frame-privacy/index.html`, `/about.html` — fallback for product description if user doesn't provide one
