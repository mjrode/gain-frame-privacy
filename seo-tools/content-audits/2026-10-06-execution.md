# October 6 SEO execution

Status: **shipped and verified October 6, 2026, 13:16:11 UTC**, following owner approval via `All`.

## Approved scope

- **F1:** Body Visualizer uses the existing Personal analysis treatment for eligible iOS and desktop visitors. Deterministic phase `analysis_rollout_v2`; historical `four_treatments_v1` decision snapshot frozen at October 6, 12:04:08 UTC. Android email, shared Improve/Future, direct/QR campaign attribution and forced QA exclusions remain intact.
- **F2:** `body-fat-visible-jawline-men` has the approved title/description, a 49-word Quick Answer and five matching 40-70-word FAQs. Precise jawline thresholds, face-type targets and numerical deadlines were removed throughout the prose, tables, captions and schema. It still links to the body-photo estimator with its explicit inability to measure face fat, and retains the separate face-fat sibling.
- **F3:** `skinny-fat-to-muscular` has a 51-word Quick Answer, seven matching 40-70-word FAQs and matching HowTo steps. Training/nutrition guidance now avoids stored-fat growth guarantees and fixed transformation deadlines; weight is correctly described as total mass. The contextual anchor **compare standardized progress photos** points to `/tools/progress-photo-compare/`. Title and description wording remain, with required dash punctuation cleanup; the Twitter description's explicit scale-lies claim was corrected. Unsubstantiated photo-accuracy promises were removed from the touched CTA/captions.
- **F4:** Contextual links to `/blog/average-thigh-size/` use the approved anchors: **average thigh and calf measurements** in `average-hip-size-women`, **thigh circumference reference** in `average-waist-size-men`, **average thigh and calf sizes** in `ideal-body-measurements-men`. Four contextual inbounds now include the existing `how-to-take-body-measurements` link. Target article and metadata are unchanged. The hip source needed long-dash cleanup; the proportions source needed its Article description synchronized with existing frontmatter.

No new post, asset, dependency or tool was created. MacroFactor Workouts vs Hevy remains held to the October 21 age gate / around October 24 settled read.

## Frozen experiment decision

Mature 24-hour web clickers: Analysis **286/2,032 (14.07%)**, Direct **47/2,196 (2.14%)**, Progress **128/2,164 (5.91%)**, Future **66/2,114 (3.12%)**. All four arms exceeded 1,600 mature viewers after 20.69 days. Analysis versus Direct clears the registered adjusted comparison; SRM p=.0806. Excluding all-event crossovers leaves Analysis **286/2,032**, Direct **47/2,195**. The new phase is a deterministic rollout, not another randomized test. Sparse native joins establish no install or paid lift.

Frozen evidence: `analytics/raw/2026-10-06/seo-cycle/visualizer.json` and the `posthog/visualizer_*` aggregate receipts. Old open tabs may emit v1 after release; never pool phases or replace this snapshot with a later report run.

## Verification

- Global inventory: **272 posts**, no broken internal links, missing assets or malformed JSON-LD. All **five modified articles** pass strict checks with zero long dashes. Unrelated corpus warnings remain outside this scope.
- **142 tool tests passed**, including new deterministic/forced assignment tests and existing link/QR contracts. **10 visualizer report tests passed**.
- Selected-source production build: **576 static pages**, compilation and TypeScript checks passed. It excludes unrelated dirty comic files, Visualizer styling and untracked routes. Generated blog search index came from that snapshot.
- Browser checks: desktop at 1440px shows the Analysis card and QR within the workspace; both direct and QR link payloads retain `web-body-visualizer`, the v2 placement and separate UUID keys. Local preview is forced. A 390px test with an injected iPhone user agent shows Analysis without QR; injected Android shows the existing email form and no experiment attributes. These are browser branch checks, not physical-device certification. No email was submitted.
- Both repaired articles render at 390px without horizontal page overflow. Quick Answer and FAQ content are visible, the photo-comparison link resolves to the approved tool, and no browser console errors were observed in these checks.
- Read-only source verification used primary publications for facial morphology/soft-tissue variation and the cited recomposition trial. No personal transformation or product accuracy study was fabricated.

## Deployment and indexing

Release commit: `15ef1dc912dbfc3c4ba812a2d5f378323fb14a1f`. Workers deployment **100%** version `a13c8ee5-e9eb-4dc6-a29e-72f9b83ea518` at **2026-10-06T13:16:11.009384Z**, annotated with that exact Git revision. Workers Builds and all GitHub build/deploy/Pages checks succeeded. This is the phase boundary; a later records-only commit does not restart it.

All **six affected URLs return 200** with correct canonicals. The approved jawline metadata, both new Quick Answers, photo-comparison link and three thigh links are present. Live JavaScript contains `analysis_rollout_v2`; the live browser shows unforced Analysis with no QA controls, and no console errors. The public blog search index matches selected source bytes. The public IndexNow key is an exact 32-byte match with no newline. Screenshot: `analytics/raw/2026-10-06/seo-cycle/execution/visualizer-live.png`.

IndexNow submitted these six URLs at October 6, 13:17 UTC: **Yandex 202, Seznam 200, Naver 200 accepted**. **Bing and api.indexnow.org returned 403 UserForbiddedToAccessSite**, continuing the existing site-authorization failure. The helper log and repository's ignored CSV both recorded each endpoint. Acceptance is a notification receipt, not evidence of crawling.

The post-release Search Console sweep inspected **59 distinct URLs, all PASS / Submitted and indexed**, including all six updated pages and the original 54-page sample. Existing crawl timestamps do not establish that Google has fetched today's revisions. No Google indexing request was sent. No sitemap resubmission was needed.

Exact deployment, live checks, browser evidence, engine receipts and Search Console results are saved under `analytics/raw/2026-10-06/seo-cycle/execution/`. The temporary selected-source build and its separate dependency installation were removed after verification; unrelated working-copy changes remain untouched.

Manual Google recrawl list:

- https://gainframe.app/tools/body-visualizer/
- https://gainframe.app/blog/body-fat-visible-jawline-men/
- https://gainframe.app/blog/skinny-fat-to-muscular/
- https://gainframe.app/blog/average-hip-size-women/
- https://gainframe.app/blog/average-waist-size-men/
- https://gainframe.app/blog/ideal-body-measurements-men/

## Measurement

The verified deployment starts the new visualizer phase. Preserve jawline metadata through **October 16 at 13:16:11 UTC**. First full rollout week: October 7-13; first two weeks: October 7-20. Review exposures, web clicks, errors, QR visibility and exact native arrivals separately by platform. QR visibility is not a scan. Full content read: October 7-November 3, settled GSC around November 6. Source-article editorial cleanup accompanies F4, so this is not a pure link-only causal test. No recurring automation was created.
