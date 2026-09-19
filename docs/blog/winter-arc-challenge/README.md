# Winter Arc launch notes

Created September 19, 2026.

- Article: /blog/winter-arc-challenge/
- Free planner: /tools/winter-arc-planner/
- App invitation: "Track your full Winter Arc in GainFrame."
- Scope: website planner, calendar and checklist exports, supporting article. No native app changes.

The planner counts the start as day 1. A 90-day period beginning October 1, 2026 ends December 29. It includes 14 photo check-ins: baseline, 12 weekly follow-ups, and a final photo. Review dates are days 29, 57, and 90. These are editorial planning choices, not scientific thresholds.

The article's Winter Arc background references the Associated Press:
https://apnews.com/article/69c6280f52b5b62ca3eda3a808f865fb

The linked comparison screenshot is the existing approved 2.33 library asset. Its caption states the actual 2023–2025 range; it is not presented as a Winter Arc result.

## Cover provenance

Generated with the built-in image-generation tool, converted to WebP with Sharp at quality 80, and saved to assets/cover.webp.

Prompt:

> Create a polished 4:3 landscape editorial cover illustration for a fitness progress-photo article about planning a 90-day Winter Arc. Minimal abstract vector line art: a thoughtfully arranged paper calendar with weekly check-in dots, two simple phone-shaped progress photo frames containing anonymous athletic silhouettes, and a small winter branch. Thin precise dark charcoal #243C32 lines on a warm off-white #F5F3EB background. Restrained muted sage green, warm coral, and golden yellow accents. Flat geometric shapes, plenty of negative space, elegant and grown-up, consistent with a premium fitness app editorial illustration. No typography, no text, no numbers, no logos, no watermarks. This is a conceptual illustration, not an app screenshot.

## Measurement

- Shared tool funnel: winter_arc_planner, with viewed, started, result_shown, and cta_clicked steps.
- Export action: winter_arc_export_clicked with calendar, checklist, or print format.
- Web app CTA campaign: web-winter-arc.
- Exported App Store campaigns: web-winter-arc-calendar and web-winter-arc-checklist.
- Article CTA uses existing blog attribution, including the article path.
- Goals, dates, and photos are not included in the planner's custom analytics events.

## Validation

- Date and calendar tests cover inclusive counting, daylight saving, leap days, year boundaries, invalid inputs, unique all-day events, exclusive calendar end dates, and line folding.
- Browser checks cover custom dates and goals, invalid dates, calendar/checklist download actions, app destinations, and mobile layout.
- The site build regenerates the blog grid and deferred article index. The tools directory and sitemap include the new planner.
