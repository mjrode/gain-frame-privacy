# Photo editors and related guides

Release prepared September 23, 2026.

## Scope

- `/tools/gym-photo-privacy-editor/`: up to 10 local JPEG/PNG/WebP inputs, independent opaque/blur regions and crops, flattened PNG exports (maximum source edge 1,600 px).
- `/tools/progress-photo-timelapse-maker/`: 3 to 24 local inputs, reorder, dates, shared portrait zoom, per-frame position and covers, 480 × 600 GIF and contact sheet exports.
- Five guides: Fitbod vs Hevy, iPhone gym-photo privacy, MacroFactor Workouts, pump vs no-pump photos, Hume vs Withings.

The tools directory now lists 24 tools. All seven pages have canonical URLs, structured data and sitemap entries. Five covers were made with built-in image generation; prompts and original output filenames are in `seo-tools/content-audits/2026-09-23-launch-assets.json`. The privacy guide also uses an actual browser screenshot with the illustrated sample.

## Verification

- Production static build and TypeScript compilation passed.
- All 138 tool tests passed, including seven new checks for crop geometry, selection mapping, region bounds, blur pixels, date validation and file rejection.
- Browser QA in Chrome: desktop layout; 390 px layout without horizontal overflow; sample flow; local fixture upload; two-image PNG batch; opaque and blur controls; reordered three-frame GIF with date; contact-sheet creation; prepared-image preview. No console errors observed in the timelapse flow.
- Static checks passed for canonical URLs, FAQ JSON-LD, sitemap inclusion and no `noindex` on all seven pages.
- Physical iPhone/Safari and low-memory devices have not been tested. The UI documents format and size limits. HEIC and MP4 are unsupported.

Photo files stay in browser memory. Exports are rendered from canvas pixels without copying original file metadata. The workspace blocks session-replay capture; explicit usage events include tool ID, coarse count bucket, format and non-sensitive status only. Sample activity is separate from the personal-input funnel. Export-ready means a file was produced, not that a download completed or an app installation occurred.

## Content and measurement notes

Product guides use published primary sources and disclose the absence of hands-on training or hardware accuracy trials. Hevy Trainer and existing Hevy/MacroFactor photo capabilities are acknowledged. The pump guide is a sourced photo-protocol article with a conceptual illustration; it does not fabricate the controlled real-photo pair originally proposed. The scale comparison separates original devices from their newer generations.

Small related-guide links were added to Gravl vs Fitbod and Hume vs RENPHO. Existing metadata, CTA copy variants, allocations and experiment start clocks were not changed. New article traffic and the two new tool IDs should be treated as a changed traffic mix in pooled reports. The new tool conversion cards appear after a personal-image export and use the default website route.

Deployment and Google inspection results are recorded in the task's release receipt after the production build completes. Indexing requests do not guarantee inclusion in Google's index.
