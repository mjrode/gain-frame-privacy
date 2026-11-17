-- Daily production reader sessions per article, including internal navigation.
-- Nov 17 is the first full day after the Nov 16 evening release.
WITH sessions AS (
    SELECT properties.$session_id AS sid,
        argMinIf(properties.$pathname, timestamp, event = '$pageview') AS landing,
        groupUniqArrayIf(properties.$pathname, event = '$pageview' AND properties.$pathname IN (
            '/blog/body-fat-percentage-chart/', '/blog/best-body-fat-calculator-from-photo/',
            '/blog/how-accurate-are-body-fat-calculators/'
        )) AS articles,
        groupArrayIf(tuple(properties.$pathname, timestamp), event = '$pageview') AS views,
        groupArrayIf(timestamp, event = 'bf_tool_result_shown'
            AND properties.$pathname = '/tools/body-fat-from-photo/') AS estimates,
        maxIf(timestamp, event = 'web_download_clicked') AS last_store
    FROM events
    WHERE timestamp >= toStartOfDay(now()) - INTERVAL 57 DAY AND timestamp < now()
      AND properties.$host IN ('gainframe.app', 'www.gainframe.app')
      AND coalesce(properties.$session_id, '') != ''
      AND event IN ('$pageview', 'bf_tool_result_shown', 'web_download_clicked')
      AND coalesce(properties.experiment_forced, false) = false
    GROUP BY sid
    HAVING length(articles) > 0
), reads AS (
    SELECT arrayJoin(articles) AS article, landing, estimates, last_store,
        arrayMin(arrayMap(v -> v.2, arrayFilter(v -> v.1 = article, views))) AS read_at
    FROM sessions
)
SELECT formatDateTime(read_at, '%Y-%m-%d', 'America/New_York') AS day, article,
    count() AS reader_sessions,
    countIf(arrayExists(t -> t > read_at, estimates)) AS completed_estimate,
    countIf(last_store > read_at) AS any_store_click,
    countIf(arrayExists(t -> t > read_at AND last_store > t, estimates)) AS estimate_then_store,
    countIf(landing = article) AS landing_sessions
FROM reads
WHERE day >= formatDateTime(now() - INTERVAL 56 DAY, '%Y-%m-%d', 'America/New_York')
  AND day < formatDateTime(now(), '%Y-%m-%d', 'America/New_York') AND day != '2026-11-16'
GROUP BY day, article ORDER BY day DESC, article
