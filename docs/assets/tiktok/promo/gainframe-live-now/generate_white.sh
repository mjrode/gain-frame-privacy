#!/usr/bin/env bash
# Phone-hero promo on a CLEAN WHITE background (variation on phone-2).
# Compare = big + small stick figure; 6th card = Deep Dive. 3 variations.
# Reads GEMINI_API_KEY from env. Usage: GEMINI_API_KEY=... bash generate_white.sh [1-3|all]
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)"
[ -z "$PROJECT_ROOT" ] && PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"

MODEL="${GEMINI_MODEL:-gemini-3.1-flash-image-preview}"
ILLUS="$PROJECT_ROOT/docs/assets/gainframe-guy/illustrations"
REF1="$ILLUS/gf-mascot-template.jpeg"
REF2="$ILLUS/gary-badge.png"
REF3="$ILLUS/mascot-pictures.jpeg"
[ -z "${GEMINI_API_KEY:-}" ] && { echo "❌ GEMINI_API_KEY not set"; exit 1; }

read -r -d '' BASE <<'PROMPT'
A polished app-launch promo graphic, clean modern cartoon style, portrait 4:5 (1080x1350).

TOP (top 18%): a bold black wordmark "GainFrame", centered. Below it two stacked centered lines: "LIVE NOW" in bright red (#E53935) and "ON THE APP STORE!" in near-black (#1A1A1A) — ALL CAPS, condensed Impact/Bebas-style sans-serif.

CENTER — "STEP OUT OF THE PHONE" concept: a large smartphone stands upright slightly left of center, its screen facing forward showing the GainFrame app — a body-composition dashboard with a circular GainFrame Score, a small radar/muscle chart, and a before/after thumbnail (clean, readable iOS UI). The GainFrame Guy mascot is stepping OUT of the phone screen — one foot and one arm break past the phone's frame into 3D space — giving an energetic thumbs-up. Playful "the app comes to life" feel.
CRITICAL CHARACTER DESIGN (copy EXACTLY from the reference images): the head is NOT a solid square — it is four separate rounded corner brackets floating in space with the background visible between them; the bottom-right bracket is RED, the other three black; two googly eyes and an S-curve nose float inside the bracket frame with NO background fill. Solid black/charcoal body, olive/army-green shorts, chunky gray-brown sneakers. Thick clean outlines, flat colors. Exactly one head, one torso, two arms, two legs.

FLOATING FEATURE CARDS — render EXACTLY SIX cards, no more and no fewer, each a DIFFERENT feature with a DIFFERENT label. Do NOT add any extra cards, do NOT duplicate any card, do NOT invent any other labels. They float in an arc around the upper area (never covering the mascot's head or the title), each tilted slightly with a soft drop shadow. The six cards are exactly:
1. "Body Fat %" — a circular score gauge / dial icon
2. "Progress Photos" — a camera icon
3. "AI Coach" — a chat speech-bubble icon
4. "Muscle Map" — a front-facing body silhouette with highlighted muscle zones
5. "Compare" — TWO simple black stick figures side by side: one LARGE stick figure next to one clearly SMALLER stick figure (body size/transformation comparison)
6. "Deep Dive" — a magnifying glass over a small body silhouette and a tiny analytics chart (detailed analysis)
Card labels in clean bold sans-serif, short and correctly spelled.

BOTTOM: the standard black "Download on the App Store" badge, centered.

BACKGROUND: pure clean bright WHITE (#FFFFFF) — flat, no gradient, no tint, no cream, not off-white. Pure white throughout.

TYPOGRAPHY: bold Impact/Bebas-style condensed sans-serif for the title; clean Helvetica-style sans-serif for card labels. No handwritten or decorative fonts. All text crisp and correctly spelled.
PROMPT

S1='CARD STYLE: crisp white cards with a thin light-gray (#E4E7EB) 1px border and a small colored icon — minimal, premium, Apple-clean. Even spacing, generous margins.'
S2='CARD STYLE: clean white cards with a soft, subtle drop shadow (no border) and bold colorful icons — friendly and modern, cards appear to float on the white.'
S3='CARD STYLE: clean white cards with a small colored top-corner accent dot and a flat two-tone icon — tidy, editorial, lots of white space.'

gen () {
  local n="$1" suffix="$2" out="$SCRIPT_DIR/white-$1.png"
  echo "→ white-$n …"
  printf '%s\n\n%s\n' "$BASE" "$suffix" > /tmp/p.txt
  base64 < "$REF1" | tr -d '\n' > /tmp/r1.b64
  base64 < "$REF2" | tr -d '\n' > /tmp/r2.b64
  base64 < "$REF3" | tr -d '\n' > /tmp/r3.b64
  jq -n --rawfile prompt /tmp/p.txt \
        --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 --rawfile r3 /tmp/r3.b64 \
        --arg m1 image/jpeg --arg m2 image/png --arg m3 image/jpeg \
        '{contents:[{parts:[
           {inlineData:{mimeType:$m1,data:$r1}},
           {inlineData:{mimeType:$m2,data:$r2}},
           {inlineData:{mimeType:$m3,data:$r3}},
           {text:$prompt}
         ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/req.json
  rm -f /tmp/p.txt /tmp/r1.b64 /tmp/r2.b64 /tmp/r3.b64
  curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
    -H "Content-Type: application/json" -d @/tmp/req.json > /tmp/resp.json
  if jq -e '.error' /tmp/resp.json >/dev/null 2>&1; then echo "❌ API error (white-$n):"; jq -c '.error' /tmp/resp.json; return 1; fi
  jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/resp.json > /tmp/img.b64
  [ -s /tmp/img.b64 ] || { echo "❌ no image (white-$n)"; head -c 300 /tmp/resp.json; echo; return 1; }
  base64 --decode < /tmp/img.b64 > "$out"
  rm -f /tmp/req.json /tmp/resp.json /tmp/img.b64
  echo "✅ $out"
}

case "${1:-all}" in
  1) gen 1 "$S1";; 2) gen 2 "$S2";; 3) gen 3 "$S3";;
  all) gen 1 "$S1"; gen 2 "$S2"; gen 3 "$S3";;
  *) echo "usage: bash generate_white.sh [1-3|all]"; exit 1;;
esac
