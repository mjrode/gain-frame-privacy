# October 15 SEO execution

Status: **approved, implemented and awaiting verified production release**. Owner approval: “Lets do all, both new articles and all four fixes.” Scope is P1–P2 and F1–F4 from the [October 14 audit](2026-10-14.md).

## New articles

- **P1: Withings BodyScan 2: Features, Costs and Tracking for Lifters** (`withings-body-scan-2`), cluster 3, targets `withings body scan 2`. Sourced model comparison, US ownership costs, country/subscription limitations, Apple Health and a practical photo-tracking bridge. No hands-on trial or universal accuracy claim. Its conceptual cover is labeled. Link destination: photo estimator and existing measurement hub. This is a discovery experiment; scale traffic has not established strong Store conversion.
- **P2: 75 Hard vs 75 Soft: Rules, Recovery and Tracking Your Progress** (`75-hard-vs-75-soft`), cluster 5 with cluster 4 support. Official 75 Hard rules, the commonly described 75 Soft variant, training/recovery considerations and repeatable photos. Links to photo setup and comparison tools. One adjacent experiment, without weight-loss guarantees or authorization for a broader series.

Both have 52-word Quick Answers, five visible/schema-matched FAQs and new WebP covers generated through the Image Generate workflow (Gemini 3.1 Flash Image Preview, estimated $0.039 each). No existing article publication dates were reset.

## Four fixes

1. **F1, photo activation:** estimator and transformation show the approved compact framing guide before choosing a file. Transformation quality/multiple-person rejections show the recovery guide. Existing safety handling, fresh picker, Blob fallback, retries, references/goals and CTA assignment are preserved. The shared transformation component also improves its existing body-measurements mode. Bounded diagnostics record input source (`file_picker`, `drop`, `reselect`) and preprocessing stage; recovery events carry the failed stage/source and eventual successful attempt. No filename, path, photo content or provider identifier is added.
2. **F2, commercial roundups:** `best-ai-body-fat-apps` and `best-body-fat-scanner-apps` now cover five verifiable US apps with current publisher screenshots, ratings and App Store links. GainFrame, Spren, trackBod, current Recomp AI and MeThreeSixty are present. The former bodyfatAI, Formfy and old Recomp IDs returned no US listing; they are not represented as current verified options. trackBod had no verifiable standalone publisher website in its returned listing, so its clearly labeled publisher App Store page is used. Offer wording is “Free download with limited check-ins. Optional Pro subscription; current price and limits are shown in the app.” Accuracy and privacy claims are qualified; FAQs/schema match. Product-context/writer-spec now distinguish legacy and flag-dependent current free tiers and selected-photo cloud analysis.
3. **F3, hardware trust:** original `hume-body-pod-review` and `withings-body-scan-review` distinguish original models from Pod 2.0 / BodyScan 2, separate current from historical prices, remove unsupported DEXA/superiority claims, explain limits and add photo-comparison bridges. Original Hume price is not asserted as current. Each has a 50-word answer and five matching FAQs. New-model specifications do not silently migrate to the original-model review.
4. **F4, existing 1RM tool:** removes a universal 2–3% accuracy promise and guaranteed averaging benefit; explains formula spread, adds 100 kg × 5 (unrounded Epley 116.7 kg / Brzycki 112.5 kg), discloses 0.5-unit display rounding, distinguishes strength tiers, adds five matching visible FAQs and the reciprocal strength-calculator link. Arithmetic JavaScript is unchanged. Browser result remains six-formula average 116 kg, Epley 116.5 kg and Brzycki 112.5 kg after existing display rounding.

## Contextual inbound links

| Destination | Existing source | Anchor |
|---|---|---|
| BodyScan 2 | `withings-body-scan-review` | what changes with BodyScan 2 |
| BodyScan 2 | `best-body-composition-scales` | BodyScan 2 features and ownership costs |
| BodyScan 2 | `best-smart-scales-apple-health` | BodyScan 2 and Apple Health |
| 75 Hard vs 75 Soft | `winter-arc-challenge` | 75 Hard vs 75 Soft |
| 75 Hard vs 75 Soft | `how-often-progress-photos` | photo tracking during 75-day challenges |
| 75 Hard vs 75 Soft | `take-progress-photos-by-yourself` | a consistent photo routine for 75 Hard or 75 Soft |
| 1RM calculator | `strength-standards` | estimate a one-rep max from a recent set |
| 1RM calculator | `beginner-intermediate-advanced-lifter` | track estimated one-rep max over time |

Touched source articles pass strict validation. Winter Arc's existing Article image schema was repaired to its canonical cover after the strict check exposed the mismatch; its protected title/description remain unchanged. Existing source metadata tests were not restarted by unrelated retitling.

## Verification

Global inventory: 274 articles, no missing covers, broken internal links or malformed JSON-LD. All 13 changed articles pass strict per-slug checks, including exact FAQ parity and required inbound links. No long dashes in those MDX files. TypeScript and all 148 tool tests pass, including bounded raw-fallback stages and revoked-file failure without an added retry loop. The shared-checkout production build passes. The final isolated `npm run build` passes against latest base `950bf340`, including the concurrent PlateLens edits. An initial Turbopack font error did not reproduce on the unchanged base or final release build; Webpack also passed. Release verification uses a temporary Codex-managed worktree containing the committed base plus only the selected changes; unrelated social, visualizer and experiment drafts are excluded.

Mobile preview at 390 × 844 confirms initial guidance on both photo tools, functional kg/lb calculator outputs, readable article layouts and horizontally contained comparison tables. No photo was transmitted to an AI backend during this check. Recovery behavior is covered by unit tests and code inspection; this does not establish native iCloud/HEIC success on a physical iPhone.

## Deployment and indexing

Pending. Record exact content commit, verified Cloudflare version/time, live URL checks, key-file check, per-engine IndexNow receipts and a fresh read-only GSC inspection sweep here after publication. Google requests remain manual.

## Google recrawl list

No Google indexing request has been sent. Paste these into Search Console URL Inspection → Request indexing after release:

- https://gainframe.app/blog/withings-body-scan-2/
- https://gainframe.app/blog/75-hard-vs-75-soft/
- https://gainframe.app/blog/best-ai-body-fat-apps/
- https://gainframe.app/blog/best-body-fat-scanner-apps/
- https://gainframe.app/blog/hume-body-pod-review/
- https://gainframe.app/blog/withings-body-scan-review/
- https://gainframe.app/blog/best-body-composition-scales/
- https://gainframe.app/blog/best-smart-scales-apple-health/
- https://gainframe.app/blog/winter-arc-challenge/
- https://gainframe.app/blog/how-often-progress-photos/
- https://gainframe.app/blog/take-progress-photos-by-yourself/
- https://gainframe.app/blog/strength-standards/
- https://gainframe.app/blog/beginner-intermediate-advanced-lifter/
- https://gainframe.app/tools/body-fat-from-photo/
- https://gainframe.app/tools/ai-body-transformation/
- https://gainframe.app/tools/body-measurements/
- https://gainframe.app/tools/one-rep-max-calculator/

## Measurement

Start from verified production release, not the audit or commit date. Assuming October 15 release: metadata hold ends October 25 at the exact release time. Photo activation: first complete week October 16–22, read October 23; fortnight October 16–29, read October 30. Separate estimator and transformation, input sources, error stages, recovery and downstream Store clicks. First complete content window October 16–November 12; read settled GSC around November 15. New posts reach 28 days on November 12.

Keep the fixed 79-post blog CTA cohort and treatment assignments intact. New posts do not join it automatically. October 15 editorial changes confound naive before/after CTA comparisons on the four rewritten pages; compare contemporaneous groups and report this intervention. F1 changes happen upstream of CTA exposure. September/October observation windows remain intact. No recurring automation was created.
