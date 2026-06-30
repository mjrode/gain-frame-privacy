# GainFrame "LIVE NOW" launch promo

App-launch hero graphic (WeSolve+ style): GainFrame Guy centered, six floating
feature cards, "LIVE NOW / ON THE APP STORE!" title, App Store badge. 4:5.

## Files
- `iteration-1.png` — on-brand clean (flat off-white #F5F0EB)
- `iteration-2.png` — WeSolve warm (cream gradient + sparkles, glossy 3D cards)
- `iteration-3.png` — sage energy (GainFrame-green gradient, white cards)
- `iteration-4.png` — refined clean (Apple-clean white cards, red accent dots)
- `iteration-5.png` — refined sage (frosted-glass tiles, sparkles)
- `iteration-6.png` — ORIGINAL: mascot stepping out of the phone (real app UI)
- `iteration-7.png` — ORIGINAL: dark neon mode (charcoal + glowing green)
- `iteration-8.png` — clean layout with a reserved bottom strip (no badge) for a QR
- `iteration-6-qr.png` — #6 with a scannable App Store QR (bottom-right) + badge
- `iteration-8-qr.png` — #8 with a large centered "SCAN TO DOWNLOAD" QR
- `generate.sh` — image regenerator (Gemini pipeline; reads `GEMINI_API_KEY` from env)
- `add_qr.py` — composites a real, scannable QR (App Store link) onto chosen images
- `content.md` — launch caption + hashtags

QR codes are generated with the `qrcode` library (high error correction) and
verified to decode to the App Store URL — not AI-drawn. Re-run with `python3 add_qr.py`.

## Regenerate / tweak
```bash
GEMINI_API_KEY=... bash generate.sh        # all three
GEMINI_API_KEY=... bash generate.sh 2      # just iteration 2
```
Edit the `SUFFIX_*` blocks in `generate.sh` to adjust background / pose / cards.

## Sync to phone (run on your Mac, where iCloud lives)
```bash
SLUG="gainframe-live-now"
DEST="$HOME/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/$SLUG"
mkdir -p "$DEST"
cp docs/assets/tiktok/promo/$SLUG/iteration-*.png "$DEST/"
cp docs/assets/tiktok/promo/$SLUG/content.md "$DEST/"
```
Then: Files app → iCloud Drive → TikTok-Drafts → gainframe-live-now.
