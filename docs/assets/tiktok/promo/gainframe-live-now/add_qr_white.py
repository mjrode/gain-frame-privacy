#!/usr/bin/env python3
"""Composite a scannable App Store QR onto the white-bg phone promos.
Writes white-1-qr.png, white-2-qr.png, white-3-qr.png.
"""
import os
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
URL = "https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082"
FONT = os.path.join(HERE, "..", "..", "..", "gainframe-guy", "illustrations", "fonts", "Roboto-Black.ttf")


def make_qr(px):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=(17, 17, 17), back_color="white").convert("RGBA")
    return img.resize((px, px), Image.NEAREST)


def font(size):
    try:
        return ImageFont.truetype(FONT, size)
    except OSError:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)


def qr_card(qr_px=210, label="SCAN TO GET IT", label_size=26, pad=26, gap=14):
    qr = make_qr(qr_px)
    f = font(label_size)
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tb = tmp.textbbox((0, 0), label, font=f)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    cw, ch = max(qr_px, tw) + pad * 2, qr_px + gap + th + pad * 2
    shadow = Image.new("RGBA", (cw + 24, ch + 24), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([12, 16, cw + 12, ch + 16], radius=30, fill=(0, 0, 0, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(9))
    card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=30, fill=(255, 255, 255, 255))
    card.paste(qr, ((cw - qr_px) // 2, pad), qr)
    ImageDraw.Draw(card).text(((cw - tw) // 2 - tb[0], pad + qr_px + gap - tb[1]), label, font=f, fill=(17, 17, 17, 255))
    out = shadow.copy()
    out.alpha_composite(card, (12, 12))
    return out


def place(src, dst):
    base = Image.open(os.path.join(HERE, src)).convert("RGBA")
    W, H = base.size
    card = qr_card()
    cw, ch = card.size
    base.alpha_composite(card, (W - cw - 30, H - ch - 30))  # bottom-right
    base.convert("RGB").save(os.path.join(HERE, dst))
    print(f"✅ {dst}")


for n in (1, 2, 3):
    place(f"white-{n}.png", f"white-{n}-qr.png")
