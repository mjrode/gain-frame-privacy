# Reddit post — trial-conversion-21-to-44

Title options (pick per subreddit):

1. Trial conversion went from 21% to 44% in five weeks, with $0 ad spend
2. My trial→paid was 21% vs a 40% industry median. Five weeks later it's 44%.
3. Fixed my trial conversion (21% → 44%) and just passed $900 MRR  _(milestone framing — best for r/appledevelopers)_

Attach `weekly-cohorts.webp` as the post image where the sub allows image+text.

---

Body:

Quick build-in-public update on my [iOS fitness app](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082).

In late May the worst metric in the business was trial→paid conversion: **20.7%** blended, against a 39.9% Health & Fitness median ([RevenueCat's benchmark data](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/)). April cohorts were as low as 7.7% — thirteen trials, one payer.

I spent June fixing it. The last four fully-resolved weekly cohorts converted at 37.5% / 37.5% / 57.7% / 43.3% — **blended 44%**, 46 of 104 trials.

**What I changed, roughly in order:**

**Put the Pro features back behind the paywall.** While building fast I'd accidentally made two Pro features free and never noticed — free users were getting a recovery dashboard and a weekly summary for nothing. If the free tier already gives you the good stuff, the trial has nothing to sell.

**A/B tested a new paywall.** My old paywall mostly explained how the 7-day trial works. The new one leads with what you get when you upgrade, and shows the yearly plan as **$3.33/mo** instead of $39.99/year. Same price, different frame. So far the new one gets 30.1% of viewers to start a trial vs 24.1% for the old one — 88.9% chance to win, *not* significant yet, deciding end of July.

**Dug into who pays.** (After fixing my broken conversion tracking — my analytics had been missing ~80% of real conversions, which is its own story.) The finding that mattered: the more photos someone has in the app, the more likely they start a trial. **0.7% → 63%** as photos go from zero to 16–40. Zero photos, basically zero conversions: 7 of 676.

**Built camera-roll import to act on that.** It finds up to ten years of old progress photos and scores them in one shot, so trial users now hit the paywall with months of visible progress instead of one day-one photo.

The same data pass also found I'd **deleted my own biggest paywall** in an April commit — the welcome paywall on first launch — and never noticed. Paywall exposure among new users had fallen 38% → 21%. Most embarrassing find of the month.

**The numbers:**

| Metric | Late May | Now |
|---|---|---|
| Trial→paid | 20.7% | **44%** last 4 resolved cohorts (46/104) |
| Paywall view → trial | 13% | 23.5% |
| Install → paying in 7d | 5.2% | 10.0% |
| MRR | $634 | **$925** |
| Active subs | 122 | 198 |
| Ad spend | $0 | $0 |

**The caveats, because these matter more than the wins:**

- I can't cleanly attribute the improvement to any single change. It started in the May 31 cohort, before some of the changes even shipped, and the biggest factor is probably that I killed paid ads in mid-May — trials reverted to high-intent organic users, and my March organic cohorts already converted at 28–43% before I touched anything.
- Cohorts are small (24–30 trials/week). That's why I quote the 4-cohort blend and not my best week (57.7%, would be a nicer headline and a worse claim).
- The paywall A/B isn't significant yet. 88.9% chance-to-win is promising, not a result.
- Onboarding abandonment didn't move at all — still ~42% despite a targeted experiment. Biggest leak left.

Revenue is verifiable here if you think I'm making it up: https://verified.revenuecat.com/gainframe

Happy to answer anything about the paywall test, the re-gating, or what I'd do differently.

Full write-up with the cohort-by-cohort charts: https://gainframe.app/blog/trial-conversion-21-to-44/?utm_source=reddit&utm_medium=social&utm_campaign=trial-conversion-21-to-44
