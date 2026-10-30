# A1 homepage asset provenance

Prepared October 29, 2026 for the approved round 6 homepage implementation. These are production encodings of the approved mockup assets, not new screenshots or new illustrations. No assets have been published by this preparation step.

## Sources

The approved mockup is `gain-frame/output/homepage-redesign-2026-10-29/round-6/index.html` in the adjacent GainFrame application checkout. All source paths below are relative to `gain-frame/output/homepage-redesign-2026-10-29/`.

- App screenshots and Gary: `round-5/assets/`.
- Guide images and founder photo: `round-2/assets/`.
- Approved logo: `assets/logo.png`.
- Gary generation prompts and provenance: `round-5/assets/gary-prompts.md`.

The original screenshot selection came from the user-provided `gain-frame/oct-29th-gainframe-screenshots/` folder. The selected mockup files remain unchanged. No cropping, retouching, recoloring, UI replacement, or text changes were applied to the production assets. Existing screenshot colors were preserved.

## Asset inventory

Assets are served from `/assets/homepage-a1/`. Exact source and output hashes, byte counts, alpha-channel flags, and transforms are recorded in [`manifest.json`](../public/assets/homepage-a1/manifest.json).

| Filename | Dimensions | Bytes | Source |
| --- | --- | ---: | --- |
| compare.webp | 800 × 1734 | 84,658 | round-5/assets/compare.png |
| photo-library.webp | 800 × 1734 | 91,288 | round-5/assets/photo-library.png |
| deep-dive.webp | 800 × 1734 | 112,466 | round-5/assets/deep-dive.png |
| coach.webp | 800 × 1734 | 73,636 | round-5/assets/coach.png |
| nutrition.webp | 800 × 1734 | 72,988 | round-5/assets/nutrition.png |
| precision.webp | 800 × 1734 | 67,798 | round-5/assets/precision.png |
| future-you.webp | 800 × 1734 | 79,912 | round-5/assets/future-you.png |
| rewind.webp | 800 × 1734 | 82,014 | round-5/assets/rewind.png |
| leaderboard.webp | 800 × 1734 | 86,056 | round-5/assets/leaderboard.png |
| gary-progress.webp | 400 × 449 | 26,986 | round-5/assets/gary-progress.png |
| gary-coach.webp | 400 × 486 | 26,678 | round-5/assets/gary-coach.png |
| guide-photos.webp | 640 × 640 | 10,956 | round-2/assets/guide-photos.webp |
| guide-progress.webp | 640 × 640 | 25,366 | round-2/assets/guide-progress.webp |
| guide-phase.webp | 800 × 597 | 24,254 | round-2/assets/guide-phase.webp |
| michael-rode.webp | 388 × 388 | 40,790 | round-2/assets/michael-rode.webp |
| logo.webp | 192 × 191 | 2,590 | assets/logo.png |

All 16 images total **908,436 bytes (887 KiB)**, down from **26,886,505 bytes (25.6 MiB)**: a **96.6% reduction**. The three hero screenshots (Compare, Deep Dive, Coach) total 270,760 bytes (264 KiB). Totals exclude the small manifest and the separate QR component.

## Encoding and presentation

Sharp encoded the screenshots at WebP quality 88, effort 6, smart subsampling, and a maximum width of 800 pixels, preserving their aspect ratio. The approved screenshots were 1290 × 2796. One 800-pixel variant provides ample detail for the approximately 242-pixel phone presentations without requiring a runtime image optimizer for the static export.

Gary illustrations use the same quality setting, a maximum width of 400 pixels, and alpha quality 100; both retain transparency. The logo retains transparency and its original aspect ratio. The existing 640-pixel guide images and founder photo were copied byte for byte. The larger guide-phase image was resized to 800 pixels wide.

Use the dimensions in the manifest for image width/height attributes to reserve layout space. Prioritize the lead hero image and lazy-load below-the-fold images. Repeated references to the same asset URL can share the browser cache. Assets already contain the app UI; do not overlay replacement labels within the screenshot.

Compare, Deep Dive, Coach, and the transparent Coach Gary were visually inspected after encoding. All output dimensions, byte counts, hashes, and alpha flags were checked against the manifest.

## Reviews and QR evidence

The approved mockup's review evidence is `round-6/evidence/reviews-evidence.json`, with presentation notes in `round-6/evidence/review-copy.md`. That evidence was recorded on October 29, 2026 (retrieval at 2026-10-30 03:33 UTC). It records a US App Store rating of 4.9 from 71 ratings and two public review excerpts. This asset preparation did not refresh those figures. Preserve the original excerpt spelling and public reviewer handles; the count is a rating count, not a written-review count.

Official sources recorded in the evidence:

- [Apple app lookup](https://itunes.apple.com/lookup?id=6759252082&country=us)
- [Apple public review feed](https://itunes.apple.com/us/rss/customerreviews/id=6759252082/sortBy=mostRecent/json)
- [GainFrame App Store listing](https://apps.apple.com/us/app/gainframe-gym-progress-photos/id6759252082)

The mockup QR validation is recorded separately in `round-6/evidence/qr-validation.json`. No QR bitmap was copied into this asset folder because the site already provides a download QR component. Keep its destination aligned with the App Store download link used by the page.
