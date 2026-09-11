# Website analytics loading

Updated September 11, 2026 at the owner's request: website analytics start on
page load. The former regional consent manager, banner, preference control and
stored-choice gates are removed. `components/AnalyticsProvider.tsx` loads GA4,
PostHog and Clarity on `gainframe.app` and `www.gainframe.app` only. Advertising
storage/signals remain disabled; Clarity's existing form masking remains intact.

`track` queues early events until each provider is ready, then flushes once per
provider. Tool usage reporting, leaderboard events and AppsFlyer download
attribution do not wait for a region lookup or preference event. Existing Edge
Functions retain their `analytics_consent` telemetry-enable request field; the
website now sends it as `true` on production with the bounded analytics context.
Local development and previews are excluded from production telemetry.

CTA assignments restore the saved current-phase variant before selecting a new
one and persist immediately. If storage is unavailable, a page-lifetime fallback
keeps the current page stable. QA overrides never replace the saved assignment.
See `cta-tracking.md` for the clean phases and assignment-integrity checks.

The old `/api/privacy-region` endpoint remains available for cached older pages;
new pages do not call it. This website change does not alter iOS permissions.
