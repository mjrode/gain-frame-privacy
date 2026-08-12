# Reddit post: first-1000-mrr-next-920

**Target subs:** r/GainFrame, r/SideProject, r/EntrepreneurRideAlong, r/SaaS (adjust the opening for each community)

**Title options:**

1. My app is at $1,920 MRR. The first $1K took 126 days, the next $920 took 31.
2. Free-tool clicks grew 827% while my app went from $1,000 to $1,920 MRR.
3. Three new free tools and 424 internal links helped my app add $920 MRR in 31 days.

**Attach:** `docs/blog/first-1000-mrr-next-920/assets/tool-clicks-by-week.webp`

---

RevenueCat shows **$1,920.18 MRR** and **330 active subscriptions** for my app this morning.

The app is [GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), an iOS progress-photo and AI body-composition tracker for lifters.

I crossed $1,000.04 MRR on July 12. GainFrame launched on March 8, so the first $1,000 took 126 days. The next $920.14 took 31.

The daily pace looks like this:

| Window | MRR added | Days | MRR added per day |
|---|---:|---:|---:|
| Launch to July 12 | $1,000.04 | 126 | $7.94 |
| July 12 to August 12 | $920.14 | 31 | $29.68 |

That is about 3.7 times faster per day. The pace will not stay smooth. Annual subscriptions, churn, and renewal timing all move the daily number.

The biggest change during the second leg was the free tools. I shipped three new ones, improved the pages already ranking, and added 424 internal links.

I compared the 30 days before the $1,000 milestone with the 30 days after it in Google Search Console. The last two days are fresh data and may shift slightly.

| Search Console | Jun 13 to Jul 12 | Jul 13 to Aug 11 | Change |
|---|---:|---:|---:|
| Site clicks | 2,620 | 8,671 | +231% |
| Site impressions | 108,568 | 468,201 | +331% |
| Free-tool clicks | 302 | 2,799 | **+827%** |
| Free-tool impressions | 3,968 | 24,859 | **+527%** |
| Tools' share of site clicks | 11.5% | 32.3% | +20.8 points |

Nearly one in three organic clicks now lands on a free tool, up from roughly one in nine.

I added three tools during the second window:

- AI Body Transformation on July 18
- AI Physique Rater on July 23
- Body Visualizer on August 6

The directory went from 11 tools to 14. Roughly **76% of the added tool clicks came from pages that already existed** when I crossed $1K.

The biggest page changes:

| Tool page | Prior 30d clicks | Next 30d clicks |
|---|---:|---:|
| Body fat from photo | 206 | **1,486** |
| Physique rater | 0 | **538** |
| Body fat visualizer | 12 | **480** |
| Tools directory | 79 | **222** |

The Physique Rater is the breakout. It reached 538 clicks, 2,234 impressions, 24.1% CTR, and average position 3.92. I launched it with about three inbound pages, expanded that to 23 through related tools and relevant posts, then rewrote the copy around the searches people were using.

Traffic started taking off around July 31. I think the links and query rewrite helped.

The existing body-fat photo tool did even more work. It grew from 206 to 1,486 clicks while CTR stayed almost flat at 10.5% to 10.9%. Impressions rose from 1,956 to 13,662 and average position improved from 7.63 to 5.87. The page started showing up far more often and ranking higher.

The Git history for the month is a mix of new pages and less exciting cleanup:

- Rebuilt the photo estimator result funnel so one clear next step replaced four competing blocks.
- Added and interlinked the Physique Rater across sibling tools and relevant blog posts.
- Fixed a duplicate position in the tools directory schema, then reordered the hub around real landing traffic.
- Rewrote tools around the searches people used instead of the terms I assumed they used.
- Grew the site from 929 to 1,353 internal links.
- Reduced orphan pages from 46 to 7.
- Shipped Body Visualizer from a search opportunity, then left it alone until it has 28 days of data.

The classic calculators barely moved. TDEE, macros, FFMI, calorie deficit, calories burned, one-rep max, and strength standards combined for only a handful of clicks. Four pages generated 97% of tool traffic. I care less about the directory count now.

GA4 organic tool sessions went from 290 to 2,807, and engaged tool sessions went from 239 to 2,266. The tools were doing real distribution work for the app by then.

PostHog is missing the website events that connect a tool result to an App Store click and then a subscription. My guess is that the tools helped a lot. TikTok, Reddit, product changes, and older trials were active during the same month too.

The current MRR is public on [RevenueCat's verified page](https://verified.revenuecat.com/gainframe). I am still $79.82 short of $2K, so I am not rounding the milestone up early.

Full write-up with four charts and the commit timeline: https://gainframe.app/blog/first-1000-mrr-next-920/?utm_source=reddit&utm_medium=social&utm_campaign=founder-story-1920-mrr
