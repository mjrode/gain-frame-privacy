# Tool app walkthrough rollout — October 29, 2026

Owner approved making both reviewed designs the public defaults and ending the affected CTA treatment on these pages.

## Public behavior

- `/tools/body-visualizer/`: Future You preview beside the main CTA, full setup/result screenshots, repeat CTA, and a muted looping real-photo comparison video.
- `/tools/body-fat-from-photo/`: after a successful estimate, Deep Dive preview beside the analysis CTA, full check-in/analysis examples, repeat CTA, and the same comparison video. Real estimate requests and email reports continue unchanged. Android retains its report-first flow.
- Pro requirements, separate example check-ins, and the boundary between illustrative Future You output and real comparisons are labeled.
- Sample result fixtures and old-page controls remain localhost-only. Query parameters cannot substitute a fabricated result or restore an old treatment on production.

## Measurement boundary

This is an owner-directed rollout, not evidence that the new creative won an A/B test.

| Page | New identity | Phase | Main / repeat placement |
|---|---|---|---|
| Body Visualizer | `body_visualizer_app_bridge` | `future_you_walkthrough_v1` | `body_visualizer_future_you_walkthrough_v1_main` / `body_visualizer_future_you_walkthrough_v1_result` |
| Body Fat from Photo | `body_fat_app_bridge` | `analysis_walkthrough_v1` | `body_fat_analysis_walkthrough_v1_main` / `body_fat_analysis_walkthrough_v1_result` |

Campaigns remain `web-body-visualizer` and `seo-physique-cpp-v1`. No unverified custom product-page ID is introduced. Both buttons on each page carry the new identity for existing download attribution.

The former `body_visualizer_cta_v1 / analysis_rollout_v2` treatment and this page's participation in `tool_result_cta_v1 / improve_vs_future_v4_stable_assignment` end at the verified production deployment timestamp. Historical constants/storage are retained. Other tool pages retain their existing assignments; do not pool post-release shared-test results across tools with the earlier cohort, because participants may visit these changed pages. Use the deployment boundary when reading the old experiment.

Reach events (`body_visualizer_bridge_viewed`, `body_fat_bridge_viewed`) record `main_cta`, `walkthrough`, `result_cta`, and `video` once per page visit after 50% visibility for one continuous foreground second. Offscreen autoplay, loops, quick scrolling, and repeat scrolling do not inflate reach. Dedicated button-click events distinguish the two placements without duplicating existing download events. Local events log only, with `preview_only=true`; production events use existing analytics providers.

For reporting, count distinct visitors, split iOS and desktop, and use each button's exposed visitors as its denominator. Store clicks are not verified installs. Very short viewports may not expose half of the portrait video at once.

## Release scope and checks

Only these tool pages, bridge media, analytics event types/helpers/tests, and test registration belong to this release. Unrelated comics, blog, marketing, and preexisting Body Visualizer hero/background changes are excluded.

The scoped commit is sent through the normal clean Workers build so uncommitted local routes and assets cannot enter production. A local isolated export was attempted but removed after running out of disk space, before building. Full tool regression tests, TypeScript, the clean CI production export, and live rollout/media verification are required. Runtime pages must show the new design without review parameters; the photo tool must still show upload UI without a successful result.

Deployment SHA, Worker version, timestamp, and verification receipts are recorded separately after release.
