#!/usr/bin/env python3
"""Fetch app assets (logo, screenshots, metadata) from the public iTunes Search
API for TikTok app-listicle carousels.

GainFrame returns 0 screenshots from the API, so any app flagged with
`local_screenshots` pulls from the curated repo library instead.

Usage:
    python3 fetch_apps.py <spec.json>

Reads the post spec, downloads + caches each app's assets into
<spec_dir>/assets/<app-slug>/, and writes <spec_dir>/assets/manifest.json
enriched with resolved metadata and local file paths.
"""
import argparse
import json
import os
import re
import shutil
import urllib.parse
import urllib.request

ITUNES_SEARCH = "https://itunes.apple.com/search"
ITUNES_LOOKUP = "https://itunes.apple.com/lookup"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
GF_SHOTS_DIR = os.path.join(REPO_ROOT, "docs/app-screenshots/1.21")
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def resolve_local_shot(name_):
    """Resolve a local_screenshots entry to an absolute source path.

    A bare name ("compare") resolves against GF_SHOTS_DIR. An entry containing
    a path separator is treated as a path: absolute as-is, otherwise relative
    to the repo root (e.g. "docs/assets/tiktok-screenshots/dashboard.png").
    """
    fn = name_ if name_.lower().endswith((".png", ".jpg", ".jpeg")) else name_ + ".png"
    if os.path.isabs(fn):
        return fn
    if os.sep in fn or "/" in fn:
        return os.path.join(REPO_ROOT, fn)
    return os.path.join(GF_SHOTS_DIR, fn)


def http_get_json(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def download(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)
    return dest


def resolve_app(query):
    if query.startswith("id:"):
        data = http_get_json(f"{ITUNES_LOOKUP}?id={query[3:]}&country=us")
    else:
        q = urllib.parse.quote(query)
        data = http_get_json(
            f"{ITUNES_SEARCH}?term={q}&entity=software&country=us&limit=1"
        )
    results = data.get("results", [])
    if not results:
        raise SystemExit(f"No App Store result for: {query}")
    return results[0]


def hi_res_logo_url(url):
    # artworkUrl is like .../512x512bb.jpg — request a crisp 1024 png
    return re.sub(r"/\d+x\d+bb\.(jpg|png)$", "/1024x1024bb.png", url)


def hi_res_shot_url(url):
    # screenshotUrls end in .../392x696bb.png — request a larger bound
    # (bb = fit within box, preserving aspect ratio)
    return re.sub(r"/\d+x\d+bb\.(jpg|png)$", "/1080x1920bb.png", url)


def download_shot(url, dest):
    for u in (hi_res_shot_url(url), url):
        try:
            return download(u, dest)
        except Exception:
            if os.path.exists(dest):
                os.remove(dest)
    raise SystemExit("screenshot download failed: " + url)


def download_logo(info, dest):
    base = info.get("artworkUrl512") or info.get("artworkUrl100")
    for url in (hi_res_logo_url(base), base):
        try:
            return download(url, dest)
        except Exception:
            if os.path.exists(dest):
                os.remove(dest)
    raise SystemExit("logo download failed for " + info.get("trackName", "?"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--assets-dir", default=None)
    args = ap.parse_args()

    spec = json.load(open(args.spec))
    spec_dir = os.path.dirname(os.path.abspath(args.spec))
    base = args.assets_dir or os.path.join(spec_dir, "assets")
    os.makedirs(base, exist_ok=True)

    out_apps = []
    for app in spec["apps"]:
        info = resolve_app(app["query"])
        name = info["trackName"]
        # `name` in the spec overrides the display label; otherwise derive a
        # short label from the store name (drop the ": tagline" / " - tagline").
        short = app.get("name") or re.split(r":| - | – ", name)[0].strip()
        slug = slugify(short) or slugify(app["query"])
        adir = os.path.join(base, slug)
        os.makedirs(adir, exist_ok=True)

        logo_path = download_logo(info, os.path.join(adir, "logo.png"))

        shot_paths = []
        local = app.get("local_screenshots")
        if local:
            for i, name_ in enumerate(local):
                src = resolve_local_shot(name_)
                dst = os.path.join(adir, f"shot-{i}.png")
                if os.path.exists(src):
                    shutil.copyfile(src, dst)  # always refresh so spec swaps take effect
                    shot_paths.append(dst)
                else:
                    print(f"  ⚠️  local screenshot not found: {src}")
        else:
            urls = info.get("screenshotUrls", []) or []
            want = app.get("screenshots")  # optional list of indices
            idxs = want if want else list(range(len(urls)))
            for i in idxs:
                if 0 <= i < len(urls):
                    dst = os.path.join(adir, f"shot-{i}.png")
                    download_shot(urls[i], dst)
                    shot_paths.append(dst)

        out_apps.append({
            "query": app["query"],
            "name": name,
            "short_name": short,
            "id": info.get("trackId"),
            "genre": info.get("primaryGenreName"),
            "rating": round(info.get("averageUserRating") or 0, 2),
            "rating_count": info.get("userRatingCount") or 0,
            "store_desc": (info.get("description") or "")[:500],
            "logo": logo_path,
            "screenshots": shot_paths,
            # creative fields passed through from the spec:
            "tagline": app.get("tagline", ""),
            "callouts": app.get("callouts", []),
            "cons": app.get("cons", []),
            "description": app.get("description", ""),
            "bullets": app.get("bullets", []),
            "rank": app.get("rank"),
        })

    manifest = {
        "format": spec.get("format"),
        "slug": spec.get("slug"),
        "cover": spec.get("cover", {}),
        "caption": spec.get("caption", ""),
        "hashtags": spec.get("hashtags", []),
        "apps": out_apps,
    }
    mpath = os.path.join(base, "manifest.json")
    json.dump(manifest, open(mpath, "w"), indent=2)

    print(f"✅ Wrote {mpath} with {len(out_apps)} apps")
    for a in out_apps:
        print(
            f"  - {a['short_name']}: logo={'ok' if os.path.exists(a['logo']) else 'MISSING'}, "
            f"{len(a['screenshots'])} shots, ⭐{a['rating']} ({a['rating_count']:,})"
        )


if __name__ == "__main__":
    main()
