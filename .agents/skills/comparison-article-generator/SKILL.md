---
name: comparison-article-generator
description: "Generate \"[Competitor] vs GainFrame\" comparison articles that capture comparison-intent SERP traffic. Front-loaded answers, honest competitor research, mandatory comparison table + \"who is each for\" + FAQ blocks. Inherits voice, icons, HTML scaffold, and deploy workflow from blog-post-generator. Use when the user says \"comparison article\", \"vs article\", \"compare app\", \"alternative article\", \"X vs Y article\", \"/comparison-article-generator\"."
---

# Comparison Article Generator Skill

## Overview

Generates honest, SEO-optimized "[Competitor] vs GainFrame" comparison articles for keywords surfaced by `keyword-discovery` and tagged with `comparison-article-generator` in `TODO_SEO.md`.

**Why this is a separate skill:** Comparison articles have meaningfully different structure than guides — front-loaded answer, side-by-side table, "who is each for", and a comparison-specific FAQ section. Trying to bend `blog-post-generator` to also do this would dilute both. The voice rules, icons, HTML scaffold, and deploy commands are **identical** and inherited by reference (see "Inherited from blog-post-generator" below).

**Honest comparison principle:** Trust > conversion. If you trash a competitor or fabricate features they don't have, readers smell it and bounce. The article ranks because it's the most honest, useful comparison on the SERP — not because it's the most aggressive sales pitch.

---

## Inherited from blog-post-generator

This skill **inherits without restating** the following sections of `.agents/skills/blog-post-generator/SKILL.md`:

- **Writing Voice & Style** (Tone, Paragraph & Sentence Style, GainFrame Integration rules)
- **Icons: SF Symbols — Never Emoji** (no exceptions for comparison articles either)
- **Visual Components Available** (`post-callout`, `post-feature-grid`, `post-table-wrapper`, `post-steps`, etc.)
- **Image processing** (move to `assets/`, `cwebp -q 80`, delete originals)
- **Cover image generation prompt** (the abstract vector-line illustration template)
- **MDX scaffolding** (frontmatter, JSON-LD schemas, JSX body template)
- **Blog index + sitemap** (both auto-generated — no manual update)
- **Deploy commands** (git add → commit → push → Cloudflare Pages auto-deploys)

If you change voice/styling/scaffolding rules, change them in `blog-post-generator/SKILL.md` — they apply here automatically. **Do not duplicate them in this file.**

---

## The Workflow

When triggered, follow these phases sequentially. Do not skip phases.

### Phase 0: Duplicate Check

Same as `blog-post-generator` Phase 0 — list files in `web/content/blog/` for existing comparison-themed slugs (e.g. `vs`, `compare`, `alternative`). Warn if a similar comparison already exists.

### Phase 1: Inputs

Ask the user (or derive from `TODO_SEO.md`):

1. **Competitor name** — e.g. `bodywhat`, `Hume Health Body Pod`, `DEXA scan`. The competitor can be a product, an app, or a measurement method (DEXA vs AI photo is a valid comparison).
2. **Competitor URL** — if it has a website, get it. We'll fetch it. If they don't have a URL (e.g. comparing to a method like "calipers"), skip to general research.
3. **Target keyword** — the exact "X vs Y" SERP query you're targeting. From `TODO_SEO.md` ideally, e.g. `visceral fat vs subcutaneous fat` or `bodywhat vs gainframe`.
4. **Article angle hypothesis** — one sentence on why GainFrame wins (or wins for a specific audience). User's raw take. Do not write the article around marketing copy — write it around the user's honest take.

### Phase 2: Competitor Research (MANDATORY — do not skip)

**This is the step that separates an honest comparison from a hatchet job.** Do it carefully.

1. **If competitor URL provided**, `WebFetch` these pages in parallel:
   - Their homepage (extract: tagline, features list, target audience, key claims)
   - `/pricing` or `/plans` (extract: tiers, free trial, costs)
   - `/about` if it exists (extract: company size, founding story)
   - `/features` if it exists

2. **`WebSearch` for these queries in parallel**:
   - `[competitor] features` (find what they advertise)
   - `[competitor] review` (find independent perspectives — Reddit, forum reviews especially valuable)
   - `[competitor] vs` (find what other comparisons exist — gaps and angles)
   - `[competitor] accuracy` (only if they make accuracy claims)
   - `[competitor] pricing` (cross-check the homepage)

3. **Capture into a research note** (mental or scratchpad — does NOT need to be a file unless the article will take multiple sessions):
   - **Verified features** (with source — homepage, app store, etc.)
   - **Verified pricing** (with source)
   - **Verified claims** (e.g. "they advertise ±5% accuracy" — only if you can find the source)
   - **Limitations** (what they DON'T do, where they're weak — based on what's missing or what reviews complain about)
   - **Strengths** (what they do well — yes, list these honestly)
   - **Target audience** (who their site/marketing speaks to)

4. **Honest representation rules** (apply during drafting):
   - Never invent features. If you can't verify it, omit it.
   - Never invent accuracy numbers. If they don't publish one, say "Their accuracy is not published in clinical studies" — that's an honest fact, not a dig.
   - Never quote pricing without a source. If pricing isn't on their site, say "Pricing is not listed publicly."
   - Acknowledge competitor strengths in dedicated language. Don't bury them.
   - Use "based on what's published on their site" or "according to their marketing" when stating competitor claims you couldn't fully verify.

### Phase 3: Angle Interview

Different questions than `blog-post-generator`. Ask 3-4 of these (not all):

1. "From your honest perspective, where does [competitor] win?" (Forces nuance — important for credibility.)
2. "Where does [competitor] fall short for serious lifters / your target audience specifically?"
3. "Who would you actually recommend [competitor] to over GainFrame? Be specific." (This becomes the "Who is each for" section.)
4. "What's the single biggest myth or mistake people make when choosing between [competitor] and GainFrame?"
5. "What would you tell a friend who asked you which to use?" (This is the front-loaded answer.)

The goal is to extract:
- **One-sentence verdict** for the front-loaded Q&A opener
- **Honest concession** about competitor strengths
- **Specific audience split** for the "Who is each for" section
- **One unique angle** that no other comparison on the SERP has taken

### Phase 4: Asset Gathering

Same as `blog-post-generator` Phase 2:
- Identify 2-4 GainFrame screenshots that visualize the comparison points (e.g. the per-muscle scoring screen if "per-muscle scoring" is your differentiator)
- User provides via chat or file paths
- Optionally: 1 competitor screenshot (use carefully — public marketing site screenshots are generally OK as fair-use comparison content; do NOT use screenshots from inside their app unless the user has the app and took the shot themselves)

### Phase 5: Drafting

Follow this **comparison-specific structure**. Each H2 is required unless marked optional.

#### Title format
`[Competitor] vs [GainFrame]: [Question for [Audience] in [Year]]`

Examples:
- `Bodywhat vs GainFrame: Which AI Body Fat App Is Best for Lifters in 2026?`
- `DEXA Scan vs AI Body Composition: Which Is Worth It for Recomp Tracking?`
- `Visceral Fat vs Subcutaneous Fat: What Photos Can (and Can't) Tell You`

Title rules:
- Under 65 characters for the meta `<title>` tag (truncate the competitor + brand part if needed)
- The H1 in the article body can be longer (more keyword coverage)

#### Section structure

```
H1: [Competitor] vs [GainFrame]: [Full question]

[MANDATORY Quick Answer block — inherited from blog-post-generator.
 Render as <div class="post-callout post-quick-answer"> with 40–60 words
 directly answering "Which is better for [audience]: [Competitor] or GainFrame?".
 This is the AI-Overview / featured-snippet target — keep it tight, no setup,
 give the verdict + the audience split in one paragraph. The H2 below
 ELABORATES; the callout is the extractable answer.]

[Optional Table of Contents — generate as <ul> with anchor links]

H2: [Front-loaded answer to the comparison query — phrased as a question]
   e.g. "Which AI Body Fat App Is More Accurate: Bodywhat or GainFrame?"

   First paragraph (2-3 sentences): Elaborate on the Quick Answer callout above —
   the verdict with reasoning, not a duplicate of the callout. State who wins for
   what audience and WHY.

   Then 2-3 short bullet/sentence "key takeaways" that summarize the differentiation.
   End with: "Let's break down each one."

H2: What Is [Competitor]? Features and Limitations

   H3: What features does [Competitor] offer?
       Honest feature list. Source: their site. Bullet or short paragraph.

   H3: How accurate is [Competitor]? (only if accuracy is a relevant dimension)
       Honest paragraph on what's published vs what's not. Use hedged language.

H2: What Is [GainFrame]? The AI Body Composition App Built for Lifters
   (Substitute the appropriate positioning depending on the comparison angle.)

   H3: What features does [GainFrame] offer?
       Use a post-table-wrapper with Feature | Description columns.
       Pull features from the existing about page / homepage. Don't invent.

   H3: How does [GainFrame] work?
       Brief paragraph on the workflow.

H2: [Key Dimension] Showdown: [Competitor] vs [GainFrame] [Dimension] Compared
   e.g. "Accuracy Showdown: Bodywhat vs GainFrame Accuracy Compared to DEXA"

   This H2 targets the specific long-tail comparison query.
   Provide the substantive head-to-head on the most important dimension.
   If accuracy: cite the relevant study you have (the 2-photo AI study, ±3% DEXA, etc.).
   If features: lead into the comparison table below.

H2: Feature Comparison: [Competitor] vs [GainFrame] Side by Side
   MANDATORY — must include a post-table.

   COLUMN ORDER (per blog-post-generator's "Comparison tables" rule):
   - Single-competitor comparison (3 columns: Feature | Competitor | GainFrame)
     → keep default column order (GainFrame last). Table fits viewport, no
       horizontal scroll, default :last-child sage highlight is fine.
   - Multi-competitor comparison (4+ data columns)
     → use `<table class="post-table gainframe-first">`. Put GainFrame in
       column 2 (first data column, immediately after the Feature label).
       The least important competitor goes LAST so it's the one cut off
       on narrow viewports.

   Include 8-12 rows covering:
   - Body fat estimate method
   - Per-muscle scoring (yes/no)
   - Future physique / projection (yes/no)
   - Before/after comparison (yes/no)
   - Streak tracking / gamification (yes/no)
   - Accuracy claim (with source)
   - Pricing tier (free/paid)
   - Best for: (one-line audience)

   CELL CONTENT RULES:
   - Use sage check <svg> for "yes/has-feature" cells, gray X <svg> for
     "no/missing-feature" cells. NEVER ✅ or ❌ emoji.
   - Wrap GainFrame column text values in <strong> for emphasis
     (e.g. <strong>12 groups</strong>, <strong>Free tier</strong>).
   - Each cell should be honest. If you don't know the competitor's value,
     write "Not published" or "Unknown" rather than guessing.

H2: Who Is Each [App/Method] Best For?
   MANDATORY. This is the trust-builder.

   H3: Who should use [Competitor]?
       2-3 sentences. Honest — recommend them for what they ARE good for.
       Example: "Bodywhat is good for people who want a visual representation
       of their body fat. The 3D body mapping and morphing features are fun
       and motivating. It helps you picture where you are going."

   H3: Who should use [GainFrame]?
       2-3 sentences. Specific audience, not "everyone."

H2: [Competitor] Alternative: Why [Audience] Switch to [GainFrame]
   (Only include if positioning GainFrame as the alternative makes sense.
    Skip if the comparison is between two methods rather than two products.)

   3-4 short paragraphs on the specific switch-driver:
   - First: the most concrete differentiator (e.g. "per-muscle scoring")
   - Second: the data/precision angle
   - Third: the user-experience angle (gamification, frequency)
   - Fourth: a unique GainFrame feature (e.g. future physique prediction)

H2: Pricing and Value: [Competitor] vs [GainFrame]
   Honest. If competitor pricing is unknown, say so. Don't fabricate.

   H3: What is [GainFrame]'s pricing? (verified)
   H3: What is [Competitor]'s pricing? (verified or "Not published")
   H3: Which gives more value for the money? (your honest take with rationale)

H2: Which [App/Method] Should You Use in [Year]?
   Closing recommendation. 3-4 short paragraphs.
   - Restate the audience split.
   - Acknowledge that the right answer depends on the reader's goal.
   - End with a concrete framework: "If X, use Bodywhat. If Y, use GainFrame."

H2: Frequently Asked Questions
   MANDATORY. 6-9 questions targeting comparison long-tail.
   Each answer: 40-70 words, snippet-friendly, direct, honest.

   Standard question patterns:
   - "How accurate is [Competitor]?"
   - "How does [GainFrame] measure [thing]?"
   - "Which is better for [specific audience]?"
   - "Can I use both [Competitor] and [GainFrame] together?"
   - "Is [Competitor] free?"
   - "Is [comparison query] a concern for casual users?"
   - "How long does each scan take in [GainFrame]?"
   - "Does [Competitor] have [unique GainFrame feature]?"
   - "What makes [GainFrame] the best [category] in [Year]?"

H2: Sources
   MANDATORY. Bullet list of citations:
   - Competitor's own site (the page(s) you fetched)
   - Any study cited (with URL)
   - Any third-party review or comparison referenced
   - GainFrame's own published research/blog posts
```

#### Comparison-specific voice rules

(These are IN ADDITION to the inherited voice rules from `blog-post-generator`.)

- **Use "we" for GainFrame, the competitor's name for them.** Do not refer to the competitor as "they" — use the brand name. This signals neutrality.
- **Lead each comparison section with the dimension, not the verdict.** "Accuracy:" not "GainFrame wins on accuracy:". Let the data lead.
- **Hedge competitor claims you can't independently verify.** "According to their site..." / "Based on what's published..." / "Their marketing claims..." — never assert competitor capabilities as fact unless you've verified them.
- **Acknowledge competitor strengths in their own dedicated paragraph.** Don't slip a backhanded compliment into a paragraph that's actually about a weakness.
- **Final recommendation must include audience split.** "Use X if you want Y, use GainFrame if you want Z." Never "GainFrame is just better." Readers see right through that.

### Phase 6: Implementation

Same flow as `blog-post-generator` Phases 3.1-3.8 (Setup Directory → Process Images → Generate Cover → Scaffold HTML → Update Index → Update Sitemap → Update Backlog → Deploy). Only differences:

1. **Slug format**: Use `[competitor-slug]-vs-gainframe` for product comparisons, or the keyword-derived slug for method comparisons (e.g. `dexa-vs-ai-body-composition`).
2. **JSON-LD structured data**: Use `BlogPosting` (same as guide posts) — there is technically a `Review` and `Comparison` schema but Google handles `BlogPosting` for these well and you avoid extra schema validation overhead.
3. **OG image**: Should be a screenshot showing the comparison or differentiator (e.g. the GainFrame muscle-scoring screen), NOT the abstract cover.
4. **TODO_SEO.md update**: Mark the comparison item complete with the published URL.
5. **Internal linking**: At minimum, link to:
   - GainFrame's about/methodology page (justifies your authority)
   - One related comparison if one exists
   - One related guide (e.g. if comparing on accuracy, link to your accuracy study)

---

## Rules & Constraints

- **Never fabricate competitor features, pricing, or accuracy numbers.** This is the cardinal rule. If you can't verify it, say so honestly. Honest gaps build more trust than invented certainty.
- **Phase 2 competitor research is not optional.** Even if the user is in a hurry, do at least the homepage fetch + one Reddit/review search. The article cannot be honest without it.
- **Comparison table is mandatory.** Articles without a side-by-side table underperform on comparison-intent queries.
- **FAQ section is mandatory.** Each comparison FAQ captures a separate long-tail query — they're free traffic.
- **Acknowledge competitor strengths.** A comparison article that only criticizes the competitor reads as a sales pitch. The audience split section ("Who should use [competitor]?") is non-negotiable.
- **Apply all inherited rules from `blog-post-generator`** (voice, icons, paragraph length, image WebP, mobile CTA structure, internal linking, etc.).
- **Deploy step is mandatory** — same as guide posts. The article isn't "published" until pushed to `main`.

---

## Reference Files

- `/Users/michael.rode/code/project/gain-frame-privacy/product-context.md` — **READ THIS FIRST (before everything).** Authoritative source for tagline, target audience, differentiators, honest limitations, and brand voice. Use the "Differentiators" section to know what GainFrame's verifiable advantages are (do NOT invent new ones). Use the "Honest limitations" section for hedging language and credibility. Use the "Implementation Override" to avoid common article-writer mistakes (e.g. claiming GainFrame is on Android — it's not).
- `/Users/michael.rode/code/project/gain-frame-privacy/.agents/skills/blog-post-generator/SKILL.md` — **READ THIS SECOND.** All voice, styling, HTML, image, and deploy rules are inherited from there.
- `/Users/michael.rode/code/project/gain-frame-privacy/.agents/skills/keyword-discovery/SKILL.md` — upstream skill that surfaces comparison opportunities.
- `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/TODO_SEO.md` — backlog. Items tagged `comparison-article-generator` are this skill's input.
- `/Users/michael.rode/code/project/gain-frame-privacy/docs/blog/` — existing posts. Check for similar comparisons before drafting (Phase 0).
- `/Users/michael.rode/code/project/gain-frame-privacy/docs/blog/dexa-scan-vs-ai-body-composition/index.html` — closest existing comparison-style post; read for HTML structure reference.
- `/Users/michael.rode/code/project/gain-frame-privacy/docs/blog/ai-body-editor-apps-vs-real-analysis/index.html` — another comparison-style reference.

---

## Integration with Other Skills

**Upstream:**
- `keyword-discovery` — produces backlog items tagged `comparison-article-generator`. This skill consumes them.

**Sibling:**
- `blog-post-generator` — handles guide/listicle/definition articles. This skill inherits from it but does not call it.

**Downstream:**
- None. This skill ends with `git push` to `main`, which triggers GitHub Pages deploy.

---

## When the User Triggers This Skill

If the user says "write a comparison article" without specifying a competitor:
1. Check `TODO_SEO.md` for items tagged `comparison-article-generator`. List them.
2. Recommend the highest-priority item (top of backlog).
3. If they accept, proceed to Phase 1 with that target.
4. If `TODO_SEO.md` is empty or has no comparison items, suggest running `keyword-discovery` first.

If the user specifies a competitor (e.g. "compare us to bodywhat"), proceed directly to Phase 1.
