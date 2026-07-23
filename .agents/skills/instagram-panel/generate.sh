#!/usr/bin/env bash
# instagram-panel — GainFrame Guy panel-slide generator (both formats).
# Uses the Gemini image API (same engine as /tiktok) with the mascot reference
# images so GainFrame Guy stays on-model across panels.
#
# Usage:  GEMINI_API_KEY=... bash generate.sh <output.png> <prompt.txt>
#
# The prompt file holds the full slide prompt (see SKILL.md templates). The
# three reference images below are always attached so the bracket-frame head,
# black body, and olive shorts render consistently.
set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(git -C "$SKILL_DIR" rev-parse --show-toplevel 2>/dev/null)"
[ -z "$PROJECT_ROOT" ] && PROJECT_ROOT="$(cd "$SKILL_DIR/../../.." && pwd)"

MODEL="${GEMINI_MODEL:-gemini-3.1-flash-image-preview}"
ILLUS="$PROJECT_ROOT/docs/assets/gainframe-guy/illustrations"
REF1="$ILLUS/gf-mascot-template.jpeg"   # character design (neutral build)
REF2="$ILLUS/mascot-pictures.jpeg"      # muscular build ref (lean/hero panels)
REF3="$ILLUS/gary-badge.png"            # head fidelity

[ -z "${GEMINI_API_KEY:-}" ] && { echo "❌ GEMINI_API_KEY not set (source it from your env)"; exit 1; }
OUT="${1:?usage: generate.sh <output.png> <prompt.txt>}"
PROMPT_FILE="${2:?usage: generate.sh <output.png> <prompt.txt>}"
for f in "$REF1" "$REF2" "$REF3" "$PROMPT_FILE"; do [ -f "$f" ] || { echo "❌ missing: $f"; exit 1; }; done
mkdir -p "$(dirname "$OUT")"

base64 < "$REF1" | tr -d '\n' > /tmp/r1.b64
base64 < "$REF2" | tr -d '\n' > /tmp/r2.b64
base64 < "$REF3" | tr -d '\n' > /tmp/r3.b64
jq -n --rawfile prompt "$PROMPT_FILE" \
      --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 --rawfile r3 /tmp/r3.b64 \
      --arg m1 image/jpeg --arg m2 image/jpeg --arg m3 image/png \
      '{contents:[{parts:[
         {inlineData:{mimeType:$m1,data:$r1}},
         {inlineData:{mimeType:$m2,data:$r2}},
         {inlineData:{mimeType:$m3,data:$r3}},
         {text:$prompt}
       ]}],generationConfig:{responseModalities:["IMAGE","TEXT"]}}' > /tmp/req.json
rm -f /tmp/r1.b64 /tmp/r2.b64 /tmp/r3.b64

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" -d @/tmp/req.json > /tmp/resp.json
if jq -e '.error' /tmp/resp.json >/dev/null 2>&1; then echo "❌ API error:"; jq -c '.error' /tmp/resp.json; exit 1; fi
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/resp.json > /tmp/img.b64
[ -s /tmp/img.b64 ] || { echo "❌ no image returned"; head -c 300 /tmp/resp.json; echo; exit 1; }
base64 --decode < /tmp/img.b64 > "$OUT"
rm -f /tmp/req.json /tmp/resp.json /tmp/img.b64
echo "✅ $OUT"
