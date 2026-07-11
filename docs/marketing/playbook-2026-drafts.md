# Playbook post — drafts + screenshot shot list (2026-07-10)

Source data: `playbook-2026-source.md`. Numbers pulled live from RevenueCat 7/10
(MRR $944, 203 subs, 30 trials, +45%/mo). Re-pull on publish day:
`python3 ~/.claude/skills/revenuecat/scripts/rc.py metrics`

---

## Title options (blog)

1. Every tool and system behind my $944 MRR iOS app
2. One person, six departments: the full stack behind my iOS app
3. My iOS app is 4 months old and does $944 MRR. This is everything I use to run it.

---

## BLOG POST DRAFT

Quick build-in-public update on my iOS app. GainFrame is 4 months old, sitting
at $944 MRR, up 45% in the last month, 203 active subs. It's just me. People
keep asking what tools I use, so this is the whole list, organized the way I
think about it: like departments. Every department a normal app company would
hire for is either a service I pay for or a Claude Code skill I wrote. I'll go
through each one with the actual numbers.

Fair warning that some of this is over-engineered for an app making $944 a
month. I build automation because I like building automation. But most of it
pays for itself in hours saved, and a few pieces are the only reason the app
grows at all.

### The engineering team

The app is SwiftUI + SwiftData, generated with XcodeGen so the Xcode project
file never causes merge pain. On-device AI is Google MLKit (pose detection,
segmentation, face detection) plus Apple Vision. The server side is Supabase:
30 edge functions, including an AI coach that streams Gemini responses and can
call 17 tools against the user's real data (their photos, their scores, their
Hevy workouts, their Strava runs).

Gemini 3.5 Flash runs everything AI in the product. I moved the report
generation off the pro model in May and cut generation time from 40 seconds to
about 12 with no quality complaints. A cron job watches AI spend and yells at
me in Slack if it spikes. Coach costs run about $257 a month right now, which
is my biggest infra line item and the thing I keep trying to shrink.

Claude Code writes most of the code. The repo has a CLAUDE.md that encodes the
architecture rules (navigation patterns, design system, what never to touch),
so every session produces code that looks like the rest of the app. The part
that changed how I work: a skill called verify-on-sim builds the app, installs
it in the simulator, and drives it with taps and swipes to prove the feature
works before I even look at it. A green build tells you it compiles. This
tells you it works.

### The release manager

Shipping used to eat an evening. Now it's one command. `/release` reads the
git log, drafts release notes, bumps the version, tags it, pushes to
TestFlight with fastlane, and syncs App Store metadata in 9 languages.
Screenshots upload per locale and auto-mirror (en-US copies to en-GB and
en-AU, es-ES to es-MX). Code signing is fastlane match so it never breaks on a
new machine.

Work tracking is just GitHub Issues with priority labels. `/issues next` picks
the top one and starts working on it. I resisted a real project management
tool for months and I no longer feel bad about it.

### The content studio

This is the weird one. I post comic carousels on TikTok featuring a mascot
called GainFrame Guy. The pipeline: Gemini's image model draws only the mascot
art on a blank background, then a Python script composites all the text with
Pillow, fixed fonts, fixed positions, fixed red accent. I built it this way
because letting the image model render text meant every slide came out styled
slightly differently and the account looked like a garage sale. Now the art is
AI and the typography is code. About 4 cents a slide, 150+ carousels so far.

The lesson that took me too long: when AI output drifts, stop prompting harder
and move that part into code. AI for the art, Python for the text.

There's a second pipeline that makes "top 5 fitness apps" listicle carousels
using real App Store logos, screenshots and ratings pulled from the iTunes
API. Zero AI images. GainFrame goes in the middle of the list, position 3 or
4, between Strava and Hevy, so it reads like an established peer instead of an
ad. Those posts do better than the ones where I put my own app first, which
stung a little but the numbers don't care.

Also in this department: a promo video I paid a motion designer $49 for after
he cold DMed me on Reddit (it beat my own screen recording, wrote that story
up separately), a founding-creator program that's starting to get inbound
applications, and Resend for the email list and a trainer waitlist.

### The SEO department

The blog has 141 posts and 11 free tools (an AI body-fat photo scanner, a TDEE
calculator, FFMI, one-rep max, that kind of thing). The site is Next.js
statically exported to Cloudflare Pages, so hosting is $0.

The keyword pipeline spends nothing on tools. It pulls Google autocomplete,
looks at what's ranking in the SERP, and reads my own Search Console data over
MCP, then appends scored ideas to a backlog file. A generator skill drafts the
post, I edit it, it deploys on git push. Organic search went from about 7
clicks a day to about 100 over 90 days.

What works: roundups ("best X apps") and comparison posts ("X vs Y"). Those
get clicks because the reader is already shopping. Informational posts pile up
impressions and send almost nobody, they get answered in the AI overview and
the reader never clicks. I also decided against programmatic SEO, no
generated page factories. Partly because I think Google eventually torches
those, partly because I didn't want my name on one.

Two rules I learned by breaking them: don't touch metadata twice within a
week (you can't tell which change did what), and check whether your last batch
of posts is even indexed before writing more.

### The revenue team

RevenueCat handles subscriptions. Yearly has a 7-day trial, monthly doesn't.
There's a price experiment running right now I'm not ready to write about yet.

The webhook is the part I'd tell anyone to copy: every purchase, renewal,
cancellation and billing issue posts to a Slack channel in real time. When
someone cancels, I sometimes DM or email them the same day and just ask why.
The answers are blunt and more useful than any survey I've run.

Trial-to-paid went from 21% to 44% in five weeks with zero ad spend. Most of
that story is embarrassing: my analytics was missing about 80% of trial
conversions because of how the SDK caches subscription state, so the first
"win" was just measuring correctly, and the rest was paywall work informed by
finally having real numbers. Wrote that one up separately too.

A weekly audit skill pulls RevenueCat, PostHog and analytics into one report
and compares me against indie benchmarks. That report is where decisions come
from, not vibes.

### The data analyst

PostHog for product analytics (app and web), GA4 alongside it, Search Console
for SEO. All three are wired into Claude over MCP, so "why did installs dip
Tuesday" is a question I type, not a dashboard safari. Slack gets alerts for
website download clicks and body-fat scanner runs. Survey responses go
straight into Supabase because the analytics vendor's survey UI was silently
dropping half of them (found that out the hard way, 47% capture rate).

Every raw data pull gets committed to the repo in a dated folder. Sounds
excessive, but it means any past decision can be re-checked against the data
that drove it, and Claude can read all of it.

### What I fired: paid ads

I spent $5,674 on ads over three months. TikTok $1,881, Apple Search Ads
$2,498, Reddit $1,295. Apple was the "best" performer at $5.64 per install,
and it still worked out to about $114 to acquire a paying user with an LTV of
$18. Reddit tracked approximately zero conversions. I stopped all of it on
May 10.

Everything above, the blog, the TikTok pipelines, the free tools, exists
because of what happened next: installs dropped to the organic floor and then
started climbing again, except this time the growth came from things I own
that don't stop working when I stop paying.

### If you're starting one of these

Steal in this order. RevenueCat webhook to Slack, one evening of work, changes
your relationship with churn. Free calculators on a static site, they rank
faster than articles and they're your best backlink magnet. Comparison posts
before informational posts. Fix your conversion tracking before optimizing
anything, mine was 80% wrong and I "optimized" against noise for weeks. And
put your dev rules in a CLAUDE.md, the compounding is real.

Not a huge business yet. But it grew 45% last month on channels I own, the
content from March still pulls installs today, and the whole thing runs on
maybe two focused hours a day. Slower than ads, but it compounds, and it's
mine.

Happy to answer questions about any piece of this.

---

## X POST DRAFT v2 (long-form, deep detail — attach infographic + 3 receipts)

(Unicode-bold headers paste as-is into X. Body below is the copy source;
the chat version with bold headers is canonical for pasting.)

[see final chat message — v2 with per-department workflows, costs, and
steal-this list. Sections: ENGINEERING / RELEASE MANAGER / CONTENT STUDIO /
SEO DEPARTMENT / REVENUE TEAM / DATA ANALYST / THE DEPARTMENT I FIRED /
WHAT IT ALL COSTS / steal-this closer.]

---
(first reply, posted immediately:)
Blog post with the full breakdown: https://gainframe.app/blog/ios-app-playbook-2026/
The infographic is the map. Screenshots in this thread are the receipts.

---

## SCREENSHOT SHOT LIST

Rule of thumb for this genre: the infographic is the map, screenshots are the
receipts. Real dashboards with real cursors beat polished graphics for trust.
Capture everything in the SAME appearance mode (dark recommended, it reads
"dev" on X), full-retina, crop the browser chrome unless the URL bar adds
credibility (for RevenueCat/PostHog keep the URL visible, it proves it's real).

### Main post (4 media slots)

1. **The infographic** (slot 1 — this is the preview image).
   Artifact in dark mode, crop from headline through the circuit diagram.
2. **RevenueCat MRR chart.** app.revenuecat.com → Charts → MRR, weekly,
   Mar 11 → today. The whole launch-to-now line. Hover the last point so the
   tooltip shows the current value.
3. **GSC performance curve.** Search Console → Performance → last 6 months,
   clicks only (uncheck impressions, cleaner line). The 7→100/day climb.
4. **The Slack revenue channel.** #gainframe-feedback showing a run of
   INITIAL_PURCHASE / RENEWAL / CANCELLATION alerts. REDACT user IDs/emails
   (Slack → hover redact or crop). This one always gets replies.

### Thread replies (1 station per reply, 1–3 images each)

- **Engineering reply:** (a) RocketSim/simulator mid-run with the agent
  driving the app, terminal beside it showing verify-on-sim output;
  (b) CLAUDE.md open in the editor, scrolled to the architecture rules.
- **Release reply:** terminal after `/release` finishes — fastlane's
  "Successfully uploaded" block + the git tag line. One image.
- **Content reply:** (a) grid view of the iCloud TikTok-Drafts folder (Finder
  gallery view, dozens of carousel folders); (b) one finished comic slide;
  (c) TikTok analytics for the best-performing carousel.
- **SEO reply:** (a) TODO_SEO.md backlog open in editor (the [x] publish log
  is the receipt); (b) GSC queries table, top 10 queries with clicks.
- **Revenue reply:** (a) RevenueCat "Higher Price" experiment screen (crop if
  you don't want to reveal the result yet); (b) trial_conversion_rate chart
  weekly showing the 21→44 climb.
- **Analytics reply:** (a) PostHog "North Star — GainFrame Daily Check"
  dashboard (already in your open tabs); (b) #posthog-alerts channel with
  download-click + scanner-run alerts.
- **Paid ads reply:** reuse the matplotlib spend-vs-installs chart from the
  spent-5k blog post (web/public/ blog assets) — it's already brand-styled.

### Redaction checklist before posting ANY screenshot

- Customer emails / user IDs in RevenueCat, Slack, Supabase, PostHog persons.
- API keys and tokens: do the secrets-rotation task BEFORE screenshotting any
  terminal or editor (Slack xoxb in project.yml, PostHog bearer in .mcp.json,
  gemini-api-keys.txt, Firebase admin JSON).
- Your Gmail inbox count / other tabs — crop to the app window, not the screen.
- Supabase project ref + anon keys if a config file is visible in an editor shot.

### Capture mechanics (macOS)

- Cmd+Shift+4 then Space = clean window shot with shadow (looks good on X).
- For dashboards: resize browser to ~1400px wide first so text stays legible
  when X compresses; zoom the page to 110–125% for chart shots.
- X compresses hard: PNG, under 5MB, avoid tiny gray text as the payload.
- First image in the post is the timeline preview — infographic goes first.

---

## Publish-day checklist

1. Re-pull numbers: `rc.py metrics` + fresh GSC clicks/day. Update both drafts.
2. Rotate/scrub secrets in gain-frame repo (task already flagged).
3. Blog post → run through /ai-check, then publish via blog-post-generator
   conventions (frontmatter, cover via /image-generate).
4. Post X thread in the morning (US), pin it, blog link in first reply.
5. Reply with one station deep-dive per day for the next week.
