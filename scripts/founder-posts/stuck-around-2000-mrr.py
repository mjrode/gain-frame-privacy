#!/usr/bin/env python3
"""Render the Sep 10 founder post's two chart cards from saved RevenueCat data.

Outputs HTML outside the public tree; capture each card at 1120 × 650 CSS px
and convert the screenshot to WebP in docs/blog/stuck-around-2000-mrr/assets/.
"""
from datetime import datetime, timezone
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'analytics/founder-posts/2026-09-10-2000-mrr'
OUT = DATA / 'charts'
OUT.mkdir(exist_ok=True)
rows = json.loads((DATA / 'mrr-daily.json').read_text())['values']
points = [(datetime.fromtimestamp(r['cohort'], timezone.utc).date(), r['value'], r['incomplete']) for r in rows if r['measure'] == 0]
values = {d.isoformat(): v for d, v, _ in points}
TEAL, ORANGE, FG, MUTED, GRID = '#2a9d90', '#e76e50', '#09090b', '#71717a', '#e4e4e7'

def text(x, y, value, size=16, fill=FG, weight=400, anchor='start'):
    return f'<text x="{x:.2f}" y="{y:.2f}" fill="{fill}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'

def card(title, subtitle, stats, marks, footer):
    stat_html = ''.join(f'<div><b style="color:{color}">{escape(value)}</b><span>{escape(label)}</span></div>' for value, label, color in stats)
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>{escape(title)}</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:{FG}}}.card{{width:1120px;height:650px;border:1px solid {GRID};border-radius:16px;overflow:hidden;position:relative}}header{{padding:30px 32px 0;display:flex;justify-content:space-between;gap:20px;height:125px}}h1{{font-size:23px;letter-spacing:-.5px;margin:0;font-weight:650}}p{{font-size:14px;color:{MUTED};margin:9px 0 0}}.stats{{display:flex;gap:26px;text-align:right}}b{{display:block;font-size:26px;white-space:nowrap;letter-spacing:-.5px}}span{{display:block;font-size:12px;color:{MUTED};margin-top:6px}}svg{{display:block;font-family:inherit}}footer{{position:absolute;bottom:20px;left:32px;right:32px;font-size:12px;color:{MUTED};display:flex;justify-content:space-between}}</style></head><body><main class="card"><header><div><h1>{escape(title)}</h1><p>{escape(subtitle)}</p></div><div class="stats">{stat_html}</div></header><svg width="1120" height="460" viewBox="0 125 1120 460" role="img" aria-label="{escape(title)}">{marks}</svg><footer><div>{escape(footer)}</div><div>gainframe.app</div></footer></main></body></html>'''

left, right, top, bottom = 92, 1010, 174, 523
start, end = points[0][0].toordinal(), points[-1][0].toordinal()
x = lambda d: left + (d.toordinal() - start) / (end - start) * (right - left)
y = lambda v: bottom - v / 2500 * (bottom - top)
marks = []
for v in range(0, 2501, 500):
    marks += [f'<line x1="{left}" y1="{y(v)}" x2="{right}" y2="{y(v)}" stroke="{GRID}" stroke-dasharray="3 3"/>', text(left-15, y(v)+5, f'${v:,}',14,MUTED,anchor='end')]
for iso, label in [('2026-07-12','Jul 12'),('2026-08-01','Aug 1'),('2026-08-22','Aug 22'),('2026-09-10','Sep 10')]:
    d = datetime.fromisoformat(iso).date()
    marks.append(text(x(d),bottom+32,label,14,MUTED,anchor='middle'))
complete = [(d,v) for d,v,partial in points if not partial]
path = 'M ' + ' L '.join(f'{x(d):.2f} {y(v):.2f}' for d,v in complete)
marks += [f'<defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{TEAL}" stop-opacity=".22"/><stop offset="100%" stop-color="{TEAL}" stop-opacity=".02"/></linearGradient></defs>',f'<path d="{path} L {x(complete[-1][0])} {bottom} L {left} {bottom} Z" fill="url(#fill)"/>',f'<path d="{path}" fill="none" stroke="{TEAL}" stroke-width="2.8" stroke-linejoin="round"/>']
for iso, label, dy in [('2026-07-12','$1,004.34',-18),('2026-08-12','$1,926.21',32),('2026-08-22','$2,148.32',-25)]:
    d = datetime.fromisoformat(iso).date(); v=values[iso]
    marks += [f'<circle cx="{x(d)}" cy="{y(v)}" r="5" fill="white" stroke="{TEAL}" stroke-width="2.5"/>', text(x(d)+8,y(v)+dy,label,15,TEAL,600)]
lastd,lastv,_ = points[-1]; prevd,prevv=complete[-1]
marks += [f'<path d="M {x(prevd)} {y(prevv)} L {x(lastd)} {y(lastv)}" stroke="{TEAL}" stroke-width="2.8" stroke-dasharray="3 3"/>',f'<circle cx="{x(lastd)}" cy="{y(lastv)}" r="6" fill="white" stroke="{TEAL}" stroke-width="2.5"/>',text(x(lastd)-3,y(lastv)-22,'$2,208.95',17,TEAL,650,'end')]
(OUT/'mrr-trend.html').write_text(card('MRR is growing more slowly','Daily · RevenueCat · July 12–September 10, 2026',[('$2,208.95','MRR · Sep 10, partial',TEAL),('391','active subscriptions',FG)],''.join(marks),'Daily chart values · The open endpoint is the current, incomplete day.'))

a,b,c=[values[d] for d in ['2026-07-15','2026-08-12','2026-09-09']]
early,recent=round(b-a,2),round(c-b,2)
slow=round((1-recent/early)*100,1)
marks=[]
left,right=286,1010
for v in (0,250,500,750,1000):
    xx=left+v/1000*(right-left)
    marks += [f'<line x1="{xx}" y1="182" x2="{xx}" y2="467" stroke="{GRID}" stroke-dasharray="3 3"/>',text(xx,506,f'${v:,}',14,MUTED,anchor='middle')]
for yy,label,value,color,perday in [(214,'Jul 15 → Aug 12',early,TEAL,early/28),(359,'Aug 12 → Sep 9',recent,ORANGE,recent/28)]:
    width=value/1000*(right-left)
    marks += [text(32,yy+30,label,19,FG,600),text(32,yy+57,'28 days',14,MUTED),f'<rect x="{left}" y="{yy}" width="{width}" height="72" rx="6" fill="{color}" fill-opacity=".9"/>',text(left+width+12,yy+33,f'+${value:,.2f}',20,color,650),text(left+width+12,yy+57,f'${perday:.2f} per day',13,MUTED)]
(OUT/'mrr-added.html').write_text(card('MRR added in two equal periods','RevenueCat · Changes between daily chart values',[(f'{slow}%','less MRR added',ORANGE),('28 days','in each period',FG)],''.join(marks),'MRR increased in both periods · September 10 is excluded because it is incomplete.'))
(DATA/'chart-summary.json').write_text(json.dumps({'mrr_current':lastv,'current_day_incomplete':True,'active_subscriptions':391,'earlier':{'start':'2026-07-15','end':'2026-08-12','start_mrr':a,'end_mrr':b,'added':early},'recent':{'start':'2026-08-12','end':'2026-09-09','start_mrr':b,'end_mrr':c,'added':recent},'less_mrr_added_percent':slow},indent=2)+'\n')
print(f'Created two chart cards in {OUT}')
