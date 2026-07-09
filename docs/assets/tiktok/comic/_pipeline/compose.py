#!/usr/bin/env python3
"""
Deterministic text compositor for GainFrame TikTok carousels.

WHY THIS EXISTS: letting the image model render slide text causes font / size /
position drift between slides. Here the model only draws the mascot art on a
blank white canvas; ALL narrative text is drawn by Pillow with fixed fonts,
sizes, colours and positions so every slide in every post is pixel-consistent.

Public entry point:  compose(spec, art_path, out_path)
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
WHITE = (255, 255, 255)
NEAR_BLACK = (26, 26, 26)        # #1A1A1A
RED = (229, 57, 53)              # #E53935
CHARCOAL = (40, 40, 40)
PILL_BG = (60, 63, 68)           # dark gray pill
PILL_TXT = (255, 255, 255)

IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
ARIAL_BOLD = "/Users/michael.rode/Library/Fonts/Arial Bold.ttf"

# ---- shared geometry (identical across all posts) ----
SIDE_MARGIN = 70
MAX_TEXT_W = W - 2 * SIDE_MARGIN          # 940
TOP_ANCHOR = 124                          # y where text blocks start (clears page pill)
COVER_MAX_FONT = 150
COVER_MIN_FONT = 78
HEAD_MAX_FONT = 104
HEAD_MIN_FONT = 52
SUB_FONT = 40
SUB_GAP = 14                              # between the two sublines
HEAD_SUB_GAP = 46                         # between headline block and sublines
LINE_SPACING = 1.02


def _font(path, size):
    return ImageFont.truetype(path, size)


def _text_size(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


def _line_h(draw, font):
    # stable line height using cap-tall reference glyphs
    b = draw.textbbox((0, 0), "AQjgpy", font=font)
    return b[3] - b[1]


def _draw_page_pill(draw, page):
    if not page:
        return
    n, total = page
    label = f"{n}/{total}"
    font = _font(ARIAL_BOLD, 34)
    tw, th = _text_size(draw, label, font)
    pad_x, pad_y = 24, 14
    pw, ph = tw + 2 * pad_x, th + 2 * pad_y
    x1 = W - 34 - pw
    y1 = 34
    draw.rounded_rectangle([x1, y1, x1 + pw, y1 + ph], radius=ph // 2, fill=PILL_BG)
    # center label inside pill (account for bbox top offset)
    b = draw.textbbox((0, 0), label, font=font)
    draw.text((x1 + pad_x - b[0], y1 + pad_y - b[1]), label, font=font, fill=PILL_TXT)


def _draw_centered_line(draw, y, tokens, font):
    """tokens = list of (word, color). Draw one line centered at width W."""
    space_w = _text_size(draw, " ", font)[0]
    widths = [_text_size(draw, w, font)[0] for w, _ in tokens]
    total = sum(widths) + space_w * (len(tokens) - 1)
    x = (W - total) / 2
    top = TOP_ANCHOR  # unused; y passed in
    for (word, color), wdt in zip(tokens, widths):
        b = draw.textbbox((0, 0), word, font=font)
        draw.text((x - b[0], y - b[1]), word, font=font, fill=color)
        x += wdt + space_w


def _wrap_tokens(draw, tokens, font, max_w):
    """Greedy word-wrap a token list into lines that each fit max_w."""
    space_w = _text_size(draw, " ", font)[0]
    lines, cur, cur_w = [], [], 0
    for tok in tokens:
        ww = _text_size(draw, tok[0], font)[0]
        add = ww if not cur else ww + space_w
        if cur and cur_w + add > max_w:
            lines.append(cur)
            cur, cur_w = [tok], ww
        else:
            cur.append(tok)
            cur_w += add
    if cur:
        lines.append(cur)
    return lines


def _line_width(draw, line, font):
    space_w = _text_size(draw, " ", font)[0]
    return sum(_text_size(draw, w, font)[0] for w, _ in line) + space_w * (len(line) - 1)


def _fit_block(draw, tokens, font_path, max_font, min_font, max_lines):
    """Shrink font until the token block wraps within max_lines and max width."""
    for size in range(max_font, min_font - 1, -2):
        font = _font(font_path, size)
        lines = _wrap_tokens(draw, tokens, font, MAX_TEXT_W)
        if len(lines) <= max_lines and all(_line_width(draw, ln, font) <= MAX_TEXT_W for ln in lines):
            return font, lines, size
    font = _font(font_path, min_font)
    return font, _wrap_tokens(draw, tokens, font, MAX_TEXT_W), min_font


def _accent_tokens(headline, accent):
    """Split headline into (word,color) tokens, colouring the accent phrase red."""
    words = headline.split()
    acc = accent.split() if accent else []
    tokens, i = [], 0
    while i < len(words):
        if acc and words[i:i + len(acc)] == acc:
            for w in acc:
                tokens.append((w, RED))
            i += len(acc)
        else:
            tokens.append((words[i], NEAR_BLACK))
            i += 1
    return tokens


# ---------------- art placement (guarantees no text/art collision) ----------------

BOTTOM_MARGIN = 36
ART_TOP_PAD = 40


def _place_art(canvas, art_path, top_limit, max_upscale=1.6):
    """Crop model art to its non-white content and scale it into the band
    below top_limit, bottom-aligned. Text is drawn first, so art can never
    overlap it regardless of where the model placed the figure."""
    if not art_path:
        return
    art = Image.open(art_path).convert("RGB")
    gray = art.convert("L")
    mask = gray.point(lambda p: 255 if p < 248 else 0)
    bbox = mask.getbbox()
    if not bbox:
        return
    content = art.crop(bbox)
    cw, ch = content.size
    avail_h = (H - BOTTOM_MARGIN) - top_limit
    avail_w = W - 2 * 40
    if avail_h < 60:
        return
    scale = min(avail_w / cw, avail_h / ch, max_upscale)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    content = content.resize((nw, nh), Image.LANCZOS)
    x = (W - nw) // 2
    y = (H - BOTTOM_MARGIN) - nh
    canvas.paste(content, (x, y))


def _canvas():
    return Image.new("RGB", (W, H), WHITE)


def _render_cover(spec, art_path):
    img = _canvas()
    draw = ImageDraw.Draw(img)
    lines = spec["lines"]  # [[text,color], ...]
    color_map = {"black": NEAR_BLACK, "red": RED}
    for size in range(COVER_MAX_FONT, COVER_MIN_FONT - 1, -2):
        font = _font(IMPACT, size)
        if all(_text_size(draw, t, font)[0] <= MAX_TEXT_W for t, _ in lines):
            break
    lh = _line_h(draw, font)
    step = lh * LINE_SPACING
    y = TOP_ANCHOR
    for text, color in lines:
        b = draw.textbbox((0, 0), text, font=font)
        tw = b[2] - b[0]
        x = (W - tw) / 2
        draw.text((x - b[0], y - b[1]), text, font=font, fill=color_map[color])
        y += step
    _place_art(img, art_path, y + ART_TOP_PAD)
    _draw_page_pill(draw, spec.get("page"))
    return img


def _render_numbered(spec, art_path):
    img = _canvas()
    draw = ImageDraw.Draw(img)
    headline = f"{spec['number']}. {spec['headline']}"
    accent = spec.get("accent", "")
    tokens = _accent_tokens(headline, accent)
    font, lines, size = _fit_block(draw, tokens, IMPACT, HEAD_MAX_FONT, HEAD_MIN_FONT, 3)
    lh = _line_h(draw, font)
    step = lh * LINE_SPACING
    y = TOP_ANCHOR
    for ln in lines:
        _draw_centered_line(draw, y, ln, font)
        y += step
    y += HEAD_SUB_GAP - (step - lh)
    sub_font = _font(ARIAL_BOLD, SUB_FONT)
    sub_lh = _line_h(draw, sub_font)
    for key in ("sub1", "sub2"):
        txt = spec.get(key)
        if not txt:
            continue
        b = draw.textbbox((0, 0), txt, font=sub_font)
        tw = b[2] - b[0]
        sf = sub_font
        while tw > MAX_TEXT_W and sf.size > 26:
            sf = _font(ARIAL_BOLD, sf.size - 2)
            b = draw.textbbox((0, 0), txt, font=sf)
            tw = b[2] - b[0]
        x = (W - tw) / 2
        draw.text((x - b[0], y - b[1]), txt, font=sf, fill=CHARCOAL)
        y += sub_lh + SUB_GAP
    _place_art(img, art_path, y + ART_TOP_PAD)
    _draw_page_pill(draw, spec.get("page"))
    return img


def _render_plug(spec, art_path):
    img = _canvas()
    draw = ImageDraw.Draw(img)
    font = _font(ARIAL_BOLD, 58)
    y = 60
    for key in ("h1", "h2"):
        txt = spec.get(key)
        if not txt:
            continue
        b = draw.textbbox((0, 0), txt, font=font)
        tw = b[2] - b[0]
        x = (W - tw) / 2
        draw.text((x - b[0], y - b[1]), txt, font=font, fill=NEAR_BLACK)
        y += (b[3] - b[1]) + 18
    _place_art(img, art_path, y + ART_TOP_PAD)
    _draw_page_pill(draw, spec.get("page"))
    return img


def compose(spec, art_path, out_path):
    t = spec["type"]
    if t == "cover":
        img = _render_cover(spec, art_path)
    elif t == "numbered":
        img = _render_numbered(spec, art_path)
    elif t == "plug":
        img = _render_plug(spec, art_path)
    else:
        raise ValueError(f"unknown slide type {t}")
    img.save(out_path)
    return out_path


if __name__ == "__main__":
    # quick self-test with blank art
    import os
    os.makedirs("/tmp/compose-test", exist_ok=True)
    compose({"type": "cover", "page": [1, 5],
             "lines": [["MUSCLE TIPS", "black"], ["THAT SOUND", "black"], ["FAKE", "red"], ["BUT WORK", "black"]]},
            None, "/tmp/compose-test/cover.png")
    compose({"type": "numbered", "page": [2, 5], "number": 1,
             "headline": "TRAIN EACH MUSCLE TWICE A WEEK", "accent": "TWICE",
             "sub1": "FREQUENCY BEATS ONE BRUTAL SESSION", "sub2": "HIT IT, RECOVER, HIT IT AGAIN"},
            None, "/tmp/compose-test/num.png")
    print("self-test written to /tmp/compose-test/")
