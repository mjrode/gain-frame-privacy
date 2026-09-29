# Blog contextual CTA experiment

Prepared 2026-09-02; assignment repaired 2026-09-11; device rollout approved
2026-09-29. Current phase: `ios_inline_desktop_sticky_v3_rollout` for
`blog_contextual_cta_v1`. The v2 randomized phase is closed by this release.
The original v1 phase was retired because assignment crossover contaminated it.

## September 29, 2026: approved device rollout

The owner approved all September 29 proposals. At this release the randomized
`sticky_vs_editorial_inline_v2_stable_assignment` phase ends. The new phase is
`ios_inline_desktop_sticky_v3_rollout`: iOS receives editorial inline; desktop
receives sticky control. Android preserves its saved v2 random assignment and
allocation because it was outside the App Store decision population. Its storage
key remains the v2 key deliberately. QA overrides remain forced and separate
from shared tool overrides. The fixed 79-post cohort, treatment copy, destination
and material-exposure definition remain intact.

The completed-day read through September 28 showed 65/3,656 inline assigned
clickers versus 33/3,631 sticky (1.78% versus 0.91%). The pooled registered gates
passed. The device split was exploratory: iOS 61/2,525 versus 20/2,485; desktop
4/1,131 versus 13/1,146. This rollout is an owner-approved product decision,
not a separately powered device-level causal result or proof of install lift.

Visual QA found the existing desktop dock offset beyond the viewport: a later
reading-style rule removed its translateX centering while leaving left:50%.
The dock now uses left/right insets and automatic margins, so positioning does
not depend on a transform. Annotate this rendering repair alongside the phase
boundary; do not compare post-repair desktop rates causally against old control.

Continue the existing event names with the new phase. Report assignments,
material exposures, App Store link clicks, continued reading, exceptions and
exact native arrivals separately by device. QR visibility is not a scan or click.
Do not pool old and new phases or call the deterministic rollout an A/B test.
Review the first complete 7 and 14 days after the verified deployment. Preserve
Body Visualizer and Improve/Future allocations and clocks.

Release timestamp and exact Git/Workers revision: see
[September 29 execution receipt](../../seo-tools/content-audits/2026-09-29-execution.md).

## Historical randomized test contract

The sections below describe the completed v2 test. The rollout above supersedes
its allocation and phase, while retaining event and visibility definitions.

## Why this test exists

The contextual sticky CTA launched on the fixed 79-post cohort recorded a
lower exposed-user click rate than the inline treatment that preceded it. That
comparison was before-versus-after, not randomized. It is a reason to test a
different presentation—not evidence that the sticky treatment caused the
decline.

The hypothesis is that a contextual CTA that reads like the next chapter of an
article will earn more qualified App Store clicks than a floating dock. The
challenger keeps the same page-specific promise but places it after the first
useful section, pairs it with a real GainFrame product preview, and removes all
overlay and dismissal behavior.

## Population and assignment

- Population: the unchanged 79-post cohort in `lib/blog-cta.ts`.
- Exclusions: founder/product-update posts, every tool route, and every blog
  post outside that fixed cohort.
- Allocation: 50% `sticky_control`, 50% `editorial_inline`, randomized once per
  visitor for the phase and reused on every eligible page. Pages are not split into treatment groups.
- Stability: restore the current-phase saved assignment on mount and persist new
  choices immediately. The storage key is
  `gainframe:experiment:blog_contextual_cta_v1:sticky_vs_editorial_inline_v2_stable_assignment`.
  Old-phase state is ignored. The key and QA parameter are separate from tools.
- QA: append `?gf_blog_cta_variant=sticky_control` or
  `?gf_blog_cta_variant=editorial_inline`. Forced exposures carry
  `experiment_forced=true` and must be excluded from the readout.

## Treatments

### Control — `sticky_control`

The existing contextual bottom dock appears after the reader reaches the first
article section. Its current copy, product image, CTA, QR behavior, dismissal,
and responsive presentation remain intact.

### Challenger — `editorial_inline`

The CTA is inserted immediately before the second `h2` (or before the legacy
CTA/end of article when a post is shorter). It is a wide, white-and-blue
editorial panel with:

- the existing page-specific headline and support copy;
- a compact real-app preview that connects photo, score, and trend;
- one direct App Store button on mobile or one QR action on desktop;
- no sticky positioning, overlay, or dismiss control;
- restrained reveal motion with a complete reduced-motion fallback.

## Analytics contract

An exposure is not emitted on mount. At least 50% of the treatment must remain
visible for 800ms. All experiment events carry `experiment_id`,
`experiment_phase`, `experiment_variant`, `experiment_forced`, `slug`,
`intent`, `placement`, `platform`, and `rollout`.

| Event | Meaning |
|---|---|
| `blog_cta_experiment_assigned` | Eligible article visitor assigned before visibility |
| `blog_cta_experiment_viewed` | Material exposure: 50% visible for 800ms |
| `blog_cta_experiment_clicked` | Any treatment App Store/QR text-link click |
| `blog_cta_experiment_dismissed` | Control dock dismissed; challenger cannot emit it |
| `blog_cta_experiment_continued_reading` | Reader reaches the third section (or final article element) after material exposure |

The existing `blog_sticky_cta_*` series continues on the control for historical
continuity. Site-wide `web_download_clicked` and
`outbound_app_store_click` remain the download-attribution owners and inherit
the experiment fields from the treatment container.

Both direct-button and QR attribution use variant-specific `campaign` and
`cta` values. The QR itself carries a unique `web_click_id` in
the AppsFlyer payload; direct clicks receive a click-time `web_click_id` from
the delegated tracker. Static rendering uses the direct App Store destination until the client mounts.

## Pre-registered readout

- **Assignment metric:** unique `blog_cta_experiment_clicked` visitors divided by
  unique `blog_cta_experiment_assigned` visitors, requiring assignment before click.
- **Exposure diagnostic (historical primary):** unique clickers divided by materially
  exposed visitors, filtered to this phase,
  `experiment_forced=false`, and iOS/desktop.
- **Secondary metrics:** `web_download_clicked`, unique
  `outbound_app_store_click`, Apple/AppsFlyer attributable installs and paid
  starts where available, split by platform, intent, slug, and rollout.
- **Guardrails:** continued-reading rate, control dismissal rate, article
  engagement, client errors, and page performance. Investigate a statistically
  credible 10% relative degradation in continued reading before promoting the
  challenger.
- **Minimum run:** Restart at the verified repair deployment; 10–14 complete days and at least 1,500 materially exposed,
  eligible visitors per arm. Do not stop because one daily read looks good.
- **Decision rule:** after checking assignment balance, crossover and exposure reach,
  promote only when the two-sided 95% interval for clicks per assigned visitor clears zero, the relative lift is at least 20%,
  and no guardrail is breached. Exposed CTR alone cannot select a winner. The
  historical exposure floor is not a power guarantee for the assignment metric. Keep the control if the challenger is
  significantly worse. Otherwise record the test as inconclusive and continue
  until the minimum sample is reached or redesign after four full weeks.

Android visitors are assigned so their page experience stays stable, but they
are excluded from the primary metric because their action opens the free web
tool rather than the iOS App Store.

## Readout query shape

Use unique people, not raw events, and require the matching phase:

```sql
SELECT
  properties.experiment_variant AS variant,
  uniqIf(distinct_id, event = 'blog_cta_experiment_viewed') AS exposed,
  uniqIf(distinct_id, event = 'blog_cta_experiment_clicked') AS clickers,
  clickers / exposed AS ctr
FROM events
WHERE event IN (
    'blog_cta_experiment_viewed',
    'blog_cta_experiment_clicked'
  )
  AND properties.experiment_id = 'blog_contextual_cta_v1'
  AND properties.experiment_phase = 'sticky_vs_editorial_inline_v2_stable_assignment'
  AND properties.experiment_forced = false
  AND properties.platform IN ('ios', 'desktop')
GROUP BY variant
```

## September 21 content annotation

The approved customer-intent SEO refresh revised seven existing articles: understanding-ai-physique-score, take-progress-photos-by-yourself, best-free-progress-photo-apps, best-progress-photo-apps, best-body-tracking-apps, progress-photo-poses and how-often-progress-photos. Six supporting posts received contextual links and required schema/style repairs. Content order, first-section length and the surrounding material at the editorial insertion point changed. The active sticky_vs_editorial_inline_v2_stable_assignment phase, cohort, allocation, treatment configuration, CTA copy and eligibility remain unchanged. Preserve the September 11 experiment clock; annotate this release and report a before/after-content sensitivity slice without calling a causal content win. Legacy fallback CTAs in the free roundup, solo-photo guide and frequency guide had obsolete price/allowance claims corrected; experiment treatment copy was not edited.

Release timestamp: September 21, 2026, **13:05:01 UTC**, content commit `ed96f821`, verified at 100% production traffic.

## September 24 content annotation

The owner approved implementing and publishing the complete live-GSC content-gap analysis. Eight existing target articles were revised: average-waist-size-women, average-shoulder-width, average-hand-size, body-fat-percentage-chart, why-do-i-have-skinny-arms, best-ai-personal-trainer-apps, newbie-gains and dexa-scan-alternative. Six supporting articles received contextual links and necessary content/schema repairs: average-bicep-size, shoulder-to-waist-ratio, best-smart-scales-apple-health, gravl-vs-fitbod, best-body-composition-apps and styku-body-scan-accuracy. Five focused articles were added without expanding the fixed experiment cohort.

Opening answers, section order and material around the editorial insertion point changed. The stable-assignment phase, allocation, eligibility and treatment configuration were not edited. Preserve the September 11 experiment clock; annotate the deployment and report a before/after-content sensitivity slice without attributing causality to this content batch.

The AI personal-trainer article's prior metadata hold was superseded by the owner's approval to implement all recommendations. Its unsupported claim of hands-on testing was removed; current publisher documentation and App Store evidence replaced obsolete comparisons. Treat September 24 as a new content/metadata boundary for that page, rather than an uninterrupted continuation of the September 16 observation window. The body-fat chart's existing control title was preserved.

Release details and verification: [September 24 execution receipt](../../seo-tools/content-audits/2026-09-24-content-gap-execution.md).
