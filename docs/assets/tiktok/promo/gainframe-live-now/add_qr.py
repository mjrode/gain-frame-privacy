#!/usr/bin/env python3
"""Composite a real, scannable QR code (App Store link) onto promo images.

Usage: python3 add_qr.py
Writes iteration-6-qr.png and iteration-8-qr.png next to this script.
The QR encodes the GainFrame App Store URL with high error correction.
"""
import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
URL = "https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082"
FONT_BLACK = os.path.join(HERE, "..", "..", "..", "gainframe-guy", "illustrations", "fonts", "Roboto-Black.ttf")


def make_qr(px):
    """Return an RGBA QR image roughly px wide, black-on-white, high ECC."""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=(17, 17, 17), back_color="white").convert("RGBA")
    return img.resize((px, px), Image.NEAREST)


def rounded_card(w, h, radius, fill=(255, 255, 255, 255)):
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=fill)
    return card


def font(size):
    try:
        return ImageFont.truetype(FONT_BLACK, size)
    except OSError:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)


def qr_card(qr_px, label, label_size, pad=28, gap=16):
    """White rounded card containing the QR + a centered label below it."""
    qr = make_qr(qr_px)
    f = font(label_size)
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tb = tmp.textbbox((0, 0), label, font=f)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    cw = max(qr_px, tw) + pad * 2
    ch = qr_px + gap + th + pad * 2
    # soft shadow
    shadow = Image.new("RGBA", (cw + 24, ch + 24), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([12, 16, cw + 12, ch + 16], radius=34, fill=(0, 0, 0, 60))
    shadow = shadow.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(10))
    card = rounded_card(cw, ch, 34)
    card.paste(qr, ((cw - qr_px) // 2, pad), qr)
    cd = ImageDraw.Draw(card)
    cd.text(((cw - tw) // 2 - tb[0], pad + qr_px + gap - tb[1]), label, font=f, fill=(17, 17, 17, 255))
    out = shadow.copy()
    out.alpha_composite(card, (12, 12))
    return out


def place(src_name, out_name, card, anchor):
    base = Image.open(os.path.join(HERE, src_name)).convert("RGBA")
    W, H = base.size
    cw, ch = card.size
    if anchor == "bottom-center":
        x, y = (W - cw) // 2, H - ch - 24
    elif anchor == "bottom-right":
        x, y = W - cw - 36, H - ch - 36
    else:
        raise ValueError(anchor)
    base.alpha_composite(card, (x, y))
    base.convert("RGB").save(os.path.join(HERE, out_name))
    print(f"✅ {out_name}  ({card.size[0]}x{card.size[1]} QR card @ {anchor})")


# #8: clean reserved bottom strip → prominent centered QR
place("iteration-8.png", "iteration-8-qr.png",
      qr_card(300, "SCAN TO DOWNLOAD", 34), "bottom-center")

# #6: phone hero already has the App Store badge → smaller QR in the corner
place("iteration-6.png", "iteration-6-qr.png",
      qr_card(210, "SCAN TO GET IT", 26), "bottom-right")
