---
name: seo-tools
description: "Show the GainFrame SEO and content workflow reference. Use when the user asks for the SEO toolkit, content pipeline, or which SEO skill to run."
---

# SEO Toolkit Reference

Print the table below verbatim. Do NOT invoke any of the skills — this command is purely informational.

---

## GainFrame SEO / Content Pipeline

The pipeline flows top-to-bottom. Earlier skills produce artifacts that later skills consume. Foundation skills (product-context, competitor-*) are run on a slow cadence (quarterly). Article skills (blog-post-generator, comparison-article-generator) are run per-piece-of-content.

### Run order

```
   ┌──────────────────────┐
   │  1. product-context  │  ← foundation; single source of truth for what the product IS
   └──────────┬───────────┘
              │  (writes product-context.md — every other skill reads it first)
              ▼
   ┌──────────────────────┐
   │ 2. competitor-       │  ← who are we actually competing with?
   │    discovery         │
   └──────────┬───────────┘
              │  (writes competitor-research/_identified-[date].md)
              ▼
   ┌──────────────────────┐
   │ 3. competitor-scan   │  ← profile each direct competitor's site/topics/pricing
   └──────────┬───────────┘
              │  (writes competitor-research/[name].md per competitor)
              ▼
   ┌──────────────────────┐
   │ 4. keyword-          │  ← find SEO keyword opportunities + score them
   │    discovery         │
   └──────────┬───────────┘
              │  (writes keyword-research/[date]-[topic].md + appends TODO_SEO.md)
              ▼
   ┌──────────────────────────────────────────────────┐
   │ 5a. blog-post-          │ 5b. comparison-        │  ← per-article generators
   │     generator           │     article-generator  │
   │  (guides/listicles/     │  ([X] vs GainFrame)    │
   │   definitions)          │                        │
   └─────────────────────────┴────────────────────────┘
              │  (writes web/content/blog/[slug].mdx + docs/blog/[slug]/assets/, deploys to Cloudflare Pages)
              ▼
       PUBLISHED POST

   (parallel track, not part of the SEO pipeline:)
   ┌──────────────────────────┐
   │  feature-page-generator  │  ← /features/[slug]/ subpages, separate from blog
   └──────────────────────────┘
```

### Tool reference table

| # | Skill | Slash command | What it does | Reads | Writes | Cadence |
|---|---|---|---|---|---|---|
| 1 | **product-context** | `/product-context` | Builds the canonical "what GainFrame IS" snapshot — tagline, features, integrations, pricing, differentiators, honest limitations, brand voice, implementation override. The stable subset of marketing context that every downstream skill reads first. | `../gain-frame/app-marketing-context.md`, `app_description.md`, `paid_vs_free_tier.md`, `aso-metadata.md`, `competitive_analysis_modern.md`, `index.html` | `product-context.md` | Quarterly OR on major product change |
| 2 | **competitor-discovery** | `/competitor-discovery` | Finds and classifies competitors using free signals — SERP capture across multiple feature axes, "alternatives to X" searches, Reddit/community mentions. Outputs Direct / Adjacent / Content / Out-of-scope buckets with relevance scores. | `product-context.md`, `WebSearch` (SERPs, alt-search, Reddit) | `competitor-research/_identified-[date].md` | Quarterly |
| 3 | **competitor-scan** | `/competitor-scan` | Deep-profiles one or more competitors using free fetches — sitemap.xml, blog index, homepage, pricing, /vs- pages. Extracts topics, positioning, pricing, advertised features. Has an App Store-only branch for App Store-listed competitors with no website. | `product-context.md`, `competitor-research/_identified-[date].md`, competitor sitemaps + homepages via `WebFetch` | `competitor-research/[competitor-slug].md` per competitor + `_overview-[date].md` | Quarterly |
| 4 | **keyword-discovery** | `/keyword-discovery` | Free-tools keyword research: Google autocomplete (alphabet-soup expansion), SERP analysis (Reddit/Quora signal mining, hospital-authority lockout detection, image-search auto-skip), Google Search Console import for Quick Wins (CTR fixes, zero-click rankings, competitor-signal queries) — live via `mcp__gsc__*` tools when configured, CSV fallback otherwise. Outputs scored, clustered backlog. | `product-context.md`, `competitor-research/[name].md`, GSC via MCP (preferred) or `gsc-data/queries.csv` (fallback), Google autocomplete + `WebSearch` | `keyword-research/[date]-[topic].md` + appends `TODO_SEO.md` | As needed (weekly–monthly) |
| 5a | **blog-post-generator** | `/blog-post-generator` | Interactive end-to-end blog post creation. Phase 0 duplicate check → Phase 1 angle interview → Phase 2 screenshot library matching (catalog of v1.21 in-app screenshots) → Phase 3 cover-image generation via `image-generate` skill → MDX file creation with YAML frontmatter (OG/Twitter/JSON-LD schemas) → blog index + sitemap auto-generated by Next.js → TODO_SEO checkoff → deploy. Also handles Mailchimp email generation. | `product-context.md`, `TODO_SEO.md`, `app-screenshots/1.21/` library | `web/content/blog/[slug].mdx` + `docs/blog/[slug]/assets/`, updates `TODO_SEO.md` (blog index + sitemap are auto-generated) | Per article (typically weekly) |
| 5b | **comparison-article-generator** | `/comparison-article-generator` | "[Competitor] vs GainFrame" articles for comparison-intent SERPs. Phase 2 mandatory competitor research (homepage + reviews + pricing fetches with strict honest-extraction rules — "Not listed" vs fabrication). Required structure: front-loaded answer → competitor profile → GainFrame profile → showdown H2s → mandatory comparison table → "Who is each for" audience-split section → FAQ → Sources. Inherits voice/MDX/deploy rules from blog-post-generator. | `product-context.md`, `blog-post-generator/SKILL.md` (inherited rules), `TODO_SEO.md` (items tagged `comparison-article-generator`), competitor sites via `WebFetch` | `web/content/blog/[slug].mdx` + `docs/blog/[slug]/assets/`, updates `TODO_SEO.md` | Per article |
| — | **feature-page-generator** | `/feature-page-generator` | Parallel track, NOT part of the SEO pipeline. Builds `/features/[slug]/` product-marketing subpages — hero + problem + how-it-works steps + related-features + CTA. Visual/scannable, not editorial. Linked from `features.html` hub. | `features.html`, user-provided screenshots | `features/[slug]/index.html`, updates `features.html`, `sitemap.xml` | When a new feature ships |

### Core concepts

**Free signals only.** None of these skills require a paid Ahrefs/SEMrush API. They use Google autocomplete (free JSON endpoint), `WebSearch` for SERPs, `WebFetch` for sitemaps/homepages, and Google Search Console data (live via `mcp__gsc__*` tools when configured — property: `sc-domain:gainframe.app` — or CSV fallback at `gsc-data/queries.csv`). Trade-off: volume numbers are *relative tiers* (High/Med/Low), not absolute monthly searches. Every report includes an honest-limitation callout to that effect.

**Layered foundation.** `product-context.md` is the single source of truth that every downstream skill reads first. It holds the stable "what is the product" facts (tagline, features, differentiators, honest limitations, brand voice) separated from volatile operational data (MRR, ASA performance) which lives in the sibling `app-marketing-context.md`. This separation prevents content skills from latching onto stale operational claims.

**Honest hedging is a feature, not a bug.** Across every skill, the rule is: never fabricate. If a competitor's pricing isn't published, write "Not publicly listed." If a study didn't validate something, say "what the study did NOT test." If volume can't be measured precisely, say "estimate, not a paid-API number." This builds E-E-A-T credibility, which is what makes the content rank and convert.

**Auto-skip checks short-circuit waste.** keyword-discovery pre-classifies SERPs to skip wrong-intent queries fast: 6+ stock-photo domains in top 10 → image search, skip. 4+ tier-1 health authorities (Mayo/Cleveland/WebMD/Healthline/NIH) in top 10 → "hospital lockout," difficulty = 95, skip without backlinks. 6+ pure-product domains → transactional, skip unless writing a buying guide. These run *before* full difficulty scoring.

**Multiple feature axes.** competitor-discovery runs separate keyword batches per product axis (e.g. for GainFrame: AI body composition AND progress photo tracking). A pure progress-photo app is just as much a competitor as an AI body-fat app even though their feature sets don't overlap. Single-axis discovery misses half the competitive landscape.

**Consolidation pattern in keyword-discovery.** Before recommending each keyword as a standalone article, check: if 3+ keywords share audience + intent AND each is Med-or-lower volume on its own, recommend ONE combined post that covers all of them. Better SEO (fewer thin pages, more topical authority on one URL) than three weak posts.

**Inherited rules.** comparison-article-generator inherits voice/icons/MDX scaffold/deploy commands from blog-post-generator by reference. Voice rule changes go in blog-post-generator's SKILL.md and propagate automatically. No duplication.

**SF Symbols, never emoji.** Every blog post uses inline SVG paths from https://andrewtavis.github.io/sf-symbols-online/ for icons. Emoji renders inconsistently across OSes and conflicts with GainFrame's typographic voice.

**Deploy is mandatory.** Both blog-post-generator and comparison-article-generator end with `git add docs/blog/[slug]/assets/ web/content/blog/[slug].mdx ... → commit → push origin main`. The site is hosted on Cloudflare Pages — pushing to `main` auto-deploys. For immediate CLI deploy: `cd web && npm run deploy`. The article isn't "published" until this step completes. `git add -A` is forbidden (catches sensitive files); stage specific paths only.

### When to run what

| Situation | Run |
|---|---|
| First-time setup / never run any of these before | `/product-context` → `/competitor-discovery` → `/competitor-scan` → `/keyword-discovery` |
| Quarterly refresh | `/product-context` (if anything shipped) → `/competitor-discovery` → `/competitor-scan` |
| Need new content topics | `/keyword-discovery` (with optional competitor seeds) |
| Have a topic from `TODO_SEO.md` tagged `blog-post-generator` | `/blog-post-generator` |
| Have a topic from `TODO_SEO.md` tagged `comparison-article-generator` | `/comparison-article-generator` |
| New GSC data available | Drop CSV at `gsc-data/queries.csv`, then `/keyword-discovery` (it auto-imports in Phase 0.5) |
| Discovered a new competitor mentioned by a user | `/competitor-scan [their-url]` (single competitor, fast) |
| Major product change (new tier, removed feature, audience pivot) | `/product-context` to refresh, then re-run upstream skills |
| New app feature shipped | `/feature-page-generator` (separate track, not SEO pipeline) |

### Key output locations

```
gain-frame-privacy/
├── product-context.md                              ← #1 product-context output
├── TODO_SEO.md                                     ← #4 keyword backlog (consumed by #5a, #5b)
├── gsc-data/queries.csv                            ← user-provided GSC export (gitignored)
├── competitor-research/
│   ├── _identified-[date].md                       ← #2 competitor-discovery output
│   ├── _overview-[date].md                         ← #3 competitor-scan cross-summary
│   └── [competitor-slug].md                        ← #3 per-competitor profile
├── keyword-research/
│   └── [date]-[topic-slug].md                      ← #4 keyword-discovery report
├── app-screenshots/1.21/                           ← screenshot library used by #5a
├── docs/blog/
│   └── [slug]/assets/                              ← images for #5a, #5b posts (symlinked into web/public/blog)
├── web/content/blog/
│   └── [slug].mdx                                  ← #5a, #5b output (blog index + sitemap auto-generated by Next.js)
└── web/app/sitemap.ts                              ← auto-generates sitemap from all .mdx files (no manual edit)
```
