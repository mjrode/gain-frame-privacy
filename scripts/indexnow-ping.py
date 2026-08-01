#!/usr/bin/env python3
"""
indexnow-ping.py — Notify IndexNow-compatible search engines (Bing, Yandex,
Seznam, Naver, etc.) that a list of URLs has been added or updated.

Usage:
    # URLs as CLI args
    python3 scripts/indexnow-ping.py https://gainframe.app/blog/post-a/ https://gainframe.app/blog/post-b/

    # URLs from stdin (one per line)
    cat /tmp/urls.txt | python3 scripts/indexnow-ping.py

    # Both — CLI args + stdin
    python3 scripts/indexnow-ping.py https://gainframe.app/blog/post-a/ < /tmp/more.txt

Spec: https://www.indexnow.org/documentation
Note: Google does NOT participate in IndexNow. This pings Bing/Yandex/etc.

Logs each invocation to scripts/indexnow-log.csv with timestamp, URL count,
HTTP response code, and a short response excerpt.
"""

from __future__ import annotations

import csv
import datetime as dt
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

# ---- Site-specific config -------------------------------------------------
HOST = "gainframe.app"
KEY = "99929eeb331db70cd363352a87102acf"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
# Submit to each engine directly. The aggregator (api.indexnow.org) is run by
# Microsoft, so it shares Bing's authorization state — when Bing rejects the
# host, the aggregator rejects it too and the other engines never hear about it.
ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
    "https://search.seznam.cz/indexnow",
    "https://searchadvisor.naver.com/indexnow",
]
# --------------------------------------------------------------------------

LOG_PATH = Path(__file__).resolve().parent / "indexnow-log.csv"
MAX_URLS_PER_REQUEST = 10000  # IndexNow protocol limit


def collect_urls() -> list[str]:
    """Collect URLs from CLI args + stdin (deduped, in order)."""
    urls: list[str] = []
    seen: set[str] = set()

    for arg in sys.argv[1:]:
        u = arg.strip()
        if u and u not in seen:
            urls.append(u)
            seen.add(u)

    # Read stdin only if it's piped (not an interactive TTY)
    if not sys.stdin.isatty():
        for line in sys.stdin:
            u = line.strip()
            if u and u not in seen:
                urls.append(u)
                seen.add(u)

    return urls


def validate_urls(urls: list[str]) -> None:
    """Fail fast on malformed input."""
    if not urls:
        sys.exit("error: no URLs provided (pass as args or pipe via stdin)")
    if len(urls) > MAX_URLS_PER_REQUEST:
        sys.exit(f"error: {len(urls)} URLs exceeds IndexNow per-request cap of {MAX_URLS_PER_REQUEST}")
    for u in urls:
        if not u.startswith(f"https://{HOST}/"):
            sys.exit(f"error: URL '{u}' is not on host '{HOST}' — IndexNow rejects cross-host submissions")


def post_indexnow(urls: list[str], endpoint: str) -> tuple[int, str]:
    """POST the URL list to IndexNow. Returns (status_code, response_body)."""
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": f"gainframe-indexnow-ping/1.0 (+https://{HOST}/)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as e:
        return 0, f"URLError: {e.reason}"


def log_run(url_count: int, endpoint: str, status: int, response_excerpt: str) -> None:
    """Append a row to indexnow-log.csv. Creates header if file is new."""
    new_file = not LOG_PATH.exists()
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(
                ["timestamp_utc", "url_count", "endpoint", "http_status", "response_excerpt"]
            )
        w.writerow([
            dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            url_count,
            endpoint,
            status,
            response_excerpt[:200].replace("\n", " "),
        ])


def check_key_file() -> tuple[bool, str]:
    """IndexNow verifies ownership by fetching the key file. If that 404s, every
    submission is rejected with 403 and nothing else you do matters. Check first."""
    # Cloudflare 403s the default Python-urllib User-Agent, which made this
    # check report a healthy key file as missing. Send the same UA as the POST.
    req = urllib.request.Request(
        KEY_LOCATION,
        headers={"User-Agent": f"gainframe-indexnow-ping/1.0 (+https://{HOST}/)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            served = resp.read().decode("utf-8", errors="replace").strip()
            if resp.status != 200:
                return False, f"HTTP {resp.status}"
            if served != KEY:
                return False, f"content mismatch: served {served!r}, expected {KEY!r}"
            return True, "ok"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code} — key file is not being served"
    except urllib.error.URLError as e:
        return False, f"unreachable: {e.reason}"


def main() -> int:
    urls = collect_urls()
    validate_urls(urls)

    print(f"Host: {HOST}")
    print(f"Key location: {KEY_LOCATION}")

    ok, detail = check_key_file()
    print(f"Key file: {detail}")
    if not ok:
        print(
            "\nAborting — the key file must return 200 with exactly the key as its body.\n"
            "It lives at web/public/<key>.txt so the Next.js build copies it into web/out.\n"
            "A stale copy in docs/ (legacy Jekyll tree) is NOT served."
        )
        log_run(len(urls), "-", 0, f"aborted: key file {detail}")
        return 1

    print(f"\nSubmitting {len(urls)} URL(s)")
    print("---")
    for u in urls:
        print(f"  {u}")
    print("---")

    # Submit to each engine separately rather than relying only on the
    # aggregator. api.indexnow.org is Microsoft-operated, so a Bing-side
    # authorization problem takes out the aggregator and Bing together while
    # Yandex would have accepted the same payload. One shared status hid that.
    results = []
    for endpoint in ENDPOINTS:
        status, body = post_indexnow(urls, endpoint)
        ok = status in (200, 202)
        print(f"{'OK ' if ok else 'FAIL'}  {endpoint}  HTTP {status}  {body[:120].strip()}")
        log_run(len(urls), endpoint, status, body)
        results.append(ok)

    accepted = sum(results)
    print(f"\n{accepted} of {len(ENDPOINTS)} endpoint(s) accepted the submission.")
    if accepted == 0:
        print("Nothing was submitted. Investigate before assuming the URLs were pinged.")
    return 0 if accepted else 1


if __name__ == "__main__":
    raise SystemExit(main())
