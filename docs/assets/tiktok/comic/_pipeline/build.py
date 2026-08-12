#!/usr/bin/env python3
"""
Build GainFrame "sound-fake" TikTok carousels.

Pipeline per slide:
  1. Gemini draws ONLY the mascot art on a blank white canvas (NO text).
  2. compose.py overlays all narrative text deterministically (fixed styling).

Raw art is cached under {post}/_art/ so text can be re-composited without
paying for another image generation.

Usage:
  python3 build.py --post muscle-tips-sound-fake            # one post
  python3 build.py --post muscle-tips-sound-fake --slides cover,1
  python3 build.py --all                                    # every post
  python3 build.py --post <slug> --recompose                # text-only redo
  add --force to regenerate art that already exists
"""
import argparse
import base64
import json
import os
import subprocess
import sys
import time
import urllib.request

import compose

# Repo root: env override, else derived from this file's location
# (_pipeline lives at docs/assets/tiktok/comic/_pipeline).
ROOT = os.environ.get(
    "GAINFRAME_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), *[".."] * 5)),
)
COMIC_DIR = f"{ROOT}/docs/assets/tiktok/comic"
ILLUS = f"{ROOT}/docs/assets/gainframe-guy/illustrations"
SHOTS = f"{ROOT}/docs/app-screenshots/1.21"
MODEL = "gemini-3.1-flash-image-preview"
API = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
# cheap text-out vision model, used only for the head QA gate
QA_MODEL = "gemini-flash-latest"
QA_API = f"https://generativelanguage.googleapis.com/v1beta/models/{QA_MODEL}:generateContent"

# Reference roles, in the order the model sees them. This ordering is the fix for
# the recurring head defect — see HEAD_LOCK below:
#   HEAD    a tight crop of the template's head on pure white. Not gary-badge.png:
#           the badge omits the small tick mark and draws a heavier red bracket,
#           so using it as the head-lock introduced drift of its own.
#   MASCOT  the body/proportions reference.
#   scene   pose and props ONLY. These were drawn on cream canvases AND carry
#           malformed heads (mascot-sleep.jpeg's head is a filled white panel;
#           mirror/legs/pictures draw the brackets as a closed frame with an
#           oversized face glyph). The prompt explicitly strips their authority
#           over head, background and style.
# _white/ holds background-whitened copies built by clean_refs.py; the cream
# canvas was what taught the model to fill the head interior with cream.
HEAD = f"{ILLUS}/_white/_head-reference.png"
MASCOT = f"{ILLUS}/_white/gf-mascot-template.jpeg"
SCENE_REFS = {
    "sleep": f"{ILLUS}/_white/mascot-sleep.jpeg",
    "flex": f"{ILLUS}/_white/mirror-mascot.jpeg",
    "form": f"{ILLUS}/_white/mascot-form.jpeg",
    "gym": f"{ILLUS}/_white/mascot-legs.jpeg",
    "phone": f"{ILLUS}/_white/mascot-pictures.jpeg",
}


def pick_ref(scene):
    s = scene.lower()
    if any(k in s for k in ("asleep", "bed", "sleep", "night", "moon")):
        return SCENE_REFS["sleep"]
    if any(k in s for k in ("flex", "mirror", "physique", "torso", "abs", "v-taper", "lean muscular", "double-bicep")):
        return SCENE_REFS["flex"]
    if any(k in s for k in ("phone", "checklist", "logbook", "logbook", "writing", "progress")):
        return SCENE_REFS["phone"]
    if any(k in s for k in ("machine", "barbell", "squat", "press", "deadlift", "cable", "bench")):
        return SCENE_REFS["gym"]
    return SCENE_REFS["form"]


# The head is the one element that drifts, so it gets its own block, its own
# dedicated reference image, and an automated QA gate (see check_head).
HEAD_LOCK = (
    "THE HEAD IS THE MOST IMPORTANT DETAIL — copy it PIXEL-FOR-PIXEL from the FIRST reference image "
    "(the logo-only image on a pure white background). Reproduce exactly these five elements and NOTHING else:\n"
    "  1. FOUR separate rounded corner brackets, one per corner, arranged as a square. They are SEPARATE strokes "
    "with WIDE GAPS between them — they must NEVER join up, touch, or form a closed or continuous square outline.\n"
    "  2. Three brackets are BLACK. The BOTTOM-RIGHT bracket alone is RED (#E53935). Exactly one red bracket, "
    "always in the bottom-right corner, the same size and weight as the black ones.\n"
    "  3. ONE LARGE black circle eye (upper-left inside the frame) with a small white iris and dark pupil, with a "
    "thick black S-curve stroke descending from it — together these form a single 'g'-like glyph.\n"
    "  4. ONE SMALL separate outlined circle eye to the right of the large one, roughly half its size.\n"
    "  5. ONE small angular black tick mark (like a stubby numeral 1) below and right of the small eye.\n"
    "THE SPACE INSIDE AND BETWEEN THE BRACKETS IS EMPTY PURE WHITE — the plain background shows straight through. "
    "It is NOT a card, panel, plate, sign, tile, box or screen. There is NO fill of any colour behind the brackets, "
    "NO cream or off-white or grey fill, NO outline around the head, NO drop shadow, NO border.\n"
    "The head is NOT a face: NO mouth, NO smile, NO frown, NO eyebrows, NO nose, NO cheeks, NO human or robot head, "
    "NO hair, NO ears, NO neck. Do not enlarge, redraw, simplify or stylise the glyph — replicate it.\n"
    "HEAD CLEARANCE: keep the area immediately around and behind the head EMPTY pure white. No equipment, wall, "
    "machine, prop or shape may pass behind the head — position props to the side or lower so the brackets always "
    "sit against plain white. The head must never occlude anything, because there must be nothing behind it."
)

CHAR = (
    f"{HEAD_LOCK}\n\n"
    "BODY (copy from the SECOND reference image): a solid FLAT matte black/charcoal cartoon silhouette, lean and "
    "muscular with a V-taper, wearing olive/army-green shorts and gray-brown chunky sneakers. EXACTLY one head, "
    "one torso, TWO arms, TWO legs, TWO hands. NO extra or duplicate limbs. Thick clean outlines, flat colors."
)

SCENE_REF_CAVEAT = (
    "The LAST reference image is supplied for POSE, PROPS and CAMERA ANGLE ONLY. Ignore its head completely — its "
    "head is drawn incorrectly. Ignore its background colour, its shading and its framing. The head always comes "
    "from the FIRST reference image and the background is always pure white."
)

# Scenes that imply a room or a ground plane are the main source of background
# violations: ask for a kitchen and the model draws a counter, ask for a walk
# outdoors and it draws grass. Props must read as floating on a blank canvas.
NO_SCENERY = (
    "NO ENVIRONMENT: draw NO floor, NO ground plane, NO grass, NO path, NO wall, NO room, NO counter top, "
    "NO table surface plane, NO horizon and NO background scenery of any kind. Every prop floats on the blank "
    "white canvas. A small soft grey ellipse shadow under the feet is the ONLY thing allowed beneath the "
    "character. Even for indoor or outdoor scenes, show ONLY the character and one or two simple props."
)

NO_TEXT = (
    "ABSOLUTELY NO TEXT: do not render any letters, words, numbers, captions, labels, banners, speech bubbles, "
    "logos or watermarks ANYWHERE. Zero text of any kind. Simple flat props are fine but must contain no writing."
)


def mascot_prompt(scene, badge=False):
    badge_line = ""
    if badge:
        badge_line = (
            "In the TOP-LEFT corner ONLY, draw a tiny GainFrame bracket-frame head icon (about 8% of width) — "
            "no text beside it. Nothing else in the top area.\n\n"
        )
    return (
        f"A single 4:5 portrait cartoon illustration (1080x1350) on a PURE WHITE (#FFFFFF) background — "
        f"flat, no gradient, not cream, not off-white.\n\n"
        f"{CHAR}\n\n"
        f"{badge_line}"
        f"Scene: {scene}\n\n"
        f"{SCENE_REF_CAVEAT}\n\n"
        f"CRITICAL LAYOUT: place the character and ALL props ENTIRELY within the BOTTOM 42% of the image. "
        f"The ENTIRE TOP 58% must be EMPTY pure-white space with nothing in it.\n\n"
        f"{NO_SCENERY}\n\n"
        f"{NO_TEXT}\n\n"
        f"Clean flat cartoon style, thick outlines, pure bright white background."
    )


def plug_prompt(screen_name):
    return (
        "A clean cartoon promotional illustration on a PURE WHITE (#FFFFFF) background.\n\n"
        f"Show a single smartphone in portrait orientation, tilted about 6 degrees, centered horizontally in the "
        f"MIDDLE-AND-LOWER portion of the image. The phone is held by a single right HAND entering from the "
        f"BOTTOM-RIGHT corner — ONLY fingers and hand visible (NO arm, forearm, bicep, shoulder or body). The hand "
        f"is a solid black/charcoal silhouette.\n\n"
        f"PHONE SCREEN: reproduce the second reference image (the GainFrame app '{screen_name}' screen) as "
        f"faithfully as possible — same layout, UI elements, colors and labels, clearly the GainFrame app.\n\n"
        f"To the LEFT of the phone, a small bracket-frame head logo (four corner brackets with two eyes and an "
        f"S-curve nose) next to bold text reading GainFrame, about 15% of width.\n\n"
        f"CRITICAL: the ENTIRE TOP 18% of the image must be EMPTY pure-white space (no text, no elements there). "
        f"Do NOT add any headline text, captions or banners anywhere on the white background. Only the phone UI "
        f"screen may contain text. Pure bright white background, flat cartoon style, thick outlines."
    )


def b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def mime(path):
    return "image/jpeg" if path.lower().endswith((".jpg", ".jpeg")) else "image/png"


def gen_art(prompt, refs, out_path, tries=3):
    parts = [{"inlineData": {"mimeType": mime(p), "data": b64(p)}} for p in refs]
    parts.append({"text": prompt})
    body = json.dumps({
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }).encode()
    key = os.environ["GEMINI_API_KEY"]
    url = f"{API}?key={key}"
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=180) as r:
                resp = json.loads(r.read())
            if "error" in resp:
                raise RuntimeError(resp["error"].get("message", "api error"))
            img_data = None
            for p in resp["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    img_data = p["inlineData"]["data"]
                    break
            if not img_data:
                raise RuntimeError("no image in response")
            with open(out_path, "wb") as f:
                f.write(base64.b64decode(img_data))
            return True
        except Exception as e:
            print(f"    attempt {attempt}/{tries} failed: {e}")
            if attempt < tries:
                time.sleep(4 * attempt)
    return False


# Asking "is the head correct?" against an abstract rule list does not work: on a
# white page the head interior is legitimately white, so the checker flags every
# slide as a "white card". Handing it a labelled GOOD and a labelled BAD exemplar
# turns the judgement into a comparison, which it gets right.
HEAD_QA_PROMPT = (
    "IMAGE A is the CORRECT mascot head. Study it: four SEPARATE corner brackets (three black, bottom-right one "
    "red) with the plain page background showing through every gap, and inside them a large circle eye with an "
    "S-curve stroke, a smaller circle eye, and a small angular tick mark. All three of those inner marks are "
    "CORRECT and expected — the tick mark is part of the logo, not a defect.\n\n"
    "IMAGE B is an INCORRECT mascot head: the brackets have been absorbed into a solid rounded-square panel with "
    "its own outline, so the head reads as a card or sign rather than four floating brackets.\n\n"
    "IMAGE C is a generated illustration. Look ONLY at the character's head (if two characters, check both). "
    "Decide which of A or B it resembles.\n\n"
    "Answer ok=false ONLY if C's head shows one of these:\n"
    "  - it resembles B: a panel, card, plate, sign or tile silhouette behind the brackets; an outline or border "
    "enclosing the head as a whole; brackets joined into a closed square; or an interior shaded differently from "
    "the surrounding page\n"
    "  - no red bracket at all, more than one red bracket, or the red bracket is not in the bottom-right corner\n"
    "  - a mouth, smile, frown, or eyebrows\n"
    "  - two same-sized eyes instead of one large eye-plus-S-curve and one smaller eye\n"
    "  - a human, animal or robot head instead of the bracket logo\n"
    "  - a solid opaque region filling the head that hides scenery passing behind it, so the head reads as an "
    "opaque tile rather than open brackets\n\n"
    "Otherwise answer ok=true. Four separate brackets over plain white with the page showing through is CORRECT. "
    "Do not flag it as a white card, and do not flag the tick mark as an extra face or nose.\n\n"
    "Reply with ONLY a compact JSON object, no prose and no code fence: "
    '{"ok": true} or {"ok": false, "why": "<max 12 words>"}'
)

BAD_HEAD = f"{ILLUS}/_white/_bad-head-example.png"


def check_head(art_path):
    """Vision QA on generated art. Returns (ok, reason).

    Bad heads were the single most common defect and they are cheap to catch
    here but expensive to catch after a batch is composed and synced. Fails
    OPEN — if the check itself errors we keep the art rather than burn retries.
    """
    parts = [
        {"inlineData": {"mimeType": mime(HEAD), "data": b64(HEAD)}},
        {"inlineData": {"mimeType": mime(BAD_HEAD), "data": b64(BAD_HEAD)}},
        {"inlineData": {"mimeType": mime(art_path), "data": b64(art_path)}},
        {"text": HEAD_QA_PROMPT},
    ]
    body = json.dumps({"contents": [{"parts": parts}]}).encode()
    url = f"{QA_API}?key={os.environ['GEMINI_API_KEY']}"
    try:
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=90) as r:
            resp = json.loads(r.read())
        txt = "".join(p.get("text", "") for p in resp["candidates"][0]["content"]["parts"])
        txt = txt.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        verdict = json.loads(txt)
        return bool(verdict.get("ok")), verdict.get("why", "")
    except Exception as e:
        print(f"    (head QA skipped: {e})")
        return True, "qa-unavailable"


BG_MIN_WHITE = 0.90   # share of border pixels that must be near-white


def check_background(art_path):
    """Deterministic pure-white-background check. Returns (ok, reason).

    Cheap and free, so it runs before the vision check. Catches the model
    inventing a tinted floor or wall — the brand rule is a flat #FFFFFF canvas,
    and a coloured band reads as a different template beside the other slides.
    Samples the outer border ring only, so a large dark prop in the middle of
    the frame is not mistaken for a background.
    """
    from PIL import Image

    im = Image.open(art_path).convert("RGB")
    w, h = im.size
    px = im.load()
    band = max(2, int(min(w, h) * 0.02))
    total = white = 0
    for y in list(range(band)) + list(range(h - band, h)):
        for x in range(0, w, 2):
            r, g, b = px[x, y]
            total += 1
            white += (r > 242 and g > 242 and b > 242)
    for x in list(range(band)) + list(range(w - band, w)):
        for y in range(0, h, 2):
            r, g, b = px[x, y]
            total += 1
            white += (r > 242 and g > 242 and b > 242)
    share = white / max(1, total)
    if share < BG_MIN_WHITE:
        return False, f"background not white ({share:.0%} of border is white)"
    return True, ""


def gen_art_checked(prompt, refs, out_path, attempts=3):
    """Generate art, then gate it on background + head QA, regenerating on reject.

    Keeps the last attempt even if it never passes — a flagged slide is better
    than a missing one, and the failure is printed so it can be re-rolled by
    hand with --force.
    """
    for n in range(1, attempts + 1):
        if not gen_art(prompt, refs, out_path):
            return False
        ok, why = check_background(out_path)
        if ok:
            ok, why = check_head(out_path)
        if ok:
            return True
        if n < attempts:
            print(f"    rejected ({why}) — regenerating {n + 1}/{attempts}")
            time.sleep(2)
        else:
            print(f"    !! still failing after {attempts} tries ({why}) — kept, re-roll with --force")
    return True


def slides_for(post):
    """Yield (key, art_name, art_prompt_kind, scene/screen, spec_builder)."""
    total = 1 + len(post["tips"]) + (1 if post.get("plug") else 0)
    out = []
    # cover
    out.append({
        "name": "slide-0-cover.png",
        # no badge: the mascot's own bracket-head is the brand mark, and numbered
        # slides carry no badge — keeping covers badge-free stays consistent and
        # avoids an orphan badge floating in whitespace after art auto-crop.
        "kind": "mascot", "badge": False, "scene": post["cover_scene"],
        "spec": {"type": "cover", "page": [1, total], "lines": post["cover_lines"]},
    })
    for i, tip in enumerate(post["tips"], start=1):
        out.append({
            "name": f"slide-{i}.png",
            "kind": "mascot", "badge": False, "scene": tip["scene"],
            "spec": {"type": "numbered", "page": [i + 1, total], "number": i,
                     "headline": tip["headline"], "accent": tip.get("accent", ""),
                     "sub1": tip.get("sub1"), "sub2": tip.get("sub2")},
        })
    if post.get("plug"):
        plug = post["plug"]
        idx = 1 + len(post["tips"])
        out.append({
            "name": f"slide-{idx}.png",
            "kind": "plug", "screen": plug["screen_name"], "shot": plug["screenshot"],
            "spec": {"type": "plug", "page": [idx + 1, total], "h1": plug["h1"], "h2": plug["h2"]},
        })
    return out


def build_post(post, only=None, force=False, recompose=False):
    slug = post["slug"]
    out_dir = f"{COMIC_DIR}/{slug}"
    art_dir = f"{out_dir}/_art"
    os.makedirs(art_dir, exist_ok=True)
    print(f"\n=== {slug} ===")
    for s in slides_for(post):
        key = "cover" if "cover" in s["name"] else s["name"].replace("slide-", "").replace(".png", "")
        if only and key not in only:
            continue
        art_path = f"{art_dir}/{s['name']}"
        final_path = f"{out_dir}/{s['name']}"
        need_art = force or not os.path.exists(art_path)
        if need_art and not recompose:
            if s["kind"] == "mascot":
                prompt = mascot_prompt(s["scene"], badge=s["badge"])
                refs = [HEAD, MASCOT, pick_ref(s["scene"])]
                generate = gen_art_checked          # head QA gate + auto-retry
            else:
                prompt = plug_prompt(s["screen"])
                refs = [MASCOT, f"{SHOTS}/{s['shot']}"]
                generate = gen_art                  # no mascot head to check
            print(f"  gen art  {s['name']} ...")
            if not generate(prompt, refs, art_path):
                print(f"  !! FAILED art for {s['name']} — skipping")
                continue
            time.sleep(1)
        elif not os.path.exists(art_path):
            print(f"  !! no cached art for {s['name']} and recompose set — skipping")
            continue
        compose.compose(s["spec"], art_path, final_path)
        # webp
        subprocess.run(["cwebp", "-q", "90", final_path, "-o", final_path[:-4] + ".webp"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"  ok       {s['name']}")


def verify_post(post):
    """Re-run both QA gates over already-cached art and report failures.

    Lets a finished batch be audited without regenerating anything. Art cached
    before a gate existed is exactly the case this catches.
    """
    slug = post["slug"]
    art_dir = f"{COMIC_DIR}/{slug}/_art"
    bad = []
    for s in slides_for(post):
        art_path = f"{art_dir}/{s['name']}"
        if not os.path.exists(art_path) or s["kind"] != "mascot":
            continue
        ok, why = check_background(art_path)
        if ok:
            ok, why = check_head(art_path)
        if not ok:
            bad.append((s["name"], why))
    if bad:
        print(f"\n{slug}:")
        for name, why in bad:
            key = "cover" if "cover" in name else name.replace("slide-", "").replace(".png", "")
            print(f"  FAIL {name}  {why}")
            print(f"       fix: --post {slug} --slides {key} --force")
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--post")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--slides", help="comma list: cover,1,2,3,4,5")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--recompose", action="store_true")
    ap.add_argument("--verify", action="store_true",
                    help="re-run QA gates on cached art; generate nothing")
    args = ap.parse_args()

    if "GEMINI_API_KEY" not in os.environ:
        sys.exit("GEMINI_API_KEY not set — run: source ~/.zshrc")

    data = json.load(open(f"{os.path.dirname(__file__)}/posts.json"))
    posts = data["posts"]
    only = set(args.slides.split(",")) if args.slides else None

    if args.all:
        targets = posts
    elif args.post:
        targets = [p for p in posts if p["slug"] == args.post]
        if not targets:
            sys.exit(f"no post {args.post}")
    else:
        sys.exit("pass --post <slug> or --all")

    if args.verify:
        total = sum(len(verify_post(p)) for p in targets)
        print(f"\n{total} slide(s) failed QA across {len(targets)} post(s)")
        return

    for p in targets:
        build_post(p, only=only, force=args.force, recompose=args.recompose)


if __name__ == "__main__":
    main()
