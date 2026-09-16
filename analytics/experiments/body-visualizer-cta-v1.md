# Body Visualizer: four CTA combinations

**Release approved: September 15, 2026.**

The compact visualizer and this test launch together. The experiment starts at the first 100% production deployment of this release, verified against the exact Git commit. The Cloudflare deployment ID, Worker version, and UTC start time are recorded in `output/body-visualizer-cta-experiment/deployment.json`. Use that deployment's `created_on` timestamp for live reporting. September 15's `prelaunch-report.json` is a connection check, not live test data.

## What we're testing

A visitor has just explored a generic body reference. A specific personal benefit may give them a stronger reason to continue in GainFrame. We are comparing four complete combinations of headline, supporting text, button wording, and button style.

| Arm | Headline | Supporting text | Button | Style |
| --- | --- | --- | --- | --- |
| A · control | Estimate your body fat. | One photo. Free to start. | Get the app | Lime fill |
| B · personal analysis | See your body breakdown. | Body fat + muscle in the app. | Analyze my photo | Dark fill |
| C · progress | Make your progress visible. | Compare photos in the app. | Track my progress | Coral fill |
| D · future physique | Preview your future physique. | AI projection in the iPhone app. | Preview in app | Dark outline |

The result identifies a promising **combination**. It cannot establish whether wording or styling caused a difference. A follow-up can hold the winning message constant and compare styles. The future image is explicitly described as an AI projection.

## Local review

Open [the local visualizer](http://localhost:3012/tools/body-visualizer/). The A/B/C/D selector directly below the workspace changes the card immediately without resetting the tool inputs. This selector appears only on local hostnames.

- [A — Get the app](http://localhost:3012/tools/body-visualizer/?bv_cta=direct)
- [B — Analyze my photo](http://localhost:3012/tools/body-visualizer/?bv_cta=analysis)
- [C — Track my progress](http://localhost:3012/tools/body-visualizer/?bv_cta=progress)
- [D — Preview in app](http://localhost:3012/tools/body-visualizer/?bv_cta=future)

Local previews and query-forced variants are marked `experiment_forced: true` and excluded from reporting. Preview links never overwrite a saved live assignment.

## Assignment and measurement

- Experiment: `body_visualizer_cta_v1`; phase: `four_treatments_v1`.
- Allocate 25% to each arm per browser. Save the arm in local storage for return visits. When storage is blocked, the arm remains stable for that page lifetime. The report excludes identities seen with multiple arms.
- Eligible platforms: iOS and desktop. Android keeps its email-link flow and is excluded. Analytics reflect visitors measured by the existing consent/analytics setup.
- Assignment is reported when the card mounts with a resolved platform. Exposure is reported once at least 40% of the card is visible.
- Primary metric: unique visitors clicking an App Store link in the card within 24 hours of their first eligible exposure, divided by unique exposed visitors with a complete 24-hour observation window.
- Deduplicate by PostHog `distinct_id`; require the same experiment, phase, and arm for the view and later click. Filter to the production host and exclude forced previews.
- Inspect iOS and desktop separately as secondary context. Desktop QR scans are not browser clicks and are not included in the primary metric.
- Secondary diagnostic: exposure counts relative to assignments. Card-height differences can affect visibility, so inspect exposure balance before interpreting click-through differences.
- Every button and desktop QR retains the existing AppsFlyer link with a unique `atlas_v6_four_treatments_v1_<arm>` placement. Installation attribution by arm still needs validation; this report measures web clicks, not installs or paid subscriptions.
- Keep the existing site-wide CTA experiment separate. It retains its own assignment, phase, copy, and exposure behavior.

## Decision rule agreed before launch

Plan for **1,600 mature exposed visitors per arm (6,400 total)** and at least **14 full days**. Stop for review when both conditions are satisfied; do not stop early because an arm looks ahead. If the sample has not accumulated after 56 days, stop and record an inconclusive result. Freeze the result at the agreed stopping point; repeated testing after that point is not a fresh independent experiment.

The planning assumption is a 2% control click-through rate and a detectable change to 4%, with 80% power and a two-sided family error rate of 5%. A normal-approximation calculation gives 1,522 visitors per arm; 1,600 rounds up. The new layout has no measured live baseline yet. This design is intended to detect a large improvement and may not resolve small differences. Calendar duration depends on actual eligible exposures, not total page traffic.

There are three planned comparisons: B vs. A, C vs. A, and D vs. A. Use a two-proportion test with a Bonferroni-adjusted threshold of `0.05 / 3`, require at least 20% relative improvement for practical relevance, and investigate an assignment-ratio mismatch at `p < 0.001` before interpreting results. A high raw rate is not sufficient. If multiple challengers qualify, do not claim the highest is statistically better than the other challengers; consider a subsequent two-way test.

This is a frequentist fixed stopping rule; the report's p-value is not the probability that an arm is worse or that the null hypothesis is true. The [NIST guidance on Bonferroni comparisons](https://www.itl.nist.gov/div898/handbook/prc/section4/prc463.htm) explains adjustment for multiple planned comparisons.

## Read-only report

The existing read-only PostHog connection for project 357433 is used. Queries return bounded aggregates, never individual visitor payloads. Credentials stay in the environment or existing local configuration.

Use the verified production launch timestamp (September 15, 19:27:22.736891 UTC):

```sh
python3 seo-tools/scripts/body-visualizer-cta-report.py \
  --start '2026-09-15T19:27:22.736891Z' \
  --output output/body-visualizer-cta-experiment/live-report.json
```

The report includes assignments, mature viewers, unique clickers, rates, platform segments, comparisons against A, and assignment balance. It labels a result as collecting, ready for review, imbalanced, or inconclusive. No recurring report or notification has been scheduled.

## Validation receipts

- 113 existing and new tool tests passed, including assignment persistence, equal allocation boundaries, QA exclusions, independent phase/placement metadata, and the 40% exposure threshold.
- Read-only production query succeeded on September 15 and returned no live data for this new experiment, as expected before deployment.
- Offline report tests cover sample/duration gates, a large qualifying lift, traffic imbalance, platform aggregation, invalid conversion counts, and the time limit.
- Local browser review covers all four treatments on mobile, narrow-phone wrapping, and desktop destinations/QR placement. Final build and preview receipts are stored under `output/body-visualizer-cta-experiment/`.


## September 16 reporting correction

The helper now explicitly interprets the launch cutoff in UTC, matching the
recorded deployment even when PostHog displays America/New_York timestamps.
Its pooled conversion counts use a separate unique-identity query rather than
summing platform segments. Ten offline tests cover timezone conversion,
overlapping platform identities and decision gates. A live read returned
73/67/84/80 assignments and no mature exposures before the first 24 hours;
status remains collecting. This is not a winner decision.

The shared QR component now emits `web_download_qr_shown` at 50% QR visibility,
with the encoded key and experiment context. It is a separate attribution
diagnostic, never a primary click or eligible-exposure event. No arm, phase,
copy, allocation, exposure threshold or stopping rule changed. Preserve the
original launch clock. See `web/docs/cta-tracking.md` for the remaining
fresh-install delivery limitation and app first-touch behavior.
