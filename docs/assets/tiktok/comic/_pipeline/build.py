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

ROOT = "/Users/michael.rode/code/project/gain-frame-privacy"
COMIC_DIR = f"{ROOT}/docs/assets/tiktok/comic"
ILLUS = f"{ROOT}/docs/assets/gainframe-guy/illustrations"
SHOTS = f"{ROOT}/docs/app-screenshots/1.21"
MODEL = "gemini-3.1-flash-image-preview"
API = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

MASCOT = f"{ILLUS}/gf-mascot-template.jpeg"
SCENE_REFS = {
    "sleep": f"{ILLUS}/mascot-sleep.jpeg",
    "flex": f"{ILLUS}/mirror-mascot.jpeg",
    "form": f"{ILLUS}/mascot-form.jpeg",
    "gym": f"{ILLUS}/mascot-legs.jpeg",
    "phone": f"{ILLUS}/mascot-pictures.jpeg",
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


CHAR = (
    "Copy the GainFrame Guy character EXACTLY from the first reference image. "
    "The HEAD is ONLY a scan-frame logo: four separate rounded corner brackets floating in empty white space "
    "(three brackets black, the BOTTOM-RIGHT bracket RED), with exactly TWO googly eyes and one small S-curve nose "
    "floating inside. NO mouth, NO eyebrows, NO human head, face, hair, ears or neck. Nothing behind the brackets. "
    "BODY: a solid FLAT matte black/charcoal cartoon silhouette, lean and muscular with a V-taper, wearing "
    "olive/army-green shorts. EXACTLY one head, one torso, TWO arms, TWO legs. Thick clean outlines, flat colors."
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
        f"CRITICAL LAYOUT: place the character and ALL props ENTIRELY within the BOTTOM 42% of the image. "
        f"The ENTIRE TOP 58% must be EMPTY pure-white space with nothing in it.\n\n"
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
                refs = [MASCOT, pick_ref(s["scene"])]
            else:
                prompt = plug_prompt(s["screen"])
                refs = [MASCOT, f"{SHOTS}/{s['shot']}"]
            print(f"  gen art  {s['name']} ...")
            if not gen_art(prompt, refs, art_path):
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--post")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--slides", help="comma list: cover,1,2,3,4,5")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--recompose", action="store_true")
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

    for p in targets:
        build_post(p, only=only, force=args.force, recompose=args.recompose)


if __name__ == "__main__":
    main()
