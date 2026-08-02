#!/usr/bin/env python3
"""
Build pure-white-background copies of the mascot reference images.

WHY THIS EXISTS: every scene reference was drawn on a cream/tan canvas
(mascot-sleep.jpeg is #E4C582). The slide prompt demands a pure #FFFFFF
background, so the model split the difference — it left the outer canvas white
but filled the one *enclosed* region it found, the interior of the mascot's
bracket head, with cream. That is the "solid card head" defect: the head stops
being four floating brackets and becomes an opaque rounded square.

Whitening the references at the source removes the cue entirely. The fill is a
flood from the image border only, so olive shorts and khaki shoes — which sit
in the same colour family as the old background — are never touched.

Run once; re-run only if a reference image is replaced.

    python3 clean_refs.py
"""
import os
from collections import deque

from PIL import Image

ILLUS = "/Users/michael.rode/code/project/gain-frame-privacy/docs/assets/gainframe-guy/illustrations"
OUT_DIR = f"{ILLUS}/_white"

# gary-badge.png is already pure white and is the canonical head — copied as-is.
SOURCES = [
    "gf-mascot-template.jpeg",
    "mirror-mascot.jpeg",
    "mascot-form.jpeg",
    "mascot-legs.jpeg",
    "mascot-pictures.jpeg",
    "mascot-sleep.jpeg",
]

TOLERANCE = 42  # per-channel distance from the sampled corner colour


def whiten(src, dst, tol=TOLERANCE):
    im = Image.open(src).convert("RGB")
    px = im.load()
    w, h = im.size
    seed = px[2, 2]

    def near(c):
        return all(abs(c[i] - seed[i]) <= tol for i in range(3))

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    filled = 0
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        if not near(px[x, y]):
            continue
        seen[i] = 1
        px[x, y] = (255, 255, 255)
        filled += 1
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    im.save(dst, quality=97)
    return filled / (w * h)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name in SOURCES:
        src = f"{ILLUS}/{name}"
        dst = f"{OUT_DIR}/{name}"
        pct = whiten(src, dst)
        print(f"  {name}: {pct:.0%} of canvas whitened -> {dst}")
    print(f"\ndone — {len(SOURCES)} references written to {OUT_DIR}/")


if __name__ == "__main__":
    main()
