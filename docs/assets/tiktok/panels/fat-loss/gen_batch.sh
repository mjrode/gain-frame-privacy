#!/usr/bin/env bash
# Generate the FAT LOSS carousel — slides 2-8 (tiered) + slide 9 (Download CTA).
# Writes prompt files then calls the instagram-panel skill generator.
# Usage: GEMINI_API_KEY=... bash gen_batch.sh
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git -C "$DIR" rev-parse --show-toplevel)"
GEN="$ROOT/.agent/skills/instagram-panel/generate.sh"
mkdir -p "$DIR/prompts"

CHAR='CRITICAL — GAINFRAME GUY CHARACTER (copy EXACTLY from the reference images; get this right):
- The HEAD is ONLY a "scan frame" logo: four separate rounded corner brackets floating in empty space. Three brackets are black; the BOTTOM-RIGHT bracket is RED. Inside the frame float just TWO simple googly eyes and one small "S"-curve nose. That is the ENTIRE head.
- There is NO human head, NO human face, NO skull, NO hair, NO ears, and NO neck anywhere. Do NOT draw a person'\''s head behind or inside the brackets. The space inside and behind the brackets is plain white background — nothing is behind them.
- The bracket-frame head floats directly above the shoulders with a small gap; the body never connects to a human head.
- BODY: a solid, FLAT, matte BLACK/charcoal cartoon silhouette (a shadow-figure look) with thick clean outlines and flat colors — NOT realistic skin, NOT anatomical muscle rendering. Wearing olive/army-green shorts.'

# Build a tiered-slide prompt: $1=counter $2..$4=labels $5..$7=props
tiered () {
  cat <<EOF
A single Instagram carousel graphic, portrait 4:5 (1080x1350), clean FLAT cartoon illustration on a PURE WHITE (#FFFFFF) background. THREE stacked equal horizontal panels separated by thin WHITE gutters, white margin around the image.

TOP STRIP (slim white bar): bold BLACK condensed sans-serif (Impact/Anton), ALL CAPS, left-aligned title "FAT LOSS". Top-right: a small gray rounded pill with white text reads "$1".

$CHAR

The SAME GainFrame Guy appears in all three panels, on the LEFT of each, with category props on the RIGHT. Build + mood improve top→bottom; head and flat-silhouette style stay identical. WHITE-FORWARD: tier shown by a VERY LIGHT pastel panel wash + a colored banner only.

PANEL 1 (top) — very light PASTEL RED/pink wash on white. GainFrame Guy OVERWEIGHT and soft with a round belly, slouching, frowning. To his right: $5. Bottom-center: glossy RED rounded pill banner, bold white text: "$2".

PANEL 2 (middle) — very light PASTEL ORANGE/peach wash on white. GainFrame Guy AVERAGE build, neutral calm expression. To his right: $6. Bottom-center: glossy ORANGE rounded pill banner, bold white text: "$3".

PANEL 3 (bottom) — very light PASTEL GREEN/mint wash on white. GainFrame Guy LEAN and MUSCULAR (flat silhouette, V-taper), tall, confident, happy. To his right: $7. Bottom-center: glossy GREEN rounded pill banner, bold white text: "$4".

TYPOGRAPHY: bold condensed sans-serif for the title; bold rounded white sans-serif for banners. All text crisp and spelled EXACTLY as written. Clean, bright, premium, white-forward. No watermarks or brand logos except the character'\''s own bracket-frame head.
EOF
}

declare -A P
gen_slide () { # $1=N $2=prompt
  local f="$DIR/prompts/slide-$1.txt"; printf '%s\n' "$2" > "$f"
  GEMINI_API_KEY="$GEMINI_API_KEY" bash "$GEN" "$DIR/slide-$1.png" "$f"
}

gen_slide 2 "$(tiered '2/9' 'Training 0x per Week' 'Training 1-2x per Week' 'Training 3-4x per Week' \
  'a couch with a TV remote' 'a single dumbbell' 'a squat rack, a rack of dumbbells and a weight bench')"
gen_slide 3 "$(tiered '3/9' 'Under 80g Protein a Day' '100-120g Protein a Day' '150g+ Protein a Day' \
  'a bag of potato chips, a loaf of white bread and cookies' 'a grilled chicken breast, two eggs and a tub of greek yogurt' 'a grilled salmon fillet, a black whey-protein shaker and a bowl of cottage cheese')"
gen_slide 4 "$(tiered '4/9' '5 Hours a Night' '6-7 Hours a Night' '8 Hours + Consistent Routine' \
  'an alarm clock reading 5:00 and a phone glowing with a social app' 'an alarm clock next to a neatly made bed' 'an alarm clock and a crescent moon in a calm night sky')"
gen_slide 5 "$(tiered '5/9' 'Not Tracking Food' 'Guesstimating' 'Tracking & Weighing' \
  'a big spread of fast food — burger, fries, pizza, soda' 'a plate of grilled chicken and rice' 'a phone showing a calorie/macro tracking app next to a digital food scale with a meal on it')"
gen_slide 6 "$(tiered '6/9' 'Under 3,000 Steps a Day' '5,000-7,000 Steps a Day' '10,000 Steps Every Day' \
  'a phone screen showing a step counter reading 1,200 steps' 'a phone screen showing a step counter reading 6,000 steps' 'a smartwatch on a wrist showing 10,247 steps')"
gen_slide 7 "$(tiered '7/9' 'Under 1 Litre a Day' '1.5-2 Litres a Day' '3 Litres Every Day' \
  'a sugary iced coffee drink with whipped cream' 'a standard clear water bottle' 'a large 3-litre water gallon jug')"
gen_slide 8 "$(tiered '8/9' 'HIIT 1x per Week' 'Moderate Cardio 3x per Week' '10,000 Steps Every Day' \
  'a treadmill with a display reading HIIT, character out of breath' 'a treadmill with a display reading MODERATE CARDIO' 'a green park path with a city skyline in the distance')"

# ---- Slide 9: GainFrame Download CTA (not tiered) ----
cat > "$DIR/prompts/slide-9.txt" <<EOF
A single Instagram carousel graphic, portrait 4:5 (1080x1350), clean FLAT cartoon illustration on a PURE WHITE (#FFFFFF) background — matching the FAT LOSS carousel style.

TOP: bold BLACK condensed sans-serif (Impact/Anton) title, centered, two lines: "TRACK YOUR" / "FAT LOSS" with "FAT LOSS" in bright red (#E53935). Top-right: a small gray rounded pill with white text reads "9/9".

$CHAR

CENTER: the LEAN, MUSCULAR, happy GainFrame Guy stands on the right giving a big thumbs-up, next to a large smartphone (tilted slightly) on the left showing the GainFrame app — a body-composition dashboard with a circular GainFrame Score, a small muscle/radar chart, and a before/after progress photo thumbnail (clean readable iOS UI). Keep everything on clean white.

LOWER: bold black headline "DOWNLOAD GAINFRAME" centered, and directly below it the standard black "Download on the App Store" badge (Apple logo + text), centered.

TYPOGRAPHY: bold condensed sans-serif for the title/headline; crisp, correctly spelled. Clean, bright, premium, white-forward. No QR code. No watermarks except the character'\''s own bracket-frame head.
EOF
GEMINI_API_KEY="$GEMINI_API_KEY" bash "$GEN" "$DIR/slide-9.png" "$DIR/prompts/slide-9.txt"

echo "== done: slides 2-9 =="
