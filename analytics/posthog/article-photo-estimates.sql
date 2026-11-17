-- Daily article landing cohorts, New York time. Counts are sessions, across all referrers.
-- Nov 17 is the first full day after the Nov 16 evening release. Exclude release day.
-- Read the most recent 56 complete days; include a lookback day to resolve midnight landings.
WITH sessions AS (
    SELECT
        properties.$session_id AS sid,
        argMinIf(properties.$pathname, timestamp, event = '$pageview') AS landing,
        minIf(timestamp, event = '$pageview') AS entered,
        minIf(timestamp, event = 'bf_tool_result_shown' AND properties.$pathname = '/tools/body-fat-from-photo/') AS first_result,
        maxIf(timestamp, event = 'web_download_clicked') AS last_store
    FROM events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 57 DAY
      AND timestamp < now()
      AND properties.$host IN ('gainframe.app', 'www.gainframe.app')
      AND coalesce(properties.$session_id, '') != ''
      AND event IN ('$pageview', 'bf_tool_result_shown', 'web_download_clicked')
      AND coalesce(properties.experiment_forced, false) = false
    GROUP BY sid
)
SELECT
    toDate(toTimeZone(entered, 'America/New_York')) AS day,
    landing,
    count() AS reader_sessions,
    countIf(first_result > entered) AS completed_estimate,
    countIf(last_store > entered) AS any_store_click,
    countIf(first_result > entered AND last_store > first_result) AS estimate_then_store
FROM sessions
WHERE landing IN (
    '/blog/body-fat-percentage-chart/',
    '/blog/best-body-fat-calculator-from-photo/',
    '/blog/how-accurate-are-body-fat-calculators/'
)
  AND day >= toDate(toTimeZone(now(), 'America/New_York')) - INTERVAL 56 DAY
  AND day < toDate(toTimeZone(now(), 'America/New_York'))
  AND day != toDate('2026-11-16')
GROUP BY day, landing
ORDER BY day DESC, landing
