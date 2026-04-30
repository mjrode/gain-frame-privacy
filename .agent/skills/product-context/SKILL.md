---
name: Product Context
description: Synthesize a tight, SEO/content-focused product context snapshot at gain-frame-privacy/seo-tools/product-context.md. Single source of truth for what the product IS, who it's for, what makes it different, and what its honest limitations are. All other content skills (keyword-discovery, competitor-discovery, blog-post-generator, comparison-article-generator) reference this file.
triggers:
  - "product context"
  - "update product context"
  - "refresh product context"
  - "product facts"
  - "/product-context"
---

# Product Context Skill

## Overview

Replicates GrowGanic's "Product Facts" panel as a single canonical file (`seo-tools/product-context.md`) that downstream content skills consume. This is the **stable** product snapshot — what the product IS — separated from operational/ASO data (App Store metrics, ASA performance, MRR goals) which lives in `../gain-frame/app-marketing-context.md` and changes weekly.

**What goes in `seo-tools/product-context.md`:**
- Tagline + one-line elevator pitch
- Category + platform
- Features (3-8 specific capabilities, verbatim from app description)
- Integrations (real third-party connections)
- Pricing tiers (with what's included)
- Differentiators (4-5 things that set the product apart)
- Honest limitations (3-5 known constraints)
- Brand voice rules
- Team / founder note
- Implementation override (the single highest-value paragraph)

**What does NOT go here:**
- Conversion rates, MRR, App Store Connect metrics
- ASA campaign performance
- Goals / targets / deadlines
- Week-by-week plans
- (These belong in `../gain-frame/app-marketing-context.md`)

---

## Why a separate file from app-marketing-context.md?

The existing `app-marketing-context.md` (in the sibling app repo) is the comprehensive marketing operations document — it conflates "what is the product" (stable, infrequent updates) with "how is the launch going" (changes weekly).

Content skills don't need the operational data. They need a **fast, stable** reference. Forcing them to parse a 200-line marketing-ops doc to find the tagline wastes context and risks them latching onto stale operational claims.

So `seo-tools/product-context.md` is the **stable subset** that content skills load on every run. `app-marketing-context.md` remains the marketing-ops source of truth and is refreshed on a different cadence.

---

## The Workflow

### Phase 0: Source Identification

Default sources to scan, in priority order:

| Priority | Source | Used for |
|---|---|---|
| 1 | `../gain-frame/app-marketing-context.md` | Primary — already curated; pull tagline, features, differentiators, voice |
| 2 | `../gain-frame/docs/app_description.md` | Canonical feature list with full descriptions |
| 3 | `../gain-frame/docs/paid_vs_free_tier.md` | Pricing tier truth (free vs Pro feature splits) |
| 4 | `../gain-frame/docs/aso-metadata.md` | App Store name/subtitle/description (current live copy) |
| 5 | `../gain-frame/docs/competitive_analysis_modern.md` | Differentiator language + competitor framing |
| 6 | `gain-frame-privacy/docs/index.html` | Live web tagline + hero copy |
| 7 | `gain-frame-privacy/docs/features.html` | Public-facing feature framing |
| 8 | `gain-frame-privacy/docs/blog.html` + recent posts | Brand voice signals (recurring themes, vocabulary) |
| 9 | `../gain-frame/GAINFRAME_PRD.md` | Product requirements (only if higher sources are silent) |
| 10 | `../gain-frame/CLAUDE.md` / `AGENTS.md` | AI agent instructions (brand voice, tone signals) |

**Behavior when sources differ:** If priority-1 source has a value, use it. If absent, fall back to next priority. Note ALL sources used per field at the bottom of the output for traceability.

**Behavior when sources conflict:** Surface to user. Conflicts are usually a sign one source is stale. Do NOT silently pick — ask "Source X says Y, source Z says W. Which is current?" before resolving.

### Phase 1: Parallel Source Reads

`Read` all sources that exist in parallel (single message, multiple tool calls). Skip silently if a source is absent.

### Phase 2: Field Extraction

Extract each field from the highest-priority source that has it:

#### Tagline
- One short phrase that captures the product's promise
- Look for "Tagline:" in app-marketing-context, or `<title>` / hero `<h1>` of docs/index.html
- Example for GainFrame: "See your gains, frame by frame."

#### Elevator pitch (one-liner)
- One sentence that captures what the product does for whom
- Example for GainFrame: "See what your mirror can't tell you."

#### Category
- Primary App Store / market category
- Example: "AI body composition app for iOS / Health & Fitness"

#### Platform (mandatory field)
- Be specific: iOS only / iOS + Android / web / etc.
- This affects every downstream skill (competitor-discovery uses it for platform-specific bucketing).

#### Features (3-8 verbatim)
- Pull from canonical feature list (app_description.md)
- Each feature: short title + one-sentence description
- Limit to 8 — if there are more, group / consolidate
- Use the CUSTOMER's framing, not internal feature codenames

#### Integrations (real ones only)
- Third-party services the product connects with
- Verifiable: must be in app_description or paid_vs_free_tier
- Example for GainFrame: Apple Health (HealthKit), Hevy (workout API), Google Gemini (AI)

#### Pricing tiers (with what's included)
- Pull from paid_vs_free_tier.md — that's the source of truth
- For each tier: name, price, key inclusions/limits
- Don't invent tiers — only list what's actually shipped

#### Differentiators (4-5)
- Things competitors do NOT have (or do worse)
- Pull from "Unique Differentiator Stack" or "Competitive Differentiators" section
- Each one: a verifiable, specific capability — not "we're better"
- Example for GainFrame: "Camera roll import with auto-pose classification — no other app sorts existing photos by pose"

#### Honest limitations (3-5)
- Things the product does NOT do, or does poorly
- Pull from app_description's "Important" disclaimer + paid_vs_free_tier (free tier limits)
- Be specific. Example for GainFrame: "iOS only — no Android port planned. Solo dev. AI estimates are approximations, not medical advice. Photos sent to Google Gemini for AI analysis (then never stored)."
- These are E-E-A-T credibility builders — content skills use them for honest hedging language

#### Brand voice
- 3-5 short rules describing tone, vocabulary, taboos
- Pull from "Brand Voice" sections + observation of blog post style
- Example for GainFrame: "Confident, not hype-y. Gym-native vocabulary (poses, macros, recomp, FFMI). Privacy-forward. Recurring theme: you did the hard work, the AI reveals the data."

#### Team / founder note
- One paragraph: who built this, why
- Pull from about page / founder bio / app-marketing-context
- Used by comparison-article-generator for "Built by an engineer who lifts" type credibility framing

#### Implementation override (the single highest-value paragraph)
- This is GrowGanic's killer field. It's the ONE paragraph that, if missing, would derail every downstream skill.
- Should answer: What's surprising about this setup that an article writer would otherwise get wrong?
- Example for GainFrame: "iOS-only solo-dev project. Body composition is estimated from a photo via Google Gemini AI (NOT direct measurement like DEXA or BIA scales). Photos are sent to Gemini for inference but never persisted on any server. Free tier hard-caps at 25 photos lifetime; Pro is $5.99/mo or $39.99/yr. Built for serious gym-goers, not casual fitness users."
- Without this: articles will guess that GainFrame uses BIA, that it's available on Android, that there's a research-grade accuracy claim, etc. — all wrong.

### Phase 3: Gap Analysis + Clarifying Questions

For any field that's missing or unclear after Phase 2, ask the user a targeted question. **Only ask about gaps — don't re-confirm fields that are well-sourced.**

If everything is well-sourced (likely the case for GainFrame given the rich docs), skip this phase entirely and proceed to Phase 4.

### Phase 4: Synthesis & Output

Write `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/product-context.md` with this structure:

```markdown
# GainFrame — Product Context

> **Last updated:** YYYY-MM-DD
> **Refresh cadence:** Quarterly, or whenever a major product change ships (new tier, removed feature, audience pivot, brand refresh)
> **Consumed by:** keyword-discovery, competitor-discovery, blog-post-generator, comparison-article-generator
> **Operational metrics (MRR, conversion, ASA performance) live in:** `../gain-frame/app-marketing-context.md`

---

## Implementation Override (read this first)

[The single highest-value paragraph — describes what's surprising about the setup that an article writer would otherwise get wrong]

---

## Tagline & Pitch

- **Tagline:** [...]
- **Elevator pitch:** [...]
- **One-liner alternates:** [optional — 1-2 alternates if the source has them]

---

## Category & Platform

- **Primary category:** [...]
- **Platform:** [iOS only / iOS + Android / web / etc.]
- **App Store ID:** [if iOS]
- **Website:** [...]

---

## Features (N)

[Up to 8 — verbatim from app description. Format: bold title + one-sentence description.]

1. **[Feature name]** — [one-sentence description]
2. ...

---

## Integrations

[Real third-party connections only. Format: name — what it provides.]

- **[Service name]** — [what it provides]
- ...

---

## Pricing Tiers

| Tier | Price | What's included |
|---|---|---|
| ... | ... | ... |

[Notes on limits, e.g. "Free tier hard-caps at 25 lifetime photos."]

---

## Differentiators

[4-5 items. Each must be verifiable, specific. NOT "we're better" — concrete capabilities.]

1. [Differentiator with rationale]
2. ...

---

## Honest Limitations

[3-5 items. The truth about what the product does NOT do or where it's weak.]

1. [Limitation with rationale or context]
2. ...

---

## Brand Voice

[3-5 rules describing tone, vocabulary, taboos.]

- ...

---

## Team / Founder

[One paragraph: who built this, why.]

---

## Sources

For traceability, here's where each field was sourced from:

| Field | Source(s) |
|---|---|
| Tagline | `../gain-frame/app-marketing-context.md` |
| Features | `../gain-frame/docs/app_description.md` |
| Pricing | `../gain-frame/docs/paid_vs_free_tier.md` |
| ... | ... |

---

## Refresh log

- YYYY-MM-DD: Initial creation. Sources as listed above.
```

### Phase 5: Update Sister Skills

After writing the file, update the **Reference Files** section of each downstream skill SKILL.md to point to `seo-tools/product-context.md` as the FIRST source to read:

- `.agent/skills/keyword-discovery/SKILL.md`
- `.agent/skills/competitor-discovery/SKILL.md`
- `.agent/skills/competitor-scan/SKILL.md`
- `.agent/skills/blog-post-generator/SKILL.md`
- `.agent/skills/comparison-article-generator/SKILL.md`

The downstream skills should treat `seo-tools/product-context.md` as authoritative — if they need to know the tagline, the platform, the differentiators, or the honest limitations, they read this file first.

---

## Rules & Constraints

- **Never invent fields.** If a field is missing from all sources, ask the user. Do not make up taglines, fabricate pricing tiers, or guess at integrations.
- **Verbatim when possible.** Pull tagline, hero copy, feature names directly from the source. Don't paraphrase.
- **Track sources per field.** Future-you will thank present-you for the source attribution table.
- **Filter out operational data.** No conversion rates, no MRR, no goals/targets, no week-by-week plans. Those belong in `app-marketing-context.md`.
- **Keep features under 8.** If the product has 12 features, consolidate or rank — content skills can't usefully reference 12 features in one article.
- **Limit differentiators to 5.** Same reason. The TOP 5 verifiable differentiators are more useful than 12 vague ones.
- **Limit limitations to 5.** Honest limitations are precious — too many dilutes the credibility.
- **Refresh cadence is quarterly OR on major product change.** Don't refresh weekly — this is the stable doc.

---

## Integration with Other Skills

**Upstream:** None — first/foundational skill, user-invoked.

**Downstream (all skills inherit this file):**
- `keyword-discovery` — uses category + platform + differentiators to seed keyword brainstorming
- `competitor-discovery` — uses platform + differentiators to filter relevant competitors
- `competitor-scan` — uses honest limitations to ground "what we don't claim" comparisons
- `blog-post-generator` — uses tagline + features + brand voice for every post
- `comparison-article-generator` — uses differentiators + honest limitations for honest comparison framing

When this skill finishes, suggest re-running upstream skills (keyword-discovery, competitor-discovery) so they pick up any context changes.

---

## Reference Files

- **Output:** `/Users/michael.rode/code/project/gain-frame-privacy/seo-tools/product-context.md`
- **Primary source:** `/Users/michael.rode/code/project/gain-frame/app-marketing-context.md`
- **Secondary sources:** `/Users/michael.rode/code/project/gain-frame/docs/app_description.md`, `paid_vs_free_tier.md`, `aso-metadata.md`, `competitive_analysis_modern.md`
- **Marketing operations doc** (sibling, not consumed by this skill): `/Users/michael.rode/code/project/gain-frame/app-marketing-context.md`
