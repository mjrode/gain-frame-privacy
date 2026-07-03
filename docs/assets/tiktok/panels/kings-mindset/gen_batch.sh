#!/usr/bin/env bash
# Kings-Mindset escalation carousel — slides 2-3 (escalation) + slide 4 (Download CTA).
# Slide 1 (pull-ups) already exists. Usage: GEMINI_API_KEY=... bash gen_batch.sh
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git -C "$DIR" rev-parse --show-toplevel)"
GEN="$ROOT/.agent/skills/instagram-panel/generate.sh"
mkdir -p "$DIR/prompts"

CHAR='CRITICAL — GAINFRAME GUY CHARACTER (copy EXACTLY from the reference images; get this right):
- The HEAD is ONLY a "scan frame" logo: four separate rounded corner brackets floating in empty space. Three brackets are black; the BOTTOM-RIGHT bracket is RED. Inside the frame float just TWO simple googly eyes and one small "S"-curve nose. That is the ENTIRE head.
- There is NO human head, NO human face, NO skull, NO hair, NO ears, and NO neck anywhere. Do NOT draw a person'\''s head behind or inside the brackets. The space inside and behind the brackets is plain white background — nothing is behind them.
- The bracket-frame head floats directly above the shoulders with a small gap; the body never connects to a human head.
- BODY: a solid, FLAT, matte BLACK/charcoal cartoon silhouette (a shadow-figure look) with thick clean outlines and flat colors — NOT realistic skin, NOT anatomical muscle rendering. Muscular/athletic build, wearing black training shorts.'

kings () { # $1=counter $2=scene $3=top-text $4=bottom-text
  cat <<EOF
A single Instagram carousel graphic, portrait 4:5 (1080x1350), clean FLAT cartoon illustration on a PURE WHITE (#FFFFFF) background. TWO stacked equal horizontal panels (separated by a thin light-gray divider) showing the SAME scene with escalating text.

$CHAR

BOTH PANELS: $2. The same pose in both panels. Keep the background PURE WHITE and clean — only light-gray equipment and a faint light-gray GainFrame bracket-frame logo watermark; NO gym photo, NO dark scene.

PANEL 1 (top): large bold BLACK text (#1A1A1A) centered, reads "$3" — render the number in red (#E53935).
PANEL 2 (bottom): the same pose; large bold BLACK centered text reads "$4" — render the number in red (#E53935).

Top-right corner: a small gray rounded pill with white text reads "$1".

TYPOGRAPHY: bold clean condensed sans-serif; black with red accent numbers. All text crisp and spelled EXACTLY as written. Clean, bright, premium, white-forward. No watermarks except the character'\''s bracket-frame head and the faint gray wall logo.
EOF
}

gen () { local n="$1" p="$2"; printf '%s\n' "$p" > "$DIR/prompts/slide-$n.txt"; GEMINI_API_KEY="$GEMINI_API_KEY" bash "$GEN" "$DIR/slide-$n.png" "$DIR/prompts/slide-$n.txt"; }

gen 2 "$(kings '2/4' 'GainFrame Guy doing PUSH-UPS on a clean white floor — in a strong push-up plank position, arms bent, back flat, athletic flat-black-silhouette body in black training shorts' '100 Push Ups a Day' 'Is 36,500 Push Ups a Year')"
gen 3 "$(kings '3/4' 'GainFrame Guy JOGGING in place — mid-stride running pose, arms pumping, athletic flat-black-silhouette body in black training shorts, a faint light-gray road line under the feet' '30 Min Cardio a Day' 'Is 182 Hours a Year')"

# Slide 4 — GainFrame Download CTA (single scene, clean white, no QR)
cat > "$DIR/prompts/slide-4.txt" <<EOF
A single Instagram carousel graphic, portrait 4:5 (1080x1350), clean FLAT cartoon illustration on a PURE WHITE (#FFFFFF) background.

TOP: bold BLACK condensed sans-serif (Impact/Anton), centered, two lines: "SMALL HABITS," / "BIG RESULTS" with "BIG RESULTS" in bright red (#E53935). Top-right: a small gray rounded pill with white text reads "4/4".

$CHAR

CENTER: the muscular, confident GainFrame Guy stands on the right giving a big thumbs-up, next to a large smartphone (tilted slightly) on the left showing the GainFrame app — a body-composition dashboard with a circular GainFrame Score, a small muscle/radar chart, and a before/after progress-photo thumbnail (clean readable iOS UI). Everything on clean white.

LOWER: bold black headline "DOWNLOAD GAINFRAME" centered, and directly below it the standard black "Download on the App Store" badge (Apple logo + text), centered.

TYPOGRAPHY: bold condensed sans-serif; crisp, correctly spelled. Clean, bright, white-forward. No QR code. No watermarks except the character'\''s own bracket-frame head.
EOF
GEMINI_API_KEY="$GEMINI_API_KEY" bash "$GEN" "$DIR/slide-4.png" "$DIR/prompts/slide-4.txt"

echo "== done: kings slides 2-4 =="
