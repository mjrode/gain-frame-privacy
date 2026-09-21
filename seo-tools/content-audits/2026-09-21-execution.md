# September 21 customer-intent SEO execution

**Status:** All ten approved improvements are published and verified. The owner explicitly accelerated F4 to September 21 after the first nine shipped.

The owner approved all ten items in the [research and proposal](2026-09-21.md). This release improves existing URLs rather than creating competing articles. The owner subsequently waived the F4 date gate; [its separate release receipt](2026-09-21-f4-execution.md) records the actual deployment.

| ID | Existing destination | Implemented change |
|---|---|---|
| F1 | `/blog/understanding-ai-physique-score/` | Real app report, numbered field explanation, clearer score interpretation and distinction between app and web labels. |
| F2 | `/blog/take-progress-photos-by-yourself/` | Broader how-to intent, repeatable camera diagram, poses, lighting illustration and direct comparison workflow. |
| F3 | `/blog/best-free-progress-photo-apps/` | Verified free-feature boundaries, current ratings and screenshots, corrected legacy listings, mobile comparison matrix and free browser comparison route. |
| F5 | `/blog/best-progress-photo-apps/` | Current evidence for five options, screenshots, practical selection criteria and corrected free/paid claims. |
| F6 | `/blog/best-body-tracking-apps/` | Clearer physique-tracking selection criteria, current app evidence and links to assessment/comparison tools. |
| F7 | `/blog/progress-photo-poses/` | Original pose contact sheet, printable image and repeatable front/side/back instructions. |
| F8 | `/tools/progress-photo-setup/` | Correct canonical App Store destination, tracked source/content attributes, accurate free-access copy and comparison link. |
| F9 | `/blog/how-often-progress-photos/` | Capture versus review guidance, practical 12-week schedule and optional weekly capture without promising weekly visible change. |
| F10 | `/tools/physique-rater/` | Static illustrative report and clearer interpretation, privacy and free-access explanations. Upload/scoring client unchanged. |
| F4 | `/tools/progress-photo-compare/` | **Shipped September 21 in `f1e92985`.** Demo, optional export date labels and approved metadata changes, accelerated by explicit owner request. |

Six existing articles add contextual inbound links: `5-tips-better-progress-photos`, `how-to-track-muscle-gain-progress`, `best-body-transformation-apps`, `body-composition-pictures`, `physique-rating-scale`, and `best-body-recomposition-apps`. Required touched-source FAQ/schema/style corrections accompany those links. An existing broken Smart Import image path was repaired in the five-tips article. Two setup-tool illustrations returned 404 on production; their existing artwork is now served as WebP from the public asset tree.

## Evidence and scope

- [Dated app evidence](2026-09-21-app-evidence.md): official listings, sites and screenshots. App ratings are US storefront snapshots, not testing claims.
- Three original illustrations support the setup and pose guides. App screenshots are real product captures; captions identify their source.
- AI analysis sends selected photos for inference; the app photo library stays on the device. Public copy no longer promises a universal 25-photo free tier.
- Existing tool/blog CTA experiment assignments, allocations and client logic remain unchanged. Content changes are annotated in both experiment records. Static sample content does not emit personal tool-result events.
- No new URLs, no changed comparison-tool files, no changes to unrelated work in the shared checkout.

## Validation

- Production build of an isolated snapshot containing committed HEAD plus only this release's selected sources: passes, 555 routes.
- 28 existing CTA, destination-context and archive tests pass.
- All 13 touched articles pass strict inventory, structured-data and style validation. Quick Answers and FAQ schema match the visible content.
- Global inventory: 256 posts, no broken internal links or missing covers. Existing unrelated warnings are not counted as new regressions.
- Desktop and 390px phone checks cover article illustrations, caption sizing, comparison table overflow, setup Store destination and the rater's illustrative report.
- Rendered output: all 15 changed pages exist; all 147 local image references resolve. Phone layout has no document overflow, and the comparison matrix scrolls inside its container. All 15 live pages returned 200 with the new content marker. All 24 added images returned 200 and matched the committed bytes.

## Release and indexing

- Release commit: `ed96f82179de10e19f0cf8b26a4a5bfed87309a2`.
- Live at **September 21, 2026, 13:05:01 UTC** (9:05am Eastern). Worker version `2d757ab8-c762-487c-8a9a-7295a919311e`, 100% traffic, exact Git annotation verified. [Deployment receipt](receipts/2026-09-21/deployment.json).
- All five repository/build/deployment checks completed successfully. [Live URL and image checks](receipts/2026-09-21/live-check.json).
- IndexNow key returns 200 and exactly the 32-byte key. All 15 changed URLs submitted. **Yandex 202, Seznam 200 and Naver 200; Bing and the Microsoft aggregator 403** with the existing site-verification error. [Submission receipt](receipts/2026-09-21/indexnow.txt). Bing Webmaster Tools verification remains outstanding.
- Fresh Google inspection: **88/89 PASS**, including all 15 changed URLs. The repeated 88-URL research sample remained 87 PASS; one additional changed source page also passed. [Inspection receipt](receipts/2026-09-21/google-inspection.json).
- **Crawled - currently not indexed:** none in this sample. **Discovered - currently not indexed:** none. **Unknown / too new:** `/tools/lean-body-mass-calculator/`, published September 16, remains unknown at five days. Its first full window ends October 14; review settled data around October 17.

An IndexNow receipt is not proof of indexing, and a Google inspection pass does not establish that the latest rewrite has been recrawled.

## Measurement dates

Freeze changed titles/descriptions through **October 1, 13:05 UTC**. Use September 22-October 19 as the first complete 28-day post-release window, with a settled read around October 22; exclude the partial September 21 deployment day. A matched pre-period is August 24-September 20, to be read once final. These windows differ intentionally from the initial rolling research windows.

The September 11 CTA experiment clocks remain unchanged. Annotate this content release at 13:05:01 UTC and split sensitivity reads around it. F4's later September 21 release is recorded separately; new comparison-tool inbound links already changed on September 21. Continue reporting organic landings, personal tool results, iOS Store clicks and Android email submissions separately. Store clicks do not prove installs or paid subscriptions.

## Google: manual recrawl requests

Search Console → URL Inspection → Request indexing. These are existing pages; request the primary destinations first if the daily manual quota is reached.

```text
https://gainframe.app/blog/understanding-ai-physique-score/
https://gainframe.app/blog/take-progress-photos-by-yourself/
https://gainframe.app/blog/best-free-progress-photo-apps/
https://gainframe.app/blog/best-progress-photo-apps/
https://gainframe.app/blog/best-body-tracking-apps/
https://gainframe.app/blog/progress-photo-poses/
https://gainframe.app/blog/how-often-progress-photos/
https://gainframe.app/tools/progress-photo-setup/
https://gainframe.app/tools/physique-rater/
https://gainframe.app/blog/5-tips-better-progress-photos/
https://gainframe.app/blog/how-to-track-muscle-gain-progress/
https://gainframe.app/blog/best-body-transformation-apps/
https://gainframe.app/blog/body-composition-pictures/
https://gainframe.app/blog/physique-rating-scale/
https://gainframe.app/blog/best-body-recomposition-apps/
```

F4 shipped September 21 after the owner explicitly waived its date gate. The follow-up heartbeat `ship-gainframe-photo-comparison-upgrade` is paused. Demo use remains separate from personal upload/result metrics.
