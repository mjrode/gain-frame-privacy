---
name: seo-content-cycle
description: "End-to-end SEO content run for gainframe.app: pull Search Console data, layer real DataForSEO volume/difficulty/SERP intelligence on top, audit what is ranking and what is missing, then propose new posts and fixes for approval before writing anything. Pass `auto` to skip the approval gate and write and ship in one pass. Use when the user says \"run the SEO cycle\", \"seo-content-cycle\", \"do an SEO audit and write posts\", \"what should we publish next\", or \"submit new posts for indexing\"."
---

# SEO Content Cycle (GainFrame)

Closes the loop: **measure → validate against real market data → propose → approve → write → ship → index → record**.

This skill is the orchestrator. It does not restate the editorial rules — `$blog-post-generator`
and `seo-tools/writer-spec.md` own those, and every post written here must follow them verbatim.
X-vs-Y posts follow `$comparison-article-generator`. Tool/feature pages follow
`$feature-page-generator`.

The thing that separates this from `$keyword-discovery` (which estimates demand from autocomplete
depth and SERP shape) is **DataForSEO**: real search volume, real keyword difficulty, real
12-month trend, real SERP composition. Stop guessing at tiers. When this skill and
`$keyword-discovery` disagree on a keyword's value, DataForSEO wins.

Each run leaves two artifacts:

- `seo-tools/content-audits/YYYY-MM-DD.md` — the record of one run, written in **both** modes.
- `seo-tools/content-audits/strategy.md` — rolling state. **Read this first, update it last.**
  It carries the cluster bets, target keywords, what has already been tried, and what is still
  waiting for a measurement window. Without it, every run re-derives the same conclusions and
  re-proposes the same ideas.

## Modes — read this before anything else

| Mode | Trigger | Behavior |
|---|---|---|
| **Review** (default) | Any invocation without `auto` | Run Phases 0–5, present the breakdown and numbered proposals, then **stop and wait**. Write nothing to `web/content/blog`, `docs/blog`, or `TODO_SEO.md`. No commit, no deploy, no indexing |
| **Auto** | The word `auto` in the skill argument or the user's message — `/seo-content-cycle auto`, "run the seo cycle on auto" | Run all phases end to end with no gate. Still obeys every guardrail below |

**Review is the default. When in doubt, review.** An ambiguous invocation is a review run, and
saying "run it" again is not `auto` — only the literal word `auto` is.

State the active mode in the first line of your output so the user is never guessing.

In review mode, Phase 5 ends the turn. Do not write a post "to show what it would look like", do
not create an assets directory, do not run a build against unwritten work. Present and stop.

Once the user approves — in the same session or a later one — resume at Phase 6 with exactly the
scope they approved. Approval of five posts is not approval of ten. If they approve a subset,
carry the rest forward in `strategy.md` as proposed-but-not-built so the next run does not
re-derive them from scratch.

---

## Data sources, and what actually works

Verified 2026-08-01. Re-check at the start of every run; if the picture has changed, fix this
section in the same commit.

| Source | Status | Use for |
|---|---|---|
| `mcp__gsc__*` | **Working.** `sc-domain:gainframe.app` shows as `siteFullUser` | All GSC performance, queries, pages, index verdicts, URL inspection. **This is the performance source for this site** |
| `mcp__e6e8a8f4-…__*` (DataForSEO) | **Working.** Live, paid, per-call | Real search volume, keyword difficulty, search intent, 12-month trend, SERP composition, competitor keyword gaps, AI Overview presence, backlinks |
| `mcp__2676e48c-…__*` (SEO Receipts connector) | **Bound to `sc-domain:seoreceipts.com`, NOT gainframe.app** | **Nothing in this skill.** Every number it returns is a different website. Do not call it here |
| `mcp__analytics-mcp__*` (GA4) | Available | Sessions/engagement by landing page, when a GSC click number needs a behavioural counterpart |
| PostHog (`mcp__c90fac73-…__*`) | Available, project `seoreceipts` by default — **switch to GainFrame before querying** | On-site conversion from organic (tool runs, download clicks) |
| `seo-tools/content-inventory.mjs` | **Working.** No network, no model | Every local fact: link graph, orphans, cannibalization, freshness, Quick Answer lengths |

The most common way to waste a run is to call the SEO Receipts connector, get clean-looking data,
and write an entire audit about someone else's website. Check the property name on every
performance number before it enters the report.

---

## The baseline reality — do not skip this

gainframe.app is a **mature, indexed, trafficked site**: 230 blog posts, 11 tools, real non-brand
clicks, and clusters with established hubs. That is the opposite of a fresh-index situation, and
it changes what the evidence hierarchy looks like:

1. **Clicks and click deltas** — real and usable. Trends are callable over multi-day windows.
2. **Striking-distance queries** — positions 5–20 with impressions are the highest-ROI lane,
   because the site has enough authority for a nudge to actually move a page.
3. **Real market data** (DataForSEO volume + difficulty + intent) — this is what stops the site
   from publishing another well-crafted post into a 90/month keyword.
4. **Impressions** — the demand signal for pages that have not earned clicks yet.
5. **Coverage gaps** — real index verdicts, never an impressions proxy.

Three site-specific facts that override generic SEO instinct here:

- **Roundups and brand-"alternatives" posts are the proven click winners.** Informational posts
  mostly pull impressions (AEO/zero-click). Weight proposals accordingly — this is an observed
  pattern for this site, not a theory.
- **Programmatic SEO is explicitly deferred by owner decision** (topical map, 2026-07-07). Never
  propose a page factory. Revisit only with a real strategy doc and a proprietary data angle.
- **The visualizer render library is the differentiating asset.** Standardized per-level and
  per-age physique renders took `body-fat-percentage-chart` from position 43 to 10 in five days.
  A proposal that can use those renders is worth more than one that cannot.

Never manufacture a win. "No query cleared the striking-distance threshold this run" is the
correct, honest finding, and it belongs in the audit file and in the proposal.

---

# Both modes run Phases 0–5

## Phase 0 — Load prior context

1. Read `seo-tools/content-audits/strategy.md`. If it does not exist, this is run one; create it
   in the final phase.
2. Read the most recent `seo-tools/content-audits/*.md` for what the last run shipped or proposed,
   and what it said to watch. Anything marked proposed-but-not-built is a candidate this run —
   re-check that its evidence still holds rather than re-deriving it.
3. Read `seo-tools/topical-map.md` — the cluster map and the standing gap list. **Check this
   before proposing any keyword.** Update it in Phase 10 when posts ship.
4. Read the ACTIVE section of `seo-tools/TODO_SEO.md` for open backlog items.
5. Read `seo-tools/product-context.md` (positioning, tier boundaries, claim limits) and
   `seo-tools/writer-spec.md` (hard invariants for any post that gets written).
6. **Re-list `web/content/blog/` before briefing anything.** Other sessions publish into this
   repo in parallel; the topical map records a 2026-07-13 near-miss where a batch nearly
   duplicated pages another session had shipped two days earlier.
7. Note which posts are inside a measurement window:
   - **Metadata/title/meta-description changes: 7–10 days.** Never touch a page's metadata twice
     inside that window, and never propose doing so.
   - **New posts: 28 days** before their position is fair to judge.

   `git log --since="<28 days ago>" --name-only --pretty=format:"%ad %s" --date=short -- web/content/blog/`
   gives you both lists in one call.

## Phase 1 — Pull Search Console data

Property is `sc-domain:gainframe.app` — always this exact string. GSC lags ~2 days and the final
day is often partial; establish the real data-through date first and stamp every number with it.

Pull, at minimum:

- `mcp__gsc__get_advanced_search_analytics` with `dimensions="date"` over a generous window — the
  latest date present is `END`.
- **Queries**, 28d and prior 28d, `dimensions="query"`, row_limit 200. Pull once sorted by clicks
  and once by impressions; the second pull surfaces the zero-click AEO pools the first hides.
- **Pages**, 28d and prior 28d, `dimensions="page"`, row_limit 50.
- **Query × page** (`mcp__gsc__get_search_by_page_query`) for any page you suspect of splitting a
  query with another page.
- `mcp__gsc__compare_search_periods` for the 28d-vs-prior view.

Then sweep index status with `mcp__gsc__batch_url_inspection` (**10 URLs per call**, so issue
batches in parallel; the API allows 2,000 inspections/day per property). You do not need all 240+
URLs every run — inspect anything published in the last 60 days plus anything with zero
impressions.

| Verdict | Meaning | Action |
|---|---|---|
| `Submitted and indexed` | In the index | None |
| `Crawled - currently not indexed` | Google read it and declined | Real signal. Check for a duplicate, thin content, or a cannibalization pair |
| `Discovered - currently not indexed` | Queued, never fetched | Usually crawl backlog. Only act if the URL is 28+ days old |
| `URL is unknown to Google` | Not even discovered | Check sitemap presence and internal links first |

**Split brand from non-brand.** `gainframe`, `gain frame`, `gainframe app` reflect the TikTok and
social halo, not SEO. Reporting them mixed into organic wins overstates the SEO result every time.

**Position reliability threshold.** Quote a query's position as meaningful only at ≥30 impressions
in the window. 10–30 is directional. Under 10 is an anecdote — never present it as a rank. GSC
averages only the impressions that occurred, so a 2-impression "position 1" is usually one
personalized result or a single AI Overview citation.

## Phase 2 — Layer on DataForSEO market data

This is what makes the proposal defensible. GSC tells you what already happened on this site;
DataForSEO tells you how large the opportunity actually is and who you would have to beat.

Every call takes `location_name: "United States"` and `language_code: "en"` unless the target
audience is explicitly elsewhere.

### 2a. Score every candidate keyword

`dataforseo_labs_google_keyword_overview` accepts **up to 700 keywords in a single call**. Batch
every candidate from Phase 1 plus every gap in the topical map into one or two calls. Returns per
keyword: `search_volume`, 12 months of `monthly_searches`, `search_volume_trend`,
`keyword_difficulty`, `main_intent`, `competition`, `cpc`.

**A keyword missing from the response means DataForSEO has no data for it, which is not the same
as zero volume.** Say "no data" in the report; never silently convert it to zero.

Read three things from the result, in this order:

1. **`search_intent_info.main_intent`.** This is the fastest way to kill a bad idea. The site's
   own history proves it: "best cutting apps" and "best abs apps" were correctly skipped because
   their SERPs are nutrition-tracking and workout-programming intent, which is the wrong lane for
   an AI-photo body-composition app. Intent mismatch is a hard skip regardless of volume.
2. **`search_volume_trend.yearly`.** A −45% yearly trend (which is what `body fat percentage
   chart` currently shows) means a keyword that looked great a year ago is decaying beneath you.
   Weight rising keywords above flat ones and flat above declining ones.
3. **`keyword_difficulty`** relative to what the site already ranks for. Pull
   `dataforseo_labs_bulk_keyword_difficulty` on ten keywords the site already holds top-10
   positions for; that median is the realistic ceiling. A KD far above it is a multi-month bet,
   not a next-batch post.

### 2b. See what the site actually ranks for

`dataforseo_labs_google_ranked_keywords` with `target: "gainframe.app"`.

**This response is enormous — 65KB for only 15 rows.** Always constrain it:

- `limit` no higher than 50 per call.
- `filters` to the slice you care about, e.g.
  `[["ranked_serp_element.serp_item.rank_group","<=",20],"and",["keyword_data.keyword_info.search_volume",">",500]]`
- `order_by: ["keyword_data.keyword_info.search_volume,desc"]`

Run it three ways:

- **Striking distance:** rank 5–20 with volume >500. These are the fix-don't-write candidates.
- **AEO visibility:** `item_types: ["ai_overview_reference"]` — the queries where GainFrame is
  cited inside a Google AI Overview. This is the only direct read on the AEO work, and it belongs
  in every audit.
- **Unknown wins:** keywords ranking top-20 that GSC under-reports and no post deliberately
  targets. These are free cluster expansion signals.

### 2c. Validate the SERP before proposing a post

For each shortlisted keyword, `dataforseo_labs_google_serp_competitors` (cheap) tells you which
domains own the SERP. Reserve `serp_organic_live_advanced` (live, more expensive) for the final
three to five candidates, where you need the actual result set.

Kill a candidate when:

- The SERP is app-store listings and marketplace pages with no editorial results — nothing to rank.
- The SERP is owned entirely by medical or institutional domains (YMYL) and the site has no
  authority signal to compete on.
- The site already ranks for it with a different page — that is a fix, not a new post.

Note `serp_item_types` on every shortlisted keyword. An `ai_overview` present means budget the
Quick Answer block for extraction and expect the click-through to be lower than the position
implies. That is worth saying out loud in the proposal rather than promising clicks that a
zero-click SERP will never deliver.

### 2d. Competitor gaps

`dataforseo_labs_google_domain_intersection` between `gainframe.app` and a competitor returns
keywords the competitor ranks for and GainFrame does not — this is the cleanest gap list
available anywhere in the toolchain. Run it against the known set:
`leanlens.ai`, `joinskor.com`, `spren.com`, `zozofit.com`, `trackbod.com`, plus anything
`dataforseo_labs_google_competitors_domain` surfaces that the competitor profiles in
`seo-tools/competitor-research/` do not already cover.

Cross-check any new competitor against `$competitor-scan` before writing about it, and against the
LeanLens and Specimen watch notes — LeanLens cloned this blog title-for-title in May 2026, so a
gap list from that domain needs a second look before it becomes a content plan.

### 2e. Expansion, only after the above

`dataforseo_labs_google_keyword_suggestions` (long-tail from a seed) and
`dataforseo_labs_google_related_keywords` (semantic neighbours) expand a cluster the site is
already winning in. Use them to deepen, never to open a new cluster on a whim.

### Cost discipline

DataForSEO bills per call. Keep a run inside a sane envelope:

- Batch keyword scoring into **one or two** `keyword_overview` calls, never one call per keyword.
- Prefer Labs endpoints (database) over `*_live_advanced` (fresh scrape). Cap live SERP calls at
  ~5 per run.
- Skip `backlinks_*` and `on_page_lighthouse` unless the run is specifically diagnosing authority
  or technical health — they are not part of a routine content cycle.
- Record roughly how many calls the run made in the audit file, so cost per cycle stays visible.

## Phase 3 — Local inventory

```bash
node seo-tools/content-inventory.mjs --markdown
```

`--check` gives a pass/fail gate, no arguments gives full JSON, `--slug <slug>` gives one post's
row including exactly which posts link in and out. This is the source of truth for:

- **Orphans and weakly-linked posts.** A post with 0 inbound internal links gets no link equity.
- **Cannibalization risk** — title+description token overlap ≥ 0.6 between two posts.
- **Freshness** — `dateModified` older than 180 days.
- **Quick Answer discipline** — the 40–60 word AEO block, counted. Founder-lane and
  product-announcement categories are exempt and excluded automatically.
- **Broken internal links** and covers referenced but missing from disk.

The site sitemap is **generated** by `web/app/sitemap.ts` directly from `web/content/blog/`, so a
new post is in the sitemap the moment the file exists. There is no manual sitemap step and no
sitemap drift to check. New **tools** pages are the exception — those are hardcoded in
`CALC_SLUGS` and `staticEntries` in that file.

## Phase 4 — Analysis

Work out the findings before proposing anything. Cover:

1. **Performance.** 28d vs prior 28d, 90-day direction, data-through date, brand split out from
   non-brand. State plainly when a sample is too small to conclude anything.
2. **Cluster health.** For each cluster in `seo-tools/topical-map.md`: clicks, impressions, best
   position, post count, whether the hub is holding, and direction versus the last run. A cluster
   with spokes and a slipping hub is the most urgent shape.
3. **Striking distance.** Queries at positions 5–20 with ≥30 impressions, joined to real
   DataForSEO volume. Rank by `volume × position-improvement-potential`, not by volume alone.
4. **Decay.** Pages losing clicks month over month. Separate the two causes: the site slipping
   (fixable) versus the keyword itself declining (a `search_volume_trend` problem — refreshing
   the post will not bring back demand that left the market).
5. **Coverage gaps.** Real index verdicts. `Crawled - currently not indexed` deserves a content
   fix; `Discovered` on a recent URL is queue depth. **Confirm the most recent batch is actually
   indexed before recommending more posts** — writing into an indexing bottleneck is fighting the
   wrong blocker.
6. **Cannibalization.** Merge the local detector with GSC query×page data. Two posts splitting one
   query is a merge-or-differentiate decision, never "write a third".
7. **Internal linking.** Every orphan needs a named source post to link from, chosen from the same
   cluster.
8. **AEO.** AI Overview citations from 2b, Quick Answer defects from Phase 3, and whether
   zero-click impression pools are growing.

## Phase 5 — Break it down and propose

Present the breakdown, then the proposals, in this order and this shape. Favour tables over prose.

### 1. Where the site stands

Three to five bullets. What moved, what did not, what the data will not support a conclusion on.
Stamp it with the data-through date, and keep brand queries out of the organic claim.

### 2. Cluster map

| Cluster | Clicks 28d | Δ vs prior | Impressions | Hub position | Posts | vs last run |
|---|---:|---:|---:|---:|---:|---|

### 3. Proposed posts

Up to ten, numbered, strongest first:

| # | Working title | Target keyword | Volume | KD | Intent | Trend | Cluster | Evidence | Skill | Links from |
|---:|---|---|---:|---:|---|---|---|---|---|---|

**Volume, KD, intent and trend come from DataForSEO and are never estimated.** If a keyword
returned no data, write "no data" — do not fill the cell with a guess.

**Evidence** is the specific reason this post should exist: a named query with its impressions and
position, a competitor-gap row, a hub gap, a cannibalization resolution. "Rounds out the cluster"
is not evidence. If fewer than ten have real evidence, **propose fewer and say why**.

**Skill** is which downstream generator writes it: `$blog-post-generator` (guides, roundups,
stats pages), `$comparison-article-generator` (X vs Y), `$feature-page-generator` (tool/feature
pages).

Bias toward **deepening a cluster with existing traction** over opening a new one, and toward
roundup and brand-"alternatives" formats over informational ones, because that is what converts
to clicks on this site.

### 4. Proposed fixes

Numbered separately from the posts so they can be approved independently:

| # | Target | Fix | Why | Effort |
|---:|---|---|---|---|

Typical fixes, in rough priority order:

1. Add inbound internal links to orphan posts from topically adjacent posts in the same cluster.
2. Resolve a cannibalization pair by narrowing one post's keyword and title.
3. Rewrite a Quick Answer that falls outside 40–60 words — it is what AI Overviews extract.
4. Retitle a page with impressions but a position past 20 to match the query Google actually shows.
5. Investigate any `Crawled - currently not indexed` verdict.
6. Refresh a post older than 180 days whose cluster is now better understood **and** whose keyword
   is not in market decline.

Skip anything inside its measurement window (Phase 0), and say that you skipped it and when the
window opens.

### 5. What I recommend

Your actual opinion, in two or three sentences. Which numbered items you would do this run, which
you would hold, and the one thing you would do first if only one thing happened.

### 6. How to approve

```
Reply with:
  all              — every proposed post and fix
  posts 1,3,7      — only those posts
  fixes 2-4        — only those fixes
  posts all, fixes 1
  none             — record the audit and stop
```

Then **write the audit file** with `**Status:** Proposed` and end the turn. Do not continue to
Phase 6, and do not ask "shall I proceed?" as a separate question — the block above already did.

---

# Phases 6–10 run in auto mode, or after approval

Execute **only** the approved scope.

## Phase 6 — Write

For each approved post, follow `seo-tools/writer-spec.md` and `$blog-post-generator` exactly:
frontmatter shape, schema blocks, Quick Answer at 40–60 counted words, H2s as full questions,
FAQ section with matching `FAQPage` schema, honest hedging on every statistic, GainFrame mentioned
at most twice.

Non-negotiables that get caught in review otherwise:

- **App Store link is `https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082`.**
  The other ID is a dead listing.
- **No "not X, but Y" antithesis constructions** in any form, and **no meta section headers**
  ("The Honest Part", "The Real Story"). Both are flagged AI tells.
- **No lead-ins that rank their own section's importance** ("the caveats, because these matter
  more than the wins"). Label the section plainly and start.
- **Roundup entries are all first-class:** every ranked app gets a real screenshot converted to
  WebP, a site link, an App Store link, and ratings verified live from the iTunes API at write
  time. Never screenshot one favoured entry and leave the rest as text.
- **Captions follow the caption contract:** `<p className="post-caption">` inside a wrapper that
  has a scoped CSS rule. A new wrapper class means a new scoped rule in the same commit.
- Cover images come from the `$image-generate` skill into `docs/blog/<slug>/assets/cover.webp`.

A batch in one run is a lot of surface area for voice drift. After writing, re-read the
**Writing Voice & Style** section of `$blog-post-generator` and audit every post against it.

Apply the approved fixes, and update `seo-tools/TODO_SEO.md` — check off what shipped with the
date and slug, following the format at the top of that file.

## Phase 7 — Verify

```bash
node seo-tools/content-inventory.mjs --check
```

Must exit clean. Then build:

```bash
cd web && npm run build
```

Other sessions share this checkout. If the build fails on files this run did not touch, say so
explicitly and confirm the failure exists without your changes before shipping past it.

Confirm every new post is linked **from** an existing post, not only **to** existing posts — a new
post with zero inbound links starts life as an orphan. The `--check` output will tell you.

## Phase 8 — Ship

Stage only the files this run touched — never `git add -A`, because other sessions share this
checkout. Commit, push to `main`, and Workers Builds deploys automatically (see `CLAUDE.md`).

Wait for the deploy and confirm each new URL returns 200 before Phase 9. **Submitting a URL that
is not live yet trains the search engines to distrust the feed.**

```bash
curl -o /dev/null -s -w "%{http_code} %{url_effective}\n" https://gainframe.app/blog/<slug>/
```

## Phase 9 — Indexing

```bash
python3 scripts/indexnow-ping.py https://gainframe.app/blog/<slug>/ https://gainframe.app/blog/<other>/
```

That fans out to Bing, Yandex, Seznam, and Naver, and logs to `scripts/indexnow-log.csv`.
**Google does not participate in IndexNow**, and its Indexing API only accepts `JobPosting` and
`BroadcastEvent`, so Google submission is manual: print a paste-ready list of URLs for
Search Console → URL Inspection → Request indexing, and put that same list in the audit file.

The sitemap needs no resubmission — Google recrawls a known sitemap on its own. Only resubmit if
Search Console reports a fetch error.

Then re-run the Phase 1 inspection sweep and report the not-yet-indexed list, split by verdict.
`Crawled - currently not indexed` goes at the top with a proposed content fix. `Discovered` and
`unknown` on URLs younger than 28 days go in a "too new to judge" line with the date each becomes
fair to assess.

## Phase 10 — Record

Write `seo-tools/content-audits/YYYY-MM-DD.md`:

```markdown
# SEO content cycle — YYYY-MM-DD

**Status:** Proposed | Approved (scope) | Shipped
**Mode:** review | auto
**Data through:** YYYY-MM-DD (GSC lag ~2 days) · **Property:** sc-domain:gainframe.app
**DataForSEO calls:** ~N

## Performance
28d vs prior 28d, 90d direction, brand vs non-brand split, honest note on sample size.

## Cluster health
Cluster table: clicks / delta / impressions / hub position / posts / direction vs last run.

## Market data
Keywords scored this run: volume, KD, intent, yearly trend. Which were killed on intent
mismatch or market decline, and why.

## Proposed
The numbered posts and fixes exactly as presented, so a later run can pick up what was skipped.

## Shipped
New posts (slug, keyword, cluster) and fixes (slug, what changed, why). Empty in a review run.

## Indexing
IndexNow submissions. Paste-ready Google list. Not-yet-indexed, split by verdict.

## Not done / blocked
Anything proposed and declined, plus anything the data could not answer.

## Watch next run
Named queries and URLs with the metric and the date each becomes measurable.
```

Then update:

- `seo-tools/content-audits/strategy.md` — cluster bets, target keywords, what was tried and what
  it produced, hypotheses ruled out, proposed-but-not-built items, and every post inside a
  measurement window with the date it becomes fair to judge.
- `seo-tools/topical-map.md` — add each shipped post to its cluster and revise that cluster's gap
  line.

In a review run, commit only the audit and strategy files, and say that is all you committed.

---

## Guardrails

- **Review mode writes no content.** No post, no `TODO_SEO.md` edit, no commit, no deploy, no
  IndexNow call until the user approves. The proposal is the deliverable.
- **Approval is scoped and single-use.** It covers the numbered items named, this run only.
- **Never call the SEO Receipts connector for this site.** It reads seoreceipts.com.
- **Read-only against Search Console.** This skill measures; it never submits or deletes a sitemap.
- **Never re-edit a page's metadata inside its 7–10 day window**, or judge a new post's position
  inside 28 days, without saying so and why.
- **Confirm indexing before recommending more content.** More posts do not fix a crawl backlog.
- **Never blend metrics.** GSC clicks are not GA4 sessions are not PostHog events. Brand queries
  are not organic SEO wins.
- **Never state a search volume, difficulty, or third-party statistic from memory.** It comes from
  DataForSEO or the iTunes API at run time, or it gets hedged explicitly.
- **Never claim causation.** A post published and a position that improved are two facts.
- **Never propose programmatic SEO.** Deferred by owner decision.
- **Propose fewer items rather than padding to ten.** The count is a ceiling, not a quota.
- **When a phase yields nothing, say so.** An empty finding is data. A fabricated one compounds
  across every future run, because the next run reads this one as ground truth.
