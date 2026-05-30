# Onboarding step-by-step drop-off (PostHog, last 90d, unique users)
Pulled 2026-05-29. Event `onboarding_step_viewed` by `step_name`.
Anchors: Installed 1729 → onboarding_started 1655 → onboarding_completed 1011. onboarding_abandoned 894.

## Main linear flow (steps live since 2026-03-26), ordered by sequence
| # | Step | Users | % of welcome | Step drop |
|---|------|------:|-----:|-----:|
| 1 | welcome | 1638 | 100% | — |
| 2 | goal | 1543 | 94.2% | **−95** (first-question bail) |
| 3 | desiredOutcome | 1526 | 93.2% | −17 |
| 4 | primaryObstacle | 1510 | 92.2% | −16 |
| 5 | healthKit | 1497 | 91.4% | −13 |
| 6 | gender | 1488 | 90.8% | −9 |
| 7 | bodyStats | 1461 | 89.2% | −27 |
| 8 | age | 1431 | 87.4% | −30 |
| 9 | goalWeight | 1430 | 87.3% | −1 |
| 10 | poseSetup | 1423 | 86.9% | −7 |
| 11 | **importPhotos** | 1302 | 79.5% | **−121  ← biggest cliff (photo ask)** |
| 12 | baselineReveal | 1260 | 76.9% | −42 |
| 13 | **notifications** | 1150 | 70.2% | **−110  ← notif permission prompt** |
| 14 | deepDivePreview | 1138 | 69.5% | −12 |
| 15 | **account** | 1085 | 66.2% | **−53  ← sign-up friction** |
| 16 | finish | 1032 | 63.0% | (≈ onboarding_completed 1011) |

**~37% drop welcome→finish.** ~4 steps cause most of it: importPhotos (−121), notifications (−110), welcome→goal (−95), account (−53) = ~379 of ~606 lost.

## NOT drop-off — newer/conditional steps (don't misread low counts)
| Step | Users | first_seen | Why low |
|------|------:|-----------|---------|
| attributionSource | 1046 | 2026-04-22 | added late Apr — shorter window |
| futureYouReveal | 634 | 2026-04-21 | added late Apr |
| hevyOptIn | 806 | 2026-04-30 | added end Apr (also likely optional) |
| coachPrimer | 187 | 2026-05-14 | **added mid-May (~2wks old)** — Coach IS now in onboarding |
| coachDemo | 178 | 2026-05-14 | added mid-May |
| expectation / widgetStep1 / widgetStep2 | 493 / 367 / 173 | 2026-03-26 | original but conditional/optional (widget setup, etc.) |
| moatExplainer | 2 | 2026-05-06 | effectively unused |
