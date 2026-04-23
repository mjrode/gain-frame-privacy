#!/bin/bash
# ==============================================================
#  GainFrame — App Store Screenshot Exporter
#  Uses headless Chrome to render each slot at 1290×2796
#  and save as /assets/app-store-screenshots/slot-N.png
# ==============================================================

set -e

# --- Config ---
OUTPUT_DIR="$(cd "$(dirname "$0")/../.." && pwd)/assets/app-store-screenshots"
SERVER_PORT="${SERVER_PORT:-8092}"
BASE_URL="http://localhost:${SERVER_PORT}/preview/app-screenshots"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Allow overriding with CHROME_BIN env var
if [ -n "$CHROME_BIN" ]; then CHROME="$CHROME_BIN"; fi

if [ ! -x "$CHROME" ]; then
  echo "❌ Chrome not found at: $CHROME"
  echo "   Set CHROME_BIN to your Chrome binary path."
  exit 1
fi

# Quick health check on server
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" | grep -q "200"; then
  echo "❌ Dev server not running on port $SERVER_PORT."
  echo "   Start it with: python3 -m http.server $SERVER_PORT"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "→ Exporting 10 slots to: $OUTPUT_DIR"
echo

for SLOT in 1 2 3 4 5 6 7 8 9 10; do
  OUT="$OUTPUT_DIR/slot-$(printf '%02d' $SLOT).png"
  URL="$BASE_URL/raw.html?slot=$SLOT"

  echo "  [$SLOT/10] → slot-$(printf '%02d' $SLOT).png"

  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --no-sandbox \
    --window-size=1290,2796 \
    --force-device-scale-factor=1 \
    --virtual-time-budget=5000 \
    --screenshot="$OUT" \
    "$URL" 2>/dev/null

  if command -v sips >/dev/null 2>&1; then
    DIMS=$(sips -g pixelHeight -g pixelWidth "$OUT" 2>/dev/null | awk '/pixel/ {print $2}' | tr '\n' 'x')
    echo "     ↳ $DIMS"
  fi
done

echo
echo "✅ Done. Open $OUTPUT_DIR to review."
