#!/usr/bin/env python3
"""Generate four full-width, shareable charts for the $1,920 MRR founder post."""

from __future__ import annotations

import html
import math
import subprocess
import tempfile
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

FG = "#18181b"
MUTED = "#71717a"
SUBTLE = "#a1a1aa"
BORDER = "#e4e4e7"
GRID = "#e4e4e7"
CARD = "#ffffff"
TEAL = "#0f766e"
TEAL_SOFT = "#ccfbf1"
BLUE = "#2563eb"
BLUE_SOFT = "#dbeafe"
ORANGE = "#ea580c"
ORANGE_SOFT = "#ffedd5"
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
WIDTH = 1200
HEIGHT = 675
HEADER = 128


def svg_text(
    x: float,
    y: float,
    value: str,
    *,
    size: int = 16,
    color: str = FG,
    weight: int = 400,
    anchor: str = "start",
) -> str:
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" '
        f'font-size="{size}" font-weight="{weight}" fill="{color}">'
        f'{html.escape(value)}</text>'
    )


def html_card(
    title: str,
    description: str,
    stats: list[tuple[str, str, str]],
    svg: str,
    *,
    width: int = WIDTH,
    height: int = HEIGHT,
) -> str:
    stat_html = "".join(
        f'<div class="stat"><b class="{tone}">{html.escape(value)}</b>'
        f'<span>{html.escape(label)}</span></div>'
        for value, label, tone in stats
    )
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{width}px; height:{height}px; background:#fafafa; font-family:{FONT}; }}
.card {{ width:100%; height:100%; overflow:hidden; border:1px solid {BORDER}; border-radius:24px; background:{CARD}; }}
.header {{ height:{HEADER}px; display:flex; justify-content:space-between; align-items:flex-start; padding:32px 40px 0; }}
h1 {{ font-size:29px; line-height:1.08; font-weight:650; letter-spacing:-0.025em; color:{FG}; }}
.desc {{ margin-top:10px; font-size:15px; line-height:1.2; color:{MUTED}; }}
.stats {{ display:flex; gap:34px; padding-top:2px; text-align:right; }}
.stat b {{ display:block; font-size:27px; line-height:1; font-weight:680; letter-spacing:-0.025em; color:{FG}; }}
.stat b.teal {{ color:{TEAL}; }} .stat b.blue {{ color:{BLUE}; }} .stat b.orange {{ color:{ORANGE}; }}
.stat span {{ display:block; margin-top:8px; font-size:13px; color:{MUTED}; white-space:nowrap; }}
svg text {{ font-family:{FONT}; }}
</style></head><body><div class="card">
<div class="header"><div><h1>{html.escape(title)}</h1><p class="desc">{html.escape(description)}</p></div><div class="stats">{stat_html}</div></div>
<svg width="{width}" height="{height - HEADER}" viewBox="0 {HEADER} {width} {height - HEADER}" role="img">{svg}</svg>
</div></body></html>"""


def monotone_path(xs: list[float], ys: list[float]) -> str:
    n = len(xs)
    dx = [xs[i + 1] - xs[i] for i in range(n - 1)]
    dy = [ys[i + 1] - ys[i] for i in range(n - 1)]
    slopes = [dy[i] / dx[i] for i in range(n - 1)]
    tangents = [0.0] * n
    tangents[0], tangents[-1] = slopes[0], slopes[-1]
    for i in range(1, n - 1):
        tangents[i] = 0.0 if slopes[i - 1] * slopes[i] <= 0 else (slopes[i - 1] + slopes[i]) / 2
    for i in range(n - 1):
        if slopes[i] == 0:
            tangents[i] = tangents[i + 1] = 0.0
            continue
        a, b = tangents[i] / slopes[i], tangents[i + 1] / slopes[i]
        length = math.sqrt(a * a + b * b)
        if length > 3:
            tangents[i] = 3 * slopes[i] * a / length
            tangents[i + 1] = 3 * slopes[i] * b / length
    path = f"M {xs[0]:.1f} {ys[0]:.1f}"
    for i in range(n - 1):
        c1x = xs[i] + dx[i] / 3
        c1y = ys[i] + tangents[i] * dx[i] / 3
        c2x = xs[i + 1] - dx[i] / 3
        c2y = ys[i + 1] - tangents[i + 1] * dx[i] / 3
        path += f" C {c1x:.1f} {c1y:.1f} {c2x:.1f} {c2y:.1f} {xs[i + 1]:.1f} {ys[i + 1]:.1f}"
    return path


def mrr_chart() -> tuple[str, str, int, int]:
    points = [
        (date(2026, 3, 8), 47.75), (date(2026, 3, 15), 70.14), (date(2026, 3, 22), 90.11),
        (date(2026, 3, 29), 133.95), (date(2026, 4, 5), 182.33), (date(2026, 4, 12), 229.42),
        (date(2026, 4, 19), 279.65), (date(2026, 4, 26), 360.18), (date(2026, 5, 3), 477.32),
        (date(2026, 5, 10), 581.06), (date(2026, 5, 17), 605.68), (date(2026, 5, 24), 630.68),
        (date(2026, 5, 31), 649.44), (date(2026, 6, 7), 651.88), (date(2026, 6, 14), 684.83),
        (date(2026, 6, 21), 796.60), (date(2026, 6, 28), 797.00), (date(2026, 7, 5), 895.19),
        (date(2026, 7, 12), 1004.34), (date(2026, 7, 19), 1148.83), (date(2026, 7, 26), 1392.89),
        (date(2026, 8, 2), 1528.14), (date(2026, 8, 9), 1746.02), (date(2026, 8, 12), 1920.18),
    ]
    left, right, top, bottom = 84, 1146, 164, 612
    d0, d1 = points[0][0].toordinal(), points[-1][0].toordinal()
    x = lambda d: left + (d.toordinal() - d0) / (d1 - d0) * (right - left)
    y = lambda v: bottom - (v / 2000) * (bottom - top)
    xs = [x(d) for d, _ in points]
    ys = [y(v) for _, v in points]
    path = monotone_path(xs, ys)
    area = path + f" L {xs[-1]:.1f} {bottom} L {xs[0]:.1f} {bottom} Z"
    svg = [
        f'<defs><linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{TEAL}" stop-opacity="0.25"/>'
        f'<stop offset="100%" stop-color="{TEAL}" stop-opacity="0.01"/></linearGradient></defs>'
    ]
    for value in (0, 500, 1000, 1500, 2000):
        yy = y(value)
        svg.append(f'<line x1="{left}" y1="{yy:.1f}" x2="{right}" y2="{yy:.1f}" stroke="{GRID}" stroke-dasharray="4 5"/>')
        svg.append(svg_text(left - 14, yy + 5, f"${value:,}", size=14, color=MUTED, anchor="end"))
    for tick in (date(2026, 3, 8), date(2026, 4, 1), date(2026, 5, 1), date(2026, 6, 1), date(2026, 7, 1), date(2026, 8, 1)):
        svg.append(svg_text(x(tick), bottom + 32, tick.strftime("%b"), size=14, color=MUTED, anchor="middle"))
    milestone_x = x(date(2026, 7, 12))
    svg.append(f'<line x1="{milestone_x:.1f}" y1="{top}" x2="{milestone_x:.1f}" y2="{bottom}" stroke="{BLUE}" stroke-dasharray="6 6" stroke-opacity="0.55"/>')
    svg.append(svg_text(milestone_x + 12, top + 24, "$1K crossed", size=15, color=BLUE, weight=650))
    svg.append(svg_text(milestone_x + 12, top + 46, "July 12", size=13, color=MUTED))
    svg.append(f'<path d="{area}" fill="url(#mrrFill)"/>')
    svg.append(f'<path d="{path}" fill="none" stroke="{TEAL}" stroke-width="4" stroke-linecap="round"/>')
    svg.append(f'<circle cx="{xs[-1]:.1f}" cy="{ys[-1]:.1f}" r="7" fill="{TEAL}" stroke="{CARD}" stroke-width="4"/>')
    svg.append(svg_text(xs[-1] - 12, ys[-1] - 17, "$1,920.18", size=18, color=TEAL, weight=700, anchor="end"))
    return (
        "mrr-acceleration",
        html_card(
            "The next $920 came 3.7× faster",
            "RevenueCat  •  March 8–August 12, 2026",
            [("$1,920", "MRR now", "teal"), ("126 days", "first $1K", ""), ("31 days", "next $920", "blue")],
            "".join(svg),
        ), WIDTH, HEIGHT,
    )


def tool_clicks_chart() -> tuple[str, str, int, int]:
    tool_clicks = [
        42, 34, 33, 35, 43, 38, 55, 78, 56, 74, 78, 86, 74, 73, 87, 96,
        85, 76, 82, 101, 107, 95, 106, 154, 136, 146, 135, 163, 173, 171, 129,
    ]
    mrr = [
        1004.34, 1008.61, 1055.21, 1074.79, 1114.11, 1122.94, 1130.35, 1148.83,
        1192.43, 1216.40, 1255.50, 1296.14, 1322.71, 1362.26, 1392.89, 1402.70,
        1418.68, 1471.99, 1476.74, 1515.98, 1529.33, 1528.14, 1542.04, 1577.57,
        1565.64, 1586.82, 1600.28, 1698.70, 1746.02, 1796.41, 1891.44, 1920.18,
    ]
    d0, d1 = date(2026, 7, 12), date(2026, 8, 12)
    left, right, top, bottom = 82, 1126, 212, 612
    x = lambda d: left + (d.toordinal() - d0.toordinal()) / (d1.toordinal() - d0.toordinal()) * (right - left)
    yc = lambda v: bottom - (v / 180) * (bottom - top)
    ym = lambda v: bottom - ((v - 950) / 1000) * (bottom - top)
    bar_step = (right - left) / 32
    bar_w = bar_step * 0.62
    svg = [
        f'<defs><linearGradient id="mrrMonthFill" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{BLUE}" stop-opacity="0.17"/>'
        f'<stop offset="100%" stop-color="{BLUE}" stop-opacity="0.01"/></linearGradient></defs>'
    ]
    for value in (0, 60, 120, 180):
        yy = yc(value)
        svg.append(f'<line x1="{left}" y1="{yy:.1f}" x2="{right}" y2="{yy:.1f}" stroke="{GRID}" stroke-dasharray="4 5"/>')
        svg.append(svg_text(left - 14, yy + 5, str(value), size=14, color=MUTED, anchor="end"))
    for value in (1000, 1300, 1600, 1900):
        svg.append(svg_text(right + 14, ym(value) + 5, f"${value / 1000:.1f}K", size=14, color=MUTED))
    svg.append(svg_text(left, top - 22, "Organic tool clicks / day", size=14, color=TEAL, weight=650))
    svg.append(svg_text(right, top - 22, "MRR", size=14, color=BLUE, weight=650, anchor="end"))
    for i, value in enumerate(tool_clicks):
        xx = left + i * bar_step + (bar_step - bar_w) / 2
        yy = yc(value)
        svg.append(f'<rect x="{xx:.1f}" y="{yy:.1f}" width="{bar_w:.1f}" height="{bottom - yy:.1f}" rx="5" fill="{TEAL}" fill-opacity="0.72"/>')
    mrr_xs = [x(date.fromordinal(d0.toordinal() + i)) for i in range(len(mrr))]
    mrr_ys = [ym(value) for value in mrr]
    mrr_path = monotone_path(mrr_xs, mrr_ys)
    mrr_area = mrr_path + f" L {mrr_xs[-1]:.1f} {bottom} L {mrr_xs[0]:.1f} {bottom} Z"
    svg.append(f'<path d="{mrr_area}" fill="url(#mrrMonthFill)"/>')
    svg.append(f'<path d="{mrr_path}" fill="none" stroke="{BLUE}" stroke-width="4" stroke-linecap="round"/>')
    events = [
        (date(2026, 7, 13), "Funnel rebuild", 156),
        (date(2026, 7, 18), "Transformation", 181),
        (date(2026, 7, 23), "Rater + links", 156),
        (date(2026, 7, 30), "Hub + queries", 181),
        (date(2026, 8, 6), "Body visualizer", 156),
    ]
    for event_date, label, label_y in events:
        xx = x(event_date)
        svg.append(f'<line x1="{xx:.1f}" y1="{label_y + 10}" x2="{xx:.1f}" y2="{bottom}" stroke="{SUBTLE}" stroke-dasharray="4 5" stroke-opacity="0.65"/>')
        svg.append(f'<circle cx="{xx:.1f}" cy="{label_y + 7}" r="5" fill="{CARD}" stroke="{ORANGE}" stroke-width="3"/>')
        svg.append(svg_text(xx, label_y, label, size=13, color=FG, weight=600, anchor="middle"))
    for tick in (date(2026, 7, 12), date(2026, 7, 18), date(2026, 7, 24), date(2026, 7, 30), date(2026, 8, 5), date(2026, 8, 11)):
        svg.append(svg_text(x(tick), bottom + 32, tick.strftime("%b %-d"), size=14, color=MUTED, anchor="middle"))
    svg.append(f'<circle cx="{mrr_xs[-1]:.1f}" cy="{mrr_ys[-1]:.1f}" r="7" fill="{BLUE}" stroke="{CARD}" stroke-width="4"/>')
    svg.append(svg_text(mrr_xs[-1] - 12, mrr_ys[-1] - 15, "$1,920", size=17, color=BLUE, weight=700, anchor="end"))
    return (
        "tool-clicks-by-week",
        html_card(
            "Free-tool traffic rose with MRR",
            "Search Console fresh through Aug 11  •  RevenueCat through Aug 12",
            [("+827%", "tool clicks", "teal"), ("$1K → $1.92K", "MRR", "blue"), ("5", "shipping events", "orange")],
            "".join(svg),
        ), WIDTH, HEIGHT,
    )


def tool_winners_chart() -> tuple[str, str, int, int]:
    rows = [
        ("Body fat from photo", 206, 1486, "+1,280 clicks"),
        ("Physique rater", 0, 538, "new tool"),
        ("Body fat visualizer", 12, 480, "+468 clicks"),
        ("Tools directory", 79, 222, "+143 clicks"),
    ]
    left, right, top = 304, 1126, 202
    row_h, bar_h, max_value = 94, 22, 1500
    sx = lambda v: left + (v / max_value) * (right - left)
    svg = []
    for value in (0, 500, 1000, 1500):
        xx = sx(value)
        svg.append(f'<line x1="{xx:.1f}" y1="{top - 20}" x2="{xx:.1f}" y2="{top + row_h * len(rows) - 22}" stroke="{GRID}" stroke-dasharray="4 5"/>')
        svg.append(svg_text(xx, top + row_h * len(rows) + 10, f"{value:,}", size=14, color=MUTED, anchor="middle"))
    svg.append(f'<rect x="{right - 230}" y="{top - 50}" width="13" height="13" rx="4" fill="{TEAL}"/>')
    svg.append(svg_text(right - 208, top - 39, "Jul 13–Aug 11", size=14, color=MUTED))
    svg.append(f'<rect x="{right - 82}" y="{top - 50}" width="13" height="13" rx="4" fill="{SUBTLE}"/>')
    svg.append(svg_text(right - 60, top - 39, "prior 30d", size=14, color=MUTED))
    for i, (label, before, after, delta) in enumerate(rows):
        yy = top + i * row_h
        svg.append(svg_text(left - 24, yy + 22, label, size=17, color=FG, weight=650, anchor="end"))
        svg.append(svg_text(left - 24, yy + 48, delta, size=14, color=BLUE if before == 0 else TEAL, weight=650, anchor="end"))
        after_w = max(3, sx(after) - left)
        before_w = max(3, sx(before) - left)
        svg.append(f'<rect x="{left}" y="{yy}" width="{after_w:.1f}" height="{bar_h}" rx="7" fill="{TEAL}"/>')
        svg.append(svg_text(left + after_w + 12, yy + 17, f"{after:,}", size=16, color=TEAL, weight=700))
        svg.append(f'<rect x="{left}" y="{yy + 34}" width="{before_w:.1f}" height="{bar_h}" rx="7" fill="{SUBTLE}"/>')
        svg.append(svg_text(left + before_w + 12, yy + 51, f"{before:,}", size=15, color=MUTED, weight=650))
    return (
        "tool-page-winners",
        html_card(
            "Existing tools produced 76% of the added clicks",
            "Organic clicks by landing page  •  matched 30-day windows",
            [("76%", "from existing pages", "teal"), ("97%", "from top four", "blue")],
            "".join(svg),
        ), WIDTH, HEIGHT,
    )


def repo_timeline_chart() -> tuple[str, str, int, int]:
    events = [
        ("Jul 13", "Estimator result", "One clear next step"),
        ("Jul 18", "Transformation", "New tool + 8 links"),
        ("Jul 23", "Physique rater", "New tool + 20 links"),
        ("Jul 29", "Tools hub", "Reordered by traffic"),
        ("Jul 31", "Search rewrite", "Used real queries"),
        ("Aug 6", "Body visualizer", "New tool"),
    ]
    x0, x1, line_y = 92, 1108, 380
    svg = [f'<line x1="{x0}" y1="{line_y}" x2="{x1}" y2="{line_y}" stroke="{BORDER}" stroke-width="4" stroke-linecap="round"/>']
    for i, (when, label, detail) in enumerate(events):
        xx = x0 + i * (x1 - x0) / (len(events) - 1)
        above = i % 2 == 0
        stem_end = line_y - 74 if above else line_y + 74
        svg.append(f'<line x1="{xx:.1f}" y1="{line_y}" x2="{xx:.1f}" y2="{stem_end}" stroke="{SUBTLE}" stroke-width="2"/>')
        svg.append(f'<circle cx="{xx:.1f}" cy="{line_y}" r="10" fill="{CARD}" stroke="{TEAL if i in (2, 4, 5) else BLUE}" stroke-width="4"/>')
        if above:
            svg.append(svg_text(xx, stem_end - 38, when, size=14, color=TEAL if i in (2, 4, 5) else BLUE, weight=700, anchor="middle"))
            svg.append(svg_text(xx, stem_end - 14, label, size=16, color=FG, weight=650, anchor="middle"))
            svg.append(svg_text(xx, stem_end + 9, detail, size=13, color=MUTED, anchor="middle"))
        else:
            svg.append(svg_text(xx, stem_end + 27, when, size=14, color=TEAL if i in (2, 4, 5) else BLUE, weight=700, anchor="middle"))
            svg.append(svg_text(xx, stem_end + 53, label, size=16, color=FG, weight=650, anchor="middle"))
            svg.append(svg_text(xx, stem_end + 76, detail, size=13, color=MUTED, anchor="middle"))
    return (
        "repo-changes-timeline",
        html_card(
            "What changed between $1K and $1.92K MRR",
            "Git history  •  July 12–August 12, 2026",
            [("11 → 14", "free tools", "blue"), ("+424", "internal links", "teal"), ("46 → 7", "orphan pages", "orange")],
            "".join(svg),
        ), WIDTH, HEIGHT,
    )


def render(name: str, chart_html: str, width: int, height: int) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="gainframe-founder-chart-") as tmp:
        tmp_path = Path(tmp)
        html_path = tmp_path / f"{name}.html"
        png_path = tmp_path / f"{name}.png"
        html_path.write_text(chart_html, encoding="utf-8")
        subprocess.run(
            [
                str(CHROME), "--headless=new", "--hide-scrollbars", "--disable-gpu",
                "--force-device-scale-factor=2", f"--window-size={width},{height}",
                f"--screenshot={png_path}", html_path.as_uri(),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        subprocess.run(
            ["cwebp", "-quiet", "-q", "90", str(png_path), "-o", str(ASSETS / f"{name}.webp")],
            check=True,
        )


def main() -> None:
    for chart in (mrr_chart(), tool_clicks_chart(), tool_winners_chart(), repo_timeline_chart()):
        render(*chart)
        print(f"wrote assets/{chart[0]}.webp")


if __name__ == "__main__":
    main()
