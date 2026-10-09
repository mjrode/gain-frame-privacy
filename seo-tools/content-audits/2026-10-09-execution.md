# October 9 SEO execution

Status: **approved and implemented; release verification in progress**. Owner approval: “All, ship the three fixes.”

## Scope

- **F1:** `visceral-fat-level` now uses the approved 51-word Quick Answer, Tanita's two manufacturer categories, and explicit scale/photo limitations. Unsupported CT conversion, daily-change magnitudes and internal-fat photo inferences are removed. Truncated metadata, canonical publisher/category and five matching FAQs are repaired. Existing title/URL and original publication date are retained.
- **F2:** `jefit-vs-hevy` now uses the approved 50-word answer and current documentation of both apps' progress photos and entered measurements. Hevy's private photo overlay/comparison and Strong-only supported CSV import are stated accurately. October 9 US ratings: Jefit 4.76304 / 46,910; Hevy 4.92333 / 96,852. Jefit's conflicting ad claims are disclosed. Unsupported on-device inference, 25-photo allowance and universal superlatives are removed. The search title/description wording is retained with description dash punctuation cleanup.
- **F3:** `natty-limit` now uses the approved 50-word answer, correctly describes the limited male 1995 sample, distinguishes raw/normalized FFMI, and removes deterministic personal ceilings, drug-use classifications, female cutoffs and training deadlines. Worked arithmetic is corrected, with hypothetical input sensitivity. Five FAQs and social metadata match the qualified explanation. Existing title, search description, URL and original publication date are retained.
- **Inbound links:** `hevy-vs-strong` uses **Jefit vs Hevy exercise libraries and logging**; `best-workout-tracker-apps` uses **compare Jefit and Hevy**. Both are contextual body links to `/blog/jefit-vs-hevy/`. Strict validation exposed the roundup's pre-existing FAQ answer 7 mismatch: the visible answer now matches its already-corrected schema. The remaining source content was not rewritten.
- **Destination links:** visceral-fat test and external-only photo comparison; **connect Hevy workouts with photo check-ins** and **try a photo-based physique estimate**; **calculate FFMI with your own inputs**, with the original FFMI explainer retained.

No new post, image, dependency, tool or experiment treatment. Existing assets remain on disk. No original product trial or medical measurement was fabricated. Broader `hevy-vs-strong` content accuracy remains a separate possible follow-up, outside the approved link edit.

## Sources checked October 9

- [Tanita rating definitions](https://support.tanita.eu/support/solutions/articles/60000677375-how-is-visceral-fat-measured-by-tanita-) and [measurement fluctuations](https://support.tanita.eu/support/solutions/articles/60000687548-why-do-my-body-composition-measurement-results-fluctuate-change-).
- [Cleveland Clinic visceral fat guide](https://my.clevelandclinic.org/health/diseases/24147-visceral-fat), for anatomy and general lifestyle/clinical context.
- [Hevy photos and measurements](https://help.hevyapp.com/hc/en-us/articles/35385479603479-Body-Composition-Tracking-Measurements-and-Progress-Photos), [current features](https://help.hevyapp.com/hc/en-us/articles/33106320824727-Everything-You-Need-to-Know-About-the-Hevy-App-2026-Features-Guide), [Pro tiers](https://help.hevyapp.com/hc/en-us/articles/35119778922263-Hevy-Pro-Subscription-How-to-get-Pro-and-What-Does-It-Include), and [supported import](https://help.hevyapp.com/hc/en-us/articles/38001424401943-How-to-Import-Strong-App-CSV-Files-and-Export-Your-Data-in-Hevy).
- [Jefit feature page](https://www.jefit.com/use-case/best-workout-app) contains both “no ads” and an Elite ad-free benefit. Current Apple US lookup receipts are saved locally; Jefit's iOS description documents 1,400+ exercises, progress photos, measurements and $12.99 monthly / $69.99 annual Elite pricing.
- [Kouri et al. (1995)](https://pubmed.ncbi.nlm.nih.gov/7496846/), [NIA strength and aging](https://www.nia.nih.gov/news/how-can-strength-training-build-healthier-bodies-we-age), and [FDA SARMs guidance](https://www.fda.gov/consumers/consumer-updates/fda-warns-use-selective-androgen-receptor-modulators-sarms-among-teens-young-adults).

## Verification

Global inventory and strict checks for all five modified articles pass. Quick Answers are 51/50/50 words; each repaired article has five matching 40-70-word FAQs. No long dashes in changed MDX. The original seven founder/product orphans remain; no new orphan was introduced. Exact checks are in `analytics/raw/2026-10-09/seo-cycle/execution/content-validation.json`.

Selected-source production build passed: 576 static pages, compilation and TypeScript checks successful. The snapshot contains committed base `11c62801` plus only these five article edits, excluding unrelated dirty/untracked work. Both generated blog index files were copied from that build. At 390px, all three repaired pages render their new Quick Answers and FAQ headings without horizontal page overflow, broken loaded images, or observed console errors. Browser receipts and a screenshot are saved in the execution directory. Deployment, live verification and indexing: pending.

## Google recrawl list

No Google indexing request has been sent. Manual Search Console URL Inspection list:

- https://gainframe.app/blog/visceral-fat-level/
- https://gainframe.app/blog/jefit-vs-hevy/
- https://gainframe.app/blog/natty-limit/
- https://gainframe.app/blog/hevy-vs-strong/
- https://gainframe.app/blog/best-workout-tracker-apps/

## Measurement

Start the ten-day metadata hold from verified production release. First full content window: October 10-November 6, with settled GSC around November 9. The edits combine accuracy, extraction and links; any later change is descriptive, not an isolated causal test. Existing October 6 and earlier observation windows remain intact. No recurring automation was created.
