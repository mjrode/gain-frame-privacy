# Reddit post: first-1000-mrr-next-920

**Target subs:** r/GainFrame, r/SideProject, r/EntrepreneurRideAlong, r/SaaS (adjust the opening for each community)

**Title options:**

1. My app is at $1,920 MRR. The first $1K took 126 days, the next $920 took 31.
2. $1,920 MRR and a 739% jump in organic clicks to free tools. Here is what I changed.
3. I grew my iOS app from $1,000 to $1,920 MRR in 31 days. The free-tool traffic surprised me most.

**Attach:** `docs/blog/first-1000-mrr-next-920/assets/mrr-acceleration.webp`

---

RevenueCat shows **$1,920.18 MRR** and **330 active subscriptions** for my app this morning.

The app is [GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), an iOS progress-photo and AI body-composition tracker for lifters.

I crossed $1,000.04 MRR on July 12. GainFrame launched on March 8, so the first $1,000 took 126 days. The next $920.14 took 31.

The daily pace looks like this:

| Window | MRR added | Days | MRR added per day |
|---|---:|---:|---:|
| Launch to July 12 | $1,000.04 | 126 | $7.94 |
| July 12 to August 12 | $920.14 | 31 | $29.68 |

That is about 3.7 times faster per day. MRR is uneven, so I do not treat this as a straight growth rate. Annual subscriptions, churn, and renewal timing all move the daily number.

The interesting part for me is what happened to the free web tools during the same period.

I compared the 28 days immediately before the $1,000 milestone with the next 28 days in Google Search Console:

| Search Console | Jun 15 to Jul 12 | Jul 13 to Aug 9 | Change |
|---|---:|---:|---:|
| Site clicks | 2,557 | 7,902 | +209% |
| Site impressions | 105,530 | 422,057 | +300% |
| Free-tool clicks | 298 | 2,499 | **+739%** |
| Free-tool impressions | 3,866 | 22,552 | **+483%** |
| Tools' share of site clicks | 11.7% | 31.6% | +19.9 points |

Nearly one in three organic clicks now lands on a free tool, up from roughly one in nine.

I added three tools during the second window:

- AI Body Transformation on July 18
- AI Physique Rater on July 23
- Body Visualizer on August 6

The directory went from 11 tools to 14. The surprising result is that roughly **79% of the added tool clicks came from pages that already existed** when I crossed $1K.

The biggest page changes:

| Tool page | Prior 28d clicks | Next 28d clicks |
|---|---:|---:|
| Body fat from photo | 203 | **1,376** |
| Body fat visualizer | 12 | **446** |
| Physique rater | 0 | **419** |
| Tools directory | 78 | **203** |

The Physique Rater is the breakout. It reached 419 clicks, 1,767 impressions, 23.7% CTR, and average position 4.04. I launched it with about three inbound pages, expanded that to 23 through related tools and relevant posts, then retargeted the copy around the query family Search Console showed me.

Traffic broke out around July 31. The timing lines up with those changes, but I cannot prove the links or retargeting caused it.

The existing body-fat photo tool did even more work. It grew from 203 to 1,376 clicks while CTR stayed almost flat at 10.6% to 10.8%. Impressions rose from 1,910 to 12,756 and average position improved from 7.58 to 5.87. That looks like wider visibility and a ranking gain, not a headline trick.

The Git history for the month is a mix of new pages and less exciting cleanup:

- Rebuilt the photo estimator result funnel so one clear next step replaced four competing blocks.
- Added and interlinked the Physique Rater across sibling tools and relevant blog posts.
- Fixed a duplicate position in the tools directory schema, then reordered the hub around real landing traffic.
- Retargeted tools using Search Console query data instead of the terms I assumed people used.
- Grew the local content graph from 929 to 1,353 internal links.
- Reduced orphan pages from 46 to 7.
- Shipped Body Visualizer from a query opportunity, then left it alone until its 28-day window closes.

The classic calculators barely moved. TDEE, macros, FFMI, calorie deficit, calories burned, one-rep max, and strength standards combined for only a handful of clicks. Four pages generated 98% of tool traffic. I care less about the directory count now.

The biggest caveat is attribution. The correct PostHog website project has no recent events, so I cannot join a tool result or App Store click to a subscription. GA4 shows organic sessions grew from 2,928 to 8,765, but sessions are not paid customers. TikTok, Reddit, product changes, trial conversion, and older cohorts all overlap this window.

I can verify the timing and the search growth. I cannot honestly assign a portion of the $920.14 to SEO yet.

The current MRR is public on [RevenueCat's verified page](https://verified.revenuecat.com/gainframe). I am still $79.82 short of $2K, so I am not rounding the milestone up early.

Full write-up with four charts and the commit timeline: https://gainframe.app/blog/first-1000-mrr-next-920/?utm_source=reddit&utm_medium=social&utm_campaign=founder-story-1920-mrr
