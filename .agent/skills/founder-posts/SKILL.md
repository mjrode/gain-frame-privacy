---
name: Founder Posts
description: Generate a build-in-public founder-story blog post + companion Reddit post for gainframe.app. Metric-dense, honest about failures, celebrates wins, with brand-styled matplotlib charts. Wraps mike-writes (voice), blog-post-generator (publishing mechanics), and image-generate (cover).
triggers:
  - "founder post"
  - "founder story"
  - "founder-posts"
  - "/founder-posts"
---

# Founder Posts Skill

## Overview

Founder stories are the top-performing lane on the gainframe.app blog and on Reddit (r/SideProject, r/iOSProgramming, r/EntrepreneurRideAlong). This skill produces the full package for one story: a blog post in Michael's voice with eye-catching charts, plus a Reddit post that stands on its own and links to the blog at the end.

What makes this lane work (bake ALL of these in, every time):

1. **Specific numbers beat everything.** More specific data = more views. Numerator/denominator ("46 of 104 trials"), dollar amounts to the dollar ($5,674 not "$5K+"), dated timelines, week-by-week series. Never round a real number into a vaguer claim.
2. **The outcome is the story; failures are texture.** Title and narrative spine = the result the reader wants (the number that moved, the milestone hit). Confessions and embarrassing bugs are supporting details woven into the timeline — they build trust, they don't get the headline or the first section, UNLESS the failure itself is the whole story ("I Spent $5,674 on App Ads. Here's Why I Stopped.") or Michael explicitly picks the confession angle. Carry every caveat the data demands (small cohorts, confounds, unproven attribution) — the hedging is the trust engine, not a weakness.
3. **Still celebrate the win.** Honest ≠ mopey. State plainly what worked and what it's worth now. Close on the earned, understated win ("Slower, but it compounds, and it's mine.").
4. **Charts pull the scroll.** 2–4 brand-styled charts per post (see Chart Style below). Every chart shows a real number the post quotes.

## Inputs

Either a **brief file** (preferred — e.g. `analytics/trial-conversion-post-brief-*.md`) or a topic + access to the data sources. If key numbers are missing, pull them (RevenueCat via the `revenuecat` skill, PostHog MCP, GSC/GA4 MCP, `analytics/` store, MRR audits in `../gain-frame/docs/audits/`) — do NOT invent or approximate numbers. Every claim in the post must trace to a source.

**Metric-gathering pass (mandatory):** before drafting, sweep for every concrete number the story can carry — before/after values, weekly series, percentages with n, dollar figures, dates, commit-level details (a one-character bug beats "a config issue"). If the brief has a caveats section, every caveat ships in the post.

## Workflow

### Phase 0 — Duplicate check
List `web/content/blog/*.mdx`, confirm this story isn't already told. Founder stories that overlap an existing post should LINK to it, not re-tell it (e.g. the paid-ads prologue links to `spent-5k-on-app-ads`).

### Phase 1 — Voice
Apply the **mike-writes** skill (`~/.claude/skills/mike-writes/SKILL.md`) in full: lead with the fact, backstory and motivation, honest hedging, mechanism over outcome, second-order lessons, blunt headers, loose human grammar, run the Removal Checklist (no teaser hooks, no "what actually worked", no manufactured aphorisms, no AI-polish tells).

**No growth jargon — describe what the user sees.** Terms like "value-anchored", "value stack", "trial-timeline paywall", "activation lever" read like garbage to the actual audience (Michael flagged this on the trial-conversion post). Translate every one into the concrete thing: not "the variant leads with a value stack and a per-month price anchor derived from the yearly plan" but "the new paywall leads with what you get when you upgrade, and shows the yearly plan as $3.33/mo instead of $39.99/year. Same price, different frame." If a sentence needs a growth-marketing glossary, rewrite it. Titles are flat declaratives with a real number — offer 2–3 options, pattern-matched to the winners:
- "I Spent $5,674 on App Ads. Here's Why I Stopped."
- "In-App Surveys Got 189 Responses. My Cancel Emails Got Zero."

### Phase 2 — Charts

Charts are matplotlib rendered to WebP, in the **dark shadcn-style card** (house reference: `docs/blog/organic-traffic-15x-90-days/assets/organic-clicks-90d.webp` and the trial-conversion post; this style anchored the two highest-view Reddit posts):

- **Card:** near-black rounded card `#0B0E13` (bake rounded corners: transparent fig + `FancyBboxPatch` background), ~2240×1232 px (`figsize=(14, 7.7), dpi=160`).
- **Header row:** bold white title ~31pt top-left + muted subtitle (`#8B95A8`, include the data source, e.g. "Weekly trial cohorts · RevenueCat"); 2–3 big stats top-right (value ~30pt bold colored, label below muted) — the stats ARE the takeaway.
- **Palette:** text `#F1F5F9`, muted `#8B95A8`, positive `#7DD991` (green, glow + vertical gradient area fill), negative/event `#FF6B6B` (coral), neutral series `#64748B` (slate), grid `#334155` at ~45% alpha, horizontal only.
- **Effects:** glow the hero line (re-plot 3× at increasing width/low alpha), gradient fill under areas (imshow clipped to the curve polygon), rounded bar corners (`FancyBboxPatch`), chip annotations (rounded bbox, colored bg + dark text) for events and the headline value, no spines, no tick marks.
- **Typography:** Helvetica Neue.
- Annotate the 2–4 numbers that matter directly on the chart; event markers as thin white vlines with a coral chip.
- **Every chart earns its place:** a chart that just decorates a sentence gets cut; a chart that lets the reader skip the sentence stays.
- **Pipeline:** write the script in the scratchpad, render PNG, `cwebp -q 80` into `docs/blog/[slug]/assets/*.webp`, delete the PNG. Never link a PNG.
- Embed with the `post-figure` pattern used by `spent-5k-on-app-ads.mdx`: `<figure className="post-figure">` + `<img>` + `<figcaption>` (caption states the takeaway, not the axes).

For chart-design judgment calls (what to emphasize, how to declutter), apply frontend-design/impeccable sensibilities: one message per chart, the key number visually loudest, everything else recedes.

### Phase 2b — App screenshots of the surfaces discussed
When the post discusses a specific in-app surface — a paywall, an onboarding step, a feature that drove the numbers — include a real screenshot of it. Readers (and Reddit commenters) want to SEE the paywall that converted 30%, not read a description of it. Sources, in order: ask Michael for current screenshots (paywalls change; stale screenshots of money surfaces are worse than none), then the versioned library at `docs/app-screenshots/[latest]/`. Convert to WebP (`cwebp -q 80`) into the post's assets dir; embed phone screenshots with the `post-inline-screenshot` float or a side-by-side pair, each with a `post-caption` stating what the reader is looking at and the number it produced.

### Phase 3 — Cover image
Invoke **image-generate** (`~/.claude/skills/image-generate/SKILL.md`), default `blog-cover` template, 4:3, to `docs/blog/[slug]/assets/cover.webp`. Subject should be a visual metaphor for the story (not a chart).

### Phase 4 — Blog post

Follow **blog-post-generator** (`.agent/skills/blog-post-generator/SKILL.md`) for ALL publishing mechanics: MDX frontmatter template, JSON-LD schemas with the canonical author/publisher blocks (never drift), asset pipeline (`docs/blog/[slug]/assets/`, `web/public/blog` symlink), auto blog-grid, auto sitemap, deploy steps.

**Founder-story overrides** (these SEO-guide rules do NOT apply to founder stories):
- No Quick Answer callout block.
- H2s are blunt declarative labels ("The Numbers Didn't Work", "Turning the Ads Off") — NOT question-format.
- No FAQ section, no HowTo schema.
- First-person singular throughout ("I", never "we" — solo project).
- `breadcrumbCategory` / `displayCategory` / `articleSection`: `Founder Story`.
- Product mention stays light: the story is the product. One contextual mention + the closing CTA block, same as every founder post.
- Include the RevenueCat verified link when quoting revenue: `https://verified.revenuecat.com/gainframe`.
- **Link densely — internal and external.** Every sentence that touches a prior post gets an inline internal link at its first natural mention (the paid-ads postmortem, the organic-traffic 15x post, the marketing-experiments post, etc.) — the Related Articles block is the floor, not the ceiling. Every benchmark, statistic, or industry claim links its authoritative external source (e.g. the 39.9% H&F median → `https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/`). Internal links spread authority across the blog; external citations are an E-E-A-T signal. Anchor text = the claim, not "here" or "this post".
- End the body with a short plain-declarative close (mike-writes rule 11), then a blockquote inviting questions, then the standard CTA + Related Articles blocks. Related Articles should include the other founder stories that this one continues.

### Phase 5 — Reddit post

Write the companion Reddit post to `marketing/reddit/[slug].md`. ⚠️ NEVER put it in `docs/blog/[slug]/` — that directory is symlinked into `web/public/blog` and everything in it gets PUBLISHED to the live site. Rules:

- **Self-contained value.** The full story with the real numbers lives IN the post — Reddit punishes link-bait. Someone who never clicks still gets everything.
- Same mike-writes voice; even looser than the blog (it's a forum comment, not an essay).
- Title: flat declarative with the number, no hooks. Offer 2–3 options tuned per subreddit if they differ (milestone framing for r/appledevelopers, lesson framing for r/AppBusiness / r/iOSAppsMarketing).
- Every failure/caveat from the blog post survives the compression — Reddit's first comment WILL be the caveat you omitted. Preempt it.
- **Never a wall of text — format for the skim.** Markdown that has proven out in Michael's editing passes:
  - Paragraphs of 1–3 sentences with blank lines between. Split anything longer.
  - **Bold the lead-in sentence of each change/step** ("**Re-gated features that had quietly become free.** While building fast…") so the post scans as a list without being one.
  - A bolded one-line header before each section: "**What I changed, roughly in order:**", "**The numbers:**", "**The caveats, because these matter more than the wins:**".
  - Bold the handful of numbers that carry the story (the before %, the after %, the key predictor) — a handful, not every figure.
  - Markdown table for the before/after numbers.
  - Caveats as a short dash list, one caveat per item.
  - Inline markdown links early: the app's App Store page on first mention (Reddit renders a preview card), and the benchmark/data source. RevenueCat verified link near the end.
  - Attach the strongest chart as the post image where the sub allows image+text — the top-performing posts led with a dark chart.
- **The blog link comes last**, framed as optional extra: "Full write-up with the charts: [link]" — one line, with `?utm_source=reddit&utm_medium=social&utm_campaign=[slug]`.
- No emoji, no "TL;DR:" header.

### Phase 6 — Publish
Per blog-post-generator step 9: stage only the new files, commit (`feat(blog): [slug] founder story`), push to main (Cloudflare Pages auto-deploys). Verify the build locally first (`cd web && npm run build`) so a broken MDX never lands on main.

## Output

Final message to the user includes: the live URL path, title options, the Reddit post in a fenced code block (ready to paste), and one line flagging anything unverified or guessed.
