---
name: Competitor Scan
description: Scan one or more competitor websites to extract their content topics, positioning, pricing, and features. Outputs a structured competitor profile that feeds keyword-discovery (as topic seeds) and comparison-article-generator (as pre-loaded research).
triggers:
  - "competitor scan"
  - "scan competitor"
  - "analyze competitor"
  - "competitor research"
  - "what does [competitor] cover"
  - "/competitor-scan"
---

# Competitor Scan Skill

## Overview

Replicates GrowGanic's competitor intelligence workflow using **free fetches only** (sitemap.xml, blog index pages, homepage parsing). Produces a structured per-competitor profile that downstream skills consume:

- **`keyword-discovery`** uses the extracted blog topic list as additional seeds (Phase 1 input)
- **`comparison-article-generator`** uses the captured features/pricing/positioning to skip basic Phase 2 lookups when writing a comparison article

**What this skill does NOT do** (be honest about it):
- Cannot tell you what keywords competitors actually *rank* for (that requires paid Ahrefs/SEMrush data). It can only tell you what they've *written about* — a strong proxy but not the same thing.
- Cannot estimate competitor traffic. Use Similarweb separately if needed.
- Cannot inspect their internal product if it's gated behind login (most apps). Fetches their public marketing pages only.

**Division of labor with `comparison-article-generator`:**
- `competitor-scan` = **strategic, broad** — multiple competitors, surface-level. Run periodically (monthly/quarterly).
- `comparison-article-generator` Phase 2 = **tactical, deep** — one competitor, all details for one specific article. Run when writing each comparison post.

If a competitor profile already exists from `competitor-scan`, the comparison article skill should READ it first and skip redundant fetches.

---

## The Workflow

### Phase 0: Inputs

Ask the user (or accept as direct invocation args):

1. **Competitor name(s)** — single (`bodywhat`) or list (`bodywhat, hume health, fitcommit`).
2. **Competitor URL(s)** — must be the root domain (e.g. `https://bodywhat.com`). If the user only has a name, do a quick `WebSearch` for `[name] official site` to find it.
3. **Scope** — default `full` (sitemap + homepage + pricing + about). Alternative: `topics-only` for a fast scan (just blog/sitemap → topic list, no homepage analysis).

If multiple competitors are provided, run Phases 1-3 for each in **parallel** (independent fetches) and write one output file per competitor.

### Phase 1: Sitemap + Topic Discovery

**Step 0 — App Store-only branch (handle FIRST):** If the competitor was identified as **App Store-only** in `competitor-discovery` (no marketing website found, only an `apps.apple.com/...` URL), skip sitemap discovery entirely and treat the **App Store listing as the primary surface**. Fetch the App Store URL and extract: app name, subtitle, developer, description verbatim, all IAP pricing tiers, review count + rating, app size, latest version + release date, age rating, listed features. Write the profile from that data only and note `**Primary surface:** App Store only (no marketing website discovered)` at the top. Do NOT attempt to fabricate a sitemap or hunt for a non-existent website. Examples from the GainFrame run: trackBod, Metamorph, Snapsie were all App Store-only and got valuable profiles from the listing alone.

For competitors **with a marketing website**, proceed with sitemap discovery in this order until something works:

1. **Try `/sitemap.xml`** first. `WebFetch` it. Parse all `<loc>` URLs. Common sitemap variants to try if the root is empty:
   - `/sitemap_index.xml`
   - `/sitemap-blog.xml`
   - `/sitemap-pages.xml`
   - `/wp-sitemap.xml`
   - `/post-sitemap.xml`

2. **If sitemap fails or is empty**, try fetching `/blog/` or `/blog` or `/articles/` or `/learn/` index pages. Extract `<a href>` links from the post listing.

3. **If both fail**, fall back to a `WebSearch` for `site:[competitor-domain] blog` and parse top results. This is less complete but gives a rough topic surface.

4. **Categorize each URL** by pattern:
   - `/blog/` or `/articles/` → **blog post** — extract slug, fetch the page only if title needed
   - `/features/` or `/product/` → **product page**
   - `/pricing` → **pricing page**
   - `/about` or `/team` → **about page**
   - `/help/` or `/docs/` or `/support/` → **support content**
   - `/[competitor]-vs-` or `/vs-` or `/alternative` → **comparison page** (these are GOLD — they reveal what competitors they fear)
   - Root and shallow paths → **landing pages**

5. **Extract topics from blog post slugs/titles.** For most blog URLs the slug is the topic (e.g. `body-fat-percentage-chart` → topic: "body fat percentage chart"). If the slug is opaque (e.g. `2024/03/post-12345`), `WebFetch` the page and extract the `<h1>` or `<title>` instead. Batch these fetches in parallel, max 8 at a time, to be respectful.

**Output of Phase 1:** A categorized URL inventory + a flat list of blog topics.

### Phase 2: Homepage + Positioning (skip if scope=topics-only)

`WebFetch` these pages in parallel for each competitor:

1. **Homepage** (the root URL). Extract:
   - Tagline / hero headline
   - Subheadline / value prop
   - Primary CTA
   - Listed features (look for icon grids, bullet lists)
   - Social proof (testimonials, customer logos, "as seen in")
   - Target audience signals (who do they speak to?)

2. **Pricing page** (if found in Phase 1). Extract:
   - Tier names
   - Price per tier
   - Free trial terms
   - Annual vs monthly split

3. **About page** (if found). Extract:
   - Company size / team
   - Founding story / motivation
   - Funding status (if mentioned)

**Honest extraction rules:**
- If a field isn't present, write `Not listed` — do NOT infer from training data.
- For pricing: if it says "Contact sales" or is gated, write `Not publicly listed`.
- For features: distinguish between **advertised features** (what they show on the page) and **inferred capabilities** (what you'd guess they have). Only capture advertised features.

### Phase 3: Comparison-Page Mining (high-value, even when empty)

If Phase 1 found any URLs matching `/vs-` or `/alternative` or similar comparison patterns, fetch each one. These pages are gold because:

- They reveal **who the competitor sees as their competition** (a clue about market positioning)
- They reveal **what dimensions they argue on** (which differentiators they think matter)
- They occasionally reveal **their pricing or feature gaps** (when they criticize alternatives)

For each comparison page, capture:
- The other product they're comparing against
- Their main argument (one sentence)
- Any feature/pricing facts they cite about themselves OR the other product

**When mining returns empty (NO competitor has any /vs- or /alternative pages):** This is a *positive* signal worth flagging in the cross-competitor `_overview` file, NOT a missing data point. Empty `/vs-` mining means:

1. **The "[X] vs GainFrame" SERP is wide open.** GainFrame can be the FIRST to publish comparison pages — first-mover advantage on owned comparison-keyword content.
2. **None of these competitors are publicly defining the alternative landscape**, which gives GainFrame unusual freedom to set the comparison narrative.

Note this explicitly in the `_overview` file's "Comparison-Page Mining" section. The GainFrame 2026-04-25 scan found zero `/vs-` pages across 6 top competitors — this was one of the most actionable findings of the entire run.

### Phase 4: Output

#### 4a. Per-competitor profile file

Create `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/competitor-research/[competitor-slug].md`:

```markdown
# Competitor Profile: [Name]

**Last scanned:** YYYY-MM-DD
**Root URL:** https://example.com
**Scope:** full | topics-only

## Positioning

**Tagline:** [from homepage hero, or "Not listed"]
**Subheadline:** [...]
**Target audience signals:** [who they speak to — "lifters", "casual users", "women over 40", etc.]
**Primary CTA:** [...]

## Pricing

| Tier | Price | What's included |
|---|---|---|
| ... | $X/mo | ... |

(Or "Not publicly listed" if pricing is gated.)

## Advertised Features

(Pulled from homepage / features page — verbatim, not paraphrased)

- ...
- ...

## Content Footprint

**Total URLs in sitemap:** N
**Blog posts:** M
**Comparison pages:** P
**Product/feature pages:** Q

### Blog topics covered (M topics)

These are the TOPICS the competitor has written about. Treat as keyword seeds for `keyword-discovery`. Each one is a clue that this competitor sees demand in that area.

- topic 1 (URL: /blog/topic-1)
- topic 2 (URL: /blog/topic-2)
- ...

### Comparison pages found

Direct insight into who they consider competitors.

- vs Competitor A (URL: /compare/a) — Their main argument: "..."
- vs Competitor B (URL: /alternative-to-b) — Their main argument: "..."

## Overlap with GainFrame's existing content

Topics where both this competitor AND GainFrame have written:

- [topic] — GainFrame: /blog/our-slug, [Competitor]: /blog/their-slug

(This is the "we're crowded here" signal.)

## Topics they cover but GainFrame does NOT

These are the **immediate keyword opportunities**. Pipe these into `keyword-discovery` as seeds.

- [topic 1]
- [topic 2]
- ...

## About / Team

[Captured from /about, or "Not listed"]

## Notes for comparison article writing

If we ever write a "[Name] vs GainFrame" article (via `comparison-article-generator`), here's the verified data to use:

- Verified pricing: ...
- Verified accuracy claim: [or "no accuracy claim published"]
- Verified target audience: ...
- Known limitations (from missing features or honest reading of their site): ...
- Verified strengths to acknowledge: ...

## Methodology

- Scanned via free fetches: sitemap.xml + homepage + pricing + about + comparison pages
- Did NOT verify ranking keywords (requires paid SEO tool)
- Did NOT verify traffic estimates (use Similarweb separately if needed)
- Last refresh: YYYY-MM-DD — re-run skill quarterly or when major competitor moves are observed
```

#### 4b. Cross-competitor summary (if multiple competitors scanned)

Create `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/competitor-research/_overview-[YYYY-MM-DD].md` with:

- Table of all scanned competitors (Name | URL | Pricing | Total content) — at-a-glance comparison
- Aggregate gap list: topics covered by 2+ competitors but NOT by GainFrame (highest-priority seeds for `keyword-discovery`)
- Aggregate crowding list: topics covered by GainFrame AND 2+ competitors (we're competing for these — refresh strategy needed)
- Topics ONLY GainFrame covers: defensible content moats — defend and expand
- Comparison-page mentions: which competitors mention each other (market structure signal). If empty, document that as a positive finding (see Phase 3 above).
- **Shared signals across competitors** (NEW — added from GainFrame 2026-04-25 learnings): patterns that span multiple competitors and weren't visible profile-by-profile. Examples worth surfacing here:
  - **Two or more competitors citing the same research paper** (e.g. Spren AND BodyScan/FitnessAI both cite Nature DOI s41430-024-01424-w — possible shared underlying tech, OR both referencing the same study as a benchmark even though it doesn't actually validate their specific approach)
  - **Multiple competitors with similar pricing structures** (e.g. several competitors at $29.99/yr suggests price clustering — informs GainFrame's pricing decisions)
  - **Multiple competitors with shared positioning angles** (e.g. several competitors emphasizing privacy-first / on-device storage — suggests a market signal worth responding to)
  - **Discrepancies between marketing claims and underlying technology** (e.g. an app claiming "comparable to DEXA" while citing a paper that doesn't include DEXA — flag these for any future comparison article writers, but DO NOT name competitors directly in published articles to avoid sniping framing)
  - **Apps that appear abandoned but still rank** (e.g. Snapsie last updated 2017 — these are SERP ghosts, treat as content placeholders not active competitors)

#### 4c. Summarize for the user

In chat, surface:
- N competitors scanned
- Total unique topic seeds extracted
- Top 5 highest-confidence keyword opportunities (topics covered by competitors but not by GainFrame)
- Path to the per-competitor files
- Suggested next step: "Want me to run `keyword-discovery` with these as the seed list?"

---

## Rules & Constraints

- **Respect competitor sites.** Cap parallel fetches at 8 per host. Do not fetch the full body of every blog post — slug + title is enough for topic extraction.
- **Public marketing pages only.** Do not attempt to bypass logins, paywalls, or gated content. Do not fetch app store / Google Play app pages here (use `aso-*` skills for that).
- **Never fabricate.** If a field isn't present on the competitor's site, write `Not listed`. Do not infer from training data — competitor info changes frequently and your training data may be stale.
- **Capture VERBATIM, not paraphrased.** When pulling tagline/features, quote them exactly. The downstream `comparison-article-generator` needs to make verified claims; paraphrased versions risk introducing inaccuracies.
- **Do not commit competitor screenshots or content.** This skill writes structured markdown notes. It does NOT download images, copy long-form content, or save anything that would constitute scraping for republication.
- **Cap blog post body fetches at 20 per competitor** to control fetch count. If a competitor has 200+ posts, just sample 20 (the most recent) and note the total in the profile.
- **Output files go in `seo-tools/competitor-research/`** (parallel to `seo-tools/keyword-research/`). Create the directory if absent.
- **Refresh cadence is quarterly by default.** Add a note at the top of each profile with the scan date. If re-scanning, append `-2`, `-3` etc. or overwrite (user's call).

---

## Integration with Other Skills

**Upstream:** `competitor-discovery` — identifies and classifies WHO the competitors are. Its output (`seo-tools/competitor-research/_identified-[date].md`) lists the top Direct competitors prioritized for scanning. If the user hasn't run it yet and isn't sure who to scan, suggest running `competitor-discovery` first.

**Downstream:**
- **`keyword-discovery`** — reads the "Topics they cover but GainFrame does NOT" list as additional seeds. When `keyword-discovery` is invoked with `--competitor [name]` or with competitor URLs in Phase 0, it should check `seo-tools/competitor-research/[name].md` first and use that topic list rather than re-fetching.
- **`comparison-article-generator`** — reads the per-competitor profile to skip basic Phase 2 research lookups. Its tactical deep-dive still happens, but the verified pricing, features, and positioning are pre-loaded.

When this skill finishes, suggest the user run `keyword-discovery` next using the extracted gap topics as seeds.

---

## Reference Files

- `/Users/michael.rode/code/project/gain-frame-privacy/product-context.md` — **READ THIS FIRST.** Authoritative source for what GainFrame IS (used to compute "overlap with GainFrame's existing content" and "Topics they cover but GainFrame does NOT" sections of the per-competitor profile). The differentiators + honest limitations are also useful to ground the "Notes for comparison article writing" section of each profile.
- `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/competitor-research/` — output directory (created if absent)
- `/Users/michael.rode/code/project/gain-frame-privacy/blog/` — used to compute "overlap with GainFrame's existing content"
- `/Users/michael.rode/code/project/gain-frame-privacy/.agent/skills/keyword-discovery/SKILL.md` — downstream consumer
- `/Users/michael.rode/code/project/gain-frame-privacy/.agent/skills/comparison-article-generator/SKILL.md` — downstream consumer

---

## Common Competitors for GainFrame (suggested seed list)

If the user invokes this skill without specifying competitors, suggest these based on the GainFrame space:

**Direct AI body composition apps:**
- Bodywhat — `https://bodywhat.com`
- FitCommit — `https://fitcommit.ai`
- Get Right Fitness — App Store only (limited web presence)

**Smart scale brands (adjacent — they capture body-comp queries):**
- Hume Health — `https://humehealth.com`
- Withings — `https://www.withings.com`
- InBody — `https://inbodyusa.com`
- Tanita — `https://tanita.com`
- Renpho — `https://renpho.com`

**Body composition test providers:**
- DexaFit — `https://www.dexafit.com`
- BodySpec — `https://www.bodyspec.com`
- KALOS — `https://www.livekalos.com`

**Content competitors (fitness sites that rank for body-comp queries):**
- Examine.com — `https://examine.com`
- T-Nation — `https://www.t-nation.com`

For first runs, recommend scanning 3-5 direct competitors rather than all of them. Quality of analysis > quantity of competitors scanned.
