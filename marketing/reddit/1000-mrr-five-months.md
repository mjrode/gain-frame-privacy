# Reddit post — $1k MRR five months

**Target subs:** r/SideProject, r/iOSProgramming, r/EntrepreneurRideAlong
**Attach image:** `docs/blog/1000-mrr-five-months/assets/mrr-journey.webp` (the MRR journey chart) where the sub allows image+text.

**Title options:**

1. My iOS app hit $1,000 MRR today, five months after the first commit. The full timeline with real numbers. *(r/SideProject, r/EntrepreneurRideAlong)*
2. First commit Feb 11, $1,000 MRR Jul 12. Every milestone, including the five flat weeks where I almost quit. *(r/iOSProgramming)*
3. $0 to $1,000 MRR in five months with a day job and a newborn. Real numbers, including the $5,674 I wasted. *(r/EntrepreneurRideAlong)*

---

My fitness app ([GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), AI analysis of gym progress photos) crossed $1,000 MRR this morning — $1,000.04, which feels appropriately ridiculous. First commit was February 11, five months ago. I have a full-time job and a baby at home, and my first app flopped so hard it's no longer on the App Store. Here's the whole timeline with real numbers, since these posts were what I read obsessively when I was starting.

**The timeline:**

| Milestone | When | Time from previous |
|---|---|---|
| First commit | Feb 11 | — |
| v1.0 on TestFlight | Feb 23 | 12 days (737 commits) |
| App Store launch | Mar 8 | ~$250 in subs on day one |
| $100 MRR | week of Mar 29 | 3 weeks |
| $250 MRR | week of Apr 19 | 3 weeks |
| $500 MRR | week of May 10 | 3 weeks |
| $750 MRR | week of Jun 21 | **6 weeks** |
| $1,000 MRR | Jul 12 | 3 weeks |

That one 6-week gap is most of the story.

**What made the launch work.** The idea sat in my head for a year. When I finally built it, I recruited 100+ TestFlight testers from Reddit first (mostly the Hevy community) — I never promoted the app, just posted my own progress-photo screenshots in fitness subs and people asked what made them. About 25 testers were seriously active with bug reports and feature requests. Launch day did $250 in subscriptions and every single buyer was someone I'd been trading TestFlight messages with. My first app launched to silence, so I can't overstate the difference.

**The part where I wasted $5,674.** Every piece of app marketing content says paid ads are how you get to the next level, so I tested it myself across TikTok, Apple Search Ads, and Reddit. MRR was climbing the whole time, which made it easy to believe it was working. It wasn't — I was paying about **$114 per customer worth $18**, and the trial cohorts ads brought in converted as low as 7.7%. Turned it all off mid-May.

**The plateau.** May 17 to June 14: MRR went $605 → $685. Five weeks to gain $80 after months of gaining $80 a week. I fully thought I was done and briefly wondered if I needed a new idea. Instead I shipped 528 commits improving what existed, starting with my broken analytics — my own tracking had logged 10 trial conversions in 120 days while RevenueCat had counted ~48.

**The fix was the trial, not the traffic.** With working data I found trial→paid was **20.7%** against a [39.9% industry median](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/). What I changed: re-gated two Pro features I'd accidentally made free, A/B tested a paywall showing $3.33/mo instead of $39.99/yr (same price), put real previews of the paid features into onboarding, and shipped camera-roll import so trial users see months of progress before the paywall. Last four cohorts: blended **44%** (46 of 104 trials). The final $250 of MRR took three weeks with $0 ad spend.

**The caveats, because these matter more than the wins:**

- $1,000.04 is a four-cent margin on an unfinished week. I may be back under it tomorrow.
- Part of the conversion recovery is just that killing ads returned my trial pool to high-intent organic users. I can't cleanly attribute the rest, and the cohorts are small (24–30 trials/week).
- Churn ticked up (4.76% weekly vs 3.59% baseline) as bigger cohorts hit first renewals.
- "Five months" undersells it: the idea gestated a year and my first app's failure was paid tuition. From true zero this is closer to a two-year timeline with a five-month sprint at the end.

Revenue is public on [RevenueCat's verified page](https://verified.revenuecat.com/gainframe) so nobody has to take my word for it.

The thing I'd tell someone starting their first app: for a long time nobody around you will fully get what you're building, and that's not a signal to stop. Keep taking their feedback — they're often right about details even when they don't share the vision — and keep going until the results make the argument for you. Somewhere around $1,000 people stopped needing the explanation.

Happy to answer anything about the numbers.

Full write-up with the charts: https://gainframe.app/blog/1000-mrr-five-months/?utm_source=reddit&utm_medium=social&utm_campaign=1000-mrr-five-months
