# November 9 GainFrame publishing record

The owner approved P1, P3, P4 and F1–F7 from the [search review](2026-11-09.md). The [seven additional nonbrand proposals](../keyword-research/2026-11-09-nonbrand-post-ideas.md) are available for selection.

## The estimator and women's waist guide

The priority release reached 100% of Cloudflare traffic on November 9 at 8:09:45 p.m. Eastern (November 10, 01:09:45 UTC). [Priority release c3c1f848](https://github.com/mjrode/gain-frame-privacy/commit/c3c1f84883baf5f5394dca9ade9ba718bc4db6fc).

| Fix | What changed | How it was verified |
|---|---|---|
| F1. Photo estimator accuracy | The hero labels the result an approximate estimate and links directly to the methodology. The existing title and canonical URL remain in place. | Compared the production page with the export, including the hero, links and structured data. |
| F2. Women's waist reference | Two examiner photographs beside the age reference show the upper hip-bone landmark and level tape used in NHANES. The guide and shared waist calculator explain which measurement to enter. The clothing-size instructions use the retailer's specified landmark. | Checked the seven published age groups against NHANES Table 19, visible FAQ against structured answers, both waist pages, and both photographs on the production domain. |
| F3. Android photo failures | Android now reads the selected picture while the picker grant is available. A failed read prompts a fresh selection. A cancelled or superseded selection cannot submit a stale picture. Inference starts on explicit submission. | Reproduced the delayed read failure by expiring the provider grant under controlled conditions on Android 15/Chrome 124. Verified replacement, cancellation and submission through the native picker with two distinct local images and an intercepted inference request. The iPhone user-agent regression and 226 tool tests passed. An authenticated Google Photos cloud retrieval and the production effect remain unverified. |

## Three new articles

The second release reached 100% of Cloudflare traffic November 9 at 8:17:29 p.m. Eastern (November 10, 01:17:29 UTC). It shipped the articles, nine contextual links, the remaining four editorial fixes and final waist wording. [Article release 268983b4](https://github.com/mjrode/gain-frame-privacy/commit/268983b41444a4c153ac2af3761d6d459eb1c838).

| Article | Reader task and original material | Search and business outcome to follow |
|---|---|---|
| [Put two progress photos side by side on iPhone](https://gainframe.app/blog/put-two-photos-side-by-side-iphone/) | Install the signed Apple shortcut or build it from the pictured actions. A matched-crop example shows how scale changes a comparison. Tested the downloadable file in native Shortcuts on an iPhone 17 Pro simulator running iOS 26.5. Two 320 × 280 images produced a 640 × 280 PNG in the order selected. | Progress photos cluster. Track “how to put two pictures side by side on iphone,” visits to the photo comparison tool and successful comparisons. |
| [Prepare for an InBody scan](https://gainframe.app/blog/inbody-scan-preparation/) | Use the manufacturer's preparation guidance and a fillable, one-page appointment checklist to record the model, timing and conditions for a repeat visit. | Body measurement methods cluster. Track “inbody scan preparation,” readership of the InBody score explanation and onward photo comparison use. |
| [Read a Fit3D body scan report](https://gainframe.app/blog/fit3d-body-scan-report/) | Read an independently illustrated report map, distinguish shape measurements from estimates and save two visits in the fillable field guide. | Body measurement methods cluster. Track “fit3d body scan,” participant report queries, onward comparison use and Store-reaching article sessions. |

Each guide has three contextual links from existing articles. The approved anchors were verified in rendered paragraphs.

| Destination | Source article and anchor |
|---|---|
| iPhone | `before-after-comparing-progress-photos` — “put two progress photos side by side on iPhone” |
| iPhone | `best-free-progress-photo-apps` — “the iPhone Shortcuts method” |
| iPhone | `import-progress-photos` — “align two pictures from your camera roll” |
| InBody | `inbody-score-explained` — “before your next InBody scan” |
| InBody | `inbody-vs-dexa` — “InBody appointment checklist” |
| InBody | `best-inbody-alternatives` — “how to prepare for an InBody scan” |
| Fit3D | `body-scanning-platforms-for-coaches` — “how a client reads a Fit3D scan” |
| Fit3D | `styku-body-scan-accuracy` — “what Fit3D reports” |
| Fit3D | `best-body-scanning-measurement-apps` — “read a gym Fit3D body scan” |

The source articles also received a repaired Hevy image reference and corrections to outdated offer and photo-import scoring claims. Publication uses the full build, structured answers, working download links and mobile layouts as checks.

## Older articles refreshed

| Fix | Addition | Search Console baseline, October 11–November 7 |
|---|---|---|
| F4. Women's average body fat | Added published means and medians for U.S. women by age. The table identifies the 1999–2004 NHANES survey and DXA method. Images and captions distinguish survey data from illustrations. | “body fat percentage women” had 700 impressions, 1 click and average position 10.8. |
| F5. Body-fat picture chart | Added eight labeled, linked front-view illustrations in two compact rows. Readers can open the corresponding front and back views. | “body fat percentage chart” had 700 impressions, 2 clicks and position 13.4. |
| F6. Tape measurement guide | Added a front/back ten-site diagram and printable four-date log. The guide distinguishes shoulder circumference from width and identifies the waist protocols. | “how to take body measurements” had 59 impressions, 0 clicks and position 27.0. |
| F7. Women's body recomposition | Replaced fixed percentage targets and projected visual outcomes with a four-week strength, waist and photo log, including a link to the recomp checker. | “body recomposition women” had 158 impressions, 0 clicks and position 12.8. |

All 17 changed article files passed their individual checks. The full 289-article inventory passed. Checked the five refreshed articles' 25 visible FAQ answers against their structured answers, eight chart anchors, assets, printable page and layouts at 390 and 1280 pixels. The three new pages each appear once in the sitemap and have a card in the first page of the blog. Both fillable downloads have form fields. On iOS 26.5 Safari, tapping the live article's download link displayed Apple's download prompt. Safari’s Downloads list opened the saved file in the native Shortcuts review sheet and Add Shortcut opened the editor. The downloaded file matched the tested signed shortcut byte-for-byte.

## When to read the results

- **Android on November 17 and 24.** Compare the first seven complete days (November 10–16) and first fourteen (November 10–23). Count affected browsers per starter, failed attempts subsequently recovered and ordered starts reaching a result. Segment by OS and available picker stage. The baseline was 122 affected Android browsers, 223 raw-read errors and 1,224 results from 1,665 Android starters (73.5%). iOS was 1,777/2,069 (85.9%). The instrumented initial/reselect stage does not identify a signed-in cloud provider.
- **Articles and search around December 10.** November 10–December 7 is the first complete 28-day window. Compare GSC clicks, impressions and each intended URL's query ownership. For women's waist, the baseline for “waist measurement women” was 2 clicks on 290 impressions at position 11.2. For the estimator, compare the three head queries and CTR against the original audit. Keep the 10-day metadata observation period through November 19 local time.
- **Reader outcomes.** Track article entry → comparison tool → completed comparison and Store visits independently. Apple first-time downloads cannot be tied to an individual article from these aggregate counts. The three articles and refreshed cross-links went live together, so before/after movement alone cannot attribute causality.

## Search discovery


All 19 changed page URLs returned HTTP 200 on the production domain. The production article or estimator text, title, canonical, links, images and structured data matched the built pages. All 13 checked asset responses matched the build byte-for-byte. The public sitemap contains 569 URLs, including the three new articles once each. The public blog index lists 289 articles, including all three. [Release checks, live responses and download hashes](receipts/2026-11-09/release.json).

**IndexNow.** The site's ownership file returned precisely the expected 32 bytes. All 19 changed URLs were sent. Yandex (202), Seznam (200) and Naver (200) accepted. Bing and Microsoft's IndexNow endpoint returned 403 and asked for site verification in Bing Webmaster Tools. Acceptance confirms receipt. The local submission log retains the individual endpoint responses.

**Google.** After release, read-only inspection covered 92 unique URLs. All 16 changed existing pages and all 73 other existing pages in the watch list were indexed. The estimator, women's waist and men's waist were last crawled before this release. The three new URLs each returned “URL is unknown to Google,” with no last crawl. Review their first complete performance window around December 10. There were no “crawled, currently not indexed” URLs in this sweep. Manual indexing requests can be made in Search Console using the three new URLs first. [Inspection results](receipts/2026-11-09/post-deploy-inspection.json) · [Paste-ready URL list](receipts/2026-11-09/google-urls.txt).

### Search Console request list

```text
https://gainframe.app/blog/put-two-photos-side-by-side-iphone/
https://gainframe.app/blog/inbody-scan-preparation/
https://gainframe.app/blog/fit3d-body-scan-report/
https://gainframe.app/tools/body-fat-from-photo/
https://gainframe.app/blog/average-waist-size-women/
https://gainframe.app/blog/average-waist-size-men/
https://gainframe.app/blog/average-body-fat-percentage-women/
https://gainframe.app/blog/before-after-comparing-progress-photos/
https://gainframe.app/blog/best-body-scanning-measurement-apps/
https://gainframe.app/blog/best-free-progress-photo-apps/
https://gainframe.app/blog/best-inbody-alternatives/
https://gainframe.app/blog/body-fat-percentage-chart/
https://gainframe.app/blog/body-recomposition-for-women/
https://gainframe.app/blog/body-scanning-platforms-for-coaches/
https://gainframe.app/blog/how-to-take-body-measurements/
https://gainframe.app/blog/import-progress-photos/
https://gainframe.app/blog/inbody-score-explained/
https://gainframe.app/blog/inbody-vs-dexa/
https://gainframe.app/blog/styku-body-scan-accuracy/
```
