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
Apply the **mike-writes** skill (`~/.claude/skills/mike-writes/SKILL.md`) in full: lead with the fact, backstory and motivation, honest hedging, mechanism over outcome, second-order lessons, blunt headers, loose human grammar, run the Removal Checklist (no teaser hooks, no "what actually worked", no manufactured aphorisms, no AI-polish tells). Titles are flat declaratives with a real number — offer 2–3 options, pattern-matched to the winners:
- "I Spent $5,674 on App Ads. Here's Why I Stopped."
- "In-App Surveys Got 189 Responses. My Cancel Emails Got Zero."

### Phase 2 — Charts

Charts are matplotlib rendered to WebP, in the brand style (matches every existing founder-post chart):

- **Palette:** background `#F8FAFC` (off-white), ink/lines/text `#2D3748` (charcoal), positive fill `#48BB78` (sage, use ~12% alpha for area fills), warning/annotation `#FF6B6B` (coral, dashed vlines for events), highlight `#ECC94B` (golden) sparingly.
- **Typography:** bold charcoal title ~26pt, tick labels ~16–18pt, DejaVu Sans (mpl default) is fine.
- **Composition:** ~1560×880 px (`figsize=(13, 7.3), dpi=120`), generous margins, no top/right spines, no gridlines or very light ones, annotate the 2–4 numbers that matter directly on the chart (callout arrows welcome), event markers as coral dashed vlines with labels.
- **Every chart earns its place:** a chart that just decorates a sentence gets cut; a chart that lets the reader skip the sentence stays.
- **Pipeline:** write the script in the scratchpad, render PNG, `cwebp -q 80` into `docs/blog/[slug]/assets/*.webp`, delete the PNG. Never link a PNG.
- Embed with the `post-figure` pattern used by `spent-5k-on-app-ads.mdx`: `<figure className="post-figure">` + `<img>` + `<figcaption>` (caption states the takeaway, not the axes).

For chart-design judgment calls (what to emphasize, how to declutter), apply frontend-design/impeccable sensibilities: one message per chart, the key number visually loudest, everything else recedes.

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
- End the body with a short plain-declarative close (mike-writes rule 11), then a blockquote inviting questions, then the standard CTA + Related Articles blocks. Related Articles should include the other founder stories that this one continues.

### Phase 5 — Reddit post

Write the companion Reddit post to `marketing/reddit/[slug].md`. ⚠️ NEVER put it in `docs/blog/[slug]/` — that directory is symlinked into `web/public/blog` and everything in it gets PUBLISHED to the live site. Rules:

- **Self-contained value.** The full story with the real numbers lives IN the post — Reddit punishes link-bait. Someone who never clicks still gets everything.
- Same mike-writes voice; even looser than the blog (it's a forum comment, not an essay). Markdown tables work on Reddit — use one for the before/after numbers.
- Title: flat declarative with the number, no hooks. Offer 2–3 options tuned per subreddit if they differ.
- Every failure/caveat from the blog post survives the compression — Reddit's first comment WILL be the caveat you omitted. Preempt it.
- **The link comes last**, framed as optional extra: "I wrote this up with the charts here: [link]" — one line, no UTM hard-sell (add `?utm_source=reddit&utm_medium=social&utm_campaign=[slug]`).
- No emoji, no bullet-point-with-bold-lead-in walls, no "TL;DR:" header (Reddit-native short paragraphs instead).

### Phase 6 — Publish
Per blog-post-generator step 9: stage only the new files, commit (`feat(blog): [slug] founder story`), push to main (Cloudflare Pages auto-deploys). Verify the build locally first (`cd web && npm run build`) so a broken MDX never lands on main.

## Output

Final message to the user includes: the live URL path, title options, the Reddit post in a fenced code block (ready to paste), and one line flagging anything unverified or guessed.
