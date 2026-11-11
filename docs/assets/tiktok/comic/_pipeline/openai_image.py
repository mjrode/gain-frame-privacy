#!/usr/bin/env python3
"""
Generate one finished comic slide with the OpenAI image API (gpt-image-2).

The model renders the whole slide, typography included. Reference images
(style master, face badge, real app screenshot) are sent with the prompt.

  python3 openai_image.py --out docs/assets/tiktok/comic/<slug>/slide-1.png \
      --prompt-file /tmp/slide-1.txt \
      --ref docs/assets/gainframe-guy/illustrations/gainframe-guy-lean-athletic-reference.png \
      --ref docs/assets/gainframe-guy/illustrations/gary-badge.png

Writes:
  <out>                       final PNG, normalized to --size (default 1080x1350)
  <slug>/_art/<name>.orig.png untouched model output
  <slug>/prompts.json         exact prompt, refs, model and settings per slide

OPENAI_API_KEY comes from the environment or `export OPENAI_API_KEY=` in ~/.zshrc.
Standard library only, plus Pillow for the size check / normalization.
"""
import argparse
import base64
import datetime as dt
import io
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
import uuid

API = "https://api.openai.com/v1/images"


def api_key():
    key = os.environ.get("OPENAI_API_KEY")
    if key:
        return key
    try:
        with open(os.path.expanduser("~/.zshrc")) as f:
            for line in f:
                m = re.match(r"\s*export\s+OPENAI_API_KEY=['\"]?([^'\"\s]+)", line)
                if m:
                    return m.group(1)
    except OSError:
        pass
    sys.exit("OPENAI_API_KEY is not set (env or ~/.zshrc).")


def multipart(fields, files):
    boundary = uuid.uuid4().hex
    out = io.BytesIO()
    for name, value in fields.items():
        out.write(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    for name, path in files:
        mime = mimetypes.guess_type(path)[0] or "image/png"
        out.write(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"; "
                  f"filename=\"{os.path.basename(path)}\"\r\nContent-Type: {mime}\r\n\r\n".encode())
        with open(path, "rb") as f:
            out.write(f.read())
        out.write(b"\r\n")
    out.write(f"--{boundary}--\r\n".encode())
    return out.getvalue(), f"multipart/form-data; boundary={boundary}"


def generate(args, prompt):
    params = {"model": args.model, "prompt": prompt, "size": args.api_size, "quality": args.quality, "n": "1"}
    if args.ref:
        body, ctype = multipart(params, [("image[]", p) for p in args.ref])
        url = f"{API}/edits"
    else:
        params["n"] = 1
        body, ctype = json.dumps(params).encode(), "application/json"
        url = f"{API}/generations"
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Authorization": f"Bearer {api_key()}", "Content-Type": ctype})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"OpenAI {e.code}: {e.read().decode(errors='replace')[:800]}")
    return base64.b64decode(res["data"][0]["b64_json"]), res.get("usage")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--out", required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--prompt")
    g.add_argument("--prompt-file")
    ap.add_argument("--ref", action="append", default=[], help="reference image (repeatable)")
    ap.add_argument("--model", default="gpt-image-2")
    ap.add_argument("--size", default="1080x1350", help="final PNG size")
    ap.add_argument("--api-size", default="1088x1360",
                    help="size requested from the API; both sides must be multiples of 16 (1088x1360 is exact 4:5)")
    ap.add_argument("--quality", default="high", choices=["low", "medium", "high", "auto"])
    args = ap.parse_args()
    for p in args.ref:
        if not os.path.exists(p):
            sys.exit(f"missing reference: {p}")
    prompt = args.prompt if args.prompt is not None else open(args.prompt_file).read().strip()

    raw, usage = generate(args, prompt)
    out = os.path.abspath(args.out)
    post_dir, name = os.path.dirname(out), os.path.splitext(os.path.basename(out))[0]
    os.makedirs(os.path.join(post_dir, "_art"), exist_ok=True)
    orig = os.path.join(post_dir, "_art", f"{name}.orig.png")
    with open(orig, "wb") as f:
        f.write(raw)

    from PIL import Image
    want = tuple(int(x) for x in args.size.split("x"))
    with Image.open(io.BytesIO(raw)) as im:
        got = im.size
        if got != want:
            # Same aspect: resize. Different aspect: fit inside on white so no text is cropped.
            im = im.convert("RGB")
            scale = min(want[0] / got[0], want[1] / got[1])
            im = im.resize((round(got[0] * scale), round(got[1] * scale)), Image.LANCZOS)
            canvas = Image.new("RGB", want, (255, 255, 255))
            canvas.paste(im, ((want[0] - im.size[0]) // 2, (want[1] - im.size[1]) // 2))
            im = canvas
        im.save(out, "PNG")

    log_path = os.path.join(post_dir, "prompts.json")
    log = json.load(open(log_path)) if os.path.exists(log_path) else {}
    log[os.path.basename(out)] = {
        "model": args.model, "size": args.size, "api_size": args.api_size, "returned_size": f"{got[0]}x{got[1]}",
        "quality": args.quality, "refs": args.ref, "prompt": prompt,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "usage": usage,
    }
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2)
        f.write("\n")
    print(f"{out}  (model returned {got[0]}x{got[1]}; original in _art/{name}.orig.png)")


if __name__ == "__main__":
    main()
