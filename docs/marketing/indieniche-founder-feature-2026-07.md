# IndieNiche Founder Feature — Draft Answers (Jul 12, 2026)

Sources: 1000-mrr-five-months, two-months-launching-second-app, ios-app-playbook-2026, trial-conversion-21-to-44, spent-5k-on-app-ads, organic-traffic-15x-90-days, generative-engine-optimization-case-study, my-app-has-copycats-now, live GA4 (9,280 users / 10,817 sessions last 30d), and live Supabase demographics (2,052 profiles with age/gender: 81% male, median age 26, 50% aged 18–34).

---

## Q1 — Who are you? What product? Target audience (age range)?

I'm Michael Rode, a software engineer with about 15 years of experience and a lifelong gym-goer. I'm building GainFrame, an iOS app that turns your gym progress photos into feedback: an AI body fat estimate, a physique score, a muscle-group breakdown of what changed between two photos, and a coach that explains it using your photos, weight, and workout data together.

The audience is people who lift and take progress photos. From the app's own onboarding data it's about 80% men, and half of all users are between 18 and 34 — the median age is 26, with a long tail into the 40s and 50s.

*Images: q1-gainframe-muscle-compare.png, q1-gainframe-photo-compare.png*

---

## Q2 — Backstory, where the idea came from, what year you started

The idea sat in my head for about a year before I wrote any code. I'd been going to the gym on and off for years and had hundreds of progress photos scattered across my camera roll. Every time I wanted to compare my physique to a month or a year ago, finding the right photos took forever, and the old ones had no context — no weight, no body fat estimate, no idea what my training looked like at the time. The mirror and the scale each tell you something but they miss a lot. I assumed an app already existed that put the photo, the weight, the body fat, and the workout context in one comparison. I couldn't find one.

The other half of the backstory is that GainFrame is my second app. My first one, Screenshot Swipe, did 432 downloads and $57 in lifetime proceeds and no longer shows up in App Store search, even if you type the full name. I built it in a vacuum, did zero marketing, and assumed users would find it. They didn't. The lesson I took from that was to get feedback from real users early and often and let it drive development, and that's the lesson GainFrame is built on.

First commit was February 11, 2026. The app went live on the App Store on March 8, 2026.

*Image: q2-screenshot-swipe-432-downloads.png*

---

## Q3 — Building the first version / MVP

The build itself was a sprint: 737 commits between February 11 and February 23, when v1.0.0 went to TestFlight. Twelve days from first commit to a beta in people's hands. I could move that fast partly because the idea had a year of thinking behind it and partly because I kept the MVP scope to the actual core: two photos side by side with context attached.

The more important part was what happened before the public launch. I recruited beta testers from Reddit, mostly the Hevy community, with a tactic I'd recommend to anyone: I didn't promote the app. I posted my own progress-photo screenshots in fitness subreddits, and people asked in the comments what app made them. About 150 people joined the mailing list, around 100 downloaded the TestFlight build, roughly 30 gave feedback, and 5–10 became genuine power users I was messaging with daily. There was no dramatic pivot from that feedback — it was dozens of small changes to onboarding, UI, and feature priority that together made the launch version feel like it had already been through a real-world filter.

Two weeks of that shaped the app more than the previous year of thinking about it. Launch day did about $250 in subscriptions, and every one of those first buyers was someone I already knew from TestFlight.

*Image: q3-app-store-connect-20-days-post-launch.png*

---

## Q4 — Employees / co-founders, monthly traffic, first customers, current free/paid counts

It's just me. No co-founders, no employees. I have a full-time job as a software engineer and a baby at home, so GainFrame gets early mornings and whatever hours I can find. Every department a normal app company would hire for is either a service I pay for or a Claude Code automation I wrote.

Traffic: the website did about 9,300 visitors and 10,800 sessions in the last 30 days. Organic search grew from about 7 clicks a day to about 100 a day over 90 days after I killed my ads, and ChatGPT referrals became my single biggest acquisition source at 31% of app signups — bigger than TikTok, Google, or App Store browse.

My first paying customers came on launch day, March 8 — all of them TestFlight testers I'd been trading messages with for two weeks. Current numbers: 203 active paid subscriptions, around 30 trials in flight at any time, and 1,103 new app users in the last 28 days. All the revenue is public on RevenueCat's verified page (verified.revenuecat.com/gainframe) if anyone wants to check.

*Images: q4-revenuecat-overview-dashboard.png, q4-google-search-console-3-months.png*

---

## Q5 — What has worked to attract customers

In order of when each one mattered:

**Reddit screenshots, no promotion.** Posting my own progress photos made with the app in fitness subreddits and letting people ask what app it was. That got the first 100+ users and the entire beta group. It stops scaling fast — people will only tolerate so many progress pictures before it feels spammy — but as a zero-to-first-users channel it was the best thing I did.

**SEO, specifically comparison and roundup posts.** After I killed paid ads I went all-in on the blog. Informational posts pile up impressions; the posts that pull actual users are roundups and "X vs Y" comparisons, because those readers are already shopping. I was hesitant to rank competitors honestly at first, including the ones better than me, but readers and Google both smell a thinly veiled ad, and doing it honestly forced me to use my competitors' apps and find where they were beating me.

**ChatGPT / AI answers.** The same content got GainFrame cited by ChatGPT, which is now 31% of signups. I wrote up the five structural changes that got us cited in a GEO case study on the blog.

**TikTok organic.** Slower burn, but it drives real installs now and sponsorship experiments there have spiked traffic 15–20x for a day.

**What didn't work: paid ads.** I spent $5,674 across TikTok, Apple Search Ads, and Reddit. The climbing MRR made it easy to believe it was working. It wasn't — I was paying about $114 to acquire customers worth $18, and ad-sourced trials converted as low as 7.7%. I turned everything off in mid-May and MRR grew from $634 to $1,000 after that with $0 of spend behind it.

*Images: q5-organic-clicks-15x-90-days.png, q5-chatgpt-31-percent-attribution.png, q5-paid-ads-cac-vs-ltv.png*

---

## Q6 — Current performance, metrics/revenue, future plans

GainFrame crossed $1,000 MRR this morning — $1,000.04, five months and a day after the first commit. The milestones: $100 MRR the week of March 29, $250 April 19, $500 May 10, then five flat weeks after I turned the ads off (May 17 to June 14 MRR went $605 to $685, and I honestly wondered if I needed a new idea), then $750 June 21 and $1,000 on July 12.

What got it moving again was fixing trial conversion. Mine was 20.7% against a 39.9% industry median for Health & Fitness. I put two Pro features back behind the paywall that I'd accidentally made free, A/B tested showing the yearly plan as $3.33/month instead of $39.99/year, put previews of the three best Pro features into onboarding, and shipped camera-roll import so trial users hit the paywall with months of visible progress instead of one photo. The last four cohorts converted at a blended 44%. Honest caveat: part of that recovery is that killing ads returned my trial pool to high-intent organic users, and the cohorts are small.

Plans: keep the organic engines running (45 blog posts shipped in the first eleven days of July), build an Android version, and if the July cohorts hold, run one small capped Apple Search Ads re-test in August now that the funnel might be strong enough to pay for the click.

*Images: q6-mrr-journey-to-1000.png, q6-weeks-between-mrr-milestones.png, q6-trial-conversion-weekly-cohorts.png*

---

## Q7 — Insights that became a competitive advantage

The biggest one is unglamorous: fix your measurement before you trust it. During the flat weeks I discovered my analytics had logged 10 trial conversions in 120 days while RevenueCat had counted about 48 — my tracking was missing roughly 80% of my own conversions. Every decision I'd made on that data was suspect. Once I could see who paid and why, the real problem (trial conversion) was obvious, and fixing it is what restarted growth. Most founders I talk to are in the same boat and don't know it.

The second is building in public. Publishing real numbers — the flopped first app, the $5,674 of wasted ad spend, the exact conversion rates — is what makes the content spread, gets it cited by ChatGPT, and got me interviewed. It also got me copycats: one competitor cloned 20 of my blog titles in a single day, and another asked for my Claude.md in my own Reddit comments. I keep sharing anyway. The numbers are the moat's toll, and the audience compounds faster than the copying hurts.

Third: as a solo founder with a day job, automation is the head count. Every recurring job — release notes, SEO drafts, TikTok assets, revenue audits — is a Claude Code skill. Some of it is over-engineered for an app making $1,000 a month, I build automation because I like building automation, but it's the only reason one person can run every department.

*Image: q7-copycat-reddit-replies.png*

---

## Q8 — Tools that helped you grow

The app is native SwiftUI with AI analysis on top, pulling in progress photos, body metrics, Apple Health, and workout data (it integrates with Hevy).

- **RevenueCat** for subscriptions, and their verified public revenue page for transparency.
- **PostHog** is the one I'd push hardest. I didn't understand the value of analytics at first; now it drives what I build, what I A/B test, and what I cut. Invest in it earlier than you think you need to.
- **Supabase** for backend data, **Firebase** for crash reporting.
- **TestFlight** — as a growth tool, honestly, per the launch story above.
- **Claude Code** for the automation layer: the entire marketing/content/release pipeline is skills I wrote.
- The site and blog are **Next.js on Cloudflare Pages**, monitored with Search Console and GA4.

I wrote the full stack up, with workflows and costs, in "Every Tool and System Behind My $944 MRR iOS App" on the blog.

*Image: q8-tool-stack-infographic.png*

---

## Q9 — Books, podcasts, resources with the greatest impact

Two podcasts more than anything else. Starter Story, which is founder interviews — the pattern that stuck with me from listening to a lot of those is how many people were on their fifth or tenth product before anything worked. That reframed my first app's flop as tuition instead of a verdict. And Sub Club by RevenueCat, which is the closest thing there is to a playbook for subscription apps — a lot of my thinking on paywalls, trials, and pricing traces back to it, and RevenueCat's benchmark data is where I got the 39.9% trial-conversion median I measured myself against.

Beyond those, most of what I've learned came from other founders' build-in-public posts. Reading real numbers from people a year ahead of me has been worth more than any book, which is a big part of why I publish mine.

---

## Q10 — Advice for entrepreneurs starting out

Don't wait until launch to find users. If you're building an iOS app, TestFlight changes the relationship — people feel like they're part of something instead of being asked to download another app. My beta testers reported bugs, shaped the roadmap, left the early reviews everyone struggles to get, and became the first paying customers on day one.

Set up real analytics before you think you need them, and verify they're right. Mine were silently missing 80% of conversions and I made months of decisions on bad data.

And the one nobody warned me about: for a long time, nobody around you is going to fully get what you're building. I know I was getting on everyone's nerves talking about it constantly. That's normal and it isn't a signal to stop. Keep asking those same people for feedback — they're often right about the details even when they don't share the vision — and keep going until the results make the argument for you. Nobody needed me to explain GainFrame once the chart pointed up and to the right.

---

## Q11 — Hiring?

Not right now. It's a one-person company by design at this stage — the economics are five months old and I'm automating before I'm hiring.

---

## Q12 — Contact info / links

- App: https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082
- Site + blog: https://gainframe.app/blog/
- Reddit: u/kritnc
- TikTok: @gainframe5
- X: @GainFrameApp
- Live revenue: https://verified.revenuecat.com/gainframe and https://trustmrr.com/startup/gainframe
- Email: michaelrode44@gmail.com

---

## Overlap note

This will run close to the "They Move the Needle" interview (same origin story, TestFlight tactic, first-paying-user story). That's normal for founder features, but the strongest differentiator here is that this one has the $1,000 MRR milestone, the flat-weeks confession, and the trial-conversion fix — none of which were in the previous interview. I've weighted the answers toward that newer material.
