---
name: tiktotk
description: "Generates GainFrame Guy TikTok comic carousels at batch scale. Pipeline-first: author copy in posts.json, build with the deterministic _pipeline (Gemini art + Pillow text + QA gates). Use when the user says \"tiktok\", \"tiktok post\", \"new comics\", \"carousel batch\", \"mascot post\", \"gainframe guy\"."
---

# TikTok Comic Carousel Generator (pipeline-first)

## Overview

Produces GainFrame Guy comic carousels for TikTok photo mode. The unit of work
is a **batch** (typically 10 posts), not a single post — the deterministic
pipeline makes marginal posts nearly free, and TikTok photo-mode rewards
volume. Single posts are just a batch of one.

**Do NOT hand-prompt slide images with text baked in.** That workflow is
retired. The image model draws only the mascot on blank white canvas; all
text is composited by Pillow so typography is pixel-identical across every
slide of every post.

Read these before starting:
- `docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md` — character +
  visual constants. (Its background colour is stale: the brand is pure white
  `#FFFFFF`, not cream.)
- `docs/assets/tiktok/comic/POST_LOG.md` — every post ever made. **Dedup
  against it: never re-make a topic that's already logged.**

## The pipeline

Lives in `docs/assets/tiktok/comic/_pipeline/`:

| File | Job |
|------|-----|
| `posts.json` | All standard-carousel copy — one entry per post. This is what you author. |
| `build.py` | Generates mascot art via Gemini, gates it on head QA, calls compose. |
| `compose.py` | Draws ALL slide text deterministically with Pillow. |
| `micro-posts.json` + `micro_build.py` | Two-slide "what people think vs what actually" myth micro-posts. |
| `clean_refs.py` | One-off: rebuilds the white-background reference set. |

Paths are portable: repo root is derived from the script location (override
with `GAINFRAME_ROOT`). Fonts resolve macOS Impact/Arial first, then Linux
substitutes; pin exact fonts with `GF_IMPACT_FONT` / `GF_BODY_FONT`. For
pixel-parity with published posts, build on a machine with real Impact.

```bash
# GEMINI_API_KEY must be set (on the Mac: source ~/.zshrc)
python3 docs/assets/tiktok/comic/_pipeline/build.py --post <slug>
python3 .../build.py --post <slug> --slides cover,1   # subset
python3 .../build.py --post <slug> --recompose        # text-only redo, free
python3 .../build.py --post <slug> --force            # re-roll cached art
python3 .../build.py --all                            # whole batch
```

Raw art is cached in `{post}/_art/` — recomposition never costs API credits.

## Batch workflow

### Phase 0 — Ideas (present before writing copy)

1. Read `POST_LOG.md`; build the "already done" list.
2. Propose a themed batch of ~10 from these lanes (rotate lanes across batches):
   - **Myth-bust question hooks** — "IS X A SCAM?" / "DOES X KILL GAINS?" —
     debate-bait, the proven top performer.
   - **Made-simple cheat sheets** — beginner topic compressed to 4 rules with a
     numbers table feel ("HOW MANY SETS DO YOU NEED?"). Save-magnet lane.
   - **Tier lists / rankings** — "X RANKED S TO F". Comment-bait: people argue
     with rankings.
   - **Sound-fake counterintuitive tips** — "X TIPS THAT SOUND FAKE".
   - **Micro myth two-sliders** — `micro_build.py` format, cheapest to produce.
   - **Archetype / relatable humor** — "5 X YOU SEE AT EVERY GYM" style.
   - **Series episodes** — recurring named franchises (see Series below).
3. For each idea give: cover lines, accent line, lane, and the GainFrame
   screenshot that would close it. Get approval on the list, not per-post.

### Phase 1 — Author `posts.json`

Append one object per post to `posts.json["posts"]`:

```jsonc
{
  "slug": "does-the-sauna-do-anything",
  "cover_lines": [["DOES THE SAUNA", "black"], ["DO ANYTHING?", "red"]],
  "cover_scene": "…mascot scene, no text…",
  "tips": [{ "headline": "…", "accent": "…", "sub1": "…", "sub2": "…", "scene": "…" }],
  "plug": { "screenshot": "…", "h1": "…", "h2": "…", "screen_name": "…" },
  "caption": "…",
  "hashtags": "#gymtok #… (exactly 5)"
}
```

Copy rules (match existing entries exactly):
- ALL CAPS, **no apostrophes** (`CANT`, `ISNT`, `WILL NOT`), US spelling.
- `accent` must be a verbatim substring of `headline` or it won't colour.
- Headlines ≤ ~30 chars so the compositor keeps them full-size.
- Cover = 2 lines: one black, one red knockout; knockout line ≤ ~15 chars.
- 6 slides per carousel: cover + 4 tips + plug. **Every post gets a plug**
  (since 2026-08-01); vary the screenshot across a batch so the profile grid
  doesn't repeat.
- Captions: ONE short casual line, lowercase fine, like a real TikTok caption
  ("the ones who know, know 💀") — never marketing copy. For tier lists and
  myth-busts, make the caption pick-a-side bait ("wrong answers only" /
  "defend your ranking in the comments").

Scene-writing rules (each has caused production failures):
- **Never write a scene where a prop reaches the head.** No drinking, no
  phone-to-ear, no barbell overhead near the face — the head has no mouth and
  props pull it apart.
- **State what the hands hold even when the answer is nothing**, or the model
  invents a prop.
- Pin prop height and side: "floating beside him at waist height, entirely to
  his right".

### Phase 2 — Build & QA

1. Run `build.py --post <slug>` per post (or `--all`).
2. The head QA gate auto-retries drifted heads; if a slide keeps failing,
   rewrite the scene (usually a prop-near-head problem), don't weaken the gate.
3. Eyeball every slide: head is four floating brackets, background pure white,
   text uncropped, red knockout on the cover only.
4. Covers must survive the grid crop (title + feet inside the centre square) —
   the compositor enforces this; if art breaches it, re-roll.

### Phase 3 — Publish plumbing (all mandatory)

1. `content.md` in the post dir: caption + hashtags only.
2. Append the batch to `docs/assets/tiktok/comic/POST_LOG.md`.
3. Add each post to the top of `COMICS_MANIFEST` in
   `web/lib/comics-manifest.mjs` (`ext: "webp"`). Never edit the generated
   `docs/.../comics-manifest.js` directly.
4. Generate SEO transcripts (after webp prebuild):
   ```bash
   cd web && npm run prebuild && node scripts/generate-comics-transcripts.mjs
   ```
5. Commit manifest + transcripts + asset folders together.
6. On the Mac, sync drafts to the phone:
   ```bash
   cp docs/assets/tiktok/comic/$SLUG/slide-*.png \
      "$HOME/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG/"
   ```

## Series (recurring franchises)

Prefer batch themes that can become named, repeatable series — recognisable
episode N+1 formats make people follow rather than just save:
- **GYM TERMS YOU PRETEND TO KNOW** — one term per episode (RPE, PPL, DOMS…).
- **RANKED S TO F** — one category per episode.
- **WHAT ACTUALLY BUILDS X** — the micro two-slider series, one muscle each.
- **THE SIMPLE VERSION** — one intimidating topic per episode compressed to
  4 rules.

Keep series cover layouts identical episode-to-episode (same line split, same
knockout position) so the profile grid reads as a set.

## Cadence

A 10-post batch ≈ one session of authoring + ~$3 of image credits. Two
batches a month sustains daily posting. When asked to "pump out comics",
default to a full 10-post batch in one themed lane, not one-off posts.

## File naming (mandatory)

`slide-0-cover.png`, `slide-1.png` … hyphens only, never underscores. The
gallery manifest, transcript OCR, and iCloud sync all depend on this pattern.
