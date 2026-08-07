---
name: tiktok-trend-remix
description: "Researches current external TikTok fitness photo carousels and slideshows, verifies outlier formats, rejects concepts already used in GainFrame's TikTok archive, and produces greenfield GainFrame adaptations with new hooks, sequences, and visual systems. Enforces evidence, structural diversity, and archive-level novelty across batches. Use when the user asks to find trending or viral fitness slideshows, discover new TikTok formats, avoid recycling existing GainFrame content, or make one or more fresh trend-backed GainFrame carousels."
---

# TikTok Trend Remix

## Overview

Find a current, evidence-backed external TikTok fitness slideshow pattern and
turn its mechanics into a genuinely new GainFrame post. Treat every existing
GainFrame TikTok post, draft, template, and visual system as an exclusion set,
not as inspiration. Research live posts first; never call a format "trending"
from memory or from a single reference.

Read these resources before starting:

- Read [research-playbook.md](references/research-playbook.md) before browsing or
  scoring candidates.
- Read [trend-brief-template.md](references/trend-brief-template.md) before saving
  the selected concept.
- Read [novelty-gate.md](references/novelty-gate.md) before selecting any concept.
- Read [quality-gate.md](references/quality-gate.md) before drafting or generating.
- For requests containing three or more posts, read
  [format-diversity.md](references/format-diversity.md) before selecting concepts.

## Output contract

Produce two deliverables:

1. A cited trend shortlist and one or more selected GainFrame adaptations.
2. Finished greenfield carousels with source-native executions, using current
   GainFrame product assets only where product truth requires them.

Save the research record as `trend-brief.md` inside the finished post directory.
Save greenfield posts under `docs/assets/tiktok/trend-remix/<batch>/<slug>/`
unless the user names another destination. Keep `slide-0-cover.png`, sequential
`slide-N.png` files, `content.md`, `spec.md`, and `trend-brief.md`. Package only
finished PNGs plus `content.md` into TikTok Drafts.

## Workflow

### 1. Define the research frame

Infer a narrow research frame from the request:

- Audience: default to English-speaking US fitness consumers.
- Platform: TikTok photo posts/carousels first. Use Instagram or YouTube only as
  corroboration, never as sole proof of a TikTok trend.
- Category: fitness apps, body composition, progress photos, workout tracking,
  gym education, or transformation content.
- Window: prioritize the last 30 days; expand to 90 days only to confirm
  recurrence.

If the user provides a post, treat it as one candidate rather than automatic
proof of a trend.

### 1.5. Build the internal exclusion set

Before external research selection, inventory existing posts under
`docs/assets/tiktok/`, `promo-source/tik-tok-slides-jack/`, and the TikTok Drafts
folder. Follow [novelty-gate.md](references/novelty-gate.md). Extract each post's
hook, sequence, payoff, visual grammar, CTA, and signature metaphor.

Reject an external candidate when its GainFrame adaptation would substantially
recreate an internal post. Never keep an old post as one slot in a requested new
batch. Never use existing GainFrame TikTok slides as image-generation style
references. Current app screenshots, logos, and verified product copy are
product sources and may be reused; finished social creatives are not.

### 2. Research current examples

Browse the live web. Collect recent TikTok slideshow candidates across official
fitness-app accounts, fitness creators, and adjacent progress-tracking brands.
Record a direct source URL, creator/account, publish date, visible metrics, and
the repeated format mechanic for every candidate.

For production work, reject candidates without a directly verified publish
date. The primary example for each selected format must be no older than 45 days,
and at least three of five selections in a batch must be no older than 30 days.

Use only observable evidence. Mark unavailable dates or metrics as `unknown`.
Never invent view counts, engagement, saves, shares, or account baselines.
Discovery/channel pages may surface leads, but do not count them as candidate
posts or recurrence evidence without direct post-level confirmation. If TikTok
blocks post-level access, follow the blocked-source handoff in the research
playbook and stop before calling anything a trend.

### 3. Qualify the trend

Group posts by repeatable mechanic, not merely by topic. Examples include:

- accusation or misconception -> evidence reveal;
- numbered mistakes -> corrective action;
- transformation timeline -> data explanation;
- app ranking -> unexpected middle-slot product;
- identity hook -> habit sequence -> product payoff;
- before/after photo -> metric breakdown.

Score each grouped pattern with the rubric in the research playbook. Label it:

- `Strong trend`: repeated across at least three recent posts and two accounts,
  with credible performance evidence.
- `Emerging pattern`: repeated across at least two accounts but with limited or
  mixed performance evidence.
- `Standout inspiration`: one notable post only. Do not call it a trend.

Reject candidates whose appeal depends mainly on a celebrity, copyrighted
character, proprietary template, misleading claim, or result GainFrame cannot
truthfully reproduce.

### 4. Enforce structural diversity for batches

When the request contains three or more posts, select the batch as a portfolio.
Topic changes do not count as format changes. Fingerprint every concept using:

`hook archetype + slide sequence + proof/payoff + visual grammar + CTA behavior`

Two concepts are too similar when three or more fingerprint fields match. A
five-post batch must satisfy all of these constraints:

- use at least four distinct format families from `format-diversity.md`;
- include at least three posts that are not rankings, roundups, or numbered
  lists;
- include no more than one app ranking or app roundup;
- preserve each source's production signal instead of inventing a visual system
  or metaphor to force difference;
- repeat neither a cover formula nor a reveal sequence;
- give every post a different viewer job: learn, identify, compare, feel, test,
  decide, or witness proof.

If the proposed batch fails a constraint, replace concepts before drafting.
Never treat different audiences, app lineups, or titles as sufficient variance.
Run the archive novelty gate after the batch diversity gate; both must pass.

### 5. Present a cited shortlist

Present the best three patterns in a compact table:

| Pattern | Evidence | Why it is moving | GainFrame fit | Score |
|---|---|---|---|---:|
| ... | Direct links + dates + visible metrics | Repeatable mechanic | Original angle | /10 |

Recommend the requested number of patterns and explain the choices. For a batch,
include the format fingerprint and production route for every selection plus a
one-paragraph diversity audit. Distinguish facts from inference. Wait for
approval before drafting unless the user explicitly asked for autonomous
end-to-end execution.

### 6. Build original GainFrame adaptations

Extract only the transferable mechanics:

- hook archetype;
- number and purpose of slides;
- pacing and reveal order;
- text density;
- emotional arc;
- proof or payoff device;
- CTA placement.

Do not copy exact wording, unique illustrations, creator likeness, branded UI,
watermarks, screenshots, or a competitor's distinctive visual identity. Do not
pass competitor slides into an image generator as visual references. Create new
copy, scenes, examples, and product-specific proof while preserving the
source's native production signal. Make at least three material changes beyond
replacing the brand name, and make at least three material changes relative to
the nearest internal GainFrame post.

Verify GainFrame product claims against current local sources:

- the shipping App Store version and current official listing assets for real
  product UI;
- `web/content/blog/*.mdx` for supported positioning and explanations;
- the current App Store listing for price, platform, and feature claims that may
  have changed.

Do not infer that the highest-numbered local screenshot directory is current.
Verify the shipping version through the official App Store/iTunes record, record
the version and release date in the batch brief, and reject any screenshot whose
known version is older. If a current bare app capture is unavailable, use a
current official listing asset or stop and request a current capture.

Treat photo-derived body-fat, FFMI, and muscle scores as estimates. Never imply a
medical diagnosis, guaranteed result, or clinical accuracy without a current
source that supports the exact claim.

Draft the complete adaptation as:

| Slide | Role | Exact text | Original visual | Trend mechanic retained |
|---|---|---|---|---|
| Cover | Hook | ... | ... | ... |
| 1 | ... | ... | ... | ... |

Add an originality audit with two lists: `Retained mechanics` and
`Deliberately changed`. Get copy approval before spending image-generation
credits unless the user explicitly waived review.

For batches, draft all concepts before generating any slides and run the
diversity gate from `format-diversity.md`. If it fails, revise the batch first.

### 7. Save each trend brief

Create the greenfield output directory, then save `trend-brief.md` using
[trend-brief-template.md](references/trend-brief-template.md).
Include all cited candidates, the scoring decision, exact approved slide copy,
claim sources, and the originality audit.

### 8. Build greenfield visual systems

Default to greenfield production. Existing TikTok skills may be read for export
contracts or technical utilities, but do not inherit their art direction,
mascot, cover grammar, typography system, slide template, or copy formula.

For every carousel, define a source-fidelity line in `spec.md` covering:

- medium and photographic or illustrative language;
- composition grid and type behavior;
- palette and texture;
- source-native visual grammar and production signal;
- explicit differences from the nearest internal post.

Match the source's production signal. A raw camera-roll slideshow must remain
raw and TikTok-native; it must not become an editorial poster, illustration,
branded diagram, or invented metaphor. A designed guide may use deliberate
layout, but only at the visual complexity demonstrated by current successful
examples. Greenfield means new assets and copy, not maximum art direction.

Before generation, run the comprehension and source-fidelity checks in
`quality-gate.md`. Reject a concept if its first two slides do not form a clear
sentence, question/answer, setup/payoff, or useful sequence when read without a
trend explanation.

Use the image-generation skill for new raster scenes and deterministic
composition for exact text, grids, diagrams, chat UI, or product inserts. Do not
pass any finished GainFrame social creative into image generation as a style
reference. Generate one carousel at a time, then compare its completed cover and
contact sheet with the internal exclusion set and the rest of the new batch.
Use real current GainFrame screenshots for product UI; never ask an image model
to redraw UI that can be composited or shown from a real source.

### 9. Package and report

Export every slide at 1080x1350 PNG and copy the requested drafts to TikTok
Drafts. In the final handoff, include:

- the selected trend label and why it qualified;
- direct links to the strongest source examples;
- the finished slide and draft directories;
- which mechanics were retained and what was made original;
- any claim or metric that remains uncertain.

For batches, also report the format family, source-native visual grammar,
semantic promise, and viewer job for each post. State explicitly whether both
the diversity and archive-novelty gates passed.

## Guardrails

- Research must be current on every run. Do not reuse an old trend brief as
  proof that the pattern is still trending.
- Never use GainFrame's own historical TikTok posts as trend evidence.
- Never reuse an old draft as one slot in a requested new batch.
- Never use an existing finished GainFrame TikTok slide as a style reference,
  base image, layout template, or copy scaffold.
- Do not route greenfield work through an old production visual system unless
  the user explicitly asks for that established series.
- A single high-view post is inspiration, not a trend.
- Use direct post links wherever possible; do not cite search-result pages as
  evidence.
- Keep the first slides value-first unless the researched format is explicitly
  app-led.
- Never fill a batch by cloning one proven mechanic with different subjects.
- Brand every output as GainFrame-owned, but do not turn every slide into an ad.
- Never fabricate competitor weaknesses, app ratings, user results, or fitness
  claims.
- Never call a post current when its direct page date is unavailable.
- Never use a screenshot from a known older app version.
- Never overdesign a raw UGC mechanic.
- Preserve sequential hyphenated slide filenames.
