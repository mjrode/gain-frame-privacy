---
name: keyword-discovery
description: "Discover, score, and cluster SEO keyword opportunities for GainFrame using free Google data (autocomplete + SERP analysis) plus Google Search Console data (live via MCP, or CSV export as fallback). Outputs a prioritized backlog that feeds blog-post-generator and comparison-article-generator. Use when the user says \"find keywords\", \"keyword research\", \"discover keywords\", \"keyword opportunities\", \"what should I write about\", \"/keyword-discovery\"."
---

# Keyword Discovery Skill

## Overview

This skill replicates the keyword-research workflow of GrowGanic.io using **free signals** (Google autocomplete, SERP analysis via `WebSearch`, optional competitor sitemap mining) plus **Google Search Console data** (live via the `mcp__gsc__*` tools when configured, or a CSV export as fallback). It does NOT pull paid Ahrefs/SEMrush volume numbers. Instead, it gives you **comparative tiers** (high/med/low) and **difficulty heuristics** based on what dominates the SERP.

Output:
- A timestamped report at `seo-tools/keyword-research/[YYYY-MM-DD]-[topic-slug].md`
- New rows appended to `TODO_SEO.md` (created if it doesn't exist)
- Each opportunity tagged with the recommended downstream skill (`blog-post-generator` for guides/listicles/definitions, `comparison-article-generator` for X-vs-Y posts)
- A **GSC Quick Wins** section (when CSV data is present) listing high-impression/low-CTR queries GainFrame is already ranking for

**Honest limitation:** Without a paid API, monthly search volume is an *estimate* derived from Google Trends comparison + autocomplete depth + PAA box count. Treat numeric estimates as relative ranks within the analysis, not absolute monthly searches. State this explicitly in every output report.

---

## The Workflow

When triggered, follow these phases sequentially. Do not skip phases.

### Phase 0: Inputs

Ask the user for:
1. **Seed topic or keyword(s)** — e.g. "body fat measurement", "progress photos", or a competitor name. If the user has no seed, propose 2-3 based on recent blog posts (`ls /Users/michael.rode/code/project/gain-frame-privacy/web/content/blog/ | tail -5`).
2. **Optional: competitor URLs or names to mine** — if provided, check `/seo-tools/competitor-research/[name].md` for an existing profile. If found, use its "Topics they cover but GainFrame does NOT" list as additional seeds. If not found and URLs were provided, run `competitor-scan` first to generate the profile, then use its output. Note in the report which seeds came from which competitor.
3. **Optional: scope filter** — informational only, comparison only, all intents (default).

### Phase 0.5: GSC Data Import (run automatically — no user input needed)

Two data paths in priority order. **Always try the MCP first** — it returns fresher data and skips the manual export step.

#### Path A (preferred): Google Search Console MCP

If the `mcp__gsc__*` tools are available in the current session, pull data live:

1. Confirm property is reachable: `mcp__gsc__list_properties` — expect `sc-domain:gainframe.app (siteFullUser)`. If the call errors, skip to Path B.
2. Pull last 90 days of queries (matches what the CSV export would contain):
   ```
   mcp__gsc__get_search_analytics(
     site_url="sc-domain:gainframe.app",
     days=90,
     dimensions="query"
   )
   ```
3. Optionally also pull `dimensions="page"` for List C cross-referencing, and use `mcp__gsc__compare_search_periods` (28d vs prior 28d) to spot trending queries.
4. Feed the returned rows into the same Lists A/B/C logic below (Query / Clicks / Impressions / CTR / Position columns map directly).

The MCP always reflects the GSC Performance report's current state with the standard ~2-day lag. No manual export step required.

#### Path B (fallback): CSV export

If the MCP isn't available (e.g. credentials not yet configured, or running in a non-MCP context), check for a Google Search Console export at:

```
/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/gsc-data/queries.csv
```

**How to export from GSC:** Search Console → Performance → Queries tab → Export → Download CSV. Save the file to that path (or symlink the latest dated export folder's `Queries.csv` to it).

**If the file exists**, parse it and produce three lists from the data:

GSC exports use this column format: `Query, Clicks, Impressions, CTR, Position`

#### List A: Quick-Win CTR Fixes (already ranking, not capturing clicks)

Filter to rows where:
- `Position` is between 4.0 and 20.0 (ranking but below the top-3 click zone)
- `Impressions` ≥ 10 (enough volume to matter)
- `CTR` < 10% (underperforming for that position)

For each: check whether GainFrame already has a blog post covering that query (`grep -ri "query" /Users/michael.rode/code/project/gain-frame-privacy/web/content/blog/*.mdx`). If a post exists, this is a **CTR optimization candidate** (the post needs a better title tag or meta description, not a new post). If no post exists, this is a **ranking gap** — we rank but have no dedicated content.

Surface these in the report as:
```
**[query]** — pos [X], [N] impressions, [Y]% CTR
  → Status: [CTR fix needed on /blog/slug/] OR [ranking gap — no dedicated post]
  → Action: [rewrite title/meta] OR [add to backlog]
```

#### List B: Zero-Click Rankings (ranking for queries that get impressions but no clicks)

Filter to rows where:
- `Clicks` = 0
- `Impressions` ≥ 5
- `Position` ≤ 30

These often mean: wrong meta title, snippet not matching intent, or we rank for a SERP dominated by featured snippets/images that eat all clicks. Surface these for manual review — do not automatically add to the backlog.

#### List C: Competitor-Signal Queries (unexpected queries GainFrame ranks for)

Filter to rows where:
- The query contains a competitor name (scan for: metamorph, trackbod, spren, physique ai, body.app, progress app, dexa, naked labs, fittrack, cronometer, myfitnesspal)
- Position ≤ 50

These reveal branded queries where users are comparing us — high commercial intent. Surface as comparison-article opportunities if we don't have a dedicated post.

#### If both the MCP AND the CSV are unavailable:

Print this message in the chat (one time only):

> **GSC data not found.** Two ways to unlock GSC Quick Wins:
>
> **A. Recommended — wire up the GSC MCP** (one-time, ~10 min):
> 1. Configure the GSC MCP for Codex with `GSC_CREDENTIALS_PATH` pointing to a service-account JSON
> 2. Add that service-account email as a user in GSC → Settings → Users and permissions
> 3. Restart Codex
> 4. See `seo-tools/gsc-data/SETUP.md` for full steps
>
> **B. CSV fallback:**
> 1. Go to [Google Search Console](https://search.google.com/search-console) → Performance → Queries
> 2. Set date range to last 3 months
> 3. Click Export → Download CSV
> 4. Save to `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/gsc-data/queries.csv`
>
> Continuing with autocomplete + SERP analysis only.

Then proceed to Phase 1 without blocking.

### Phase 1: Seed Expansion

For each seed keyword, expand the candidate pool to 30-80 keywords:

1. **Google Autocomplete** (free, reliable JSON endpoint):
   ```
   WebFetch URL: https://suggestqueries.google.com/complete/search?client=firefox&q=[SEED]
   ```
   Parse the JSON array. Take all suggestions.

2. **Letter-by-letter expansion** (the "alphabet soup" technique): For each seed, also fetch suggestions for `[SEED] a`, `[SEED] b`, ... through `[SEED] z`. This surfaces long-tail variants. Batch these in parallel WebFetch calls.

3. **Question expansion**: Fetch suggestions for `how [SEED]`, `what [SEED]`, `why [SEED]`, `vs [SEED]`, `[SEED] vs`, `best [SEED]`, `[SEED] alternative`. These surface commercial-intent and comparison keywords.

4. **Competitor topic mining** (if competitor URLs provided): Fetch each competitor's `/sitemap.xml` or `/blog/` index. Extract URL slugs and page titles. Treat each unique title as a candidate keyword.

5. **Deduplicate** the combined list. Strip near-duplicates (same lemma, plural/singular variants — keep the higher-volume form when known).

**Output of Phase 1:** A flat list of 30-80 candidate keywords. Show this to the user as a checkpoint before running expensive SERP analysis on all of them. Ask if they want to prune or proceed.

### Phase 2: SERP Analysis

For each candidate keyword (process in parallel batches of 5-10 to stay under timeout):

1. Run `WebSearch` for the exact keyword.
2. From the top 10 results, extract:
   - **Domains** (count Reddit/Quora/StackExchange separately from major brands)
   - **Page titles and snippets** (to classify intent)
   - **Presence of featured snippet, PAA box, video carousel, "People also search for"**

2a. **Early-skip checks** (before scoring difficulty — these short-circuit further analysis):

   - **Wrong intent — image search**: If 6+ of the top 10 results are stock-photo/image domains (gettyimages.com, istockphoto.com, shutterstock.com, adobe.com/stock, freepik.com, vecteezy.com, dreamstime.com, alamy.com, pexels.com, unsplash.com), classify as `intent: image-search` and **skip — wrong content type**. Note in the skipped section of the report. Example from GainFrame test run: `visceral fat photos` returned 9/10 stock photo sites.

   - **Wrong intent — e-commerce/product**: If 6+ of the top 10 are pure product listings (amazon.com, ebay.com, walmart.com, target.com, manufacturer product pages with `/product/` or `/p/` patterns), classify as `intent: transactional-product` and skip unless you're writing a buying guide.

   - **Hospital-authority lockout**: If 4+ of the top 10 are tier-1 health authorities (mayoclinic.org, clevelandclinic.org, my.clevelandclinic.org, health.clevelandclinic.org, webmd.com, healthline.com, harvard.edu, health.harvard.edu, nih.gov, ncbi.nlm.nih.gov, pmc.ncbi.nlm.nih.gov, medlineplus.gov, kp.org, kaiserpermanente.org, scripps.org, stanford.edu, hopkinsmedicine.org), short-circuit the difficulty score to **95** and mark as **skip unless you have major backlinks**. Don't waste cycles on the full heuristic — the SERP is locked. Note in the skipped section.

   - **Hyper-narrow numeric variant**: If the keyword is `[term] [number]` where the number is one of a continuous series (e.g. `visceral fat level 5`, `visceral fat range female 6`), skip and roll into the broader keyword (`visceral fat level`, `visceral fat range female`).

3. Compute a **Difficulty Score (0-100)** using these heuristic deltas (start at 30, add/subtract):
   - `+20` per Wikipedia result in top 5
   - `+15` per major health/medical authority (WebMD, Healthline, Mayo Clinic, Cleveland Clinic, NIH, Examine.com) in top 10
   - `+10` per major fitness brand (Men's Health, Bodybuilding.com, Muscle & Strength) in top 10
   - `+10` if a featured snippet exists (harder to displace)
   - `−10` per Reddit/Quora/StackExchange/forum result in top 10 (signals weak commercial competition)
   - `−15` per result from a small blog (DR < indeterminate, no major brand) in top 10
   - `−10` if top 10 is dominated by old content (any signals of stale dates in snippets)
   - Clamp to `[0, 100]`

4. Compute a **Volume Tier** (Low / Med / High):
   - `High` if Google autocomplete returned 8+ suggestions for this keyword AND at least one PAA box appears
   - `Medium` if 4-7 autocomplete suggestions OR PAA present
   - `Low` otherwise
   - Optionally, refine with Google Trends: `WebFetch https://trends.google.com/trends/explore?q=[KEYWORD]` and look for 12-month interest. (Note: Trends scraping is unreliable — fall back to autocomplete signals if the fetch fails.)

5. Classify **Intent**:
   - `informational` — "what is", "how to", "guide", "explained", "meaning"
   - `comparison` — "vs", "alternative", "or", "which is better", "compare"
   - `commercial` — "best", "top", "review", "[year]"
   - `transactional` — "buy", "price", "free", "download", "app"
   - `navigational` — branded queries (e.g. "gainframe app")

6. Recommend **content type and downstream skill**:
   - `informational` → guide → `blog-post-generator`
   - `comparison` (X vs Y) → comparison article → `comparison-article-generator`
   - `commercial` (best of) → listicle → `blog-post-generator` (note: needs listicle template)
   - `informational` + "what is" → definition post → `blog-post-generator`

### Phase 3: Topic Clustering

Group the analyzed keywords into 3-7 semantic clusters. Use intuitive groupings — examples from GainFrame's space:

- "Body Fat Measurement Methods"
- "Progress Photos & Tracking"
- "AI Body Composition Apps"
- "DEXA / Bod Pod / Calipers Comparisons"
- "Visceral Fat & Health Metrics"

For each cluster:
- Total volume tier (sum across keywords)
- Existing coverage (count keywords already covered by an existing post in `web/content/blog/`)
- Gap count (how many high/med-volume keywords have no article)
- Pillar candidate (the highest-volume informational keyword in the cluster)
- Supporting candidates (long-tail keywords that link to the pillar)

#### Consolidation Pattern (important)

**Before recommending each keyword as a standalone article**, check for consolidation opportunities:

- **If 3+ keywords in the same cluster share the same audience and intent** AND each individually scores Med-or-lower volume, **recommend ONE combined post** that targets all of them rather than three weak posts. This is almost always better for SEO (fewer thin pages, more topical authority on one URL) and easier to write well.
- **Example from GainFrame test run:** `visceral fat appearance` + `visceral fat hard belly` + `visceral fat how to tell` were three weak-on-their-own keywords. Combined into one honest post ("Can You See Visceral Fat? What It Looks Like and Why That's the Wrong Question") they cover all three queries with stronger E-E-A-T signal.
- **When to keep them separate:** if each keyword has High volume on its own, OR if the search intent is meaningfully different (e.g. "what is X" is definitional, "how to do X" is procedural — keep separate even if same topic).
- **In the report**, surface combined posts as a single high-opportunity target with a "covers keywords: [list]" sub-bullet.

### Phase 4: Output

#### 4a. Write the report

Create `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/keyword-research/[YYYY-MM-DD]-[topic-slug].md`:

```markdown
# Keyword Research: [Topic]

**Generated:** YYYY-MM-DD
**Seeds:** [seed1, seed2, ...]
**Candidates analyzed:** N
**High-opportunity targets:** M
**GSC data:** [present — N queries analyzed] OR [not present — export instructions in report]

> ⚠️ All volume figures are *estimates* derived from free Google signals (autocomplete depth, PAA presence, Trends). They are relative ranks within this analysis, not absolute monthly searches. For absolute numbers, validate in Ahrefs/SEMrush before committing to a major content investment.

## GSC Quick Wins

*(Only present when GSC data is available — either via the `mcp__gsc__*` tools or `seo-tools/gsc-data/queries.csv`. Omit this section otherwise.)*

These are queries GainFrame is already ranking for where we can improve without writing new content.

### CTR Fixes (ranking 4–20, impressions ≥ 10, CTR < 10%)

| Query | Position | Impressions | CTR | Action |
|---|---|---|---|---|
| [query] | [pos] | [N] | [%] | Rewrite title on /blog/slug/ |
| [query] | [pos] | [N] | [%] | No dedicated post — add to backlog |

### Zero-Click Rankings (impressions ≥ 5, 0 clicks, position ≤ 30)

| Query | Position | Impressions | Notes |
|---|---|---|---|
| [query] | [pos] | [N] | Featured snippet eating clicks — consider targeting snippet format |

### Competitor-Signal Queries (competitor name in query, position ≤ 50)

| Query | Position | Impressions | Clicks | Existing post? |
|---|---|---|---|---|
| [query] | [pos] | [N] | [N] | /blog/slug/ OR none |

## High-Opportunity Targets

These are the keywords with the highest (volume tier) ÷ (difficulty) ratio AND no existing GainFrame article.

### 1. [keyword]
- **Volume tier:** High / Med / Low
- **Difficulty:** N/100 ([signal summary, e.g. "Reddit + Quora dominate top 5"])
- **Intent:** comparison
- **Recommended skill:** `comparison-article-generator`
- **Suggested title:** "..."
- **Why opportunity:** [1-2 sentences — what's the gap?]
- **Existing coverage:** None / [link to similar post]

[Repeat for top 5-10]

## Topic Clusters

### Cluster 1: [Name]
**Total volume tier:** High
**Existing GainFrame coverage:** N posts
**Gaps:** M keywords without articles
**Pillar candidate:** [keyword]
**Supporting:** [keyword 1, keyword 2, ...]

| Keyword | Volume | Difficulty | Intent | Existing? |
|---|---|---|---|---|
| ... | High | 25 | informational | – |

[Repeat for each cluster]

## Skipped (low ROI)

These keywords were analyzed but skipped from the backlog:
- `[keyword]` — difficulty 80+, dominated by Wikipedia/Healthline. Not worth pursuing without paid links.
- `[keyword]` — already covered by [existing post slug].

## Backlog Updates

Appended these N items to TODO_SEO.md:
- [ ] [keyword] (High/25, comparison-article-generator)
- [ ] [keyword] (Med/40, blog-post-generator)
```

#### 4b. Append to TODO_SEO.md

If `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/TODO_SEO.md` does not exist, create it with this header:

```markdown
# SEO Content Backlog

This file tracks keyword targets for blog posts and comparison articles. Items are added by the `keyword-discovery` skill and consumed by `blog-post-generator` and `comparison-article-generator`.

Format: `- [ ] keyword (volume-tier/difficulty, downstream-skill) — added YYYY-MM-DD`
When a post is published, replace `[ ]` with `[x]` and append ` — published YYYY-MM-DD as /blog/[slug]/`.

## Backlog
```

Then append the new high-opportunity targets in priority order (highest volume÷difficulty first).

#### 4c. Summarize for the user

Give a one-screen summary in chat:
- N candidates analyzed
- M high-opportunity targets identified
- Top 3 by name with one-line "why"
- Path to the full report
- Suggested next step: "Want me to start drafting [top keyword] using `blog-post-generator`?"

---

## Heuristics Reference

### Free Google Endpoints

| Purpose | Endpoint | Notes |
|---|---|---|
| Autocomplete | `https://suggestqueries.google.com/complete/search?client=firefox&q=QUERY` | Returns JSON array. Reliable, rate-limited at high volume. |
| SERP analysis | Use `WebSearch` tool | Returns top 10 with titles + snippets + URLs. |
| Trends | `https://trends.google.com/trends/explore?q=QUERY` | Scraping unreliable; use as nice-to-have, not source of truth. |

### Difficulty Signal Cheat Sheet

**Auto-skip signals (handled in Phase 2a — short-circuit the analysis):**
- 6+ stock-photo domains in top 10 → wrong intent (image search)
- 6+ pure-product domains in top 10 → wrong intent (transactional product)
- 4+ tier-1 health authorities in top 10 → hospital lockout (difficulty = 95, skip without backlinks)
- Hyper-narrow numeric variant → roll into broader keyword

**Easier targets (lower difficulty):**
- Reddit thread in top 5 → real users want this answer, no one has written a great article
- Multiple Quora results → same signal, plus you can mine the questions
- Forums (T-Nation, Reddit r/fitness, MyFitnessPal community) → fitness niche specifically
- Old / undated content in top 10 → easy to refresh-and-rank
- No featured snippet → snippet is open territory

**Harder targets (skip unless you have backlinks):**
- Wikipedia in top 3
- WebMD/Healthline/Mayo in top 5
- Multiple `.gov` or `.edu` results
- Rich SERP features (knowledge panel, video carousel, image pack) crowding organic
- Featured snippet held by a high-DA brand

### Intent Signal Cheat Sheet

| Query pattern | Intent | Article type |
|---|---|---|
| "what is X" | informational definition | short definition post |
| "how to X" | informational how-to | guide post |
| "X vs Y" / "X or Y" | comparison | comparison-article-generator |
| "best X for Y" | commercial listicle | listicle |
| "X review" | commercial deep-dive | review/comparison |
| "X alternative" | comparison | comparison-article-generator |
| "[brand] app" | navigational | landing page, not blog |
| "X photos" / "X images" / "X pictures" | **image search** | **skip** — not a content opportunity |
| "buy X" / "X for sale" / "X amazon" | **transactional product** | skip unless writing a buying guide |

---

## Rules & Constraints

- **Never invent volume numbers.** If you can't get a signal, say "unknown — needs paid validation". GrowGanic shows real numbers because it pays for an API; we don't, so we use tiers.
- **Always check existing coverage** before recommending a keyword. Use `ls /Users/michael.rode/code/project/gain-frame-privacy/web/content/blog/` and `grep -rl "keyword" web/content/blog/*.mdx`. A keyword already covered by an existing post is NOT an opportunity — it's a candidate for refresh, which is a different workflow.
- **Cap analysis at 80 candidates per run** to avoid runaway WebSearch calls. If the seed expansion produces more, prune to the most promising 80 before Phase 2.
- **Batch SERP analysis** — run WebSearch in parallel batches of 5-10 keywords at a time, not sequentially.
- **Always include the "Honest limitation" callout** in every report explaining that volume is an estimate, not a paid-API number.
- **Never overwrite an existing report file.** If today's report exists, append a `-2`, `-3` suffix.
- **The skill produces a report and a backlog update — it does NOT publish anything.** Publishing is the downstream skill's job.

---

## Integration with Other Skills

**Upstream:**
- `competitor-scan` — produces a per-competitor profile at `seo-tools/competitor-research/[name].md` with a "Topics they cover but GainFrame does NOT" list. Phase 1 of this skill should check that directory first when the user mentions a competitor by name, and use those topics as additional seeds before running autocomplete expansion.
- **GSC data** — Phase 0.5 reads it automatically on every run. Two paths:
  - **Preferred (live):** `mcp__gsc__*` tools (`list_properties`, `get_search_analytics`, `compare_search_periods`, `batch_url_inspection`). Property is `sc-domain:gainframe.app`. No CSVs to manage. See `seo-tools/gsc-data/SETUP.md` for one-time setup.
  - **Fallback (CSV):** user drops `seo-tools/gsc-data/queries.csv` into the project. No OAuth, no API key. To refresh, re-export from GSC and overwrite the file.

**Downstream:**
- `blog-post-generator` — for guides, how-tos, definitions, listicles. Reads `TODO_SEO.md` to pick its next topic.
- `comparison-article-generator` (planned) — for X-vs-Y posts. Reads `TODO_SEO.md` filtered to `comparison-article-generator` targets.

**GSC-specific downstream actions:**
- CTR fixes (List A, existing post) → edit the post's `<title>` and `<meta name="description">` — no new post needed.
- Ranking gaps (List A, no post) → add to `TODO_SEO.md` as a new backlog item.
- Competitor-signal queries (List C, no post) → add as `comparison-article-generator` targets.

When this skill finishes, suggest the user run the appropriate downstream skill on the top opportunity. Don't run it automatically — give them the choice.

---

## Reference Files

- `/Users/michael.rode/code/project/gain-frame-privacy/product-context.md` — **READ THIS FIRST.** Authoritative source for tagline, target audience, category, platform, differentiators, honest limitations, and brand voice. Use it to derive default seed keywords (Phase 0 input #1) when the user doesn't provide one — pull category + differentiator phrases from this file.
- `/Users/michael.rode/code/project/gain-frame-privacy/web/content/blog/` — existing blog posts as `.mdx` files (check for coverage gaps)
- `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/TODO_SEO.md` — keyword backlog (created on first run if absent)
- `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/keyword-research/` — output directory for reports (create if absent)
- **GSC data sources** — Phase 0.5 tries these in order:
  - `mcp__gsc__*` tools (preferred — live, no exports). Property: `sc-domain:gainframe.app`. Configure the GSC MCP for Codex with the `GSC_CREDENTIALS_PATH` environment variable. See `seo-tools/gsc-data/SETUP.md`.
  - `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/gsc-data/queries.csv` — CSV fallback (optional). Column format: `Query,Clicks,Impressions,CTR,Position`. Export from Search Console → Performance → Queries → Export CSV. The `seo-tools/gsc-data/` directory is gitignored.
- `/Users/michael.rode/code/project/gain-frame-privacy/.agents/skills/blog-post-generator/SKILL.md` — downstream skill for most article types
