#!/usr/bin/env python3
"""shadcn-style chart SVGs for the $1k MRR post. Emits two HTML files sized
exactly to the card; screenshot with headless Chrome at 2x."""
from datetime import date

# ---- tokens (shadcn light) ----
FG = "#09090b"
MUTED = "#71717a"
BORDER = "#e4e4e7"
GRID = "#e4e4e7"
TEAL = "#2a9d90"      # chart-2
ORANGE = "#e76e50"    # chart-1
FONT = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

weeks = [date(2026, 2, 8), date(2026, 2, 15), date(2026, 2, 22), date(2026, 3, 1),
         date(2026, 3, 8), date(2026, 3, 15), date(2026, 3, 22), date(2026, 3, 29),
         date(2026, 4, 5), date(2026, 4, 12), date(2026, 4, 19), date(2026, 4, 26),
         date(2026, 5, 3), date(2026, 5, 10), date(2026, 5, 17), date(2026, 5, 24),
         date(2026, 5, 31), date(2026, 6, 7), date(2026, 6, 14), date(2026, 6, 21),
         date(2026, 6, 28), date(2026, 7, 5), date(2026, 7, 12)]
mrr = [0, 0, 0, 0, 47.75, 70.14, 90.11, 133.95, 182.33, 229.42, 279.65, 360.18,
       477.32, 581.06, 605.67, 630.68, 649.44, 651.88, 684.83, 796.60, 863.81,
       992.05, 1000.04]

# ---------------- Chart 1: MRR area ----------------
W, H = 1120, 620
PX0, PX1 = 64, W - 40
PY_TOP, PY_BOT = 150, H - 64
d0, d1 = weeks[0].toordinal(), weeks[-1].toordinal()
YMAX = 1000.0

def X(d): return PX0 + (d.toordinal() - d0) / (d1 - d0) * (PX1 - PX0)
def Y(v): return PY_BOT - (v / YMAX) * (PY_BOT - PY_TOP)

xs = [X(d) for d in weeks]
ys = [Y(v) for v in mrr]

# monotone cubic (Fritsch–Carlson) -> bezier path, no overshoot on the flat zero run
n = len(xs)
dx = [xs[i+1]-xs[i] for i in range(n-1)]
dy = [ys[i+1]-ys[i] for i in range(n-1)]
s = [dy[i]/dx[i] for i in range(n-1)]
m = [0.0]*n
m[0], m[-1] = s[0], s[-1]
for i in range(1, n-1):
    m[i] = 0.0 if s[i-1]*s[i] <= 0 else (s[i-1]+s[i])/2
for i in range(n-1):
    if s[i] == 0:
        m[i] = m[i+1] = 0.0
    else:
        a, b = m[i]/s[i], m[i+1]/s[i]
        h = (a*a + b*b) ** 0.5
        if h > 3:
            m[i], m[i+1] = 3*s[i]*a/h, 3*s[i]*b/h
path = f"M {xs[0]:.1f} {ys[0]:.1f}"
for i in range(n-1):
    c1x, c1y = xs[i] + dx[i]/3, ys[i] + m[i]*dx[i]/3
    c2x, c2y = xs[i+1] - dx[i]/3, ys[i+1] - m[i+1]*dx[i]/3
    path += f" C {c1x:.1f} {c1y:.1f} {c2x:.1f} {c2y:.1f} {xs[i+1]:.1f} {ys[i+1]:.1f}"
area = path + f" L {xs[-1]:.1f} {PY_BOT} L {xs[0]:.1f} {PY_BOT} Z"

svg = []
svg.append(f'<defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">'
           f'<stop offset="0%" stop-color="{TEAL}" stop-opacity="0.22"/>'
           f'<stop offset="100%" stop-color="{TEAL}" stop-opacity="0.02"/></linearGradient></defs>')
# grid
for v in (250, 500, 750, 1000):
    y = Y(v)
    svg.append(f'<line x1="{PX0}" y1="{y:.1f}" x2="{PX1}" y2="{y:.1f}" stroke="{GRID}" stroke-dasharray="3 3" stroke-width="1"/>')
    svg.append(f'<text x="{PX0-10}" y="{y+4:.1f}" text-anchor="end" font-size="12" fill="{MUTED}">${v:,}</text>')
svg.append(f'<line x1="{PX0}" y1="{PY_BOT}" x2="{PX1}" y2="{PY_BOT}" stroke="{BORDER}" stroke-width="1"/>')
svg.append(f'<text x="{PX0-10}" y="{PY_BOT+4}" text-anchor="end" font-size="12" fill="{MUTED}">$0</text>')
# month ticks
for mth in (3, 4, 5, 6, 7):
    x = X(date(2026, mth, 1))
    svg.append(f'<text x="{x:.1f}" y="{PY_BOT+26}" text-anchor="middle" font-size="12" fill="{MUTED}">'
               + date(2026, mth, 1).strftime("%b") + '</text>')
# reference lines
for d, lbl in ((date(2026, 3, 8), "Launch"), (date(2026, 5, 14), "Ads off")):
    x = X(d)
    svg.append(f'<line x1="{x:.1f}" y1="{PY_TOP-12}" x2="{x:.1f}" y2="{PY_BOT}" stroke="#d4d4d8" stroke-dasharray="4 4" stroke-width="1"/>')
    svg.append(f'<text x="{x+7:.1f}" y="{PY_TOP-2}" font-size="12" fill="{MUTED}">{lbl}</text>')
# area + line
svg.append(f'<path d="{area}" fill="url(#fill)"/>')
svg.append(f'<path d="{path}" fill="none" stroke="{TEAL}" stroke-width="2.25" stroke-linecap="round"/>')
# milestone dots
for d, v, lbl in ((date(2026, 3, 29), 133.95, "$100"), (date(2026, 4, 19), 279.65, "$250"),
                  (date(2026, 5, 10), 581.06, "$500"), (date(2026, 6, 21), 796.60, "$750")):
    x, y = X(d), Y(v)
    svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="#ffffff" stroke="{TEAL}" stroke-width="2"/>')
    svg.append(f'<text x="{x:.1f}" y="{y-14:.1f}" text-anchor="middle" font-size="12.5" font-weight="600" fill="{FG}">{lbl}</text>')
# end point
xe, ye = xs[-1], ys[-1]
svg.append(f'<circle cx="{xe:.1f}" cy="{ye:.1f}" r="7" fill="{TEAL}" fill-opacity="0.25"/>')
svg.append(f'<circle cx="{xe:.1f}" cy="{ye:.1f}" r="4.5" fill="{TEAL}"/>')
svg.append(f'<text x="{xe-2:.1f}" y="{ye-16:.1f}" text-anchor="end" font-size="13.5" font-weight="700" fill="{TEAL}">$1,000 &#183; Jul 12</text>')

html1 = f"""<!doctype html><html><head><meta charset="utf-8"><style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{W}px; height:{H}px; font-family:{FONT}; background:#fff; }}
.card {{ width:100%; height:100%; border:1px solid {BORDER}; border-radius:16px; background:#fff; padding:28px 0 0 0; }}
.hdr {{ display:flex; justify-content:space-between; align-items:flex-start; padding:0 36px; }}
h1 {{ font-size:20px; font-weight:600; color:{FG}; letter-spacing:-0.01em; }}
p.desc {{ font-size:14px; color:{MUTED}; margin-top:5px; }}
.stats {{ display:flex; gap:36px; text-align:right; }}
.stat b {{ display:block; font-size:24px; font-weight:600; color:{FG}; letter-spacing:-0.02em; }}
.stat b.teal {{ color:{TEAL}; }}
.stat span {{ font-size:12.5px; color:{MUTED}; }}
</style></head><body><div class="card">
<div class="hdr"><div><h1>Monthly recurring revenue</h1>
<p class="desc">Weekly &#183; RevenueCat &#183; Feb 8 &#8211; Jul 12, 2026</p></div>
<div class="stats">
<div class="stat"><b class="teal">$1,000.04</b><span>MRR today</span></div>
<div class="stat"><b>5 mo</b><span>since first commit</span></div>
<div class="stat"><b>$0</b><span>ads since mid-May</span></div>
</div></div>
<svg width="{W}" height="{H-104}" viewBox="0 104 {W} {H-104}">{''.join(svg)}</svg>
</div></body></html>"""

# ---------------- Chart 2: milestone gaps ----------------
W2, H2 = 1120, 470
rows = [("Launch to $100", 3, TEAL, ""), ("$100 to $250", 3, TEAL, ""),
        ("$250 to $500", 3, TEAL, ""), ("$500 to $750", 6, ORANGE, "ads off &#8212; five flat weeks"),
        ("$750 to $1,000", 3, TEAL, "")]
BX0, BX1 = 200, W2 - 300
TOP2 = 128
ROW_H, BAR_H = 58, 26
XMAX = 7.0
def BX(w): return BX0 + w / XMAX * (BX1 - BX0)

svg2 = []
for t in (0, 2, 4, 6):
    x = BX(t)
    svg2.append(f'<line x1="{x:.1f}" y1="{TOP2-10}" x2="{x:.1f}" y2="{TOP2+5*ROW_H-12}" stroke="{GRID}" stroke-dasharray="3 3" stroke-width="1"/>')
    svg2.append(f'<text x="{x:.1f}" y="{TOP2+5*ROW_H+16}" text-anchor="middle" font-size="12" fill="{MUTED}">{t}{" wk" if t==6 else ""}</text>')
for i, (label, wk, color, note) in enumerate(rows):
    cy = TOP2 + i * ROW_H
    svg2.append(f'<text x="{BX0-14}" y="{cy+BAR_H/2+5}" text-anchor="end" font-size="13.5" font-weight="500" fill="{FG}">{label}</text>')
    svg2.append(f'<rect x="{BX0}" y="{cy}" width="{BX(wk)-BX0:.1f}" height="{BAR_H}" rx="6" fill="{color}" fill-opacity="0.9"/>')
    svg2.append(f'<text x="{BX(wk)+12:.1f}" y="{cy+BAR_H/2+5}" font-size="13.5" font-weight="600" fill="{color}">{wk} wk</text>')
    if note:
        svg2.append(f'<text x="{BX(wk)+58:.1f}" y="{cy+BAR_H/2+5}" font-size="12.5" fill="{MUTED}">{note}</text>')

html2 = f"""<!doctype html><html><head><meta charset="utf-8"><style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{W2}px; height:{H2}px; font-family:{FONT}; background:#fff; }}
.card {{ width:100%; height:100%; border:1px solid {BORDER}; border-radius:16px; background:#fff; padding:28px 0 0 0; }}
.hdr {{ display:flex; justify-content:space-between; align-items:flex-start; padding:0 36px; }}
h1 {{ font-size:20px; font-weight:600; color:{FG}; letter-spacing:-0.01em; }}
p.desc {{ font-size:14px; color:{MUTED}; margin-top:5px; }}
.stats {{ display:flex; gap:36px; text-align:right; }}
.stat b {{ display:block; font-size:24px; font-weight:600; letter-spacing:-0.02em; color:{FG}; }}
.stat b.teal {{ color:{TEAL}; }} .stat b.orange {{ color:{ORANGE}; }}
.stat span {{ font-size:12.5px; color:{MUTED}; }}
</style></head><body><div class="card">
<div class="hdr"><div><h1>Weeks between milestones</h1>
<p class="desc">Measured on weekly MRR snapshots &#183; RevenueCat</p></div>
<div class="stats">
<div class="stat"><b class="teal">3 wk</b><span>every step but one</span></div>
<div class="stat"><b class="orange">6 wk</b><span>the plateau</span></div>
</div></div>
<svg width="{W2}" height="{H2-100}" viewBox="0 100 {W2} {H2-100}">{''.join(svg2)}</svg>
</div></body></html>"""

open("shadcn-chart1.html", "w").write(html1)
open("shadcn-chart2.html", "w").write(html2)
print("wrote html", W, H, W2, H2)
