from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
ASSETS = HERE / "assets"

W, H = 1080, 1350
REACTION_X = 800
REACTION_W = W - REACTION_X
GREEN = "#34D26F"
WHITE = "#FFFFFF"
BLACK = "#05070A"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"


def font(size: int, black: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BLACK if black else FONT_BOLD, size)


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, start: int, *, black: bool = False) -> ImageFont.FreeTypeFont:
    size = start
    while size > 18:
        candidate = font(size, black=black)
        if draw.textbbox((0, 0), text, font=candidate, stroke_width=0)[2] <= max_width:
            return candidate
        size -= 2
    return font(size, black=black)


def outlined_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, text_font: ImageFont.FreeTypeFont,
                  *, anchor: str = "la", fill: str = WHITE, stroke: int = 5, align: str = "left") -> None:
    draw.multiline_text(
        xy,
        text,
        font=text_font,
        fill=fill,
        anchor=anchor,
        align=align,
        spacing=4,
        stroke_width=stroke,
        stroke_fill=BLACK,
    )


def icon_card(canvas: Image.Image, path: Path, x: int, y: int, size: int, label: str, label_color: str = WHITE) -> None:
    plate = Image.new("RGBA", (size + 12, size + 12), (255, 255, 255, 255))
    plate_draw = ImageDraw.Draw(plate)
    plate_draw.rounded_rectangle((0, 0, size + 11, size + 11), radius=24, outline=(5, 7, 10, 220), width=4)
    logo = Image.open(path).convert("RGBA")
    logo = ImageOps.fit(logo, (size, size), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=20, fill=255)
    plate.alpha_composite(Image.composite(logo, Image.new("RGBA", logo.size), mask), (6, 6))
    canvas.alpha_composite(plate, (x, y))

    draw = ImageDraw.Draw(canvas)
    label_font = fit_font(draw, label.upper(), size + 34, 24, black=True)
    outlined_text(draw, (x + (size + 12) // 2, y - 7), label.upper(), label_font, anchor="ms", fill=label_color, stroke=4, align="center")


def render_cover() -> None:
    source = Image.open(ASSETS / "generated-athlete.png").convert("RGB")
    canvas = ImageOps.fit(source, (W, H), method=Image.Resampling.LANCZOS, centering=(0.5, 0.48)).convert("RGBA")

    # Preserve the candid photo while creating a readable hook zone.
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    shade_draw.rectangle((0, 825, W, H), fill=(0, 0, 0, 72))
    canvas = Image.alpha_composite(canvas, shade)
    draw = ImageDraw.Draw(canvas)

    hook = "THE BEST GYM APPS"
    hook_font = fit_font(draw, hook, 960, 104, black=True)
    outlined_text(draw, (W // 2, 1035), hook, hook_font, anchor="mm", fill=WHITE, stroke=8, align="center")
    outlined_text(draw, (W // 2, 1125), "THE ICEBERG GOES DEEPER →", font(34, black=True), anchor="mm", fill=GREEN, stroke=5, align="center")

    final = canvas.convert("RGB")
    final.save(HERE / "slide-1.png", quality=96)
    final.save(HERE / "slide-1.webp", format="WEBP", quality=92, method=6)


def render_iceberg() -> None:
    base = Image.open(ASSETS / "generated-iceberg.png").convert("RGB")
    canvas = ImageOps.fit(base, (W, H), method=Image.Resampling.LANCZOS).convert("RGBA")

    # Add a subtle readability veil on the copy side.
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    veil_draw = ImageDraw.Draw(veil)
    veil_draw.rectangle((0, 0, REACTION_X, H), fill=(3, 17, 33, 34))
    veil_draw.rectangle((0, 1030, REACTION_X, H), fill=(1, 7, 17, 112))
    canvas = Image.alpha_composite(canvas, veil)

    reactions = Image.open(ASSETS / "generated-reactions.png").convert("RGB")
    # The generated strip uses taller color panels followed by three shorter
    # monochrome panels, so crop at the actual dividers rather than fifths.
    reaction_bounds = [(0, 443), (443, 888), (888, 1182), (1182, 1481), (1481, 1774)]
    for index, (top, bottom) in enumerate(reaction_bounds):
        panel = reactions.crop((0, top, reactions.width, bottom))
        panel = ImageOps.fit(panel, (REACTION_W, 270), method=Image.Resampling.LANCZOS, centering=(0.5, 0.47))
        if index >= 3:
            panel = ImageEnhance.Contrast(panel).enhance(1.08)
        canvas.alpha_composite(panel.convert("RGBA"), (REACTION_X, index * 270))

    draw = ImageDraw.Draw(canvas)
    for y in (270, 540, 810, 1080):
        draw.line((0, y, W, y), fill=BLACK, width=7)
    draw.line((REACTION_X, 0, REACTION_X, H), fill=BLACK, width=8)

    logos = {
        "fitnessai": ROOT / "docs/assets/tiktok/apps/5-ai-personal-trainer-apps-ranked/assets/fitnessai/logo.png",
        "fitbod": ROOT / "docs/assets/tiktok/apps/5-ai-personal-trainer-apps-ranked/assets/fitbod/logo.png",
        "strong": ROOT / "docs/assets/tiktok/apps/5-muscle-gain-apps-ranked/assets/strong/logo.png",
        "hevy": ROOT / "docs/assets/tiktok/apps/5-muscle-gain-apps-ranked/assets/hevy/logo.png",
        "gymstreak": ROOT / "docs/assets/tiktok/apps/5-ai-personal-trainer-apps-ranked/assets/gymstreak/logo.png",
        "gainframe": ROOT / "docs/assets/tiktok/apps/5-muscle-gain-apps-ranked/assets/gainframe/logo.png",
    }

    # Tier 1 — workout generators.
    icon_card(canvas, logos["fitnessai"], 42, 101, 92, "FitnessAI")
    outlined_text(draw, (178, 116), "YOU JUST WANT\nA WORKOUT PLAN", font(50, black=True), fill=WHITE, stroke=6)

    # Tier 2 — adaptive programming.
    icon_card(canvas, logos["fitbod"], 42, 369, 92, "Fitbod")
    outlined_text(draw, (178, 378), "GOOD PROGRAMS.\nGENERIC PROGRESS.", font(47, black=True), fill=WHITE, stroke=6)

    # Tier 3 — precise set logging.
    icon_card(canvas, logos["strong"], 42, 641, 86, "Strong")
    icon_card(canvas, logos["hevy"], 155, 641, 86, "Hevy")
    outlined_text(draw, (282, 646), "LOG EVERY\nSET + REP", font(50, black=True), fill=WHITE, stroke=6)

    # Tier 4 — sophisticated training inputs.
    icon_card(canvas, logos["gymstreak"], 42, 908, 92, "GymStreak")
    outlined_text(draw, (178, 914), "SMARTER TRAINING.\nSTILL TRACKING INPUTS…", font(39, black=True), fill=WHITE, stroke=6)

    # Tier 5 — GainFrame tracks the outcome rather than claiming to replace a workout logger.
    icon_card(canvas, logos["gainframe"], 42, 1150, 112, "GainFrame", label_color=GREEN)
    outlined_text(draw, (196, 1095), "TRACK THE RESULT", fit_font(draw, "TRACK THE RESULT", 580, 55, black=True), fill=GREEN, stroke=6)
    outlined_text(draw, (196, 1165), "BODY FAT  •  12 MUSCLE SCORES", font(27, black=True), fill=WHITE, stroke=4)
    outlined_text(draw, (196, 1207), "PHOTO COMPARE  •  PHYSIQUE TREND", font(27, black=True), fill=WHITE, stroke=4)
    outlined_text(draw, (196, 1270), "SEE IF THE WORK WORKED.", font(34, black=True), fill=WHITE, stroke=5)

    final = canvas.convert("RGB")
    final.save(HERE / "slide-2.png", quality=96)
    final.save(HERE / "slide-2.webp", format="WEBP", quality=92, method=6)


if __name__ == "__main__":
    render_cover()
    render_iceberg()
    print(f"Rendered {HERE / 'slide-1.png'}")
    print(f"Rendered {HERE / 'slide-2.png'}")
