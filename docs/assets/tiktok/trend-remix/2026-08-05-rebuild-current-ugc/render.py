from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
APP = ROOT.parents[3] / "app-screenshots" / "2.33-live-2026-08-05"
W, H = 1080, 1350

BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
BLACK = (15, 17, 16)
CREAM = (244, 241, 232)
GREEN = (37, 211, 118)


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def cover(path: Path, *, centering: tuple[float, float] = (0.5, 0.5)) -> Image.Image:
    return ImageOps.fit(
        Image.open(path).convert("RGB"),
        (W, H),
        method=Image.Resampling.LANCZOS,
        centering=centering,
    )


def app_crop(number: str) -> Image.Image:
    source = Image.open(APP / f"{number}.png").convert("RGB")
    top = round(source.height * 0.25)
    crop_h = round(source.width * H / W)
    return source.crop((0, top, source.width, top + crop_h)).resize(
        (W, H), Image.Resampling.LANCZOS
    )


def reference_crop(number: str, box: tuple[int, int, int, int]) -> Image.Image:
    source = Image.open(APP / f"{number}.png").convert("RGB")
    sx = source.width / 1287
    sy = source.height / 2796
    scaled = (
        round(box[0] * sx),
        round(box[1] * sy),
        round(box[2] * sx),
        round(box[3] * sy),
    )
    return source.crop(scaled)


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=face, stroke_width=0)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def native_text(
    image: Image.Image,
    text: str,
    *,
    y: int,
    size: int = 72,
    max_width: int = 930,
    stroke: int = 8,
) -> Image.Image:
    image = image.copy()
    draw = ImageDraw.Draw(image)
    face = font(BOLD, size)
    lines = wrap(draw, text, face, max_width)
    line_gap = round(size * 0.16)
    heights = [draw.textbbox((0, 0), line, font=face, stroke_width=stroke)[3] for line in lines]
    cursor = y
    for line, line_h in zip(lines, heights):
        box = draw.textbbox((0, 0), line, font=face, stroke_width=stroke)
        line_w = box[2] - box[0]
        draw.text(
            ((W - line_w) / 2, cursor),
            line,
            font=face,
            fill="white",
            stroke_width=stroke,
            stroke_fill="black",
        )
        cursor += line_h + line_gap
    return image


def save(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(path, "PNG", optimize=True)


def rounded_paste(base: Image.Image, insert: Image.Image, box: tuple[int, int, int, int], radius: int = 28) -> None:
    x0, y0, x1, y1 = box
    insert = ImageOps.fit(insert, (x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    mask = Image.new("L", insert.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *insert.size), radius=radius, fill=255)
    base.paste(insert, (x0, y0), mask)
    ImageDraw.Draw(base).rounded_rectangle(box, radius=radius, outline=BLACK, width=3)


def guide_base(label: str = "AFTER YOUR CHECK-IN") -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(image)
    label_face = font(BOLD, 30)
    label_box = draw.textbbox((0, 0), label, font=label_face)
    pill_w = label_box[2] - label_box[0] + 54
    draw.rounded_rectangle((70, 68, 70 + pill_w, 126), radius=29, fill=GREEN, outline=BLACK, width=3)
    draw.text((97, 79), label, font=label_face, fill=BLACK)
    draw.line((70, 166, 1010, 166), fill=BLACK, width=3)
    return image, draw


def guide_cover() -> Image.Image:
    image, draw = guide_base("QUICK SAVE")
    face = font(BOLD, 84)
    lines = wrap(draw, "5 questions worth asking after a check-in", face, 930)
    y = 218
    for line in lines:
        draw.text((70, y), line, font=face, fill=BLACK)
        y += 94
    screenshot = reference_crop("03", (60, 720, 1227, 2350))
    rounded_paste(image, screenshot, (120, 742, 960, 1290), radius=30)
    return image


def guide_question(number: int, text: str) -> Image.Image:
    image, draw = guide_base()
    index_face = font(BOLD, 148)
    draw.text((70, 216), f"0{number}", font=index_face, fill=GREEN, stroke_width=2, stroke_fill=BLACK)
    face = font(BOLD, 82)
    lines = wrap(draw, f"{number}. {text}", face, 900)
    y = 470
    for line in lines:
        draw.text((70, y), line, font=face, fill=BLACK)
        y += 102
    draw.line((70, 1190, 1010, 1190), fill=BLACK, width=3)
    draw.text((70, 1224), "KEEP THIS WITH YOUR NEXT CHECK-IN", font=font(REGULAR, 27), fill=(65, 67, 64))
    return image


def guide_final() -> Image.Image:
    image, draw = guide_base("SAVE THIS")
    face = font(BOLD, 90)
    lines = wrap(draw, "save these for your next check-in", face, 920)
    y = 225
    for line in lines:
        draw.text((70, y), line, font=face, fill=BLACK)
        y += 104
    screenshot = reference_crop("03", (70, 810, 1217, 2460))
    rounded_paste(image, screenshot, (160, 700, 920, 1288), radius=30)
    return image


def render_same_boring_photo() -> None:
    out = ROOT / "same-boring-photo"
    raw = out / "_sources" / "raw-selfie-live.png"
    save(
        native_text(
            cover(raw, centering=(0.5, 0.42)),
            "why do you take the exact same boring photo every Sunday?",
            y=82,
            size=68,
        ),
        out / "slide-0-cover.png",
    )
    save(
        native_text(
            app_crop("08"),
            "because this is the part my memory skips.",
            y=58,
            size=72,
        ),
        out / "slide-1.png",
    )


def render_photo_dump() -> None:
    out = ROOT / "check-in-day-dump"
    source_names = ["00-bag", "01-mirror", "02-barbell", "03-midset", "04-snack-keys", "05-progress"]
    for index, name in enumerate(source_names):
        filename = "slide-0-cover.png" if index == 0 else f"slide-{index}.png"
        save(cover(out / "_sources" / f"{name}.png"), out / filename)
    save(app_crop("02"), out / "slide-6.png")
    save(cover(out / "_sources" / "07-exit.png"), out / "slide-7.png")


def render_guide() -> None:
    out = ROOT / "five-questions-after-check-in"
    save(guide_cover(), out / "slide-0-cover.png")
    questions = [
        "What changed since my last check-in?",
        "Which muscle scores moved most?",
        "Is my body-fat trend actually moving?",
        "What should I focus on next?",
        "What does the last month say—not just today?",
    ]
    for index, question in enumerate(questions, start=1):
        save(guide_question(index, question), out / f"slide-{index}.png")
    save(guide_final(), out / "slide-6.png")


def render_weakest_score() -> None:
    out = ROOT / "weakest-score-hot-take"
    raw_path = out / "_sources" / "raw-selfie.png"
    save(
        native_text(
            cover(raw_path, centering=(0.5, 0.4)),
            "unpopular opinion: your weakest muscle score is the most useful one",
            y=74,
            size=65,
        ),
        out / "slide-0-cover.png",
    )
    source = Image.open(raw_path).convert("RGB")
    w, h = source.size
    tight = source.crop((round(w * 0.1), round(h * 0.12), round(w * 0.9), round(h * 0.92)))
    save(
        native_text(
            ImageOps.fit(tight, (W, H), Image.Resampling.LANCZOS, centering=(0.5, 0.48)),
            "it tells you what to train—not what to post.",
            y=82,
            size=74,
        ),
        out / "slide-1.png",
    )
    save(app_crop("04"), out / "slide-2.png")


def render_two_photos() -> None:
    out = ROOT / "two-photos-looked-the-same"
    save(
        native_text(
            cover(out / "_sources" / "progress-pair-live.png", centering=(0.5, 0.5)),
            "I gave an app two photos I thought looked the same",
            y=78,
            size=68,
        ),
        out / "slide-0-cover.png",
    )
    save(
        native_text(
            app_crop("01"),
            "it noticed the part I missed.",
            y=62,
            size=78,
        ),
        out / "slide-1.png",
    )


def contact_sheet(folder: Path) -> None:
    slides = sorted(folder.glob("slide-*.png"), key=lambda p: ("cover" not in p.name, p.name))
    thumb_w, thumb_h = 270, 338
    gap = 24
    cols = min(4, len(slides))
    rows = (len(slides) + cols - 1) // cols
    sheet = Image.new("RGB", (gap + cols * (thumb_w + gap), gap + rows * (thumb_h + 54 + gap)), (32, 32, 32))
    draw = ImageDraw.Draw(sheet)
    face = font(REGULAR, 24)
    for i, slide in enumerate(slides):
        x = gap + (i % cols) * (thumb_w + gap)
        y = gap + (i // cols) * (thumb_h + 54 + gap)
        thumb = Image.open(slide).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + thumb_h + 10), slide.name, font=face, fill="white")
    sheet.save(folder / "_contact-sheet.png", "PNG", optimize=True)


def main() -> None:
    render_same_boring_photo()
    render_photo_dump()
    render_guide()
    render_weakest_score()
    render_two_photos()
    for folder in [
        ROOT / "same-boring-photo",
        ROOT / "check-in-day-dump",
        ROOT / "five-questions-after-check-in",
        ROOT / "weakest-score-hot-take",
        ROOT / "two-photos-looked-the-same",
    ]:
        contact_sheet(folder)


if __name__ == "__main__":
    main()
