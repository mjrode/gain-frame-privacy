# Reddit post — AI margin (companion to /blog/ai-costs-half-my-revenue/)

**Suggested image:** attach `docs/blog/ai-costs-half-my-revenue/assets/cost-vs-revenue.webp` where the sub allows image+text.

**Title options** (lead with the MRR/revenue figure — it pulls clicks):
- r/SideProject / r/indiehackers: **My $1,096 MRR app was spending half its revenue on AI. Four weeks later it's 17%.**
- r/iOSProgramming: **Tagging every Gemini call by feature cut my $1K MRR app's AI cost per user from $0.38 to $0.16**

---

Quick build-in-public update on my iOS app ([GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), AI progress-photo analysis). In mid-June I found out my Gemini bill for one week was $237.14 against $488.36 of gross revenue that same week. 48.6%. Nearly half of what the app earned went straight back out to Google.

That scared me. Every feature people pay for runs on the model — photo scoring, the coach, weekly summaries — so the bill scales with exactly the thing I'm trying to grow. Four weeks later the bill was $160 against $956 of revenue, 16.7%. Here's what I did, since I never see real numbers on this.

**The numbers:**

| Week of | Gemini bill | Users touching AI | Cost per AI user | Revenue | AI % of revenue |
|---|---|---|---|---|---|
| Jun 14 | **$237.14** | 618 | $0.38 | $488.36 | **48.6%** |
| Jun 21 | $142.29 | 697 | $0.20 | $879.99 | 16.2% |
| Jun 28 | $173.87 | 867 | $0.20 | $758.48 | 22.9% |
| Jul 5 | $160.04 | 1,031 | **$0.16** | $955.63 | **16.7%** |

Users touching an AI feature grew from 618 to 1,031 a week over that span while the bill went down.

**What I changed, roughly in order:**

**Instrumented before optimizing.** Until June 8 I had no idea which feature the money went to. PostHog logs every model call as an `$ai_generation` event with a cost estimate; I added one `gen_flow` property tagging each call with its feature. One afternoon of work, and every fix below started as a line item I could suddenly see.

**Put the coach on a prompt diet.** Restructured how conversation context gets assembled — input tokens on that flow down 37%. Before deploying I replayed real conversations through old and new prompts to check quality didn't drop. Coach usage grew about 12x since April; its cost held near flat.

**Moved camera-roll imports to the Batch API.** Bulk-scoring someone's photo history is bursty and doesn't need realtime pricing. Batch is 50% off and async. $38/wk on that flow became about $2.

**Stopped regenerating things nobody looks at.** The coach's three suggested starter questions were being regenerated on basically every screen visit. Cached them: $15.62/wk at peak, $0.96 last week. Nobody noticed.

**Capped free usage, never paid.** Trial and promo users get 15 coach messages/day. A tiny group of non-payers was treating it as free unlimited ChatGPT. Paying subscribers are never capped.

**The caveats:**

- Half the ratio improvement is the denominator. Revenue roughly doubled ($488 → $956/wk) while cost fell about a third. Cost work alone would have gotten me to ~33%, growth did the rest.
- These are PostHog list-price estimates — an upper bound. They don't reflect the Batch discount or context caching, so the true Google invoice is somewhat lower. I haven't reconciled it against billing, so I'm not quoting an invoice figure.
- The $237 week was partly self-inflicted: $86.87 of it was a backfill job I ran that same week.
- After Apple's 15% cut, the Jul 5 week is 19.7% of proceeds. Every ratio here looks worse on money I keep.

Revenue numbers are public on [RevenueCat's verified page](https://verified.revenuecat.com/gainframe) if you want to check.

Full write-up with the charts and the per-feature cost table: https://gainframe.app/blog/ai-costs-half-my-revenue/?utm_source=reddit&utm_medium=social&utm_campaign=ai-costs-half-my-revenue

Happy to answer questions on any of it — the replay harness, the cap, caching, whatever's useful.
