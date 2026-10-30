# Vendored website fonts

The website uses `next/font/local` and the WOFF2 files in this directory. Normal
builds do not download fonts or contact Google Fonts. The existing Anton font on
the archived `/landing-v2/` route was already local and is unchanged.

These are the same font versions used by the previous Google Fonts integration.
The original full font files come from the official
[Google Fonts repository](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc),
pinned to commit `6157dfaa640ca5738b4d1a7070fe389c3036d7fc`.
Each family includes its original SIL Open Font License 1.1. The manifest records
the exact source URL, source and output SHA-256 hashes, version, glyph count,
character coverage, variable axes, and conversion tool versions.

| Family | Website weights | Styles |
| --- | --- | --- |
| DM Sans | 400, 500, 600, 700 | Normal |
| Outfit | 400, 500, 600, 700, 800, 900 | Normal |
| Playfair Display | 400, 700, 900 | Normal, italic |
| UnifrakturCook | 700 | Normal |
| Geist | 400, 500, 600, 700, 800 | Normal |
| Geist Mono | 400, 500, 600 | Normal |
| Plus Jakarta Sans | 400, 500, 600, 700, 800 | Normal, italic |
| Barlow Condensed | 600, 700, 800 | Normal |
| Manrope | 400, 500, 600, 700, 800 | Normal |
| Cormorant Garamond | 500, 600 | Normal |

The WOFF2 conversion retains all source glyphs; fonts are not subsetted. Existing
route-specific loading, weight/style selections, `display: "swap"`, and the
`--studio-*`, `--ppc-*`, and `--bmc-*` variables are preserved. Explicit
`font-family` declarations keep existing CSS references such as `"DM Sans"` and
`"Outfit"` working. Next still emits content-addressed assets and preload links.

Next 16.2.4's default Turbopack build retains the JavaScript declaration name in
generated font classes and variables even when the font-face declaration uses a
custom family name. Each local font therefore lists its actual family first in
`fallback` and sets `adjustFontFallback: false`. The browser skips the undefined
JavaScript name and finds the real local face before the generic fallback. This
also works with Webpack, which puts the real family first. Disabling adjusted
fallback is intentional: an emitted synthetic fallback would otherwise be found
before the real family and incorrectly render the system font.

## Reproducing or updating the assets

Font conversion is a maintenance step, not a build step. In a temporary Python
environment install `fonttools[woff]==4.58.5` and `brotli==1.1.0`, download the
pinned source from `manifest.json`, and convert it with:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = TTFont("source.ttf", recalcTimestamp=False)
# DM Sans only: match the optical size used by the former Google-served face.
font = instantiateVariableFont(font, {"opsz": 14}, inplace=False)
font.flavor = "woff2"
font.save("normal.woff2")
```

Omit the instancing line for every family except DM Sans. Google served DM Sans
with its optical size fixed at 14; retaining the full source's automatic optical
size would change the approved homepage typography. Its weight axis remains
variable. The converted DM Sans file's default-weight outlines and advance widths
were compared with the previous working font for all 62 ASCII letters and digits
and matched exactly. All families retain their original character mappings and
glyph counts.

When updating a font, replace its license from the same pinned source, update the
manifest hashes and metadata, and compare the affected pages before publishing.

Run the integrity and loader checks from `web/`:

```sh
node --test lib/fonts.test.mjs
```

The checks cover asset/license integrity, prohibit reintroducing the Google font
loader, and exercise the installed Next local loader and CSS transform. When an
`out/` directory exists, they also inspect the actual exported CSS and verify that
every generated font class and all six custom variables resolve to the intended
font-face before any synthetic fallback. This catches differences between
Turbopack and Webpack that an isolated loader test cannot catch.

After a clean default production build, require the export check explicitly with:

```sh
FONT_EXPORT_DIR=out node --test lib/fonts.test.mjs
```

An explicit export path must exist; without a build, only the export check is
skipped. Font family, style, weight, source, and license checks always run.
