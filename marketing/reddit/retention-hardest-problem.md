# Reddit post — retention (companion to /blog/retention-hardest-problem/)

**Suggested image:** attach `docs/blog/retention-hardest-problem/assets/w1-cohorts.webp` where the sub allows image+text.

**Title options:**
- r/SideProject / r/indiehackers: **Three of every four people who install my app never come back. Six weeks of retention work, with the cohort data.**
- r/iOSProgramming: **Week-1 retention went 20% → 27% after six weeks of features. Week-4 didn't move at all.**

**Note:** stagger this at least a few days after the AI-margin post from the same account.

---

My iOS app ([GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), AI progress-photo analysis) crossed $1,000 MRR this month, trial conversion is fixed, organic traffic is growing — and retention is the problem none of that touches. It's the hardest thing I've worked on in six months of building, and I'm posting the mid-problem version because that's the post I can never find when I search for other people's retention stories.

**The numbers:** in June, 27.0% of installers came back at some point in their first week. That's the improved figure — May's cohorts ran 20.1% blended. Week 4 is 8–12% and has not moved all spring, no matter what I shipped.

| Install cohort | Installs | W1 % | W4 % |
|---|---|---|---|
| May 4 | 348 | **17.8%** | 7.8% |
| May 11 | 309 | 18.1% | 8.4% |
| May 25 | 105 | 28.6% | 12.4% |
| Jun 8 | 200 | 24.5% | 8.5% |
| Jun 15 | 178 | 28.7% | 8.4% |
| Jun 22 | 200 | **34.5%** | too young |
| Jun 29 | 301 | 24.6% | too young |

**Why it's structurally hard for this app:** the product's whole value is longitudinal. The more check-ins you feed it, the richer the analysis gets — trends against your own history, a coach with real context. A user on day two has one photo and one score; the thing that makes people stay literally doesn't exist yet for them, because there's no data to compound. So users need to keep coming back for the app to become worth coming back to. I have not cracked that loop, and everything below is an attempt at bridging it.

**What I shipped in the six weeks:**

**A daily read on the home screen (Jun 8).** A short AI note built from your recent data that works on non-photo days — exactly where new users fall off. Shown 248 times its first week, 2,407 times a week three weeks later. Biggest single correlate of the W1 lift.

**A redesigned home screen (Jun 11).** A docked "today" slot with a weekday strip instead of a generic take-a-photo button, so day 2 looks like a continuation of day 1.

**A notification overhaul (late June).** Audited every notification, rebuilt them around insights the coach noticed in your data. The old set was mostly check-in reminders, which I suspect read as nagging.

**The caveats:**

- Part of the lift is traffic mix. The 17.8/18.1% floor weeks were paid-ad-heavy (I was [burning money on ads](https://gainframe.app/blog/spent-5k-on-app-ads/?utm_source=reddit&utm_medium=social&utm_campaign=retention-hardest-problem) then); bought installs retained 17–21% vs 27–30% organic. Organic-to-organic the honest claim is +5–8 points, best cohort 34.5%.
- W4 hasn't moved. This is the number that decides whether any of it mattered. The June cohorts are still too young there; I'll report back either way.
- Cohorts bounce — the 34.5% week was followed by 24.6% (bigger cohort, heavier web-traffic mix). One great bar is a range, and treating it as the new baseline would be lying to myself.
- Nothing was A/B tested against a holdout. Coach users retain W1 at 58–81%, but that's selection bias — motivated people open the coach.

Weekly actives went 281 → 593 over the same stretch, so the app is unambiguously more used. Whether it retains better in a way that lasts to week 4 — ask me in a month.

Revenue is public on [RevenueCat's verified page](https://verified.revenuecat.com/gainframe).

Full write-up with the cohort chart and screenshots of what shipped: https://gainframe.app/blog/retention-hardest-problem/?utm_source=reddit&utm_medium=social&utm_campaign=retention-hardest-problem

If you've genuinely moved week-4 retention on a consumer health/fitness app, I want to hear what did it. I'll trade every number I have.
