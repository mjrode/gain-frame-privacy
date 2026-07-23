---
name: google-search-console
description: "Pull fresh GSC data for gainframe.app over the last N days — trend, top articles, top queries, movers — and cross-reference recent site changes. Read-only. Use when the user says \"google-search-console\", \"/google-search-console\", \"gsc report\", \"pull search console\", \"how is search trending\"."
---

# Google Search Console Report Skill

## Overview

One-command organic search report for gainframe.app. Invoked as `/google-search-console [N]` where `N` = number of days to report on (default **7**). Uses the `gsc` MCP server (tools named `mcp__gsc__*` — load via tool search if deferred). Read-only: never submits sitemaps, never deletes anything.

**Property:** `sc-domain:gainframe.app` (always this exact string).

## Phase 0: Resolve the date window

GSC data lags ~2 days behind real time, and the most recent day is often partial.

1. Parse `N` from the arguments (default 7). "google-search-console 14" → N=14.
2. Pull the daily trend FIRST with a generous window:
   `get_advanced_search_analytics(site_url, start_date = today−(2N+4), end_date = today, dimensions="date", row_limit=60)`
3. The **latest date that appears in the response** is `END`. Treat the final day as potentially partial and say so if its impressions look anomalously low vs the prior day.
4. Report window = `START = END−(N−1)` … `END`. Comparison window = the N days before START.

## Phase 1: Pull the data (parallel calls)

All via `get_advanced_search_analytics` on the property:

1. **Daily trend** — already have it from Phase 0. Compute report-window totals vs comparison-window totals (clicks, impressions, CTR, avg position).
2. **Top pages, report window** — `dimensions="page"`, row_limit 25.
3. **Top pages, comparison window** — same, for deltas.
4. **Top queries, report window** — `dimensions="query"`, row_limit 30, sorted by clicks. Optionally a second pull sorted by impressions if the window is ≥7 days (surfaces zero-click impression pools).

## Phase 2: Cross-reference recent changes

`git log --since="<START minus 3 days>" --pretty=format:"%ad %s" --date=short` in the repo root. Note anything content-related (posts published, on-page fixes, metadata changes, promo pages) that could explain movement. Also read the active memory notes on measurement windows — do NOT recommend touching a page that is inside a 7–10-day post-change measurement window.

## Phase 3: Report format

Deliver in this order, prose + small tables, no jargon:

1. **TLDR** — one paragraph: trend direction, record days, the single biggest mover and why.
2. **Trend table** — report window vs comparison window: clicks, impressions, CTR, position. Call out any all-time-record days (compare against the trend data you pulled).
3. **Top articles** — top ~10 pages with clicks/impressions/position and the delta vs the comparison window. Flag: new posts entering the list, pages whose position moved >3 spots either way.
4. **Top queries** — split **brand** (gainframe / gain frame variants) from **non-brand**. For non-brand, note position: queries at position 1–5 are wins to protect; 6–15 are striking distance; high-impression zero-click queries are AEO signals.
5. **Watch items** — new posts not yet getting impressions (check indexing with `batch_url_inspection` ONLY if a post is >5 days old with zero impressions), pages inside measurement windows (say when the window opens), and anything anomalous.

## Rules

- **Never recommend a metadata change** for a page changed within the last 7–10 days (check git log for the page before suggesting). Content-depth suggestions are fine.
- Brand queries (`gainframe`, `gain frame`, `gainframe app`) are tracked separately — they reflect TikTok/social halo, not SEO wins.
- **Position reliability threshold:** only quote a query's position as meaningful if it has ≥30 impressions in the window; 10–30 impressions = "directional"; under 10 = anecdote, never present as a rank (GSC position averages only the impressions that occurred — a 2-impression "position 1" is usually one personalized result or an AI Overview citation, not a reproducible rank). SERP features (AI Overview citations, image packs, Discussions units) count as positions too.
- Single-day click counts under ~10 per page are noise; call trends only on multi-day patterns.
- If the `gsc` MCP server is unavailable, say so and stop — do not try to scrape the GSC UI.
- Keep the whole report under ~40 lines of output. This is a pulse check, not a deep-dive; suggest a deep-dive only if something looks broken.
