---
name: seo-growth-pulse
description: "Produce a compact, read-only GainFrame organic-growth report by combining Google Search Console and Google Trends through Gum with PostHog product analytics. Use for requests such as \"is SEO working\", \"SEO growth pulse\", \"connect search to installs\", \"why did installs move\", or a current-vs-prior organic performance readout."
---

# SEO Growth Pulse

Measure whether search visibility is turning into qualified product attention. Use the base
Claude/Codex model for synthesis; this skill supplies the data sequence, comparison rules, and
report contract.

Keep the workflow read-only. Do not create PostHog insights, change Search Console, submit URLs,
or write a report file unless the user explicitly asks.

## Defaults

- Use `N = 28` days unless the user supplies another window.
- Target Search Console property `sc-domain:gainframe.app`.
- Target PostHog organization `GainFrame`, app project ID `357433` (currently named
  `Default project`). Resolve by ID, not project name.
- Use the PostHog project timezone and Google Trends region `US` unless requested otherwise.
- Compare the report window with the immediately preceding equal-length window.

## 1. Resolve tools and dates

Prefer Gum's MCP tools. Discover and describe operations before invoking them; exact tool names and
argument shapes can differ by client or Gum version.

Use these Gum catalog operations:

- `searchconsole.searchanalytics.query`
- `trends.daily`

Follow Gum's read path: search the catalog, describe the operation, then invoke it through the
read-only dispatcher. Never send Google credentials through a prompt or tool argument.

If Gum is unavailable, use this repo's read-only GSC MCP tools for Search Console and mark Google
Trends unavailable. Do not scrape Search Console or manufacture trend data. If a shell binary named
`gum` exposes commands such as `choose`, `confirm`, and `style` instead of `search`, `describe`, and
`read`, it is the unrelated Charmbracelet program; stop instead of calling it.

Pull the Search Console daily series first from `today - (2N + 4)` through today. Let `END` be the
latest returned date and treat it as partial if impressions are conspicuously below nearby days.
Set:

- current window: `END - (N - 1)` through `END`
- prior window: the `N` days immediately before the current window

Use these exact calendar windows for both Search Console and PostHog. State the dates in the report.

## 2. Pull Search Console

Fetch in logical batches:

1. Daily totals across both windows.
2. Pages for each window, with enough rows to cover the meaningful traffic distribution.
3. Queries for each window, using the largest practical read-only row limit.

Compute totals and deltas yourself. Calculate CTR as total clicks divided by total impressions and
average position as impression-weighted position; never average row-level CTRs or positions.

From the page rows, identify:

- the largest click and impression movers;
- new pages entering the meaningful set;
- commercial/product surfaces versus informational surfaces;
- each lane's share of impressions, share of clicks, and CTR.

Infer page type from the route and page content, not merely the query wording. Treat the homepage,
product pages, interactive tools, app roundups, comparisons, and alternatives as commercial/product
surfaces when they contain a real path to the app. Treat educational and statistics pages as
informational.

Separate brand queries (`gainframe`, `gain frame`, and close variants) from non-brand queries. GSC
can omit anonymized query rows, so label this as a split of visible query data rather than the full
site total.

Apply these reliability rules:

- Only call a query's position meaningful at 30 or more impressions in the window.
- Label 10–29 impressions directional and omit ranks below 10 impressions.
- Treat single-day page counts below roughly 10 clicks as noise.
- Remember that a lower position number is better.

## 3. Pull PostHog

Confirm the active organization and project before reading; switch to project ID `357433` if
necessary. Do not query the `seoreceipts` or `GainFrameWebsite` projects. Discover the live
event/property schema before querying, then use PostHog trends or HogQL as appropriate.

For both aligned windows, run separate queries rather than relying on PostHog's compare-period
rendering. Query unique users for:

- `outbound_app_store_click` — website visitors who tapped through to the App Store;
- `Application Installed` — all-source app installs.

Also fetch total events for `outbound_app_store_click` and, when the schema supports it, break unique
clickers down by the page/source property. Always exclude test accounts. If raw SQL bypasses the
normal test-account filter, state that limitation.

If an event has no prior-window data, inspect its first-seen date and related instrumentation commit.
Label a newly introduced event as a new baseline; do not report an infinite or misleading percentage
increase.

Do not divide website clickers by app installs. Web and app identities are not linked reliably, and
`Application Installed` contains ASO, direct, social, and other sources. Describe these numbers as a
bridge and an all-source outcome, not a sequential funnel or attributed conversion rate.

## 4. Add demand and change context

Call `trends.daily` for the configured region after identifying the winning and losing content
clusters. Mention only clearly relevant fitness/body-composition topics. Treat daily Trends results
as current context, never as evidence explaining a 28-day change. Say "no relevant daily trend"
when appropriate.

Read `seo-tools/content-audits/strategy.md` and inspect content-related commits from three days before
the prior window through `END`. Connect a movement to a release only when the timing supports it.
Respect every recorded measurement window and distinguish correlation from a measured pre/post
result.

## 5. Report

Keep the answer under roughly 35 lines unless the user requests a deep dive. Use this order:

1. **Verdict** — one sentence answering whether organic growth is strengthening.
2. **Search** — impressions, clicks, CTR, and position, current versus prior with deltas.
3. **SEO to app** — App Store clickers and all-source installs, with the attribution caveat.
4. **What moved** — up to three pages or clusters with concrete numbers.
5. **Page economics** — commercial versus informational shares and CTRs.
6. **Demand/context** — one short Google Trends or release-context observation.
7. **Next read** — one action or measurement to protect, press, freeze, or investigate.

Prefer a precise claim such as "search clicks and all-source installs rose in the same window" over
"SEO caused installs." Distinguish impressions, Search Console clicks, PostHog clickers, and installs
throughout; never blend them into one funnel.
