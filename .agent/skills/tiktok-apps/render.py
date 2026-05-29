#!/usr/bin/env python3
"""Render an editorial "Top 5 apps" TikTok carousel from a fetched manifest.json.

Reads <post>/assets/manifest.json (produced by fetch_apps.py) and writes
1080x1350 PNG + WEBP slides into <post>/:

    slide-0-cover.png   headline + 5-app icon grid
    slide-1.png ...     one per app (detail layout w/ screenshots, or logo card)
    slide-N-outro.png   recap grid

Layout is fully deterministic (Pillow). Real logos, screenshots, ratings, and
copy are placed pixel-perfect; no AI generation in this format.

Usage:
    python3 render_editorial.py <post_dir>
"""
import argparse
import json
import math
import os
import re

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---- canvas + palette ------------------------------------------------------
W, H = 1080, 1350
PAD = 80
WHITE = (255, 255, 255)
INK = (23, 23, 23)
MUTED = (138, 143, 152)
FAINT = (232, 234, 238)
ACCENT = (52, 210, 111)        # GainFrame green #34d26f
ACCENT_SOFT = (232, 250, 239)  # light green chip bg
GOLD = (255, 183, 0)
STAR_EMPTY = (223, 226, 231)
ICON_BORDER = (220, 223, 228, 255)  # hairline so white icons don't vanish on white

FONT_DIR = "/System/Library/Fonts/Supplemental"
F_BLACK = os.path.join(FONT_DIR, "Arial Black.ttf")
F_BOLD = os.path.join(FONT_DIR, "Arial Bold.ttf")
F_REG = os.path.join(FONT_DIR, "Arial.ttf")


def font(path, size):
    return ImageFont.truetype(path, size)


# ---- text helpers ----------------------------------------------------------
def text_w(draw, s, f):
    return draw.textlength(s, font=f)


def wrap(draw, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if text_w(draw, t, f) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def human(n):
    n = int(n or 0)
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M".replace(".0M", "M")
    if n >= 1_000:
        return f"{n/1_000:.0f}K"
    return str(n)


# ---- shape helpers ---------------------------------------------------------
def rounded(im, radius):
    """Return im (RGBA) with rounded corners."""
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.size[0], im.size[1]], radius=radius, fill=255)
    im.putalpha(mask)
    return im


def paste_shadow(canvas, w, h, x, y, radius, blur=30, alpha=55, dy=16):
    """Draw a soft drop shadow for a rounded rect of size w×h at (x,y)."""
    pad = blur * 3
    sh = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad, pad, pad + w, pad + h], radius=radius, fill=(15, 23, 18, alpha)
    )
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(sh, (int(x - pad), int(y - pad + dy)))


def place_card(canvas, im, x, y, radius, shadow=True, border=None, border_w=2, **shkw):
    x, y = int(x), int(y)
    if shadow:
        paste_shadow(canvas, im.size[0], im.size[1], x, y, radius, **shkw)
    canvas.alpha_composite(rounded(im, radius), (x, y))
    if border:
        ImageDraw.Draw(canvas).rounded_rectangle(
            [x, y, x + im.size[0] - 1, y + im.size[1] - 1],
            radius=radius, outline=border, width=border_w)


def icon(logo_path, size):
    im = Image.open(logo_path).convert("RGB").resize((size, size), Image.LANCZOS)
    return rounded(im, int(size * 0.2237))  # iOS-ish squircle radius


def star_strip(rating, star_r=15, gap=7):
    """RGBA strip of 5 stars with accurate partial fill for `rating`/5."""
    n = 5
    cell = star_r * 2 + gap
    w, h = cell * n, star_r * 2 + 4
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    for i in range(n):
        cx = i * cell + star_r + gap // 2
        cy = h // 2
        pts = []
        for k in range(10):
            r = star_r if k % 2 == 0 else star_r * 0.42
            a = -math.pi / 2 + k * math.pi / n
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        md.polygon(pts, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    empty = Image.new("RGBA", (w, h), STAR_EMPTY + (255,))
    gold = Image.new("RGBA", (w, h), GOLD + (255,))
    out.paste(empty, (0, 0), mask)
    fill_w = int(w * max(0, min(1, rating / 5.0)))
    fmask = mask.copy()
    fm = ImageDraw.Draw(fmask)
    fm.rectangle([fill_w, 0, w, h], fill=0)  # clip gold to fraction
    out.paste(gold, (0, 0), fmask)
    return out


def fit_to_height(path, target_h):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    nw = max(1, round(w * target_h / h))
    return im.resize((nw, target_h), Image.LANCZOS)


def crop_to_aspect(path, target_aspect):
    """Return the image cropped to exactly target_aspect (w/h) with no distortion.

    Phone screenshots are ~0.46 w/h — far taller than the ~0.64 card we want.
    Showing the whole phone forces it narrow (two side-by-side = ~340px wide,
    a 3.8x downscale that turns in-app text to mush). Cropping to the
    content-rich top instead yields a wider card (~440px) at a gentler
    downscale, so the score / charts / photos stay legible.
    """
    im = Image.open(path).convert("RGB")
    w, h = im.size
    if w / h > target_aspect:        # too wide: trim the sides
        nw = int(round(h * target_aspect))
        x0 = (w - nw) // 2
        return im.crop((x0, 0, x0 + nw, h))
    nh = int(round(w / target_aspect))  # too tall (phones): keep the top
    return im.crop((0, 0, w, nh))


# ---- reusable slide pieces -------------------------------------------------
def new_canvas():
    return Image.new("RGBA", (W, H), WHITE + (255,))


def draw_kicker(d, label, y=92):
    f = font(F_BOLD, 26)
    txt = " ".join(label.upper())  # faux letter-spacing
    w = text_w(d, txt, f)
    x = (W - w) / 2
    d.rounded_rectangle([x - 26, y - 12, x + w + 26, y + 40], radius=26, fill=ACCENT)
    d.text((x, y), txt, font=f, fill=WHITE)


def draw_app_header(canvas, d, app, top):
    """icon + name + tagline + rating row. Returns y below the header."""
    ic = 116
    place_card(canvas, Image.open(app["logo"]).convert("RGB").resize((ic, ic)), PAD, top,
               int(ic * 0.2237), blur=20, alpha=45, dy=8, border=ICON_BORDER)
    tx = PAD + ic + 28
    name = app["short_name"]
    nf = font(F_BLACK, 50)
    # shrink name if too wide
    while text_w(d, name, nf) > W - tx - PAD and nf.size > 32:
        nf = font(F_BLACK, nf.size - 2)
    d.text((tx, top - 4), name, font=nf, fill=INK)
    ty = top - 4 + nf.size + 8
    tagf = font(F_REG, 29)
    for ln in wrap(d, app.get("tagline", ""), tagf, W - tx - PAD)[:1]:
        d.text((tx, ty), ln, font=tagf, fill=MUTED)
        ty += 36
    # rating
    strip = star_strip(app.get("rating", 0))
    canvas.alpha_composite(strip, (tx, ty + 2))
    rf = font(F_BOLD, 26)
    rtxt = f"  {app.get('rating', 0):.1f}  ·  {human(app.get('rating_count', 0))} ratings"
    d.text((tx + strip.size[0], ty + 1), rtxt, font=rf, fill=INK)
    return top + ic + 18


def draw_callout_chips(canvas, d, callouts, y, max_w, big=False):
    """Flowing row of green check chips; wraps. Returns y below."""
    fz = 30 if big else 27
    f = font(F_BOLD, fz)
    pad_x, gap, ch = (24, 16, fz + 26)
    x = PAD
    line_y = y
    for c in callouts:
        cw = text_w(d, c, f) + pad_x * 2 + 30
        if x + cw > PAD + max_w and x > PAD:
            x = PAD
            line_y += ch + 14
        d.rounded_rectangle([x, line_y, x + cw, line_y + ch], radius=ch // 2, fill=ACCENT_SOFT)
        # check mark
        cy = line_y + ch / 2
        d.line([(x + 18, cy), (x + 26, cy + 8), (x + 40, cy - 10)], fill=ACCENT, width=4, joint="curve")
        d.text((x + 50, line_y + (ch - fz) / 2 - 2), c, font=f, fill=(18, 120, 70))
        x += cw + gap
    return line_y + ch


def draw_counter(d, idx, total):
    f = font(F_BLACK, 30)
    s_idx, s_rest = f"{idx:02d}", f" / {total:02d}"
    rw = text_w(d, s_rest, f)
    iw = text_w(d, s_idx, f)
    x = W - PAD - rw - iw
    y = H - 64
    d.text((x, y), s_idx, font=f, fill=ACCENT)
    d.text((x + iw, y), s_rest, font=f, fill=MUTED)


# ---- slides ----------------------------------------------------------------
def render_cover(m, out, swipe="swipe to see all 5  →"):
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cov = m.get("cover", {})
    draw_kicker(d, cov.get("kicker", m["apps"][0].get("genre", "Fitness")))

    title = cov.get("title", "")
    accent = (cov.get("accent_word") or "").lower().strip(".,!?")
    hf = font(F_BLACK, 92)
    max_w = W - PAD * 2
    # wrap title words, color accent word
    words = title.split()
    lines, cur = [], []
    for w in words:
        trial = " ".join(cur + [w])
        if text_w(d, trial, hf) <= max_w or not cur:
            cur.append(w)
        else:
            lines.append(cur)
            cur = [w]
    if cur:
        lines.append(cur)
    y = 230
    lh = 100
    for line in lines:
        lw = text_w(d, " ".join(line), hf)
        x = (W - lw) / 2
        for w in line:
            col = ACCENT if w.lower().strip(".,!?") == accent else INK
            d.text((x, y), w, font=hf, fill=col)
            x += text_w(d, w + " ", hf)
        y += lh
    # gap below title measured from the last line's real ink bottom, so a
    # descender-heavy last line (e.g. "Apps, Ranked") never collides with the
    # subtitle while a flat one (e.g. "Needs") doesn't leave a huge gap
    last_str = " ".join(lines[-1]) if lines else ""
    y = (y - lh) + d.textbbox((0, 0), last_str, font=hf)[3] + 40
    sf = font(F_REG, 36)
    for ln in wrap(d, cov.get("subtitle", ""), sf, max_w):
        lw = text_w(d, ln, sf)
        d.text(((W - lw) / 2, y), ln, font=sf, fill=MUTED)
        y += 46

    # icon grid (single centered row of 5)
    apps = m["apps"]
    n = len(apps)
    isz = 150
    gap = 28
    row_w = n * isz + (n - 1) * gap
    gx = (W - row_w) / 2
    gy = 812
    nf = font(F_BOLD, 24)
    for i, app in enumerate(apps):
        x = int(gx + i * (isz + gap))
        place_card(c, Image.open(app["logo"]).convert("RGB").resize((isz, isz)), x, gy,
                   int(isz * 0.2237), blur=22, alpha=50, dy=10, border=ICON_BORDER)
        nm = app["short_name"]
        while text_w(d, nm, nf) > isz + gap - 6 and nf.size > 16:
            nf = font(F_BOLD, nf.size - 1)
        nm_disp = nm if text_w(d, nm, nf) <= isz + gap else nm[:9] + "…"
        lw = text_w(d, nm_disp, nf)
        d.text((x + (isz - lw) / 2, gy + isz + 14), nm_disp, font=nf, fill=INK)
        nf = font(F_BOLD, 24)

    sw = font(F_BOLD, 30)
    d.text(((W - text_w(d, swipe, sw)) / 2, H - 96), swipe, font=sw, fill=ACCENT)
    save(c, out)


def render_detail(app, idx, total, out):
    c = new_canvas()
    d = ImageDraw.Draw(c)
    y = draw_app_header(c, d, app, PAD + 12)

    shots = app.get("screenshots", [])[:2]
    n = len(shots)
    gap = 36
    card_aspect = 0.66           # cropped-phone card (w/h); see crop_to_aspect
    max_card_h = 690             # cap height so callouts + description fit below
    # widest each card can be so n fit the content row, capped by height
    card_w = int((W - PAD * 2 - gap * (n - 1)) / n) if n else 0
    card_w = min(card_w, int(max_card_h * card_aspect))
    cards = [
        crop_to_aspect(s, card_aspect).resize(
            (card_w, int(card_w / card_aspect)), Image.LANCZOS)
        for s in shots
    ]
    card_h = cards[0].size[1] if cards else 0

    zone_top = y + 30
    total_w = card_w * n + gap * (n - 1)
    x = int((W - total_w) / 2)
    for im in cards:
        place_card(c, im, x, zone_top, 28, blur=34, alpha=55, dy=16)
        x += card_w + gap

    # callouts row
    cy = zone_top + card_h + 36
    cy = draw_callout_chips(c, d, app.get("callouts", [])[:3], cy, W - PAD * 2)

    # description
    df = font(F_REG, 30)
    dy = cy + 22
    for ln in wrap(d, app.get("description", ""), df, W - PAD * 2)[:3]:
        d.text((PAD, dy), ln, font=df, fill=(70, 74, 82))
        dy += 40

    draw_counter(d, idx, total)
    save(c, out)


def render_card(app, idx, total, out):
    """Logo-centric layout for apps with no screenshots."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    y = draw_app_header(c, d, app, PAD + 12)

    # big logo on a soft tinted panel
    panel_top = y + 30
    panel_h = 470
    d.rounded_rectangle([PAD, panel_top, W - PAD, panel_top + panel_h], radius=40, fill=(247, 249, 248))
    big = 300
    place_card(c, Image.open(app["logo"]).convert("RGB").resize((big, big)),
               int((W - big) / 2), panel_top + int((panel_h - big) / 2) - 20,
               int(big * 0.2237), blur=34, alpha=55, dy=16, border=ICON_BORDER)
    gf = font(F_REG, 28)
    glabel = app.get("genre", "")
    d.text(((W - text_w(d, glabel, gf)) / 2, panel_top + panel_h - 70), glabel, font=gf, fill=MUTED)

    # callouts as big stacked check rows
    cy = panel_top + panel_h + 40
    f = font(F_BOLD, 34)
    for c_txt in app.get("callouts", [])[:3]:
        midy = cy + 20
        d.ellipse([PAD, cy, PAD + 40, cy + 40], fill=ACCENT_SOFT)
        d.line([(PAD + 11, midy), (PAD + 18, midy + 8), (PAD + 30, midy - 9)], fill=ACCENT, width=4, joint="curve")
        d.text((PAD + 60, cy), c_txt, font=f, fill=INK)
        cy += 58

    df = font(F_REG, 30)
    dy = cy + 16
    for ln in wrap(d, app.get("description", ""), df, W - PAD * 2)[:3]:
        d.text((PAD, dy), ln, font=df, fill=(70, 74, 82))
        dy += 40

    draw_counter(d, idx, total)
    save(c, out)


def _check_rows(d, items, x, y, max_w, mark, mark_col, chip_col, text_col, fz=31, row_h=64):
    """Stacked rows with a ✓ or ✕ mark. Returns y below."""
    f = font(F_BOLD, fz)
    for it in items:
        midy = y + 21
        d.ellipse([x, y, x + 42, y + 42], fill=chip_col)
        if mark == "check":
            d.line([(x + 12, midy), (x + 19, midy + 9), (x + 32, midy - 10)],
                   fill=mark_col, width=4, joint="curve")
        else:  # cross
            d.line([(x + 13, midy - 8), (x + 29, midy + 8)], fill=mark_col, width=4)
            d.line([(x + 29, midy - 8), (x + 13, midy + 8)], fill=mark_col, width=4)
        lines = wrap(d, it, f, max_w - 58)[:2]
        ty = y + (42 - len(lines) * fz) / 2 - 2
        for ln in lines:
            d.text((x + 58, ty), ln, font=f, fill=text_col)
            ty += fz + 4
        y += row_h + (len(lines) - 1) * (fz + 4)
    return y


def render_ranked_app(app, position, total, out):
    """One ranked slide (white, on-brand): big rank numeral, header,
    hero screenshot-or-logo on the left, pros ✓ / cons ✕ on the right."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    rank = app.get("rank", position)

    # header: giant accent rank numeral + icon + name + rating
    top = PAD + 6
    rf = font(F_BLACK, 132)
    rnum = str(rank)
    d.text((PAD, top - 18), rnum, font=rf, fill=ACCENT)
    rw = text_w(d, rnum, rf)
    ix = int(PAD + rw + 34)
    ic = 96
    place_card(c, Image.open(app["logo"]).convert("RGB").resize((ic, ic)), ix, top + 6,
               int(ic * 0.2237), blur=18, alpha=45, dy=6, border=ICON_BORDER)
    tx = ix + ic + 24
    name = app["short_name"]
    nf = font(F_BLACK, 50)
    while text_w(d, name, nf) > W - tx - PAD and nf.size > 30:
        nf = font(F_BLACK, nf.size - 2)
    d.text((tx, top + 2), name, font=nf, fill=INK)
    strip = star_strip(app.get("rating", 0))
    c.alpha_composite(strip, (int(tx), int(top + nf.size + 12)))
    d.text((tx + strip.size[0], top + nf.size + 11),
           f"  {app.get('rating', 0):.1f}  ·  {human(app.get('rating_count', 0))}",
           font=font(F_BOLD, 25), fill=INK)

    # body: left visual column + right pros/cons column
    body_top = top + 156
    body_bot = H - 220
    left_w = 412
    shots = app.get("screenshots", [])
    if shots:
        im = fit_to_height(shots[0], body_bot - body_top)
        if im.size[0] > left_w:
            im = im.resize((left_w, int(im.size[1] * left_w / im.size[0])), Image.LANCZOS)
        place_card(c, im, PAD, body_top, 30, blur=34, alpha=60, dy=18)
    else:
        d.rounded_rectangle([PAD, body_top, PAD + left_w, body_bot], radius=36, fill=(247, 249, 248))
        big = 250
        place_card(c, Image.open(app["logo"]).convert("RGB").resize((big, big)),
                   PAD + (left_w - big) // 2, body_top + (body_bot - body_top - big) // 2,
                   int(big * 0.2237), blur=30, alpha=50, dy=14, border=ICON_BORDER)

    rx = PAD + left_w + 44
    rmax = W - PAD - rx
    ry = body_top + 4
    tagf = font(F_REG, 30)
    for ln in wrap(d, app.get("tagline", ""), tagf, rmax)[:2]:
        d.text((rx, ry), ln, font=tagf, fill=MUTED)
        ry += 38
    ry += 14
    pros = app.get("callouts", [])[:3]
    cons = app.get("cons", [])[:2]
    if pros:
        d.text((rx, ry), "PROS", font=font(F_BLACK, 26), fill=ACCENT)
        ry = _check_rows(d, pros, rx, ry + 40, rmax, "check", ACCENT, ACCENT_SOFT, INK)
    if cons:
        ry += 14
        d.text((rx, ry), "CONS", font=font(F_BLACK, 26), fill=MUTED)
        ry = _check_rows(d, cons, rx, ry + 40, rmax, "cross", (180, 70, 70), (245, 232, 232), (90, 94, 102))

    # description across the bottom
    df = font(F_REG, 29)
    dy = body_bot + 22
    for ln in wrap(d, app.get("description", ""), df, W - PAD * 2)[:2]:
        d.text((PAD, dy), ln, font=df, fill=(70, 74, 82))
        dy += 38

    draw_counter(d, position, total)
    save(c, out)


def render_outro(m, out, hero="GainFrame"):
    c = new_canvas()
    d = ImageDraw.Draw(c)
    draw_kicker(d, "Your 2026 stack")
    hf = font(F_BLACK, 84)
    lines = ["Build your", "fitness stack."]
    y = 220
    for ln in lines:
        d.text(((W - text_w(d, ln, hf)) / 2, y), ln, font=hf, fill=INK)
        y += 92

    apps = m["apps"]
    n = len(apps)
    isz = 156
    gap = 30
    row_w = n * isz + (n - 1) * gap
    gx = (W - row_w) / 2
    gy = 560
    nf = font(F_BOLD, 24)
    for i, app in enumerate(apps):
        x = int(gx + i * (isz + gap))
        is_hero = app["short_name"].lower() == hero.lower()
        if is_hero:
            d.rounded_rectangle([x - 12, gy - 12, x + isz + 12, gy + isz + 12],
                                radius=int(isz * 0.2237) + 12, outline=ACCENT, width=7)
        place_card(c, Image.open(app["logo"]).convert("RGB").resize((isz, isz)), x, gy,
                   int(isz * 0.2237), blur=22, alpha=50, dy=10, border=ICON_BORDER)
        nm = app["short_name"]
        while text_w(d, nm, nf) > isz + gap and nf.size > 16:
            nf = font(F_BOLD, nf.size - 1)
        nm_disp = nm if text_w(d, nm, nf) <= isz + gap else nm[:9] + "…"
        d.text((x + (isz - text_w(d, nm_disp, nf)) / 2, gy + isz + 16), nm_disp,
               font=nf, fill=ACCENT if is_hero else INK)
        nf = font(F_BOLD, 24)

    # hero nudge line
    hero_app = next((a for a in apps if a["short_name"].lower() == hero.lower()), None)
    if hero_app:
        tf = font(F_BOLD, 38)
        tip = f"Start with the one that proves it's working."
        for ln in wrap(d, tip, tf, W - PAD * 2):
            d.text(((W - text_w(d, ln, tf)) / 2, gy + isz + 90), ln, font=tf, fill=INK)
        sf = font(F_REG, 32)
        sub = f"{hero_app['short_name']} — {hero_app.get('tagline','')}"
        d.text(((W - text_w(d, sub, sf)) / 2, gy + isz + 150), sub, font=sf, fill=MUTED)
    save(c, out)


# ---- io --------------------------------------------------------------------
def save(canvas, path):
    rgb = Image.new("RGB", canvas.size, WHITE)
    rgb.paste(canvas, mask=canvas.split()[3])
    rgb.save(path, "PNG")
    rgb.save(path[:-4] + ".webp", "WEBP", quality=90, method=6)
    print(f"  ✓ {os.path.basename(path)}")


def write_content(m, post):
    """Emit content.md (caption + hashtags) next to the slides, matching the
    comic skill's convention so the iCloud sync step has copy ready to paste."""
    cap = (m.get("caption") or "").strip()
    tags = " ".join(f"#{t.lstrip('#')}" for t in m.get("hashtags", []))
    body = cap + (("\n\n" + tags) if tags else "") + "\n"
    with open(os.path.join(post, "content.md"), "w") as f:
        f.write(body)
    print("  ✓ content.md")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("post_dir")
    args = ap.parse_args()
    post = os.path.abspath(args.post_dir)
    m = json.load(open(os.path.join(post, "assets", "manifest.json")))
    apps = m["apps"]
    total = len(apps)
    fmt = m.get("format", "editorial")

    print(f"Rendering {fmt} carousel: {m['slug']}")
    if fmt == "ranked":
        # countdown: highest rank number first, ending on #1
        ordered = sorted(apps, key=lambda a: -(a.get("rank") or 0))
        render_cover(m, os.path.join(post, "slide-0-cover.png"),
                     swipe="counting down to #1  →")
        for i, app in enumerate(ordered, start=1):
            render_ranked_app(app, i, total, os.path.join(post, f"slide-{i}.png"))
    else:
        render_cover(m, os.path.join(post, "slide-0-cover.png"))
        for i, app in enumerate(apps, start=1):
            if app.get("screenshots"):
                render_detail(app, i, total, os.path.join(post, f"slide-{i}.png"))
            else:
                render_card(app, i, total, os.path.join(post, f"slide-{i}.png"))
    render_outro(m, os.path.join(post, f"slide-{total+1}-outro.png"))
    write_content(m, post)
    print(f"✅ {total + 2} slides + content.md written to {post}")


if __name__ == "__main__":
    main()
