# SEO strategy — rolling state

> Maintained by the `seo-content-cycle` skill. **Read first, update last.**
> Last run: **2026-08-07** (review → execution; owner approved `all`: F1 chart-title revert + F2 WHR calculator both shipped; zero posts) · Data through 2026-08-05
> Prior run: 2026-08-06 (review → execution; body-visualizer tool + WHtR calculator + topical-map backfill shipped after owner approved `all`)

## New findings (2026-08-07)

- **Jul 18 chart CTR test FAILED**: post-change CTR 0.52% (72 clicks / 13,742 imp Jul 19–Aug 5)
  vs ~0.7–1.0% before, position unchanged (~11). Revert proposed (F1). Daily impressions also
  fell after Jul 22 — consistent with the −45%/yr market decline, cause not claimed.
- **Competitor gap analysis complete** (Spren / SKOR / ZOZOFIT domain intersections — the item
  deferred 2026-08-06): **essentially empty.** SKOR = zero qualifying gaps; ZOZOFIT = all
  workout/nutrition intent (killed wholesale); Spren = local DEXA navigational + gynoid/android
  fat (1,000 / 720 vol, definitional zero-click — killed under the stats freeze). Do not re-run
  these three intersections without a reason; the lane is clean.
- **WHR opportunity**: `waist-to-hip-ratio` page was pos 14.7 / 871 imp, long-tail only, on an
  18,100-vol flat KD-29 head term. Same pre-fix shape as WHtR. Calculator (F2) was proposed with
  a hold-until-Aug-16 recommendation; **owner approved `all` and it shipped 2026-08-07** —
  directional read ~Aug 17, full read ~Sep 4, against the 14.7 / 871-imp baseline.
- `/tools/body-visualizer/` indexed within ~1 day of ship (crawled 2026-08-07).
- Tooling: the `gsc` MCP server can be absent from a session; the skill now records the direct
  Search Console API fallback via the service account.

## New finding (2026-08-06): the body-visualizer family

≈86K monthly searches at KD ≤17, mostly rising, transactional-leaning, and the SERP is held by a
Max-Planck research demo + thin single-purpose tool sites (bmivisualizer.com, howheight.com) — no
medical or editorial lockout. Head term **"body visualizer" 40,500 vol, +22%/yr, KD 4–8**; family
includes female body visualizer (12.1K, KD 9), body shape visualizer (12.1K, KD 12), bmi
visualizer (6.6K, **+124%**), masculine body visualizer (4.4K), 3d body visualizer (1.9K), weight
visualizer (1K, KD 7). The site already ranks 4.8 for "body fat visualizer" with the exact asset.
Approved and shipped 2026-08-06 as a new `/tools/body-visualizer/` with height/weight/BMI input,
male/female standardized reference art, careful non-predictive limitations, and distinct metadata.
The separate route preserves the existing pos-4.8 ranking for the exact body-fat query. Also
killed the same run: menopause head term (YMYL SERP lockout verified live —
rescue is visual long-tail only), `resistance-training-guidelines` CTR (6.8K impressions are
LLM-grounding machine queries, not human demand).

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

## New finding (2026-08-02): the self-assessment lane

LeanLens gap analysis + keyword scoring converge on a cluster GainFrame has no page for:
"do i look fat" (480 vol, **+1312%/yr**, KD 10), "am i fat" (5,400, +124%, KD 77 head term),
"ai body rater" (+57%), "body composition pictures" (KD 10). GSC shows "am i fat ai" queries
already hitting the site (55 imp @ 8.3) with no dedicated page. Proposed as P1 2026-08-02.
Killed the same day: first-cut guide (−80%), progress-photo poses (30 vol), withings review
(−19% + hardware reviews underperform), mogged/looksmaxxing lane (volatile, off-positioning) —
prune these from topical-map gap lines when next edited.

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

**Largely cleared 2026-08-01.** Internal links 929 → 1,279; orphans 46 → 8; median inbound 3 → 4.

- **8 orphans remain**, 6 of them founder-lane (exempt — judged on sessions, not GSC).
- **51 Quick Answer defects remain**, all in the frozen stats lane. Deliberately skipped: better
  AI-Overview extraction for a keyword losing 45–66% of volume a year is effort on a shrinking
  asset. The 9 that mattered (converting pages + AI-Overview-cited pages) are fixed.
- **Cannibalization: none real.** The one flagged pair was a false positive (see below).

---

## Hypotheses ruled out

- ~~"New posts aren't indexing."~~ **Ruled out 2026-08-01.** All 10 recently-published URLs
  sampled came back `Submitted and indexed`, crawled 2026-07-20 to 2026-07-27. There is no crawl
  bottleneck; publishing is not blocked.
- ~~"The stats pages have a CTR/title problem."~~ **Ruled out 2026-08-01.** They rank at positions
  6–8 and the queries are definitional with declining volume. This is zero-click demand, not a
  snippet-copy problem. Retitling will not recover it.
- ~~"`average-bicep-size` and `average-chest-size` cannibalize each other."~~ **Ruled out
  2026-08-01** by `get_search_by_page_query`: zero shared queries. The bicep page serves
  "14.5 inch biceps", the chest page serves "40 inch chest". High title overlap came from a shared
  series template. **Title-overlap pairs must be verified against real queries before any merge** —
  acting on the signal alone would have deleted a page earning 7,645 impressions.

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
| `do-i-look-fat`, `body-composition-pictures` | New post, 28d | 2026-08-30 |
| `am-i-skinny-fat-quiz` (renders + fold-in), `ideal-body-measurements-women` (retitle) | Content/metadata | ~2026-08-12 |
| `menopause-body-composition` (pre-existing) | New post, 28d | 15 impressions at position ~8.6; still below the ≥30 reliability threshold |
| ~~`body-fat-percentage-chart` Jul 18 CTR test~~ | Metadata | **Closed 2026-08-07: test failed** (0.52% vs ~0.7–1.0%); reverted to control same day — new 7–10d window to ~2026-08-17 |
| `waist-to-hip-ratio` WHR calculator (F2) | Content | Directional ~2026-08-17; full ~2026-09-04 (baseline pos 14.7 / 871 imp) |

No existing-page metadata was edited. The new body visualizer's 28-day window opens 2026-09-03;
the WHtR calculator's earliest directional read is 2026-08-16, with a full read on 2026-09-03.

---

## 2026-08-06 shipped / held

Owner approved `all` after the review, choosing the separate-page variant for P1:

| Item | Evidence | Note |
|---|---|---|
| P1 body-visualizer tool page | "body visualizer" 40,500 vol +22% KD 4–8 + ~86K family | **Shipped** as separate `/tools/body-visualizer/`; 28d window 2026-09-03 |
| F1 `waist-to-height-ratio` WHtR calculator widget | pos 13.2, 2,542 imp, 12,100 vol **+49%/yr** | **Shipped** without metadata change; directional read 2026-08-16 |
| F3 topical-map backfill (82 omitted Jul 9–23 parallel-session posts) | Exhaustive git-to-map reconciliation; Aug 2 duplicate near-miss root cause | **Completed**; all 98 period posts now represented |

Held from the 2026-08-06 review: the menopause visual/PAA expansion. The exhaustive page report
shows 14 impressions at position 9.0; the top-50 report hid the page and was initially mistaken
for zero. Wait for ≥30 impressions before treating its position or targeting diagnosis as real.

From 2026-08-02: everything approved shipped same day EXCEPT the P2 menopause post, which turned
out to already exist (published 2026-07-09 by a parallel session — stale topical-map gap line;
skill now requires per-candidate existence grep). Still held: "rate my body" sibling post until
rate-my-physique's window opens Aug 20.

From 2026-08-01 (`fixes all` approved; both posts declined that cycle):

| Post | Keyword | Volume | Trend | Why it is still worth doing |
|---|---|---:|---:|---|
| Physique-rating lane expansion | `rate my physique` / `physique rater` | 590 / 320 | **+108% / +85%** | Only cluster with positive market trend, KD 8, site already at pos 7.0 |
| DEXA alternatives deepening | `dexa scan alternatives` | 90 | **+80%** | AI Overview rank 2 already held; F4/F5 strengthened the page, so measure before extending |

Re-check both against fresh data before writing — the fixes shipped 2026-08-01 may move these on
their own.

---

## Watch next run

| What | Metric | When |
|---|---|---|
| `rate-my-physique` after de-orphaning | position + clicks | 2026-08-20 |
| `/tools/physique-rater/` | position (currently 7.0) on "physique rater" | 2026-08-15 |
| `dexa-scan-alternative` | holds AI Overview rank 2 | 2026-08-15 |
| `menopause-body-composition` | visual/PAA expansion decision after ≥30 impressions | next cycle with enough signal |
| `/tools/body-visualizer/` | indexation, impressions, ranking across the ~86K family, engagement | 2026-09-03 |
| `waist-to-height-ratio` calculator | rank vs 13.2; clicks/CTR vs 2,542-impression baseline | 2026-08-16 directional; 2026-09-03 full |
| Stats-cluster CTR | whether 0.3–1.0% is stable or still falling | 2026-09-01 |
| Sitewide CTR | 1.98% and falling as impressions scale — expected, confirm it stabilises | 2026-09-01 |
