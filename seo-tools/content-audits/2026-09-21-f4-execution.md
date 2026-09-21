# Progress-photo comparison upgrade, September 21

**Authorization:** The owner explicitly requested “go ahead and do them now” after the nine-item release. This supersedes F4's September 28 measurement gate. Scope remains the approved existing-tool upgrade.

**Status:** Implemented and locally verified; production verification pending.

## What changed

- Existing URL: https://gainframe.app/tools/progress-photo-compare/.
- H1: **Compare Progress Photos Side by Side**.
- Title: **Free Progress Photo Comparison: Align, Overlay and Export**.
- **Try sample photos** loads the existing public GainFrame images from `/assets/before-after/before.webp` and `after.webp`. No new personal images are published. A screenshot of the working sample comparison accompanies the explanatory section.
- **Use my photos** clears the sample images and their labels/dates. Samples are explicitly identified in the workspace and always marked in the exported PNG, including when ordinary labels are disabled.
- Optional short labels and calendar dates appear in the preview and PNG export. Dates are user-supplied, not inferred. No filenames, labels, dates or image data are added to analytics.
- Side-by-side, manual alignment, wipe, ghost, blur and PNG export remain available. Wipe captions now follow the actual image order: after on the left, before on the right.
- The new explanation links to the solo-photo setup and pose guides. Previously shipped contextual inbound links remain intact.

## Measurement separation

Each photo records whether it is a personal selection or a public sample. Two personal photos are required for `tool_funnel_result_shown` and the existing result CTA. A pair containing any sample never mounts that CTA, assigns a result experiment variant or counts as a personal result. Selecting an actual personal file still records the existing personal start event.

New events:

| Event | Meaning |
|---|---|
| `progress_photo_compare_sample_loaded` | The public sample pair loaded successfully. |
| `progress_photo_compare_demo_result_shown` | A sample or mixed pair is ready; `input_mode` distinguishes the two. |
| `progress_photo_compare_demo_exported` | Export of a sample or mixed pair. |
| `progress_photo_compare_exported` | Export of two personally selected photos. |

Export properties contain only the tool, input mode, comparison mode, whether labels are enabled and whether blur is enabled. Active CTA treatment copy, allocation and phase are unchanged for real personal comparisons. Sample-driven page views remain ordinary tool views; do not treat the resulting view-to-personal-start rate as an unchanged audience mix.

## Validation

- 35 focused comparison, analytics, funnel and CTA-experiment tests pass. They cover incomplete/sample/mixed/personal eligibility, actual emitted event names, privacy-safe export properties, date validation, bounded label text, wipe label order, image validation and existing geometry.
- Production build passes with 555 routes, using an isolated snapshot of committed HEAD plus this task's selected files. Unrelated shared-checkout work is excluded.
- Browser checks pass at 1000px and 390px: sample loading, absence of result CTA for samples, side-by-side/wipe/ghost, blur, dated export, export without labels, resetting to personal inputs and no document overflow. Calendar dates survive subsequent label changes.
- Static screenshot and final live-page checks are recorded in the release receipt below.

## Release and follow-up

Production revision, deployment timestamp, live checks and IndexNow responses pending. After verified publication, pause `ship-gainframe-photo-comparison-upgrade` so it cannot repeat the completed work.

Freeze this tool's new metadata for ten days after this actual release. Use September 22-October 19 for the first complete 28-day post-release window, with settled GSC around October 22. The original August 31 launch window is now interrupted by the owner-approved upgrade. Read personal results/exports separately from demo results/exports and annotate this release independently of the earlier September 21 inbound-link batch.

Google manual recrawl request:

```text
https://gainframe.app/tools/progress-photo-compare/
```
