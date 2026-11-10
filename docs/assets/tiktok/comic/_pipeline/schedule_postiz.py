#!/usr/bin/env python3
"""
Schedule finished GainFrame comic carousels to TikTok / Instagram via Postiz.

Reads built post folders (slide-*.png + content.md), uploads the slides to
Postiz, and books one post per open slot. Every booking is recorded in
postiz-ledger.json (committed) so nothing gets queued twice, no matter which
machine runs this.

Setup (once):
  1. Connect the TikTok / Instagram accounts in the Postiz dashboard.
  2. Postiz -> Settings -> Public API: copy the key, then
       export POSTIZ_API_KEY=...        (in ~/.zshrc is fine; it is read from there too)
  3. python3 schedule_postiz.py channels
     Copy the integration ids into postiz.config.json
     (start from postiz.config.example.json).

Everyday use:
  python3 schedule_postiz.py queue                    # built posts not booked yet
  python3 schedule_postiz.py schedule --next 10       # DRY RUN: show the plan
  python3 schedule_postiz.py schedule --next 10 --commit
  python3 schedule_postiz.py schedule slug-a slug-b --channels tiktok-main --commit
  python3 schedule_postiz.py status                   # ledger + live Postiz state
  python3 schedule_postiz.py unschedule slug-a        # delete from Postiz + ledger
  python3 schedule_postiz.py mark-posted slug-a ...   # record a manual post

Slots come from config "slots" (local wall-clock times) starting tomorrow,
one day apart (--every N to space out). A slot is skipped when the ledger or
Postiz already has a post on that channel within an hour of it, so repeated
runs append after the existing queue instead of stacking on top of it.

TikTok "UPLOAD" mode (the default) drops the carousel in the TikTok app inbox
at the slot time; it must be finished (sound + post) in the app within 24h or
TikTok discards it. "DIRECT_POST" publishes outright with TikTok's
auto-added music. Instagram always publishes directly.

Standard library only, plus Pillow (already used by compose.py) to convert
slides to JPEG, which every platform accepts.
"""
import argparse
import datetime as dt
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from zoneinfo import ZoneInfo

ROOT = os.environ.get(
    "GAINFRAME_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), *[".."] * 5)),
)
COMIC_DIR = f"{ROOT}/docs/assets/tiktok/comic"
PIPELINE_DIR = f"{COMIC_DIR}/_pipeline"
CONFIG_PATH = os.environ.get("POSTIZ_CONFIG", f"{PIPELINE_DIR}/postiz.config.json")
LEDGER_PATH = os.environ.get("POSTIZ_LEDGER", f"{PIPELINE_DIR}/postiz-ledger.json")
POST_LOG = f"{COMIC_DIR}/POST_LOG.md"

DEFAULT_API = "https://api.postiz.com/public/v1"
SLOT_CONFLICT_MINUTES = 60
TIKTOK_MAX_IMAGES = 35
INSTAGRAM_MAX_IMAGES = 10  # Graph API carousel limit
TIKTOK_TITLE_MAX = 90
SLIDE_RE = re.compile(r"^slide-(\d+)(?:-[a-z]+)?\.png$")


class RateLimited(Exception):
    pass


class ApiError(Exception):
    pass


# --------------------------------------------------------------------------
# config / ledger
# --------------------------------------------------------------------------

def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path) as f:
        return json.load(f)


def save_ledger(ledger):
    tmp = LEDGER_PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(ledger, f, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, LEDGER_PATH)


def load_config():
    cfg = load_json(CONFIG_PATH, None)
    if cfg is None:
        sys.exit(
            f"No config at {CONFIG_PATH}.\n"
            "Copy postiz.config.example.json to postiz.config.json, run "
            "`schedule_postiz.py channels`, and fill in the integration ids."
        )
    channels = cfg.get("channels") or []
    for ch in channels:
        if not ch.get("name") or not ch.get("integration_id"):
            sys.exit(f"Every channel needs a name and integration_id: {ch}")
        if str(ch["integration_id"]).startswith("PASTE_"):
            sys.exit(
                f"Channel {ch['name']} still has a placeholder integration_id. "
                "Run `schedule_postiz.py channels` and paste the real id."
            )
    if not cfg.get("slots"):
        sys.exit("Config needs at least one slot time, e.g. \"slots\": [\"18:30\"]")
    return cfg


def local_zone(cfg):
    name = cfg.get("timezone")
    if not name:
        try:
            target = os.path.realpath("/etc/localtime")
            name = target.split("zoneinfo/", 1)[1]
        except (IndexError, OSError):
            name = "UTC"
    return ZoneInfo(name)


def api_key():
    key = os.environ.get("POSTIZ_API_KEY")
    if key:
        return key.strip()
    for rc in ("~/.zshrc", "~/.zprofile", "~/.bashrc"):
        path = os.path.expanduser(rc)
        if not os.path.exists(path):
            continue
        with open(path) as f:
            for line in f:
                m = re.match(r"\s*export\s+POSTIZ_API_KEY=['\"]?([^'\"\s]+)", line)
                if m:
                    return m.group(1)
    return None


# --------------------------------------------------------------------------
# Postiz HTTP client
# --------------------------------------------------------------------------

class Postiz:
    def __init__(self, key, base):
        self.key = key
        self.base = base.rstrip("/")

    def _request(self, method, path, body=None, headers=None, raw=None):
        url = f"{self.base}{path}"
        hdrs = {
            "Authorization": self.key,
            "User-Agent": "gainframe-postiz-scheduler/1.0",
            "Accept": "application/json",
        }
        data = None
        if raw is not None:
            data = raw
        elif body is not None:
            data = json.dumps(body).encode()
            hdrs["Content-Type"] = "application/json"
        hdrs.update(headers or {})
        req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=120) as resp:
                    text = resp.read().decode() or "null"
                    return json.loads(text)
            except urllib.error.HTTPError as e:
                detail = e.read().decode(errors="replace")[:2000]
                if e.code == 429:
                    raise RateLimited(detail)
                if e.code >= 500 and attempt < 3:
                    time.sleep(2 ** (attempt + 1))
                    continue
                raise ApiError(f"{method} {path} -> HTTP {e.code}: {detail}")
            except (urllib.error.URLError, OSError) as e:
                if attempt < 3:
                    time.sleep(2 ** (attempt + 1))
                    continue
                raise ApiError(f"{method} {path} -> {getattr(e, 'reason', e)}")

    def integrations(self):
        return self._request("GET", "/integrations")

    def posts_between(self, start, end):
        q = urllib.parse.urlencode({
            "startDate": iso_utc(start),
            "endDate": iso_utc(end),
        })
        return (self._request("GET", f"/posts?{q}") or {}).get("posts", [])

    def upload(self, filename, content, mime):
        boundary = f"----gainframe{uuid.uuid4().hex}"
        body = io.BytesIO()
        body.write(f"--{boundary}\r\n".encode())
        body.write(
            f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
            f"Content-Type: {mime}\r\n\r\n".encode()
        )
        body.write(content)
        body.write(f"\r\n--{boundary}--\r\n".encode())
        res = self._request(
            "POST", "/upload", raw=body.getvalue(),
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        if not res or not res.get("id") or not res.get("path"):
            raise ApiError(f"Upload of {filename} returned no media: {res}")
        return {"id": res["id"], "path": res["path"]}

    def create_post(self, payload):
        return self._request("POST", "/posts", body=payload)

    def delete_post(self, post_id):
        return self._request("DELETE", f"/posts/{post_id}")


def iso_utc(when):
    return when.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def parse_iso(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


# --------------------------------------------------------------------------
# post discovery
# --------------------------------------------------------------------------

def slides_for(slug):
    folder = f"{COMIC_DIR}/{slug}"
    if not os.path.isdir(folder):
        return []
    found = []
    for name in os.listdir(folder):
        m = SLIDE_RE.match(name)
        if m:
            found.append((int(m.group(1)), f"{folder}/{name}"))
    return [path for _, path in sorted(found)]


def caption_for(slug):
    path = f"{COMIC_DIR}/{slug}/content.md"
    if not os.path.exists(path):
        return None
    with open(path) as f:
        text = f.read().strip()
    return text or None


def titles_index():
    """slug -> human title, from the pipeline copy files."""
    out = {}
    posts = load_json(f"{PIPELINE_DIR}/posts.json", {}).get("posts", [])
    for p in posts:
        lines = [seg[0] if isinstance(seg, list) else str(seg) for seg in p.get("cover_lines", [])]
        if lines:
            out[p["slug"]] = " ".join(lines)
    micro = load_json(f"{PIPELINE_DIR}/micro-posts.json", {}).get("posts", [])
    for p in micro:
        if p.get("title"):
            out[p["slug"]] = p["title"]
    return out


def logged_slugs():
    """Slugs in POST_LOG.md order (newest batch first, listed order within)."""
    if not os.path.exists(POST_LOG):
        return []
    seen, order = set(), []
    with open(POST_LOG) as f:
        for line in f:
            m = re.match(r"^- ([a-z0-9][a-z0-9-]*) — ", line)
            if m and m.group(1) not in seen:
                seen.add(m.group(1))
                order.append(m.group(1))
    return order


DONE_STATUSES = ("scheduled", "posted_manually")


def is_booked(ledger, slug):
    return ledger["posts"].get(slug, {}).get("status") in DONE_STATUSES


def is_ready(slug):
    return bool(slides_for(slug)) and caption_for(slug) is not None


def tiktok_title(slug, titles, caption):
    title = titles.get(slug) or caption.splitlines()[0]
    return title.strip()[:TIKTOK_TITLE_MAX]


# --------------------------------------------------------------------------
# images
# --------------------------------------------------------------------------

def jpeg_bytes(path):
    try:
        from PIL import Image
    except ImportError:
        with open(path, "rb") as f:
            return f.read(), "image/png", ".png"
    with Image.open(path) as im:
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=92, optimize=True)
        return buf.getvalue(), "image/jpeg", ".jpg"


# --------------------------------------------------------------------------
# slots
# --------------------------------------------------------------------------

def parse_slot(s):
    m = re.fullmatch(r"(\d{1,2}):(\d{2})", s.strip())
    if not m:
        sys.exit(f"Bad slot time {s!r}; use HH:MM (24h)")
    return int(m.group(1)), int(m.group(2))


def slot_iter(start_date, slots, every, tz):
    times = sorted(parse_slot(s) for s in slots)
    day = start_date
    while True:
        for h, mnt in times:
            yield dt.datetime(day.year, day.month, day.day, h, mnt, tzinfo=tz)
        day += dt.timedelta(days=every)


def taken_times(ledger, remote_posts, integration_ids):
    """channel integration id -> list of aware datetimes already booked."""
    taken = {i: [] for i in integration_ids}
    for entry in ledger.get("posts", {}).values():
        if entry.get("status") != "scheduled":
            continue
        when = parse_iso(entry["scheduled_for"])
        for ch in entry.get("channels", {}).values():
            if ch.get("integration_id") in taken:
                taken[ch["integration_id"]].append(when)
    for p in remote_posts:
        iid = (p.get("integration") or {}).get("id")
        if iid in taken and p.get("publishDate") and p.get("state") != "ERROR":
            taken[iid].append(parse_iso(p["publishDate"]))
    return taken


def slot_free(when, taken, integration_ids):
    window = dt.timedelta(minutes=SLOT_CONFLICT_MINUTES)
    for iid in integration_ids:
        for t in taken.get(iid, []):
            if abs(t - when) < window:
                return False
    return True


# --------------------------------------------------------------------------
# payloads
# --------------------------------------------------------------------------

def channel_settings(ch, identifier, title):
    if identifier.startswith("tiktok"):
        return {
            "title": title,
            "privacy_level": ch.get("privacy_level", "PUBLIC_TO_EVERYONE"),
            "duet": False,
            "stitch": False,
            "comment": ch.get("allow_comments", True),
            "autoAddMusic": ch.get("auto_add_music", "yes"),
            "brand_content_toggle": False,
            "brand_organic_toggle": False,
            "content_posting_method": ch.get("posting_method", "UPLOAD"),
        }
    if identifier.startswith("instagram"):
        return {"post_type": "post", "collaborators": []}
    raise ApiError(
        f"Channel {ch['name']} is a {identifier!r} integration; this script "
        "only knows TikTok and Instagram settings."
    )


def max_images(identifier):
    return INSTAGRAM_MAX_IMAGES if identifier.startswith("instagram") else TIKTOK_MAX_IMAGES


def build_payload(when, caption, media, targets):
    return {
        "type": "schedule",
        "shortLink": False,
        "date": iso_utc(when),
        "tags": [],
        "posts": [
            {
                "integration": {"id": t["integration_id"]},
                "value": [{"content": caption, "image": media}],
                "settings": t["settings"],
            }
            for t in targets
        ],
    }


# --------------------------------------------------------------------------
# commands
# --------------------------------------------------------------------------

def client_or_exit(cfg):
    key = api_key()
    if not key:
        sys.exit("POSTIZ_API_KEY is not set (env or ~/.zshrc). Postiz -> Settings -> Public API.")
    base = os.environ.get("POSTIZ_API_URL") or cfg.get("api_base") or DEFAULT_API
    return Postiz(key, base)


def cmd_channels(args):
    cfg = load_json(CONFIG_PATH, {})
    client = client_or_exit(cfg)
    rows = client.integrations() or []
    if not rows:
        print("No channels connected in Postiz yet.")
        return
    print(f"{'integration_id':<28} {'identifier':<22} {'disabled':<9} name")
    for r in rows:
        print(f"{r['id']:<28} {r['identifier']:<22} {str(r.get('disabled')):<9} "
              f"{r.get('name')} ({r.get('profile') or ''})")


def cmd_queue(args):
    ledger = load_json(LEDGER_PATH, {"posts": {}})
    ready, not_ready = [], []
    for slug in logged_slugs():
        if is_booked(ledger, slug):
            continue
        (ready if is_ready(slug) else not_ready).append(slug)
    print(f"{len(ready)} built posts not yet booked (POST_LOG order, newest first):")
    for slug in ready:
        print(f"  {slug} ({len(slides_for(slug))} slides)")
    if not_ready and args.verbose:
        print(f"\n{len(not_ready)} logged posts missing slides or content.md:")
        for slug in not_ready:
            print(f"  {slug}")


def pick_slugs(args, ledger):
    if args.slugs:
        slugs = list(dict.fromkeys(args.slugs))
        problems = []
        for s in slugs:
            if is_booked(ledger, s) and not args.allow_repeat:
                problems.append(f"{s}: already in ledger ({ledger['posts'][s]['status']}); "
                                "use --allow-repeat to book it again")
            elif not is_ready(s):
                problems.append(f"{s}: needs slide-*.png and content.md in {COMIC_DIR}/{s}")
        if problems:
            sys.exit("Can't schedule:\n  " + "\n  ".join(problems))
        return slugs
    if args.next:
        pool = [s for s in logged_slugs() if not is_booked(ledger, s) and is_ready(s)]
        if not pool:
            sys.exit("Nothing left to book. Build a batch first (see `queue`).")
        return pool[: args.next]
    sys.exit("Pass slugs or --next N")


def cmd_schedule(args):
    cfg = load_config()
    tz = local_zone(cfg)
    ledger = load_json(LEDGER_PATH, {"posts": {}})
    slugs = pick_slugs(args, ledger)

    wanted = set(args.channels.split(",")) if args.channels else None
    if wanted:
        channels = [ch for ch in cfg["channels"] if ch["name"] in wanted]
    else:
        channels = [ch for ch in cfg["channels"] if ch.get("enabled", True)]
    if wanted:
        missing = wanted - {ch["name"] for ch in channels}
        if missing:
            sys.exit(f"Unknown channel(s) in --channels: {', '.join(sorted(missing))}")
    if not channels:
        sys.exit("No channels selected / enabled in config.")

    key = api_key()
    client = None
    remote = {}
    remote_posts = []
    start = (dt.date.fromisoformat(args.start) if args.start
             else dt.datetime.now(tz).date() + dt.timedelta(days=1))
    slots = args.slots.split(",") if args.slots else cfg["slots"]

    if key:
        client = client_or_exit(cfg)
        remote = {r["id"]: r for r in client.integrations() or []}
        horizon = dt.datetime(start.year, start.month, start.day, tzinfo=tz)
        span = dt.timedelta(days=args.every * (len(slugs) // len(slots) + 2) + 30)
        remote_posts = client.posts_between(horizon - dt.timedelta(days=1), horizon + span)
    elif args.commit:
        client_or_exit(cfg)
    else:
        print("(no POSTIZ_API_KEY: planning offline, can't see slots already booked in Postiz)\n")

    for ch in channels:
        r = remote.get(ch["integration_id"])
        if remote and not r:
            sys.exit(f"Channel {ch['name']}: integration {ch['integration_id']} isn't connected in Postiz.")
        if r and r.get("disabled"):
            sys.exit(f"Channel {ch['name']} is disabled in Postiz; reconnect it first.")
        ch["_identifier"] = (r or {}).get("identifier") or ch.get("platform", "tiktok")

    ids = [ch["integration_id"] for ch in channels]
    taken = taken_times(ledger, remote_posts, ids)
    titles = titles_index()
    slot_gen = slot_iter(start, slots, args.every, tz)
    now = dt.datetime.now(tz)

    plan = []
    for slug in slugs:
        when = next(slot_gen)
        while when <= now + dt.timedelta(minutes=10) or not slot_free(when, taken, ids):
            when = next(slot_gen)
        for iid in ids:
            taken[iid].append(when)
        caption = caption_for(slug)
        slides = slides_for(slug)
        title = tiktok_title(slug, titles, caption)
        targets, skipped = [], []
        for ch in channels:
            if len(slides) > max_images(ch["_identifier"]):
                skipped.append(f"{ch['name']} ({len(slides)} slides > {max_images(ch['_identifier'])})")
                continue
            targets.append({
                "name": ch["name"],
                "integration_id": ch["integration_id"],
                "identifier": ch["_identifier"],
                "settings": channel_settings(ch, ch["_identifier"], title),
            })
        plan.append({"slug": slug, "when": when, "caption": caption, "slides": slides,
                     "title": title, "targets": targets, "skipped": skipped})

    print(f"{'when (' + str(tz) + ')':<26} {'slug':<40} channels")
    for p in plan:
        chans = ", ".join(t["name"] for t in p["targets"]) or "(none)"
        print(f"{p['when'].strftime('%a %Y-%m-%d %H:%M'):<26} {p['slug']:<40} {chans}")
        for s in p["skipped"]:
            print(f"{'':<26}   skipped {s}")
    modes = {ch["name"]: ch.get("posting_method", "UPLOAD") for ch in channels
             if ch["_identifier"].startswith("tiktok")}
    if any(m == "UPLOAD" for m in modes.values()):
        print("\nTikTok UPLOAD mode: each carousel lands in the TikTok inbox at its slot. "
              "Add a sound and post it within 24h or TikTok drops it.")
    if not args.commit:
        n = len(plan)
        print(f"\nDry run. Re-run with --commit to upload {sum(len(p['slides']) for p in plan)} "
              f"slides and book {n} post{'s' if n != 1 else ''}.")
        return

    booked = 0
    try:
        for p in plan:
            if not p["targets"]:
                continue
            entry = ledger["posts"].get(p["slug"], {})
            media = entry.get("media") if entry.get("status") == "uploaded" else None
            if not media:
                media = []
                for i, path in enumerate(p["slides"]):
                    data, mime, ext = jpeg_bytes(path)
                    media.append(client.upload(f"{p['slug']}-slide-{i}{ext}", data, mime))
                    print(f"  uploaded {p['slug']} slide {i}")
                # Remember uploads so a failed booking can retry without re-uploading.
                ledger["posts"][p["slug"]] = {"status": "uploaded", "media": media}
                save_ledger(ledger)
            res = client.create_post(build_payload(p["when"], p["caption"], media, p["targets"]))
            by_integration = {r.get("integration"): r.get("postId") for r in (res or [])}
            ledger["posts"][p["slug"]] = {
                "status": "scheduled",
                "scheduled_for": iso_utc(p["when"]),
                "booked_at": iso_utc(dt.datetime.now(dt.timezone.utc)),
                "media": media,
                "channels": {
                    t["name"]: {
                        "integration_id": t["integration_id"],
                        "post_id": by_integration.get(t["integration_id"]),
                        "settings": {k: v for k, v in t["settings"].items()
                                     if k in ("content_posting_method", "autoAddMusic", "post_type")},
                    }
                    for t in p["targets"]
                },
            }
            save_ledger(ledger)
            booked += 1
            print(f"booked {p['slug']} for {p['when'].strftime('%a %Y-%m-%d %H:%M')}")
    except RateLimited as e:
        print(f"\nPostiz rate limit hit after {booked} posts ({e}). "
              "Progress is saved; run the same command again in an hour.")
        sys.exit(2)
    except ApiError as e:
        print(f"\nStopped after {booked} posts: {e}\nProgress is saved; fix and re-run.")
        sys.exit(1)
    print(f"\nBooked {booked} posts. Ledger: {os.path.relpath(LEDGER_PATH, ROOT)} (commit it).")


def cmd_status(args):
    ledger = load_json(LEDGER_PATH, {"posts": {}})
    entries = ledger["posts"]
    if not entries:
        print("Ledger is empty.")
        return
    cfg = load_json(CONFIG_PATH, {})
    tz = local_zone(cfg)
    states = {}
    fetched = bool(api_key())
    if fetched:
        client = client_or_exit(cfg)
        now = dt.datetime.now(dt.timezone.utc)
        for p in client.posts_between(now - dt.timedelta(days=args.days_back),
                                      now + dt.timedelta(days=120)):
            states[p["id"]] = (p.get("state"), p.get("error"), p.get("releaseURL"))
    rows = []
    for slug, e in entries.items():
        when = e.get("scheduled_for") or e.get("posted_at") or ""
        rows.append((when, slug, e))
    for when, slug, e in sorted(rows, key=lambda r: r[0]):
        if e["status"] != "scheduled":
            stamp = when[:10] if when else "-"
            print(f"{stamp:<16} {slug:<40} {e['status']}")
            continue
        stamp = parse_iso(when).astimezone(tz).strftime("%a %m-%d %H:%M")
        parts = []
        for name, ch in e.get("channels", {}).items():
            state = states.get(ch.get("post_id"))
            if state is None:
                label = "not-in-postiz" if fetched else "scheduled"
            else:
                label = state[0] or "?"
                if state[0] == "ERROR" and state[1]:
                    label += f" ({str(state[1])[:60]})"
            parts.append(f"{name}={label}")
        print(f"{stamp:<16} {slug:<40} {'  '.join(parts)}")


def cmd_unschedule(args):
    cfg = load_json(CONFIG_PATH, {})
    ledger = load_json(LEDGER_PATH, {"posts": {}})
    client = client_or_exit(cfg)
    for slug in args.slugs:
        e = ledger["posts"].get(slug)
        if not e:
            print(f"{slug}: not in ledger")
            continue
        # Postiz deletes by group: one call removes every channel booked together.
        post_ids = [ch["post_id"] for ch in e.get("channels", {}).values() if ch.get("post_id")]
        if post_ids:
            try:
                client.delete_post(post_ids[0])
                print(f"{slug}: deleted from Postiz ({', '.join(e['channels'])})")
            except ApiError as err:
                print(f"{slug}: delete failed ({err}); check the Postiz dashboard. Ledger left as is.")
                continue
        del ledger["posts"][slug]
        save_ledger(ledger)


def cmd_mark_posted(args):
    ledger = load_json(LEDGER_PATH, {"posts": {}})
    when = args.date or dt.date.today().isoformat()
    for slug in args.slugs:
        ledger["posts"][slug] = {"status": "posted_manually", "posted_at": f"{when}T12:00:00Z"}
        print(f"{slug}: marked posted ({when})")
    save_ledger(ledger)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("channels", help="list Postiz integrations and their ids")

    q = sub.add_parser("queue", help="built posts that aren't booked yet")
    q.add_argument("-v", "--verbose", action="store_true")

    s = sub.add_parser("schedule", help="plan (default) or --commit bookings")
    s.add_argument("slugs", nargs="*")
    s.add_argument("--next", type=int, help="take the next N unbooked posts from POST_LOG")
    s.add_argument("--channels", help="comma list of channel names (default: enabled ones)")
    s.add_argument("--start", help="first day, YYYY-MM-DD (default: tomorrow)")
    s.add_argument("--slots", help="override slot times, e.g. 12:15,19:30")
    s.add_argument("--every", type=int, default=1, help="days between slot days (default 1)")
    s.add_argument("--allow-repeat", action="store_true", help="book slugs already in the ledger")
    s.add_argument("--commit", action="store_true", help="actually upload and book")

    st = sub.add_parser("status", help="ledger plus live Postiz state")
    st.add_argument("--days-back", type=int, default=14)

    u = sub.add_parser("unschedule", help="delete booked posts from Postiz and the ledger")
    u.add_argument("slugs", nargs="+")

    m = sub.add_parser("mark-posted", help="record posts you published by hand")
    m.add_argument("slugs", nargs="+")
    m.add_argument("--date", help="YYYY-MM-DD (default today)")

    args = ap.parse_args()
    if args.cmd == "schedule" and args.every < 1:
        sys.exit("--every must be >= 1")
    try:
        run(args)
    except RateLimited as e:
        sys.exit(f"Postiz rate limit hit ({e}). Try again in an hour.")
    except ApiError as e:
        sys.exit(f"Postiz error: {e}")


def run(args):
    {
        "channels": cmd_channels,
        "queue": cmd_queue,
        "schedule": cmd_schedule,
        "status": cmd_status,
        "unschedule": cmd_unschedule,
        "mark-posted": cmd_mark_posted,
    }[args.cmd](args)


if __name__ == "__main__":
    main()
