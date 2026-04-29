# Stop Program Hopping

Slug: `stop-program-hopping`
Format: Standard Tips
Slides: 6
GainFrame mention: No
Model: `gpt-image-2`
Size: `1024x1280`
Quality: `medium`

## Reference Images

Cover:
- `/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gf-mascot-template.jpeg`
- `/Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/comic/discipline-not-motivation/slide-0-cover.png`
- `/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gary-badge.png`

Numbered slides:
- `/Users/michael.rode/code/project/gain-frame-privacy/assets/gf-mascot/gf-mascot-template.jpeg`
- `/Users/michael.rode/code/project/gain-frame-privacy/assets/tiktok/comic/discipline-not-motivation/slide-1.png`

## Slide Text

| Slide | Title | Subtitle | Scene |
|---|---|---|---|
| Cover | STOP PROGRAM HOPPING | - | GainFrame Guy standing in a pile of crumpled workout plans, holding three different routines at once |
| 1 | NEW WEEK, NEW SPLIT | Changing plans feels productive, but it usually resets your progress. | Mascot excitedly writing "NEW SPLIT" on a whiteboard while old plans are crossed out |
| 2 | YOU NEVER ADAPT | Your body needs repeated practice before a movement starts paying off. | Mascot jumping from machine to machine, looking confused |
| 3 | NO LIFT GETS BETTER | Swap every exercise and you never build skill, strength, or momentum. | Mascot trying three different chest exercises with tiny progress bars over each |
| 4 | PICK BORING BASICS | The best plan is the one you can repeat long enough to measure. | Mascot calmly doing a simple bench, squat, and row checklist |
| 5 | RUN IT 8 WEEKS | Keep the core lifts stable. Adjust after you have real data. | Mascot checking off week 1 through week 8 on a calendar, progress line finally rising |

## Cover Prompt

```text
A cartoon illustration of this exact GainFrame Guy character from the reference images in a new scene.
CRITICAL: The head is NOT a solid square. It is four separate corner brackets floating in space with the cream background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill, NO square, NO box behind them. Copy the head design from the reference images exactly: open bracket corners, not a filled square.

In the top-left corner, draw a small branding badge: a tiny version of the character's bracket-frame head icon matching the badge reference image next to bold sans-serif text reading "GAINFRAME GUY". Keep it small like a watermark, about 10% of image width.

Scene: GainFrame Guy stands in the bottom 60% of the image, overwhelmed but funny, ankle-deep in crumpled workout plans and sticky notes. He is holding three different routines at once labeled only with simple abstract marks, not readable words. A whiteboard behind him has messy crossed-out workout blocks with no readable text.

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the BOTTOM 60% of the image.

TITLE TEXT PLACEMENT:
- The title text MUST be placed in the TOP 40% of the image.
- The title text MUST be raw text floating directly on the cream background. NO banner, NO pill shape, NO rounded rectangle, NO black box, NO background shape behind the title text.
- The title text MUST be centered horizontally, taking up around 75% to 80% of the image width.
- Stack the title into 3 short centered lines:
  STOP
  PROGRAM
  HOPPING
- The word "HOPPING" is red (#E53935). All other words are near-black (#1A1A1A).
- Very prominent bold text, eye-catching and large.

TYPOGRAPHY: Use bold Impact-style condensed sans-serif font for the title, ALL CAPS. NO handwritten, script, or decorative fonts. NO text inside any box or shape.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format. No watermarks except the GainFrame Guy badge.
```

## Slide 1 Prompt

```text
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL: The head is NOT a solid square. It is four separate corner brackets floating in space with the cream background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill, NO square, NO box behind them. Copy the head design from the reference images exactly: open bracket corners, not a filled square.

Scene: GainFrame Guy is excitedly writing a new workout plan on a whiteboard while several older plans lie crossed out on the floor. The scene should feel funny and chaotic, like he keeps reinventing the routine before doing the work. Do not include readable text on props except the generated banner and subtitle.

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the BOTTOM 72% of the image. Leave the top 28% clear for the banner.

BANNER (TOP OF IMAGE):
- A solid BLACK rectangular bar spans the FULL WIDTH edge-to-edge from the very top.
- Square corners. NO rounded corners, NO pill shape, NO border.
- The bar is approximately 12-14% of total image height.
- Inside the bar, left-aligned: "#1" in bold Impact ALL CAPS, bright red (#E53935).
- Immediately to the right: "NEW WEEK, NEW SPLIT" in bold white Impact ALL CAPS.
- The banner contains ONLY the number and title.

Below the banner, bold dark Helvetica-style subtitle text, center-aligned, reads: "Changing plans feels productive, but it usually resets your progress."

TYPOGRAPHY: Bold Impact-style condensed sans-serif for banner title. Clean Helvetica-style sans-serif for subtitle. NO handwritten, script, or decorative fonts.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format. No watermarks.
```

## Slide 2 Prompt

```text
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL: The head is NOT a solid square. It is four separate corner brackets floating in space with the cream background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill, NO square, NO box behind them. Copy the head design from the reference images exactly: open bracket corners, not a filled square.

Scene: GainFrame Guy is jumping anxiously between three different gym machines, looking confused and rushed. Use motion lines and scattered arrows to show he is constantly switching. Keep machines simple and readable, with no readable labels.

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the BOTTOM 72% of the image. Leave the top 28% clear for the banner.

BANNER (TOP OF IMAGE):
- A solid BLACK rectangular bar spans the FULL WIDTH edge-to-edge from the very top.
- Square corners. NO rounded corners, NO pill shape, NO border.
- The bar is approximately 12-14% of total image height.
- Inside the bar, left-aligned: "#2" in bold Impact ALL CAPS, bright red (#E53935).
- Immediately to the right: "YOU NEVER ADAPT" in bold white Impact ALL CAPS.
- The banner contains ONLY the number and title.

Below the banner, bold dark Helvetica-style subtitle text, center-aligned, reads: "Your body needs repeated practice before a movement starts paying off."

TYPOGRAPHY: Bold Impact-style condensed sans-serif for banner title. Clean Helvetica-style sans-serif for subtitle. NO handwritten, script, or decorative fonts.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format. No watermarks.
```

## Slide 3 Prompt

```text
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL: The head is NOT a solid square. It is four separate corner brackets floating in space with the cream background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill, NO square, NO box behind them. Copy the head design from the reference images exactly: open bracket corners, not a filled square.

Scene: Three small versions of GainFrame Guy try three different chest exercises at once: dumbbell press, cable fly, and push-up. Above each exercise is a tiny progress bar stuck near the beginning, showing none of them improves. No readable text on the progress bars.

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the BOTTOM 72% of the image. Leave the top 28% clear for the banner.

BANNER (TOP OF IMAGE):
- A solid BLACK rectangular bar spans the FULL WIDTH edge-to-edge from the very top.
- Square corners. NO rounded corners, NO pill shape, NO border.
- The bar is approximately 12-14% of total image height.
- Inside the bar, left-aligned: "#3" in bold Impact ALL CAPS, bright red (#E53935).
- Immediately to the right: "NO LIFT GETS BETTER" in bold white Impact ALL CAPS.
- The banner contains ONLY the number and title.

Below the banner, bold dark Helvetica-style subtitle text, center-aligned, reads: "Swap every exercise and you never build skill, strength, or momentum."

TYPOGRAPHY: Bold Impact-style condensed sans-serif for banner title. Clean Helvetica-style sans-serif for subtitle. NO handwritten, script, or decorative fonts.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format. No watermarks.
```

## Slide 4 Prompt

```text
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL: The head is NOT a solid square. It is four separate corner brackets floating in space with the cream background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill, NO square, NO box behind them. Copy the head design from the reference images exactly: open bracket corners, not a filled square.

Scene: GainFrame Guy calmly follows a simple workout checklist with three big icons: bench press, squat, and row. The vibe is stable, focused, and boring in a good way. Use clean checkmarks, simple equipment, and no readable text on the checklist.

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the BOTTOM 72% of the image. Leave the top 28% clear for the banner.

BANNER (TOP OF IMAGE):
- A solid BLACK rectangular bar spans the FULL WIDTH edge-to-edge from the very top.
- Square corners. NO rounded corners, NO pill shape, NO border.
- The bar is approximately 12-14% of total image height.
- Inside the bar, left-aligned: "#4" in bold Impact ALL CAPS, bright red (#E53935).
- Immediately to the right: "PICK BORING BASICS" in bold white Impact ALL CAPS.
- The banner contains ONLY the number and title.

Below the banner, bold dark Helvetica-style subtitle text, center-aligned, reads: "The best plan is the one you can repeat long enough to measure."

TYPOGRAPHY: Bold Impact-style condensed sans-serif for banner title. Clean Helvetica-style sans-serif for subtitle. NO handwritten, script, or decorative fonts.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format. No watermarks.
```

## Slide 5 Prompt

```text
A cartoon illustration of this exact character from the reference images in a new scene.
CRITICAL: The head is NOT a solid square. It is four separate corner brackets floating in space with the cream background visible between them. The eyes and S-curve nose float inside the bracket frame with NO background fill, NO square, NO box behind them. Copy the head design from the reference images exactly: open bracket corners, not a filled square.

Scene: GainFrame Guy stands proudly beside a simple 8-week calendar with checkmarks across each week and a clean progress line finally rising upward. The mood is calm and satisfying, showing consistency paying off. Avoid readable text except the generated banner and subtitle.

CRITICAL PLACEMENT: The character and all props MUST be drawn completely within the BOTTOM 72% of the image. Leave the top 28% clear for the banner.

BANNER (TOP OF IMAGE):
- A solid BLACK rectangular bar spans the FULL WIDTH edge-to-edge from the very top.
- Square corners. NO rounded corners, NO pill shape, NO border.
- The bar is approximately 12-14% of total image height.
- Inside the bar, left-aligned: "#5" in bold Impact ALL CAPS, bright red (#E53935).
- Immediately to the right: "RUN IT 8 WEEKS" in bold white Impact ALL CAPS.
- The banner contains ONLY the number and title.

Below the banner, bold dark Helvetica-style subtitle text, center-aligned, reads: "Keep the core lifts stable. Adjust after you have real data."

TYPOGRAPHY: Bold Impact-style condensed sans-serif for banner title. Clean Helvetica-style sans-serif for subtitle. NO handwritten, script, or decorative fonts.

Clean off-white background (#F5F0EB). Clean cartoon style, thick outlines, flat colors. 4:5 TikTok format. No watermarks.
```

## Caption

```text
Changing your workout every week feels productive, but it usually just resets the clock. Pick the boring basics, run them long enough to measure, then adjust with actual data.

Save this before you rewrite your split again.

#gymtok #workoutsplit #programhopping #gymmistakes #fitnessadvice #gymlife #musclebuilding #consistency
```
