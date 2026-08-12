#!/usr/bin/env python3
"""Build two-slide myth-vs-reality GainFrame micro-carousels.

Slide 1 uses one Gemini call for a six-vignette illustration and deterministic
Pillow typography. Slide 2 uses the existing phone-in-hand promo treatment.
"""

import argparse
import json
import os
import subprocess
import sys
import time

import build
import compose


ROOT = build.ROOT
PIPELINE_DIR = f"{ROOT}/docs/assets/tiktok/comic/_pipeline"
COMIC_DIR = f"{ROOT}/docs/assets/tiktok/comic"
STYLE_SOURCE = (
    "/tmp/codex-remote-attachments/019fd7a9-eacf-7392-9051-f786909d8692/"
    "7F354691-42F7-41B9-AB88-09876DD4DB19/2-Photo-2.jpg"
)
STYLE_REF = "/tmp/gainframe-micro-carousel-reference.jpg"
SCENE_REF = f"{build.ILLUS}/_white/mascot-legs.jpeg"


def ensure_style_ref():
    if os.path.exists(STYLE_REF):
        return
    if not os.path.exists(STYLE_SOURCE):
        sys.exit(f"missing supplied style reference: {STYLE_SOURCE}")
    subprocess.run([
        "sips", "-c", "734", "590", "--cropOffset", "204", "0",
        STYLE_SOURCE, "--out", STYLE_REF,
    ], check=True, stdout=subprocess.DEVNULL)


def grid_prompt(post):
    think = "\n".join(
        f"  {i + 1}. Column {i + 1}: {scene}."
        for i, scene in enumerate(post["think_art"])
    )
    actual = "\n".join(
        f"  {i + 1}. Column {i + 1}: {scene}."
        for i, scene in enumerate(post["actual_art"])
    )
    return f"""A single clean 4:5 portrait fitness infographic illustration on a PURE WHITE (#FFFFFF) canvas.

REFERENCE ROLES:
- FIRST image: exact GainFrame Guy head design. Copy it pixel-for-pixel whenever the mascot appears.
- SECOND image: exact GainFrame Guy body, olive shorts, shoes and proportions.
- THIRD image: layout and flat cartoon infographic style only. Do not copy its words, labels, TikTok UI, badges or page controls.
- FOURTH image: gym equipment and pose style only. Ignore its head and background.

{build.CHAR}

DRAW EXACTLY SIX ISOLATED VIGNETTES in a strict 3-column by 2-row layout. No boxes, cards, grid lines, dividers or colored backgrounds. Each vignette is centered in its column, similar in scale, and separated by generous white space.

TOP ART ROW — centers at x=18%, 50%, 82% and y=30% of the canvas. Keep every mark between 22% and 37% of image height:
{think}

BOTTOM ART ROW — centers at x=18%, 50%, 82% and y=72% of the canvas. Keep every mark between 61% and 80% of image height:
{actual}

MASCOT COUNT: Show GainFrame Guy EXACTLY ONCE, only in the bottom-left vignette described above. All other vignettes are isolated equipment, anatomy or prop illustrations with no people and no extra mascot heads.

CRITICAL EMPTY BANDS: Leave the top 21% completely empty white; leave 37%–61% completely empty white; leave the bottom 20% completely empty white. These bands will receive deterministic typography later.

{build.NO_SCENERY}

{build.NO_TEXT}

FORBIDDEN CONTENT FROM THE THIRD REFERENCE: do not copy its massage gun, ice bath, foam roller, bed, moon, food plate or walking mascot. It is a spacing/style reference only; every vignette must depict the six descriptions above.

Do not draw checkmarks, X marks, letters, numbers, labels, captions, logos, watermarks or page pills. Clean modern cartoon infographic style, thick black outlines, muted realistic equipment colors, flat colors, minimal shading, pure white background."""


def micro_plug_prompt(screen_name):
    return build.plug_prompt(screen_name) + """

STRICT PRODUCT LAYOUT OVERRIDES:
- Draw EXACTLY ONE GainFrame logo lockup, to the left of the phone, no wider than 18% of the canvas.
- Never enlarge the logo, repeat it, place it behind the phone, or let it overlap the phone.
- The smartphone must have a clearly visible complete black device frame on all four sides.
- The app screenshot must appear INSIDE that phone frame, never as a flat rectangular screenshot floating on the page.
- Show EXACTLY ONE dark-charcoal hand gripping the device from bottom-right; no peach human hand and no extra fingers floating over the screen.
- Keep every element below the empty headline band."""


def micro_spec(post):
    return {
        "type": "micro",
        "page": [1, 2],
        "think_title": post["think_title"],
        "actual_title": post["actual_title"],
        "think_labels": post["think_labels"],
        "actual_labels": post["actual_labels"],
    }


def output_webp(png_path):
    subprocess.run(
        ["cwebp", "-q", "90", png_path, "-o", png_path[:-4] + ".webp"],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


def build_post(post, force=False, recompose=False):
    slug = post["slug"]
    out_dir = f"{COMIC_DIR}/{slug}"
    art_dir = f"{out_dir}/_art"
    os.makedirs(art_dir, exist_ok=True)
    print(f"\n=== {slug} ===", flush=True)

    cover_art = f"{art_dir}/slide-0-cover.png"
    cover_out = f"{out_dir}/slide-0-cover.png"
    if (force or not os.path.exists(cover_art)) and not recompose:
        print("  gen art  slide-0-cover.png ...", flush=True)
        refs = [build.HEAD, build.MASCOT, STYLE_REF, SCENE_REF]
        if not build.gen_art_checked(grid_prompt(post), refs, cover_art):
            print("  !! FAILED art for slide-0-cover.png", flush=True)
            return False
        time.sleep(1)
    if not os.path.exists(cover_art):
        print("  !! missing cover art", flush=True)
        return False
    compose.compose(micro_spec(post), cover_art, cover_out)
    output_webp(cover_out)
    print("  ok       slide-0-cover.png", flush=True)

    plug = post["plug"]
    plug_art = f"{art_dir}/slide-1.png"
    plug_out = f"{out_dir}/slide-1.png"
    shot = f"{ROOT}/{plug['screenshot']}"
    if (force or not os.path.exists(plug_art)) and not recompose:
        print("  gen art  slide-1.png ...", flush=True)
        prompt = micro_plug_prompt(plug["screen_name"])
        if not build.gen_art(prompt, [build.MASCOT, shot], plug_art):
            print("  !! FAILED art for slide-1.png", flush=True)
            return False
        time.sleep(1)
    if not os.path.exists(plug_art):
        print("  !! missing plug art", flush=True)
        return False
    compose.compose({
        "type": "plug", "page": [2, 2],
        "h1": plug["h1"], "h2": plug["h2"],
    }, plug_art, plug_out)
    output_webp(plug_out)
    print("  ok       slide-1.png", flush=True)

    with open(f"{out_dir}/content.md", "w") as f:
        f.write(f"{post['caption']}\n\n{post['hashtags']}\n")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--post")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--recompose", action="store_true")
    args = parser.parse_args()

    if "GEMINI_API_KEY" not in os.environ:
        sys.exit("GEMINI_API_KEY not set — run: source ~/.zshrc")
    ensure_style_ref()

    with open(f"{PIPELINE_DIR}/micro-posts.json") as f:
        posts = json.load(f)["posts"]
    if args.all:
        targets = posts
    elif args.post:
        targets = [post for post in posts if post["slug"] == args.post]
        if not targets:
            sys.exit(f"no post {args.post}")
    else:
        sys.exit("pass --all or --post <slug>")

    failed = []
    for post in targets:
        if not build_post(post, force=args.force, recompose=args.recompose):
            failed.append(post["slug"])
    if failed:
        sys.exit(f"failed: {', '.join(failed)}")


if __name__ == "__main__":
    main()
