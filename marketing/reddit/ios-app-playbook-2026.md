# Reddit post — ios-app-playbook-2026 (v2, deep detail)

**Attach:** the infographic (`founder-post-screens/01-infographic-dark.png`) as the post image where the sub allows image posts (r/SideProject yes). For text-only subs, lead with the text and put the blog link at the bottom.

**Title options:**

- r/SideProject: `My iOS app is 4 months old and does $944 MRR. Every "department" is a Claude Code skill. Full stack with the actual workflows and costs.`
- r/EntrepreneurRideAlong: `4 months in: $944 MRR, up 45% last month, zero ad spend. The full stack I use to run an iOS app alone, with real numbers.`
- r/ClaudeAI / r/ClaudeCode: `I run every department of my iOS app with Claude Code skills — SEO, releases, QA, revenue audits. $944 MRR, 4 months in. What each skill actually does.`
- r/iOSProgramming (tooling angle, downplay revenue): `Solo iOS dev: my release is one command, my QA drives the simulator, my work tracker is GitHub Issues. The automation stack, honestly assessed.`

**Posting rules:** stagger one sub per day, never post the identical body twice — swap the intro per the variants at the bottom, engage every comment in the first 2 hours. Link at the BOTTOM with UTM, or in a comment if the sub is strict.

---

## MAIN BODY (r/SideProject, r/EntrepreneurRideAlong)

I've posted a few write-ups in this sub over the last couple months about growing my iOS app ([GainFrame](https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082), AI body composition tracking) — the $5.7K I wasted on ads, the trial conversion fix, the promo video I paid $49 for. A few people in the comments asked for the full stack I use to run the whole thing, so this is that post, with the actual workflows and not just tool names.

Where it stands today: 4 months old, $944 MRR, up 45% in the last month, 203 active subs. It's just me. The way I think about the stack is like departments, because every department a normal app company hires for is either a service I pay for or a Claude Code skill I wrote.

Fair warning: some of this is over-engineered for an app making $944 a month. I build automation because I like building automation.

**Engineering.** SwiftUI + SwiftData, iOS 17+. XcodeGen generates the Xcode project from a YAML file, so the `.xcodeproj` isn't even in git and project-file merge conflicts don't exist. On-device AI is Google MLKit (pose detection, segmentation) + Apple Vision. Backend is Supabase: 30 edge functions, the centerpiece being an AI coach that streams Gemini 3.5 Flash and can call 17 tools against the user's real data — pull a metric range, compare photo scores, read Hevy workout volume by muscle, list Strava activities, recall past conversations.

Claude Code writes most of the code. The repo's CLAUDE.md encodes the architecture rules (enum-driven navigation, the design system, what never to touch) so every session produces code that matches the app. QA is an agent too: it builds the app, installs it in the simulator, and drives it through RocketSim's CLI — reads the accessibility tree, taps by element ID, screenshots each step. A green build says it compiles. This says the feature works.

AI cost has guardrails because the coach is my biggest infra line (~$257/mo): a cron alerts Slack past $35/day total or $5/day per user, and CI literally fails any PR that grows the coach's system prompt without me consciously raising the budget.

**Releases.** One command. It checks the live App Store build number to know if this is a new version or a follow-up build, drafts release notes from the git log, bumps and tags, archives with fastlane match (certs in a private repo — new machine is a clone away from shipping), uploads to TestFlight, and syncs App Store metadata in 9 localizations. Screenshots auto-mirror en-US→UK/AU and es-ES→MX. I localized the listing long before the app UI because it's the cheapest ASO surface there is. Work tracking is GitHub Issues with P0–P3 labels.

**Content.** A TikTok comic factory with a mascot. The pipeline detail that matters: Gemini's image model draws ONLY the art (base64 reference images keep the character on-model), then Python/Pillow composites every word — fixed font, fixed positions, fixed accent color. I built it that way because letting the model render text made every slide drift and the account looked like a garage sale. Art is AI, typography is code. About 4 cents a slide, 150+ carousels.

What I've measured: myth-bust question hooks ("WILL CARDIO KILL YOUR GAINS?") outperform everything because they start comment wars. The app appears in 1 of every 3 carousels, final slide only — more and reach dies. A second pipeline builds "top 5 fitness apps" listicles from real iTunes API logos/screenshots/ratings with zero AI images, and plants my app at #3–4 between Strava and Hevy. Those outperform the posts where I put myself first. Stung, but the numbers don't care.

**SEO.** 141 posts + 11 free calculators on Cloudflare Pages. Hosting $0, keyword tools $0 — the pipeline is Google autocomplete expansion → reading the live SERP → my own Search Console data over MCP → a scored backlog → a generator drafts, I edit, git push deploys. Organic went from ~7 clicks/day to ~100 in 90 days; the best page is a "best AI body fat apps" roundup at ~170 clicks/week.

What works: shopping-intent content (roundups, X-vs-Y comparisons) gets clicks. Informational posts pile up impressions and die in the AI overview. Free calculators (TDEE, FFMI, one-rep max, a photo body-fat scanner rate-limited to 1/day per device so it can't eat my API budget) rank faster than articles and pull the backlinks articles never get. Two rules I learned by breaking them: never touch a page's metadata twice in one week, and check your last batch is actually indexed before writing more.

**Revenue.** RevenueCat. Yearly has a 7-day trial, monthly has none. Currently A/B testing the paywall frame: leading with "$3.33/mo billed yearly" converts 30.1% of paywall views into trial starts vs 24.1% for the version that explains the trial timeline (not significant yet, not calling it). Every Pro feature gates with a preview of itself — your real muscle map with the breakdown blurred. Show the thing, lock the depth.

The piece I'd tell anyone to copy: the RevenueCat webhook → Slack. Every purchase, cancellation, and billing issue lands in a channel with plan, country, and a "find in PostHog" link. Trial cancellations arrive flagged "reach out" and I sometimes email the person the same day and ask why. Blunter and more useful than any survey. Trial→paid went 21% → 44% in five weeks with zero ad spend.

**Analytics.** PostHog (app + web) + GA4 + Search Console, all wired into Claude over MCP, so "why did installs dip Tuesday" is a question I type. The embarrassing part: my analytics had logged 10 trial conversions in a window where RevenueCat counted ~48 (a wrong-flavor API key silently failing plus two event bugs). Fix measurement before optimizing anything — I optimized against noise for weeks. Also: survey responses write to my own Supabase table because the vendor's survey UI was silently capturing only ~47% of them. And every raw data pull gets committed to git in dated folders so any past decision can be re-audited.

**The department I fired: paid ads.** $5,674 over three months — Apple Search Ads $2,498 (443 installs, $5.64 CPI, the "good" channel), TikTok $1,881, Reddit $1,295 with approximately zero tracked conversions. Best case ~$114 to acquire a payer with an $18 LTV. Killed everything May 10. Installs dropped to the organic floor, then climbed past it on channels that don't stop working when the card does.

**What it all costs monthly:** Gemini ~$260 (with the alerting so it can't quietly triple), hosting $0, SEO tools $0, slides 4 cents each, RevenueCat and PostHog free at this scale, Apple $99/yr. The real cost is about two focused hours a day.

**If you're starting one of these, steal in this order:**

1. RevenueCat webhook → Slack. One evening. Changes churn from a weekly chart into a same-day conversation.
2. Reconcile your analytics against your payment provider before optimizing anything. They won't match. The payment provider is right.
3. Free calculators on a static site. Rank faster than articles, keep ranking, earn the backlinks.
4. Comparison/roundup posts before informational posts.
5. Put your dev rules in a CLAUDE.md. The compounding is real.
6. When AI output drifts, move that part into code instead of prompting harder.

**Caveats:** $944 MRR is not a business yet, it's a slope I like. The 45% month is partly small-base math. And none of this is passive — it's two focused hours a day, every day.

Full write-up with screenshots of all of it: https://gainframe.app/blog/ios-app-playbook-2026/?utm_source=reddit&utm_medium=social&utm_campaign=ios-app-playbook-2026

Happy to answer questions about any piece of it.

---

## INTRO SWAP — r/ClaudeAI / r/ClaudeCode

Replace the first three paragraphs with:

I run a solo iOS app (GainFrame, AI body composition tracking) and at some point I noticed every "department" of the business had become a Claude Code skill: the SEO keyword pipeline, the release manager, the QA that drives the simulator, the weekly revenue audit, the TikTok content factory. The app is 4 months old, $944 MRR, up 45% last month. Here's what each skill actually does, with numbers, including where I had to take work AWAY from the model.

(Then keep the department sections. This crowd will ask about CLAUDE.md contents, skill structure, and MCP setup — have snippets ready. The "when AI output drifts, move it into code" line is the discussion driver here.)

## INTRO SWAP — r/iOSProgramming

Replace the first three paragraphs with:

Solo dev on a SwiftUI app here. Over the last few months I automated most of the non-coding work around it and figured the list might be useful. Numbers included where relevant, and I'll be upfront that some of this is over-engineered for an app this size — I automate because I enjoy it.

(Drop or soften the MRR emphasis, keep engineering/release/QA sections first, move revenue/SEO lower. Put the blog link in a comment only if someone asks. This sub is allergic to marketing.)
