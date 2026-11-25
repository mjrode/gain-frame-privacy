# Execution receipt — 2026-11-24 (F1, F2, F3)

**Status:** Shipped
**Approved scope:** `Ship F1-F3`, owner, 2026-11-24. F4, F5 and F6 were **not** approved and
were not touched.
**Review:** [2026-11-24.md](2026-11-24.md) · **Contracts:** [cta-tracking.md](../../web/docs/cta-tracking.md)
**Commit:** `02fe6212` "Restore the Body Visualizer offer and show the estimator ask in the result"
**Live:** **2026-11-25 02:34:07 UTC** (Workers `deploy` check-run completed; Cloudflare Pages, Workers Builds,
deploy, build and report-build-status all `success`)

## What shipped

### F1 — Body Visualizer four-offer test stopped, control restored

`visualizer_result_example / app_screens_v3` no longer enrols anyone. Eligible iOS and
desktop slider traffic returns to the `analysis_rollout_v2` experience.

- `web/lib/visualizer-screen-test.ts`: `visualizerScreenAssignment` is replaced by
  `visualizerScreenPreview`, which returns `null` unless an arm is explicitly forced. The
  random draw, the `localStorage` read and write, and the module-level `pageArm` cache are
  gone, so no visitor is assigned and no saved arm is consulted or rewritten.
- `web/app/tools/body-visualizer/BodyVisualizerCta.tsx`: the enrolment effect runs only
  for a forced preview; the `adjusted` state and `setAdjusted` have been removed from the
  hook because slider adjustment was purely the test's enrolment trigger.
- `web/app/tools/body-visualizer/BodyVisualizerClient.tsx`: the slider's
  `ctaState.setAdjusted(true)` call is removed. The slider's own behaviour
  (`updateMetric` / `updateUs`) is unchanged.

**Decision basis** (24-hour mature read, November 24, forced and cross-arm excluded):
control 88/722 (12.19%), `score_example` 52/788 (6.60%, p = 1.8e-04), `front_side` 20/710
(2.82%, p = 1.9e-11), `future_you` 14/776 (1.80%, p = 1.6e-15).

This is an **early stop for futility**, 6 days before the registered November 30 date
gate. Rationale recorded in the contract: the treatments held about 75% of eligible
traffic at an average 3.74% against control's 12.19%, roughly 24 Store clicks a day. No
treatment may be described as untested at its registered sample.

### F2 — Estimator `analysis` arm rolled out to eligible iOS

`body_fat_result_cta_v1` moves from randomized phase `fold_v1_stable_assignment` to
deterministic rollout phase **`inline_result_rollout_v1`**.

- `web/lib/body-fat-result-cta-experiment.ts`: `getBodyFatResultCtaAssignment` now takes
  only `search` and returns `analysis` for every non-forced caller. The storage key, the
  random helper and the page-lifetime memory are removed, so the rollout reads and writes
  nothing and the historical four-arm assignments stay intact. The old phase is retained
  as `BODY_FAT_RESULT_CTA_TEST_PHASE` for reference only.
- `web/app/tools/body-fat-from-photo/BFEstimatorClient.tsx`: comment corrected; the
  Android and local-sample guards are unchanged, so Android keeps the email form and the
  sample result still takes only an explicit QA arm.

**Decision basis:** `analysis` 88/220 assigned (40.00%) against control 26/202 (12.87%),
z = 6.27, p = 3.6e-10, +211% relative. Exposure-conditioned sensitivity 40.18% against
17.69%, z = 4.56, p = 5e-6.

**Registered-gate departure, recorded deliberately.** The contract required 14 days *and*
400 assigned visitors per arm. The 14-day gate completed November 25; enrolment was 202
to 227 per arm and 400 per arm would have arrived about December 5. Every report of this
result must state the shortfall.

**Limits.** Native arrivals are directional only (9/220 against 3/202, p = .11). Per
assigned visitor `goal` matched `analysis` on arrivals (4.13% against 4.09%) from fewer
than half the clicks; that question is unresolved. Zero assigned visitors in any arm
triggered an email report send. **No install, subscription or revenue lift is established.**

### F3 — Future You button-placement test folded in

`future_you_placement_v1` closes with its parent arm; it compared positions inside an
offer converting at 1.80% against control's 12.19%, so no placement of it could win. The
`pairedCtaAssignment` placement draw is removed, and `buttonPlacement` is now set only on
a forced `future_you` preview. `body_visualizer_button_viewed` therefore drops to
preview-only volume in production; that is expected, not a regression.

The finding is preserved in the contract: `above_image` reached 366/366 (100.0%) qualified
button visibility against `below_image`'s 183/368 (49.7%). Clicks were 10/314 (3.18%)
against 4/308 (1.30%), directional only at p = .11. The **visibility** result is reliable
and reusable; the click result is unpowered.

### QA previews retained

`?visualizer_result_example=<arm>`, `?future_you_button=<position>` and `?bf_cta=<arm>`
all still render their variants, all stay `experiment_forced=true`, and none writes a
stored assignment.

## Also corrected

`web/docs/cta-tracking.md` recorded the November 17 event-volume reduction as "pending
release". It shipped in `3f9101dc` on 2026-11-17 at 22:17 Eastern and was verified live
on November 24: across the November 18 boundary `tool_funnel_viewed` fell 2,836 to 43 a
day, `body_visualizer_result_shown` 1,462 to 2, `$pageleave` 2,979 to 34 and
`tool_cta_assigned` 5,143 to 1,863 (the expected deduplication). Residuals are stale tabs
on the previous bundle. The section now says so, because the new measurement guidance
depends on it.

## Live verification

Performed after the deploy completed, against production.

| Check | Result |
| --- | --- |
| `inline_result_rollout_v1` served in the estimator bundle | **present** |
| `analysis_rollout_v2` served on the visualizer | **present** (restored control path) |
| `app_screens_v3` retained for forced previews | **present** |
| `gainframe:experiment:body_fat_result_cta_v1` storage key | **absent from all 12 live chunks** |
| `gainframe:experiment:visualizer_result_example:app_screens_v3` storage key | **absent from all 12 live chunks** |
| Both tool pages | HTTP 200 |
| Visualizer default render | "See your body breakdown." / "Analyze my photo" — the `analysis_rollout_v2` card, no offer figure |
| `?visualizer_result_example=future_you&future_you_button=above_image` | still renders the Future You figure and "Preview my photo in the app" |
| Forced preview assignment event | recorded in PostHog as `app_screens_v3` with `experiment_forced=true` |

Both retired storage keys being absent from every served chunk is the load-bearing
check: no visitor can be randomly assigned to either closed test any more.

In the first minutes after release the last non-forced `app_screens_v3` assignment was
21:33:43 Eastern and the last `fold_v1_stable_assignment` 21:27:00 Eastern, with no
`inline_result_rollout_v1` assignment yet because no eligible iOS visitor had completed a
real estimate. That is consistent with the change but far too short a window to be
evidence; the code-level checks above are the proof. Confirm the phase changeover on the
first complete day, and expect retired arms from already-open tabs for a while.

## Build and test gates

| Gate | Result |
| --- | --- |
| `npm run test:tools` | **230 passed, 0 failed** (run twice: after the test rewrite and after the final edits) |
| `npm run build` | **Passed**, full route list rendered |
| `node seo-tools/content-inventory.mjs --check` | **PASS** — 296 posts, no broken links, missing assets or malformed JSON-LD |
| Staged files | Exactly the 7 files this run touched; the shared checkout's other modifications were left alone |

Three existing tests in `web/lib/body-visualizer-cta-experiment.test.mjs` were rewritten
rather than added to, because the behaviour they asserted no longer exists. They now
assert that the closed tests enrol nobody, that storage is never read or written by either
closed path, and that the estimator rollout returns `analysis` for every non-forced
visitor under the new phase.

## Not done

- **F4** (`/blog/dexa-scan-cost/` retarget), **F5** (scanning-roundup diagnosis) and
  **F6** (de-orphan `best-app-store-screenshot-tools`) were not approved and remain
  proposed. F4 and F5 still require a live SERP brief before execution.
- No content, metadata, `TODO_SEO.md` or indexing change was made. No new post was written.
- No experiment allocation other than the three above was altered. The shared
  Improve/Future phase keeps its December 4 checkpoint and its allocation.

## Measurement boundaries

The boundary for every read is the release above, **2026-11-25 02:34:07 UTC**.

- Do not pool `fold_v1_stable_assignment` with `inline_result_rollout_v1`.
- Do not pool `app_screens_v3` with `analysis_rollout_v2`.
- A before-and-after comparison across this release is not a randomized result: traffic
  mix, season and the November 10 core update all move independently.
- Old open tabs can keep emitting the previous arms for a while after release; filter by
  phase, not by date alone.
