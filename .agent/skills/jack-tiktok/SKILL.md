---
name: Jack TikTok Generator
description: Generates photorealistic Jack TikTok 2-slide posts (hook photo + app punchline). Uses the Gemini API directly via curl with base64-encoded reference images for image generation.
triggers:
  - "jack tiktok"
  - "jack post"
  - "jack slide"
  - "gym guy post"
  - "hook slide"
  - "real photo tiktok"
---

# Jack TikTok Generator

## Overview

Generates photorealistic Jack TikTok 2-slide posts (hook photo + app punchline). Image generation uses the Gemini API directly via curl with base64-encoded reference images.

Phases 1, 2, 5, and 6 are unchanged. Only the image generation bash blocks in Phase 3 and Phase 4 differ.

### The Two-Slide Story Structure

**Slide 1 (Setup — Guy Photo):**
A photorealistic photo of "Jack" in a candid real-life location (car, gym, outdoors). Bold white text with black stroke is overlaid directly on the photo. This text is the **hook/setup** — an accusation, a challenge, or a thing someone said.

Example: Guy in car, hook text reads `"you've changed"`

**Slide 2 (Punchline — App Screenshot):**
A GainFrame app screenshot that serves as **visual proof/evidence**. Bold white text with black stroke is overlaid directly on the screenshot. This text is the **comeback/punchline** — a dry, confident, or funny response to the hook.

Example: Strength Progress muscle map (Start → Now, all orange → all purple), punchline text reads `"Thanks bro"`

**The joke works like this:** Someone says something to the guy (slide 1 hook) → the app data proves why (slide 2 punchline). The app isn't being advertised — it's being used as the receipts.

### Real Examples From Reference Posts

- Hook: `"you've changed"` → Punchline on Strength Progress map: `"Thanks bro"`
- Hook: `"my strength score after 12 months of grinding..."` → Punchline on muscle map: `"explain this then"`

## The Character: Jack

Jack is the photorealistic young athletic male character in the base reference image:

- **Base image:** `/Users/michael.rode/code/project/gain-frame-privacy/promo-source/tik-tok-slides-jack/base-image.png`
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

### Phase 3: Image Generation — Slide 1 (Jack) — Claude Code (curl + Gemini API)

**Goal:** Generate the photorealistic hook image of Jack in the chosen location/outfit using the Gemini API directly.

#### Setup

```bash
source ~/.zshrc  # loads GEMINI_API_KEY

SLUG="[kebab-case-slug-from-hook]"   # e.g. body-says-stop, strength-score-12-months
OUT_DIR="/Users/michael.rode/code/project/gain-frame-privacy/promo-source/tik-tok-slides-jack/$SLUG"
mkdir -p "$OUT_DIR"

# Absolute path to Jack reference image — ALWAYS include this
JACK_BASE="/Users/michael.rode/code/project/gain-frame-privacy/promo-source/tik-tok-slides-jack/base-image.png"

MODEL="gemini-3.1-flash-image-preview"
```

#### Slide 1 prompt template

Replace bracketed values with the choices locked in during Phase 1:

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

#### Core Image Generation Function — Slide 1 (1 reference image)

This bash block generates slide 1 using `JACK_BASE` as the only reference. Same `--rawfile` discipline as the `tiktok` skill (never use `--arg` for base64 — blows past ARG_MAX).

```bash
# === INPUTS FOR THIS SLIDE ===
PROMPT="[FULL SLIDE 1 PROMPT — see template above with all bracketed values filled in]"
OUTPUT_PATH="$OUT_DIR/slide-1-hook.png"
REF1="$JACK_BASE"
REF1_MIME="image/png"   # base-image.png is PNG

# === ENCODE REFERENCE TO TEMP FILE ===
echo "$PROMPT" > /tmp/prompt.txt
base64 -i "$REF1" | tr -d '\n' > /tmp/r1.b64

# === BUILD REQUEST (1 ref image) ===
jq -n \
  --rawfile prompt /tmp/prompt.txt \
  --rawfile r1 /tmp/r1.b64 \
  --arg m1 "$REF1_MIME" \
  '{contents:[{parts:[
    {inlineData:{mimeType:$m1,data:$r1}},
    {text:$prompt}
  ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/gemini-req.json

rm -f /tmp/prompt.txt /tmp/r1.b64

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

# === DECODE + SAVE ===
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
  /tmp/gemini-resp.json > /tmp/gemini-img.b64

if [ ! -s /tmp/gemini-img.b64 ]; then
  echo "❌ No image in response:"
  cat /tmp/gemini-resp.json
  rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64
  exit 1
fi

base64 --decode -i /tmp/gemini-img.b64 -o "$OUTPUT_PATH"

# === CLEANUP ===
rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64

SIZE=$(stat -f%z "$OUTPUT_PATH" 2>/dev/null || stat -c%s "$OUTPUT_PATH")
echo "✅ Saved: $OUTPUT_PATH ($SIZE bytes) — Cost: ~\$0.039"
```

#### After Generation

Show the image to the user. Ask:

1. Does the face/build match Jack from the base image?
2. Is the hook text readable and correctly spelled?
3. Does the vibe feel authentic (real photo, not AI-looking)?

Iterate if needed. Final approved file lives at:

```
promo-source/tik-tok-slides-jack/[slug]/slide-1-hook.png
```

---

### Phase 4: Slide 2 Finalization — Claude Code (curl + Gemini API)

**Goal:** Add the punchline text overlay to the real app screenshot provided by the user.

**⚠️ CRITICAL RULE:** NEVER recreate or reimagine the app screenshot. The user will provide the actual screenshot file. You MUST pass that file directly as the reference image and ONLY add the text overlay. The screenshot must remain pixel-perfect — every detail of the real GainFrame UI must be preserved exactly as-is.

Ask the user to provide the screenshot file path if they haven't already.

#### Slide 2 prompt template

```
Take this image and reproduce it exactly — do not change ANYTHING about the image. Every pixel of the original must remain identical.

The ONLY addition is a text overlay:
- Text reads exactly: "[PUNCHLINE TEXT]"
- Font: Heavy bold sans-serif, white fill with a very thick black stroke/outline all around (TikTok text tool style)
- Size: Large — roughly 1/6 of the image height
- Position: Center-aligned horizontally, placed in the middle of the image — over the main content area
- Do not alter the background, colors, layout, photos, stats, or any other element of the original screenshot.
```

#### Core Image Generation Function — Slide 2 (1 reference image)

Identical mechanics to Phase 3 — only the prompt and reference image change. Detect MIME type from the user-provided screenshot extension.

```bash
# === INPUTS FOR THIS SLIDE ===
PROMPT="[FULL SLIDE 2 PROMPT — punchline-text overlay instructions above]"
OUTPUT_PATH="$OUT_DIR/slide-2-app.png"
REF1="[EXACT PATH TO USER'S REAL APP SCREENSHOT]"

# Auto-detect MIME — match actual file extension
case "${REF1##*.}" in
  png|PNG)   REF1_MIME="image/png" ;;
  jpg|jpeg|JPG|JPEG) REF1_MIME="image/jpeg" ;;
  webp|WEBP) REF1_MIME="image/webp" ;;
  *)         echo "❌ Unsupported screenshot format: $REF1"; exit 1 ;;
esac

# === ENCODE REFERENCE ===
echo "$PROMPT" > /tmp/prompt.txt
base64 -i "$REF1" | tr -d '\n' > /tmp/r1.b64

jq -n \
  --rawfile prompt /tmp/prompt.txt \
  --rawfile r1 /tmp/r1.b64 \
  --arg m1 "$REF1_MIME" \
  '{contents:[{parts:[
    {inlineData:{mimeType:$m1,data:$r1}},
    {text:$prompt}
  ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/gemini-req.json

rm -f /tmp/prompt.txt /tmp/r1.b64

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

# === DECODE + SAVE ===
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
  /tmp/gemini-resp.json > /tmp/gemini-img.b64

if [ ! -s /tmp/gemini-img.b64 ]; then
  echo "❌ No image in response:"
  cat /tmp/gemini-resp.json
  rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64
  exit 1
fi

base64 --decode -i /tmp/gemini-img.b64 -o "$OUTPUT_PATH"

rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64

SIZE=$(stat -f%z "$OUTPUT_PATH" 2>/dev/null || stat -c%s "$OUTPUT_PATH")
echo "✅ Saved: $OUTPUT_PATH ($SIZE bytes) — Cost: ~\$0.039"
```

#### Verify the screenshot is preserved

After generation, compare side-by-side with the original screenshot. Every UI element — radar chart, color legend, BEFORE/AFTER silhouettes, stats, status bar — must be pixel-identical apart from the text overlay. If Gemini drifted (re-rendered any part of the UI), regenerate with stronger preservation language in the prompt.

Final file:

```
promo-source/tik-tok-slides-jack/[slug]/slide-2-app.png
```

---

### Phase 5: Caption & Hashtags

**Goal:** Write the TikTok post caption and hashtag set.

The caption for this format should feel like it was written by a real gym person — not a brand.

**Caption Formula:**

- **Hook line** (1 sentence, lowercase, matches the vibe of the slide 1 text)
- **Optional second line** (only if it earns its place — a joke or "link in bio", never both)
- **Hashtags** (EXACTLY 5 tags — mix of broad and niche)

Keep it SHORT — one line is the default. No formal sentences, no explaining the
carousel, no "Save this 💪" formulas.

**Example Caption:**

```
when your strength score says you're built different but your chest still says 3 more days 🥲

#gainframe #gymtok #fitnessapp #gymlife #gymbro
```

Save the caption + hashtags to:

```
promo-source/tik-tok-slides-jack/[slug]/content.md
```

---

### Phase 6: Send to Phone (iCloud Sync)

Copy assets to iCloud for posting from iPhone:

```bash
DEST="/Users/michael.rode/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
mkdir -p "$DEST"
cp "$OUT_DIR"/slide-*.png "$DEST/"
cp "$OUT_DIR"/content.md "$DEST/"
echo "✅ Syncing to iCloud → TikTok-Drafts/$SLUG"
```

Confirm to user:

> Files are syncing to **iCloud Drive → TikTok-Drafts → [slug]**
> Open Files app on iPhone → select slides → post to TikTok as a 2-slide carousel.

---

## Rules & Constraints

- **Photorealism is non-negotiable.** If the generated image looks illustrated or AI-rendered, regenerate. The whole format depends on looking like a real person.
- **Face consistency.** Always include `base-image.png` as REF1. The same guy must appear in every post.
- **Hook text is verbatim.** Generate the hook text EXACTLY as approved in Phase 1. No paraphrasing, no capitalization changes unless the user requests it.
- **Lowercase hook style.** The overlay text should feel like a real creator wrote it — lowercase or sentence case, NOT ALL CAPS marketing speak.
- **The app screenshot is the punchline.** Slide 2 creates the "aha" moment. The text on slide 2 should land the joke or reveal, not just describe the feature.
- **2-slide format.** This is not a carousel with 5-7 slides — it's always exactly 2 slides.
- **No GainFrame Guy mascot.** This format uses the photorealistic character Jack, not the cartoon bracket-head mascot. Do not mix formats.
- **Save everything.** Each post gets its own directory under `promo-source/tik-tok-slides-jack/[slug]/` with both slides + `content.md`.
- **Always `source ~/.zshrc`** — `GEMINI_API_KEY` lives there, not in Claude Code's shell environment.
- **Always check for `.error` in the API response** — Gemini returns errors as JSON on HTTP 200.
- **Use `--rawfile` from temp files, never `--arg "$BASE64"` inline** — this matches the discipline of the `tiktok` skill. Even with one image, keep the pattern consistent.
- **MIME types match the actual file extension** — `.png` → `image/png`, `.jpg/.jpeg` → `image/jpeg`.

## Reference Files

| File | Purpose |
|------|---------|
| `promo-source/tik-tok-slides-jack/base-image.png` | **Jack reference image** — ALWAYS pass as REF1 for slide 1 |
| User-provided app screenshot | REF1 for slide 2 — passed as the actual screenshot file |
| `promo-source/tik-tok-slides-jack/[slug]/slide-1-hook.png` | Slide 1 output |
| `promo-source/tik-tok-slides-jack/[slug]/slide-2-app.png` | Slide 2 output |
| `promo-source/tik-tok-slides-jack/[slug]/content.md` | Caption + hashtags |
