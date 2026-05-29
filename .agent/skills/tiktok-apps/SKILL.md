---
name: TikTok App-Listicle Generator
description: Generates GainFrame app-listicle TikTok carousels (editorial "Top 5" and ranked countdown) where GainFrame is planted among popular fitness apps. Pulls real logos/screenshots/ratings from the iTunes API and composites deterministic slides with Pillow — no AI image generation.
triggers:
  - "tiktok apps"
  - "tiktok-apps"
  - "app listicle"
  - "apps carousel"
  - "top 5 apps"
  - "apps ranked"
  - "fitness apps post"
---

# TikTok App-Listicle Generator

## Overview

Generates app-listicle TikTok carousels that plant **GainFrame among popular
fitness/body-composition apps**. Unlike the mascot carousels (`/tiktok`), there
is **no AI image generation** — every slide is composited deterministically with
Pillow from **real App Store assets** (logos, screenshots, star ratings, install
counts) pulled live from the public iTunes Search API.

Two formats, same pipeline:

| Format | Use for | Slide layout |
|--------|---------|--------------|
| **editorial** | "5 Fitness Apps Every Enthusiast Needs", starter-pack roundups | Cover → one detail slide per app (screenshots or logo-card) → recap outro |
| **ranked** | "5 Body-Fat AI Apps, Ranked", countdown comparisons | Cover → countdown #5→#1, each slide has rank numeral + hero visual + PROS/CONS → recap outro |

**Why this format exists:** the mascot posts dropped off in views and are no
longer being paid to promote. App-listicles are an organic-growth play — they
ride the credibility of well-known apps (Strava, Hevy, Spren…) and slot
GainFrame in beside them so it reads as an established peer.

---

## The pipeline (3 commands)

Everything runs from the skill dir. A post lives at
`docs/assets/tiktok/apps/<slug>/`.

```bash
cd .agent/skills/tiktok-apps

# 1. author the spec (you write this by hand — see schema below)
#    docs/assets/tiktok/apps/<slug>/spec.json

# 2. fetch real logos/screenshots/ratings → writes assets/ + manifest.json
python3 fetch_apps.py ../../../docs/assets/tiktok/apps/<slug>/spec.json

# 3. composite all slides + content.md from the manifest
python3 render.py ../../../docs/assets/tiktok/apps/<slug>/
```

Output per post:
```
docs/assets/tiktok/apps/<slug>/
  spec.json              # you author this
  assets/
    manifest.json        # fetch_apps.py writes — render.py reads this
    <app-slug>/logo.png, shot-0.png, shot-1.png …
  slide-0-cover.png/.webp
  slide-1.png/.webp …    # one per app
  slide-N-outro.png/.webp
  content.md             # caption + hashtags (render.py writes)
```

---

## Phase 0: Topic + app lineup (interactive)

1. **Pick a format** (editorial or ranked) and a topic. Suggest 3–5 angles if the
   user doesn't have one. Good angles: "5 fitness apps every lifter needs", "5
   body-fat AI apps ranked", "best apps for tracking a cut", "AI fitness apps
   actually worth it".

   **Optional content source — the GainFrame blog.** The blog is a good well for
   post angles, GainFrame's slide copy, and which feature to lead with:
   - Live: <http://gainframe.app/blog.html> (use WebFetch if you want the rendered list).
   - Local source (preferred, no network): `web/content/blog/*.mdx`. Each post is a
     topic + thesis you can lift straight into a carousel — e.g.
     `best-ai-body-fat-apps.mdx` seeded the `5-body-fat-ai-apps-ranked` post, and
     its DEXA-accuracy thesis became GainFrame's #3 callouts + the caption hook.
   - When a blog post ranks GainFrame #1, **still hold it at #3** on the slide (brand
     rule below) — borrow the blog's *framing/claims*, not its ranking. Reuse blog
     claims about GainFrame freely; for competitors, only carry over claims you can
     still verify (App Store listings and IDs drift — see the dead-ID notes in POST_LOG).

2. **Choose the app lineup (4–6 apps).** Mix well-known anchors with the niche.
   GainFrame is always one of them.
   - **GainFrame placement = middle.** Editorial slot #3–4; ranked **#3**. Planted
     among bigger apps it reads as a credible peer, not an ad. Never #1 (looks
     like a plant) and never last (looks like an afterthought).
   - For **ranked**, the pros/cons should frame the higher-ranked competitors as
     **hardware-heavy or subscription-heavy** (3D rigs, tracking suits, pricey
     subs) so GainFrame's "just take a normal progress photo" lands as the
     accessible pick. Be fair, not dishonest — every con must be true.

3. **Confirm the lineup + GainFrame's angle before authoring the spec.**

---

## Phase 1: Author `spec.json`

Create `docs/assets/tiktok/apps/<slug>/spec.json`. Slug is kebab-case
(`5-body-fat-ai-apps-ranked`).

### `query` — how each app is resolved against the App Store
- **Plain text** (`"Strava: Run, Bike, Hike"`) → iTunes *search*, takes the first
  result. Use a specific name to avoid mismatches.
- **`"id:6759252082"`** → exact iTunes *lookup*. **Always use this for GainFrame.**
  Use it for any app where search returns the wrong listing.

### `name` — optional short display label
The App Store `trackName` is often a long SEO string ("FitnessAI: Gym Workout
Plan", "Strong Workout Tracker Gym Log") that truncates badly on the cover icon
grid and outro recap. By default `fetch_apps.py` auto-shortens it (drops the
`: tagline` / ` - tagline` suffix). When that's still too long or wrong, set
`"name": "FitnessAI"` on the app to force the label. **Never set `name` on
GainFrame** — its computed `short_name` "GainFrame" is what the outro matches to
draw the green highlight ring.

### Screenshots — expect many apps to have NONE
The iTunes Search API returns `screenshotUrls` for only *some* apps (Strava, Hevy,
Nike, Spren, Abody.ai…). Major apps (MyFitnessPal, MacroFactor, MeThreeSixty,
ZOZOFIT…) return **0 screenshots**. **This is fine** — the renderer falls back to
a polished logo-card (editorial) / logo-panel (ranked) layout automatically.
Don't fight it; a clean logo card looks intentional.
- `"screenshots": [0]` — optional list of indices to pick *which* API screenshots
  to use (omit to use all available).
- `"local_screenshots": ["post-check-in-photo-score", "compare"]` — **GainFrame
  only.** GainFrame returns 0 API screenshots, so pull from the repo library at
  `docs/app-screenshots/1.21/` (filenames without extension). Pick shots that
  match the topic: `post-check-in-photo-score` (body fat %), `compare`
  (before/after), `muscle-map` (muscle dev), `weight-chart`, `ffmi`, `dashboard`.
  A bare name resolves against that dir; an entry with a `/` is treated as a
  repo-relative path (e.g. `docs/assets/tiktok-screenshots/dashboard.png`).
  **GainFrame standard:** ship ONE clean two-card detail slide just like the
  other apps — `["docs/assets/tiktok-screenshots/dashboard.png",
  "docs/assets/tiktok-screenshots/deep-dive-compare.png"]`. Pair a data-forward
  screen (dashboard) with a visual one (before/after compare) so the two cards
  read as distinct. Source screenshots must be **raw full-screen exports** (no
  phone-bezel mockups) so they crop cleanly to cards like every other app.

### Editorial spec
```json
{
  "format": "editorial",
  "slug": "5-fitness-apps-every-enthusiast-needs",
  "cover": {
    "kicker": "Health & Fitness",
    "title": "5 Fitness Apps Every Enthusiast Needs",
    "accent_word": "Needs",
    "subtitle": "The 2026 starter pack"
  },
  "apps": [
    {
      "query": "Strava: Run, Bike, Hike",
      "screenshots": [0, 1],
      "tagline": "The social network for athletes",
      "callouts": ["Track every run & ride", "Segments & leaderboards", "Kudos from your crew"],
      "description": "Strava turns every run, ride, and hike into a shareable map with deep stats."
    },
    {
      "query": "id:6759252082",
      "local_screenshots": ["post-check-in-photo-score", "compare"],
      "tagline": "See your body actually change",
      "callouts": ["AI scores your progress photos", "Track body composition", "Side-by-side compare"],
      "description": "GainFrame grades your progress photos with AI and tracks body composition over time."
    }
  ],
  "caption": "The 5 apps living on every serious lifter's home screen in 2026 👀 ...",
  "hashtags": ["fitnessapps", "gymtok", "fitnesstech", "progresspics", "gymmotivation"]
}
```

### Ranked spec
Same shape, plus per-app `rank` and `cons`. The renderer counts **down** (#5
first, ending on #1). GainFrame at `rank: 3`.
```json
{
  "format": "ranked",
  "slug": "5-body-fat-ai-apps-ranked",
  "cover": {
    "kicker": "Ranked 2026",
    "title": "5 Body-Fat AI Apps, Ranked",
    "accent_word": "Ranked",
    "subtitle": "Which one actually nails your body fat %?"
  },
  "apps": [
    {
      "query": "Spren Body Composition Scanner",
      "screenshots": [0],
      "rank": 1,
      "tagline": "Body fat % from your phone camera",
      "callouts": ["Camera-based body composition", "Validated against DEXA", "Tracks HRV & recovery too"],
      "cons": ["Pricey subscription", "Light on progress photos"],
      "description": "The most complete pick, if you'll pay for it."
    },
    {
      "query": "id:6759252082",
      "local_screenshots": ["post-check-in-photo-score", "compare"],
      "rank": 3,
      "tagline": "Body fat from a single progress photo",
      "callouts": ["AI scores your progress photos", "Body fat % from one photo", "AI coach explains what changed"],
      "cons": ["iOS only (for now)"],
      "description": "GainFrame reads a normal progress photo — no hardware, no 3D rig."
    }
  ],
  "caption": "I ranked 5 body-fat AI apps so you don't have to 👀 ...",
  "hashtags": ["bodyfat", "fitnessapps", "gymtok", "bodycomposition", "fittok"]
}
```

### Copy budgets (keep text from overflowing the deterministic layout)
- `tagline`: ≤ ~5 words (1 line editorial header, ≤2 lines ranked).
- `callouts`: 2–3 items, ≤ ~4 words each (rendered as ✓ chips / PROS rows).
- `cons` (ranked): 1–2 items, ≤ ~4 words each (rendered as ✕ CONS rows).
- `description`: 1–2 sentences (clamped to 2–3 lines).
- Cover `title`: 4–8 words; set `accent_word` to one word rendered in green.

---

## Phase 2: Fetch assets

```bash
python3 fetch_apps.py ../../../docs/assets/tiktok/apps/<slug>/spec.json
```
Downloads + caches each app's hi-res logo (1024px) and screenshots (1080×1920),
copies GainFrame's `local_screenshots`, and writes `assets/manifest.json` with
resolved `name`, `rating`, `rating_count`, `genre`, plus all creative fields.

**Review the printed summary.** For each app it prints `logo=ok`, shot count, and
`⭐rating (count)`. If an app shows the wrong name or `0 shots` where you expected
screenshots, fix the `query` (switch to `id:`) and re-run. Re-running is cheap;
assets are cached by filename — to force a re-download, delete the cached file
first.

---

## Phase 3: Render

```bash
python3 render.py ../../../docs/assets/tiktok/apps/<slug>/
```
Dispatches on the manifest `format` field. Writes `slide-0-cover` → per-app
slides → `slide-N-outro`, each as PNG + WebP, plus `content.md`. Fully
deterministic: **pure white #FFFFFF canvas**, real logos with a hairline border
(so white logos don't vanish on white), accurate partial-fill star ratings,
GainFrame green (#34d26f) accents, outro recap with a green ring on GainFrame.

---

## Phase 4: Review

Open every slide and check:
- **Cover**: title doesn't collide with subtitle; icon grid centered; all logos
  crisp.
- **Detail/ranked slides**: header name not clipped; star rating reads right;
  callouts/PROS/CONS not overrunning; description not truncated mid-word.
- **Logo-card / logo-panel** (screenshot-less apps): logo centered on its panel.
- **Outro**: GainFrame has the green ring + green label.

Fix copy in `spec.json` (shorten an overflowing callout/description), re-run
fetch only if assets changed, then re-run render. Iterate until clean.

---

## Phase 5: Log + sync to phone (iCloud)

1. Append to `docs/assets/tiktok/apps/POST_LOG.md` (create if missing):
   ```
   ## <YYYY-MM-DD> — <Cover Title>
   - Slug: <slug>
   - Format: editorial | ranked
   - Apps: <N> (GainFrame at #<slot>)
   - Status: Done
   ```
2. Sync slides + caption to the phone:
   ```bash
   SLUG="<slug>"
   DEST="/Users/michael.rode/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
   mkdir -p "$DEST"
   cp ../../../docs/assets/tiktok/apps/$SLUG/slide-*.png "$DEST/"
   cp ../../../docs/assets/tiktok/apps/$SLUG/content.md "$DEST/"
   echo "✅ Synced → TikTok-Drafts/$SLUG"
   ```
   Files appear in **Files app → iCloud Drive → TikTok-Drafts → <slug>**.

---

## Rules

- **Pure white (#FFFFFF) background — always.** This holds even when a reference
  example the user provides uses dark gym-photo backgrounds; the user explicitly
  chose white/on-brand for these formats. The renderer hard-codes white; never
  add dark or photographic backgrounds. (See memory: TikTok format brand defaults.)
- **GainFrame in the middle** (editorial #3–4, ranked #3). Never #1, never last.
- **GainFrame is always `query: "id:6759252082"`** — its App Store listing
  returns 0 API screenshots, so feed it visuals via `local_screenshots`: two
  raw full-screen exports cropped into the detail-slide cards, exactly like the
  other apps. Pick a data screen + a visual screen so the two cards read as
  distinct. Avoid phone-bezel mockups and App Store promo images (baked-in
  headlines/gray bg) — they don't crop cleanly into cards.
- **Screenshot-less apps are first-class.** Don't drop an app or swap formats just
  because it has no API screenshots — the logo-card/panel fallback is intended.
- **Every con must be true.** Frame competitors honestly (hardware/subscription
  friction is fair game); never fabricate a weakness.
- **No AI image generation, no Gemini, no secrets.** This format is 100%
  deterministic Pillow. (Contrast with `/tiktok`, which does call Gemini.)
- **File names use hyphens** (`slide-1.png`), never underscores — iCloud sync and
  any gallery depend on it.
- **Respect copy budgets** in Phase 1; the layout is fixed-size and will clip
  overlong strings.

## Reference files

| File | Purpose |
|------|---------|
| `.agent/skills/tiktok-apps/fetch_apps.py` | Resolves apps via iTunes API, downloads assets, writes `manifest.json` |
| `.agent/skills/tiktok-apps/render.py` | Composites all slides + `content.md` from the manifest (both formats) |
| `docs/assets/tiktok/apps/<slug>/spec.json` | Per-post input you author |
| `docs/app-screenshots/1.21/` | GainFrame screenshot library for `local_screenshots` (check for newer version dirs) |
| `web/content/blog/*.mdx` | Optional content source — post angles, GainFrame claims, feature highlights |
| `docs/assets/tiktok/apps/5-fitness-apps-every-enthusiast-needs/` | Worked editorial example |
| `docs/assets/tiktok/apps/5-body-fat-ai-apps-ranked/` | Worked ranked example |
| `docs/assets/tiktok/apps/5-glp1-ozempic-cut-apps/` | Worked editorial example (blog-sourced, GLP-1) |
| `docs/assets/tiktok/apps/5-muscle-gain-apps-ranked/` | Worked ranked example (blog-sourced, all-hero lineup) |
| `docs/assets/tiktok/apps/POST_LOG.md` | Running log of app-listicle posts |
