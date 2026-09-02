# Blog contextual CTA experiment

Prepared 2026-09-02. This is the operating contract for
`blog_contextual_cta_v1`, phase `sticky_vs_editorial_inline_v1`.

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
- Allocation: 50% `sticky_control`, 50% `editorial_inline`, randomized by
  visitor on every eligible page. Pages are not split into treatment groups.
- Stability: assignment is kept in memory before analytics consent. After
  consent is granted, the already-visible assignment is stored under
  `gainframe:experiment:blog_contextual_cta_v1`. This key and the QA parameter
  are deliberately separate from the tool CTA experiment.
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
| `blog_cta_experiment_viewed` | Material exposure: 50% visible for 800ms |
| `blog_cta_experiment_clicked` | Any treatment App Store/QR text-link click |
| `blog_cta_experiment_dismissed` | Control dock dismissed; challenger cannot emit it |
| `blog_cta_experiment_continued_reading` | Reader reaches the third section (or final article element) after material exposure |

The existing `blog_sticky_cta_*` series continues on the control for historical
continuity. Site-wide `web_download_clicked` and
`outbound_app_store_click` remain the download-attribution owners and inherit
the experiment fields from the treatment container.

Both direct-button and QR attribution use variant-specific `campaign` and
`cta` values. With consent, the QR itself carries a unique `web_click_id` in
the AppsFlyer payload; direct clicks receive a click-time `web_click_id` from
the delegated tracker. Without consent, privacy-safe direct App Store links do
not contain person-level attribution.

## Pre-registered readout

- **Primary metric:** unique `blog_cta_experiment_clicked` visitors divided by
  unique `blog_cta_experiment_viewed` visitors, filtered to this phase,
  `experiment_forced=false`, and iOS/desktop.
- **Secondary metrics:** consented `web_download_clicked`, unique
  `outbound_app_store_click`, Apple/AppsFlyer attributable installs and paid
  starts where available, split by platform, intent, slug, and rollout.
- **Guardrails:** continued-reading rate, control dismissal rate, article
  engagement, client errors, and page performance. Investigate a statistically
  credible 10% relative degradation in continued reading before promoting the
  challenger.
- **Minimum run:** 10–14 complete days and at least 1,500 materially exposed,
  eligible visitors per arm. Do not stop because one daily read looks good.
- **Decision rule:** promote the challenger only when its two-sided 95%
  interval for primary CTR lift clears zero, the relative lift is at least 20%,
  and no guardrail is breached. Keep the control if the challenger is
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
  AND properties.experiment_phase = 'sticky_vs_editorial_inline_v1'
  AND properties.experiment_forced = false
  AND properties.platform IN ('ios', 'desktop')
GROUP BY variant
```
