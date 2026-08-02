# Web tool observability

The body-fat estimator and body-transformation tool report the same terminal
server event:

`web_tool_server_outcome`

Use `outcome = 'error'` for the technical failure rate. Expected product
outcomes are deliberately separate:

- `success`: the estimate or image was returned.
- `unusable`: the submitted photo could not produce a useful result.
- `invalid`: the request failed input or protocol validation.
- `rate_limited`: a daily, lifetime, IP, or capacity gate stopped the request.
- `error`: a configuration, database, provider, or unexpected runtime failure.

Stable event properties are `tool`, `operation`, `outcome`, `phase`, `code`,
`reason`, `http_status`, `duration_ms`, `request_id`, `attempt_id`, `retryable`,
`model`, `config_version`, `assignment`, `fallback_used`, and
`database_retry_count`. Optional properties are omitted when unknown.

The browser sends the same request/attempt ID to the edge function. Client
terminal events also include `phase`, `error_type`, `code`, `status`,
`duration_ms`, `attempt_id`, `retryable`, `source`, and `blocking`. The ID is
for debugging one attempt; do not group reports by it.

Handled technical failures are also sent to PostHog Error Tracking with
`captureException`. Expected validation, unusable-photo, and rate-limit
outcomes are not exceptions.

Telemetry must never include photo bytes, email addresses, IP/client hashes,
provider response previews, raw model prose, or generated image content. The
server outcome helper uses an explicit property allowlist and a bounded,
non-throwing capture so analytics cannot prevent the user response.

## Useful HogQL

Weekly outcomes by tool:

```sql
SELECT
  toStartOfWeek(timestamp) AS week,
  properties.tool AS tool,
  properties.outcome AS outcome,
  count() AS events
FROM events
WHERE event = 'web_tool_server_outcome'
  AND timestamp >= now() - INTERVAL 8 WEEK
GROUP BY week, tool, outcome
ORDER BY week, tool, outcome
```

Technical error rate by tool:

```sql
SELECT
  properties.tool AS tool,
  countIf(properties.outcome = 'error') AS technical_errors,
  count() AS terminal_requests,
  round(100 * technical_errors / terminal_requests, 2) AS error_rate_pct
FROM events
WHERE event = 'web_tool_server_outcome'
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY tool
ORDER BY technical_errors DESC
```

Errors by actionable cause:

```sql
SELECT
  properties.tool AS tool,
  properties.phase AS phase,
  properties.code AS code,
  properties.retryable AS retryable,
  count() AS errors
FROM events
WHERE event = 'web_tool_server_outcome'
  AND properties.outcome = 'error'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY tool, phase, code, retryable
ORDER BY errors DESC
```

Events before this contract was deployed used less stable client-side error
strings, so compare pre-deployment periods using the legacy tool events rather
than assuming the new taxonomy existed historically.
