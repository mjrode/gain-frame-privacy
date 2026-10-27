# October 27 SEO publication and conversion repair

**Status:** Published and verified, including the supporting CTA copy follow-up.
**Approval:** Owner requested all missing ten articles, ChatGPT body-fat and lagging-muscle coverage, existing gym-progress improvements and all proposed fixes. The earlier review gate is satisfied.
**Audit:** [Performance, historical conversion and ten-topic research](2026-10-27.md).

## What already existed, and what was written

All ten proposed standalone URLs were absent. Related pages existed, so the new articles keep the boundaries below. The two general gym-progress owners were refreshed instead of creating another competing URL.

| New article | Existing coverage and ownership boundary |
|---|---|
| [Hevy review](https://gainframe.app/blog/hevy-app-review/) | Hevy vs Strong and the integration guide existed; neither owned a standalone Hevy evaluation. |
| [Hume alternatives](https://gainframe.app/blog/best-hume-body-pod-alternatives/) | The Hume review and broad InBody alternatives existed; the replacement-selection intent did not. |
| [Fitbod review](https://gainframe.app/blog/fitbod-app-review/) | Fitbod comparisons existed; no standalone review. |
| [Runstar scale review](https://gainframe.app/blog/runstar-scale-review/) | Mentioned in broader scale coverage; no model-specific standalone review. |
| [MacroFactor vs MyFitnessPal](https://gainframe.app/blog/macrofactor-vs-myfitnesspal/) | MacroFactor review and Cronometer comparison existed; no dedicated direct pairing. |
| [Garmin Index S2 review](https://gainframe.app/blog/garmin-index-s2-review/) | Broad scale coverage existed; no exact-model review. |
| [DEXA body-composition scan cost](https://gainframe.app/blog/dexa-scan-cost/) | DEXA explanations and alternatives existed; no current fitness-appointment cost guide. |
| [InBody score explained](https://gainframe.app/blog/inbody-score-explained/) | InBody vs DEXA and alternatives existed; no score interpretation guide. |
| [InBody H30 vs H40](https://gainframe.app/blog/inbody-h30-vs-h40/) | Broad home-scale coverage existed; no exact-model comparison. Both current US listings were verified, clearing the earlier hold. |
| [Boostcamp review](https://gainframe.app/blog/boostcamp-app-review/) | Workout app roundups existed; no standalone Boostcamp review. |
| [ChatGPT body-fat estimate guide](https://gainframe.app/blog/chatgpt-body-fat-percentage/) | New user-requested image-prompt workflow; distinct from general AI-coach and photo-estimation guides. |
| [Identify lagging muscle groups](https://gainframe.app/blog/how-to-identify-lagging-muscle-groups/) | New user-requested visual and training-record checklist; distinct from physique-score definitions and general gym-progress tracking. |

The additional user-requested themes are relevance tests, not high-volume promises. Fresh US keyword lookup returned 50/month for the exact ChatGPT body-fat percentage phrase (KD3; annual decline), 40 for gym progress, and 10 for lagging muscles. The original ten have separate dated demand/intent evidence in the audit; broad DEXA demand includes irrelevant diagnostic/equipment queries.

## Existing pages and conversion repairs

- Refreshed [muscle-gain progress tracking](https://gainframe.app/blog/how-to-track-muscle-gain-progress/) and [signs of building muscle](https://gainframe.app/blog/signs-you-are-building-muscle/). Photos, training logs, weight and measurements are interpreted together; removed deterministic growth promises and photo-estimated tissue claims.
- Rebuilt [transformation apps](https://gainframe.app/blog/best-body-transformation-apps/) with six real screenshots and current US listings, dated ratings, current free/paid boundaries and a prominent photo-comparison tool link. Corrected Recomp's ongoing 3D comparisons; identified SnapTrack's legacy status. Retained original URL/publication date.
- Repaired [body editor comparison](https://gainframe.app/blog/ai-body-editor-apps-vs-real-analysis/) around Peachy, Facetune and Body Editor with verified current listings and screenshots. Removed unsupported prediction, genetics and editor-detectability claims. The comparison distinguishes edited images, generated illustrations and dated original-photo records.
- Corrected the scanning guide's GainFrame offer/rating and two article CTA proof strings. Preserved the scanning guide's metadata and broader content intervention.
- Fixed desktop card activation at the first H2 crossing 40% of viewport height. Pixel observer margin, resize handling, frame-coalesced passive scroll fallback and cleanup prevent skipped triggers and reopening after activation. Existing rollout assignment and exposure semantics remain unchanged.
- Added the approved contextual links into all twelve new articles and six mature-source links into existing commercial guides. Necessary source schema, FAQ parity, stale-claim and dash repairs accompany those edits. This is not a new site-wide factual audit.

## Evidence and editorial limits

The new product articles are researched evaluations using current primary documentation and developer imagery. No personally performed device-accuracy trials or competitor app tests are claimed. Current storefront prices are dated; unavailable Garmin current US pricing is explicitly unavailable, with historical launch MSRP labeled as historical. Photo analysis remains estimated feedback and does not diagnose weakness or establish muscle tissue gained. New images include generated illustrative covers plus inspected publisher screenshots/product images and clearly labeled diagrams.

Original comparative trials proposed in the traffic-recovery review remain future evidence work: no consenting-subject competitor capture study, historical-import task or real image-lineage experiment was performed. They are not represented as completed results.

## Validation and release

Exact-source production build passed (590 static pages) after fixing one unmatched legacy MDX closing tag and clearing the interrupted temporary build cache. All 46 touched articles pass strict inventory checks and compile with production MDX options; global inventory is 286 posts with no broken links, missing assets or malformed JSON-LD. Twelve new articles have at least three contextual inbounds each. Live parity passed for all 46 pages and 52 assets (98/98). All twelve new URLs are in the live sitemap. Local tools suite: 157/157 passed, including nine new sticky-trigger regressions; the combined focused CTA suite contains 25 tests. Production browser at 1280 x 720: card absent before trigger, visible after scrolling past the first H2, dismissible and stays dismissed while continuing to read. Reload starts a new page view and rearms the trigger; dismissal is not persisted across reload. The published ChatGPT guide has no horizontal overflow at 390px. Full evidence is retained locally under `analytics/raw/2026-10-27/seo-cycle/writing/`.

## Deployment and indexing receipts

- Content commit: `7ea85a0f0ae4626fe9837a3b87cab712b91bfaab`, pushed to `main` through the normal automatic Workers build.
- Production boundary: **2026-10-27 15:13:37.791071 UTC**. Deployment `5df57756-1f7b-4a35-bda7-f7d0117134a5`, Worker version `d2a7afc7-f55a-48cd-a04f-6902865e34e9` at **100%**, annotated with the exact content commit. All five remote checks passed.
- Live parity at 15:13:58 UTC compared titles, canonical/social metadata, JSON-LD, links and visible text for 46 articles, plus exact bytes for 52 images. **98/98 passed**. Sitemap verification at 15:17:14 UTC found all twelve new URLs.
- Final review corrected one additional legacy CTA paragraph in `chatgpt-workout-plan`: removed a plan-outcome guarantee and “no subscription required,” replacing them with limited check-ins and optional Pro. Strict check, production MDX compilation and the full production build passed. Follow-up commit `d9a9d0ff7f905b8794e736ee3e10b276cb57caf1` deployed **October 27 at 15:23:21.690415 UTC**, Worker version `72e87d29-4715-4964-b8c2-1e6ef1ae2ad3` at 100%. All five checks passed; final live parity at 15:24:02 UTC passed **98/98** again. This is a copy correction to a supporting source, not another article or a fresh metadata intervention.
- IndexNow key returned HTTP 200 with the exact 32-byte key. All 46 updated URLs submitted: **Yandex 202, Seznam 200, Naver 200** accepted; **Bing 403 and aggregator 403** returned `UserForbiddedToAccessSite`. The Bing authorization issue persists; do not describe all five as submitted successfully. IndexNow acceptance does not guarantee indexing. After the supporting CTA correction went live, its URL was submitted again: Yandex/Seznam/Naver 200; Bing/aggregator 403 (receipt: `writing/followup-indexnow-results.txt`).
- Post-release read-only GSC inspection: **98 URLs: 85 submitted/indexed, 12 unknown to Google, one crawled/currently not indexed**. All twelve unknown URLs are the new articles, with no crawl recorded yet. The single existing exception is `/tools/one-rep-max-calculator/`, last crawl **August 21 at 20:42:35 UTC**, predating its October 15 repair. No blanket indexing failure or new repair follows from that unchanged crawl.
- Google request indexing remains manual. The exact 17-URL list below is ready for Search Console; no Google indexing request was submitted by the API, and no sitemap resubmission was needed.

Receipts: `writing/deployments-latest.json`, `remote-checks.json`, `live-verification.json`, `sitemap-verification.json`, `indexnow-key.json`, `indexnow-results.txt`, `post-release-inspection.json`, `desktop-cta-production.png` `followup-build.log`, `followup-deployment.json` and `followup-remote-checks.json` under the local evidence directory above.

## Measurement contract

Use **October 27 at 15:13:37 UTC** as the content and CTA intervention boundary. Hold this batch's changed metadata through **November 6 at 15:13:37 UTC**. First complete new-content window: **October 28-November 24**; read settled GSC around **November 27**. The supporting CTA copy follow-up does not restart metadata or article-age clocks. No expected traffic or download lift is asserted. Read GSC clicks/impressions/query ownership, ordered article-landing session to tool/result/Store reach, exact attributed native arrivals, and Apple first-time downloads as separate measures. Native arrival is not proof of a first-time download. Apple Web Referrer includes all referring websites and does not attribute to an article.

Respect the recorded October 15/22 destination metadata schedules and ongoing content windows; annotate this release's links and global CTA repair as additional interventions. Do not claim a clean causal before/after estimate. New articles need a full 28-day discovery window, then settled GSC data, before expanding the adjacent-topic batch. Source-link edits do not recertify every legacy claim: older photo-estimation thresholds, benchmark language and broad scale-accuracy assertions remain separate editorial debt.

## Google request-indexing list

IndexNow does not submit to Google. Submit these after the live check through Search Console URL Inspection when manual requests are available:

- https://gainframe.app/blog/hevy-app-review/
- https://gainframe.app/blog/best-hume-body-pod-alternatives/
- https://gainframe.app/blog/fitbod-app-review/
- https://gainframe.app/blog/runstar-scale-review/
- https://gainframe.app/blog/macrofactor-vs-myfitnesspal/
- https://gainframe.app/blog/garmin-index-s2-review/
- https://gainframe.app/blog/dexa-scan-cost/
- https://gainframe.app/blog/inbody-score-explained/
- https://gainframe.app/blog/inbody-h30-vs-h40/
- https://gainframe.app/blog/boostcamp-app-review/
- https://gainframe.app/blog/chatgpt-body-fat-percentage/
- https://gainframe.app/blog/how-to-identify-lagging-muscle-groups/
- https://gainframe.app/blog/how-to-track-muscle-gain-progress/
- https://gainframe.app/blog/signs-you-are-building-muscle/
- https://gainframe.app/blog/best-body-transformation-apps/
- https://gainframe.app/blog/ai-body-editor-apps-vs-real-analysis/
- https://gainframe.app/blog/best-body-scanning-measurement-apps/
