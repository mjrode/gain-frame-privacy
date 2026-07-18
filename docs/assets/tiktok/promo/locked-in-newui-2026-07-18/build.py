#!/usr/bin/env python3
"""
Build the 2-slide "locked in" promo carousel — NEW app UI variant.

Slide 1: real before photo (cropped from the new-UI deep-dive compare
         screenshot, BEFORE · MAY 22 ~23% overlay intact) — "I ALMOST GAVE UP"
Slide 2: real payoff (photos + WHAT CHANGED · 1581 DAYS + Score 48→78 +
         Body fat rows) — "THEN I LOCKED IN"

Same canvas / fonts / colors / geometry as the comic pipeline (compose.py),
but photos are pasted directly (no white-content masking) with rounded corners.
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "../../../tiktok-screenshots/deep-dive-compare-newui.png")

W, H = 1080, 1350
WHITE = (255, 255, 255)
NEAR_BLACK = (26, 26, 26)
RED = (229, 57, 53)
PILL_BG = (60, 63, 68)
PILL_TXT = (255, 255, 255)

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ARIAL_BOLD = "/Users/michael.rode/Library/Fonts/Arial Bold.ttf"

SIDE_MARGIN = 70
MAX_TEXT_W = W - 2 * SIDE_MARGIN
TOP_ANCHOR = 124
COVER_MAX_FONT = 150
COVER_MIN_FONT = 78
LINE_SPACING = 1.02
ART_TOP_PAD = 40
BOTTOM_MARGIN = 36
CORNER_RADIUS = 28


def _font(path, size):
    return ImageFont.truetype(path, size)


def _draw_page_pill(draw, page):
    n, total = page
    label = f"{n}/{total}"
    font = _font(ARIAL_BOLD, 34)
    b = draw.textbbox((0, 0), label, font=font)
    tw, th = b[2] - b[0], b[3] - b[1]
    pad_x, pad_y = 24, 14
    pw, ph = tw + 2 * pad_x, th + 2 * pad_y
    x1, y1 = W - 34 - pw, 34
    draw.rounded_rectangle([x1, y1, x1 + pw, y1 + ph], radius=ph // 2, fill=PILL_BG)
    draw.text((x1 + pad_x - b[0], y1 + pad_y - b[1]), label, font=font, fill=PILL_TXT)


def _rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1],
                                           radius=radius, fill=255)
    return img, mask


def _place_photo(canvas, photo, top_limit):
    pw, ph = photo.size
    avail_h = (H - BOTTOM_MARGIN) - top_limit
    avail_w = W - 2 * 40
    scale = min(avail_w / pw, avail_h / ph)
    nw, nh = int(pw * scale), int(ph * scale)
    photo = photo.resize((nw, nh), Image.LANCZOS)
    img, mask = _rounded(photo, CORNER_RADIUS)
    x = (W - nw) // 2
    y = (H - BOTTOM_MARGIN) - nh
    canvas.paste(img, (x, y), mask)


def render(lines, photo, page, out_path):
    canvas = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(canvas)
    color_map = {"black": NEAR_BLACK, "red": RED}
    for size in range(COVER_MAX_FONT, COVER_MIN_FONT - 1, -2):
        font = _font(IMPACT, size)
        if all(draw.textbbox((0, 0), t, font=font)[2] <= MAX_TEXT_W for t, _ in lines):
            break
    b = draw.textbbox((0, 0), "AQjgpy", font=font)
    step = (b[3] - b[1]) * LINE_SPACING
    y = TOP_ANCHOR
    for text, color in lines:
        tb = draw.textbbox((0, 0), text, font=font)
        x = (W - (tb[2] - tb[0])) / 2
        draw.text((x - tb[0], y - tb[1]), text, font=font, fill=color_map[color])
        y += step
    _place_photo(canvas, photo, y + ART_TOP_PAD)
    _draw_page_pill(draw, page)
    canvas.save(out_path)
    print("wrote", out_path, canvas.size)


def main():
    src = Image.open(SRC)
    before = src.crop((13, 522, 640, 1361))    # before photo, BEFORE·MAY 22 overlay intact
    payoff = src.crop((0, 522, 1290, 1890))    # photos + WHAT CHANGED/Score/Body fat rows

    render([("I ALMOST", "black"), ("GAVE UP", "red")], before, (1, 2),
           os.path.join(HERE, "slide-1.png"))
    render([("THEN I", "black"), ("LOCKED IN", "red")], payoff, (2, 2),
           os.path.join(HERE, "slide-2.png"))


if __name__ == "__main__":
    main()
