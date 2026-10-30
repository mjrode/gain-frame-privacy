# A1 homepage implementation handoff

Updated October 30, 2026. The approved round 6 A1 design is implemented at the actual `/` route. Release builds use the normal `npm run build` pipeline and the repository’s guarded Cloudflare Workers deployment.

## Implementation

`app/page.tsx` supplies homepage metadata and renders `components/homepage/Homepage.tsx`. The page is server-rendered; its scoped styles live in `Homepage.module.css`. `HomepageMotion.tsx` supplies optional client-side motion and mobile-menu enhancements.

The page follows one story: **compare your photos → understand the changes with Deep Dive → ask Coach what to do next**. Selected App Store reviews follow the hero, and the download/QR section follows Coach. Precision Body Fat, Goal Plans, and weekly review support the main story. Later sections cover nutrition, Future You, Rewind, photo collages, the optional leaderboard, browser tools, guides, Michael’s founder story, privacy/FAQs, and the closing download action.

The clean A1 layout retains the approved screenshots and restrained Gary illustrations. Screenshot width/height attributes reserve space; hero images load eagerly, the lead comparison gets high priority, and other images load lazily. The 16 images total **908,436 bytes (887 KiB)**, down from 26,886,505 bytes: **96.6% less image data**. They were resized/encoded without content edits or cropping. Source hashes, dimensions, and review provenance are in [homepage-a1-assets.md](homepage-a1-assets.md) and the [asset manifest](../../docs/assets/homepage-a1/manifest.json).

The canonical assets live in repository `docs/assets/homepage-a1/`. `web/public/assets` is an existing symlink to `../../docs/assets`, so the same files are served at `/assets/homepage-a1/`; these are not two maintained copies. Review figures are the October 29, 2026 US App Store snapshot, not live ratings.

## Tracking

Download links reuse `PlatformDownloadLink`, retaining the existing platform-specific destination and attribution behavior. The historical `source="landing_v2"` is retained for analytics continuity even though this page is now served at `/`.

| Placement | Campaign | CTA content |
| --- | --- | --- |
| Navigation | `web-home-nav` | `floating_nav_download` |
| Hero | `web-home-hero` | `hero_download` |
| After Coach | `web-home-story` | `story_download` |
| Desktop QR after Coach | `web-home-story-qr` | `story_download_qr` |
| Closing | `web-home-closing` | `closing_download` |

The hero retains the existing analysis custom product page. The desktop QR reuses `DownloadQr`: its visibility event is `web_download_qr_shown`, which is an impression rather than a scan. The accompanying link uses `story_download_qr_desktop_link`.

The two public App Store rating/review links have `data-app-store-intent="reviews"`. `AppStoreClickTracker` returns before rewriting their destination or emitting download events. This is deliberately separate from existing `data-track-exempt`, which still skips only the legacy outbound event and continues attribution plus `web_download_clicked`.

## Responsive behavior and accessibility

The layout adapts phone compositions, feature rows, navigation, and supporting grids for smaller screens. The mobile menu and FAQs use native `details`/`summary`; a skip link, visible focus treatment, descriptive screenshot alternatives, and decorative Gary alternatives support keyboard and assistive-technology use.

Core page content stays visible without JavaScript. The existing desktop QR is a client-side enhancement; ordinary download links remain present. Motion uses opacity and transforms: a short hero entrance, one-time section reveals, and bounded Gary movement. `prefers-reduced-motion` disables motion and smooth scrolling; changing that preference cancels running animations. Focusing a reveal section also cancels its animation so keyboard navigation does not leave focused content hidden.

## Fonts and validation

All previously downloaded Google fonts are bundled as WOFF2 files and loaded through `next/font/local`. This removes the build-time Google Fonts dependency instead of relying on the temporary preview-only request-header workaround. Typefaces, weights, styles, CSS variables, family aliases, and character coverage are preserved. Sources, hashes, licenses, and conversion notes live in [fonts/README.md](../fonts/README.md).

Release validation passed: 226 tools/analytics tests, three homepage review-link tests, and four font tests (233 total). The normal production pipeline exported all 590 tracked-site routes without NODE_OPTIONS or a font-download workaround. The font suite also checks the actual exported CSS for all ten families and six CSS variables; homepage, comparison-tool, and photo-studio typography were inspected in the browser.

## Change inventory for this work

Paths are relative to the website repository root. Other existing checkout changes are outside this homepage handoff.

- `web/app/page.tsx` — actual homepage route and metadata.
- `web/components/homepage/Homepage.tsx` — A1 content, screenshots, reviews, and existing download components.
- `web/components/homepage/Homepage.module.css` — scoped desktop/mobile styling and reduced-motion treatment.
- `web/components/homepage/HomepageMotion.tsx` — bounded progressive motion and menu behavior.
- `web/components/AppStoreClickTracker.tsx` — only the review-intent guard and documentation are attributable to this work; its preexisting article-assistance/custom-product-page edits were preserved.
- `web/components/AppStoreClickTracker.test.mjs` — focused regression coverage for the new guard and existing behavior.
- `docs/assets/homepage-a1/` — 16 optimized images and the provenance manifest, exposed through the existing public-assets symlink.
- `web/docs/homepage-a1-assets.md` — asset and review evidence notes.
- `web/docs/homepage-a1-implementation.md` — this handoff.
- `web/fonts/`, `web/lib/fonts.test.mjs`, and the existing font callsites — bundled fonts, licenses, provenance, regression checks, and route-scoped local loading.

## Final browser checks

The exported page was verified at 1280px, 390px, and 320px with no horizontal overflow. All 32 unique linked destinations and 21 images in the exported homepage resolve, with one H1. The mobile menu closes after navigation and on Escape (returning focus); FAQ content opens correctly. Browser console errors: none. CoreImage decoded the actual 164px QR on screen and confirmed the expected host, campaign, and CTA.

Desktop and mobile full-page captures and the bounded validation report are in the GainFrame app checkout at `output/homepage-redesign-2026-10-29/site-preview/`. The final production export includes the compact 320px header adjustment. Publication uses the verified release commit on `main`, followed by the Cloudflare Workers build check and a live homepage inspection.
