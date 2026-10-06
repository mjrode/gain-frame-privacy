# October 6 SEO execution

Status: **implementation validated; deployment pending**, following owner approval via `All`.

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

Pending exact release commit, Workers version, deployment timestamp and live checks.
IndexNow will be submitted after all six affected URLs return 200 and the public key matches exactly. Google requests are manual; acceptance by another engine does not prove recrawling.

Manual Google recrawl list:

- https://gainframe.app/tools/body-visualizer/
- https://gainframe.app/blog/body-fat-visible-jawline-men/
- https://gainframe.app/blog/skinny-fat-to-muscular/
- https://gainframe.app/blog/average-hip-size-women/
- https://gainframe.app/blog/average-waist-size-men/
- https://gainframe.app/blog/ideal-body-measurements-men/

## Measurement

The verified deployment starts the new visualizer phase and ten-day jawline metadata hold. First full rollout week: October 7-13; first two weeks: October 7-20. Review exposures, web clicks, errors, QR visibility and exact native arrivals separately by platform. QR visibility is not a scan. Full content read: October 7-November 3, settled GSC around November 6. Source-article editorial cleanup accompanies F4, so this is not a pure link-only causal test. No recurring automation was created.
