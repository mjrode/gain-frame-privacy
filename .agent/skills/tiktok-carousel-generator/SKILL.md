---
name: TikTok Carousel Generator
description: Interactive workflow for generating GainFrame mascot TikTok carousel posts — from topic ideation through text iteration to Nano Banana image generation.
triggers:
  - "tiktok post"
  - "tiktok carousel"
  - "new tiktok"
  - "mascot post"
  - "carousel post"
---

# TikTok Carousel Generator Skill

## Overview
This skill orchestrates the creation of TikTok carousel comic posts featuring the GainFrame mascot character. It follows a phased conversational workflow: brainstorm or select a topic, draft the slide text (cover + 4-5 numbered slides), iterate until the copy is sharp, then generate each **complete slide image** (illustration + text) using Antigravity's `generate_image` tool with `ImagePaths` referencing the mascot character sheet for visual consistency.

Every post uses the same mascot character, visual style, and layout — ensuring brand consistency across all content. Text banners and subtitles are baked directly into the generated images — no CapCut/Canva compositing needed.

## CRITICAL: Read the Style Guide First

Before doing ANYTHING in this workflow, you MUST read the mascot style guide:
```
view_file /Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/STYLE_GUIDE.md
```

This file contains:
- Character design specs (bracket-frame head, body, clothing)
- Visual style constants (background color, palette, aspect ratio)
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

**Goal:** Nail the scroll-stopping cover slide title.

1. **Draft 3 title options** using the proven formats:
   - **Authority:** "THE ULTIMATE [TOPIC]"
   - **Listicle:** "TOP 5 [THINGS] FOR [GOAL]"
   - **Fear/Curiosity:** "THE #1 MISTAKE [NEGATIVE OUTCOME]"
   - **Command:** "STOP [BAD HABIT]"
   - **Question:** "[PROVOCATIVE QUESTION]?"
   - **Conditional:** "DO THIS IF YOU'RE [CONDITION]"

2. **Accent word.** Identify which word(s) in the title should be highlighted in the accent color (red). Typically the body part, the action word, or the hook word. Examples:
   - "THE PERFECT **ARM** WORKOUT"
   - "Build Your Perfect **Bulking Routine**"
   - "STOP SKIPPING YOUR **SHOULDER WARM-UP**"

3. **Present to user.** Show all 3 options with the accent word marked. Wait for approval or iteration.

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

**Goal:** Generate 6 mascot illustrations (1 cover + 5 slides) with perfect character consistency.

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

2. **Read the style guide** to get the base prompt prefix:
   ```
   view_file assets/gf-mascot/STYLE_GUIDE.md
   ```

#### Generate Each Image

For each slide, use `generate_image` with this configuration:

**Required for EVERY call:**
```
ImagePaths: [
  "/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gf-mascot-template.jpeg",
  "/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/[closest-scene-ref].jpeg"
]
```

Pick a second reference image matching the scene type:
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

At the top, a black rounded rectangle banner with bold white text reads "[NUMBER]. [TITLE]". 
Below, bold dark text reads "[SUBTITLE]." Clean cartoon style, thick outlines, flat colors, 
warm beige background. 4:5 TikTok format. No watermarks.
```

**Prompt template for cover slide:**
```
A cartoon illustration of this exact character from the reference images in a new scene. 
CRITICAL: The head is NOT a solid square — it is four separate corner brackets floating 
in space with the background visible between them. The eyes and S-curve nose float inside 
the bracket frame with NO background fill, NO square, NO box behind them. Copy the head 
design from the reference images exactly — open bracket corners, not a filled square.

Scene: [MASCOT in a representative pose for the topic]

Large bold text prominently displayed reads "[COVER TITLE]" with the word "[ACCENT WORD]" in red. 
Very prominent and eye-catching. Clean cartoon style, thick outlines, flat colors, 
warm beige background. 4:5 TikTok format. No watermarks.
```

**IMPORTANT:**
- Generate ONE image at a time, not in parallel. This lets you course-correct style drift.
- After each generation, show the result to the user and ask if it matches the style. If not, refine the prompt.
- Always include `gf-mascot-template.jpeg` as the first reference image.
- Keep concurrency ≤ 1 for character consistency. Quality > speed.

#### Save Images
After each approved image, copy it to the output directory:
```bash
cp [generated-image-path] assets/tiktok/comic/[slug]/slide-[N].jpeg
```

Name the files:
- `slide-0-cover.jpeg`
- `slide-1.jpeg` through `slide-5.jpeg`

---

### Phase 4: Review & Export

1. **Show the full set.** Display all 6 images together so the user can review the complete carousel.

2. **Verify text rendering.** Check that the text in each generated image is readable and correctly spelled. If any text is garbled or cut off, regenerate that slide with a simplified text prompt.

3. **Generate caption & hashtags.** Draft:
   - **Caption:** 2-3 sentences, hook-first, with a CTA ("Save this for your next gym session 💪")
   - **Hashtags:** 5-10 relevant hashtags mixing broad (#gymtok #fitness) and niche (#gymmistakes #workoutsplit)

4. **Save the text content** to a `content.md` file in the output directory for reference:
   ```
   assets/tiktok/comic/[slug]/content.md
   ```
   Include: title, all slide text, caption, hashtags, and the exact Nano Banana prompts used (for reproducibility).

5. **Update the post log.** Append to `assets/tiktok/comic/POST_LOG.md` (create if doesn't exist):
   ```
   ## [Date] — [Title]
   - Slug: [slug]
   - Slides: 6
   - GainFrame mention: Yes/No (Slide #)
   - Status: Ready for text overlay
   ```

---

## Rules & Constraints

- **Never skip the text iteration phase.** The copy must be approved before generating any images. Bad copy = wasted generation credits.
- **One image at a time.** Do NOT batch-generate all images. Character consistency requires sequential generation with review.
- **Always use the base prompt prefix.** The mascot's visual identity is defined by the exact prompt prefix in the style guide. Never freestyle it.
- **Text is baked IN.** All text (titles, subtitles, numbers) is generated directly in the image via Nano Banana. No post-processing in CapCut/Canva needed.
- **Save everything.** Every carousel must have its own directory under `assets/tiktok/comic/[slug]/` with all images AND a `content.md` with the text + prompts used.
- **Prompt reproducibility.** Always save the exact prompt used for each image in `content.md`. If a style works well, it becomes the new reference.
- **Exactly 1 GainFrame mention per carousel.** Always included, never in the first 3 slides. Pure value first — product mention is earned, not forced.

## Reference Files
- `assets/gf-mascot/STYLE_GUIDE.md` — **MUST READ FIRST** — Character design, visual constants, title patterns, prompt templates
- `assets/gf-mascot/gf-mascot-template.jpeg` — Mascot character sheet (neutral standing pose)
- `assets/gf-mascot/mirror-mascot.jpeg` — Example: mirror reflection scene
- `assets/gf-mascot/mascot-form.jpeg` — Example: good vs. bad form (✅/❌ comparison)
- `assets/gf-mascot/mascot-legs.jpeg` — Example: gym equipment interaction
- `assets/gf-mascot/mascot-pictures.jpeg` — Example: progress photos with phone tripod
- `assets/gf-mascot/mascot-sleep.jpeg` — Example: recovery/sleeping scene
- `assets/tiktok/comic/POST_LOG.md` — Running log of all generated carousels
