---
name: Claude TikTok Carousel Generator
description: Claude Code version of the TikTok carousel generator. Same workflow as tiktok-carousel-generator but uses the Gemini API directly via curl with base64-encoded reference images — no Antigravity generate_image tool required.
triggers:
  - "claude tiktok"
  - "tiktok post"
  - "tiktok carousel"
  - "new tiktok"
  - "mascot post"
  - "carousel post"
  - "gainframe guy"
---

# Claude TikTok Carousel Generator

## Overview

Generates GainFrame Guy TikTok carousel posts. Identical workflow to `tiktok-carousel-generator` with one difference: **image generation uses the Gemini API directly via curl with base64-encoded reference images** instead of Antigravity's `generate_image` tool.

Every phase is the same. Only the image generation bash block in Phase 3 changes.

Read the style guide before starting:
```
view_file assets/gf-mascot/STYLE_GUIDE.md
```

---

## Format Selection

Three carousel formats — pick one before Phase 0:

| Format | Best For | Look |
|--------|----------|------|
| **Standard (Tips)** | Lists, how-tos, numbered advice | Single scene per slide, black banner title, numbered tips |
| **Split Panel (Reframe)** | "You're not X, you are Y" truth bombs | Each slide = 2 stacked panels, bold white text overlaid on scenes |
| **Hero Reference** | "Best X for every Y", authoritative reference guides | 3-line stacked title + italic edition tag, muscular hero mascot, anatomy diagrams + exercise demos on numbered slides |

---

## Standard Format

### Phase 0: Topic Selection

1. Suggest 5 topics if the user doesn't have one. Pull from:
   - Workout structure (splits, routines, program design)
   - Exercise recommendations (best exercises for X body part)
   - Common mistakes (form errors, programming mistakes)
   - Fundamentals (sets/reps/rest, progressive overload)
   - Body composition & nutrition (cutting, bulking, protein)
   - Recovery (sleep, warm-ups, deload weeks)
   - Progress tracking (progress photos, measuring gains, body fat)
   - GainFrame features (AI analysis, progress comparison, deep dive)

2. Confirm the angle. Ask: *"What's the one thing you want someone to walk away knowing?"*

3. **GainFrame mention — 1 in 3 cadence.** Do NOT include a GainFrame promo slide in every carousel. When included, place it on the final slide only. Most carousels should end on a strong tip.

---

### Phase 1: Cover Slide Text

**⚠️ TITLE LENGTH IS CRITICAL.** TikTok crops 4:5 to ~1:1 square thumbnails in the profile grid. Every title must:
- Max 3–4 words per line, stacked vertically
- Max 2–3 stacked lines
- Total 4–8 words
- Center-aligned in the middle 50% of image width

1. Draft 3 title options using proven formats:
   - **Authority:** "THE ULTIMATE [TOPIC]"
   - **Listicle:** "TOP 5 [THINGS]"
   - **Fear/Curiosity:** "THE #1 MISTAKE / KILLING YOUR GAINS"
   - **Command:** "STOP [BAD HABIT]"
   - **Question:** "[SHORT QUESTION]?"
   - **Conditional:** "DO THIS IF [CONDITION]"

2. Identify the accent word to highlight in red (#E53935).

3. Grid-check: can the full title be read in a center-cropped square? If not, shorten it.

4. Present 3 options with accent word marked. Wait for approval.

---

### Phase 2: Slide Text

**Slide count:** 5–6 numbered slides.
**"TOP X" rule:** If promising N tips, deliver exactly N slides of tips PLUS an optional GainFrame slide. A "Top 5" post = 5 tip slides + 1 plug slide (if using it).

For each slide draft:
- **Title:** Short bold statement (3–8 words) — goes in the black number banner
- **Subtitle:** 1 sentence max. Punchy, standalone
- **Scene description (internal):** What the mascot is doing

Slide rules:
- Each slide self-contained (screenshot-worthy alone)
- At least 1 do/don't comparison (two mascots: ✅ vs ❌)
- At least 1 solo mascot action scene
- Slides build on each other — not random tips

Present as a table:

| Slide | Title | Subtitle | Scene Idea |
|-------|-------|----------|------------|
| Cover | [TITLE] | — | [Scene] |
| 1 | [Title] | [Subtitle] | [Scene] |
| … | … | … | … |

Iterate until approved before generating any images.

---

### Phase 3: Image Generation (Claude Code — curl + Gemini API)

**Goal:** Generate each slide sequentially. One image at a time for character consistency.

#### Setup

```bash
source ~/.zshrc  # loads GEMINI_API_KEY

SLUG="[kebab-case-topic-slug]"
OUT_DIR="/Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/comic/$SLUG"
mkdir -p "$OUT_DIR"

# Absolute paths to reference files
MASCOT_TEMPLATE="/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gf-mascot-template.jpeg"
BADGE="/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gary-badge.png"
COVER_STYLE_REF="/Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/comic/discipline-not-motivation/slide-0-cover.png"
BANNER_STYLE_REF="/Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/comic/discipline-not-motivation/slide-1.png"

MODEL="gemini-3.1-flash-image-preview"
```

#### Scene Reference Map

Pick the closest scene reference for each numbered slide:

| Scene type | File |
|------------|------|
| Flexing / mirror | `assets/gf-mascot/mirror-mascot.jpeg` |
| Form comparison ✅/❌ | `assets/gf-mascot/mascot-form.jpeg` |
| Gym equipment / muscular build | `assets/gf-mascot/mascot-legs.jpeg` |
| Muscular hero flex pose | `assets/gf-mascot/mascot-pictures.jpeg` (double bicep flex — best for Hero Reference covers) |
| Phone / progress photos | `assets/gf-mascot/mascot-pictures.jpeg` |
| Sleeping / recovery | `assets/gf-mascot/mascot-sleep.jpeg` |
| Default / other | `assets/gf-mascot/gf-mascot-template.jpeg` |

#### Core Image Generation Function

This bash block generates one slide. Run it once per slide, substituting values each time.

```bash
# === INPUTS FOR THIS SLIDE ===
PROMPT="[FULL PROMPT — see templates below]"
OUTPUT_PATH="$OUT_DIR/[slide-0-cover.png OR slide-N.png]"
REF1="$MASCOT_TEMPLATE"           # always the character template
REF2="[scene-specific reference]" # cover: COVER_STYLE_REF | numbered: BANNER_STYLE_REF
REF3=""                           # cover only: $BADGE | numbered: leave empty
REF4=""                           # optional 4th ref (e.g. pose ref for Hero Reference covers)

REF1_MIME="image/jpeg"             # .jpeg → image/jpeg
REF2_MIME="image/png"              # discipline refs are PNG
REF3_MIME="image/png"
REF4_MIME="image/jpeg"

# === ENCODE REFERENCES TO TEMP FILES ===
# CRITICAL: must use --rawfile from temp files, NOT --arg with $(base64 ...).
# Inline --arg blows past ARG_MAX once you have 3+ images, causing jq to fail
# with "argument list too long" and the API to reject the request as empty.
echo "$PROMPT" > /tmp/prompt.txt
base64 -i "$REF1" | tr -d '\n' > /tmp/r1.b64
base64 -i "$REF2" | tr -d '\n' > /tmp/r2.b64
[ -n "$REF3" ] && base64 -i "$REF3" | tr -d '\n' > /tmp/r3.b64
[ -n "$REF4" ] && base64 -i "$REF4" | tr -d '\n' > /tmp/r4.b64

# === BUILD REQUEST ===
if [ -n "$REF4" ]; then
  # 4 reference images (Hero Reference covers w/ pose ref)
  jq -n \
    --rawfile prompt /tmp/prompt.txt \
    --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 \
    --rawfile r3 /tmp/r3.b64 --rawfile r4 /tmp/r4.b64 \
    --arg m1 "$REF1_MIME" --arg m2 "$REF2_MIME" \
    --arg m3 "$REF3_MIME" --arg m4 "$REF4_MIME" \
    '{contents:[{parts:[
      {inlineData:{mimeType:$m1,data:$r1}},
      {inlineData:{mimeType:$m2,data:$r2}},
      {inlineData:{mimeType:$m3,data:$r3}},
      {inlineData:{mimeType:$m4,data:$r4}},
      {text:$prompt}
    ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/gemini-req.json
elif [ -n "$REF3" ]; then
  # 3 reference images (standard cover: template + cover style + badge)
  jq -n \
    --rawfile prompt /tmp/prompt.txt \
    --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 --rawfile r3 /tmp/r3.b64 \
    --arg m1 "$REF1_MIME" --arg m2 "$REF2_MIME" --arg m3 "$REF3_MIME" \
    '{contents:[{parts:[
      {inlineData:{mimeType:$m1,data:$r1}},
      {inlineData:{mimeType:$m2,data:$r2}},
      {inlineData:{mimeType:$m3,data:$r3}},
      {text:$prompt}
    ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/gemini-req.json
else
  # 2 reference images (numbered slide: template + banner style)
  jq -n \
    --rawfile prompt /tmp/prompt.txt \
    --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 \
    --arg m1 "$REF1_MIME" --arg m2 "$REF2_MIME" \
    '{contents:[{parts:[
      {inlineData:{mimeType:$m1,data:$r1}},
      {inlineData:{mimeType:$m2,data:$r2}},
      {text:$prompt}
    ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/gemini-req.json
fi

# Cleanup temp inputs (keep gemini-req.json for the curl call)
rm -f /tmp/prompt.txt /tmp/r1.b64 /tmp/r2.b64 /tmp/r3.b64 /tmp/r4.b64

# === CALL API ===
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @/tmp/gemini-req.json > /tmp/gemini-resp.json

# === ERROR CHECK ===
if jq -e '.error' /tmp/gemini-resp.json > /dev/null 2>&1; then
  echo "❌ API error:"
  jq '.error' /tmp/gemini-resp.json
  rm -f /tmp/gemini-req.json /tmp/gemini-resp.json
  exit 1
fi

# === DECODE + CONVERT ===
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
  /tmp/gemini-resp.json > /tmp/gemini-img.b64

if [ ! -s /tmp/gemini-img.b64 ]; then
  echo "❌ No image in response:"
  cat /tmp/gemini-resp.json
  rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64
  exit 1
fi

base64 --decode -i /tmp/gemini-img.b64 -o /tmp/tiktok-slide.png

cwebp -q 90 /tmp/tiktok-slide.png -o "${OUTPUT_PATH%.png}.webp" 2>/dev/null
cp /tmp/tiktok-slide.png "$OUTPUT_PATH"

# === CLEANUP ===
rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64 /tmp/tiktok-slide.png

SIZE=$(stat -f%z "$OUTPUT_PATH" 2>/dev/null || stat -c%s "$OUTPUT_PATH")
echo "✅ Saved: $OUTPUT_PATH ($SIZE bytes) — Cost: ~\$0.039"
```

#### Prompt Templates

**Cover slide prompt** (use with `REF2=$COVER_STYLE_REF` and `REF3=$BADGE`):
```
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL HEAD DESIGN: The head is NOT a solid square — it is four separate corner brackets floating in space with the background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill. Copy the head exactly from the character template reference.

In the top-left corner, draw the small branding badge from the third reference image: a tiny bracket-frame head icon next to bold sans-serif text reading "GAINFRAME GUY". About 10% of image width.

Scene: [MASCOT SCENE DESCRIPTION]

CRITICAL PLACEMENT: The character and all props MUST be entirely within the BOTTOM 60% of the image.

TITLE TEXT (TOP 40%): The title floats as raw bare text directly on the white background — NO banner, NO pill, NO box, NO shape behind it. See the second reference image for the exact look.
- Centered horizontally, 75–80% of image width
- Stacked 2–3 short lines (max 4–5 words per line)
- "[COVER TITLE]" with "[ACCENT WORD]" in red (#E53935), all other words near-black (#1A1A1A)
- Bold Impact-style condensed sans-serif, ALL CAPS, very large

Background: pure clean WHITE (#FFFFFF) — flat, no gradient, not cream, not off-white. Pure bright white. Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format (1080×1350). No watermarks except the GainFrame Guy badge.
```

**Numbered slide prompt** (use with `REF2=$BANNER_STYLE_REF`, no REF3):
```
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL HEAD DESIGN: The head is NOT a solid square — it is four separate corner brackets floating in space with the background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill. Copy the head exactly from the character template reference.

Scene: [SCENE DESCRIPTION]

CRITICAL PLACEMENT: The character and all props MUST be entirely within the BOTTOM 65% of the image. Leave the top 28% clear for the banner.

BANNER (TOP — match the second reference image exactly):
- Solid BLACK rectangular bar, full width edge-to-edge, square corners, ~12–14% of image height
- Left-aligned inside: "#[N]" in bold Impact ALL CAPS, bright RED (#E53935)
- Immediately right of number: "[SLIDE TITLE]" in bold white Impact ALL CAPS
- Both on the same baseline, vertically centered in the bar
- NO rounded corners, NO pill shape, NO border — flat edge-to-edge black bar

Below the banner, center-aligned subtitle text in clean Helvetica-style sans-serif (dark charcoal #1A1A1A): "[SUBTITLE]"

Background: pure clean WHITE (#FFFFFF) — flat, no gradient, not cream. Pure bright white. Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format (1080×1350). No watermarks.
```

#### File Naming (mandatory)

```
slide-0-cover.png
slide-1.png
slide-2.png
slide-3.png
slide-4.png
slide-5.png
slide-6.png  (if 6-slide post)
```

Hyphens only. Never underscores. Never `cover.png` or `slide1.png`. The gallery manifest and iCloud sync depend on this exact pattern.

#### Generation Order

1. Generate cover first — sets the visual tone
2. Show to user before continuing
3. Generate numbered slides one at a time, showing each result
4. If a slide's character or banner drifts from the reference, regenerate before moving on

---

### Phase 4: Review & Export

1. Show all slides together for a full carousel review
2. Check text rendering — if any text is garbled, regenerate with a simplified subtitle
3. Draft caption + hashtags:
   - **Caption:** 2–3 sentences, hook-first, CTA ("Save this 💪")
   - **Hashtags:** 5–10 mixing broad (#gymtok #fitness) and niche (#gymmistakes #gainframe)
4. Save `content.md` to `assets/tiktok/comic/[slug]/content.md`:
   ```
   [Caption text]

   [Hashtags]
   ```
   Caption and hashtags only — no prompts, no slide text.
5. Append to `assets/tiktok/comic/POST_LOG.md`:
   ```
   ## [Date] — [Title]
   - Slug: [slug]
   - Slides: N
   - GainFrame mention: Yes/No (Slide #)
   - Status: Done
   ```
6. Add to top of `COMICS_MANIFEST` array in `assets/tiktok/comic/comics-manifest.js`:
   ```js
   { slug: "[slug]", title: "[Cover Title]", date: "[YYYY-MM-DD]", ext: "png" },
   ```

---

### Phase 5: Send to Phone (iCloud)

```bash
SLUG="[slug]"
DEST="/Users/michael.rode/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
mkdir -p "$DEST"
cp assets/tiktok/comic/$SLUG/slide-*.png "$DEST/"
cp assets/tiktok/comic/$SLUG/content.md "$DEST/"
echo "✅ Syncing to iCloud → TikTok-Drafts/$SLUG"
```

Files appear in **Files app → iCloud Drive → TikTok-Drafts → [slug]**.

---

## Split Panel Format

Same as `tiktok-carousel-generator` Split Panel Format — all phases identical. Only Phase 3 image generation changes.

For Split Panel slides, use the same core generation function above with this modified prompt structure:

```
A single wide-format cartoon illustration split into TWO stacked horizontal panels, each 50% of image height, with a thick black horizontal divider line between them.

GainFrame Guy character appears in BOTH panels.
CRITICAL HEAD DESIGN: The head is NOT a solid square — it is four separate corner brackets floating in space with the background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill.

TOP PANEL (upper 50%):
- Scene: [TOP SCENE DESCRIPTION]
- At the very top edge, large bold white Impact-style ALL CAPS text reads "[TOP TEXT]" with thick black stroke. No banner — text floats on scene.

BOTTOM PANEL (lower 50%):
- Scene: [BOTTOM SCENE DESCRIPTION]
- At the very bottom edge, large bold white Impact-style ALL CAPS text reads "[BOTTOM TEXT]" with thick black stroke.

Background for both panels: pure clean WHITE (#FFFFFF) — flat, no gradient, not cream. Pure bright white. Clean cartoon style, thick outlines, flat colors. 4:5 format (1080×1350). No watermarks.
```

For Split Panel cover, add REF3=$BADGE and include the badge in the top-left of the top panel.

**ImagePaths for Split Panel** (same as standard — always 2 refs for numbered, 3 for cover):
```
REF1 = gf-mascot-template.jpeg
REF2 = closest scene reference (mirror/form/legs/pictures/sleep)
REF3 = gary-badge.png (cover only)
```

---

## Hero Reference Format

**Use this format for "Best X for every Y" / "Top N exercises" / "The Ultimate [body part] Guide" carousels** — authoritative reference posts where the cover features a hero physique pose and the numbered slides showcase specific items (exercises, splits, foods, etc.) with anatomy diagrams + equipment demos.

Inspired by the Blue Bro Fitness format. Distinct from Standard Format because:
- Cover uses a 3-line stacked title (instead of 2-line) with italic edition tag
- Cover features a muscular hero pose (not a comic action scene)
- Numbered slides typically show: muscle anatomy diagram + GainFrame Guy demonstrating the exercise on equipment, with exercise names labeled below
- Tone is authoritative reference, not humorous

### Phase 0–2: Topic, Title, Slides

Same as Standard Format with these tweaks:

**Title format (Phase 1):** Always 3 stacked lines + italic subtitle:
- Line 1: red accent word(s) (e.g. "BEST EXERCISES")
- Line 2: dark, bridging text (e.g. "FOR EVERY")
- Line 3: dark, completion (e.g. "MUSCLE GROUP")
- Subtitle: italic edition tag in parentheses (e.g. "(Upper Body Edition)", "(Beginner Edition)", "(Push Day)")

**Slide content (Phase 2):** Each numbered slide focuses on one item (one muscle group, one body part, one workout, etc.). For exercise-focused posts, every slide should have:
- Top: anatomical name + common name (e.g. "Pectoralis Major (Chest)")
- Middle: muscle anatomy reference showing target muscle highlighted in RED
- Green arrow(s) pointing down
- Bottom: GainFrame Guy demonstrating 1–2 exercises on appropriate equipment, with exercise names labeled

### Phase 3: Image Generation

**Cover slide — 4 references (one extra for the hero pose):**
```
REF1 = $MASCOT_TEMPLATE                              # character design
REF2 = $COVER_STYLE_REF                              # bare-text-on-white style
REF3 = $BADGE                                        # top-left badge
REF4 = /Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/mascot-pictures.jpeg  # muscular flex pose
```

**Hero Reference cover prompt template** (proven — produced the `best-upper-body-exercises` cover):
```
A cartoon illustration of this exact GainFrame Guy character from the reference images in a hero physique pose.

CRITICAL HEAD DESIGN: The head is NOT a solid square — it is four separate corner brackets floating in space with the background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill.

CRITICAL ANATOMY: The character has EXACTLY ONE torso, EXACTLY TWO arms, EXACTLY TWO legs, EXACTLY TWO hands. NO extra arms, NO duplicate limbs.

In the top-left corner, draw the small branding badge from the third reference image: a tiny bracket-frame head icon next to bold sans-serif text reading "GAINFRAME GUY". About 10% of image width.

Scene: The character has a MUSCULAR build — heavily defined chest, broad shoulders, big biceps, visible six-pack abs. He is in a classic bodybuilder hero pose: standing front-facing with his RIGHT arm raised in a bicep flex (fist near his head, bicep peaked), and his LEFT hand placed on his hip. Wearing his olive-green shorts and gray-brown sneakers. Visible muscle definition and contour lines on his chest, arms, and abs. Confident expression — eyes looking forward.

CRITICAL PLACEMENT: The character occupies the BOTTOM 55% of the image, centered horizontally.

TITLE TEXT (TOP 45%): The title floats as raw bare text directly on the white background — NO banner, NO pill, NO box, NO shape behind it. Match the bold-text style of the second reference image but stacked into THREE lines:
- Line 1: "[ACCENT LINE]" in bright red (#E53935), very large bold Impact-style condensed sans-serif, ALL CAPS
- Line 2: "[BRIDGE LINE]" in near-black (#1A1A1A), same large bold Impact ALL CAPS
- Line 3: "[COMPLETION LINE]" in near-black (#1A1A1A), same large bold Impact ALL CAPS
- Below line 3, smaller italic text reads "([EDITION TAG])" in dark charcoal sans-serif italic
- All text centered horizontally with moderate margins

TYPOGRAPHY: Bold Impact-style condensed sans-serif for the three main title lines (ALL CAPS). Clean italic sans-serif for the subtitle. NO handwritten, script, or decorative fonts.

Background: pure clean WHITE (#FFFFFF) — flat, no gradient, not cream. Pure bright white. Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format (1080×1350). No watermarks except the GainFrame Guy badge in the top-left corner.
```

**Numbered slide — 2 references (template + banner style ref):**

For exercise-focused Hero Reference slides, use this prompt structure:
```
A cartoon illustration of the GainFrame Guy character from the reference images.

CRITICAL HEAD DESIGN: The head is NOT a solid square — it is four separate corner brackets floating in space. Eyes and S-curve nose float inside.
CRITICAL ANATOMY: ONE torso, TWO arms, TWO legs, TWO hands. NO duplicate limbs.

LAYOUT (top to bottom):
1. TOP CENTER: Bold dark sans-serif title in mixed case reads "[Anatomical Name (Common Name)]" — e.g. "Pectoralis Major (Chest)". Large readable text.
2. UPPER MIDDLE: A small anatomical torso diagram (NOT the mascot — a separate clinical-style upper-body silhouette) with the [TARGET MUSCLE] highlighted in bright red (#E53935). The rest of the silhouette is mid-gray. Clean, simple, instructional.
3. CENTER: One or two large green downward arrows pointing from the diagram to the exercise(s) below.
4. BOTTOM: The MUSCULAR GainFrame Guy demonstrating the exercise on equipment. If two exercises, show them side-by-side with a small "&" between them. Below each demonstration, bold small text labels the exercise name (e.g. "Incline Press Machine", "Pec Dec").

Background: pure clean WHITE (#FFFFFF). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format (1080×1350). No watermarks. No GainFrame Guy badge on numbered slides.
```

### Phase 4–5: Same as Standard Format

Same review/export and iCloud sync as Standard Format.

---

## GainFrame Promo Slide Pattern (any format)

When a carousel includes a GainFrame plug slide (typically the final slide), use this **phone-in-hand + real app screenshot** pattern. Works in any format (Standard, Hero Reference, etc.) — it's the canonical promo slide for the brand.

### Why this pattern works

1. **Real UI, not illustrated UI.** Passing the actual screenshot as a multimodal reference image makes Gemini render the GainFrame UI faithfully — radar chart labels, color legends, BEFORE/AFTER silhouettes, everything. An illustrated approximation would be less convincing.
2. **Just the hand, never the body.** A single hand gripping the phone from the bottom-right is what real product shots look like. Showing the full mascot arm/torso always reads as awkward (the torso competes with the phone for attention, and the arm-with-bicep flex distracts from the app).
3. **Brand mark beside the phone, not on the phone.** The GainFrame logo lives in the negative space to the left of the phone, not as a watermark on top of the screen.

### Screenshot library (pick the one that matches the carousel topic)

The library lives at `/Users/michael.rode/code/project/gain-frame-privacy/app-screenshots/[version]/` (currently `1.21`). Match the screenshot to the carousel topic:

| Carousel topic | Screenshot | Why |
|----------------|------------|-----|
| Muscle group / training / "every muscle" | `muscle-map.png` | Shows BEFORE/AFTER muscle development + radar chart of all muscle areas |
| Body fat / cutting / leanness | `post-check-in-photo-score.png` | GainFrame Score breakdown with Body Fat / Muscle / Proportions / Goal Fit |
| Progress photos / before-after | `compare.png` or `throwback.png` | Side-by-side comparison view with deltas |
| Recomp / weight tracking | `weight-chart.png` | 90-day trajectory chart, milestone markers |
| Consistency / streaks | `check-ins.png` | Weekly streak calendar, "Week Secured" |
| FFMI / body composition | `ffmi.png` | FFMI explainer with range bar |
| Trend tracking / dashboard | `dashboard.png` | Trend chart, transformation history, in-app chat |
| App overview / first look | `home.png` | Home feed with check-in calendar, score, photo |

Always pick the screenshot that **directly reinforces what the carousel taught**. If the post is about overtraining, use `check-ins.png` to show streaks; if it's about jawline body fat, use `post-check-in-photo-score.png` to show the BF% number, etc.

### References (2 images)

```
REF1 = $MASCOT_TEMPLATE   # for the hand/finger anatomy reference
REF2 = /Users/michael.rode/code/project/gain-frame-privacy/app-screenshots/1.21/[chosen-screenshot].png
```

### Promo slide prompt template (proven — produced the `best-upper-body-exercises` slide-7)

```
A clean cartoon promotional illustration for the GainFrame app — a phone held in hand showing the [SCREEN NAME] screen.

LAYOUT — top to bottom:

1. TOP CENTER (top 18% of image): Two lines of bold dark sans-serif text in mixed case, centered:
   - Line 1: "[HEADLINE LINE 1 — what GainFrame does for the carousel topic]"
   - Line 2 (slightly smaller): "[HEADLINE LINE 2 — the payoff]"
   Same title font/style as the rest of the carousel.

2. CENTER + BOTTOM (~80% of image): A single large smartphone shown in portrait orientation, slightly tilted (5-10 degrees), centered horizontally. The phone is held by a single right HAND coming in from the BOTTOM-RIGHT corner of the image — ONLY THE FINGERS AND HAND are visible (NO arm, NO bicep, NO forearm, NO shoulder, NO body of the character). The hand is a solid black/dark charcoal silhouette with subtle muscle definition lines on the fingers/knuckles only.

3. PHONE SCREEN: Copy the layout of the second reference image as faithfully as possible — iOS-style status bar, all UI elements, all text labels, all colors. The screen content should be readable and clearly identifiable as the GainFrame app.

4. To the LEFT of the phone (in the empty space), a small bracket-frame head logo (matching the character's head design — four corner brackets with eyes and S-curve nose floating inside) next to bold sans-serif text reading "GainFrame". About 15% of image width.

CRITICAL: Do NOT show the GainFrame Guy character's body, torso, bicep, full arm, or any other body part — ONLY a single hand/fingers gripping the phone from the bottom-right.

Background: pure clean WHITE (#FFFFFF) — flat, no gradient. Pure bright white throughout. Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format (1080×1350). No watermarks. No GainFrame Guy badge in the corners.
```

### Versioning the screenshot library

The screenshot library is **versioned by app release** (`/app-screenshots/1.21/`, `/app-screenshots/1.22/`, …). Always check for the latest version directory before picking a screenshot — newer versions may have updated UI that looks better. If a UI redesign happens between versions, regenerate any old promo slides that use stale screenshots.

---

## Rules

- **Never skip Phase 2 iteration.** Approved copy before any images.
- **One image at a time.** Character consistency requires sequential generation.
- **Always `source ~/.zshrc`** — GEMINI_API_KEY lives there, not in Claude Code's shell environment.
- **Always check for `.error` in the API response** — Gemini returns errors as JSON on HTTP 200.
- **File names use hyphens, never underscores.** `slide-1.png` not `slide_1.png`.
- **Cover gets 3 references (template + cover style + badge). Numbered gets 2 (template + banner style).**
- **GainFrame mention: 1 in every 3 carousels.** Final slide only. Value-first.
- **Base64 encode with `| tr -d '\n'`** — removes line breaks that corrupt the JSON.
- **Use `--rawfile` from temp files, never `--arg "$BASE64"` inline.** Any cover with 3+ reference images blows past macOS ARG_MAX when you pass base64 strings via `--arg`, and jq fails with "argument list too long" — the API then receives an empty body and rejects with `INVALID_ARGUMENT`. The Core Image Generation Function above already does this correctly; never refactor it back to `--arg` for image data.
- **MIME types:** `.jpeg` → `image/jpeg`, `.png` → `image/png`. Match the actual file extension.

## Reference Files

| File | Purpose |
|------|---------|
| `assets/gf-mascot/STYLE_GUIDE.md` | Character design, visual constants, typography |
| `assets/gf-mascot/gf-mascot-template.jpeg` | Character template — include in every generation |
| `assets/gf-mascot/gary-badge.png` | Badge icon — cover slides only |
| `assets/gf-mascot/mirror-mascot.jpeg` | Scene ref: flexing/mirror |
| `assets/gf-mascot/mascot-form.jpeg` | Scene ref: do/don't form comparison |
| `assets/gf-mascot/mascot-legs.jpeg` | Scene ref: gym equipment |
| `assets/gf-mascot/mascot-pictures.jpeg` | Scene ref: phone/progress photos |
| `assets/gf-mascot/mascot-sleep.jpeg` | Scene ref: sleeping/recovery |
| `assets/tiktok/comic/discipline-not-motivation/slide-0-cover.png` | Cover style reference — bare text on cream |
| `assets/tiktok/comic/discipline-not-motivation/slide-1.png` | Banner style reference — solid black full-width bar |
| `assets/tiktok/comic/POST_LOG.md` | Running log of all carousels |
| `assets/tiktok/comic/comics-manifest.js` | Gallery manifest — add new entries here |
