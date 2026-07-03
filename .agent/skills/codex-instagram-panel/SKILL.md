---
name: Codex Instagram Panel Generator
description: Codex-specific copy of the GainFrame Guy instagram-panel workflow. Use when creating multi-panel Instagram carousels in Codex with OpenAI GPT Image 2 (`gpt-image-2`) for slide image generation. Two formats — tiered "good/better/best" and "X per day → is Y per year" escalation. Always clean white background.
triggers:
  - "codex instagram panel"
  - "codex panel post"
  - "codex tiered panel"
  - "codex good better best"
  - "gpt image 2 panel"
  - "gpt-image-2 instagram panel"
  - "openai panel post"
---

# Codex Instagram Panel Generator

Codex-specific copy of the `instagram-panel` skill. Same conversational workflow
and same output, but image generation uses **OpenAI GPT Image 2 (`gpt-image-2`)**
instead of the Gemini pipeline.

**Read the canonical skill for all format details, the FAT LOSS 9-slide copy sheet,
the CTA-slide guidance, and the review checklist:**
```
view_file .agent/skills/instagram-panel/SKILL.md
```
Treat it as source material — do NOT edit it when this Codex skill is triggered.
Only the image-generation *tool call* differs (below).

Also read the mascot style guide once before generating:
```
view_file docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md
```

---

## ⭐ Two non-negotiable rules (identical to the canonical skill)

1. **CLEAN WHITE BACKGROUND, ALWAYS (#FFFFFF).** Even though the source references
   use cream / colored / dark backgrounds, GainFrame is white-forward. Format A
   shows the tier with a light pastel wash + colored banner; Format B is pure white
   with black text and red accent numbers.

2. **GET THE MASCOT HEAD RIGHT — no human head.** Paste the CHARACTER BLOCK below
   verbatim into every prompt. The most common failure is a realistic human
   head/neck behind the bracket frame; the fix is (a) these explicit negatives and
   (b) a FLAT black silhouette body (never realistic anatomy).

### CHARACTER BLOCK (paste verbatim into every slide prompt)

```
CRITICAL — GAINFRAME GUY CHARACTER (copy EXACTLY from the reference images; get this right):
- The HEAD is ONLY a "scan frame" logo: four separate rounded corner brackets floating in empty space. Three brackets are black; the BOTTOM-RIGHT bracket is RED. Inside the frame float just TWO simple googly eyes and one small "S"-curve nose. That is the ENTIRE head.
- There is NO human head, NO human face, NO skull, NO hair, NO ears, and NO neck anywhere. Do NOT draw a person's head behind or inside the brackets. The space inside and behind the brackets is plain white background — nothing is behind them.
- The bracket-frame head floats directly above the shoulders with a small gap; the body never connects to a human head.
- BODY: a solid, FLAT, matte BLACK/charcoal cartoon silhouette (a shadow-figure look) with thick clean outlines and flat colors — NOT realistic skin, NOT anatomical muscle rendering. Wearing olive/army-green shorts (or black training shorts for gym scenes).
```

---

## Codex Image Generation Override

**USE:** OpenAI **GPT Image 2** (`gpt-image-2`) via the Image API edits endpoint with
repeated `image[]=@path` reference inputs.
**DO NOT USE:** the Gemini `generate.sh` pipeline from the canonical skill.

Attach the same three references every call so the mascot stays on-model. Run one
slide at a time and review each before continuing. Substitute `PROMPT_TEXT`,
`[slug]`, and `[N]`:

```bash
# Confirm OPENAI_API_KEY exists first; never print the key value.
curl -sS -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "size=1024x1536" \
  -F "quality=high" \
  -F "output_format=png" \
  -F "image[]=@docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg" \
  -F "image[]=@docs/assets/gainframe-guy/illustrations/mascot-pictures.jpeg" \
  -F "image[]=@docs/assets/gainframe-guy/illustrations/gary-badge.png" \
  -F "prompt=${PROMPT_TEXT}" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > "docs/assets/tiktok/panels/[slug]/slide-[N].png"
```

Notes:
- `size=1024x1536` is the portrait (4:5-ish) option; use it for all panel slides.
- `quality=low` for throwaway drafts only; `high` for finals.
- Do NOT use `background=transparent` — GPT Image 2 doesn't support it (and we want
  solid white anyway).
- If text is misspelled, cut off, or the head renders as a human, simplify/retighten
  the prompt (re-paste the CHARACTER BLOCK) and regenerate only that slide.

---

## Prompt templates

Copy the worked prompts and swap the topic-specific parts (title, banner labels,
props, per-panel build/mood, or the two escalation lines). Keep the CHARACTER BLOCK
and the white-background lines unchanged.

- **Format A (tiered):** `docs/assets/tiktok/panels/fat-loss/prompts/slide-1.txt`
- **Format B (escalation):** `docs/assets/tiktok/panels/kings-mindset/prompts/slide-1.txt`

The FAT LOSS 9-slide copy sheet and the CTA/Download-slide pattern live in the
canonical skill — read it (top of this file) for both.

## Caption + iCloud sync

Same as the canonical skill: write `content.md` in the post dir, then copy
`slide-*.png` + `content.md` into
`$HOME/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/<slug>/`.
