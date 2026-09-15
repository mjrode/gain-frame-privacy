#!/usr/bin/env python3
"""Read-only aggregate report for GainFrame's four-way visualizer CTA test."""
import argparse
import json
import math
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

EXPERIMENT = "body_visualizer_cta_v1"
PHASE = "four_treatments_v1"
VARIANTS = ("direct", "analysis", "progress", "future")
SAMPLE_PER_ARM = 1600
MIN_DAYS = 14
MAX_DAYS = 56


def credential():
    key = os.environ.get("POSTHOG_PERSONAL_API_KEY", "")
    if not key:
        config_path = Path(__file__).resolve().parents[3] / "gain-frame" / ".mcp.json"
        if config_path.exists():
            config = json.loads(config_path.read_text())
            for name, server in config.get("mcpServers", {}).items():
                if "posthog" in name.lower():
                    key = server.get("env", {}).get("POSTHOG_AUTH_HEADER", "")
                    key = key.removeprefix("Bearer ").strip()
                    if key:
                        break
    if not key.startswith("phx_"):
        raise RuntimeError("A read-only PostHog personal API key is required.")
    return key


def query(sql, key):
    request = Request(
        "https://us.posthog.com/api/projects/357433/query/",
        data=json.dumps({"query": {"kind": "HogQLQuery", "query": sql}, "refresh": "force_blocking"}).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urlopen(request, timeout=60) as response:
            result = json.load(response)
    except HTTPError as error:
        raise RuntimeError(f"Read-only PostHog query failed: HTTP {error.code}") from None
    if result.get("results") is None:
        raise RuntimeError("PostHog did not return a completed aggregate query.")
    return result["results"]


def queries(start):
    date = start.strftime("%Y-%m-%d %H:%M:%S")
    filters = f"""
      properties.experiment_id = '{EXPERIMENT}'
      AND properties.experiment_phase = '{PHASE}'
      AND coalesce(properties.experiment_forced, false) = false
      AND properties.platform IN ('ios', 'desktop')
      AND properties.$host IN ('gainframe.app', 'www.gainframe.app')
      AND properties.experiment_variant IN ('direct', 'analysis', 'progress', 'future')
      AND timestamp >= toDateTime('{date}') AND timestamp < now()
    """
    assignments = f"""
      SELECT properties.experiment_variant, count(DISTINCT distinct_id)
      FROM events WHERE event = 'tool_cta_assigned' AND {filters}
      GROUP BY properties.experiment_variant LIMIT 4
    """
    # Group internally by browser identity; only bounded aggregates leave PostHog.
    # Exclude crossovers and allow every included visitor the full 24-hour window.
    conversion = f"""
      WITH first_views AS (
        SELECT distinct_id,
          argMin(properties.experiment_variant, timestamp) AS variant,
          argMin(properties.platform, timestamp) AS platform,
          min(timestamp) AS first_view
        FROM events WHERE event = 'tool_cta_viewed' AND {filters}
        GROUP BY distinct_id HAVING count(DISTINCT properties.experiment_variant) = 1
      ), clicks AS (
        SELECT distinct_id, properties.experiment_variant AS variant, timestamp
        FROM events WHERE event = 'tool_cta_clicked' AND {filters}
      )
      SELECT v.variant, v.platform, count(DISTINCT v.distinct_id) AS viewers,
        count(DISTINCT if(c.timestamp >= v.first_view
          AND c.timestamp < v.first_view + INTERVAL 24 HOUR, v.distinct_id, NULL)) AS clickers
      FROM first_views v LEFT JOIN clicks c ON v.distinct_id = c.distinct_id AND v.variant = c.variant
      WHERE v.first_view <= now() - INTERVAL 24 HOUR
      GROUP BY v.variant, v.platform LIMIT 8
    """
    return assignments, conversion


def summarize(assignment_rows, conversion_rows, elapsed_days):
    assigned = {variant: 0 for variant in VARIANTS}
    totals = {variant: {"viewers": 0, "clickers": 0} for variant in VARIANTS}
    for variant, count in assignment_rows:
        assigned[variant] = int(count)
    segments = []
    for variant, platform, viewers, clickers in conversion_rows:
        n, k = int(viewers), int(clickers)
        if not 0 <= k <= n:
            raise ValueError("Clickers must be a subset of exposed visitors.")
        totals[variant]["viewers"] += n
        totals[variant]["clickers"] += k
        segments.append({"variant": variant, "platform": platform, "viewers": n, "clickers": k, "ctr": k / n if n else None})
    assigned_total = sum(assigned.values())
    srm_p = None
    if assigned_total:
        expected = assigned_total / 4
        chi2 = sum((n - expected) ** 2 / expected for n in assigned.values())
        x = chi2 / 2
        srm_p = math.erfc(math.sqrt(x)) + 2 / math.sqrt(math.pi) * math.sqrt(x) * math.exp(-x)
    ready = elapsed_days >= MIN_DAYS and all(v["viewers"] >= SAMPLE_PER_ARM for v in totals.values()) and srm_p is not None and srm_p >= .001
    control = totals["direct"]
    rows = []
    for variant, value in totals.items():
        n, k = value["viewers"], value["clickers"]
        rate = k / n if n else None
        row = {"variant": variant, "assigned": assigned[variant], **value, "ctr": rate,
               "relative_lift": None, "p_value_vs_control": None, "qualifies_vs_control": False}
        n0, k0 = control["viewers"], control["clickers"]
        if variant != "direct" and n and n0:
            p0 = k0 / n0
            pooled = (k + k0) / (n + n0)
            se = math.sqrt(pooled * (1 - pooled) * (1 / n + 1 / n0))
            p = math.erfc(abs(rate - p0) / se / math.sqrt(2)) if se else 1.0
            lift = rate / p0 - 1 if p0 else None
            row.update(relative_lift=lift, p_value_vs_control=p,
                       qualifies_vs_control=bool(ready and lift is not None and lift >= .2 and p < .05 / 3))
        rows.append(row)
    status = "ready_for_fixed_horizon_review" if ready else "collecting"
    if not assigned_total:
        status = "no_live_experiment_data"
    elif srm_p is not None and srm_p < .001:
        status = "investigate_assignment_imbalance"
    elif elapsed_days >= MAX_DAYS and not ready:
        status = "inconclusive_at_time_limit"
    return {"experiment": EXPERIMENT, "phase": PHASE, "status": status,
            "elapsed_days": round(elapsed_days, 2), "target_viewers_per_arm": SAMPLE_PER_ARM,
            "sample_ratio_mismatch_p": srm_p, "variants": rows, "platform_segments": segments,
            "note": "Mature 24-hour web-click conversion only. No install claim. Three comparisons against A, not proof of differences between challengers."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", required=True, help="Actual launch time in ISO 8601 (UTC if no offset).")
    parser.add_argument("--output", help="Optional local JSON report path.")
    args = parser.parse_args()
    start = datetime.fromisoformat(args.start.replace("Z", "+00:00"))
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    start = start.astimezone(timezone.utc)
    now = datetime.now(timezone.utc)
    if start > now or start < now - timedelta(days=84):
        parser.error("Choose a past start time within 84 days to keep the query bounded.")
    key = credential()
    assignment_sql, conversion_sql = queries(start)
    report = summarize(query(assignment_sql, key), query(conversion_sql, key), (now - start).total_seconds() / 86400)
    report["start"] = start.isoformat()
    report["generated_at"] = now.isoformat()
    encoded = json.dumps(report, indent=2)
    if args.output:
        destination = Path(args.output)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(encoded + "\n")
    print(encoded)


if __name__ == "__main__":
    main()
