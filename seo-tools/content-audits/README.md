# Content audits

Written by the `seo-content-cycle` skill (`.agent/skills/seo-content-cycle/SKILL.md`).

| File | What it is |
|---|---|
| `YYYY-MM-DD.md` | The record of one run — performance, cluster health, market data, what was proposed, what shipped, what to watch. Written in review runs too, with `Status: Proposed`. |
| `strategy.md` | Rolling state across runs: current cluster bets, hypotheses ruled out, proposed-but-not-built items, and every post inside a measurement window with the date it becomes fair to judge. **Read first, updated last.** |

These are the skill's memory. Without `strategy.md`, every run re-derives the same conclusions and
re-proposes the same ideas.

Related, and not written by this skill:

- `../topical-map.md` — the cluster map. Updated when posts ship.
- `../TODO_SEO.md` — the keyword backlog, shared with `keyword-discovery`.
- `../content-inventory.mjs` — the offline link-graph / cannibalization / freshness checker.
