---
name: Cast as Gym Types TikTok
description: Generate a TikTok carousel mapping TV show or movie characters to gym archetypes. Pass in a show (Euphoria, The Office, Stranger Things, Marvel, etc.) and produce a 6-slide carousel with the GainFrame Guy mascot costumed as each character. Format-specific extension of claude-tiktok with parody framing and stricter character-consistency rules.
triggers:
  - "cast at the gym"
  - "cast as gym types"
  - "characters at the gym"
  - "show at the gym"
  - "movie at the gym"
  - "cast archetype tiktok"
  - "[show] at the gym"
---

# Cast as Gym Types TikTok

## Overview

Parody carousel format that maps a TV show / movie / video game cast to gym archetypes (Bench Hog, Crying Cardio Bunny, etc.). Built on top of `claude-tiktok` (Gemini API + curl image gen). The workflow output is a 6-slide carousel: cover lineup of all characters + 5 solo numbered slides.

**Why a separate skill:** parody cast posts have unique constraints — visual character recognition through costume only (mascot has bracket head, no real face), high risk of Gemini drawing multiple characters per solo slide, and the cover must serve as the costume reference for every numbered slide.

## Required input

The user must specify a source (show, movie, anime, video game, book). Examples:
- "Euphoria at the gym"
- "Stranger Things kids as gym types"
- "The Office cast at the gym"
- "Marvel heroes at the gym"

If the user just says "make a cast-as-gym-types post" without a source, ask which show/movie before continuing.

## Read first

Before starting, read the canonical claude-tiktok skill and the mascot style guide:

```
view_file .agent/skills/claude-tiktok/SKILL.md
view_file docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md
```

The base image-generation function, prompt templates, file naming, manifest update, and iCloud sync from `claude-tiktok` apply here unchanged. This skill only diverges in **Phase 0 (cast selection)**, **Phase 1 (cover title format)**, **Phase 2 (slide structure)**, and **Phase 3 prompt overrides** for character consistency.

---

## Phase 0: Cast & Archetype Mapping

1. **Identify 5 visually iconic characters** from the source. Pick characters with strong visual signatures that translate through costume alone — the mascot has no face, only a bracket-frame head. Good signatures:
   - Distinct hair color + style (long curly, blonde with bow, buzz cut, etc.)
   - Signature outfit (letterman jacket, hoodie, glam set)
   - Accessories (gold chain, glittery makeup, big hoops)
   - Body language / pose

2. **Map each character to a gym archetype.** Use this archetype menu:

   | Archetype | Gym Personality |
   |-----------|----------------|
   | The Pre-Workout Demon | Hood up, glazed, mumbling on a treadmill |
   | The Bench Hog | Parked on the only flat bench scrolling phone |
   | The Gym-Fluencer | Ring light + tripod, twelve-take edits for one curl |
   | The Crying Cardio Bunny | Mascara streaks down the StairMaster |
   | The Wholesome Spotter | Beanie/tank, gentle giant, spots strangers unprompted |
   | The Tiny Terrifying Deadlifter | Smallest in the gym, pulling 4 plates |
   | The Naked Locker Room Guy | Dries hair fully nude (skip — not for brand) |
   | The Phone-Glued Influencer Hopeful | Films every set, posts none |
   | The Gym Sage / Old Timer | Knows everyone, dispenses unsolicited wisdom |
   | The Form Cop (Wrong) | Corrects strangers' form (poorly) |
   | The Cardio Bro | Treadmill sprints in jeans for some reason |
   | The Equipment Hog | Super-sets 5 machines, towel-claims them all |
   | The Headphones-In Wallflower | Hides in the back, eyes down, never makes contact |
   | The Pre-Workout Spiral | Took two scoops, vibrating, drinking from gallon jug |

3. **Confirm with the user** in a table format:

   | Character | Gym Archetype | Costume / Scene Cue |
   |-----------|---------------|---------------------|
   | [Name] | THE [TYPE] | [Distinct visual cues] |

   Iterate until the user approves. Allow swaps and additions. Aim for comedic spread across personality types (chaotic / alpha / glam / dramatic / wholesome works well).

4. **GainFrame plug:** Skip it. Cast-parody carousels are pure-vibes posts — a "track gains with GainFrame" slide kills the punchline. Default to **no plug** for this format.

5. **Trademark/tone check:** Flag to the user when a character's defining trait is sensitive (e.g., addiction, mental health, body image). Confirm they're cool with leaning into the joke before proceeding.

---

## Phase 1: Cover Title

Default format: **"[SOURCE] AT THE GYM"** stacked into 2–3 lines with the last word in red.

Examples:
- EUPHORIA / AT THE / **GYM**
- THE OFFICE / AT THE / **GYM**
- STRANGER THINGS / AT THE / **GYM**

Alternatives to offer:
- WHICH **[SOURCE]** / CHARACTER / ARE YOU AT THE GYM?
- [SOURCE] CAST / AS **GYM PEOPLE**

Follow the standard cover title rules from `claude-tiktok` Phase 1 (max 8 words, 2-3 lines, grid-safe crop).

---

## Phase 2: Slide Structure

The signature joke pattern for this format:
- **Banner title = the gym archetype** (e.g., "THE BENCH HOG")
- **Subtitle = the character reveal + the joke**, ending with the character name as the punchline

This delivers a "wait — that's [character]!" beat as the reader's eye drops from banner to subtitle.

Example slide draft table:

| # | Banner Title | Subtitle | Scene |
|---|--------------|----------|-------|
| 1 | THE PRE-WORKOUT DEMON | Hood up, glazed, mumbling through a treadmill walk. Pure Rue. | Oversized maroon hoodie, hood up, curly hair flowing out, slouched on treadmill, vape on console |
| 2 | THE BENCH HOG | Parked on the only flat bench, daring you to ask. Full Nate. | Letterman jacket, manspread on bench, scrolling phone, loaded barbell unused |
| ... | ... | ... | ... |

---

## Phase 3: Image Generation — Critical Overrides

Use the standard `claude-tiktok` image generation bash function. Two important overrides:

### Override 1: Cover lineup with explicit per-character costumes

The cover shows **all 5 characters side-by-side** in a single horizontal lineup. Each character needs distinct visual identifiers spelled out in the prompt — don't rely on the AI to "know" what a character looks like.

**Cover prompt structure:**

```
A cartoon illustration in 4:5 TikTok format showing a horizontal lineup of FIVE GainFrame Guy characters, each in a distinct costume.

🚨 ABSOLUTE CRITICAL RULE — APPLIES TO ALL FIVE CHARACTERS:
Every character has the GainFrame Guy bracket-frame head from the first reference image: four black corner brackets (with a small red bracket accent in the bottom-right) floating in space with the white background visible between them. Inside the brackets are TWO ROUND BLACK GOOGLY EYES (simple black dots — NOT human eyes, NOT eyelashes, NOT eyebrows) and an S-curve nose. NO human face. NO realistic mouth or eyebrows.

Hair, hats, accessories, makeup must be drawn OUTSIDE the bracket frame (behind, beside, or around the brackets). Glitter accents around the OUTSIDE corners of the brackets are fine but the googly eyes inside stay as simple black dots.

CRITICAL ANATOMY: Each character has EXACTLY ONE torso, EXACTLY TWO arms, EXACTLY TWO legs.

In the top-left corner, draw the small branding badge from the third reference image: a tiny bracket-frame head icon next to bold sans-serif text reading "GAINFRAME GUY". About 10% of image width.

THE FIVE CHARACTERS (left to right):

1. [CHARACTER NAME]: bracket-frame head with [eye expression]. [Hair description — color, length, style]. [Outfit description — colors, type]. [Accessories — earrings, chains, makeup]. [Pose / body language].

2. [CHARACTER NAME]: ...

[repeat for all 5]

CRITICAL DIFFERENTIATION: [explicit list of how each character differs from the others — e.g., "Maddy = DARK hair, DARK PURPLE outfit. Cassie = BLONDE hair with PINK BOW, PINK outfit. They MUST look distinctly different."]

CRITICAL PLACEMENT: All five characters fit within the BOTTOM 55% of the image, evenly spaced left-to-right.

TITLE TEXT (TOP 40%): [follow claude-tiktok cover title spec — bare text on white, bold Impact ALL CAPS, accent word in red]

Background: pure clean WHITE (#FFFFFF), flat. Clean cartoon style, thick black outlines, flat colors. 4:5 TikTok format (1080x1350). No watermarks except the GainFrame Guy badge.
```

**Cover ImagePaths (3 refs — same as claude-tiktok cover):**
```
REF1 = $MASCOT_TEMPLATE
REF2 = $COVER_STYLE_REF (discipline-not-motivation/slide-0-cover.png)
REF3 = $BADGE
```

### Override 2: Numbered slides USE THE COVER as a 3rd reference for costume

This is the critical trick: numbered slides MUST reference the cover slide as `REF3` so Gemini sees the established costume and copies it. Without this, Gemini reverts to the default mascot template (olive shorts, black tank) and ignores the costume description.

**Numbered slide ImagePaths (3 refs — different from base claude-tiktok 2-ref pattern):**
```
REF1 = $MASCOT_TEMPLATE
REF2 = $BANNER_STYLE_REF (discipline-not-motivation/slide-1.png)
REF3 = $OUT_DIR/slide-0-cover.png  ← THE COVER SLIDE YOU JUST GENERATED
```

**Numbered slide prompt structure:**

```
A cartoon illustration in PORTRAIT 4:5 TikTok format (1080x1350 — TALLER than wide, NOT landscape).

🚨 OUTPUT FORMAT: portrait 4:5 aspect ratio. NOT 16:9. NOT landscape. NOT square.

🚨 LAYOUT — match the SECOND reference image exactly:
- TOP 13%: solid BLACK rectangular bar, FULL WIDTH edge-to-edge, square corners. Inside: "#[N]" in bold Impact ALL CAPS in bright RED (#E53935), then "[SLIDE TITLE]" in bold WHITE Impact ALL CAPS, both vertically centered.
- BELOW the bar: center-aligned subtitle in clean Helvetica-style sans-serif, dark charcoal: "[SUBTITLE]"
- BOTTOM 70%: the character + scene.

🚨 NO BADGE on this slide. NO "GAINFRAME GUY" badge. NO extra title text. The big cover title MUST NOT appear in this image.

🚨 ABSOLUTELY ONLY ONE CHARACTER IN THE SCENE. Do NOT draw any other character from the cover. Do NOT draw [explicitly name the OTHER characters to exclude — e.g., "any blonde character", "any character with a pink bow"]. ONLY [CHARACTER NAME] ALONE.

CHARACTER: [CHARACTER NAME] from the third reference image (the cover slide — [position description, e.g., "rightmost character"]). Match the costume EXACTLY:
- Bracket-frame head: four black corner brackets with red accent in bottom-right, simple round black googly eye dots inside, S-curve nose. NO human face.
- [Repeat all costume details from the cover prompt for this character]
- EXACTLY TWO arms, EXACTLY TWO legs

SCENE: [Specific gym scene with props — treadmill, bench press, ring light, StairMaster, etc.]

CRITICAL: Do NOT use the standard template mascot body. The character MUST be in [costume] exactly matching the third reference image.

Background: pure clean WHITE (#FFFFFF), flat. Clean cartoon style, thick black outlines, flat colors. PORTRAIT 4:5 TikTok format (1080x1350). No watermarks. NO badge.
```

### Generation order — strictly sequential

1. **Cover first.** Show user. Iterate until approved (this is the costume bible for everything else).
2. **Slides 1–5 in order**, each using the approved cover as REF3.
3. After each slide, show the user. Watch for these failure modes:
   - **Multiple characters in a solo slide** → regen with stronger "ONLY ONE CHARACTER" + explicit "do NOT draw [other characters by description]" enforcement.
   - **AI defaults to template body (olive shorts)** → regen with stronger "do NOT use the standard template mascot body" + repeat the costume description.
   - **Landscape format hallucination** (especially common on later slides) → start the prompt with "PORTRAIT 4:5 — TALLER than wide, NOT landscape."
   - **Human face replaces bracket head** → strengthen the bracket-head-must-be-visible rule and confirm hair flows OUTSIDE the brackets.
   - **Gemini renders the cover title on a numbered slide** → explicitly forbid "the big cover title MUST NOT appear in this image."

### Update the base function for 3-ref numbered slides

The `claude-tiktok` core image generation function defaults to 2 refs for numbered slides. For this skill, use the 3-ref branch (the same one used for standard covers) — set `REF3="$OUT_DIR/slide-0-cover.png"` and `REF3_MIME="image/png"` for every numbered slide.

---

## Phase 4: Caption & Hashtags

Caption pattern that works for parody cast posts:

```
Which one are you at the gym? 👀

Tag the friend who's full [Most Recognizable Character] [doing their thing]. The [Other Character] [archetype]? We see you. [Wholesome Character] forever 🙏

Save this for the next time you spot one in the wild 💪

#gymtok #fitness #[show-name-tag] #[show-fan-tag] #gymhumor #gympersonalities #fitcheck #gymtypes #foryou #gainframe
```

Show-specific hashtag examples:
- Euphoria → `#euphoria #euphoriatheory`
- The Office → `#theoffice #dundermifflin`
- Stranger Things → `#strangerthings #hawkinsindiana`

Save to `docs/assets/tiktok/comic/[slug]/content.md` — caption + hashtags only, no metadata.

---

## Phase 5: Manifest, Post Log, iCloud Sync

Same as `claude-tiktok` Phase 4 + Phase 5 (no overrides):

1. Add to top of `COMICS_MANIFEST` in `docs/assets/tiktok/comic/comics-manifest.js`
2. Prepend entry to `docs/assets/tiktok/comic/POST_LOG.md`
3. Copy slides + content.md to `~/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/[slug]/`

---

## Slug Convention

Use `[show-name]-at-the-gym` for the standard format, e.g.:
- `euphoria-at-the-gym`
- `the-office-at-the-gym`
- `stranger-things-at-the-gym`

For non-gym variants (if extending to other settings later):
- `euphoria-at-starbucks`
- `marvel-as-roommates`

---

## Reference Output

The first carousel produced with this workflow: `docs/assets/tiktok/comic/euphoria-at-the-gym/` — use as a visual quality baseline for all future cast posts. Cover lineup, solo character slides with costume continuity, banner style, subtitle pattern, and caption tone are all dialed in there.

---

## Rules

- **Never skip cover approval before generating numbered slides.** The cover is the costume bible — if it's wrong, every numbered slide will be wrong.
- **3 references for numbered slides, not 2.** Always include the cover as REF3 for costume continuity.
- **"ONLY ONE CHARACTER" must appear 2–3x in solo slide prompts.** Gemini will pull multiple characters from the cover otherwise.
- **Explicitly exclude other characters by description** in solo slide prompts (e.g., "do NOT draw any blonde character", "do NOT draw any character in a letterman jacket").
- **PORTRAIT 4:5** must be the FIRST line of every numbered slide prompt — landscape hallucinations creep in on later slides.
- **No GainFrame plug** by default for parody posts — pure-vibes content lands harder.
- **Bracket-frame head on every character** — explicitly forbid human faces, even when adding hair, makeup, hats.
- **Hair flows OUTSIDE the brackets** — never inside, never replacing the eyes.
- **All characters have exactly 2 arms and 2 legs** (per global brand memory).
- **White background (#FFFFFF) only** (per global brand memory).
- **Show user every image before continuing** — character consistency requires sequential review.
