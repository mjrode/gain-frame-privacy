# Free tools and app growth — September 15, 2026

Source notes for the blog post `free-tools-app-growth` and its Reddit image.

## Headline figures

- Google Search Console final data: 1,477 sitewide clicks on September 12 and 1,598 on September 13. September 7–13 average: 1,308.29. “Around 1,500 a day recently” refers to the latest two days, not the weekly average.
- RevenueCat monthly MRR chart, current September point: **$2,354.65**, incomplete as of September 15. Overview rounds this to $2,354.
- RevenueCat revenue chart, March 1–September 15: **$14,816.20**. September is incomplete. This is revenue after recorded refunds and downward adjustments, before store fees and taxes; it is not profit or MRR.
- RevenueCat overview: 416 active subscriptions and $3,690 revenue over the latest 28 days.
- Copy uses “nearly $2,400 MRR and $15,000 total revenue”; neither milestone has yet been crossed in this snapshot.

## Audit comparison

The September 11 audit compares **July 15–August 11** with **August 12–September 8**, two 28-day periods.

| Metric | Earlier | Later |
|---|---:|---:|
| Sitewide Google clicks | 8,340 | 21,645 |
| Tool-path Google clicks, including directory | 2,757 | 9,923 |
| Tracked iOS Store click events from tool pages | 100 | 258 |
| Tracked iOS Store click events from blog pages | 249 | 188 |

Tool growth: 259.92%, rounded to 260%. Tool clicks / property clicks: 45.84%, rounded to 46%; page and property aggregation can differ. Store click events include all observed traffic sources, can repeat per person, and are not downloads or subscriptions. Older tracking coverage was incomplete; no conversion rate is calculated by dividing GSC clicks into PostHog events.

Top tool pairs: Physique Rater 548 → 3,136; Body Fat from Photo 1,443 → 2,514; Body Visualizer 34 → 2,421; Body Fat Visualizer 477 → 960. Body Visualizer launched August 6, so the earlier period includes only its first six days online. The August founder article's 33 clicks use a different 30-day window.

Three non-overlapping 28-day sitewide blocks: June 17–July 14 = 2,871; July 15–August 11 = 8,340; August 12–September 8 = 21,645.

## Source files

- `gsc-daily-final.json`: fresh authenticated read-only Search Console API query, final data through September 13. Uses the existing configured service account. No credentials saved here.
- `rc-metrics.json`, `rc-mrr.json`, `rc-revenue.json`: fresh read-only RevenueCat aggregate responses.
- `summary.json`: calculated and selected figures for the charts.
- `../../raw/2026-09-11/gsc/current28_page.json` and `prior28_page.json`: tool page figures.
- `../../../seo-tools/content-audits/2026-09-11.md`: search, Store-click comparison, and attribution limitations.
- `../../../web/content/blog/first-1000-mrr-next-920.mdx`: tool release dates and prior work on links, search wording, and result screens.

Live tool descriptions checked at https://gainframe.app/tools/body-visualizer/, https://gainframe.app/tools/physique-rater/, and https://gainframe.app/tools/body-fat-from-photo/.

## Visual production

Five final assets were created with the built-in image generation tool: cover, search-growth chart, tool-growth chart, tool-to-app illustration, and Reddit chart. The three charts were first plotted from the real data with Matplotlib, then used as exact visual references for image generation. Reference plots and their rendering script are retained under `output/free-tools-app-growth/` in the workspace. Generated chart typography, numeric labels, axes, and proportions were visually checked against those references. The charts are editorial renderings; the JSON and reference plots retain precise numeric provenance.

`image-prompts.json` contains all prompts, including the contrast correction to the funnel illustration. The diagram shows the intended user journey, not measured conversion at each stage. Revenue statistics cover the entire app and are not attributed to the tools.

### Revised graphics

The final published set uses the owner's revised direction: white dashboard cards, fine gray lines, clear-blue charts, and small original cartoons incorporating GainFrame's scan-frame face. All five assets were regenerated with the built-in image tool. `image-prompts-v2.json` contains the selected prompts; `visual-direction-v2.md` records the brief. The three data plots in `output/free-tools-app-growth/v2/` supplied the chart references. The shared inspiration screenshot remains local and is excluded from the downloadable package. The first version's prompts are retained for history.

## Validation

The new MDX compiled with the site's renderer and GFM tables. Metadata, structured data, image paths, linked blog posts, and the generated blog listing were checked. The assembled page and all four article images were inspected in the local browser. The sitemap discovers the article automatically from its MDX file.
