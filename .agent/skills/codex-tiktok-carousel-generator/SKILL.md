---
name: Codex TikTok Carousel Generator
description: Codex-specific copy of the GainFrame Guy TikTok carousel workflow. Use when creating TikTok carousel posts in Codex with OpenAI GPT Image 2 (`gpt-image-2`) for slide image generation.
triggers:
  - "codex tiktok"
  - "codex tiktok carousel"
  - "codex new tiktok"
  - "codex mascot post"
  - "gpt image 2 tiktok"
  - "gpt-image-2 tiktok"
  - "openai tiktok carousel"
  - "gpt image tiktok carousel"
---

# Codex TikTok Carousel Generator Skill

## Overview
This is a Codex-specific copy of the GainFrame TikTok carousel workflow. It orchestrates TikTok carousel comic posts featuring **GainFrame Guy** — the GainFrame mascot character. It follows the same phased conversational workflow as the original skill: brainstorm or select a topic, draft the slide text (cover + 4-5 numbered slides), iterate until the copy is sharp, then generate each **complete slide image** (illustration + text) with **OpenAI GPT Image 2** (`gpt-image-2`) using reference-image inputs for mascot and style consistency.

Do not edit the canonical `.agent/skills/tiktok/SKILL.md` when this skill is triggered. Treat it as source material only.

Every post uses the same mascot character, visual style, and layout — ensuring brand consistency across all content. The GainFrame Guy branding badge ONLY appears on the cover slide. Text banners and subtitles are baked directly into the generated images by GPT Image 2 — no CapCut/Canva compositing or programmatic text overlays needed.

## CRITICAL: Read the Style Guide First

Before doing ANYTHING in this workflow, you MUST read the mascot style guide:
```
view_file /Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md
```

This file contains:
- Character design specs (bracket-frame head, body, clothing)
- Visual style constants (background color, palette, aspect ratio)
- **Typography rules** (Impact-style sans-serif for titles, Helvetica-style for subtitles — NO handwritten fonts)
- **GainFrame Guy branding badge** specs (top-left on every slide)
- Slide layout patterns (cover + numbered slides)
- Competitor title patterns for inspiration
- The exact mascot base prompt prefix to adapt for every GPT Image 2 request

## Codex Image Generation Override

When this copied skill says to generate a slide image, use OpenAI **GPT Image 2** (`gpt-image-2`) via the Image API edits endpoint with reference images. OpenAI’s image generation guide says the edits endpoint can generate a new image using one or more image references, and accepts repeated `image[]=@path` inputs.

Use this shell pattern for each slide after substituting the prompt, output path, and references:

```bash
curl -sS -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "size=1024x1280" \
  -F "quality=medium" \
  -F "output_format=png" \
  -F "image[]=@/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg" \
  -F "image[]=@/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/tiktok/comic/discipline-not-motivation/slide-1.png" \
  -F "prompt=${PROMPT_TEXT}" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/tiktok/comic/[slug]/slide-[N].png"
```

For cover slides, use `slide-0-cover.png` as the style reference and include `gary-badge.png`. For numbered slides, use `slide-1.png` as the banner style reference and do not include `gary-badge.png`.

Before generating:
- Confirm `OPENAI_API_KEY` exists. Never print the key value.
- Use `quality=low` for throwaway drafts only. Use `medium` or `high` for final slides.
- Generate one image at a time and review each output before continuing.
- Do not use `background=transparent`; GPT Image 2 does not support transparent backgrounds.
- If text is misspelled, cut off, or layout-drifted, simplify the text and regenerate only that slide.

## The Workflow

Follow these phases sequentially. **Do not skip ahead. Get user approval before moving between phases.**

**⚠️ FIRST: Choose a Format.** There are two carousel formats. Pick one at the start — every phase differs based on format:

| Format | Best For | Look |
|--------|----------|------|
| **Standard (Tips)** | Lists, how-tos, numbered advice | Single scene per slide, black banner title, numbered tips |
| **Split Panel (Reframe)** | "You're not X, you are Y" truth bombs | Each slide = 2 stacked panels, bold white text overlaid on scenes |

If the user shows a reference image with the split panel style (two stacked scenes per slide), use the **Split Panel Format** below. Otherwise, continue with the standard workflow.

---

## Split Panel Format

### What It Is
Each slide is a **single 4:5 image split horizontally into two panels**:
- **Top panel (upper 48%):** Shows the wrong assumption or problem. Bold white text with black stroke at the very top of the panel.
- **Thin black divider line** at the center.
- **Bottom panel (lower 48%):** Shows the truth or reframe. Bold white text with black stroke at the very bottom of the panel.

The structure mirrors viral reframe content: "YOU'RE NOT [X]" → "YOU ARE [REAL REASON]". GainFrame Guy appears in both panels — each showing a different scenario (problem vs. truth).

### Topic Formula
Works best with reframe statements:
- "YOU'RE NOT [ASSUMPTION]" vs. "YOU'RE JUST [REAL CAUSE]"
- "YOU DON'T NEED [THING]" vs. "YOU NEED [REAL SOLUTION]"
- "IT'S NOT [EXCUSE]" vs. "IT'S [ACTUAL REASON]"

### Phase SP-0: Topic & Slide Plan
Draft all slides as a table. Each row = one full slide image (two panels):

| Slide | TOP text | Top scene | BOTTOM text | Bottom scene |
|-------|----------|-----------|-------------|--------------|
| Cover | [hook line] | [GF Guy scene] | [punchline] | [GF Guy scene] |
| 1 | [statement] | [scene] | [reframe] | [scene] |
| … | … | … | … | … |

Aim for **5-6 slides** (cover + 4-5 reframe slides). No GainFrame promo unless this is the 1-in-3 comic.

### Phase SP-1: Cover
The cover uses the split panel layout — top half has the GainFrame Guy badge top-left (small), bold white title text at the top with black stroke. **No bare-text cream background for split panel covers** — the text overlays directly on the illustrated scene.

### Phase SP-2: Image Generation for Split Panel Slides

**CRITICAL PROMPT STRUCTURE — read before generating any slide:**

Each slide is a **single GPT Image 2 edit request** that produces one image with both panels.

```
A single wide-format cartoon illustration split into TWO stacked horizontal panels, each taking 50% of the image height, with a thick black horizontal divider line between them.

GainFrame Guy character appears in BOTH panels. 
CRITICAL HEAD DESIGN: The head is NOT a solid square — it is four separate corner brackets floating in space with the background visible between them. The eyes and S-curve nose float inside the bracket frame. Open bracket corners, not a filled square.

TOP PANEL (upper 50% of image):
- Scene: [TOP SCENE DESCRIPTION]
- At the very top edge of the top panel, large bold white text in Impact-style condensed sans-serif, ALL CAPS, reads "[TOP TEXT]". The text has a very strong, thick black outline/stroke.
- The scene fills the rest of the top panel below the text.

BOTTOM PANEL (lower 50% of image):
- Scene: [BOTTOM SCENE DESCRIPTION]
- At the very bottom edge of the bottom panel, large bold white text in Impact-style condensed sans-serif, ALL CAPS, reads "[BOTTOM TEXT]". The text has a very strong, thick black outline/stroke.
- The scene fills the rest of the bottom panel above the text.

TYPOGRAPHY: Bold Impact-style condensed sans-serif font, ALL CAPS, white fill, very thick black outline. NO banners, pills, or background shapes behind text — white text floats directly on the scene with black stroke only.

BACKGROUND: Both panels use a clean off-white cream background (#F5F0EB) — the same background used across all GainFrame slides. Do NOT use flat solid colors (no yellow, green, gray, blue, etc.) or gradient backgrounds. The scene should feel cohesive and on-brand, not like colored panels. Keep props and environments simple and readable, but the background is always cream.

Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format (1080x1350). No watermarks whatsoever.
```

**For the cover slide**, add the GainFrame Guy badge to the top-left of the top panel:
```
In the top-left corner of the TOP PANEL ONLY, draw a small branding badge: a tiny bracket-frame head icon next to bold sans-serif text reading "GAINFRAME GUY". Keep it small — about 8% of image width.
```

**Reference images for all split panel slides (2 references):**
```
image[] inputs:
[
  "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg",
  "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/[closest-scene-ref].jpeg"
]
```
For the cover (3 references), also include `gary-badge.png`.

### Phase SP-3: Save & Register
Same as standard format — use slug, save as `slide-0-cover.png` through `slide-[N].png`, create `content.md`, add to `comics-manifest.js`, sync to iCloud.

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

3. **GainFrame mention (optional — 1 in 3 cadence).** Do NOT include a GainFrame promo slide in every carousel. Aim for roughly 1 in every 3 carousels. When included, place it on the final slide and make it feel like a natural recommendation, not an ad. Example: "Track your progress with GainFrame" or "GainFrame helps catch trends you'd miss." If the current comic is NOT the one to include it, end on a strong tip or motivational slide instead.

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

### Phase 2: Numbered Slides Text

**Slide count:** Default to 5 or 6 numbered slides depending on the format.
**⚠️ CRITICAL "TOP X" RULE:** If a post promises a specific number of tips (e.g., "Top 5 Mistakes"), you MUST provide exactly that many tips PLUS one additional slide for the GainFrame plug. For a "Top 5" post, you must generate **6 numbered slides** (Slides 1-5 for tips, Slide 6 for the GainFrame plug). Do NOT use one of the promised tips as the plug.

**Goal:** Write punchy, scannable content for the numbered slides.

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
- **GainFrame mention is OPTIONAL (1-in-3 cadence)** — skip it in most carousels. When included, place it on the final slide. It should feel organic, not promotional. For "Top 5" posts where GainFrame IS included, it becomes Slide 6 so you still deliver 5 real tips.

**Present the full draft to the user as a formatted table:**

| Slide | Title | Subtitle | Scene Idea |
|-------|-------|----------|------------|
| Cover | [TITLE] | — | [Scene] |
| 1 | [Title] | [Subtitle text] | [Scene] |
| 2 | [Title] | [Subtitle text] | [Scene] |
| 3 | [Title] | [Subtitle text] | [Scene] |
| 4 | [Title] | [Subtitle text] | [Scene] |
| 5 | [Title] | [Subtitle text] | [Scene] |
| 6 | [Title] | [Subtitle text] | [Scene] (If needed for "Top 5" rule) |

**Iterate with the user until they approve all slide text.**

---

### Phase 3: Image Generation

**Goal:** Generate 6-7 GainFrame Guy illustrations (1 cover + 5-6 numbered slides) with perfect character consistency, clean typography, and branding.

#### ⚠️ CRITICAL: Tool Selection

**USE:** OpenAI GPT Image 2 (`gpt-image-2`) through the Image API edits endpoint with repeated `image[]=@...` reference inputs.
**DO NOT USE:** the existing Gemini/Nano Banana `image-generate` skill or Antigravity `generate_image` path for this Codex copy.

Still read `STYLE_GUIDE.md > Prompt Engineering Notes` for character and layout rationale, but adapt the tool call to GPT Image 2.

#### Setup
1. **Create output directory:**
   ```bash
   mkdir -p /Users/michael.rode/code/project/gain-frame-privacy/docs/assets/tiktok/comic/[slug]
   ```
   Use a short kebab-case slug based on the topic (e.g., `gym-advice-must-know`, `perfect-leg-day`).

2. **Read the style guide** to get the base prompt prefix, typography rules, and badge specs:
   ```
   view_file docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md
   ```

#### Generate Each Image

For each slide, use one GPT Image 2 edits request with this configuration:

**Required reference image inputs:**
- **Cover Slide (3 references, MANDATORY):** Always include these three exactly:
  1. `gf-mascot-template.jpeg` — character design reference
  2. `assets/tiktok/comic/discipline-not-motivation/slide-0-cover.png` — **VISUAL STYLE REFERENCE** for the correct cover text treatment (bare Impact text on cream, red accent word, GAINFRAME GUY badge top-left)
  3. `gary-badge.png` — for the top-left corner branding badge
- **Numbered Slides (2 references):** Include `gf-mascot-template.jpeg` AND `discipline-not-motivation/slide-1.png`. The discipline slide is the **banner style ground truth** — it shows the exact solid black full-width bar with red #N and white title. DO NOT include `gary-badge.png` as numbered slides do not have the badge.

Example for Numbered Slides:
```
image[] inputs:
[
  "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg",
  "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/[closest-scene-ref].jpeg"
]
```

- Pick a scene reference image matching the scene type:
  - Flexing/mirror → `mirror-mascot.jpeg`
  - Form comparison → `mascot-form.jpeg`
  - Gym equipment → `mascot-legs.jpeg`
  - Phone/photos → `mascot-pictures.jpeg`
  - Sleeping/recovery → `mascot-sleep.jpeg`

**Prompt template for numbered slides:**

🎨 **BANNER STYLE GROUND TRUTH:** The `discipline-not-motivation/slide-1.png` reference image IS the correct banner style. Match it exactly: solid black bar, edge-to-edge, square corners, red number, white title. No rounded rectangle. No subtitle text in the banner.

```
A cartoon illustration of this exact character from the reference images in a new scene. 
CRITICAL: The head is NOT a solid square — it is four separate corner brackets floating 
in space with the background visible between them. The eyes and S-curve nose float inside 
the bracket frame with NO background fill, NO square, NO box behind them. Copy the head 
design from the reference images exactly — open bracket corners, not a filled square.

Scene: [SCENE DESCRIPTION specific to this slide]

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the 
BOTTOM 72% of the image. Leave the top 28% clear for the banner.

BANNER (TOP OF IMAGE — CRITICAL):
- A solid BLACK rectangular bar that spans the FULL WIDTH of the image edge-to-edge, 
  from the very top edge down. Square corners — NO rounded corners, NO border-radius.
- The bar is approximately 12-14% of the total image height tall.
- Inside the bar, LEFT-ALIGNED: the number "#[N]" in bold Impact ALL CAPS, in bright RED (#E53935).
- Immediately to the right of the number: the slide title "[TITLE]" in bold white Impact 
  ALL CAPS. Both the number and title sit on the same baseline, vertically centered in the bar.
- NO subtitle text inside the banner. The banner contains ONLY the number + title.
- NO rounded rectangle. NO pill shape. NO border. Just a flat edge-to-edge black bar.
- See the reference image — copy the banner exactly as shown.

Below the banner, bold dark sans-serif subtitle text (Helvetica-style, dark charcoal #1A1A1A),
center-aligned, reads "[SUBTITLE]." This subtitle floats on the cream background BELOW the 
black bar — NOT inside it.

TYPOGRAPHY: Bold Impact-style condensed sans-serif for banner title (ALL CAPS, white). 
Clean Helvetica-style sans-serif for subtitle below banner (mixed case OK). 
NO handwritten, script, or decorative fonts anywhere.

Clean off-white background (#F5F0EB) below the banner. Clean cartoon style, thick outlines, flat colors. 
4:5 TikTok format (1080x1350). No watermarks whatsoever.
```

**Prompt template for cover slide:**

**⚠️ TIKTOK GRID SAFE ZONE:** TikTok crops 4:5 images to ~1:1 square thumbnails in the profile grid, clipping some space from each side and cropping top/bottom significantly. ALL cover title text must be:
- Centered horizontally, taking up around **75% to 80%** of the image width
- Positioned vertically centered or slightly above center within the top area — NOT at the very top edge
- **Max 4-5 words per line**, stacked into 2-3 short lines
- Text needs moderate margins on left/right so it doesn't touch the edges and respects the crop

**🚨 CRITICAL ANTI-PATTERN — READ BEFORE GENERATING:** The most common failure mode is placing the cover title text inside a black pill/banner/rounded rectangle. This is **WRONG** for covers. The correct cover style has the title floating as raw bare text directly on the cream background — no shape, no box, no banner behind the cover title. The discipline reference cover is the **visual ground truth**. ALWAYS include it.

**Required reference image inputs for Cover Slides (3 images):**
```
["/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg",
 "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/tiktok/comic/discipline-not-motivation/slide-0-cover.png",
 "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gary-badge.png"]
```
The `discipline-not-motivation/slide-0-cover.png` is the **cover style reference** — it shows exactly how the title text should look (bare Impact text on cream, red accent word, GAINFRAME GUY badge top-left). Always include it.

**Required reference image inputs for Numbered Slides (2 images):**
```
["/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg",
 "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/tiktok/comic/discipline-not-motivation/slide-1.png"]
```
The `discipline-not-motivation/slide-1.png` is the **numbered slide banner style reference** — solid black full-width bar, red #N, white Impact title, no rounded corners, no subtitle in the bar. Always include it for numbered slides.

```
A cartoon illustration of this exact GainFrame Guy character from the reference images in a new scene. 
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
- The title text MUST be raw text floating directly on the cream background — NO banner,
  NO pill shape, NO rounded rectangle, NO black box, NO background shape of ANY kind
  behind the title text. TEXT FLOATS BARE ON THE BACKGROUND. See the gym-bro-pipeline
  reference image — copy that exact title text treatment.
- The title text MUST be centered horizontally, taking up around 75% to 80% of the image width.
- Leave moderate margins on both the left and right sides so it doesn't touch the edges.
- Stack the title into 2-3 SHORT lines (max 4-5 words per line), centered.
- The title reads "[COVER TITLE]" with the word "[ACCENT WORD]" in red (#E53935).
  All other words are in near-black (#1A1A1A).
- Very prominent bold text, eye-catching and large.

TYPOGRAPHY: Use bold Impact-style condensed sans-serif font for the title (ALL CAPS). 
NO handwritten, script, or decorative fonts. NO text inside any box or shape.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 
4:5 TikTok format (1080x1350). No watermarks except the GainFrame Guy badge.
```

**IMPORTANT:**
- Generate ONE image at a time, not in parallel. This lets you course-correct style drift.
- After each generation, show the result to the user and ask if it matches the style. If not, refine the prompt.
- Always include `gf-mascot-template.jpeg` as a reference image. Only include `gary-badge.png` for the cover slide.
- Keep concurrency ≤ 1 for character consistency. Quality > speed.

#### Save Images

Once GPT Image 2 generates the slide, save it directly to the correct final path. No programmatic text overlay script is needed, as GPT Image 2 generates the image with text baked in natively.

CRITICAL EXACT FILE NAMING YOU MUST USE TO SAVE THE IMAGES:
- `slide-0-cover.png` (for the cover)
- `slide-1.png`
- `slide-2.png`
- `slide-3.png`
- `slide-4.png`
- `slide-5.png`
- `slide-6.png` (if doing a 6-slide post)

Do NOT name them `cover.png` or `slide1.png` or `slide_1.png`. You MUST use HYPHENS (-), NOT UNDERSCORES (_). The web gallery explicitly searches for `slide-0-cover` and `slide-[N]` with dashes. Failure to use this exact naming convention will result in broken images on the website.

---

### Phase 4: Review & Export

1. **Show the full set.** Display all 6-7 images together so the user can review the complete carousel.

2. **Verify text rendering.** Check that the text in each generated image is readable and correctly spelled. If any text is garbled or cut off, regenerate that slide with a simplified text prompt.

3. **Generate caption & hashtags.** Draft:
   - **Caption:** 2-3 sentences, hook-first, with a CTA ("Save this for your next gym session 💪")
   - **Hashtags:** 5-10 relevant hashtags mixing broad (#gymtok #fitness) and niche (#gymmistakes #workoutsplit)

4. **Save the text content** to a `content.md` file in the output directory — this is a **copy-paste ready** file for TikTok posting:
   ```
   docs/assets/tiktok/comic/[slug]/content.md
   ```
   Include ONLY: the caption and hashtags. Do NOT include slide text, prompts, or other metadata. The file should be minimal — just what gets pasted into TikTok.

5. **Update the post log.** Append to `docs/assets/tiktok/comic/POST_LOG.md` (create if doesn't exist):
   ```
   ## [Date] — [Title]
   - Slug: [slug]
   - Slides: 6-7
   - GainFrame mention: Yes/No (Slide #)
   - Status: Done
   ```

6. **Register in the comics gallery.** Add a new entry to the top of the `COMICS_MANIFEST` array in `docs/assets/tiktok/comic/comics-manifest.js` so the comic automatically appears on the website gallery page. Insert it as the **first entry** (newest first) with today's date. Use `"png"` for ext unless the images were saved as `.jpeg`.
   ```js
   { slug: "[slug]", title: "[Cover Title]", date: "[YYYY-MM-DD]", ext: "png" },
   ```
   Make sure the title matches the cover slide title (properly capitalized, no ALL-CAPS).

---

### Phase 5: Send to Phone (iCloud Sync)

**Goal:** Automatically deliver the finished carousel + caption to the user's iPhone so they can post directly from TikTok without any manual file transfers.

This step copies the finished slides and `content.md` to a dedicated folder inside iCloud Drive. The files will automatically appear in the **Files** app on the user's iPhone — no need to enable "Desktop & Documents" sync.

1. **Copy all assets to the iCloud drafts folder:**
   ```bash
   SLUG="[slug]"
   # ABSOLUTE PATH MUST BE USED EXACTLY AS WRITTEN:
   DEST="/Users/michael.rode/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
   mkdir -p "$DEST"
   
   # COPY ONLY FILES WITH HYPHENS (e.g., slide-1.png NEVER slide_1.png)
   cp docs/assets/tiktok/comic/$SLUG/slide-*.png "$DEST/"
   cp docs/assets/tiktok/comic/$SLUG/content.md "$DEST/"
   ```

2. **Confirm to user:** Let them know the files are syncing and where to find them:
   - Open **Files** app on iPhone
   - Navigate to **iCloud Drive → TikTok-Drafts → [slug]**
   - All 6-7 slides + caption/hashtags are there
   - Open TikTok → New Post → Select photos from Files app

3. **Cleanup (optional):** Old drafts can be deleted from the TikTok-Drafts folder after posting. The canonical copies always live in `docs/assets/tiktok/comic/[slug]/`.

---

## Rules & Constraints

- **Never skip the text iteration phase.** The copy must be approved before generating any images. Bad copy = wasted generation credits.
- **One image at a time.** Do NOT batch-generate all images. Character consistency requires sequential generation with review.
- **Always use the base prompt prefix.** The mascot's visual identity is defined by the exact prompt prefix in the style guide. Never freestyle it.
- **GainFrame Gary badge.** Only the COVER slide gets the top-left branding badge. Do not include it on numbered slides.
- **Always specify fonts.** Every prompt must explicitly request Impact-style condensed sans-serif for titles and clean sans-serif for subtitles. Never let the AI choose fonts freely.
- **No Text Overlay Script.** You do NOT use any Python script to overlay text. GPT Image 2 generates the text directly in the image. If the text fails, adjust your prompt and regenerate the slide. Save the final output using the strict `slide-0-cover.png` and `slide-[N].png` formats.
- **Save everything.** Every carousel must have its own directory under `docs/assets/tiktok/comic/[slug]/` with all images AND a `content.md` with the text + prompts used.
- **Prompt reproducibility.** Always save the exact prompt used for each image in `content.md`. If a style works well, it becomes the new reference.
- **GainFrame mention: 1 in every 3 carousels, not every one.** When included, place it on the final slide only. Never in the first 3 slides. Pure value first — product mention is earned, not forced. Most carousels should end with a strong tip, not a plug.

## Reference Files
- `docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md` — **MUST READ FIRST** — Character design, visual constants, typography, badge specs, title patterns, prompt templates
- `docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg` — Mascot character sheet (neutral standing pose)
- `docs/assets/gainframe-guy/illustrations/gary-badge.png` — **Head-only badge icon** for top-left branding (include ONLY when generating the cover slide)
- `docs/assets/gainframe-guy/illustrations/mirror-mascot.jpeg` — Example: mirror reflection scene
- `docs/assets/gainframe-guy/illustrations/mascot-form.jpeg` — Example: good vs. bad form (✅/❌ comparison)
- `docs/assets/gainframe-guy/illustrations/mascot-legs.jpeg` — Example: gym equipment interaction
- `docs/assets/gainframe-guy/illustrations/mascot-pictures.jpeg` — Example: progress photos with phone tripod
- `docs/assets/gainframe-guy/illustrations/mascot-sleep.jpeg` — Example: recovery/sleeping scene
- `docs/assets/tiktok/comic/POST_LOG.md` — Running log of all generated carousels
- `docs/assets/tiktok/comic/comics-manifest.js` — Gallery manifest (add new comics here for them to appear on the website)
