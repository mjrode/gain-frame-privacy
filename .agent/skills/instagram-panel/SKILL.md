---
name: instagram-panel
description: Generates GainFrame Guy multi-panel Instagram carousel posts. Preferred formats are (C) "what people think X / what actually X" myth-busts and (D) two-panel contrast statements — debate-bait lanes; (A) tiered good/better/best and (B) day→year escalation are also available. Can recommend post ideas, dedups against existing posts, reads GEMINI_API_KEY from ~/.zshrc, and always syncs finished posts to the iCloud TikTok-Drafts folder.
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
| **E — Sounds-fake listicle** ("LIFTING TIPS") | Clean white, text-top/illo-bottom | "X tips that sound FAKE but actually work" | 6 slides: cover + 4 numbered tips + plug |

**Michael's preferred lanes are C and D** — myth-bust debate bait, same energy as the
winning TikTok comics (question-fear / nuance-flip hooks). Default new posts to C or D;
use A/B only when he asks or the topic is a natural tier-list/escalation. Standard post
shape: **2-slide carousel** — the content slide + the shared Download CTA
(`docs/assets/tiktok/panels/_shared/cta.png`, copied in as `slide-2.png`).

Worked examples live at `docs/assets/tiktok/panels/fat-loss/` (A),
`docs/assets/tiktok/panels/kings-mindset/` (B), `docs/assets/tiktok/panels/abs-truth/` (C),
and `docs/assets/tiktok/panels/cardio-gains/` (D).

---

## Recommending posts + no duplicates (do this BEFORE ideating)

When Michael asks for post ideas (or just says "make some posts"), recommend ~10,
mostly C/D, and make the app the punchline where natural (photos/tracking/data topics
convert best — see `scale-vs-photos`, `progress-truth`, `motivation-data`).
Flat declarative hooks only — no "here's exactly what worked" AI-slop framing.

**Dedup first.** Check BOTH existing-post lists and skip any topic/hook already used,
even reworded (e.g. "why your abs don't show" ≈ "what actually builds abs" — too close):

```bash
ls docs/assets/tiktok/panels/                                                  # panel posts (this skill)
ls "$HOME/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/"         # everything ever drafted (/tiktok + panels)
```

The TikTok-Drafts listing is the authoritative "already posted or queued" set — it has
dozens of comic-lane slugs too. If a proposed idea collides, drop it and propose a
different angle rather than a synonym of the same one.

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

# 2. Generate. The key lives in ~/.zshrc on the Mac — extract it like this
#    (shell state doesn't persist between agent Bash calls, so prefix EVERY call):
export GEMINI_API_KEY=$(sed -n 's/.*GEMINI_API_KEY="\([^"]*\)".*/\1/p' ~/.zshrc | head -1)
bash .agent/skills/instagram-panel/generate.sh \
  docs/assets/tiktok/panels/<slug>/slide-N.png \
  docs/assets/tiktok/panels/<slug>/prompts/slide-N.txt
```

If the sed pulls nothing (e.g. remote container — no ~/.zshrc), stop and ask Michael
for the key rather than guessing.

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

**Learned the hard way:** if ALL six items are plain objects, the model force-inserts
extra mascot figures anyway (and ignores "no figure" instructions). Always give
GainFrame Guy 1–2 sanctioned item spots (an action item like "walking" or "planking")
and mark the rest "objects only, no figure" — see
`docs/assets/tiktok/panels/clean-eating-truth/prompts/slide-1.txt` for the fixed pattern.

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

## Format E — "Sounds fake but actually works" listicle

6-slide counterintuitive-tips carousel (enduroapppp running-tips reference, adapted to
GainFrame white). Slide 1 = cover: giant stacked headline "<TOPIC> TIPS / THAT SOUND /
FAKE / BUT ACTUALLY / WORK" with "FAKE" extra-large in red, two mascots doing the
topic below. Slides 2–5 = numbered tips: HUGE claim headline (key words red) + 1–2
bold ALL-CAPS sublines explaining why, mascot demonstrating below. Slide 6 = plug
that mirrors the hook: "SOUNDS FAKE: <app claim> / ACTUALLY WORKS." + phone +
DOWNLOAD GAINFRAME + App Store badge. Counter pill "N/6".

The tips MUST genuinely sound fake (counterintuitive but true) — that's the hook.
Dedup each tip against TikTok-Drafts before using it.

**Prompt template:** copy `docs/assets/tiktok/panels/lifting-tips-sound-fake/prompts/`
(slide-1 = cover, slide-2 = tip, slide-6 = plug) and swap topic, claims, and scenes.

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

## Caption + iCloud sync (REQUIRED final step for every post)

A post is not done until it's in the shared TikTok-Drafts folder (iCloud Drive —
this is how it reaches Michael's phone).

1. Write `content.md` (caption + hashtags) in the post dir. Caption style: ONE
   short casual line, funny if possible — real-TikTok voice, not marketing copy
   (lowercase fine, no "Save this 💪" formulas, no explaining the post). EXACTLY
   5 hashtags mixing broad + niche (#gymtok #lifting #gymhumor #fitness #gainframe).
2. Copy the shared CTA in as slide 2: `cp docs/assets/tiktok/panels/_shared/cta.png docs/assets/tiktok/panels/$SLUG/slide-2.png`
3. Sync to iCloud. When running ON the Mac (local session — check `ls ~/Library/Mobile\ Documents/` works), do it directly:
   ```bash
   SLUG="<slug>"
   DEST="$HOME/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
   mkdir -p "$DEST"
   cp docs/assets/tiktok/panels/$SLUG/slide-*.png "$DEST/"
   cp docs/assets/tiktok/panels/$SLUG/content.md "$DEST/"
   ```
   When running in a remote container (no iCloud), commit everything and give
   Michael the same block prefixed with `git pull` to run on his Mac.
4. Commit the post dir (prompts + slides + content.md) so remote sessions can dedup
   against it.

## Reference files

| File | Purpose |
|------|---------|
| `.agent/skills/instagram-panel/generate.sh` | Slide generator (Gemini; reads `GEMINI_API_KEY`) |
| `docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg` | Character template (attached every call) |
| `docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md` | Character design + typography |
| `docs/assets/tiktok/panels/fat-loss/prompts/slide-1.txt` | Format A worked prompt |
| `docs/assets/tiktok/panels/kings-mindset/prompts/slide-1.txt` | Format B worked prompt |
| `docs/assets/tiktok/promo/gainframe-live-now/` | CTA/Download slide pattern + QR script |
