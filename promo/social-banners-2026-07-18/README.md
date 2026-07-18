# Social promo banners — 2026-07-18

Mascot + real v2.13 app screenshot + tagline, generated with the tiktok-skill Gemini pipeline
(gemini-3.1-flash-image-preview, refs: gf-mascot-template + screenshot + mascot-pictures pose + variant-1 style).

## Concepts

| File stem | Headline | Screenshot (promo/2.13) |
|---|---|---|
| 1-future-you | SEE YOURSELF IN **6 MONTHS** | AI Future Physique (Screenshot 7.26.50) |
| 2-score-pr | **AI SCORES** YOUR PHYSIQUE | IMG_4093 (GF Score PR 74) |
| 3-body-fat-proof | **-9% BODY FAT,** ON RECORD | IMG_4092 (body-fat trophy) |
| 4-muscle-map | SEE WHICH **MUSCLES GREW** | IMG_4095 (Body Map) |
| 5-camera-roll | YOUR CAMERA ROLL IS FULL OF **PROGRESS** | IMG_4113 (Backstory import) |

## Sizes

- `banner-*.png` — 16:9 masters (1392×768). Use as post/link-card images (X posts, FB link posts, Reddit image posts).
- `header-*.png` — 21:9 masters (1584×672). Source for the platform exports below.
- `x-header/` — 1500×500, X profile header.
- `facebook-cover/` — 820×312, Facebook page cover.
- `reddit-banner/` — 1920×384, Reddit community banner.

Platform exports are white-padded from the 21:9 masters (pure-white bg, so padding is invisible).
Regeneration script + prompts: `_pipeline/` (`gen-banner.sh <out.png> <screenshot> <prompt.txt> [aspect]`, needs `GEMINI_API_KEY` exported).
