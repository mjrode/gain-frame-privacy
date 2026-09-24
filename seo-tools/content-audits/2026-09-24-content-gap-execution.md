# September 24 content-gap implementation

Owner instruction: **“do them all and publish.”** This implements all 13 recommendations from the live Google Search Console analysis: five new pages and eight existing target-page improvements, with six supporting articles updated for internal links and consistency.

Search demand comes only from the direct Search Console API, finalized Web data for June 24 through September 21, 2026. Query rows below 10 impressions and GainFrame variants were excluded. Cluster positions are impression-weighted; query-to-page associations were checked through the API where available. Missing specialized coverage remains an editorial assessment of existing page themes. No search volumes were invented.

## Implementation

| Target | Action | Query impressions | Weighted position |
|---|---|---:|---:|
| `/blog/average-waist-size-women/` | Clearer title/description, age-table framing, tape versus clothing-size distinction, measurement protocol correction | 15,915 | 8.66 |
| `/blog/body-fat-percentage-chart/` | Immediate answer and jump navigation, clear AI-illustration labeling, remove unsupported diagnostic precision | 9,729 | 12.04 |
| `/blog/average-shoulder-width/` | Men-focused title and width/circumference explanation; remove unsupported physique benchmarks | 16,532 | 5.74 |
| `/blog/average-hand-size/` | Men/women and length/span title, measurement distinction, correct the football-span comparison | 22,176 | 6.59 |
| `/blog/bicep-length/` | New focused length-versus-circumference answer with measurement guidance | 1,253 | 9.35 |
| `/blog/shoulder-to-hip-ratio/` | New measurement and calculation answer distinguishing hips from waist | 1,213 | 8.26 |
| `/blog/why-do-i-have-skinny-arms/` | Immediate causes/next-steps table and links to the length and beginner guides | 4,505 | 7.85 |
| `/blog/best-ai-personal-trainer-apps/` | Current Fitbod/Gravl/FitnessAI comparison with sourced features, publisher screenshots and fresh ratings | 7,222 | 8.26 |
| `/blog/best-ai-fitness-apps-for-athletes/` | New sport-specific Athletica/HumanGO/Fitbod comparison | 1,345 | 9.49 |
| `/blog/body-fat-scale-third-party-app-ios/` | New Apple Health compatibility guide; distinguish body-fat export from weight-only tracking | 1,173 | 6.26 |
| `/blog/newbie-gains/` | Direct duration answer, progress framework and sourced limits; remove guaranteed muscle-gain timelines | 1,093 | 9.43 |
| `/blog/dexa-scan-alternative/` | Goal-based comparison of six methods; remove unsupported universal costs and accuracy promises | 598 | 8.28 |
| `/blog/body-scanning-platforms-for-coaches/` | New Styku/SNAP Fit3D/Trainerize comparison separating scans from manual progress tracking | 229 | 4.85 |

Supporting articles: average-bicep-size, shoulder-to-waist-ratio, best-smart-scales-apple-health, gravl-vs-fitbod, best-body-composition-apps and styku-body-scan-accuracy. Each new page has contextual inbound links. Five new cover illustrations and publisher-supplied product screenshots accompany the new and refreshed comparisons.

Primary scientific and measurement sources are linked in the relevant articles. App evidence is documented in [the September 24 source record](2026-09-24-app-evidence.md). The comparisons explicitly distinguish publisher claims from independent validation and do not imply hands-on testing. No AI citation or top-five ranking outcome is promised.

## Validation and release

- Production static build: passed, 571 routes, using an isolated snapshot containing only this release's changes.
- All 19 touched articles pass strict content-inventory checks, including internal links, local assets and structured-data contracts.
- Rendered output: canonical URLs, titles, BlogPosting/BreadcrumbList/FAQPage data checked; all 166 local image references resolve.
- Relevant existing CTA, attribution and blog-grid tests: 17 passed.
- Desktop and mobile visual checks include comparison-table containment and body-fat chart navigation.
- Existing working-tree changes outside this batch are excluded from the release.

Publication uses the normal main-branch Cloudflare Workers build. The final deployment ID, production timestamp, HTTP verification and IndexNow submission responses are recorded after deployment in the local analysis release receipt at `output/seo-content-gap-2026-09-24/implementation/publication-receipt.json`.

## Measurement annotation

The owner-approved AI personal-trainer refresh replaces its prior hold because the old testing claim and comparison content required correction. The September 24 deployment starts a new observation boundary for that article. The body-fat chart's control title is preserved. Content changes can affect CTA exposure and organic traffic mix; the existing experiment configuration and clock remain unchanged. See [the experiment annotation](../../web/docs/blog-cta-experiment.md).
