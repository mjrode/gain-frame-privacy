#!/usr/bin/env python3
"""
GSC data fetcher for GainFrame keyword-discovery skill.

Pulls query data from Google Search Console API and writes:
  gsc-data/queries.csv  (Query, Clicks, Impressions, CTR, Position)

First-time setup:
  1. Follow SETUP.md to create client_secrets.json
  2. Run:  python3 gsc-data/fetch.py
  3. Browser opens for Google OAuth — approve it
  4. Token saved to gsc-data/token.json (persists, auto-refreshes)

Subsequent runs (refresh data):
  python3 gsc-data/fetch.py
"""

import csv
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ── Config ─────────────────────────────────────────────────────────────────────
SITE_URL  = "sc-domain:gainframe.app"  # domain property — auto-detected on first run
DAYS_BACK = 90                          # rolling window; increase for longer history
ROW_LIMIT = 25000                       # GSC API max per request

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

SCRIPT_DIR     = Path(__file__).parent
CLIENT_SECRETS = SCRIPT_DIR / "client_secrets.json"
TOKEN_FILE     = SCRIPT_DIR / "token.json"
OUTPUT_CSV     = SCRIPT_DIR / "queries.csv"
# ───────────────────────────────────────────────────────────────────────────────


def check_deps():
    try:
        import google.oauth2.credentials          # noqa: F401
        import google_auth_oauthlib.flow          # noqa: F401
        import googleapiclient.discovery          # noqa: F401
    except ImportError:
        print(
            "\nMissing dependencies. Install with:\n\n"
            "  pip3 install google-auth google-auth-oauthlib "
            "google-auth-httplib2 google-api-python-client\n"
        )
        sys.exit(1)


def get_credentials():
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request

    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            if not CLIENT_SECRETS.exists():
                print(
                    "\n── Setup required ──────────────────────────────────────────\n"
                    "client_secrets.json not found. Follow these steps:\n\n"
                    "  1. Go to https://console.cloud.google.com/\n"
                    "  2. Create or select a project\n"
                    "  3. APIs & Services → Enable APIs → search 'Google Search Console API' → Enable\n"
                    "  4. APIs & Services → Credentials → + Create Credentials → OAuth client ID\n"
                    "  5. Application type: Desktop app  |  Name: anything (e.g. 'GainFrame GSC')\n"
                    "  6. Click Create → Download JSON\n"
                    "  7. Save the downloaded file as:  gsc-data/client_secrets.json\n"
                    "  8. Run this script again\n"
                    "────────────────────────────────────────────────────────────\n"
                )
                sys.exit(1)

            print("Opening browser for Google OAuth consent...")
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), SCOPES)
            creds = flow.run_local_server(port=0, open_browser=True)

        TOKEN_FILE.write_text(creds.to_json())
        print(f"Token saved → {TOKEN_FILE.name}")

    return creds


def resolve_site_url(service):
    """Return the verified SITE_URL, auto-detecting if the configured one isn't found."""
    result = service.sites().list().execute()
    entries = result.get("siteEntry", [])

    if not entries:
        print("ERROR: No Search Console properties found for this Google account.")
        print("Make sure michaelrode44@gmail.com is an owner or full user on the GSC property.")
        sys.exit(1)

    site_urls = [e["siteUrl"] for e in entries]

    # Check if configured SITE_URL is in the verified list
    if SITE_URL in site_urls:
        return SITE_URL

    # Try the domain property variant
    domain_variant = f"sc-domain:{SITE_URL.replace('https://', '').replace('http://', '').rstrip('/')}"
    if domain_variant in site_urls:
        print(f"Note: '{SITE_URL}' not found — using domain property '{domain_variant}' instead.")
        return domain_variant

    # Neither matched — show what's available and exit
    print(f"\nERROR: '{SITE_URL}' is not verified under this Google account.")
    print("Verified properties found:\n")
    for url in site_urls:
        print(f"  {url}")
    print(
        f"\nFix: update SITE_URL on line 15 of fetch.py to one of the URLs above.\n"
    )
    sys.exit(1)


def fetch_queries(creds):
    from googleapiclient.discovery import build

    service = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    site_url = resolve_site_url(service)

    end_date   = datetime.today().date()
    start_date = end_date - timedelta(days=DAYS_BACK)

    print(f"Site:  {site_url}")
    print(f"Range: {start_date} → {end_date}  ({DAYS_BACK} days)")
    print("Fetching...", flush=True)

    response = (
        service.searchanalytics()
        .query(
            siteUrl=site_url,
            body={
                "startDate":  start_date.isoformat(),
                "endDate":    end_date.isoformat(),
                "dimensions": ["query"],
                "rowLimit":   ROW_LIMIT,
                "dataState":  "final",
            },
        )
        .execute()
    )

    rows = response.get("rows", [])
    print(f"Received {len(rows):,} queries")

    if len(rows) == ROW_LIMIT:
        print(
            f"  ⚠  Hit the {ROW_LIMIT:,}-row limit. "
            "Some long-tail queries may be truncated. "
            "Results are sorted by clicks desc, so high-value queries are included."
        )

    return rows, start_date, end_date


def write_csv(rows, start_date, end_date):
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        # Header row — matches format expected by keyword-discovery SKILL.md
        writer.writerow(["Query", "Clicks", "Impressions", "CTR", "Position"])
        for row in rows:
            query       = row["keys"][0]
            clicks      = int(row["clicks"])
            impressions = int(row["impressions"])
            ctr         = round(row["ctr"] * 100, 2)   # store as percentage (e.g. 4.8)
            position    = round(row["position"], 2)
            writer.writerow([query, clicks, impressions, ctr, position])

    print(f"\nWritten → {OUTPUT_CSV}")
    print(f"  Rows:  {len(rows):,}")
    print(f"  Range: {start_date} → {end_date}")


def print_summary(rows):
    total_clicks      = sum(int(r["clicks"]) for r in rows)
    total_impressions = sum(int(r["impressions"]) for r in rows)

    # Quick-win count: pos 4-20, impressions >= 10, CTR < 10%
    quick_wins = [
        r for r in rows
        if 4 <= r["position"] <= 20
        and r["impressions"] >= 10
        and r["ctr"] * 100 < 10
    ]

    # Competitor queries
    competitors = ["metamorph", "trackbod", "spren", "physique ai",
                   "body.app", "fittrack", "naked labs", "myfitnesspal"]
    comp_queries = [
        r for r in rows
        if any(c in r["keys"][0].lower() for c in competitors)
        and r["position"] <= 50
    ]

    print("\n── Summary ──────────────────────────────────────────────")
    print(f"  Total queries:       {len(rows):>6,}")
    print(f"  Total clicks:        {total_clicks:>6,}")
    print(f"  Total impressions:   {total_impressions:>6,}")
    print(f"  Quick-win CTR gaps:  {len(quick_wins):>6,}  (pos 4-20, ≥10 imp, CTR <10%)")
    print(f"  Competitor queries:  {len(comp_queries):>6,}  (competitor name in query, pos ≤50)")
    print("─────────────────────────────────────────────────────────")

    if quick_wins:
        print("\nTop 5 quick-win opportunities:")
        # Sort by impressions desc
        for r in sorted(quick_wins, key=lambda x: x["impressions"], reverse=True)[:5]:
            print(
                f"  '{r['keys'][0]}'  "
                f"pos {r['position']:.1f}  |  "
                f"{int(r['impressions'])} imp  |  "
                f"{r['ctr']*100:.1f}% CTR"
            )

    print("\nNext: run /keyword-discovery — it will read queries.csv automatically.")


def main():
    check_deps()
    creds = get_credentials()
    rows, start_date, end_date = fetch_queries(creds)
    write_csv(rows, start_date, end_date)
    print_summary(rows)


if __name__ == "__main__":
    main()
