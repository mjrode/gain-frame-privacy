#!/bin/bash
# ─────────────────────────────────────────────────────────
#  GainFrame UTM Link Generator
#  Usage: ./generate-utm-link.sh
# ─────────────────────────────────────────────────────────

BASE_URL="https://gainframe.app"

echo ""
echo "🔗  GainFrame UTM Link Generator"
echo "─────────────────────────────────"
echo ""

# --- Page ---
echo "Page (default: homepage)"
echo "  1) Homepage"
echo "  2) Blog"
echo ""
read -p "Choose [1]: " page_choice
case "$page_choice" in
  2) PAGE="/blog.html" ;;
  *) PAGE="" ;;
esac

echo ""

# --- Source ---
echo "Source — where are you posting this link?"
echo "  Examples: reddit, instagram, tiktok, twitter, youtube, facebook, email, friend"
echo ""
read -p "utm_source: " SOURCE

if [ -z "$SOURCE" ]; then
  echo "❌  Source is required."
  exit 1
fi

echo ""

# --- Medium ---
echo "Medium — how is traffic arriving?"
echo "  Examples: organic, social, paid, email, referral"
echo ""
read -p "utm_medium: " MEDIUM

if [ -z "$MEDIUM" ]; then
  echo "❌  Medium is required."
  exit 1
fi

echo ""

# --- Campaign ---
echo "Campaign — what is this effort called?"
echo "  Examples: launch, hevy_post, feb_promo, bio_link, reddit_ama"
echo ""
read -p "utm_campaign: " CAMPAIGN

if [ -z "$CAMPAIGN" ]; then
  echo "❌  Campaign is required."
  exit 1
fi

# --- Build URL ---
FULL_URL="${BASE_URL}${PAGE}?utm_source=${SOURCE}&utm_medium=${MEDIUM}&utm_campaign=${CAMPAIGN}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋  Raw Link (paste anywhere):"
echo ""
echo "  $FULL_URL"
echo ""
echo "📝  Markdown Link:"
echo ""
echo "  [GainFrame](${FULL_URL})"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# --- Copy to clipboard (macOS) ---
echo -n "$FULL_URL" | pbcopy
echo "✅  Raw link copied to clipboard!"
echo ""
