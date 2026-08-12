#!/usr/bin/env python3
"""Generate the four source-backed charts for the $1,920 MRR founder post."""

from __future__ import annotations

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
CARD = "#fdfdfc"
TEAL = "#0f766e"
TEAL_SOFT = "#ccfbf1"
BLUE = "#2563eb"
BLUE_SOFT = "#dbeafe"
ORANGE = "#ea580c"
ORANGE_SOFT = "#ffedd5"
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"


def text(x: float, y: float, value: str, *, size: int = 13, color: str = FG,
         weight: int = 400, anchor: str = "start") -> str:
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" '
        f'font-size="{size}" font-weight="{weight}" fill="{color}">{value}</text>'
    )


def html_card(title: str, description: str, stats: list[tuple[str, str, str]],
              svg: str, *, width: int, height: int) -> str:
    stat_html = "".join(
        f'<div class="stat"><b class="{tone}">{value}</b><span>{label}</span></div>'
        for value, label, tone in stats
    )
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{width}px; height:{height}px; background:#fafaf9; font-family:{FONT}; }}
.card {{ width:100%; height:100%; overflow:hidden; border:1px solid {BORDER}; border-radius:18px; background:{CARD}; }}
.header {{ height:116px; display:flex; justify-content:space-between; align-items:flex-start; padding:29px 36px 0; }}
h1 {{ font-size:21px; line-height:1.15; font-weight:650; letter-spacing:-0.018em; color:{FG}; }}
.desc {{ margin-top:7px; font-size:13.5px; color:{MUTED}; }}
.stats {{ display:flex; gap:32px; text-align:right; }}
.stat b {{ display:block; font-size:23px; line-height:1; font-weight:650; letter-spacing:-0.025em; color:{FG}; }}
.stat b.teal {{ color:{TEAL}; }} .stat b.blue {{ color:{BLUE}; }} .stat b.orange {{ color:{ORANGE}; }}
.stat span {{ display:block; margin-top:7px; font-size:12px; color:{MUTED}; }}
svg text {{ font-family:{FONT}; }}
</style></head><body><div class="card">
<div class="header"><div><h1>{title}</h1><p class="desc">{description}</p></div><div class="stats">{stat_html}</div></div>
<svg width="{width}" height="{height - 116}" viewBox="0 116 {width} {height - 116}">{svg}</svg>
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
    width, height = 1120, 660
    points = [
        (date(2026, 3, 8), 47.75), (date(2026, 3, 15), 70.14), (date(2026, 3, 22), 90.11),
        (date(2026, 3, 29), 133.95), (date(2026, 4, 5), 182.33), (date(2026, 4, 12), 229.42),
        (date(2026, 4, 19), 279.65), (date(2026, 4, 26), 360.18), (date(2026, 5, 3), 477.32),
        (date(2026, 5, 10), 581.06), (date(2026, 5, 17), 605.68), (date(2026, 5, 24), 630.68),
        (date(2026, 5, 31), 649.44), (date(2026, 6, 7), 651.88), (date(2026, 6, 14), 684.83),
        (date(2026, 6, 21), 796.60), (date(2026, 6, 28), 797.00), (date(2026, 7, 5), 895.19),
        (date(2026, 7, 6), 919.83), (date(2026, 7, 7), 941.60), (date(2026, 7, 8), 939.84),
        (date(2026, 7, 9), 943.96), (date(2026, 7, 10), 945.15), (date(2026, 7, 11), 992.05),
        (date(2026, 7, 12), 1004.34), (date(2026, 7, 13), 1008.61), (date(2026, 7, 14), 1055.21),
        (date(2026, 7, 15), 1074.79), (date(2026, 7, 16), 1114.11), (date(2026, 7, 17), 1122.94),
        (date(2026, 7, 18), 1130.35), (date(2026, 7, 19), 1148.83), (date(2026, 7, 20), 1192.43),
        (date(2026, 7, 21), 1216.40), (date(2026, 7, 22), 1255.50), (date(2026, 7, 23), 1296.14),
        (date(2026, 7, 24), 1322.71), (date(2026, 7, 25), 1362.26), (date(2026, 7, 26), 1392.89),
        (date(2026, 7, 27), 1402.70), (date(2026, 7, 28), 1418.68), (date(2026, 7, 29), 1471.99),
        (date(2026, 7, 30), 1476.74), (date(2026, 7, 31), 1515.98), (date(2026, 8, 1), 1529.33),
        (date(2026, 8, 2), 1528.14), (date(2026, 8, 3), 1542.04), (date(2026, 8, 4), 1577.57),
        (date(2026, 8, 5), 1565.64), (date(2026, 8, 6), 1586.82), (date(2026, 8, 7), 1600.28),
        (date(2026, 8, 8), 1698.70), (date(2026, 8, 9), 1746.02), (date(2026, 8, 10), 1796.41),
        (date(2026, 8, 11), 1891.44), (date(2026, 8, 12), 1920.18),
    ]
    left, right, top, bottom = 72, width - 44, 152, height - 62
    d0, d1 = points[0][0].toordinal(), points[-1][0].toordinal()
    x = lambda d: left + (d.toordinal() - d0) / (d1 - d0) * (right - left)
    y = lambda v: bottom - (v / 2000) * (bottom - top)
    xs = [x(d) for d, _ in points]
    ys = [y(v) for _, v in points]
    path = monotone_path(xs, ys)
    area = path + f" L {xs[-1]:.1f} {bottom} L {xs[0]:.1f} {bottom} Z"
    svg = [
        f'<defs><linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{TEAL}" stop-opacity="0.25"/><stop offset="100%" stop-color="{TEAL}" stop-opacity="0.015"/></linearGradient></defs>'
    ]
    for value in (0, 500, 1000, 1500, 2000):
        yy = y(value)
        svg.append(f'<line x1="{left}" y1="{yy:.1f}" x2="{right}" y2="{yy:.1f}" stroke="{GRID}" stroke-dasharray="3 4"/>')
        svg.append(text(left - 12, yy + 4, f"${value:,}", size=12, color=MUTED, anchor="end"))
    for month in range(3, 9):
        xx = x(date(2026, month, 8 if month == 3 else 1))
        svg.append(text(xx, bottom + 27, date(2026, month, 1).strftime("%b"), size=12, color=MUTED, anchor="middle"))
    milestone_x = x(date(2026, 7, 12))
    svg.append(f'<line x1="{milestone_x:.1f}" y1="{top}" x2="{milestone_x:.1f}" y2="{bottom}" stroke="{BLUE}" stroke-dasharray="5 5" stroke-opacity="0.55"/>')
    svg.append(text(milestone_x + 9, top + 20, "$1K crossed", size=12, color=BLUE, weight=650))
    svg.append(text(milestone_x + 9, top + 38, "Jul 12", size=11, color=MUTED))
    svg.append(f'<path d="{area}" fill="url(#mrrFill)"/>')
    svg.append(f'<path d="{path}" fill="none" stroke="{TEAL}" stroke-width="3" stroke-linecap="round"/>')
    svg.append(f'<circle cx="{xs[0]:.1f}" cy="{ys[0]:.1f}" r="4" fill="{CARD}" stroke="{TEAL}" stroke-width="2"/>')
    svg.append(text(xs[0] + 9, ys[0] - 10, "Launch", size=11, color=MUTED))
    svg.append(f'<circle cx="{xs[-1]:.1f}" cy="{ys[-1]:.1f}" r="8" fill="{TEAL}" fill-opacity="0.18"/>')
    svg.append(f'<circle cx="{xs[-1]:.1f}" cy="{ys[-1]:.1f}" r="4.5" fill="{TEAL}"/>')
    svg.append(text(xs[-1] - 9, ys[-1] - 13, "$1,920.18", size=14, color=TEAL, weight=700, anchor="end"))
    return (
        "mrr-acceleration",
        html_card(
            "The second leg of MRR moved much faster",
            "RevenueCat  •  Mar 8 to Aug 12, 2026",
            [("$1,920.18", "MRR now", "teal"), ("126 days", "launch to $1K", ""), ("31 days", "$1K to now", "blue")],
            "".join(svg), width=width, height=height,
        ), width, height,
    )


def tool_clicks_chart() -> tuple[str, str, int, int]:
    width, height = 1120, 590
    labels = ["Jun 15", "Jun 22", "Jun 29", "Jul 6", "Jul 13", "Jul 20", "Jul 27", "Aug 3"]
    values = [19, 28, 42, 209, 316, 528, 642, 1013]
    left, right, top, bottom = 74, width - 42, 158, height - 58
    bar_space = (right - left) / len(values)
    bar_width = 67
    y = lambda v: bottom - (v / 1100) * (bottom - top)
    svg = []
    for value in (0, 250, 500, 750, 1000):
        yy = y(value)
        svg.append(f'<line x1="{left}" y1="{yy:.1f}" x2="{right}" y2="{yy:.1f}" stroke="{GRID}" stroke-dasharray="3 4"/>')
        svg.append(text(left - 12, yy + 4, f"{value:,}", size=12, color=MUTED, anchor="end"))
    boundary = left + bar_space * 4
    svg.append(f'<rect x="{boundary:.1f}" y="{top}" width="{right - boundary:.1f}" height="{bottom - top}" fill="{TEAL_SOFT}" fill-opacity="0.22" rx="10"/>')
    svg.append(f'<line x1="{boundary:.1f}" y1="{top}" x2="{boundary:.1f}" y2="{bottom}" stroke="{BLUE}" stroke-dasharray="5 5" stroke-opacity="0.6"/>')
    svg.append(text(boundary + 10, top + 18, "After the $1K milestone", size=12, color=BLUE, weight=650))
    for i, (label, value) in enumerate(zip(labels, values)):
        xx = left + bar_space * i + (bar_space - bar_width) / 2
        yy = y(value)
        color = TEAL if i >= 4 else SUBTLE
        svg.append(f'<rect x="{xx:.1f}" y="{yy:.1f}" width="{bar_width}" height="{bottom - yy:.1f}" rx="7" fill="{color}"/>')
        svg.append(text(xx + bar_width / 2, yy - 11, f"{value:,}", size=12, color=color, weight=650, anchor="middle"))
        svg.append(text(xx + bar_width / 2, bottom + 25, label, size=11, color=MUTED, anchor="middle"))
    return (
        "tool-clicks-by-week",
        html_card(
            "Organic clicks to free tools",
            "Weekly clicks  •  Google Search Console  •  final data through Aug 9",
            [("298", "prior 28 days", ""), ("2,499", "next 28 days", "teal"), ("+739%", "matched-window growth", "blue")],
            "".join(svg), width=width, height=height,
        ), width, height,
    )


def tool_winners_chart() -> tuple[str, str, int, int]:
    width, height = 1120, 600
    rows = [
        ("Body fat from photo", 203, 1376, "+578%"),
        ("Body fat visualizer", 12, 446, "+3,617%"),
        ("Physique rater", 0, 419, "new"),
        ("Tools directory", 78, 203, "+160%"),
    ]
    left, right, top = 244, width - 74, 164
    row_h, bar_h, max_value = 91, 20, 1400
    sx = lambda v: left + (v / max_value) * (right - left)
    svg = []
    for value in (0, 350, 700, 1050, 1400):
        xx = sx(value)
        svg.append(f'<line x1="{xx:.1f}" y1="{top - 16}" x2="{xx:.1f}" y2="{top + row_h * len(rows) - 16}" stroke="{GRID}" stroke-dasharray="3 4"/>')
        svg.append(text(xx, top + row_h * len(rows) + 8, f"{value:,}", size=11, color=MUTED, anchor="middle"))
    for i, (label, before, after, delta) in enumerate(rows):
        yy = top + i * row_h
        svg.append(text(left - 20, yy + 22, label, size=13, color=FG, weight=600, anchor="end"))
        svg.append(text(left - 20, yy + 42, delta, size=11, color=TEAL if delta != "new" else BLUE, weight=650, anchor="end"))
        before_w = max(2, sx(before) - left)
        after_w = max(2, sx(after) - left)
        svg.append(f'<rect x="{left}" y="{yy}" width="{after_w:.1f}" height="{bar_h}" rx="6" fill="{TEAL}"/>')
        svg.append(text(left + after_w + 10, yy + 15, f"{after:,}", size=12, color=TEAL, weight=650))
        svg.append(f'<rect x="{left}" y="{yy + 30}" width="{before_w:.1f}" height="{bar_h}" rx="6" fill="{SUBTLE}"/>')
        svg.append(text(left + before_w + 10, yy + 45, f"{before:,}", size=12, color=MUTED, weight=600))
    svg.append(f'<rect x="{width - 272}" y="{top - 28}" width="10" height="10" rx="3" fill="{TEAL}"/>')
    svg.append(text(width - 254, top - 18, "Jul 13 to Aug 9", size=11, color=MUTED))
    svg.append(f'<rect x="{width - 154}" y="{top - 28}" width="10" height="10" rx="3" fill="{SUBTLE}"/>')
    svg.append(text(width - 136, top - 18, "prior 28d", size=11, color=MUTED))
    return (
        "tool-page-winners",
        html_card(
            "Specific tools carried almost all the growth",
            "Organic clicks by landing page  •  matched 28-day windows",
            [("98%", "of tool clicks from top four", "teal"), ("23.7%", "physique rater CTR", "blue")],
            "".join(svg), width=width, height=height,
        ), width, height,
    )


def repo_timeline_chart() -> tuple[str, str, int, int]:
    width, height = 1120, 620
    cards = [
        ("Live tools", "11", "14", "+3", BLUE, BLUE_SOFT),
        ("Internal links", "929", "1,353", "+424", TEAL, TEAL_SOFT),
        ("Orphan pages", "46", "7", "-39", ORANGE, ORANGE_SOFT),
    ]
    svg = []
    card_y, card_h, card_w, gap = 150, 142, 312, 28
    start_x = (width - (card_w * 3 + gap * 2)) / 2
    for i, (label, before, after, delta, color, soft) in enumerate(cards):
        xx = start_x + i * (card_w + gap)
        svg.append(f'<rect x="{xx:.1f}" y="{card_y}" width="{card_w}" height="{card_h}" rx="14" fill="{soft}" fill-opacity="0.42" stroke="{BORDER}"/>')
        svg.append(text(xx + 22, card_y + 30, label, size=12, color=MUTED, weight=600))
        svg.append(text(xx + 22, card_y + 82, before, size=26, color=SUBTLE, weight=650))
        svg.append(text(xx + 92, card_y + 79, "→", size=23, color=MUTED, weight=500))
        svg.append(text(xx + 132, card_y + 82, after, size=34, color=color, weight=700))
        svg.append(text(xx + 22, card_y + 119, delta + " during the window", size=11, color=color, weight=650))
    events = [
        ("Jul 13", "Estimator funnel"),
        ("Jul 18", "Transformation tool"),
        ("Jul 23", "Physique rater"),
        ("Jul 29", "Hub reorder"),
        ("Aug 1", "Link cleanup"),
        ("Aug 6", "Body visualizer"),
    ]
    line_y, x0, x1 = 406, 86, width - 86
    svg.append(f'<line x1="{x0}" y1="{line_y}" x2="{x1}" y2="{line_y}" stroke="{BORDER}" stroke-width="3" stroke-linecap="round"/>')
    for i, (when, label) in enumerate(events):
        xx = x0 + i * (x1 - x0) / (len(events) - 1)
        color = TEAL if i in (2, 4, 5) else BLUE
        svg.append(f'<circle cx="{xx:.1f}" cy="{line_y}" r="8" fill="{CARD}" stroke="{color}" stroke-width="3"/>')
        svg.append(text(xx, line_y - 24, when, size=11, color=color, weight=700, anchor="middle"))
        svg.append(text(xx, line_y + 31, label, size=11, color=MUTED, weight=600, anchor="middle"))
    return (
        "repo-changes-timeline",
        html_card(
            "The repo changed as much as the traffic did",
            "Git history and content inventory  •  Jul 12 to Aug 12",
            [("6", "meaningful shipping events", "blue"), ("31 days", "from $1K to $1.92K", "teal")],
            "".join(svg), width=width, height=height,
        ), width, height,
    )


def render(name: str, html: str, width: int, height: int) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="gainframe-founder-chart-") as tmp:
        tmp_path = Path(tmp)
        html_path = tmp_path / f"{name}.html"
        png_path = tmp_path / f"{name}.png"
        html_path.write_text(html, encoding="utf-8")
        subprocess.run(
            [
                str(CHROME), "--headless=new", "--hide-scrollbars", "--disable-gpu",
                "--force-device-scale-factor=2", f"--window-size={width},{height}",
                f"--screenshot={png_path}", html_path.as_uri(),
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        subprocess.run(
            ["cwebp", "-quiet", "-q", "88", str(png_path), "-o", str(ASSETS / f"{name}.webp")],
            check=True,
        )


def main() -> None:
    for chart in (mrr_chart(), tool_clicks_chart(), tool_winners_chart(), repo_timeline_chart()):
        render(*chart)
        print(f"wrote assets/{chart[0]}.webp")


if __name__ == "__main__":
    main()
