#!/bin/bash
# gen-banner.sh <output-path> <screenshot-path> <prompt-file>
set -e
[ -n "$GEMINI_API_KEY" ] || { echo "GEMINI_API_KEY not set"; exit 1; }

OUTPUT_PATH="$1"
SCREENSHOT="$2"
PROMPT_FILE="$3"
AR="${4:-16:9}"

MASCOT_TEMPLATE="/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/gf-mascot-template.jpeg"
POSE_REF="/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations/mascot-pictures.jpeg"
STYLE_REF="/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/tiktok/promo/download-variants-2026-07-16/variant-1-stop-guessing.png"
MODEL="gemini-3.1-flash-image-preview"

base64 -i "$MASCOT_TEMPLATE" | tr -d '\n' > /tmp/r1.b64
base64 -i "$SCREENSHOT"      | tr -d '\n' > /tmp/r2.b64
base64 -i "$POSE_REF"        | tr -d '\n' > /tmp/r3.b64
base64 -i "$STYLE_REF"       | tr -d '\n' > /tmp/r4.b64

jq -n \
  --arg ar "$AR" \
  --rawfile prompt "$PROMPT_FILE" \
  --rawfile r1 /tmp/r1.b64 --rawfile r2 /tmp/r2.b64 \
  --rawfile r3 /tmp/r3.b64 --rawfile r4 /tmp/r4.b64 \
  '{contents:[{parts:[
    {inlineData:{mimeType:"image/jpeg",data:$r1}},
    {inlineData:{mimeType:"image/png",data:$r2}},
    {inlineData:{mimeType:"image/jpeg",data:$r3}},
    {inlineData:{mimeType:"image/png",data:$r4}},
    {text:$prompt}
  ]}],generationConfig:{responseModalities:["IMAGE","TEXT"],imageConfig:{aspectRatio:$ar}}}' > /tmp/gemini-req.json

rm -f /tmp/r1.b64 /tmp/r2.b64 /tmp/r3.b64 /tmp/r4.b64

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @/tmp/gemini-req.json > /tmp/gemini-resp.json

if jq -e '.error' /tmp/gemini-resp.json > /dev/null 2>&1; then
  echo "API ERROR:"; jq '.error' /tmp/gemini-resp.json; exit 1
fi

jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
  /tmp/gemini-resp.json > /tmp/gemini-img.b64

if [ ! -s /tmp/gemini-img.b64 ]; then
  echo "NO IMAGE IN RESPONSE:"; cat /tmp/gemini-resp.json; exit 1
fi

base64 --decode -i /tmp/gemini-img.b64 -o "$OUTPUT_PATH"
rm -f /tmp/gemini-req.json /tmp/gemini-resp.json /tmp/gemini-img.b64
echo "OK: $OUTPUT_PATH ($(stat -f%z "$OUTPUT_PATH") bytes)"
