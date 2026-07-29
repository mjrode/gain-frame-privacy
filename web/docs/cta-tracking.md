# CTA tracking: how to read App Store click data

How download CTAs are instrumented, and the two traps that make naive reads wrong.
Written 2026-07-29 after a false alarm (see "Worked example" at the bottom).

## The two events

| Event | Fired when | Where |
|---|---|---|
| `outbound_app_store_click` | Any click on an `apps.apple.com` anchor | `AppStoreClickTracker` — site-wide delegated capture-phase listener |
| `cta_platform_alternative_click` | An **Android** user clicks a download CTA | `PlatformDownloadLink` — routes them to `/tools/body-fat-from-photo/` instead |

GainFrame is an **iOS-only** app. `PlatformDownloadLink` detects Android and swaps the
destination to the web body-fat tool, because an Android user cannot install from an App
Store listing. That anchor is not an `apps.apple.com` URL, so it never reaches
`AppStoreClickTracker`.

## Rule 1 — never read `outbound_app_store_click` alone as CTA health

Android is roughly **a third of homepage CTA volume**. Reading only
`outbound_app_store_click` understates total CTA engagement, and any change to platform
routing looks like a cliff.

Do this instead — sum both events:

```sql
SELECT toDate(timestamp) AS d,
       countIf(event = 'outbound_app_store_click')       AS appstore,
       countIf(event = 'cta_platform_alternative_click') AS android_alt,
       count()                                           AS total_cta
FROM events
WHERE event IN ('outbound_app_store_click', 'cta_platform_alternative_click')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY d ORDER BY d
```

Or split by platform, which also tells you *why* a number moved:

```sql
SELECT toDate(timestamp) AS d, properties.$os AS os, count() AS n
FROM events
WHERE event IN ('outbound_app_store_click', 'cta_platform_alternative_click')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY d, os ORDER BY d, n DESC
```

An iOS-only view is the right denominator for "did the App Store CTA get worse":
filter `properties.$os = 'iOS'`. Mixing platforms hides mix shift.

## Rule 2 — `ct` is placement-level, not page-level

Two layers set the Apple campaign token:

1. **Component-declared (preferred).** `PlatformDownloadLink` and `DownloadQr` build the URL
   via `appStoreUrlWithCampaign(campaign)`, so the anchor ships with its own `ct`. The
   homepage alone emits four: `web-home-hero`, `web-home-nav`, `web-home-qr`,
   `web-home-closing`. Blog CTAs emit `web-blog-<intent>`, `web-blog-qr`, `web-blog-nav`,
   `web-blog-index`.
2. **Path fallback.** For plain `apps.apple.com` anchors in static blog bodies,
   `AppStoreClickTracker` appends `campaignForPath(pathname)` at click time —
   `web-home`, `web-blog`, `web-bftool`, and friends (see `web/lib/site.ts`).

`AppStoreClickTracker` reads the anchor's existing `ct` when one is present and reports
**that** value on the event, so PostHog and App Store Connect agree.

> **Historical gap:** before 2026-07-29 the tracker always recomputed
> `campaignForPath(pathname)` and ignored the declared token. Every homepage CTA reported
> `ct = 'web-home'` in PostHog while ASC saw four distinct tokens, and `web-home-hero` and
> its siblings appeared nowhere in PostHog. **Any `ct` analysis spanning dates before
> 2026-07-29 is page-level only** — do not compare pre-fix `web-home` against post-fix
> `web-home-hero` as if they were the same series.
>
> Expect these PostHog series to step at the fix date, with no behaviour change behind it:
> `web-home` → splits into `web-home-{hero,nav,qr,closing}`; `web-blog` → splits into
> `web-blog-{<intent>,index,index-qr,nav,qr}`; `web-nav` shrinks, because blog nav CTAs
> now correctly report the `web-blog-nav` they always sent to ASC. To trend across the
> boundary, group on a prefix (`splitByChar('-', ct)` first three segments) rather than
> the exact token.

## Rule 3 — the dedup is per source + placement, per day

`trackOncePerDay` keys on `` `${source}:${ctaContent}` `` in localStorage. One user clicking
the same CTA twice in a day counts once; the hero and the closing CTA count separately
because their `data-cta-content` differs. Counts are therefore closer to *unique daily
clickers per placement* than raw clicks — fine for trends, wrong for "how many taps".

## Worked example: the 2026-07-25 false alarm

`ct=web-home` fell 34/day → 10/day on 7/25. It read as a broken homepage CTA. It was not.

What actually happened: the 7/21 landing-page rewrite (`aee5c65`) sat undeployed until the
Worker routing fix (`2a77529`) shipped it on **7/25**, and `PlatformDownloadLink` followed on
7/26 (`16b1520`). Once Android traffic moved to `cta_platform_alternative_click`:

| Metric (7/18–24 → 7/26–28) | Pre/day | Post/day | Change |
|---|---|---|---|
| iOS App Store clicks | 16.3 | 10.0 | −38.6% |
| Android CTA clicks | 10.9 | 22.0 | +102.6% |
| **Total CTA clicks** | **32.4** | **34.3** | **+5.9%** |
| Homepage sessions (GA4) | 95.3 | 68.3 | −28.3% |
| **Total CTA CTR** | **34.0%** | **50.2%** | **+47.6% rel** |

Total engagement was **up** on 28% less traffic. The old number was inflated by ~11
Android clicks/day bouncing off a listing they could never install from, and those users
take the web-tool offer at roughly double the rate.

Cost of the mistake: a "highest ROI, fix this first" recommendation in the 2026-07-29 MRR
audit that pointed at a healthy component. Both rules above exist to prevent a repeat.
