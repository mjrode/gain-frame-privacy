#!/usr/bin/env python3
"""Render the greenfield TikTok slideshow batch at 1080x1350."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[4]
W, H = 1080, 1350

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
COURIER_BOLD = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def fit_crop(image: Image.Image, size=(W, H), anchor=(0.5, 0.5)) -> Image.Image:
    image = image.convert("RGB")
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = round((resized.width - size[0]) * anchor[0])
    top = round((resized.height - size[1]) * anchor[1])
    return resized.crop((left, top, left + size[0], top + size[1]))


def contain_crop(image: Image.Image, box: tuple[int, int, int, int], crop=None, radius=30) -> Image.Image:
    if crop:
        image = image.crop(crop)
    x0, y0, x1, y1 = box
    fitted = fit_crop(image, (x1 - x0, y1 - y0))
    mask = Image.new("L", fitted.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, fitted.width, fitted.height), radius=radius, fill=255)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(fitted.convert("RGBA"), (x0, y0), mask)
    return layer


def text_wrap(draw: ImageDraw.ImageDraw, text: str, fnt, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            trial = f"{current} {word}"
            if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
                current = trial
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def draw_wrapped(draw, xy, text, fnt, fill, max_width, spacing=10, align="left", anchor=None, stroke_width=0, stroke_fill=None):
    lines = text_wrap(draw, text, fnt, max_width)
    x, y = xy
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=fnt, stroke_width=stroke_width)
        lw = bbox[2] - bbox[0]
        if align == "center":
            tx = x + (max_width - lw) / 2
        elif align == "right":
            tx = x + max_width - lw
        else:
            tx = x
        draw.text((tx, y), line, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)
        y += bbox[3] - bbox[1] + spacing
    return y


def gradient(size, start, end, vertical=True):
    img = Image.new("RGB", size)
    px = img.load()
    span = size[1] if vertical else size[0]
    for i in range(span):
        t = i / max(1, span - 1)
        color = tuple(round(start[c] * (1 - t) + end[c] * t) for c in range(3))
        if vertical:
            ImageDraw.Draw(img).line((0, i, size[0], i), fill=color)
        else:
            ImageDraw.Draw(img).line((i, 0, i, size[1]), fill=color)
    return img


def save(img: Image.Image, folder: str, number: int):
    out = ROOT / folder / f"slide-{number}.png"
    img.convert("RGB").save(out, quality=95)


def shadow_card(base, box, radius, fill, shadow=(0, 0, 0, 80), offset=(0, 14), blur=18):
    x0, y0, x1, y1 = box
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((x0 + offset[0], y0 + offset[1], x1 + offset[0], y1 + offset[1]), radius, fill=shadow)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)
    ImageDraw.Draw(base).rounded_rectangle(box, radius, fill=fill)


def render_year():
    folder = "the-year-in-dots"
    src = Image.open(ROOT / folder / "_sources/blue-hour-athlete.png")
    img = fit_crop(src).convert("RGBA")
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for y in range(0, 620):
        a = round(105 * (1 - y / 620))
        sd.line((0, y, W, y), fill=(3, 10, 28, a))
    img.alpha_composite(shade)
    d = ImageDraw.Draw(img)
    d.text((74, 70), "01 / 05", font=font(COURIER_BOLD, 23), fill=(171, 255, 59))
    draw_wrapped(d, (74, 145), "what a year of showing up looks like from far away", font(ARIAL_BOLD, 75), "white", 760, spacing=3)
    d.line((76, 520, 260, 520), fill=(171, 255, 59), width=6)
    save(img, folder, 0)

    navy = (6, 13, 33)
    lime = (176, 255, 57)
    img = Image.new("RGBA", (W, H), navy + (255,))
    d = ImageDraw.Draw(img)
    d.text((70, 55), "THE YEAR / CHECK-IN VIEW", font=font(COURIER_BOLD, 22), fill=(112, 131, 171))
    d.text((70, 105), "NOT PERFECT.", font=font(ARIAL_BOLD, 68), fill="white")
    d.text((70, 178), "STILL PROOF.", font=font(ARIAL_BOLD, 68), fill=lime)
    random.seed(21)
    points = [(105 + i * 79, 430 + int(140 * math.sin(i * 0.82)) + random.randint(-35, 35)) for i in range(12)]
    for a, b in zip(points, points[1:]):
        d.line((a[0], a[1], b[0], b[1]), fill=(72, 100, 135), width=3)
    months = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split()
    for i, (x, y) in enumerate(points):
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse((x - 34, y - 34, x + 34, y + 34), fill=lime + (65,))
        glow = glow.filter(ImageFilter.GaussianBlur(18))
        img.alpha_composite(glow)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((x - 34, y - 43, x + 34, y + 43), 9, fill=(15, 31, 54), outline=lime, width=2)
        d.rectangle((x - 24, y - 33, x + 24, y + 11), fill=(28 + i * 3, 58 + i * 4, 86 + i * 3))
        d.ellipse((x - 6, y + 21, x + 6, y + 33), fill=lime)
        d.text((x - 19, y + 54), months[i], font=font(COURIER_BOLD, 15), fill=(182, 193, 216))
    d.rounded_rectangle((70, 1010, 1010, 1210), 28, fill=(13, 26, 48), outline=(40, 59, 88), width=2)
    d.text((105, 1050), "12 CHECK-INS.", font=font(ARIAL_BOLD, 58), fill="white")
    d.text((105, 1122), "ONE DIRECTION.", font=font(ARIAL_BOLD, 58), fill=lime)
    d.text((70, 1270), "GAINFRAME", font=font(COURIER_BOLD, 25), fill=(121, 140, 176))
    save(img, folder, 1)


def halftone(img, color=(245, 78, 24), step=18):
    d = ImageDraw.Draw(img)
    for y in range(0, H, step):
        for x in range((y // step % 2) * step // 2, W, step):
            if (x * 13 + y * 7) % 91 < 34:
                d.ellipse((x, y, x + 3, y + 3), fill=color + (42,))


def render_failed():
    folder = "failed-the-wrong-test"
    cream, cobalt, orange = (250, 239, 208), (14, 65, 188), (255, 75, 20)
    img = fit_crop(Image.open(ROOT / folder / "_sources/failed-scale-test.png")).convert("RGBA")
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((55, 55, 700, 310), 20, fill=cream + (245,), outline=orange, width=6)
    d.text((90, 88), "I FAILED", font=font(ARIAL_BOLD, 84), fill=cobalt)
    d.text((90, 173), "THE WRONG TEST.", font=font(ARIAL_BOLD, 60), fill=orange)
    d.text((90, 260), "BODY RECOMP / 01", font=font(COURIER_BOLD, 20), fill=cobalt)
    save(img, folder, 0)

    img = Image.new("RGBA", (W, H), cream + (255,))
    halftone(img)
    d = ImageDraw.Draw(img)
    d.rectangle((58, 55, 1022, 1295), fill=(255, 248, 226), outline=cobalt, width=8)
    d.rectangle((58, 55, 1022, 215), fill=cobalt)
    d.text((94, 90), "BODY RECOMP", font=font(ARIAL_BOLD, 67), fill=cream)
    d.text((95, 162), "REPORT CARD", font=font(COURIER_BOLD, 28), fill=(136, 199, 255))
    rows = [
        ("SCALE WEIGHT", "INCOMPLETE", orange),
        ("PROGRESS PHOTOS", "CONTEXT", cobalt),
        ("CONSISTENCY", "SIGNAL", cobalt),
        ("PATIENCE", "REQUIRED", orange),
    ]
    y = 300
    for idx, (label, value, color) in enumerate(rows):
        d.text((95, y), f"0{idx + 1}", font=font(COURIER_BOLD, 21), fill=(128, 121, 103))
        d.text((150, y - 5), label, font=font(ARIAL_BOLD, 42), fill=(21, 31, 66))
        d.line((150, y + 67, 930, y + 67), fill=(168, 160, 142), width=2)
        d.rounded_rectangle((618, y + 8, 948, y + 58), 4, fill=color)
        vf = font(COURIER_BOLD, 22 if value == "INCOMPLETE" else 25)
        vb = d.textbbox((0, 0), value, font=vf)
        d.text((783 - (vb[2] - vb[0]) / 2, y + 19), value, font=vf, fill=cream)
        y += 195
    d.text((95, 1110), "COMMENTS", font=font(COURIER_BOLD, 20), fill=cobalt)
    d.text((95, 1150), "READ MORE THAN ONE LINE.", font=font(ARIAL_BOLD, 39), fill=orange)
    save(img, folder, 1)

    img = Image.new("RGBA", (W, H), cobalt + (255,))
    d = ImageDraw.Draw(img)
    d.text((70, 55), "READ THE", font=font(ARIAL_BOLD, 69), fill=cream)
    d.text((70, 125), "WHOLE REPORT.", font=font(ARIAL_BOLD, 69), fill=orange)
    d.rounded_rectangle((55, 250, 1025, 1235), 26, fill=(8, 31, 102), outline=cream, width=5)
    screenshot = Image.open(PROJECT / "docs/assets/tiktok-screenshots/deep-dive-compare-newui.png")
    img.alpha_composite(contain_crop(screenshot, (120, 305, 660, 1165), crop=(0, 0, 1290, 2050), radius=24))
    d = ImageDraw.Draw(img)
    d.text((710, 330), "PHOTO", font=font(COURIER_BOLD, 21), fill=(137, 194, 255))
    d.text((710, 368), "+", font=font(ARIAL_BOLD, 50), fill=orange)
    d.text((710, 435), "BODY", font=font(COURIER_BOLD, 21), fill=(137, 194, 255))
    d.text((710, 473), "+", font=font(ARIAL_BOLD, 50), fill=orange)
    d.text((710, 540), "TIME", font=font(COURIER_BOLD, 21), fill=(137, 194, 255))
    draw_wrapped(d, (710, 670), "GainFrame compares photos, body-composition estimates, and change over time.", font(ARIAL_BOLD, 36), cream, 255, spacing=10)
    d.text((70, 1270), "GAINFRAME / CONTEXT WINS", font=font(COURIER_BOLD, 21), fill=(137, 194, 255))
    save(img, folder, 2)


CHAT_BG = (225, 239, 248)
CHAT_NAVY = (19, 36, 61)
CHAT_BLUE = (102, 199, 245)
CHAT_MINT = (181, 246, 220)


def chat_bubble(img, text, xy, width, side="left", color=None, name=None):
    d = ImageDraw.Draw(img)
    color = color or (255, 255, 255)
    f = font(ARIAL_BOLD, 37)
    lines = text_wrap(d, text, f, width - 58)
    heights = [d.textbbox((0, 0), line, font=f)[3] for line in lines]
    h = sum(heights) + 20 * max(0, len(lines) - 1) + 52 + (28 if name else 0)
    x, y = xy
    d.rounded_rectangle((x, y, x + width, y + h), 34, fill=color)
    if name:
        d.text((x + 28, y + 18), f"{name.upper()}:", font=font(COURIER_BOLD, 18), fill=(88, 111, 136))
        ty = y + 52
    else:
        ty = y + 25
    for line in lines:
        d.text((x + 28, ty), line, font=f, fill=CHAT_NAVY)
        ty += d.textbbox((0, 0), line, font=f)[3] + 20
    return y + h


def chat_header(img, sub="4 PEOPLE • ACTIVE"):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 190), fill=(239, 248, 253))
    d.ellipse((55, 50, 143, 138), fill=CHAT_NAVY)
    d.text((83, 72), "G", font=font(ARIAL_BOLD, 39), fill="white")
    d.text((175, 50), "GYM CHAT", font=font(ARIAL_BOLD, 48), fill=CHAT_NAVY)
    d.text((178, 113), sub, font=font(COURIER_BOLD, 19), fill=(86, 115, 142))
    d.line((0, 189, W, 189), fill=(193, 213, 226), width=2)


def render_chat():
    folder = "gym-group-chat-leak"
    img = Image.new("RGBA", (W, H), CHAT_BG + (255,))
    chat_header(img)
    y = 245
    y = chat_bubble(img, "nothing changed", (320, y), 690, "right", CHAT_BLUE, "ME") + 28
    y = chat_bubble(img, "send day one", (55, y), 590, color=(255, 255, 255), name="LEO") + 28
    y = chat_bubble(img, "and today", (55, y), 520, color=CHAT_MINT, name="MAYA") + 28
    y = chat_bubble(img, "absolutely not", (380, y), 630, "right", CHAT_BLUE, "ME")
    d = ImageDraw.Draw(img)
    d.text((60, 1255), "LEAKED FROM THE CAMERA ROLL", font=font(COURIER_BOLD, 20), fill=(84, 112, 139))
    save(img, folder, 0)

    img = Image.new("RGBA", (W, H), CHAT_BG + (255,))
    chat_header(img, "4 PEOPLE • 2 TYPING")
    chat_bubble(img, "too late", (55, 235), 420, color=(255, 255, 255), name="LEO")
    pair = Image.open(ROOT / folder / "_sources/progress-pair.png")
    shadow_card(img, (55, 410, 1025, 1105), 34, (255, 255, 255, 255))
    img.alpha_composite(contain_crop(pair, (86, 441, 994, 1036), radius=22))
    d = ImageDraw.Draw(img)
    d.text((90, 1054), "DAY ONE                            TODAY", font=font(COURIER_BOLD, 17), fill=(77, 101, 126))
    chat_bubble(img, "oh.", (650, 1150), 360, "right", CHAT_MINT, "MAYA")
    save(img, folder, 1)

    img = Image.new("RGBA", (W, H), CHAT_BG + (255,))
    chat_header(img, "4 PEOPLE • RECEIPTS ON")
    chat_bubble(img, "fine. the comparison wins.", (230, 225), 795, "right", CHAT_BLUE, "ME")
    screenshot = Image.open(PROJECT / "docs/assets/tiktok-screenshots/deep-dive-compare-newui.png")
    shadow_card(img, (78, 440, 1002, 1170), 36, (255, 255, 255, 255))
    img.alpha_composite(contain_crop(screenshot, (110, 472, 970, 1105), crop=(0, 160, 1290, 1660), radius=22))
    d = ImageDraw.Draw(img)
    reactions = [(650, 1122, "SEEN 2"), (790, 1122, "SAVED 1")]
    for x, y, label in reactions:
        d.rounded_rectangle((x, y, x + 130, y + 55), 25, fill=(255, 255, 255), outline=(187, 211, 226), width=2)
        d.text((x + 18, y + 16), label, font=font(ARIAL_BOLD, 19), fill=CHAT_NAVY)
    d.text((82, 1254), "GAINFRAME • COMPARISON ATTACHMENT", font=font(COURIER_BOLD, 20), fill=(84, 112, 139))
    save(img, folder, 2)


VIOLET = (38, 9, 91)
CYAN = (46, 242, 235)
PINK = (255, 70, 193)
YELLOW = (244, 255, 74)


def pixel_sparks(d, seed=3):
    random.seed(seed)
    for _ in range(75):
        x, y = random.randint(20, W - 30), random.randint(20, H - 30)
        s = random.choice((3, 5, 8))
        color = random.choice((CYAN, PINK, YELLOW, (129, 83, 255)))
        d.rectangle((x, y, x + s, y + s), fill=color)


def arcade_card(img, box, kind, active=True):
    x0, y0, x1, y1 = box
    d = ImageDraw.Draw(img)
    outline = PINK if kind == "PUMP" else CYAN
    d.rounded_rectangle((x0 + 12, y0 + 18, x1 + 12, y1 + 18), 30, fill=(10, 3, 31))
    d.rounded_rectangle(box, 30, fill=(65, 22, 128), outline=outline, width=7)
    cx, cy = (x0 + x1) // 2, y0 + 210
    if kind == "PUMP":
        for r, a in [(150, 50), (110, 90), (70, 180)]:
            d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=PINK, width=12)
        d.polygon([(cx, cy - 125), (cx + 58, cy - 28), (cx + 20, cy - 28), (cx + 82, cy + 110), (cx - 62, cy + 4), (cx - 15, cy + 4)], fill=YELLOW)
    else:
        for i in range(5):
            yy = cy + 112 - i * 46
            d.rounded_rectangle((cx - 125, yy, cx - 125 + (i + 1) * 49, yy + 28), 6, fill=CYAN)
        d.line((cx - 130, cy + 148, cx + 145, cy + 148), fill=(164, 120, 255), width=6)
    label_f = font(COURIER_BOLD, 39)
    bbox = d.textbbox((0, 0), f"THE {kind}", font=label_f)
    d.text((cx - (bbox[2] - bbox[0]) / 2, y1 - 92), f"THE {kind}", font=label_f, fill="white")


def render_arcade():
    folder = "pump-vs-progress"
    img = gradient((W, H), (31, 6, 71), (75, 13, 139)).convert("RGBA")
    d = ImageDraw.Draw(img)
    pixel_sparks(d, 4)
    d.text((67, 52), "PLAYER SELECT / BODY RECOMP", font=font(COURIER_BOLD, 21), fill=CYAN)
    d.text((67, 104), "CHOOSE YOUR", font=font(ARIAL_BOLD, 78), fill="white", stroke_width=3, stroke_fill=VIOLET)
    d.text((67, 182), "PLAYER", font=font(ARIAL_BOLD, 100), fill=YELLOW, stroke_width=4, stroke_fill=VIOLET)
    arcade_card(img, (55, 345, 520, 1110), "PUMP")
    arcade_card(img, (560, 345, 1025, 1110), "TREND")
    d.rounded_rectangle((340, 1170, 740, 1250), 12, fill=(12, 4, 34), outline=CYAN, width=4)
    d.text((422, 1192), "PRESS →", font=font(COURIER_BOLD, 31), fill="white")
    save(img, folder, 0)

    for number, kind in [(1, "PUMP"), (2, "TREND")]:
        img = gradient((W, H), (28, 4, 64), (84, 19, 142)).convert("RGBA")
        d = ImageDraw.Draw(img)
        pixel_sparks(d, 10 + number)
        d.text((65, 50), f"PLAYER 0{number}", font=font(COURIER_BOLD, 22), fill=CYAN if kind == "TREND" else PINK)
        d.text((65, 92), f"THE {kind}", font=font(ARIAL_BOLD, 103), fill="white", stroke_width=4, stroke_fill=VIOLET)
        arcade_card(img, (220, 250, 860, 880), kind)
        if kind == "PUMP":
            d.text((75, 940), "LOOKS INCREDIBLE", font=font(ARIAL_BOLD, 60), fill=YELLOW)
            d.text((75, 1004), "TONIGHT.", font=font(ARIAL_BOLD, 60), fill=YELLOW)
            d.text((75, 1095), "EXPIRES BY BREAKFAST.", font=font(COURIER_BOLD, 30), fill=PINK)
            d.rectangle((75, 1175, 1005, 1232), outline=(255, 255, 255), width=4)
            d.rectangle((82, 1182, 345, 1225), fill=PINK)
            d.text((75, 1260), "METER: RAPIDLY DRAINING", font=font(COURIER_BOLD, 20), fill=(191, 171, 230))
        else:
            d.text((75, 940), "LOOKS BORING", font=font(ARIAL_BOLD, 60), fill=CYAN)
            d.text((75, 1004), "TODAY.", font=font(ARIAL_BOLD, 60), fill=CYAN)
            d.text((75, 1095), "GETS OBVIOUS OVER MONTHS.", font=font(COURIER_BOLD, 27), fill=YELLOW)
            d.rectangle((75, 1175, 1005, 1232), outline=(255, 255, 255), width=4)
            d.rectangle((82, 1182, 870, 1225), fill=CYAN)
            d.text((75, 1260), "METER: QUIETLY COMPOUNDING", font=font(COURIER_BOLD, 20), fill=(191, 171, 230))
        save(img, folder, number)

    img = gradient((W, H), (28, 4, 64), (24, 97, 130)).convert("RGBA")
    d = ImageDraw.Draw(img)
    pixel_sparks(d, 19)
    d.text((65, 50), "TRAIN FOR BOTH.", font=font(ARIAL_BOLD, 67), fill="white")
    d.text((65, 119), "TRACK THE SECOND.", font=font(ARIAL_BOLD, 67), fill=YELLOW)
    screenshot = Image.open(PROJECT / "docs/app-screenshots/1.21/check-ins.png")
    shadow_card(img, (235, 285, 845, 1175), 60, (6, 8, 20, 255), shadow=(0, 0, 0, 130), blur=24)
    img.alpha_composite(contain_crop(screenshot, (260, 310, 820, 1150), crop=(0, 0, 1290, 1935), radius=40))
    d = ImageDraw.Draw(img)
    d.text((66, 1255), "GAINFRAME", font=font(COURIER_BOLD, 27), fill=CYAN)
    d.text((850, 1252), "P2", font=font(COURIER_BOLD, 27), fill=PINK)
    save(img, folder, 3)


CARE_NAVY = (21, 36, 72)
CARE_ORANGE = (248, 82, 28)
CARE_LIME = (210, 236, 21)
CARE_CREAM = (255, 246, 220)


def care_bg(name):
    return fit_crop(Image.open(ROOT / "gym-friend-care-package" / "_sources" / name)).convert("RGBA")


def care_label(d, box, kicker, headline, hsize=56, center=False):
    x0, y0, x1, y1 = box
    if kicker:
        d.text((x0, y0), kicker, font=font(COURIER_BOLD, 20), fill=CARE_ORANGE)
        y0 += 42
    draw_wrapped(d, (x0, y0), headline, font(GEORGIA_BOLD, hsize), CARE_NAVY, x1 - x0, spacing=3, align="center" if center else "left")


def render_care():
    folder = "gym-friend-care-package"
    img = care_bg("package-cover.png")
    d = ImageDraw.Draw(img)
    care_label(d, (230, 105, 850, 470), "FOR: YOUR GYM FRIEND", "A CARE PACKAGE FOR THE FRIEND WHO THINKS NOTHING CHANGED", 49, center=True)
    save(img, folder, 0)

    img = care_bg("crumpled-note.png")
    d = ImageDraw.Draw(img)
    care_label(d, (305, 330, 870, 800), "DON'T SEND:", "“JUST WORK HARDER.”", 68, center=True)
    save(img, folder, 1)

    img = care_bg("photo-envelope.png")
    d = ImageDraw.Draw(img)
    care_label(d, (70, 92, 760, 390), "SEND:", "THEIR OLDEST PHOTO.", 68)
    d.rounded_rectangle((135, 1120, 445, 1182), 6, fill=CARE_LIME)
    d.text((170, 1137), "OPEN FIRST", font=font(COURIER_BOLD, 28), fill=CARE_NAVY)
    save(img, folder, 2)

    img = care_bg("matching-frames.png")
    d = ImageDraw.Draw(img)
    care_label(d, (60, 72, 870, 300), "ADD:", "THE SAME POSE TODAY.", 64)
    save(img, folder, 3)

    img = care_bg("boring-wins.png")
    d = ImageDraw.Draw(img)
    care_label(d, (90, 105, 670, 440), "INCLUDE:", "THE BORING WINS.", 67)
    save(img, folder, 4)

    img = care_bg("timeline-insert.png")
    screenshot = Image.open(PROJECT / "docs/assets/tiktok-screenshots/deep-dive-compare-newui.png")
    img.alpha_composite(contain_crop(screenshot, (300, 350, 782, 1123), crop=(0, 0, 1290, 2070), radius=26))
    d = ImageDraw.Draw(img)
    care_label(d, (265, 96, 840, 285), "PACK:", "THE WHOLE TIMELINE.", 45, center=True)
    save(img, folder, 5)

    img = care_bg("closed-parcel.png")
    d = ImageDraw.Draw(img)
    care_label(d, (285, 390, 820, 980), "DELIVER WITH:", "“I SEE IT.”", 77, center=True)
    d.line((355, 650, 750, 650), fill=CARE_ORANGE, width=5)
    draw_wrapped(d, (305, 700), "SEND THIS TO YOUR GYM FRIEND.", font(COURIER_BOLD, 30), CARE_NAVY, 495, spacing=8, align="center")
    save(img, folder, 6)


if __name__ == "__main__":
    render_year()
    render_failed()
    render_chat()
    render_arcade()
    render_care()
    print("Rendered 19 slides.")
