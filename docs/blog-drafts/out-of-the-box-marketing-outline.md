# Blog post outline — "Out-of-the-box marketing experiments for my indie iOS app"

> **Handoff doc.** Written 2026-07-05 by a session that ran two of the three promos described below. Everything in "Context you need" is first-hand from that session; the "Data to pull" section tells you where to get numbers. Write in Michael's voice — use the `mike-writes` skill (required: this post sits next to the two calibration posts it references). Publish to the blog in `web/` like previous posts.

## Working titles (flat, factual — pick one)

- "Paid ads didn't work, so I'm trying weirder stuff: 3 marketing experiments"
- "3 unconventional marketing experiments for my iOS app (with real budgets)"
- "What I'm trying after $5k of ads went nowhere"

## Premise / arc

Indie app marketing is mostly a graveyard of paid channels. Michael already published two data posts: [spent-5k-on-app-ads](https://gainframe.app/blog/spent-5k-on-app-ads/) (paid = unprofitable) and [organic-traffic-15x-90-days](https://gainframe.app/blog/organic-traffic-15x-90-days/) (SEO = working). This post is the next chapter: SEO keeps compounding in the background, so the experimentation budget goes to **cheap, capped-downside, unconventional channels** — and the honest early results. Recent supporting fact: a $180 TikTok ad boost on 2026-07-02 produced exactly 0 new subscribers (mention; Michael has the campaign screenshots).

Unit-economics frame to state early: Pro Yearly is $39.99, ~$34 net after Apple's Small Business Program cut → any channel with CAC above ~$30 is dead on arrival. That's why the experiments below cost $150, ~$0, and $450.

## Experiment 1 — CashStash ($150, complete, honest failure with an asterisk)

Context (first-hand):
- @cashstashwilmington is a local TikTok account (~10k followers) that hides real cash around Wilmington NC and posts clues; businesses sponsor drops. Michael paid $150 to sponsor the 2026-07-03 drop: his accounts posted the clue, their posts described GainFrame + linked it.
- Infrastructure built for attribution: App Store offer code `CASHSTASH` (50% off first year of Pro Yearly, pay-up-front $19.99) — redemptions = deterministic attribution; campaign-tokened App Store link (`ct=cashstash-wilm`); landing page [gainframe.app/wilmington](https://gainframe.app/wilmington) with a custom mascot hero (GainFrame Guy coaching a college seahawk on a beach — Nano Banana + character reference art, ~$0.04/image); PostHog geo insight for Wilmington installs.
- Result: **0 offer-code redemptions, no attributable subscriber lift** (verify against ASC campaign + RevenueCat before publishing). Gained social followers (get exact count from Michael). Baselines used: ~40–45 downloads/day, ~4–5 trials/day.
- Lessons for the post: (a) the attribution stack cost nothing and turned "I think it didn't work" into "I know it didn't work in 48 hours" — that's what $150 actually bought; (b) offer codes are the indie growth hack nobody uses: deterministic attribution without an MMP (AppsFlyer was deliberately dropped — without ATT consent everything shows "organic"); (c) audience mismatch: cash hunters ≠ people who take gym progress photos.

## Experiment 2 — 30-day founder challenge (~$0, in progress, the uncomfortable one)

Context:
- Michael has never been on camera. New dad, full-time job, gained ~15 lbs; doing a 30-day get-back-in-shape challenge posting daily TikToks of himself using his own app (check-ins, goals, feature-a-day), goal −10 lbs, before/after at the end.
- First video (embed or link): https://www.tiktok.com/@gainframeapp/video/7658571781023829261
- The angle for the post: this is the "put yourself out there" tax of indie marketing. He's the target user right now — the app exists for exactly this situation. Too early for results; say so plainly.
- The honest note that makes this section work: he's nervous, doesn't know what to say on camera, and is doing it anyway because founder-story content is the only content format that makes small accounts grow.

## Experiment 3 — #GainFrameChallenge giveaway ($450, just launched)

Context:
- Judged transformation contest, Jul 5–31 2026: users post their GainFrame before/after share card on TikTok with #GainFrameChallenge + follow @gainframeapp. Prizes $300/$100/$50 + 1 yr Pro each (Pro granted via RevenueCat promotional entitlements = $0 marginal cost). Rules + examples: [gainframe.app/giveaway](https://gainframe.app/giveaway).
- Design decisions worth writing about: (a) judged contest not sweepstakes (skill-based = simpler legally); (b) the rules include a **repost/marketing-rights clause** — the real ROI target is a library of authentic user before/afters, not direct CAC; (c) photo-import is the friction-killer: new users can import 2 old gym pics and have an entry in ~5 min; (d) built-in blur tool answers the "post myself shirtless?" objection; (e) hyphenated hashtags silently break on TikTok (#gainframe-giveaway → #gainframe) — small real gotcha readers will appreciate.
- Amplification (all free): announcement email to the full user list (1,389 emails via the transactional pipeline — Resend + Supabase edge fn + a campaign_sends queue table), App Store In-App Event ("Transformation Challenge" card on the product page), micro-creators paid to *enter* (seeding entries, not ads), cross-post everywhere.
- Success frame stated BEFORE results exist: 9+ redemptions... (no — that was CashStash) — for this one: entries count + follower delta + repostable UGC; break-even is ~a handful of yearly subs but that's explicitly not the primary goal.

## Data to pull (do this before writing)

1. **GSC** (property `sc-domain:gainframe.app`, via gsc MCP tools): daily clicks chart June–now (was ~30/day early June → 95–108/day by Jun 30); non-branded position movers table ("ai body fat estimator" 63→12, "best body composition app" →5, "progress photo app" →6.8). Chart this — it's the "meanwhile, SEO compounds" backdrop.
2. **RevenueCat** (`/revenuecat` skill): current MRR (baseline was $530.73 on 2026-05-13 — pull fresh), active subs, weekly new trials (24/26/30 for weeks of Jun 8/15/22). MRR states the stakes honestly.
3. **PostHog**: insight 7GrNre1v (daily first opens — validated ±1% against ASC first-time downloads; do NOT use persons/day, it's ~2x inflated by server events). Annotations 351229 (CashStash) + 352801 (Challenge) mark the promo windows on any chart.
4. **ASC**: campaign sources `cashstash-wilm` and `giveaway-2026-07` (Analytics → Acquisition); offer-code redemption count for CASHSTASH (Sales & Trends). Note ASC campaign data needs 24h + ≥5 downloads to appear.
5. **From Michael**: $180 TikTok boost screenshots (spend/views/conversions), follower counts before/after CashStash, the first challenge video stats.

## Voice + structure notes for the writer

- Use `mike-writes`. Lead each section with the fact and the number. Hedge his own claims, keep the "I was nervous / it didn't work / too early to tell" honesty — that's the trust engine of the two posts this one follows.
- Close in the calibration-sample style: short declaratives. Something in the territory of: paid rented reach; these experiments are cheap enough to be wrong about; SEO pays the bills while he finds out. Don't write a slogan.
- CTAs: link all three artifacts (/wilmington, /giveaway, the TikTok) inline where they naturally come up; end with the challenge since it's live and enterable.
- Distribution after publish: X thread (@GainFrameApp, `gainframe-tweets` skill), r/SideProject + indie hackers, link from the giveaway page's next reminder post.
