-- Unique eligible slider users and clicks on their assigned card within 24 hours.
-- Give each assignment a full day to convert. Forced previews and crossovers are excluded.
-- From the November 18 placement release, Future You pools two button positions.
-- Use future-you-placement.sql for their randomized comparison.
WITH people AS (
    SELECT distinct_id,
        argMinIf(properties.experiment_variant, timestamp, event = 'paired_cta_assigned') AS arm,
        minIf(timestamp, event = 'paired_cta_assigned') AS enrolled,
        groupArrayIf(timestamp, event = 'web_download_clicked') AS clicks,
        uniqExact(properties.experiment_variant) AS arm_count
    FROM events
    WHERE timestamp >= toDateTime('2026-11-16 00:00:00', 'America/New_York') AND timestamp < now()
      AND event IN ('paired_cta_assigned', 'web_download_clicked')
      AND properties.experiment_id = 'visualizer_result_example'
      AND properties.experiment_phase = 'app_screens_v3'
      AND properties.experiment_variant IN ('control','score_example','future_you','front_side')
      AND properties.experiment_forced = false
      AND properties.$host IN ('gainframe.app','www.gainframe.app')
    GROUP BY distinct_id
    HAVING countIf(event = 'paired_cta_assigned') > 0
       AND enrolled <= now() - INTERVAL 1 DAY AND arm_count = 1
)
SELECT arm, count() AS assigned_visitors,
    countIf(arrayExists(t -> t >= enrolled AND t < enrolled + INTERVAL 1 DAY, clicks)) AS store_clickers,
    round(100.0 * store_clickers / assigned_visitors, 2) AS store_click_percent
FROM people GROUP BY arm ORDER BY arm
