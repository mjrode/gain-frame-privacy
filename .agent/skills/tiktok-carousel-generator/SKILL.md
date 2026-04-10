---
name: TikTok Carousel Generator
description: Interactive workflow for generating GainFrame Guy TikTok carousel posts — from topic ideation through text iteration to Nano Banana image generation.
triggers:
  - "tiktok post"
  - "tiktok carousel"
  - "new tiktok"
  - "mascot post"
  - "carousel post"
  - "gainframe guy"
---

# TikTok Carousel Generator Skill

## Overview
This skill orchestrates the creation of TikTok carousel comic posts featuring **GainFrame Guy** — the GainFrame mascot character. It follows a phased conversational workflow: brainstorm or select a topic, draft the slide text (cover + 4-5 numbered slides), iterate until the copy is sharp, then generate each **complete slide image** (illustration + text) using Antigravity's `generate_image` tool with `ImagePaths` referencing the mascot character sheet for visual consistency.

Every post uses the same mascot character, visual style, and layout — ensuring brand consistency across all content. The GainFrame Guy branding badge ONLY appears on the cover slide. Text banners and subtitles are baked directly into the generated images by Gemini — no CapCut/Canva compositing or programmatic text overlays needed.

## CRITICAL: Read the Style Guide First

Before doing ANYTHING in this workflow, you MUST read the mascot style guide:
```
view_file /Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/STYLE_GUIDE.md
```

This file contains:
- Character design specs (bracket-frame head, body, clothing)
- Visual style constants (background color, palette, aspect ratio)
- **Typography rules** (Impact-style sans-serif for titles, Helvetica-style for subtitles — NO handwritten fonts)
- **GainFrame Guy branding badge** specs (top-left on every slide)
- Slide layout patterns (cover + numbered slides)
- Competitor title patterns for inspiration
- The exact Nano Banana base prompt prefix to use for every image

## The Workflow

Follow these phases sequentially. **Do not skip ahead. Get user approval before moving between phases.**

---

### Phase 0: Topic Selection

**Goal:** Lock in the post topic and angle.

1. **Suggest topics if needed.** If the user doesn't have a topic, propose 5 options using the proven title formats from the style guide. Pull from these categories:
   - Workout structure (splits, routines, program design)
   - Exercise recommendations (best exercises for X body part)
   - Common mistakes (form errors, programming mistakes, gym etiquette)
   - Fundamentals & knowledge (sets/reps/rest, progressive overload, mind-muscle connection)
   - Body composition & nutrition (cutting, bulking, protein, macros)
   - Recovery & lifestyle (sleep, warm-ups, stretching, deload weeks)
   - Motivation & mindset (consistency, patience, realistic expectations)
   - Progress tracking (taking progress photos, measuring gains, body fat estimation)
   - GainFrame features (AI analysis, progress comparison, deep dive reports)

2. **Confirm the angle.** Ask: "What's the one thing you want someone to walk away knowing after seeing this post?" This ensures the slides have a clear through-line, not just random tips.

3. **GainFrame mention (mandatory).** Every carousel MUST include exactly 1 natural GainFrame tie-in. Place it on slide 4 or 5. It should feel like a natural recommendation, not an ad. Example: "Track your progress with GainFrame" or "GainFrame helps catch trends you'd miss."

---

### Phase 1: Cover Slide Text

**Goal:** Nail the scroll-stopping cover slide title that is FULLY VISIBLE in TikTok's profile grid.

**⚠️ TITLE LENGTH IS CRITICAL.** TikTok crops 4:5 covers to ~1:1 square thumbnails in the profile grid, clipping ~25% from each side. Titles that are too wide get cut off and look unprofessional. EVERY title must follow these rules:

- **Max 3-4 words per line** — short, punchy, stacked vertically
- **Max 2-3 stacked lines** — never more than 3 lines of title text
- **Total title: 4-8 words max** — if you can't say it in 8 words, simplify
- **Center-aligned** — text sits in the middle 50% of the image width
- Study Blue Bro examples: "THE PERFECT PUSH DAY" (5 words), "STOP SKIPPING LEG DAY" (4 words)

1. **Draft 3 title options** using the proven formats:
   - **Authority:** "THE ULTIMATE [TOPIC]" (e.g., "THE ULTIMATE LEG DAY")
   - **Listicle:** "TOP 5 [THINGS]" (e.g., "TOP 5 CHEST EXERCISES")
   - **Fear/Curiosity:** "THE #1 MISTAKE" + second line (e.g., "THE #1 MISTAKE / KILLING YOUR GAINS")
   - **Command:** "STOP [BAD HABIT]" (e.g., "STOP SKIPPING LEGS")
   - **Question:** "[SHORT QUESTION]?" (e.g., "IS YOUR SPLIT WRONG?")
   - **Conditional:** "DO THIS IF [CONDITION]" (e.g., "DO THIS IF YOU'RE SKINNY FAT")

2. **Accent word.** Identify which word(s) in the title should be highlighted in the accent color (red). Typically the body part, the action word, or the hook word. Examples:
   - "THE PERFECT **ARM** WORKOUT"
   - "STOP SKIPPING **LEG DAY**"
   - "IS YOUR **SPLIT** WRONG?"

3. **Grid-check the title.** Before presenting, imagine the title cropped to a center square. Can you still read the full title? If ANY word would be clipped, shorten it.

4. **Present to user.** Show all 3 options with the accent word marked. Wait for approval or iteration.

---

### Phase 2: Numbered Slides Text (1-5)

**Slide count:** Default to 5 numbered slides, but 4 is acceptable if the topic doesn't need 5. Ask the user if they have a preference.

**Goal:** Write punchy, scannable content for 5 slides.

For each slide, draft:
- **Title:** Short, bold statement (3-8 words). This goes in the black number banner.
- **Subtitle:** 1 sentence MAX. Short, punchy, conversational. Think "Carbs provide quick energy and help fuel your workouts" — not a paragraph. Should stand alone without the illustration.
- **Scene description (internal — not shown to user):** Brief description of what the mascot should be doing in the illustration. This will become the image prompt later.

**Slide Writing Rules:**
- Each slide must be self-contained (someone might screenshot just one)
- Use short declarative sentences — no fluff
- Mix up slide compositions:
  - At least 1 "do vs. don't" comparison (two mascots: ✅ vs ❌)
  - At least 1 solo mascot action scene
  - Consider: mirror/dream sequence, prop interaction, before/after
- The slides should build on each other — not just random tips
- **GainFrame mention is MANDATORY** — place it on slide 4 or 5 (never the first 3). It should feel like a natural recommendation.

**Present the full draft to the user as a formatted table:**

| Slide | Title | Subtitle | Scene Idea |
|-------|-------|----------|------------|
| Cover | [TITLE] | — | [Scene] |
| 1 | [Title] | [Subtitle text] | [Scene] |
| 2 | [Title] | [Subtitle text] | [Scene] |
| 3 | [Title] | [Subtitle text] | [Scene] |
| 4 | [Title] | [Subtitle text] | [Scene] |
| 5 | [Title] | [Subtitle text] | [Scene] |

**Iterate with the user until they approve all slide text.**

---

### Phase 3: Image Generation

**Goal:** Generate 6 GainFrame Guy illustrations (1 cover + 5 slides) with perfect character consistency, clean typography, and branding.

#### ⚠️ CRITICAL: Tool Selection

**USE:** Antigravity's built-in `generate_image` tool with `ImagePaths` pointing to mascot reference files.
**DO NOT USE:** `GEMINI_GENERATE_IMAGE` via Rube/Composio — it cannot pass reference images as real image data.

See `STYLE_GUIDE.md > Prompt Engineering Notes` for full rationale.

#### Setup
1. **Create output directory:**
   ```bash
   mkdir -p /Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/comic/[slug]
   ```
   Use a short kebab-case slug based on the topic (e.g., `gym-advice-must-know`, `perfect-leg-day`).

2. **Read the style guide** to get the base prompt prefix, typography rules, and badge specs:
   ```
   view_file assets/gf-mascot/STYLE_GUIDE.md
   ```

#### Generate Each Image

For each slide, use `generate_image` with this configuration:

**Required ImagePaths:**
- **Cover Slide (3 references):** Include `gf-mascot-template.jpeg`, the scene reference, AND `gary-badge.png` for the top-left corner branding.
- **Numbered Slides (2 references):** Include `gf-mascot-template.jpeg` and the scene reference. DO NOT include `gary-badge.png` as numbered slides do not have the badge.

Example for Numbered Slides:
```
ImagePaths: [
  "/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gf-mascot-template.jpeg",
  "/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/[closest-scene-ref].jpeg"
]
```

- Pick a scene reference image matching the scene type:
  - Flexing/mirror → `mirror-mascot.jpeg`
  - Form comparison → `mascot-form.jpeg`
  - Gym equipment → `mascot-legs.jpeg`
  - Phone/photos → `mascot-pictures.jpeg`
  - Sleeping/recovery → `mascot-sleep.jpeg`

**Prompt template for numbered slides:**
```
A cartoon illustration of this exact character from the reference images in a new scene. 
CRITICAL: The head is NOT a solid square — it is four separate corner brackets floating 
in space with the background visible between them. The eyes and S-curve nose float inside 
the bracket frame with NO background fill, NO square, NO box behind them. Copy the head 
design from the reference images exactly — open bracket corners, not a filled square.

Scene: [SCENE DESCRIPTION specific to this slide]

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the 
BOTTOM 65% of the image.

At the very top, a black rounded rectangle banner with bold white text in Impact-style 
condensed sans-serif reads "[NUMBER]. [TITLE]" (ALL CAPS). Below, bold clean sans-serif 
text (Helvetica-style) reads "[SUBTITLE]."

TYPOGRAPHY: Use bold Impact-style condensed sans-serif font for ALL title text and 
number banners (ALL CAPS). Use clean Helvetica-style sans-serif for subtitle/body text. 
NO handwritten, script, or decorative fonts anywhere.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 
4:5 TikTok format (1080x1350). No watermarks whatsoever.
```

**Prompt template for cover slide:**

**⚠️ TIKTOK GRID SAFE ZONE:** TikTok crops 4:5 images to ~1:1 square thumbnails in the profile grid, clipping some space from each side and cropping top/bottom significantly. ALL cover title text must be:
- Centered horizontally, taking up around **75% to 80%** of the image width
- Positioned vertically centered or slightly above center within the top area — NOT at the very top edge
- **Max 4-5 words per line**, stacked into 2-3 short lines
- Text needs moderate margins on left/right so it doesn't touch the edges and respects the crop

```
A cartoon illustration of this exact character from the reference images in a new scene. 
CRITICAL: The head is NOT a solid square — it is four separate corner brackets floating 
in space with the background visible between them. The eyes and S-curve nose float inside 
the bracket frame with NO background fill, NO square, NO box behind them. Copy the head 
design from the reference images exactly — open bracket corners, not a filled square.

In the top-left corner, draw a small branding badge: a tiny version of the character's 
bracket-frame head icon (matching the badge reference image) next to bold sans-serif text 
reading "GAINFRAME GUY". Keep it small like a watermark — about 10% of image width.

Scene: [MASCOT in a representative pose for the topic]

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the 
BOTTOM 60% of the image.

TITLE TEXT PLACEMENT (CRITICAL — READ CAREFULLY): 
- The title text MUST be placed in the TOP 40% of the image.
- The title text MUST be raw text directly on the background. DO NOT place the title inside any shape, box, or black rounded rectangle banner.
- The title text MUST be centered horizontally, taking up around 75% to 80% of the image width.
- Leave moderate margins on both the left and right sides so it doesn't touch the edges.
- Stack the title into 2-3 SHORT lines (max 4-5 words per line), centered.
- Position the text block vertically centered within the top 40% or slightly above center.
- The title reads "[COVER TITLE]" with the word "[ACCENT WORD]" in red (#E53935). 
- Very prominent bold text, eye-catching.

TYPOGRAPHY: Use bold Impact-style condensed sans-serif font for the title (ALL CAPS). 
NO handwritten, script, or decorative fonts.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 
4:5 TikTok format (1080x1350). No watermarks except the GainFrame Guy badge.
```

**IMPORTANT:**
- Generate ONE image at a time, not in parallel. This lets you course-correct style drift.
- After each generation, show the result to the user and ask if it matches the style. If not, refine the prompt.
- Always include `gf-mascot-template.jpeg` as a reference image. Only include `gary-badge.png` for the cover slide.
- Keep concurrency ≤ 1 for character consistency. Quality > speed.

#### Save Images

Once Nano Banana generates the slide, save it directly to the correct final path. No programmatic text overlay script is needed, as Gemini generates the image with text baked in natively.

CRITICAL EXACT FILE NAMING YOU MUST USE TO SAVE THE IMAGES:
- `slide-0-cover.png` (for the cover)
- `slide-1.png`
- `slide-2.png`
- `slide-3.png`
- `slide-4.png`
- `slide-5.png`

Do NOT name them `cover.png` or `slide1.png`. The web gallery explicitly searches for `slide-0-cover` and `slide-[N]` with dashes. Failure to use this exact naming convention will result in broken images on the website.

---

### Phase 4: Review & Export

1. **Show the full set.** Display all 6 images together so the user can review the complete carousel.

2. **Verify text rendering.** Check that the text in each generated image is readable and correctly spelled. If any text is garbled or cut off, regenerate that slide with a simplified text prompt.

3. **Generate caption & hashtags.** Draft:
   - **Caption:** 2-3 sentences, hook-first, with a CTA ("Save this for your next gym session 💪")
   - **Hashtags:** 5-10 relevant hashtags mixing broad (#gymtok #fitness) and niche (#gymmistakes #workoutsplit)

4. **Save the text content** to a `content.md` file in the output directory — this is a **copy-paste ready** file for TikTok posting:
   ```
   assets/tiktok/comic/[slug]/content.md
   ```
   Include ONLY: the caption and hashtags. Do NOT include slide text, prompts, or other metadata. The file should be minimal — just what gets pasted into TikTok.

5. **Update the post log.** Append to `assets/tiktok/comic/POST_LOG.md` (create if doesn't exist):
   ```
   ## [Date] — [Title]
   - Slug: [slug]
   - Slides: 6
   - GainFrame mention: Yes/No (Slide #)
   - Status: Done
   ```

6. **Register in the comics gallery.** Add a new entry to the top of the `COMICS_MANIFEST` array in `assets/tiktok/comic/comics-manifest.js` so the comic automatically appears on the website gallery page. Insert it as the **first entry** (newest first) with today's date. Use `"png"` for ext unless the images were saved as `.jpeg`.
   ```js
   { slug: "[slug]", title: "[Cover Title]", date: "[YYYY-MM-DD]", ext: "png" },
   ```
   Make sure the title matches the cover slide title (properly capitalized, no ALL-CAPS).

---

## Rules & Constraints

- **Never skip the text iteration phase.** The copy must be approved before generating any images. Bad copy = wasted generation credits.
- **One image at a time.** Do NOT batch-generate all images. Character consistency requires sequential generation with review.
- **Always use the base prompt prefix.** The mascot's visual identity is defined by the exact prompt prefix in the style guide. Never freestyle it.
- **GainFrame Gary badge.** Only the COVER slide gets the top-left branding badge. Do not include it on numbered slides.
- **Always specify fonts.** Every prompt must explicitly request Impact-style condensed sans-serif for titles and clean sans-serif for subtitles. Never let the AI choose fonts freely.
- **No Text Overlay Script.** You do NOT use any Python script to overlay text. Gemini generates the text directly in the image. If the text fails, adjust your prompt and regenerate the slide. Save the final output using the strict `slide-0-cover.png` and `slide-[N].png` formats.
- **Save everything.** Every carousel must have its own directory under `assets/tiktok/comic/[slug]/` with all images AND a `content.md` with the text + prompts used.
- **Prompt reproducibility.** Always save the exact prompt used for each image in `content.md`. If a style works well, it becomes the new reference.
- **Exactly 1 GainFrame mention per carousel.** Always included, never in the first 3 slides. Pure value first — product mention is earned, not forced.

## Reference Files
- `assets/gf-mascot/STYLE_GUIDE.md` — **MUST READ FIRST** — Character design, visual constants, typography, badge specs, title patterns, prompt templates
- `assets/gf-mascot/gf-mascot-template.jpeg` — Mascot character sheet (neutral standing pose)
- `assets/gf-mascot/gary-badge.png` — **Head-only badge icon** for top-left branding (include ONLY when generating the cover slide)
- `assets/gf-mascot/mirror-mascot.jpeg` — Example: mirror reflection scene
- `assets/gf-mascot/mascot-form.jpeg` — Example: good vs. bad form (✅/❌ comparison)
- `assets/gf-mascot/mascot-legs.jpeg` — Example: gym equipment interaction
- `assets/gf-mascot/mascot-pictures.jpeg` — Example: progress photos with phone tripod
- `assets/gf-mascot/mascot-sleep.jpeg` — Example: recovery/sleeping scene
- `assets/tiktok/comic/POST_LOG.md` — Running log of all generated carousels
- `assets/tiktok/comic/comics-manifest.js` — Gallery manifest (add new comics here for them to appear on the website)
