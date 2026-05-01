#!/bin/zsh
set -e

source ~/.zshrc >/dev/null 2>&1 || true
source ~/.zprofile >/dev/null 2>&1 || true
source ~/.profile >/dev/null 2>&1 || true

if [[ -z "$OPENAI_API_KEY" ]]; then
  echo "OPENAI_API_KEY is not set. Add it to ~/.zprofile or ~/.zshrc, then rerun."
  exit 1
fi

ROOT="/Users/michael.rode/code/project/gain-frame-privacy"
DIR="$ROOT/assets/tiktok/comic/stop-program-hopping"
PROMPTS="$DIR/prompts.md"

generate_slide() {
  local start="$1"
  local stop="$2"
  local out="$3"
  shift 3
  local refs=("$@")
  local prompt_file="/tmp/stop-program-hopping-${out:t:r}-prompt.txt"
  local resp="/tmp/stop-program-hopping-${out:t:r}-resp.json"

  awk -v start="$start" -v stop="$stop" '
    $0 ~ start { flag=1; next }
    $0 ~ stop { flag=0 }
    flag && $0 !~ /^```/ { print }
  ' "$PROMPTS" > "$prompt_file"

  local args=(
    -sS
    -X POST "https://api.openai.com/v1/images/edits"
    -H "Authorization: Bearer $OPENAI_API_KEY"
    -F "model=gpt-image-2"
    -F "size=1024x1280"
    -F "quality=medium"
    -F "output_format=png"
  )

  for ref in "${refs[@]}"; do
    args+=(-F "image[]=@$ref")
  done

  args+=(-F "prompt=<$prompt_file")

  echo "Generating ${out:t}..."
  curl "${args[@]}" > "$resp"

  if jq -e ".error" "$resp" >/dev/null 2>&1; then
    jq ".error" "$resp"
    exit 1
  fi

  jq -r ".data[0].b64_json // empty" "$resp" | base64 --decode > "$out"
  file "$out"
}

mkdir -p "$DIR"

generate_slide "## Cover Prompt" "## Slide 1 Prompt" "$DIR/slide-0-cover.png" \
  "$ROOT/assets/gf-mascot/gf-mascot-template.jpeg" \
  "$ROOT/assets/tiktok/comic/discipline-not-motivation/slide-0-cover.png" \
  "$ROOT/assets/gf-mascot/gary-badge.png"

generate_slide "## Slide 1 Prompt" "## Slide 2 Prompt" "$DIR/slide-1.png" \
  "$ROOT/assets/gf-mascot/gf-mascot-template.jpeg" \
  "$ROOT/assets/tiktok/comic/discipline-not-motivation/slide-1.png"

generate_slide "## Slide 2 Prompt" "## Slide 3 Prompt" "$DIR/slide-2.png" \
  "$ROOT/assets/gf-mascot/gf-mascot-template.jpeg" \
  "$ROOT/assets/tiktok/comic/discipline-not-motivation/slide-1.png"

generate_slide "## Slide 3 Prompt" "## Slide 4 Prompt" "$DIR/slide-3.png" \
  "$ROOT/assets/gf-mascot/gf-mascot-template.jpeg" \
  "$ROOT/assets/tiktok/comic/discipline-not-motivation/slide-1.png"

generate_slide "## Slide 4 Prompt" "## Slide 5 Prompt" "$DIR/slide-4.png" \
  "$ROOT/assets/gf-mascot/gf-mascot-template.jpeg" \
  "$ROOT/assets/tiktok/comic/discipline-not-motivation/slide-1.png"

generate_slide "## Slide 5 Prompt" "## Caption" "$DIR/slide-5.png" \
  "$ROOT/assets/gf-mascot/gf-mascot-template.jpeg" \
  "$ROOT/assets/tiktok/comic/discipline-not-motivation/slide-1.png"

echo "Done. Review slides in $DIR"
