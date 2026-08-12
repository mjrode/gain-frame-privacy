#!/usr/bin/env python3
"""
Deterministic text compositor for GainFrame TikTok carousels.

WHY THIS EXISTS: letting the image model render slide text causes font / size /
position drift between slides. Here the model only draws the mascot art on a
blank white canvas; ALL narrative text is drawn by Pillow with fixed fonts,
sizes, colours and positions so every slide in every post is pixel-consistent.

Public entry point:  compose(spec, art_path, out_path)
"""
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
WHITE = (255, 255, 255)
NEAR_BLACK = (26, 26, 26)        # #1A1A1A
RED = (229, 57, 53)              # #E53935
CHARCOAL = (40, 40, 40)
PILL_BG = (60, 63, 68)           # dark gray pill
PILL_TXT = (255, 255, 255)

def _first_font(env_var, candidates):
    # Env override first, then the first candidate present on this machine.
    # Keeps the exact macOS fonts on the primary machine while letting the
    # pipeline run on Linux/cloud boxes with metrically-similar substitutes.
    override = os.environ.get(env_var)
    if override:
        return override
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        f"No font found for {env_var}; tried: {candidates}. "
        f"Set ${env_var} to a .ttf path."
    )


IMPACT = _first_font("GF_IMPACT_FONT", [
    "/System/Library/Fonts/Supplemental/Impact.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Impact.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
])
ARIAL_BOLD = _first_font("GF_BODY_FONT", [
    os.path.expanduser("~/Library/Fonts/Arial Bold.ttf"),
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
])

# ---- shared geometry (identical across all posts) ----
SIDE_MARGIN = 70
MAX_TEXT_W = W - 2 * SIDE_MARGIN          # 940
TOP_ANCHOR = 124                          # y where text blocks start (clears page pill)

# TikTok center-crops the 4:5 slide to a square for the profile-grid thumbnail,
# so only y 135..1215 survives there. Covers are the thumbnail — their title AND
# the mascot must both live inside that band or the grid shows a clipped title
# and cropped-off feet. Numbered slides are only ever seen full-frame in the
# swipe feed, so they keep the taller layout.
GRID_SAFE_TOP = (H - W) // 2              # 135
GRID_SAFE_BOTTOM = H - (H - W) // 2       # 1215
COVER_TOP_ANCHOR = GRID_SAFE_TOP + 78     # 213
COVER_ART_BOTTOM = GRID_SAFE_BOTTOM - 20  # 1195

COVER_MAX_FONT = 164
COVER_MIN_FONT = 84
COVER_LINE_SPACING = 0.98                 # tighter than body copy — title reads as one slab
# red knockout block padding around an accent line
KNOCKOUT_PAD_X = 26
KNOCKOUT_PAD_TOP = 14
KNOCKOUT_PAD_BOTTOM = 20
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


def _draw_page_pill(draw, page, y_top=34):
    if not page:
        return
    n, total = page
    label = f"{n}/{total}"
    font = _font(ARIAL_BOLD, 34)
    tw, th = _text_size(draw, label, font)
    pad_x, pad_y = 24, 14
    pw, ph = tw + 2 * pad_x, th + 2 * pad_y
    x1 = W - 34 - pw
    y1 = y_top
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


def _place_art(canvas, art_path, top_limit, max_upscale=1.6, bottom_limit=None,
               valign="bottom"):
    """Crop model art to its non-white content and scale it into the band
    between top_limit and bottom_limit. Text is drawn first, so art can never
    overlap it regardless of where the model placed the figure.

    valign="bottom" stands the mascot on the bottom margin, which is what a
    figure with feet should do. valign="center" is for wide art that ends up
    width-constrained — a bottom-aligned phone mock leaves a dead white void
    between the headline and the art.
    """
    if not art_path:
        return
    if bottom_limit is None:
        bottom_limit = H - BOTTOM_MARGIN
    art = Image.open(art_path).convert("RGB")
    gray = art.convert("L")
    mask = gray.point(lambda p: 255 if p < 248 else 0)
    bbox = mask.getbbox()
    if not bbox:
        return
    content = art.crop(bbox)
    cw, ch = content.size
    avail_h = bottom_limit - top_limit
    avail_w = W - 2 * 40
    if avail_h < 60:
        return
    scale = min(avail_w / cw, avail_h / ch, max_upscale)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    content = content.resize((nw, nh), Image.LANCZOS)
    x = (W - nw) // 2
    if valign == "center":
        y = top_limit + (avail_h - nh) // 2
    else:
        y = bottom_limit - nh
    canvas.paste(content, (x, y))


def _canvas():
    return Image.new("RGB", (W, H), WHITE)


def _render_cover(spec, art_path):
    """Cover = the profile-grid thumbnail, so it gets the loud treatment: every
    "red" line is reversed out white on a solid red knockout block instead of
    being set in red type. In a grid of white thumbnails the red block is the
    thing the eye lands on. Whole layout stays inside the grid-safe square."""
    img = _canvas()
    draw = ImageDraw.Draw(img)
    lines = spec["lines"]  # [[text,color], ...]
    # knockout blocks add horizontal bulk, so fit against a slightly wider box
    fit_w = W - 2 * 50 - 2 * KNOCKOUT_PAD_X
    for size in range(COVER_MAX_FONT, COVER_MIN_FONT - 1, -2):
        font = _font(IMPACT, size)
        if all(_text_size(draw, t, font)[0] <= fit_w for t, _ in lines):
            break
    lh = _line_h(draw, font)
    step = lh * COVER_LINE_SPACING
    y = COVER_TOP_ANCHOR
    for text, color in lines:
        b = draw.textbbox((0, 0), text, font=font)
        tw = b[2] - b[0]
        x = (W - tw) / 2
        if color == "red":
            draw.rectangle(
                [x - KNOCKOUT_PAD_X, y - KNOCKOUT_PAD_TOP,
                 x + tw + KNOCKOUT_PAD_X, y + lh + KNOCKOUT_PAD_BOTTOM],
                fill=RED,
            )
            draw.text((x - b[0], y - b[1]), text, font=font, fill=WHITE)
        else:
            draw.text((x - b[0], y - b[1]), text, font=font, fill=NEAR_BLACK)
        y += step
    _place_art(img, art_path, y + 44, max_upscale=2.2,
               bottom_limit=COVER_ART_BOTTOM)
    _draw_page_pill(draw, spec.get("page"), y_top=GRID_SAFE_TOP + 10)
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
    y = 130          # sits closer to the art than the old y=60
    for key in ("h1", "h2"):
        txt = spec.get(key)
        if not txt:
            continue
        b = draw.textbbox((0, 0), txt, font=font)
        tw = b[2] - b[0]
        x = (W - tw) / 2
        draw.text((x - b[0], y - b[1]), txt, font=font, fill=NEAR_BLACK)
        y += (b[3] - b[1]) + 18
    # phone-and-logo art is wide, so it scales to width and leaves vertical
    # slack — centre it rather than parking it on the bottom margin
    _place_art(img, art_path, y + 12, max_upscale=1.9, valign="center")
    _draw_page_pill(draw, spec.get("page"))
    return img


def _draw_micro_heading(draw, text, y, accent=""):
    tokens = _accent_tokens(text, accent)
    font, lines, _ = _fit_block(draw, tokens, IMPACT, 78, 58, 2)
    lh = _line_h(draw, font)
    for line in lines:
        _draw_centered_line(draw, y, line, font)
        y += lh * 1.01
    return y


def _draw_micro_label(draw, text, center_x, y):
    max_w = 286
    words = text.split()
    for size in range(32, 23, -2):
        font = _font(ARIAL_BOLD, size)
        lines = []
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if current and _text_size(draw, candidate, font)[0] > max_w:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)
        if len(lines) <= 2:
            break
    line_h = _line_h(draw, font)
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        width = bbox[2] - bbox[0]
        draw.text((center_x - width / 2 - bbox[0], y - bbox[1]),
                  line, font=font, fill=NEAR_BLACK)
        y += line_h + 5


def _render_micro(spec, art_path):
    """Two-row myth-vs-reality infographic matching the supplied TikTok ref.

    Gemini draws the six isolated vignettes in fixed art bands. We clear every
    typography band before compositing so a slightly misplaced prop can never
    collide with the deterministic headings or labels.
    """
    img = _canvas()
    if art_path:
        art = Image.open(art_path).convert("RGB")
        source_w, source_h = art.size
        ink = art.convert("L").point(lambda pixel: 255 if pixel < 248 else 0)

        def empty_run(values, start, end, threshold=3):
            """Return the widest nearly-empty run inside an expected gap."""
            best = None
            run_start = None
            for position in range(start, end):
                if values[position] <= threshold:
                    if run_start is None:
                        run_start = position
                elif run_start is not None:
                    candidate = (run_start, position)
                    if best is None or candidate[1] - candidate[0] > best[1] - best[0]:
                        best = candidate
                    run_start = None
            if run_start is not None:
                candidate = (run_start, end)
                if best is None or candidate[1] - candidate[0] > best[1] - best[0]:
                    best = candidate
            if best:
                return best
            minimum = min(range(start, end), key=lambda position: values[position])
            return minimum, minimum + 1

        # Find the real whitespace divider instead of assuming both model rows
        # occupy identical fractions. Some scenes (notably calves) start the
        # lower mascot much higher than others.
        row_density = list(ink.resize((1, source_h), Image.Resampling.BOX).getdata())
        row_gap = empty_run(row_density, int(source_h * 0.27), int(source_h * 0.64))
        source_rows = (
            (int(source_h * 0.08), row_gap[0]),
            (row_gap[1], int(source_h * 0.95)),
        )
        # Gemini supplies one clean 3x2 art board. Extract each third separately,
        # trim its white space, and fit the entire vignette into a known-safe cell.
        # This avoids the old white-band approach, which visibly chopped benches,
        # arrows, machines and mascot feet whenever an illustration ran tall.
        target_rows = ((292, 505), (824, 1080))
        target_centers = (180, 540, 900)
        for row, ((source_top, source_bottom), (target_top, target_bottom)) in enumerate(
                zip(source_rows, target_rows)):
            # Locate each row's two actual vertical whitespace gutters. This
            # keeps a wide mascot foot or barbell plate out of its neighbor.
            column_density = list(
                ink.crop((0, source_top, source_w, source_bottom))
                .resize((source_w, 1), Image.Resampling.BOX)
                .getdata()
            )
            first_gap = empty_run(column_density, int(source_w * 0.24), int(source_w * 0.43))
            second_gap = empty_run(column_density, int(source_w * 0.57), int(source_w * 0.76))
            first_split = (first_gap[0] + first_gap[1]) // 2
            second_split = (second_gap[0] + second_gap[1]) // 2
            source_columns = ((0, first_split), (first_split, second_split), (second_split, source_w))
            for (source_left, source_right), center_x in zip(source_columns, target_centers):
                cell = art.crop((source_left, source_top, source_right, source_bottom))
                mask = cell.convert("L").point(lambda pixel: 255 if pixel < 248 else 0)
                bbox = mask.getbbox()
                if not bbox:
                    continue
                content = cell.crop(bbox)
                content_w, content_h = content.size
                max_w = 320 if row else 300
                max_h = target_bottom - target_top
                scale = min(max_w / content_w, max_h / content_h)
                output_w = max(1, int(content_w * scale))
                output_h = max(1, int(content_h * scale))
                content = content.resize((output_w, output_h), Image.LANCZOS)
                x = int(center_x - output_w / 2)
                y = target_top + (max_h - output_h) // 2
                img.paste(content, (x, y))
    draw = ImageDraw.Draw(img)

    _draw_micro_heading(draw, spec["think_title"], 116)
    for x, label in zip((180, 540, 900), spec["think_labels"]):
        _draw_micro_label(draw, label, x, 530)

    _draw_micro_heading(draw, spec["actual_title"], 650, accent="ACTUALLY")
    for x, label in zip((180, 540, 900), spec["actual_labels"]):
        _draw_micro_label(draw, label, x, 1112)

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
    elif t == "micro":
        img = _render_micro(spec, art_path)
    else:
        raise ValueError(f"unknown slide type {t}")
    img.save(out_path)
    return out_path


if __name__ == "__main__":
    # quick self-test with blank art
    import os
    os.makedirs("/tmp/compose-test", exist_ok=True)
    compose({"type": "cover", "page": [1, 5],
             "lines": [["IS STRETCHING A", "black"], ["WASTE OF TIME?", "red"]]},
            None, "/tmp/compose-test/cover.png")
    compose({"type": "numbered", "page": [2, 5], "number": 1,
             "headline": "TRAIN EACH MUSCLE TWICE A WEEK", "accent": "TWICE",
             "sub1": "FREQUENCY BEATS ONE BRUTAL SESSION", "sub2": "HIT IT, RECOVER, HIT IT AGAIN"},
            None, "/tmp/compose-test/num.png")
    print("self-test written to /tmp/compose-test/")
