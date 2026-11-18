-- Unique iOS slider users assigned to Future You on the production website.
-- Each visitor has 24 hours from first placement assignment for the primary outcome.
WITH visitors AS (
    SELECT distinct_id,
        argMinIf(properties.button_placement, timestamp, event = 'paired_cta_assigned') AS arm,
        minIf(timestamp, event = 'paired_cta_assigned') AS assigned_at,
        groupArrayIf(timestamp, event = 'body_visualizer_button_viewed') AS views,
        groupArrayIf(timestamp, event = 'web_download_clicked') AS clicks
    FROM events
    WHERE timestamp >= toDateTime('2026-11-18 00:00:00', 'UTC') AND timestamp < now()
      AND properties.$host IN ('gainframe.app', 'www.gainframe.app')
      AND properties.experiment_id = 'visualizer_result_example'
      AND properties.experiment_phase = 'app_screens_v3'
      AND properties.experiment_variant = 'future_you'
      AND properties.button_placement_phase = 'future_you_placement_v1'
      AND properties.button_placement IN ('above_image', 'below_image')
      AND properties.experiment_forced = false
      AND event IN ('paired_cta_assigned', 'body_visualizer_button_viewed', 'web_download_clicked')
    GROUP BY distinct_id
    HAVING countIf(event = 'paired_cta_assigned') > 0 AND uniqExact(properties.button_placement) = 1
)
SELECT arm, count() AS assigned_visitors,
    countIf(arrayExists(t -> t >= assigned_at, views)) AS button_viewers_to_date,
    round(100.0 * button_viewers_to_date / assigned_visitors, 2) AS button_visible_pct_to_date,
    countIf(assigned_at <= now() - INTERVAL 1 DAY) AS mature_visitors,
    countIf(assigned_at <= now() - INTERVAL 1 DAY AND
        arrayExists(t -> t >= assigned_at AND t < assigned_at + INTERVAL 1 DAY, views)) AS button_viewers_24h,
    countIf(assigned_at <= now() - INTERVAL 1 DAY AND
        arrayExists(t -> t >= assigned_at AND t < assigned_at + INTERVAL 1 DAY, clicks)) AS store_clickers_24h,
    round(100.0 * store_clickers_24h / nullIf(mature_visitors, 0), 2) AS store_click_pct_24h
FROM visitors GROUP BY arm ORDER BY arm
