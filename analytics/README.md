# GainFrame Analytics — durable growth data store

A single home for the metrics that tell us where GainFrame stands and what to work on.
Pulled once, saved here, referenceable later. Built 2026-05-29.

## Layout

| Path | What |
|------|------|
| `state-of-growth-YYYY-MM-DD.md` | **Start here.** The synthesis — answers the 5 questions + the focus call. |
| `benchmarks/industry-benchmarks.md` | Health & Fitness subscription benchmarks (trial conv, retention, churn) w/ sources |
| `inputs/ad-spend-weekly.csv` | Manual: weekly paid spend per channel (TikTok / Reddit / Apple Search Ads) |
| `inputs/appstore-connect.csv` | Manual: App Store Connect impressions → downloads → conversion |
| `raw/<date>/revenuecat/` | RC v2 charts + metrics overview (MRR, subs, trials, churn, LTV, retention) |
| `raw/<date>/posthog/` | App funnels, retention cohorts, DAU/WAU/MAU, engagement trends |
| `raw/<date>/ga4/` | Website traffic (weekly) + channel mix |
| `raw/<date>/gsc/` | Organic search clicks/impressions (weekly) |

## Data sources & how to refresh

| Source | Tool / handle | Notes |
|--------|---------------|-------|
| RevenueCat | `python3 ~/.claude/skills/revenuecat/scripts/rc.py metrics` / `chart <id> --start-date --end-date --resolution week` | MRR, subs, trials, churn, LTV, retention |
| PostHog | `posthog` MCP — `query-trends`, `query-funnel`, `query-retention` (always `filterTestAccounts:true`) | App events. Install event = **`Application Installed`** (capital; lowercase is empty) |
| GA4 | `analytics-mcp` `run_report`, property **526084497** | Website only (no app property) |
| GSC | `gsc` MCP, site **sc-domain:gainframe.app** | Organic search, 2–3 day lag |
| Apple App Store Connect | **manual CSV** → `inputs/appstore-connect.csv` | No API/MCP |
| Ad spend (TikTok/Reddit/ASA) | **manual CSV** → `inputs/ad-spend-weekly.csv` | No API/MCP |

The recurring `mrr-audit` skill (`~/.claude/skills/mrr-audit/`) automates the weekly snapshot version
of this and writes to `docs/audits/mrr/`. This `analytics/` folder is the deeper, user-facing home.

## Data-integrity notes (read before trusting a number)
- **`check_in_completed` is dead** (3 events ever). The live check-in event is **`daily_check_in_tapped`**.
- **PostHog `trial_converted` under-reports** (0–3/wk vs RC's 3–10). **Use RevenueCat for conversion counts.**
- `subscription_started` (PostHog) fires at **trial start**, not paid conversion — don't read it as "paid."
- The week beginning **2026-05-24 is partial** (data pulled Fri 5/29 = 6 of 7 days). Prorate flow metrics ×7/6.
- GA4 **ISO week 11 (Mar 9–15) newUsers = 1,420 at 0.19 engagement** looks like bot/junk traffic — treat as anomaly.
- Early-May install/sub spike (weeks 5/3, 5/10) was **paid on BOTH channels** — TikTok $987 (wk 5/3) + Apple
  Search Ads $1,568 (incl. a $1,185 ASA burst in wk 5/10). All paid stopped after May 10 → installs reverted to
  the organic floor (~120/wk). Don't read the peak as trend. Total paid 3mo ≈ $5,674 (TikTok $1,881, ASA $2,498, Reddit $1,295).
- **Reddit = $1,295** (correct figure, from `ad-data/reddit-by-date.csv`, col "Amount Spent (USD)"). The older
  `Total Reddit Ad spend .csv` showed only $117 — it was incomplete; use the by-date file. Reddit was a late-March
  Traffic campaign ($447 + $848) with ~0 tracked app conversions.
- **ASA spend gotcha:** authoritative total = **$2,498** (campaign-level report `ad-data/Apple Ads Campaign 2143510307 Ad Groups (1) - updated.csv`, Feb 1–May 29, all ad groups; 443 installs, $5.64 CPI, ON_HOLD).
  The `ad-data/detailed-apple-ads.csv` search-terms file sums to ~$4,979 for ONE ad group but **double-counts** ~2.3×
  (ASA attributes one install/spend across many auto-discovered search terms) — do NOT sum search-terms reports for totals.
- User-provided source exports live in `ad-data/` (TikTok/Reddit/Apple Ads) and `apple-analytics/` (ASC). The
  `inputs/*.csv` templates are superseded by these; parsed weekly rollups are in `raw/2026-05-29/`.
