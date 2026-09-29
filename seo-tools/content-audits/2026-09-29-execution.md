# September 29 SEO execution

Status: approved via `All`; implementation and release checks complete locally, deployment pending.

## Approved scope

| Item | Result |
|---|---|
| P1 | `/blog/oxiline-vs-hume/`: original Body Pod vs MD Pro; no fabricated head-to-head test or accuracy winner. |
| P2 | `/blog/renpho-vs-withings/`: Elis 1 vs Body Smart, separating Wi-Fi upload from the Apple Health handoff. |
| P3 | `/blog/withings-body-smart-vs-body-comp/`: US model pricing, additional cardiovascular indicators, optional subscriptions. |
| P4 | `/blog/bod-pod-vs-dexa/`: methods, preparation and differing estimates; author DEXA report, no claimed BOD POD trial. |
| P5 | Approved but held: MacroFactor Workouts vs Hevy. The existing September 23 review reaches 28 days October 21; inspect settled data around October 24 before writing. No draft or URL created. |
| F1 | Existing 79-post cohort: editorial inline on iOS, sticky on desktop. Android keeps its stored/random assignment. New phase `ios_inline_desktop_sticky_v3_rollout`. |
| F2 | One Blob-byte fallback after FileReader failure; explicit reselection for unreadable handles; same-photo retry for retryable errors; preserve inputs; recovery telemetry; estimator-only low-evidence framing example. |
| F3 | Three approved contextual Winter Arc links added to the lifting-results, recomp-photo and before/after comparison articles. |

The four comparisons have generated WebP covers, matching schema/visible FAQs, 40-60-word Quick Answers, source citations, named tool/hub destinations, and all three approved contextual inbound links each. Product prices and capabilities were checked against current manufacturer documentation. Hume's changing offers are not presented as a fixed price. Supporting visuals use existing real app screenshots and the already-public author DEXA report.

Two older link-source articles required scoped schema/style repairs to satisfy the mandatory touched-post checks: visible FAQ/schema parity and long-dash cleanup. This is annotated alongside the link update rather than treated as a pure link-only experiment. Existing titles and keyword targets remain intact.

## Experiment boundaries

The September 11 randomized blog phase ends at the deployment stamped below. The new phase is a deterministic device rollout, not another randomized comparison. The device diagnostic was exploratory; no independently powered iOS/desktop experiment or install/revenue win is claimed.

Visual QA also reproduced desktop sticky clipping on production: at a 1440px viewport the card extended from x=720 to x=1880. A later stylesheet rule cancelled its centering transform. Explicit left/right centering fixes the card to x=140..1300. This rendering repair changes desktop exposure and must be annotated separately when interpreting before/after data. Copy and the fixed cohort are unchanged.

Body Visualizer's four arms, the shared Improve/Future result CTA test, in-app experiments, safety policy and rate limits are unchanged. The shared input helper is also used by other photo tools; the new recovery UI is confined to the estimator and transformation client, including measurements mode.

## Verification

- Global inventory: **272 posts**, no broken internal links, missing assets or malformed JSON-LD. Existing unrelated quality warnings remain outside this scope.
- All **16 new/modified articles** pass strict checks, including schema parity and no reader-visible long dashes. New Quick Answers: 50, 51, 52 and 50 words; six 40-70-word FAQs per new comparison.
- Production static export: **576 pages**, successful compilation and TypeScript checks. An isolated temporary source snapshot excluded unrelated dirty files. The latest remote `average-bicep-size` metadata change was incorporated before the final build.
- Tool tests: **145 passed**, none failed. TypeScript standalone check passed.
- Regression reproduction: the old helper fails a mocked FileReader `NotReadableError` with still-readable Blob bytes; the new helper recovers the exact bytes. A separately tested revoked handle remains non-retryable and releases its object URL. This is not physical Android-device certification or proof that every observed read failure has the same cause.
- Local browser tests used the production export and a temporary HTTP test wrapper. Only a generated illustration was selected; service responses were intercepted locally, with no image sent to an AI service. Reselecting the identical filename preserved `female` and reached a validated estimator result. Transformation 503 -> same-photo retry -> validated result preserved `female`, `build_muscle`, shoulders/arms and `strong` intensity.
- Low-evidence rejection displayed the framing example. A different rejection did not. A lifetime-limit response retained the existing limit screen without retry controls. Mobile tool screens had no horizontal overflow.
- Mobile comparison layout and overflow checked at 390px; tables scroll within their own container. Desktop sticky card verified at 1440px with its button and QR inside the viewport. iOS/desktop assignment and retained Android storage are covered by unit tests; a narrow desktop browser viewport is not a physical iPhone test.
- No fresh controlled Core Web Vitals study was performed. No dependencies were added; the existing CTA asset and implementation are reused. Treat post-release performance, exceptions and downstream joins as guardrails to observe, not already established causal results.

## Deployment and indexing

Pending release verification. Only exact selected files will be committed; unrelated comic, Visualizer styling, mockup and prior analytics changes remain in the shared checkout. Generated blog index/grid will come from the selected production snapshot.

Manual Google request candidates after launch:

- https://gainframe.app/blog/oxiline-vs-hume/
- https://gainframe.app/blog/renpho-vs-withings/
- https://gainframe.app/blog/withings-body-smart-vs-body-comp/
- https://gainframe.app/blog/bod-pod-vs-dexa/

IndexNow acceptance is a notification receipt, not proof of crawling or indexing. Google is not an IndexNow participant. Do not use Google's restricted Indexing API for these articles.

## Measurement

First complete post-release week: September 30-October 6, settled search read around October 9. Review recovery by distinct successful attempt joined to failed attempt, browser/OS, retry versus reselection, and downstream Android email actions. Do not equate a recovery start with a result.

New comparisons reach 28 days October 27; use full post-release days and settled GSC around October 30. Keep each comparison's distinct intent, check cannibalization against the parent reviews, and report onward tool use and actual Store clicks separately from search traffic. Preserve existing September 21/23/24 metadata holds.
