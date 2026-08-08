# Reddit post — seo-weekly-audit-loop

**Target subs:** r/SideProject, r/EntrepreneurRideAlong, r/iOSProgramming (adjust title per sub)

**Title options:**

1. My $1,591 MRR app went from 2,153 to 7,205 organic clicks a month. The SEO runs as a weekly audit loop now.
2. My $1,591 MRR app's SEO runs as a written audit loop a coding agent executes. Organic clicks tripled in a month (2,153 → 7,205).
3. (r/iOSProgramming) My iOS app is at $1,591 MRR and organic search clicks tripled last month. The process, with numbers.

**Attach:** `docs/blog/seo-weekly-audit-loop/assets/daily-clicks.webp` (the daily clicks chart) where the sub allows image+text.

---

A month ago I posted about growing my app's organic traffic 15x after killing paid ads. Since then it tripled again. Last time I mostly shared the numbers, this time I'm sharing the process, because the process changed a lot.

The app is [GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), an AI body-composition tracker for lifters. All numbers below are Google Search Console and DataForSEO, through Aug 6.

**The numbers:**

| | Prior 28 days | Last 28 days |
|---|---|---|
| Organic clicks | 2,153 | **7,205** |
| Impressions | 86,078 | **381,564** |
| Avg position | 9.7 | **8.4** |

Record day is 400 clicks (Aug 4). Branded searches are ~9.6% of clicks and I exclude them before judging any of this, because they're really TikTok/Reddit traffic taking a detour through Google.

**How it works now.** My SEO runs as a written audit loop that a coding agent (Claude Code) executes. Every step, data source, and past mistake is in one procedure file. A run takes the agent about 20 minutes; reading its proposal takes me five. Six steps:

**Pull Search Console first.** What earned clicks, what sits at positions 5–20 with impressions, what Google crawled but declined to index. This 28 days vs last.

**Score every candidate keyword against real market data.** DataForSEO gives actual volume, difficulty, intent, and the 12-month trend. This one step killed half my content ideas.

**Audit the site itself.** A local script walks all 232 posts for orphan pages, near-duplicate titles, and broken links.

**Propose with evidence.** Numbered posts and fixes, each with the query, impressions, position, volume, trend attached. If a candidate has no evidence behind it, it doesn't make the list.

**I approve a subset.** I reply "posts 1,3, fixes all." That's my whole job in the loop.

**Ship and record.** Every run writes an audit file plus a rolling strategy doc the next run reads first, so it never re-derives last month's conclusions.

**What the data changed:**

- **My clicks and impressions come from different pages.** Tool pages and roundups convert (best page: 25.9% CTR at position 4.1). My stats pages get tens of thousands of impressions at 0.4–0.6% CTR — one sits at position 6.7 and converts 0.49%, because the SERP answers "average chest size" without a click. I stopped writing those.
- **Some of my keywords were dying underneath me.** "Body fat percentage chart" still gets 14,800 searches/mo but is down 45% year over year. "Average bicep size" is down 66%. I had an 11-post cluster on declining zero-click keywords. Froze it. The one lane growing (+85% to +108% yearly) got the investment instead, and its tool page is now my best converter.
- **Occasionally it finds something genuinely open.** "Body visualizer": 40,500 searches/mo, +22%/yr, keyword difficulty 4–8, SERP held by a research demo and thin tool sites. Shipped a free tool Aug 6, indexed in under a day. No ranking verdict until the 28-day window closes Sep 3 — the loop's own rule.

**Four times it caught me about to do something dumb:**

- The duplicate detector flagged two posts as 74% similar and the obvious move was merging them. The mandatory query check showed they shared **zero** search queries. Merging would have deleted a page pulling 24,673 impressions/mo.
- I approved writing a post that already existed — published 3 weeks earlier by a parallel session. A mechanical existence check now runs on every candidate, because my memory stopped being reliable around post 150.
- My IndexNow pings had been silently rejected with a 403 **since April**. The auth key file lived in a folder that stopped being deployed. Nothing errored loudly; a CSV nobody read logged the failures.
- A curiosity-style title test lost cleanly (0.52% CTR vs ~0.7–1.0% baseline over a defined 10-day window) and got reverted instead of living forever as a zombie experiment.

Every one of those became a written rule in the procedure the same day. 13 rules so far. I don't have to remember any of them twice, and neither does the agent.

I also published about 130 posts in July (AI-drafted, human-reviewed), so volume is confounded with process and I can't split their contributions. Sitewide CTR is falling as impressions scale (2.5% → 1.9%), which is expected, but I watch it. And I can't cleanly attribute revenue to SEO — TikTok and Reddit are running too. MRR is $1,591 with 302 active subs, verifiable on [RevenueCat's public page](https://verified.revenuecat.com/gainframe).

Full write-up with the charts: https://gainframe.app/blog/seo-weekly-audit-loop/?utm_source=reddit&utm_medium=social&utm_campaign=seo-weekly-audit-loop

Happy to answer anything about the loop, the data sources, or what I'd skip.
