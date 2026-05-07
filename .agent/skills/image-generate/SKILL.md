---
name: Image Generate
description: Generate brand-aligned images via Google Gemini's Nano Banana model (gemini-3.1-flash-image-preview). Wraps the Gemini API call + base64 decode + WebP conversion into one workflow. Used by blog-post-generator, comparison-article-generator, and tiktok for cover images and inline illustrations.
triggers:
  - "generate image"
  - "generate cover"
  - "generate cover image"
  - "make a cover"
  - "image-generate"
  - "/image-generate"
---

# Image Generate Skill

## Overview

Single canonical image-generation surface for the GainFrame content pipeline. Wraps **Google Gemini 2.5 Flash Image** (codename "Nano Banana") via curl. Handles prompt building from the brand template, API call, base64 decode, WebP conversion, and cleanup.

**Why Gemini specifically:** GainFrame already uses Gemini for body composition AI. Same vendor, same billing, same `GEMINI_API_KEY`. Cost is ~$0.039 per image — negligible.

**Why model-agnostic name (`image-generate` not `nano-banana-generate`):** Lets us swap models later (Recraft V3, Imagen, FLUX) without renaming the skill. Default is Nano Banana; the `model` parameter can override.

---

## The Workflow

### Phase 0: Inputs

Required:
- `subject` — what the image is OF (e.g. `"a side-by-side comparison of two app interfaces"` or `"dumbbells on a clean background"`)
- `target_path` — absolute path to write the final `.webp` file (e.g. `/Users/michael.rode/code/project/gain-frame-privacy/docs/blog/metamorph-vs-gainframe/assets/cover.webp`)

Optional (with defaults):
- `aspect_ratio` — `"4:3"` (default, blog covers), `"16:9"` (wide hero), `"9:16"` (TikTok), `"1:1"` (square)
- `style_template` — `"blog-cover"` (default, the abstract vector line-art prompt), `"raw"` (skip template, use subject as the full prompt)
- `model` — `"gemini-3.1-flash-image-preview"` (default — Nano Banana 2, newest). Documented fallbacks: `"gemini-2.5-flash-image"` (Nano Banana, the original GA), `"gemini-3-pro-image-preview"` / `"nano-banana-pro-preview"` (Nano Banana Pro). Future: swap to Recraft V3 or Imagen by changing this. Verify available models with `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | jq -r '.models[] | select(.displayName | test("Banana"; "i")) | .name'`
- `quality` — WebP quality 1-100, default `80`

### Phase 1: Build Prompt

If `style_template == "blog-cover"` (default), wrap the subject in this prompt verbatim (sourced from `blog-post-generator/SKILL.md` Phase 3.3):

```
A minimalist, abstract vector line-art illustration of [SUBJECT].
Thin, precise UI-style lines in dark charcoal gray (#2D3748) against a very light off-white/cream background (#F7FAFC).
Subtle, muted pastel accent colors (coral red #FF6B6B, sage green #48BB78, golden yellow #ECC94B) used sparingly to highlight key elements.
The style should resemble high-end SaaS product illustrations, clean, geometric, with plenty of negative space.
No text, no text rendering.
Aspect ratio: [ASPECT_RATIO] composition.
```

Substitute `[SUBJECT]` with the input subject and `[ASPECT_RATIO]` with the requested aspect ratio (e.g. "4:3 landscape").

If `style_template == "raw"`, use the `subject` as the full prompt directly.

### Phase 2: Call Gemini API

Build the request JSON safely with `jq` (avoids escaping bugs with quote characters in prompts):

```bash
# IMPORTANT: source ~/.zshrc to load GEMINI_API_KEY (Claude Code's bash doesn't auto-source it)
source ~/.zshrc

# Build request
jq -n --arg prompt "$PROMPT_TEXT" '{
  contents: [{parts: [{text: $prompt}]}],
  generationConfig: {responseModalities: ["IMAGE", "TEXT"]}
}' > /tmp/gemini-req.json

# Call API (model name is parameterized)
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @/tmp/gemini-req.json > /tmp/gemini-resp.json
```

Latency: typically 5-15 seconds for Nano Banana at 4:3 cover size.

### Phase 3: Decode + Convert

Check for API errors first:

```bash
if jq -e '.error' /tmp/gemini-resp.json > /dev/null; then
  echo "❌ API error:"
  jq '.error' /tmp/gemini-resp.json
  rm /tmp/gemini-req.json /tmp/gemini-resp.json
  exit 1
fi
```

Extract the base64 image:

```bash
# Get the inline image data (Gemini returns image/png base64-encoded)
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/gemini-resp.json > /tmp/gemini-img.b64

# Decode to PNG
base64 --decode -i /tmp/gemini-img.b64 -o /tmp/cover.png

# Verify the PNG is non-empty
if [ ! -s /tmp/cover.png ]; then
  echo "❌ Decoded image is empty — likely the response had no inline image. Check /tmp/gemini-resp.json"
  exit 1
fi

# Convert to WebP at the requested quality
mkdir -p "$(dirname "$TARGET_PATH")"
cwebp -q "${QUALITY:-80}" /tmp/cover.png -o "$TARGET_PATH"
```

### Phase 4: Cleanup + Report

```bash
# Cleanup temp files
rm /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64 /tmp/cover.png

# Report
SIZE=$(stat -f%z "$TARGET_PATH" 2>/dev/null || stat -c%s "$TARGET_PATH")
echo "✅ Image generated: $TARGET_PATH"
echo "   Model: $MODEL | Size: $SIZE bytes | Cost: ~\$0.039 (Nano Banana)"
```

---

## Full reference Bash workflow (single invocation)

This is the actual script the skill executes when invoked. Copy-paste-ready.

```bash
#!/bin/bash
set -e

# === INPUTS (substitute or pass as arguments) ===
SUBJECT="${1:-an abstract progress chart}"
TARGET_PATH="${2:-/tmp/output.webp}"
ASPECT_RATIO="${3:-4:3 landscape}"
STYLE_TEMPLATE="${4:-blog-cover}"
MODEL="${5:-gemini-3.1-flash-image-preview}"
QUALITY="${6:-80}"

# === LOAD ENV ===
source ~/.zshrc
if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ GEMINI_API_KEY not set — add 'export GEMINI_API_KEY=...' to ~/.zshrc"
  exit 1
fi

# === BUILD PROMPT ===
if [ "$STYLE_TEMPLATE" = "blog-cover" ]; then
  PROMPT="A minimalist, abstract vector line-art illustration of ${SUBJECT}. Thin, precise UI-style lines in dark charcoal gray (#2D3748) against a very light off-white/cream background (#F7FAFC). Subtle, muted pastel accent colors (coral red #FF6B6B, sage green #48BB78, golden yellow #ECC94B) used sparingly to highlight key elements. The style should resemble high-end SaaS product illustrations, clean, geometric, with plenty of negative space. No text, no text rendering. Aspect ratio: ${ASPECT_RATIO} composition."
else
  PROMPT="$SUBJECT"
fi

# === BUILD REQUEST ===
jq -n --arg prompt "$PROMPT" '{
  contents: [{parts: [{text: $prompt}]}],
  generationConfig: {responseModalities: ["IMAGE", "TEXT"]}
}' > /tmp/gemini-req.json

# === CALL API ===
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
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
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/gemini-resp.json > /tmp/gemini-img.b64

if [ ! -s /tmp/gemini-img.b64 ]; then
  echo "❌ No inline image in response. Full response:"
  cat /tmp/gemini-resp.json
  rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64
  exit 1
fi

base64 --decode -i /tmp/gemini-img.b64 -o /tmp/cover.png

if [ ! -s /tmp/cover.png ]; then
  echo "❌ Decoded image is empty"
  exit 1
fi

mkdir -p "$(dirname "$TARGET_PATH")"
cwebp -q "$QUALITY" /tmp/cover.png -o "$TARGET_PATH" 2>&1 | tail -5

# === CLEANUP + REPORT ===
rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64 /tmp/cover.png

SIZE=$(stat -f%z "$TARGET_PATH" 2>/dev/null || stat -c%s "$TARGET_PATH")
echo "✅ Image generated: $TARGET_PATH"
echo "   Subject: $SUBJECT"
echo "   Model: $MODEL | WebP size: $SIZE bytes | Cost: ~\$0.039"
```

---

## Rules & Constraints

- **Always `source ~/.zshrc` at the start** — Claude Code's Bash doesn't auto-source it, and that's where `GEMINI_API_KEY` lives.
- **Never log the full API key** — only the length, never the value. Use `${#GEMINI_API_KEY}` if you need to verify it's set.
- **Always check for `.error` in the API response** — Gemini returns errors as JSON, not HTTP error codes, so a 200 OK can still mean failure.
- **Never overwrite an existing image without explicit user intent.** If `TARGET_PATH` already exists, append a suffix (`-v2.webp`, `-v3.webp`) or ask first.
- **Cost-aware logging** — every successful generation should log the estimated cost so the user can track spend.
- **Cleanup temp files** — always remove `/tmp/gemini-req.json`, `/tmp/gemini-resp.json`, `/tmp/gemini-img.b64`, `/tmp/cover.png`.
- **Aspect ratio is best-effort** — Nano Banana doesn't have a strict aspect_ratio parameter; it follows the prompt instruction. If the output is the wrong shape, regenerate or crop with `magick`/`sips`.
- **Iterate the prompt 1-3 times** if the first generation doesn't match the brand aesthetic. Cost is negligible.

---

## Integration with Other Skills

**Upstream:** None — utility skill, called by other skills.

**Downstream:**
- `blog-post-generator` — Phase 3.3 cover image generation. Replace the existing reference to `generate_image` / `fal-generate` with `image-generate`.
- `comparison-article-generator` — same Phase 3.3 inheritance from blog-post-generator.
- `tiktok` — for carousel slide images. Use `aspect_ratio: "9:16"` and `style_template: "raw"` (TikTok carousels need their own prompt style, not the SaaS-illustration template).
- `feature-page-generator` — for feature page heroes if needed.

---

## Reference Files

- `/Users/michael.rode/code/project/gain-frame-privacy/.agent/skills/blog-post-generator/SKILL.md` — Phase 3.3 contains the canonical brand prompt template that this skill uses by default
- `/Users/michael.rode/code/project/gain-frame-privacy/product-context.md` — brand voice + visual identity context

---

## Setup checklist (one-time)

1. Get Gemini API key at https://aistudio.google.com/app/apikey (free tier exists; paid is ~$0.039/image)
2. Add to shell config: `echo 'export GEMINI_API_KEY="your_key"' >> ~/.zshrc && source ~/.zshrc`
3. Verify tools installed: `which curl jq base64 cwebp` (all should resolve — `cwebp` is from `brew install webp`)
4. Test: invoke this skill with a trivial subject like "a circle and a square" to confirm the round-trip works

Once setup is done, every blog-post-generator and comparison-article-generator run can call this skill seamlessly.
