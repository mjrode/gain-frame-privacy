---
name: tiktok-motivate
description: "Creates gritty, photographic GainFrame motivation TikTok carousels that turn a comeback or discipline theme into a cover, five value-first habit slides, and a final GainFrame tracking reveal. Use when the user says 'TikTok motivate', 'motivation carousel', 'discipline carousel', 're-enter your prime', 'locked in carousel', or asks for a variation of GainFrame's cinematic motivational photo-post format."
---

# TikTok Motivate

Create original 4:5 TikTok photo carousels with a motivational arc and an earned GainFrame reveal. This is a photographic format, not the GainFrame Guy comic and not the deterministic app-listicle format.

Read [visual-system.md](references/visual-system.md) before drafting or generating a carousel.

## Output contract

Save each post under `docs/assets/tiktok/motivate/<slug>/`:

```text
slide-0-cover.png
slide-1.png
slide-2.png
slide-3.png
slide-4.png
slide-5.png
slide-6.png
spec.md
content.md
```

Use a dated suffix only when the undated slug already exists. Never overwrite an existing post unless the user explicitly asks.

## Workflow

### 1. Lock the angle

Turn the request into one clear promise such as rebuilding discipline, returning after a layoff, or making progress visible. If the user supplies a reference post, extract its structure and emotional rhythm without copying its branded interface, imagery, watermark, or exact visual identity.

Default to seven slides:

1. Cover: identity-level comeback hook.
2. Habit 1: start the day deliberately.
3. Habit 2: train consistently.
4. Habit 3: eat for the goal.
5. Habit 4: remove distractions.
6. Habit 5: strengthen attention or recovery.
7. GainFrame payoff: track the change.

The final slide must feature GainFrame. Keep the first six slides value-first and unbranded.

### 2. Draft compact copy

For every slide, define:

- `title`: 2-6 words, ALL CAPS.
- `subtitle`: at most one short sentence; omit when the image and title are enough.
- `scene`: one concrete photographic moment.

Keep all in-image text short enough for native image generation. Do not add paragraph copy, fake metrics, fake testimonials, or medical claims. Use `GAINFRAME` exactly.

Present the complete copy and visual direction for approval before spending generation credits, unless the user has already approved them explicitly.

### 3. Build a prompt pack

Write `spec.md` before generation with:

- theme and audience;
- visual family and palette;
- each slide's exact text and scene;
- input images and their roles;
- the exact prompt used for each slide.

Use local reference images only as style, composition, or product references. Never ask the image model to reproduce TikTok chrome or another creator's watermark.

For the GainFrame slide, use these project assets when available:

- `docs/assets/tiktok-screenshots/dashboard.png` — product UI reference.
- `docs/assets/tiktok-screenshots/deep-dive-compare.png` — comparison UI reference.
- `docs/assets/tiktok/apps/5-glp1-ozempic-cut-apps/assets/gainframe/logo.png` — app icon reference.

### 4. Generate sequentially

Use the built-in OpenAI image-generation tool through the `imagegen` skill. Generate one complete 4:5 slide at a time with text baked into the image.

1. Generate `slide-0-cover.png` first.
2. Inspect typography, spelling, crop safety, and visual tone.
3. Use the accepted cover as the primary style reference for the remaining slides.
4. Generate each numbered slide sequentially, using the preceding accepted slide as an additional consistency reference when useful.
5. Regenerate only the failed slide when text, anatomy, branding, or composition drifts.

Do not use programmatic text overlays. Do not generate all slides in parallel.

The built-in generator may return a taller 2:3 canvas even when prompted for 4:5. If that happens, preserve the complete generated frame by extending the dark side edges to 4:5 and resizing to 1080×1350. Never crop required text or the GainFrame lockup merely to force the aspect ratio.

### 5. Review

Validate every slide before delivery:

- exactly 4:5 or safely croppable to 4:5;
- title and subtitle are verbatim, correctly spelled, and fully visible;
- title remains readable in TikTok's centered square grid crop;
- no TikTok UI, competitor watermark, random logo, or accidental brand mark;
- no extra limbs, malformed gym equipment, or illegible phone UI;
- consistent photography, grain, palette, and type treatment;
- only the final slide names or shows GainFrame.

Show the final set together. Fix localized failures instead of restarting the entire carousel.

### 6. Package the post

Write `content.md` with one casual caption followed by exactly five hashtags. Include `#gainframe` as one of the five. Keep it copy-paste ready and omit prompts or production notes.

If the user asks for phone delivery, copy the seven slides and `content.md` to:

`/Users/michael.rode/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/<slug>/`

## First reference set

Use `docs/assets/tiktok/motivate/re-enter-your-prime/` as the house-style reference once present. Preserve its pacing and visual grammar while changing the topic, scenes, copy, and supporting props for new variations.
