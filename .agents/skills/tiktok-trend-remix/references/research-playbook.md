# TikTok Fitness Slideshow Research Playbook

## Contents

1. Internal exclusion scan
2. Search order
3. Candidate capture
4. Pattern grouping
5. Trend score
6. Evidence quality
7. Failure and fallback behavior

## 1. Internal exclusion scan

Run the archive scan in `novelty-gate.md` before accepting candidates. External
research answers what is moving now; the archive scan answers whether GainFrame
has already made it. A current external outlier still fails when its natural
adaptation reproduces an existing GainFrame hook, sequence, payoff, visual
system, or signature metaphor.

## 2. Search order

Use fresh browsing on every run. Start with TikTok and expand only when needed.

### TikTok-native discovery

Search combinations of:

- `fitness app slideshow`
- `gym app photo carousel`
- `progress photo app`
- `body transformation slideshow`
- `body fat app`
- `workout tracker app`
- `gym mistakes carousel`
- `fitness app before after`
- `#fitnessapp`, `#gymtok`, `#progressphotos`, `#bodytransformation`,
  `#bodycomposition`, `#workouttracker`

Inspect three account groups:

1. Fitness, nutrition, workout, and body-composition apps.
2. Creators who repeatedly publish photo-mode fitness education.
3. Adjacent transformation, habit, weight-tracking, or wellness brands.

Do not rely on a hard-coded account list. Handles and active competitors change.
Discover current accounts from search results and verify that each is the real
account before recording it.

### Web-search fallback

If TikTok search is blocked or incomplete, use recent web queries such as:

```text
site:tiktok.com fitness app slideshow
site:tiktok.com/@*/photo progress photos fitness app
site:tiktok.com body composition carousel
site:tiktok.com gym tips slideshow
```

Open the direct post whenever possible. Search snippets may help discovery but
are not sufficient evidence for a date or metric that cannot be confirmed on the
post.

### Corroboration

Use Instagram carousels, Reels, YouTube Shorts, Reddit discussions, or TikTok
Creative Center only to explain wider momentum. A cross-platform example cannot
replace TikTok evidence when the conclusion says `TikTok trend`.

## 3. Candidate capture

Aim to inspect 12-20 posts for one output. For batches, inspect enough posts to
surface at least six distinct mechanics; do not stop after finding many examples
of the first successful mechanic. Retain the best-supported candidates across
different format families. For each retained post record:

| Field | Requirement |
|---|---|
| URL | Direct post URL, not a search page |
| Creator | Display name and handle |
| Account type | App, brand, or creator |
| Published | Exact date if visible; otherwise `unknown` |
| Observed | Current research date and timezone |
| Metrics | Views, likes, comments, shares, and saves only when visible |
| Baseline | Median views of up to 10 recent comparable posts when obtainable |
| Format | Photo carousel/slideshow confirmation and slide count |
| Hook | Paraphrased hook archetype, not copied text |
| Mechanic | Pacing, reveal, proof device, and CTA |
| Relevance | Why it maps to GainFrame |

Never infer a hidden metric. A TikTok like count is not a view count. A search
snippet's date may be an index date rather than the publish date; mark it as
uncertain unless the post confirms it.

For any post that will drive production, `Published` cannot remain `unknown`.
Open the direct TikTok post and verify the date there. The visible heart count is
likes, not views. Record likes, comments, favorites/saves, and shares exactly as
TikTok labels them; do not relabel them as views or engagement baselines.

## 4. Pattern grouping

Group candidates by the behavior that makes the post work. Topic similarity is
not enough.

Good group:

> Five slides open with a self-doubt statement, reveal objective progress on
> slide four, and end with a tracking tool.

Weak group:

> All posts are about fat loss.

Describe each grouped pattern with:

- hook formula;
- slide sequence;
- proof or tension-release moment;
- visual grammar;
- CTA or product placement;
- audience emotion;
- evidence that multiple accounts are using it.

For batch research, cap any one mechanic at one-third of the retained candidate
pool. A second example may strengthen evidence for a mechanic, but it must not
crowd distinct mechanics out of the shortlist.

## 5. Trend score

Score each grouped pattern out of 10.

### Recency: 0-2

- `2`: at least one qualifying post from the last 14 days.
- `1`: newest qualifying post is 15-45 days old.
- `0`: all examples are older or dates are unknown.

An undated or older-than-45-days post may corroborate recurrence but cannot be a
batch's primary production reference. In a five-post production batch, at least
three primary references must be within 30 days.

### Recurrence: 0-3

- `3`: at least three posts across at least two accounts.
- `2`: two posts across at least two accounts.
- `1`: repeated by one account only.
- `0`: one post.

### Performance evidence: 0-2

- `2`: multiple examples materially outperform their account baseline, or one is
  at least 2x baseline and another has strong corroborating engagement.
- `1`: at least one example is above baseline or has unusually strong visible
  comments/shares/saves.
- `0`: performance is ordinary, unknown, or supported only by raw follower size.

### GainFrame fit: 0-2

- `2`: the mechanic naturally supports progress photos, body-composition trends,
  workout data, or a real app reveal.
- `1`: it can fit with a meaningful rewrite.
- `0`: GainFrame would feel bolted on.

### Originality room: 0-1

- `1`: the mechanic can be expressed with original copy and GainFrame visuals.
- `0`: the appeal depends on copying a creator, proprietary art, branded UI, or
  exact wording.

Do not use score alone to upgrade a single post into a trend. Apply the labels:

- `Strong trend`: recurrence 3, total at least 7, credible performance evidence.
- `Emerging pattern`: recurrence 2, total at least 6.
- `Standout inspiration`: recurrence 0-1, regardless of total.

## 6. Evidence quality

Prefer, in order:

1. Direct TikTok post with visible date and metrics.
2. Direct TikTok account page plus the direct post.
3. TikTok Creative Center or another first-party TikTok page.
4. Search result used only to discover the direct source.
5. Third-party analytics used as corroboration and clearly labeled.

When comparing performance, normalize against the creator's recent comparable
posts. A million-view post from a massive account may be ordinary; a 50k-view
post from a 2k-follower niche app may be exceptional.

Separate observations from interpretation:

- Observation: `The post shows 240k views and was published 12 days ago.`
- Inference: `Its comment prompts may be driving distribution.`

## 7. Failure and fallback behavior

If TikTok blocks access:

1. Try web search, first-party TikTok discovery pages, and an available
   interactive logged-in browser. Do not bypass access controls.
2. Use accessible direct posts with visible evidence.
3. Treat discovery/channel pages as leads only. Do not score them as candidate
   posts, count them toward recurrence, or cite them as proof of a trend.
4. If direct post evidence is still unavailable, return a `Research blocked`
   handoff containing the searches attempted and the exact missing evidence.
5. Ask the user for at least three direct post links or screenshots that show the
   handle, post date, visible metrics, and slide sequence. Alternatively, ask the
   user to make a logged-in TikTok browser available.
6. Do not generate a "trend-backed" post from this blocked state. Continue only
   if the user explicitly accepts an `inspiration-only` adaptation.

If fewer than two accounts support a mechanic, present it as `standout
inspiration`, not `trending`. Continue by offering an original adaptation if the
user wants it, but preserve the weaker label in `trend-brief.md`.

If no pattern scores at least 6, stop before generation and report that current
evidence is too weak. Suggest the best emerging inspiration without overstating
it.
