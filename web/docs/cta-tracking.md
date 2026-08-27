# CTA tracking: how to read App Store click data

How download CTAs are instrumented, and the two traps that make naive reads wrong.
Written 2026-07-29 after a false alarm (see "Worked example" at the bottom).

## The three events

| Event | Fired when | Where |
|---|---|---|
| `outbound_app_store_click` | Any click on an `apps.apple.com` anchor | `AppStoreClickTracker` — site-wide delegated capture-phase listener |
| `cta_platform_alternative_click` | An **Android** user clicks a download CTA | `PlatformDownloadLink` — routes them to `/tools/body-fat-from-photo/` instead |
| `web_download_clicked` | A consented GainFrame App Store/OneLink click, with a unique click ID and page-level attribution | `AppStoreClickTracker` — site-wide delegated capture-phase listener |

## Result CTA A/B/C experiment

`tool_result_cta_v1` assigns each browser one stable result-CTA angle:

| Variant | Angle | Primary action |
|---|---|---|
| `improve` (A) | Diagnose the weakest area | Show my 12-muscle breakdown |
| `track` (B) | Turn a snapshot into a trend | Track my next check-in |
| `future` (C) | Turn the result into a target | Preview my future physique |

The assignment is stored under `gainframe:experiment:tool_result_cta_v1` and
does not identify the visitor. QA can force a presentation with
`?gf_cta_variant=improve|track|future`; those events carry
`experiment_forced=true` and are excluded from reporting.

Use unique `tool_cta_clicked` / unique `tool_cta_viewed` as the primary CTR.
Both events carry `experiment_id`, `experiment_variant`, `cta_angle`, `tool`,
`placement`, and `platform`. Consented `web_download_clicked` and
`outbound_app_store_click` events inherit the experiment fields from the CTA
container, preserving the downstream App Store and install analysis.

Result cards use the compact sticky treatment after a scan or tool interaction.
Static tools set `activation="tool_completed"`, preventing the dock from
appearing before the visitor uses the tool.

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

## Rule 2 — campaign is placement-level, not page-level

Every rendered destination starts as the direct App Store URL. After optional analytics
consent, `AppStoreClickTracker` turns the click into the branded AppsFlyer OneLink and
uses a campaign value in this order:

1. **Component-declared (preferred).** `PlatformDownloadLink` and `DownloadQr` expose a
   `data-cta-campaign` value, so the homepage can distinguish `web-home-hero`,
   `web-home-nav`, `web-home-qr`, and `web-home-closing`; blog CTAs can use
   `web-blog-<intent>`, `web-blog-qr`, `web-blog-nav`, and `web-blog-index`.
2. **Path fallback.** Plain App Store anchors in static blog bodies use
   `campaignForPath(pathname)` — `web-home`, `web-blog`, `web-bftool`, and friends
   (see `web/lib/site.ts`).

The same value is sent in `web_download_clicked` and the OneLink `ct` field, so consented
PostHog and AppsFlyer analysis agree. Pending or denied visitors normally have no campaign
token.

The only exception is an explicitly configured App Store Custom Product Page. Those links
must retain the aggregate Apple routing tuple (`pt`, `ct`, `mt`, and `ppid`) even before
analytics consent so the visitor reaches the intended store creative. This tuple contains
no click ID, session ID, referrer, or other per-person payload. The default listing and all
unrelated CTAs keep their clean App Store URL. A consented Custom Product Page click uses
AppsFlyer's dedicated `af_ios_store_cpp` field and the same `ct`; the delegated tracker
preserves both instead of rebuilding a default-listing link.

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

## Website → install → subscription attribution

After a visitor grants optional analytics consent, GainFrame App Store
destinations are rewritten at click time to the branded AppsFlyer OneLink
template `https://go.gainframe.app/WufP`. Pending or denied visitors keep the
direct App Store destination; the site does not create an AppsFlyer payload,
persist ad click IDs, or emit `web_download_clicked` for those visits.

For a consented click, the OneLink retains the placement campaign as `ct` and
can carry the following deferred-deep-link payload into a same-device iOS
install:

| OneLink field | Meaning |
|---|---|
| `deep_link_value` | Constant `web_attribution` routing marker |
| `deep_link_sub1` | First website page in the session |
| `deep_link_sub2` | Page containing the clicked download CTA |
| `deep_link_sub3` | CTA placement/content |
| `deep_link_sub4` | Original source: UTM source, search engine, referrer, or direct |
| `deep_link_sub5` | UTM campaign or owned-web fallback |
| `deep_link_sub6` | Random `web_click_id` shared by PostHog, AppsFlyer, and the app |
| `deep_link_sub7` | Anonymous PostHog website distinct ID |
| `deep_link_sub8` | PostHog website session ID |
| `deep_link_sub9` | UTM medium |
| `deep_link_sub10` | Click timestamp (ISO 8601) |

The consented URL can also retain supported ad click IDs (`gclid`, `gbraid`,
`wbraid`, `fbclid`, `ttclid`, `twclid`, and `ScCid`). On first app open,
GainFrame stores this first touch, links the anonymous website identity to the
app identity in PostHog, and mirrors bounded attribution fields to RevenueCat
subscriber attributes. RevenueCat subscription webhooks can then associate a
subscription event with the page, CTA, source, campaign, and click time.

Use `web_download_clicked` for consented download attempts and join on
`web_click_id` when checking a specific journey. Keep using the two legacy CTA
events for historical trend continuity. Desktop-to-phone behavior requires a
QR scan carrying the same consented OneLink payload; Apple privacy controls
mean attribution will be actionable rather than complete.

## Top-blog contextual sticky CTA rollout (2026-08-27)

The 79 highest-click blog posts from the settled 2026-07-28 through 2026-08-24
GSC window use a page-specific bottom dock after the reader reaches the first
article section. `lib/blog-cta.ts` preserves the original top 20 and the next
59 as separate fixed cohorts; do not reorder either from a newer GSC pull
mid-test.

Use unique `blog_sticky_cta_clicked` / unique `blog_sticky_cta_viewed` as the
primary CTR. Both carry `slug`, `intent`, `placement=sticky`, and `platform`;
all three events also carry `rollout=initial_20|expansion_59` so the later
launch does not contaminate the original cohort read. `blog_sticky_cta_dismissed`
measures interruption cost. Filter Android out of the app-download CTR because
its button routes to the free web tool.
The site-wide `web_download_clicked` and `outbound_app_store_click` events still
own download attribution, so do not add those again in the blog component.

The rollout baseline is the tool dock that motivated it: Aug 18-24 recorded
53 unique clicks from 1,592 unique viewers (3.33%); Aug 25-26 recorded 19 from
516 (3.68%). That +10.5% relative movement was directional, not significant,
so keep the blog rollout framed as a measured expansion rather than a proven
win until it has at least seven settled days.

## SEO physique-tools Custom Product Page (`seo-physique-cpp-v1`)

Only the conversion cards rendered by `/tools/body-fat-from-photo/` and
`/tools/physique-rater/` are allowed to set Custom Product Page ID
`ba181e7f-4bf8-44f3-8be6-94077b918f89`. Their iPhone and desktop-QR destinations
must carry campaign `seo-physique-cpp-v1`. Navigation, homepage, blog, visualizer,
and every other download CTA must remain on the default listing.

Do not deploy this routing before the Custom Product Page version is approved and its
direct URL resolves to the approved creative. Start the 28-day read only after both that
approval and the website deployment are complete. The operating record, creative order,
Apple IDs, and decision rule live in the app repository at
`docs/app-store/SEO_PHYSIQUE_TOOLS_CPP_V1.md`.
