#!/usr/bin/env bash
# GainFrame "LIVE NOW" launch promo — 3 iterations.
# Engine: Gemini image API (same pipeline as the /tiktok skill).
# Reads GEMINI_API_KEY from the environment (never hard-code it here).
#
# Usage:  GEMINI_API_KEY=... bash generate.sh [1|2|3]   # omit arg = all three
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)"
[ -z "$PROJECT_ROOT" ] && PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
OUT_DIR="$SCRIPT_DIR"

MODEL="${GEMINI_MODEL:-gemini-3.1-flash-image-preview}"
ILLUS="$PROJECT_ROOT/docs/assets/gainframe-guy/illustrations"
REF1="$ILLUS/gf-mascot-template.jpeg"   # character design
REF2="$ILLUS/gary-badge.png"            # bracket-head logo / wordmark
REF3="$ILLUS/mascot-pictures.jpeg"      # pose / proportion reference

if [ -z "${GEMINI_API_KEY:-}" ]; then echo "❌ GEMINI_API_KEY not set"; exit 1; fi
for f in "$REF1" "$REF2" "$REF3"; do [ -f "$f" ] || { echo "❌ missing ref: $f"; exit 1; }; done

# ---- shared layout prompt -------------------------------------------------
read -r -d '' BASE <<'PROMPT'
A polished app-launch promo graphic in a clean modern cartoon style. Portrait 4:5 (1080x1350).

TOP (top 18%): A bold wordmark reading "GainFrame" in heavy black sans-serif, centered. Directly below it, two stacked centered lines: "LIVE NOW" in bold bright red (#E53935), then "ON THE APP STORE!" in bold near-black (#1A1A1A) — both ALL CAPS, condensed Impact/Bebas-style sans-serif.

CENTER: The GainFrame Guy mascot, large and centered, facing forward, friendly and welcoming — giving a clear thumbs-up with one hand, the other arm open in a welcoming gesture.
CRITICAL CHARACTER DESIGN (copy EXACTLY from the reference images): the head is NOT a solid square — it is four separate rounded corner brackets floating in space with the background visible between them; the bottom-right bracket is RED, the other three are black; two googly eyes and an S-curve nose float inside the bracket frame with NO background fill behind them. The body is a solid black/charcoal cartoon figure wearing olive/army-green shorts and chunky gray-brown sneakers. Thick clean outlines, flat colors. EXACTLY one head, one torso, two arms, two legs, two hands — no duplicate limbs.

FLOATING FEATURE CARDS: six rounded-square "app feature" cards float around the mascot — three down the LEFT side, three down the RIGHT side — each tilted slightly with a soft drop shadow so they appear to hover. Each card has one simple bold icon and a short label. The six cards are exactly:
1. "Body Fat %" — a circular score gauge / dial icon
2. "Progress Photos" — a camera icon
3. "AI Coach" — a chat speech-bubble icon
4. "Muscle Map" — a front-facing body silhouette with highlighted muscle zones
5. "Compare" — a before/after split-rectangle icon
6. "Streaks" — a calendar with a small flame icon
Labels in clean bold sans-serif, dark, short and legible. Spell every label exactly as written.

BOTTOM (bottom 12%): the standard black "Download on the App Store" badge (Apple logo + "Download on the App Store" text), centered.

TYPOGRAPHY: bold Impact/Bebas-style condensed sans-serif for the title lines; clean Helvetica-style sans-serif for card labels. NO handwritten, script, or decorative fonts. All text crisp and correctly spelled.

COMPOSITION: the title is fully clear of the mascot; cards never overlap the mascot's head or the title; nothing clipped at the edges; balanced and symmetrical with a premium app-launch feel.
PROMPT

# ---- per-iteration suffixes ----------------------------------------------
SUFFIX_1='BACKGROUND: flat clean off-white (#F5F0EB), no gradient. Feature cards in muted on-brand tones (charcoal, olive-green, soft red) with subtle shadows and a flat, minimal finish. Mascot standing tall with a confident thumbs-up. Calm, premium, brand-clean.'

SUFFIX_2='BACKGROUND: warm cream radial gradient (soft peach-to-cream, brightest in the center behind the mascot) with a light scatter of small gold sparkle accents and faint motion glints near the feet — the warm, glossy mood of a premium app launch. Feature cards are glossy and dimensional (3D-style rounded app-icon look) in richer colors (orange, green, red, purple, blue). Mascot in an energetic, welcoming pose with arms slightly open and a big thumbs-up.'

SUFFIX_3='BACKGROUND: soft sage-green radial gradient (GainFrame green #34d26f, light and airy, brightest behind the mascot) with a few subtle sparkle accents. Feature cards accented in GainFrame green (#34d26f) and white with clean soft shadows. Mascot in a dynamic, upbeat thumbs-up pose. Fresh, energetic, on-brand.'

# Iteration 4 — refined clean (elevation of #1)
SUFFIX_4='BACKGROUND: flat clean off-white (#F5F0EB) with one very soft, barely-there light-gray radial glow behind the mascot for gentle depth. Feature cards are crisp white with a thin 1px light-gray border, a small monochrome line icon, and a tiny red (#E53935) accent dot — minimal, premium, Apple-clean. Even spacing, generous margins. Mascot standing tall with a confident thumbs-up. Editorial, high-end, uncluttered.'

# Iteration 5 — refined sage with glossy depth (elevation of #3)
SUFFIX_5='BACKGROUND: smooth sage-green gradient (GainFrame green #34d26f) deepening slightly toward the corners, brightest behind the mascot, with a few delicate white sparkle accents. Feature cards are glossy frosted-white with soft long shadows and a green (#34d26f) icon — they read as polished glass app tiles floating in front of the green. Mascot in an upbeat thumbs-up pose. Cohesive, vibrant, premium.'

# Iteration 6 — VERY ORIGINAL: giant-phone hero (leave a clean lower-RIGHT area for a QR code)
SUFFIX_6='ORIGINAL CONCEPT — "step out of the phone". BACKGROUND: a soft mint-to-white gradient with light radial rays glowing outward from a large smartphone. CENTER COMPOSITION: a large smartphone stands upright slightly left-of-center, screen facing forward showing the GainFrame app — a body-composition dashboard with a circular GainFrame Score, a small radar/muscle chart and a before/after thumbnail (clean iOS UI, readable). The GainFrame Guy mascot is stepping OUT of the phone screen, one foot and arm breaking past the phone frame into 3D space, giving an energetic thumbs-up — playful "the app comes to life" feel. The six feature cards float in an arc around the upper area only. IMPORTANT: keep the LOWER-RIGHT corner area clean and uncluttered (empty background) so a QR code can be placed there. App Store badge sits bottom-center-left. Dynamic, modern, surprising.'

# Iteration 7 — VERY ORIGINAL: dark neon mode
SUFFIX_7='ORIGINAL CONCEPT — premium DARK MODE. BACKGROUND: deep charcoal-black (#0E0F12) with a subtle radial glow of GainFrame green (#34d26f) behind the mascot and faint floating particles. The title "GainFrame" is bold WHITE; "LIVE NOW" glows in bright GainFrame green (#34d26f); "ON THE APP STORE!" in light gray. The mascot keeps its exact design (black body reads against the dark bg via a soft green rim-light outline so it stays visible; bracket head with red bottom-right corner and googly eyes intact). Feature cards are dark glassy tiles with neon-green glowing icons and labels, soft outer glow, like a high-end gaming/tech launch. App Store badge bottom-center. Sleek, futuristic, striking — a total contrast to the light versions.'

# Iteration 8 — clean QR-forward layout (leave a clean lower area for a "Scan to download" QR)
SUFFIX_8='BACKGROUND: flat clean off-white (#F5F0EB). Feature cards in muted on-brand tones with subtle shadows. Mascot centered with a confident thumbs-up. CRITICAL LAYOUT: shift the whole mascot + cards composition slightly UP so the BOTTOM 22% of the image is clean empty off-white background with NO cards, NO badge, NO text in the bottom-right — reserve that clean bottom strip for a "Scan to download" QR code and the App Store badge to be added afterward. Do NOT draw an App Store badge in this version. Tidy, balanced, lots of clean space at the bottom.'

gen () {
  local n="$1" suffix="$2" out="$OUT_DIR/iteration-$1.png"
  echo "→ Iteration $n …"
  printf '%s\n\n%s\n' "$BASE" "$suffix" > /tmp/prompt.txt
  base64 < "$REF1" | tr -d '\n' > /tmp/r1.b64
  base64 < "$REF2" | tr -d '\n' > /tmp/r2.b64
  base64 < "$REF3" | tr -d '\n' > /tmp/r3.b64

  jq -n --rawfile prompt /tmp/prompt.txt \
        --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 --rawfile r3 /tmp/r3.b64 \
        --arg m1 image/jpeg --arg m2 image/png --arg m3 image/jpeg \
        '{contents:[{parts:[
           {inlineData:{mimeType:$m1,data:$r1}},
           {inlineData:{mimeType:$m2,data:$r2}},
           {inlineData:{mimeType:$m3,data:$r3}},
           {text:$prompt}
         ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/req.json
  rm -f /tmp/prompt.txt /tmp/r1.b64 /tmp/r2.b64 /tmp/r3.b64

  curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
    -H "Content-Type: application/json" -d @/tmp/req.json > /tmp/resp.json

  if jq -e '.error' /tmp/resp.json > /dev/null 2>&1; then
    echo "❌ API error (iteration $n):"; jq -c '.error' /tmp/resp.json; return 1
  fi
  jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/resp.json > /tmp/img.b64
  if [ ! -s /tmp/img.b64 ]; then echo "❌ No image returned (iteration $n):"; head -c 400 /tmp/resp.json; echo; return 1; fi
  base64 --decode < /tmp/img.b64 > "$out"
  command -v cwebp >/dev/null 2>&1 && cwebp -q 90 "$out" -o "${out%.png}.webp" >/dev/null 2>&1
  rm -f /tmp/req.json /tmp/resp.json /tmp/img.b64
  echo "✅ $out ($(stat -c%s "$out" 2>/dev/null || stat -f%z "$out") bytes)"
}

case "${1:-all}" in
  1) gen 1 "$SUFFIX_1" ;;
  2) gen 2 "$SUFFIX_2" ;;
  3) gen 3 "$SUFFIX_3" ;;
  4) gen 4 "$SUFFIX_4" ;;
  5) gen 5 "$SUFFIX_5" ;;
  6) gen 6 "$SUFFIX_6" ;;
  7) gen 7 "$SUFFIX_7" ;;
  8) gen 8 "$SUFFIX_8" ;;
  new) gen 4 "$SUFFIX_4"; gen 5 "$SUFFIX_5"; gen 6 "$SUFFIX_6"; gen 7 "$SUFFIX_7"; gen 8 "$SUFFIX_8" ;;
  all) gen 1 "$SUFFIX_1"; gen 2 "$SUFFIX_2"; gen 3 "$SUFFIX_3"; gen 4 "$SUFFIX_4"; gen 5 "$SUFFIX_5"; gen 6 "$SUFFIX_6"; gen 7 "$SUFFIX_7"; gen 8 "$SUFFIX_8" ;;
  *) echo "usage: bash generate.sh [1-8|new|all]"; exit 1 ;;
esac
