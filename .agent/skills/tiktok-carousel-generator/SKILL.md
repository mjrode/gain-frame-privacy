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
This skill orchestrates the creation of TikTok carousel posts featuring the GainFrame mascot character. It follows a phased conversational workflow: brainstorm or select a topic, draft the slide text (cover + 5 numbered slides), iterate until the copy is sharp, then generate each illustration using Nano Banana (GEMINI_GENERATE_IMAGE) with style-locked prompts referencing the mascot character sheet.

Every post uses the same mascot character, visual style, and layout — ensuring brand consistency across all content.

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
   - Body composition & nutrition (cutting, bulking, protein)
   - Recovery & lifestyle (sleep, warm-ups, stretching, deload weeks)
   - Progress tracking (taking progress photos, measuring gains — natural GainFrame tie-in)

2. **Confirm the angle.** Ask: "What's the one thing you want someone to walk away knowing after seeing this post?" This ensures the 5 slides have a clear through-line, not just random tips.

3. **GainFrame mention (optional).** Ask if one slide should naturally reference GainFrame/progress tracking, or if this post is pure value-add with no product mention. **Max 1 mention per carousel.**

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

**Goal:** Write punchy, scannable content for 5 slides.

For each slide, draft:
- **Title:** Short, bold statement (3-8 words). This goes in the black number banner.
- **Subtitle:** 1-3 lines of supporting text. Conversational, direct ("you" language). Should stand alone without the illustration.
- **Scene description (internal — not shown to user):** Brief description of what the mascot should be doing in the illustration. This will become the image prompt later.

**Slide Writing Rules:**
- Each slide must be self-contained (someone might screenshot just one)
- Use short declarative sentences — no fluff
- Mix up slide compositions:
  - At least 1 "do vs. don't" comparison (two mascots: ✅ vs ❌)
  - At least 1 solo mascot action scene
  - Consider: mirror/dream sequence, prop interaction, before/after
- The 5 slides should build on each other — not just random tips
- If a GainFrame mention was approved, place it on slide 4 or 5 (never the first 3)

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

**Goal:** Generate 6 mascot illustrations (1 cover + 5 slides) using Nano Banana.

#### Setup
1. **Create output directory:**
   ```bash
   mkdir -p /Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/[slug]
   ```
   Use a short kebab-case slug based on the topic (e.g., `gym-advice-must-know`, `perfect-leg-day`).

2. **Load reference images.** Before generating, view the mascot template and at least 2 existing slide examples from `assets/gf-mascot/` to calibrate your prompt descriptions:
   ```
   view_file assets/gf-mascot/gf-mascot-template.jpeg
   view_file assets/gf-mascot/mirror-mascot.jpeg
   ```

#### Generate Each Image

For each slide, use `RUBE_MULTI_EXECUTE_TOOL` with `GEMINI_GENERATE_IMAGE` and this structure:

**Prompt template:**
```
[BASE PROMPT PREFIX from Style Guide]

[SCENE DESCRIPTION specific to this slide]

The image should have no text, no words, no letters, no numbers, no watermarks. Vertical composition (portrait orientation). The character should be the focal point of the scene.
```

**Parameters:**
- `model`: `"gemini-3-pro-image-preview"` (best quality for character consistency)
- `aspect_ratio`: `"9:16"`
- `image_size`: `"2K"` (high quality for TikTok)

**IMPORTANT:**
- Generate ONE image at a time, not in parallel. This lets you course-correct style drift.
- After each generation, show the result to the user and ask if it matches the style. If not, refine the prompt.
- If the mascot character drifts (different head shape, missing red bracket, wrong body color), add more specificity to the prompt and retry.
- Keep concurrency ≤ 1 for character consistency. Quality > speed.

#### Save Images
After each approved image, download the s3url and save it to the output directory:
```bash
curl -L "[s3url]" -o assets/tiktok/[slug]/slide-[N].jpeg
```

Name the files:
- `slide-0-cover.jpeg`
- `slide-1.jpeg` through `slide-5.jpeg`

---

### Phase 4: Review & Export

1. **Show the full set.** Display all 6 images together so the user can review the complete carousel.

2. **Note what needs text overlay.** Remind the user which text goes on each slide (from Phase 2) — they'll add text banners in CapCut or Canva:
   - Cover: Title text (with accent-colored word)
   - Slides 1-5: Number banner + subtitle text

3. **Generate caption & hashtags (optional).** If the user wants, draft:
   - **Caption:** 2-3 sentences, hook-first, with a CTA ("Save this for your next gym session 💪")
   - **Hashtags:** 5-10 relevant hashtags mixing broad (#gymtok #fitness) and niche (#gymmistakes #workoutsplit)

4. **Save the text content** to a `content.md` file in the output directory for reference:
   ```
   assets/tiktok/[slug]/content.md
   ```
   Include: title, all slide text, caption, hashtags, and the Nano Banana prompts used (for reproducibility).

5. **Update the post log.** Append to `assets/tiktok/POST_LOG.md` (create if doesn't exist):
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
- **One image at a time.** Do NOT batch-generate all 6 images. Character consistency requires sequential generation with review.
- **Always use the base prompt prefix.** The mascot's visual identity is defined by the exact prompt prefix in the style guide. Never freestyle it.
- **No text in generated images.** All text (titles, subtitles, numbers) is added later by the user in CapCut/Canva. The AI-generated images are illustration-only.
- **Save everything.** Every carousel must have its own directory under `assets/tiktok/[slug]/` with all images AND a `content.md` with the text + prompts used.
- **Prompt reproducibility.** Always save the exact prompt used for each image in `content.md`. If a style works well, it becomes the new reference.
- **Max 1 GainFrame mention per carousel.** And never in the first 3 slides. Pure value first — product mention is earned, not forced.

## Reference Files
- `assets/gf-mascot/STYLE_GUIDE.md` — **MUST READ FIRST** — Character design, visual constants, title patterns, prompt templates
- `assets/gf-mascot/gf-mascot-template.jpeg` — Mascot character sheet (neutral standing pose)
- `assets/gf-mascot/mirror-mascot.jpeg` — Example: mirror reflection scene
- `assets/gf-mascot/mascot-form.jpeg` — Example: good vs. bad form (✅/❌ comparison)
- `assets/gf-mascot/mascot-legs.jpeg` — Example: gym equipment interaction
- `assets/gf-mascot/mascot-pictures.jpeg` — Example: progress photos with phone tripod
- `assets/gf-mascot/mascot-sleep.jpeg` — Example: recovery/sleeping scene
- `assets/tiktok/POST_LOG.md` — Running log of all generated carousels
