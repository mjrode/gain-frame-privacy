---
name: Jack TikTok Generator
description: Interactive workflow for generating viral TikTok 2-slide posts — photorealistic "gym guy" hook slide + GainFrame app screenshot punchline slide. Both slides have bold text overlays. Uses the base-image.png reference character (Jack) in creative locations/outfits.
triggers:
  - "jack tiktok"
  - "new jack post"
  - "jack slide"
  - "gym guy post"
  - "hook slide"
  - "real photo tiktok"
---

# Jack TikTok Generator Skill

## Overview

This skill creates a specific 2-slide TikTok format modeled on high-performing gym creator content. **The format is a setup/punchline story — both slides have bold text overlays.**

### The Two-Slide Story Structure

**Slide 1 (Setup — Guy Photo):**
A photorealistic photo of "Jack" in a candid real-life location (car, gym, outdoors). Bold white text with black stroke is overlaid directly on the photo. This text is the **hook/setup** — an accusation, a challenge, or a thing someone said.

Example: Guy in car, hook text reads `"you've changed"`

**Slide 2 (Punchline — App Screenshot):**
A GainFrame app screenshot that serves as **visual proof/evidence**. Bold white text with black stroke is overlaid directly on the screenshot. This text is the **comeback/punchline** — a dry, confident, or funny response to the hook.

Example: Strength Progress muscle map (Start → Now, all orange → all purple), punchline text reads `"Thanks bro"`

**The joke works like this:** Someone says something to the guy (slide 1 hook) → the app data proves why (slide 2 punchline). The app isn't being advertised — it's being used as the receipts.

### Real Examples From Reference Posts:
- Hook: `"you've changed"` → Punchline on Strength Progress map: `"Thanks bro"`
- Hook: `"my strength score after 12 months of grinding..."` → Punchline on muscle map: `"explain this then"`

## The Character: Jack

Jack is the photorealistic young athletic male character in the base reference image:
- **Base image:** `/Users/michael.rode/code/project/gain-frame-privacy/tik-tok-slides-jack/base-image.png`
- He should look like a real 22-25 year old gym guy — athletic build, dark curly/wavy hair, natural good looks
- **NOT a cartoon** — this is a realistic photo style, not illustrated
- He can be placed in gyms, cars, outdoor locations, in mirrors, etc.
- He wears typical gym-adjacent clothing: hoodies, gym tees, sweatpants, workout shorts

## The Style Reference

Study the example TikTok thumbnails provided — these are the target aesthetic:
- **Low-angle shots** or **selfie-style** perspectives feel most authentic
- **Natural lighting** — gym fluorescents, golden hour outdoors, car interior, etc.
- **Bold white text** with a heavy black stroke/outline directly overlaid on the image
- Text is **left-aligned or center-aligned**, positioned in the upper third or lower portion of the image
- The hook text uses **lowercase or mixed case** — NOT all-caps screaming. Examples:
  - `"when your body says stop but your ego says go"`
  - `"just remember it's okay to skip the gym today..."`
  - `"guys who prioritise recovery are ahead of everyone"`
  - `"my strength score after 12 months of grinding..."`
- The text feels like something a real person would post — candid, relatable, slightly ironic

## Workflow

Follow these phases **sequentially and interactively**. Do not skip ahead.

---

### Phase 1: Concept Ideation — Full 2-Slide Story

**Goal:** Generate 3-4 complete post concepts. Each concept is the **full 2-slide story** — the setup AND the punchline together. The user should be able to see the whole joke/narrative before committing.

For each option, provide all 6 elements:
1. **Slide 1 hook text** — what's overlaid on the guy photo (setup/accusation/challenge)
2. **Jack's location** — where is he? (car, gym, outdoors, locker room, etc.)
3. **Jack's outfit** — what's he wearing? (grey hoodie, black tee, blue shirt in car, etc.)
4. **Camera angle/vibe** — selfie in car, low angle outdoors, mirror selfie, etc.
5. **GainFrame app screen to use for slide 2** — which screen is the "proof"?
6. **Slide 2 punchline text** — the comeback/response overlaid on the app screenshot

**The Story Formula:**
- Slide 1 = Something that sounds like a challenge OR sets up curiosity
- Slide 2 = The app data is the receipts / the comeback / the proof

The punchline text on slide 2 should feel like the guy's dry, confident response — or the app "speaking" for him.

**Hook → Punchline Pair Examples:**

| Slide 1 Hook | Slide 2 App Screen | Slide 2 Punchline |
|---|---|---|
| `"you've changed"` | Strength Progress muscle map (Start→Now) | `"Thanks bro"` |
| `"my strength score after 12 months of grinding..."` | Strength Progress muscle map | `"explain this then"` |
| `"rest days are for the weak"` | Recovery Zone (Chest: 3d 18h left) | `"one more chest day won't hurt"` |
| `"bro you're not even strong"` | GainFrame Score card (71 / Impressive) | `"noted"` |
| `"you only lift for the girls watching"` | Body fat % comparison or transformation report | `"I lift for the data"` |
| `"all fun and games until..."` | Recovery Zone showing all muscles red | `"my app said no"` |

**Hook Text Style Rules:**
- Lowercase or sentence case — NOT ALL CAPS
- Short — 3-8 words ideally
- Feels like something someone SAID to the guy, or a relatable gym truth
- Quotes around it (like `"you've changed"`) or plain statement (`just remember it's okay to skip...`)

**Punchline Text Style Rules:**
- Even shorter — 1-5 words ideally
- Dry, confident, or funny — not earnest or ad-sounding
- Great punchlines: `"Thanks bro"`, `"noted"`, `"explain this then"`, `"one more won't hurt"`, `"I lift for the data"`

**Present to user as a formatted list (not a table — too many columns):**

For each option show:
```
**Option [N]**
- 🎬 Slide 1 hook: "[hook text]"
- 📍 Jack's scene: [location], [outfit], [camera angle]
- 📱 Slide 2 screen: [which GainFrame screen]
- 💬 Slide 2 punchline: "[punchline text]"
```

**Wait for user to pick one (or mix elements) before proceeding.**

---

### Phase 2: Lock In Slide 2 Screenshot

**Goal:** Confirm the app screenshot that will be used for slide 2, and finalize the punchline text.

Ask the user:
> "For slide 2, do you have a screenshot ready to share? If so, send it over. If not, I can describe what to capture in the app."

Once the screenshot is confirmed (either provided by user or described for capture), finalize:
- The **exact punchline text** that will overlay slide 2
- Where on the screenshot the text sits (usually center or lower area — overlaid over the content, not hiding key data)

Suggest **3 punchline variations** if the user wants options, then wait for approval before generating.

---

### Phase 3: Image Generation — Slide 1 (Jack)

**Goal:** Generate the photorealistic hook image of Jack in the chosen location/outfit.

#### ⚠️ CRITICAL: Tool Selection

**USE:** Antigravity's built-in `generate_image` tool with `ImagePaths` referencing the Jack base image.
**DO NOT USE:** `GEMINI_GENERATE_IMAGE` via Rube/Composio — it cannot pass reference images as real image data.

#### Output Directory

```bash
mkdir -p /Users/michael.rode/code/project/gain-frame-privacy/tik-tok-slides-jack/[slug]
```

Use a kebab-case slug from the hook text (e.g., `body-says-stop`, `strength-score-12-months`).

#### Image Generation Prompt Template for Slide 1

**ImagePaths (REQUIRED):**
```
["/Users/michael.rode/code/project/gain-frame-privacy/tik-tok-slides-jack/base-image.png"]
```

**Prompt:**
```
A photorealistic photo of this exact man from the reference image in a new location and outfit. 
Match his face, hair, and build exactly — same person, new scene.

Setting: [LOCATION DESCRIPTION]
Outfit: [OUTFIT DESCRIPTION]
Camera angle: [ANGLE/VIBE DESCRIPTION]

PHOTOGRAPHY STYLE: This should look like a real candid or semi-posed photo a fit young guy would post on TikTok or Instagram. Natural lighting appropriate to the setting. Real photo texture — NOT illustrated, NOT cartoon, NOT rendered. It should be indistinguishable from a real photo.

TEXT OVERLAY: At the [top/bottom] of the image, add bold white text with a very thick black stroke/outline that reads exactly: "[HOOK TEXT]"
- Font style: Bold sans-serif, heavy weight (like the TikTok text tool in white)
- Text should feel organic, not like a brand stamp
- Position: [top third / upper area / lower portion — based on where Jack is in frame]
- Text alignment: left-aligned or center-aligned

4:5 vertical format (TikTok). No watermarks. No logos.
```

**Key prompt guidance:**
- Reference the base image explicitly: "this exact man from the reference image"
- Emphasize **photorealism** — the biggest risk is the AI making it look illustrated
- The text overlay should be generated IN the image (not composited after)
- Keep the hook text EXACTLY as decided in Phase 1 — do not paraphrase it

#### After Generation

Show the image to the user. Ask:
1. Does the face/build match? 
2. Is the hook text readable and correctly spelled?
3. Does the vibe feel authentic (real photo, not AI-looking)?

Iterate if needed. Save the approved image as:
```
tik-tok-slides-jack/[slug]/slide-1-hook.png
```

---

### Phase 4: Slide 2 Finalization

**Goal:** Create or confirm the app screenshot slide with the caption overlay.

The slide 2 app screenshot is typically provided by the user directly. If they hand you a screenshot, you can:

**Option A — Use the raw screenshot as-is:**  
The user posts it as a plain screenshot. The caption is added in TikTok's text tool natively on device.

**Option B — Generate a version with the caption baked in:**  
Use `generate_image` with the screenshot as an `ImagePath` and ask it to add the text overlay:

```
ImagePaths: ["[PATH TO APP SCREENSHOT]"]
Prompt: "Add a bold white text overlay with thick black stroke to this image that reads: '[CAPTION TEXT]'. The text should be center-aligned, positioned in the [upper/middle/lower] area of the image. Font: bold rounded sans-serif, white fill with heavy black outline. Keep the app screenshot content fully visible and readable beneath the text. No other changes."
```

Ask the user which option they prefer.

Save as:
```
tik-tok-slides-jack/[slug]/slide-2-app.png
```

---

### Phase 5: Caption & Hashtags

**Goal:** Write the TikTok post caption and hashtag set.

The caption for this format should feel like it was written by a real gym person — not a brand.

**Caption Formula:**
- **Hook line** (1 sentence, lowercase, matches the vibe of the slide 1 text)
- **Brief body** (optional — 1-2 sentences about the reveal or the app feature)
- **CTA** (low-pressure — "link in bio", "track your frame", "save this")
- **Hashtags** (5-8 tags — mix of broad and niche)

**Example Caption:**
```
when your strength score says you're built different but your chest still says 3 more days 🥲

recovery tracking in the app genuinely changed how i train. link in bio

#gainframe #gymtok #fitnessapp #gymlife #recoverytraining #strengthtraining #gymbro
```

Save the caption + hashtags to:
```
tik-tok-slides-jack/[slug]/content.md
```

---

### Phase 6: Send to Phone (iCloud Sync)

Copy assets to iCloud for posting from iPhone:

```bash
SLUG="[slug]"
DEST="/Users/michael.rode/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
mkdir -p "$DEST"
cp /Users/michael.rode/code/project/gain-frame-privacy/tik-tok-slides-jack/$SLUG/slide-*.png "$DEST/"
cp /Users/michael.rode/code/project/gain-frame-privacy/tik-tok-slides-jack/$SLUG/content.md "$DEST/"
```

Confirm to user:
> Files are syncing to **iCloud Drive → TikTok-Drafts → [slug]**
> Open Files app on iPhone → select slides → post to TikTok as a 2-slide carousel.

---

## Rules & Constraints

- **Photorealism is non-negotiable.** If the generated image looks illustrated or AI-rendered, regenerate. The whole format depends on looking like a real person.
- **Face consistency.** Always include `base-image.png` in `ImagePaths`. The same guy must appear in every post.
- **Hook text is verbatim.** Generate the hook text EXACTLY as approved in Phase 1. No paraphrasing, no capitalization changes unless the user requests it.
- **Lowercase hook style.** The overlay text should feel like a real creator wrote it — lowercase or sentence case, NOT ALL CAPS marketing speak.
- **The app screenshot is the punchline.** Slide 2 creates the "aha" moment. The caption on slide 2 should land the joke or reveal, not just describe the feature.
- **2-slide format.** This is not a carousel with 5-7 slides — it's always exactly 2 slides.
- **No GainFrame Guy mascot.** This format uses the photorealistic character Jack, not the cartoon bracket-head mascot. Do not mix formats.
- **Save everything.** Each post gets its own directory under `tik-tok-slides-jack/[slug]/` with both slides + `content.md`.

## Reference Files

- `/Users/michael.rode/code/project/gain-frame-privacy/tik-tok-slides-jack/base-image.png` — **Jack reference image** — ALWAYS include in ImagePaths for slide 1 generation
- App screenshots are provided by the user at runtime for slide 2
