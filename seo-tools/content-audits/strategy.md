# SEO strategy — rolling state

> Maintained by the `seo-content-cycle` skill. **Read first, update last.**
> Last run: **2026-08-01** (baseline) · Data through 2026-07-29 · Property `sc-domain:gainframe.app`

---

## The central finding (2026-08-01 baseline)

Traffic is compounding hard — 28d clicks went **1,349 → 5,685 (+321%)** and impressions
**55,637 → 286,717 (+415%)** against the prior 28 days. Average position improved from roughly 12
to 8.3. That is the July publishing batch landing.

But the impression growth and the click growth are coming from **two different kinds of page**,
and conflating them would produce the wrong plan:

| Lane | Example | 28d impressions | CTR | What it does |
|---|---|---:|---:|---|
| Commercial / tool | `/tools/body-fat-from-photo/` | 8,814 | **11.07%** | Converts |
| Commercial / roundup | `/blog/best-ai-body-fat-apps/` | 10,110 | **5.76%** | Converts |
| Stats / informational | `/blog/average-bicep-size/` | 14,462 | **0.32%** | Impressions only |
| Stats / informational | `/blog/body-fat-percentage-chart/` | 20,381 | **0.65%** | Impressions only |
| Stats / informational | `/blog/average-chest-size/` | 7,645 | **0.39%** | Impressions only |

`average-chest-size` sits at **position 6.6** and converts at **0.39%**. A page at position 6-7
normally earns 3–8%. The gap is the SERP answering the question without the click — these are
definitional queries that AI Overviews and featured snippets satisfy in place.

**DataForSEO confirms this is structural, not a fixable CTR problem.** The whole stats family is
in market decline:

| Keyword | Volume | Yearly trend |
|---|---:|---:|
| average bicep size | 1,600 | **−66%** |
| ai personal trainer | 720 | **−63%** |
| ideal body measurements men | 110 | **−59%** |
| skeletal muscle mass percentage | 210 | **−56%** |
| body transformation app | 30 | **−50%** |
| body fat percentage chart | 14,800 | **−45%** |
| average hand size | 2,900 | −33% |
| how to get a smaller waist | 5,400 | −33% |
| average chest size | 210 | −33% |

Meanwhile the physique-rating lane is the only thing growing:

| Keyword | Volume | Yearly trend | KD | Status |
|---|---:|---:|---:|---|
| **rate my physique** | 590 | **+108%** | 8 | Post exists, **orphaned** |
| **physique rater** | 320 | **+85%** | — | `/tools/physique-rater/` live, pos 7.0 |
| body fat visualizer | 720 | **+22%** | 4 | Tool live, pos 8.0, transactional intent |
| ai body fat calculator | 210 | +22% qtr | — | pos 6.4 |

### What that means for the plan

1. **Stop expanding the measurement-stats cluster.** It is 11 posts deep into a family where the
   head terms are shedding 19–66% of volume a year and the traffic that remains does not click.
   The cluster is not broken; the market is leaving.
2. **Press the physique-rating lane.** It is the only cluster with positive yearly trend
   (+85% to +108%), low difficulty (KD 8), and commercial intent. GainFrame already ranks there.
3. **Protect the converters.** The homepage (16.88% CTR), `/tools/body-fat-from-photo/` (11.07%),
   and `best-ai-body-fat-apps` (5.76%) produce most of the real traffic. Nothing should destabilise
   them.

---

## Cluster bets

| Cluster | Stance | Why |
|---|---|---|
| AI body-fat estimation (C1) | **Protect** | Core money cluster; `best-ai-body-fat-apps` at pos 5.5 / 582 clicks. Saturated — do not expand |
| Physique rating (C11) | **Press** | Only cluster with positive market trend. Under-built: 5 posts, orphaned entry points |
| Body-fat visual reference (C2) | **Hold** | `body-fat-percentage-chart` recovered pos 37.2 → 11.8, but the keyword is −45%/yr. Harvest, don't extend |
| Scanning / measurement stats (C3) | **Freeze** | Market decline + zero-click. No new stats pages |
| AI coach / trainer (C9) | **Freeze** | "ai personal trainer" is −63%/yr at pos 9.8 with 0.84% CTR |
| Progress photos (C4) | **Hold** | Steady; AI Overview citations at rank 1 for "progress photos app" |
| GLP-1 (C8) | **Watch** | Untested since July batch; needs its own measurement window |

---

## Structural debt

- **46 orphan posts (0 inbound internal links), 34 of them published in the last 45 days.** The
  July batches shipped without inbound links. This is the highest-leverage fix available and it
  needs no new content.
- **42 posts with exactly 1 inbound link.**
- **60 Quick Answer defects** in the SEO lane (missing or outside 40–60 words). Founder-lane posts
  are exempt and already excluded from that count.
- **1 cannibalization pair:** `average-bicep-size` vs `average-chest-size` (0.74 overlap).

---

## Hypotheses ruled out

- ~~"New posts aren't indexing."~~ **Ruled out 2026-08-01.** All 10 recently-published URLs
  sampled came back `Submitted and indexed`, crawled 2026-07-20 to 2026-07-27. There is no crawl
  bottleneck; publishing is not blocked.
- ~~"The stats pages have a CTR/title problem."~~ **Ruled out 2026-08-01.** They rank at positions
  6–8 and the queries are definitional with declining volume. This is zero-click demand, not a
  snippet-copy problem. Retitling will not recover it.

---

## AEO position

GainFrame is cited in Google AI Overviews for **30+ keywords**, several at rank 1–3:

- rank 1 — "progress photos app", "picture progression app", "body composition app"
- rank 2 — "best body editing apps", "body fat ai", "average american male waist size",
  "dexa scan alternatives", "alternative to dexa scan", "body fat app"
- rank 3 — "ai body fat calculator", "16.5 inch arms", "average dad bod", "apps that make you skinnier"

Two of those cited keywords have strong positive trend: **"dexa scan alternatives" (+80%)** and
**"alternative to dexa scan" (+29%)**, both already at rank 2 via `/blog/dexa-scan-alternative/`.
That page is worth defending and deepening.

---

## Measurement windows (do not touch)

| Item | Type | Window opens |
|---|---|---|
| Everything published 2026-07-23 → 2026-07-26 | New post, 28d | ~2026-08-20 to 2026-08-23 |
| Everything published 2026-07-16 → 2026-07-19 | New post, 28d | ~2026-08-13 to 2026-08-16 |

No metadata edits were made in this run, so no 7–10 day metadata windows are open.

---

## Proposed but not built

Nothing yet — the 2026-08-01 run is a baseline. Its proposals are in
`content-audits/2026-08-01.md` awaiting approval.

---

## Watch next run

| What | Metric | When |
|---|---|---|
| `rate-my-physique` after de-orphaning | position + clicks | 2026-08-20 |
| `/tools/physique-rater/` | position (currently 7.0) on "physique rater" | 2026-08-15 |
| `dexa-scan-alternative` | holds AI Overview rank 2 | 2026-08-15 |
| Stats-cluster CTR | whether 0.3–1.0% is stable or still falling | 2026-09-01 |
| Sitewide CTR | 1.98% and falling as impressions scale — expected, confirm it stabilises | 2026-09-01 |
