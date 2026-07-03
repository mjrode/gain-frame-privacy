---
name: instagram-panel
description: Generates GainFrame Guy multi-panel Instagram carousel slides in two proven formats — (A) tiered "good/better/best" panels and (B) "X per day → is Y per year" escalation panels. Uses the Gemini image API (same engine as /tiktok) with the mascot reference images. Always renders on a clean white background.
triggers:
  - "instagram panel"
  - "instagram-panel"
  - "panel post"
  - "tiered panel"
  - "good better best"
  - "fat loss panel"
  - "per day per year"
---

# Instagram Panel Generator

Generates GainFrame Guy **multi-panel Instagram carousels**. Image generation uses
the Gemini API via `generate.sh` (same pipeline as `/tiktok`), passing the mascot
reference images so GainFrame Guy stays on-model.

Four formats — pick one per post:

| Format | Look | Hook | Panels |
|--------|------|------|--------|
| **A — Tiered** ("FAT LOSS") | Clean white, light pastel tiers | good → better → best | 3 stacked, RED→ORANGE→GREEN banners |
| **B — Escalation** ("Kings Mindset") | Clean white, minimal | "X per day → is Y per year" | 2 stacked, same pose, escalating text |
| **C — Think vs Actually** ("ABS") | Clean white, 2 labeled rows | "What people think X / what actually X" | 2 rows × 3 captioned mini-illustrations |
| **D — Contrast statement** ("CARDIO") | Clean white, 2 stacked scenes | virtue statement / twist counterpoint | 2 stacked, mood flips, key words in red |

Worked examples live at `docs/assets/tiktok/panels/fat-loss/` (A),
`docs/assets/tiktok/panels/kings-mindset/` (B), `docs/assets/tiktok/panels/abs-truth/` (C),
and `docs/assets/tiktok/panels/cardio-gains/` (D).

---

## ⭐ Two non-negotiable rules

1. **CLEAN WHITE BACKGROUND, ALWAYS (#FFFFFF).** Same as every GainFrame TikTok/IG
   post. This holds even though the source references use cream, colored, or dark
   gym backgrounds — GainFrame's brand is white-forward. For Format A, convey the
   tier with a *very light pastel wash* + a colored banner, never a heavy color
   fill. For Format B, pure white with black text (not the reference's dark scene).

2. **GET THE MASCOT HEAD RIGHT — no human head.** The single most common failure is
   the model drawing a realistic human head/neck behind the bracket frame. Always
   paste the CHARACTER BLOCK below verbatim into every prompt. The head is ONLY the
   floating scan-frame; the body is a FLAT black silhouette (a realistic/anatomical
   body reads as human and triggers the bug).

### CHARACTER BLOCK (paste verbatim into every slide prompt)

```
CRITICAL — GAINFRAME GUY CHARACTER (copy EXACTLY from the reference images; get this right):
- The HEAD is ONLY a "scan frame" logo: four separate rounded corner brackets floating in empty space. Three brackets are black; the BOTTOM-RIGHT bracket is RED. Inside the frame float just TWO simple googly eyes and one small "S"-curve nose. That is the ENTIRE head.
- There is NO human head, NO human face, NO skull, NO hair, NO ears, and NO neck anywhere. Do NOT draw a person's head behind or inside the brackets. The space inside and behind the brackets is plain white background — nothing is behind them.
- The bracket-frame head floats directly above the shoulders with a small gap; the body never connects to a human head.
- BODY: a solid, FLAT, matte BLACK/charcoal cartoon silhouette (a shadow-figure look) with thick clean outlines and flat colors — NOT realistic skin, NOT anatomical muscle rendering. Wearing olive/army-green shorts (or black training shorts for gym scenes).
```

---

## The pipeline (2 steps)

```bash
# 1. Author the slide prompt (one .txt per slide) — see templates below.
#    docs/assets/tiktok/panels/<slug>/prompts/slide-N.txt

# 2. Generate (reads GEMINI_API_KEY from env; source it first — lives in ~/.zshrc on the Mac).
GEMINI_API_KEY=... bash .agent/skills/instagram-panel/generate.sh \
  docs/assets/tiktok/panels/<slug>/slide-N.png \
  docs/assets/tiktok/panels/<slug>/prompts/slide-N.txt
```

`generate.sh` always attaches three references (template + muscular ref + badge).
Output is a single 4:5 (1080×1350) PNG per slide. Generate one slide at a time and
review each before moving on — character consistency needs sequential checks.

---

## Format A — Tiered "good / better / best"

3 equal horizontal panels on white, each a very light pastel wash (pale red → pale
orange → pale mint) with a glossy colored banner (RED → ORANGE → GREEN). The SAME
GainFrame Guy on the LEFT of each panel with category props on the RIGHT; his build
+ mood improve top→bottom (overweight+frown → average → lean+muscular+smile). Bold
black "TITLE" top-left, gray "N/9" counter pill top-right.

**Prompt template:** copy `docs/assets/tiktok/panels/fat-loss/prompts/slide-1.txt`
and swap the title, the three banner labels, the three prop descriptions, and the
per-panel build/mood. Keep the CHARACTER BLOCK and the white/pastel background lines
unchanged.

### FAT LOSS — full 9-slide copy sheet (worked example)

| # | Title | Panel 1 (red) | Panel 2 (orange) | Panel 3 (green) | Props (1 / 2 / 3) |
|---|-------|---------------|------------------|-----------------|-------------------|
| 1 | FAT LOSS | Full Sugar Soda | Fruit Juice / Smoothie | Water + Zero Sugar Soda | cola can+glass / OJ+green smoothie / water bottle+zero can |
| 2 | FAT LOSS | Training 0x per Week | Training 1-2x per Week | Training 3-4x per Week | couch+remote / single dumbbell / squat rack+dumbbell rack+bench |
| 3 | FAT LOSS | Under 80g Protein a Day | 100-120g Protein a Day | 150g+ Protein a Day | chips+bread+cookies / chicken+eggs+greek yogurt / salmon+whey+cottage cheese |
| 4 | FAT LOSS | 5 Hours a Night | 6-7 Hours a Night | 8 Hours + Consistent Routine | alarm(5:00)+phone / alarm+bed / alarm(midnight)+moon |
| 5 | FAT LOSS | Not Tracking Food | Guesstimating | Tracking & Weighing | junk-food spread (shrug) / plate of chicken+rice (shrug) / phone macro app+food scale |
| 6 | FAT LOSS | Under 3,000 Steps a Day | 5,000-7,000 Steps a Day | 10,000 Steps Every Day | couch+chips+phone"1,200" / sidewalk+phone"6,000" / park+watch"10,247" |
| 7 | FAT LOSS | Under 1 Litre a Day | 1.5-2 Litres a Day | 3 Litres Every Day | iced coffee/soda / water bottle / big gallon jug |
| 8 | FAT LOSS | HIIT 1x per Week | Moderate Cardio 3x per Week | 10,000 Steps Every Day | treadmill"HIIT"(gasping) / treadmill"moderate cardio" / park walk+skyline |
| 9 | **CTA** | — | — | — | **GainFrame Download CTA (see below)** |

> Text is copied verbatim from the reference. The final slide replaces the original
> "Scroll / Like / Follow" engagement slide with a GainFrame **Download** CTA.

---

## Format B — Escalation "X per day → is Y per year"

2 equal horizontal panels on white showing the SAME pose; big bold BLACK centered
text with the number in red (#E53935). Panel 1 = the daily action; panel 2 = the
yearly multiple. Gray "N/4" counter pill top-right. Faint gray bracket-logo
watermark allowed.

**Prompt template:** copy
`docs/assets/tiktok/panels/kings-mindset/prompts/slide-1.txt`; swap the scene, the
two text lines, and the counter. Keep the CHARACTER BLOCK + white background.

Good GainFrame-relevant escalations: "50 Pull Ups a Day → 18,250 a Year",
"1 Progress Photo a Week → 52 Check-ins a Year", "Tracking 1 Habit a Day →
365 Habits a Year", "5 Min of Progress Photos a Week → 4+ Hours of Data a Year".

---

## Format C — "What people think X / What actually X"

Myth-bust contrast (builtwithscience-style). One 4:5 slide on pure white, two
labeled sections. Top: bold black ALL-CAPS header `WHAT PEOPLE THINK <X>` over a
row of THREE captioned mini-illustrations (the myths). Bottom: header
`WHAT ACTUALLY <X>` over three more (the truths). Captions are one or two words,
plain black sans-serif. Action items get a mini GainFrame Guy doing the thing;
food/object items get clean flat props. Gray "N/2" counter pill top-right.
The comment bait is people defending the top row.

**Prompt template:** copy `docs/assets/tiktok/panels/abs-truth/prompts/slide-1.txt`
and swap the two headers plus the six item descriptions + captions. Keep the
CHARACTER BLOCK and white background lines unchanged. With six small figures in
one image, mascot-head errors are MORE likely — check every mini-figure on review.

---

## Format D — Two-panel contrast statement

Nuance-flip debate bait (Coach Gabriel-style, adapted to GainFrame white).
2 stacked panels, thin light-gray divider. TOP: the virtue statement — GainFrame
Guy confident/strong doing the thing, big bold black ALL-CAPS text with the key
word in red (#E53935). BOTTOM: the twist/counterpoint — same character, mood and
scene flipped (slumped, struggling, surrounded by the failure props), text in the
same style. Statements stay short and arguable — that's the engagement engine.
Gray "N/2" counter pill top-right.

**Prompt template:** copy `docs/assets/tiktok/panels/cardio-gains/prompts/slide-1.txt`
and swap the two scenes + two text lines. Keep the CHARACTER BLOCK + white
background (never the reference's dark painted scenes).

---

## The CTA / Download slide (all formats)

Replace the source's follow/engagement slide with a GainFrame app CTA. Keep it on
clean white. Reuse the launch-promo pattern from
`docs/assets/tiktok/promo/gainframe-live-now/` — GainFrame Guy beside/holding a
phone showing the real app, a bold "DOWNLOAD GAINFRAME" headline, the black
"Download on the App Store" badge, and optionally the scannable QR
(`add_qr.py` there, verified to decode). Match the panel post's title font.

---

## Review checklist (every slide)

- **Mascot head:** floating bracket frame only (bottom-right red), googly eyes +
  S-curve nose, **no human head/neck behind it.** Body is a flat black silhouette.
- **Background:** pure white / light pastel — never heavy color or a dark scene.
- **Text:** every banner/label spelled exactly; counter pill correct (`N/9`, `N/4`).
- **Format A:** tier order red→orange→green top→bottom; build improves top→bottom;
  props match the category.
- **Format B:** same pose both panels; number in red; day→year math correct.
- **Format C:** exactly 3 items per row, captions spelled exactly; EVERY mini
  GainFrame Guy has the bracket-frame head (small figures regress to human heads).
- **Format D:** mood/build contrast reads instantly; key words red; statements
  verbatim.

Fix by editing the slide's `.txt` and re-running `generate.sh`. Iterate until clean.

---

## Caption + iCloud sync (same as /tiktok)

1. Write `content.md` (caption + hashtags) in the post dir.
2. Sync to phone (run on the Mac, where iCloud lives):
   ```bash
   SLUG="<slug>"
   DEST="$HOME/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
   mkdir -p "$DEST"
   cp docs/assets/tiktok/panels/$SLUG/slide-*.png "$DEST/"
   cp docs/assets/tiktok/panels/$SLUG/content.md "$DEST/"
   ```

## Reference files

| File | Purpose |
|------|---------|
| `.agent/skills/instagram-panel/generate.sh` | Slide generator (Gemini; reads `GEMINI_API_KEY`) |
| `docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg` | Character template (attached every call) |
| `docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md` | Character design + typography |
| `docs/assets/tiktok/panels/fat-loss/prompts/slide-1.txt` | Format A worked prompt |
| `docs/assets/tiktok/panels/kings-mindset/prompts/slide-1.txt` | Format B worked prompt |
| `docs/assets/tiktok/promo/gainframe-live-now/` | CTA/Download slide pattern + QR script |
