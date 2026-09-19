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

## Visual direction — September 19 redesign

The user rejected the original sage/forest-green palette and abstract calendar art. For this campaign, use the existing site's bold Outfit headings, white backgrounds, black controls, and brand-red accents. Do not reintroduce green, olive, sage, or cream. Keep custom artwork visible on mobile and preserve the free-planner-to-app funnel.

Two custom illustrations were generated with the **built-in ImageGen tool**, inspected, and converted to 1200 × 800 WebP with Sharp at quality 85:

- `assets/winter-arc-mascot.webp`: planner hero, article masthead, social preview, and blog thumbnail.
- `assets/photo-routine.webp`: photo setup section on the tool and article.
- `assets/cover.webp`: compatibility copy of the new hero for older links.

References: the existing `docs/assets/blog-covers/blog-hero-signal-v2.webp` mascot artwork for the first image; the generated first image for the second. Neutral gray shorts replace the reference's olive shorts to follow the user's color direction. Illustrations show a concept, not app UI or a promised body transformation.

### Hero prompt

Use case: illustration-story. Create a NEW custom GainFrame website hero illustration, landscape 3:2, using the attached image only as the mascot identity and clean cartoon style reference. Scene: the familiar scan-frame-headed charcoal mascot wearing a red winter scarf and neutral charcoal-gray shorts is standing beside a large tilted white photo-check-in calendar board. One hand holds a simple black phone containing a neutral gray portrait silhouette; the other confidently places a bright red check mark on the calendar. A small row of three white progress-photo cards hangs from the calendar edge, showing the SAME neutral silhouette with no body transformation. A few subtle icy pale blue snowflakes give a winter cue. Composition compact, large recognizable mascot and oversized calendar, balanced together across the landscape canvas, generous white margin, readable at mobile size. Pure white #FFFFFF background, bold clean black outlines, simple polished two-tone gray shading, brand red #E53935 as the only strong color. Match the friendly approachable mascot from the reference, including four DISCONNECTED L-shaped face corners (three black, bottom-right red), floating asymmetrical eyes and S-shaped nose in the white empty center. Exactly two arms and two legs, modest athletic build, grounded anatomy. Gray shoes. NO green anywhere, no sage, olive, beige, cream or tan. Do not copy reference's growth arrow. No typography, letters, numbers, logos or watermarks. Not an app UI mockup, not photorealistic, no 3D plastic or shadows behind the whole image. This artwork will sit beside large black headline text on a white page.

### Photo routine prompt

Use case: illustration-story. Generate a second NEW companion editorial illustration for the GainFrame Winter Arc guide. Use the attached artwork ONLY as exact mascot identity, palette, linework and shading reference; change the scene completely. Wide landscape 3:2 composition, white background. The same friendly charcoal GainFrame mascot (scan-frame face with disconnected black corners and red bottom-right corner, asymmetrical eyes and curved nose), now without scarf, in gray shorts and gray shoes, stands in a simple relaxed front pose on a small red floor-position marker. A black smartphone on a small sturdy tripod stands at waist/chest height facing the mascot from the foreground to the left. One minimal neutral-gray window behind to the right suggests repeatable natural lighting. At the far right sit two neatly aligned overlapping progress-photo cards with identical neutral silhouettes, joined by a red comparison bracket. Simple visual explanation of keeping the same light, camera position, and pose over time. Clean bold black outlines and polished restrained two-tone shading. Big readable shapes and enough whitespace; all equipment and character fully inside frame. Exactly one mascot, two arms and two legs. No body transformation, no invented app UI, no typography, words, numbers, watermarks or labels. Pure white, black, grays, and brand red #E53935; absolutely NO GREEN (including olive or sage), no beige/cream/tan, no growth arrow. Not photorealistic or 3D plastic.

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
