#!/usr/bin/env bash
# GainFrame "LIVE NOW" — phone-hero concept (iteration on #6), 7 variations.
# Compare icon = big + small stick figure; Streaks swapped for Future Me / Deep Dive.
# Reads GEMINI_API_KEY from env. Usage: GEMINI_API_KEY=... bash generate_phone.sh [1-7|all]
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
CRITICAL CHARACTER DESIGN (copy EXACTLY from the reference images): the head is NOT a solid square — it is four separate rounded corner brackets floating in space with the background visible between them; the bottom-right bracket is RED, the other three black; two googly eyes and an S-curve nose float inside the bracket frame with NO background fill. Solid black/charcoal body, olive/army-green shorts, chunky gray-brown sneakers. Thick clean outlines, flat colors. Exactly one head, one torso, two arms, two legs — no duplicate limbs.

FLOATING FEATURE CARDS: six rounded-square app-feature cards float in an arc around the upper area (they must NOT cover the mascot's head or the title), each tilted slightly with a soft drop shadow. Five of the cards are fixed:
1. "Body Fat %" — a circular score gauge / dial icon
2. "Progress Photos" — a camera icon
3. "AI Coach" — a chat speech-bubble icon
4. "Muscle Map" — a front-facing body silhouette with highlighted muscle zones
5. "Compare" — TWO simple black stick figures side by side: one LARGE stick figure next to one clearly SMALLER stick figure, showing a body size/transformation comparison
The SIXTH card is specified in the variation line below.
Card labels in clean bold sans-serif, short and correctly spelled.

BOTTOM: the standard black "Download on the App Store" badge, centered; keep the lower-right corner relatively clean.

TYPOGRAPHY: bold Impact/Bebas-style condensed sans-serif for the title; clean Helvetica-style sans-serif for card labels. No handwritten or decorative fonts. All text crisp and correctly spelled.
PROMPT

FUTURE_ME='SIXTH CARD: "Future Me" — a forward-facing body silhouette with a glowing sparkle/star and a small forward arrow, suggesting a predicted FUTURE physique.'
DEEP_DIVE='SIXTH CARD: "Deep Dive" — a magnifying glass over a small body silhouette and a tiny analytics chart, suggesting detailed analysis.'

# 7 variations: 6th card + background
S1="$FUTURE_ME"$'\n''BACKGROUND: soft mint-to-white gradient with light radial rays glowing outward from the phone. Cards crisp white with a small colored icon. Bright, modern, friendly.'
S2="$DEEP_DIVE"$'\n''BACKGROUND: soft mint-to-white gradient with gentle radial rays from the phone. Cards crisp white with a small colored icon. Bright and clean.'
S3="$FUTURE_ME"$'\n''BACKGROUND: warm cream radial gradient (peach-to-cream, brightest behind the mascot) with a light scatter of small gold sparkle accents. Cards glossy and dimensional (3D app-icon look) in richer colors. Warm premium launch mood.'
S4="$DEEP_DIVE"$'\n''BACKGROUND: smooth sage-green gradient (GainFrame green #34d26f), brightest behind the mascot, with a few delicate white sparkles. Cards frosted-white glass tiles with green icons and soft long shadows.'
S5="$FUTURE_ME"$'\n''BACKGROUND: flat clean off-white (#F5F0EB) with one very soft light-gray glow behind the phone. Cards crisp white with a thin light-gray border, monochrome line icon, and a tiny red (#E53935) accent dot. Apple-clean, editorial.'
S6="$FUTURE_ME"$'\n''BACKGROUND: premium DARK MODE — deep charcoal-black (#0E0F12) with a radial glow of GainFrame green (#34d26f) behind the phone and faint floating particles; the phone screen glows. Title "GainFrame" in WHITE, "LIVE NOW" glowing green; the mascot keeps its exact design with a soft green rim-light so it stays visible. Cards are dark glassy tiles with neon-green glowing icons. Sleek, futuristic.'
S7="$DEEP_DIVE"$'\n''BACKGROUND: energetic light burst — bright off-white center with subtle radiating rays and a few sparkle glints, conveying excitement and momentum. Cards crisp white with bold colored icons. Dynamic, high-energy launch feel.'

gen () {
  local n="$1" suffix="$2" out="$SCRIPT_DIR/phone-$1.png"
  echo "→ phone-$n …"
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
  if jq -e '.error' /tmp/resp.json >/dev/null 2>&1; then echo "❌ API error (phone-$n):"; jq -c '.error' /tmp/resp.json; return 1; fi
  jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/resp.json > /tmp/img.b64
  [ -s /tmp/img.b64 ] || { echo "❌ no image (phone-$n)"; head -c 300 /tmp/resp.json; echo; return 1; }
  base64 --decode < /tmp/img.b64 > "$out"
  rm -f /tmp/req.json /tmp/resp.json /tmp/img.b64
  echo "✅ $out"
}

case "${1:-all}" in
  1) gen 1 "$S1";; 2) gen 2 "$S2";; 3) gen 3 "$S3";; 4) gen 4 "$S4";;
  5) gen 5 "$S5";; 6) gen 6 "$S6";; 7) gen 7 "$S7";;
  all) gen 1 "$S1"; gen 2 "$S2"; gen 3 "$S3"; gen 4 "$S4"; gen 5 "$S5"; gen 6 "$S6"; gen 7 "$S7";;
  *) echo "usage: bash generate_phone.sh [1-7|all]"; exit 1;;
esac
