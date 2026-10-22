# October 22 SEO execution

Status: **shipped and verified October 22, 2026 at 22:31:40 UTC**. Owner approval: **“all”**, covering F1 and F2 from the [October 22 audit](2026-10-22.md). Three existing articles were repaired; no new article or URL was added.

## Approved repairs

- **F1, `bulk-cut-or-recomp` (cluster 5 hub):** preserves the existing title and URL, replaces universal body-fat/FFMI rules and guaranteed outcomes with a goal, recovery and repeated-measurement framework. FFMI is estimated fat-free mass adjusted for height; photo-derived increases cannot prove muscle gain. A five-step choose/baseline/plan/review/adjust workflow matches HowTo schema. Links support the existing Recomp Reality Checker and Progress Photo Compare.
- **F2, `visceral-fat-appearance` (cluster 7 appearance owner):** explains why belly shape, firmness, pinching and photos cannot measure internal fat. Waist thresholds are risk screening with scope and context; android fat and modeled DXA VAT estimates are distinct. Removed unsupported diagnosis, scan schedules/prices and photo-proxy claims.
- **F2, `visceral-fat-vs-subcutaneous-fat` (cluster 7 comparison owner):** distinguishes anatomical compartments, normal tissue roles and measurement limits. Removed depot-specific loss timelines and treatment-effect rankings. Photos document external appearance; neither a photo nor waist change quantifies the internal compartment. A contextual link supports the separate appearance owner.

Each article has its exact approved **50-word Quick Answer**, synchronized title/description/social/Article fields, five visible FAQs of 40–70 words with matching FAQPage schema, correct author/publisher/canonical contracts, and the canonical App Store destination. April 25 publication dates are preserved; modification date is October 22. Source verification uses the posts' own primary research and official NIDDK/NICE guidance. The studies are not represented as validation of GainFrame or its photo estimates.

All ten existing image files remain. Captions and alt text now describe their content and limits. Visual QA corrected the appearance cover's inaccurate anatomical description and removed the redundant `coverImage` field from all three frontmatters because the renderer was showing it alongside each existing body hero. Each page now renders one cover. No shared component or style changes were needed.

## Contextual links

| Source | Exact anchor | Destination |
| --- | --- | --- |
| bulk-cut-or-recomp | compare your recomp tracking signals | `/tools/recomp-reality-checker/` |
| bulk-cut-or-recomp | compare standardized progress photos | `/tools/progress-photo-compare/` |
| visceral-fat-appearance | compare external changes in consistent photos | `/tools/progress-photo-compare/` |
| visceral-fat-vs-subcutaneous-fat | why appearance cannot identify visceral fat | `/blog/visceral-fat-appearance/` |
| visceral-fat-vs-subcutaneous-fat | compare external appearance over time | `/tools/progress-photo-compare/` |

Post-release inventory has 28 inbound sources / 22 contextual for the recomp hub, 2 / 1 for appearance, and 8 / 5 for the comparison. The appearance page now has its first contextual inbound source. Existing separate intents remain intact.

## Validation

Global inventory passes: **274 posts, 1,580 internal blog links**, no broken links, missing covers or malformed JSON-LD. All three strict slug checks pass; each has zero schema-contract issues and zero long dashes. Sitewide legacy issue counts fall from 35 to 32 Quick Answer issues, 61 to 58 schema-contract issues and 152 to 149 posts with long dashes; unrelated issues remain outside this repair.

The final isolated **production build passes**, including TypeScript and all 578 generated routes. Six blog-index tests pass. Compiled title, descriptions, canonical, exact answer and every source JSON-LD block match the approved files. Mobile browser QA at 390 × 844 confirms one cover, readable layout and comparison tables contained in horizontally scrolling wrappers; page width remains 390. Desktop recomp tables fit their 860-pixel content wrapper. The modified generated file is `web/public/blog-index.json`; the initial extracted card grid is unchanged.

Verification used a temporary Codex-managed worktree at base `8edb1cd8` with only the three approved MDX files copied in. Dependencies and build outputs stayed there. The four-file content commit excludes unrelated social assets, visualizer styles, skill changes, drafts and older strategy edits. Baseline hash checks confirm the unrelated tracked files are preserved.

## Deployment and indexing

Content release commit: **`7b3b3cb93cb54b19e2520c59f58a63c629f5c13a`**. Cloudflare Workers version **`decabe69-1708-4976-a320-223981d98307`**, **100%**, deployed **2026-10-22T22:31:40.720784Z**. All five remote checks succeeded. A later records-only commit does not restart this content-release boundary.

All three URLs return 200. Their title, descriptions, canonical, JSON-LD, links and normalized visible content match the verified export exactly, checked at **22:32:04 UTC**. The live blog index matches the validated bytes. The appearance page was also verified in the production browser, including its corrected title, answer, single cover and caption. Raw execution receipts: `analytics/raw/2026-10-22/seo-cycle/execution/`.

The public IndexNow key returns **200 and exactly 32 bytes without a newline**. **Yandex 202, Seznam 200 and Naver 200** accepted all three URLs. **Bing and api.indexnow.org returned 403 UserForbiddedToAccessSite**, the existing site-authorization issue. Acceptance is notification, not proof of crawling or indexing. Google is not part of IndexNow; no Google indexing request or sitemap resubmission was sent.

Post-release read-only GSC sweep finished **October 22 at 22:33:46 UTC**: **82 URLs, 81 PASS, 1 NEUTRAL, zero unavailable/errors**. The same 23 tools and 59 article/watch URLs were inspected, preserving the original review snapshot.

- **All three repaired pages are indexed and self-canonical**, but their recorded crawls predate this release: recomp October 19 at 21:22:13 UTC; appearance September 26 at 09:17:54 UTC; comparison October 16 at 03:59:32 UTC. These verdicts do not establish that Google has fetched today's copy.
- **Crawled, currently not indexed:** `/tools/one-rep-max-calculator/`, still last crawled August 21 at 20:42:35 UTC. Fetch successful, indexing allowed, canonical correct, sitemap present. The October 15 quality/FAQ/link repair is already live. Request a fresh crawl and verify its timestamp advances before judging that repair; no additional speculative rewrite was approved here.
- No discovered-not-indexed or unknown URLs were returned. Both October 15 new posts remain indexed, with their existing November 12 age / November 15 settled-read gates intact.

Compact durable receipts are saved in `seo-tools/content-audits/receipts/2026-10-22/`. The preview server is stopped. Archiving of the temporary managed worktree has been requested through Codex; the host queued cleanup. Verification receipts remain in the primary checkout.

## Google recrawl list

No Google indexing request has been sent. Paste these into Search Console URL Inspection → Request indexing:

- https://gainframe.app/blog/bulk-cut-or-recomp/
- https://gainframe.app/blog/visceral-fat-appearance/
- https://gainframe.app/blog/visceral-fat-vs-subcutaneous-fat/

## Measurement

Start the hold from verified production deployment, not approval or commit time. Preserve the three repaired pages' metadata through **November 1 at 22:31:40 UTC** (ten days). First complete content window: **October 23–November 19**, with settled GSC around **November 22**. No new-post age clock is needed because the URLs retain their April publication dates.

F1 baseline, September 23–October 20: **70 clicks / 6,594 impressions** versus 30 / 4,295, 80 organic sessions and 1 / 99 ordered same-path Store people / visitors. Existing recomp tool: 22 viewers, 9 starters, 6 result people and 2 Store clickers. Track the hub's search demand and qualified tool navigation separately from tool results and downstream Store clicks. F2 baseline is small: appearance 5 / 625 clicks / impressions and 0 / 30 Store reach; comparison 1 / 3 and 0 / 17. Its job is accuracy and citation capture, without a conversion forecast or meaningful comparison rank.

`bulk-cut-or-recomp` belongs to the fixed 79-post blog cohort. Annotate this editorial intervention in **`ios_inline_desktop_sticky_v3_rollout`**, live since September 29 at 17:33:40 UTC. Preserve its clock, cohort, device allocation, assignment and treatment. The two visceral pages are outside that cohort. Content and opening-section changes can affect subsequent exposure and clicks; a pre/post change cannot establish CTA lift.

Existing October 15 metadata holds and all other observation windows remain intact. No recurring automation was created.
