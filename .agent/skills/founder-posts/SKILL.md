---
name: Founder Posts
description: Generate a build-in-public founder-story blog post + companion Reddit post for gainframe.app. Metric-dense, honest about failures, celebrates wins, with shadcn-style light-card charts (HTML/SVG + headless Chrome). Wraps mike-writes (voice), blog-post-generator (publishing mechanics), and image-generate (cover).
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

Charts are **shadcn-style light cards** rendered as hand-built HTML/SVG and screenshotted with headless Chrome (Michael's standing preference, Jul 2026: the older matplotlib dark-card charts — trial-conversion post, organic-traffic post — are superseded; do NOT reproduce that style). House reference: `docs/blog/1000-mrr-five-months/assets/mrr-journey.webp` and `milestone-gaps.webp`; working generator: `.claude/skills/founder-posts/scripts/shadcn_charts_example.py` — compute SVG geometry in Python, emit a fixed-size HTML card, screenshot at 2×.

- **Card:** white `#ffffff`, 1px border `#e4e4e7`, 16px radius, ~28px padding, sized exactly to the viewport (e.g. 1120×620 CSS px → 2240×1240 at 2×). System font stack (`-apple-system, Inter, …`).
- **Header:** 20px semibold title `#09090b` + 14px muted description `#71717a` including the data source ("Weekly · RevenueCat · Feb 8 – Jul 12, 2026"); 2–3 stats top-right (24px semibold value, 12.5px muted label) — the stats ARE the takeaway.
- **Palette (shadcn defaults):** primary series teal `#2a9d90` (chart-2), negative/contrast orange `#e76e50` (chart-1), text `#09090b`, muted `#71717a`, grid/border `#e4e4e7`. One accent color per chart plus at most one contrast color; no glows, no heavy effects.
- **Marks:** smooth monotone-cubic line (Fritsch–Carlson, never overshoots flat runs) at ~2.25px with a subtle vertical gradient fill (0.22 → 0.02 opacity); dashed 3-3 horizontal gridlines only; milestone dots as white-filled circles with colored stroke; event markers as dashed `#d4d4d8` vlines with small muted text labels; bars rounded rx 6, fill-opacity 0.9, value labels color-matched beside the bar.
- Annotate the 2–4 numbers that matter directly on the chart; keep everything else quiet.
- **Every chart earns its place:** a chart that just decorates a sentence gets cut; a chart that lets the reader skip the sentence stays.
- **Pipeline:** Python script in the scratchpad emits `chart.html` → `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --force-device-scale-factor=2 --window-size=W,H --screenshot=chart.png file://…` → `cwebp -q 85` into `docs/blog/[slug]/assets/*.webp`, delete the PNG. Never link a PNG. Escape `$` normally (it's HTML, not matplotlib mathtext) and use HTML entities (`&#183;`, `&#8211;`) for typographic characters.
- Embed with the `post-figure` pattern used by `spent-5k-on-app-ads.mdx`: `<figure className="post-figure">` + `<img>` + `<figcaption>` (caption states the takeaway, not the axes).

For chart-design judgment calls (what to emphasize, how to declutter), apply frontend-design/impeccable sensibilities: one message per chart, the key number visually loudest, everything else recedes.

### Phase 2b — App screenshots of the surfaces discussed
When the post discusses a specific in-app surface — a paywall, an onboarding step, a feature that drove the numbers — include a real screenshot of it. Readers (and Reddit commenters) want to SEE the paywall that converted 30%, not read a description of it. Sources, in order: ask Michael for current screenshots (paywalls change; stale screenshots of money surfaces are worse than none), then the versioned library at `docs/app-screenshots/[latest]/`. Convert to WebP (`cwebp -q 80`) into the post's assets dir; embed phone screenshots with `<figure className="post-inline-screenshot scroll-reveal"><img … /><figcaption>…</figcaption></figure>` (MUST be figure/figcaption — the CSS styles `figcaption`; a `<p>` inside renders as unstyled body text), or a side-by-side flex row with an inline-styled caption `<p>` for 2–3-up groups. Captions state what the reader is looking at and the number it produced.

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
