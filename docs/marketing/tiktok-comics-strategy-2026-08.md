# TikTok Comics — Skill Upgrade & Output Strategy (Aug 2026)

Reference account: [@gymmadesimple](https://www.tiktok.com/@gymmadesimple).

> **Caveat:** this doc was drafted from a cloud session where TikTok (and its
> mirrors) are egress-blocked, so post-level data for @gymmadesimple could not
> be pulled. The analysis below is grounded in the account's positioning
> ("gym made simple" = beginner-first simplification) and the mascot-comic
> carousel genre it shares with the "Blue Bro" accounts already profiled in
> `STYLE_GUIDE.md`. Next session on the Mac: screenshot their top 12 pinned/
> popular posts and fold real numbers into the lane weights below.

---

## 1. What the reference genre does that we should steal

1. **A named, repeatable promise.** "Gym made simple" tells you what every
   post will do before you open it. Our log is strong on myth-busts but has no
   *simplification* franchise — the lane that converts beginners, and beginners
   save and share the most. → New recurring series: **THE SIMPLE VERSION**
   (one intimidating topic per episode, compressed to 4 rules).
2. **Series over one-offs.** Genre leaders run episode formats (ranked S–F,
   term-of-the-week, "what actually builds X"). Episode N trains viewers to
   want N+1 → follows, not just saves. We already have accidental series
   (micro myth two-sliders, tier lists); make them explicit and visually
   identical episode to episode.
3. **Cadence.** These accounts post 1–2 carousels/day. Views per post are
   noisy; the grid compounds. Our pipeline makes a 10-post batch ≈ one
   authoring session + ~$3 of credits → **two batches/month = daily posting.**
4. **Comment-bait captions.** Rankings and myth-busts win when the caption
   invites a fight ("defend your ranking"), not when it summarizes the post.
5. **Simplicity of the visual system is the moat.** One character, one
   background, one type system. We already have this — the improvements below
   protect throughput, not style.

## 2. What changed in this PR

- **Pipeline is now portable.** `build.py` / `micro_build.py` / `clean_refs.py`
  derived the repo root from a hardcoded `/Users/michael.rode/...` path and
  `compose.py` required macOS-only fonts — comics could only be built on one
  laptop. Root now derives from the script location (`GAINFRAME_ROOT`
  overrides), and fonts resolve through a candidate list with Linux fallbacks
  (`GF_IMPACT_FONT` / `GF_BODY_FONT` pin exact files). Verified end-to-end on
  Linux by recomposing `do-you-need-to-squat` from cached art. Batches can now
  be authored *and built* from Claude Code on the web; final pixel-parity
  builds still belong on a machine with real Impact.
- **The skill is now versioned in the repo** at `.claude/skills/tiktotk/SKILL.md`
  and rewritten pipeline-first. The previously synced copy on claude.ai was
  badly stale: old `/Users/...` paths, beige background, one-image-at-a-time
  hand-prompting with text baked into the art, no QA gates, no grid-safe
  rules, no manifest/transcript steps. Replace the synced copy with this one.
  (`.agent/skills/tiktok/` and `.agents/skills/tiktok/` remain for
  Antigravity/Codex; align or retire them separately.)
- **The skill is batch-first.** "New comics" now defaults to a themed 10-post
  batch with a mandatory dedup pass against `POST_LOG.md`, explicit idea
  lanes, series guidance, and comment-bait caption rules.

## 3. Lane weights for the next month

| Lane | Share | Why |
|------|-------|-----|
| Myth-bust question hooks | 30% | Proven top performer; keep feeding it |
| Made-simple cheat sheets (new) | 25% | Beginner save-magnets; the reference account's whole thesis |
| Tier lists / rankings | 15% | Comment velocity |
| Micro two-sliders | 15% | Cheapest per post; grid filler between batches |
| Archetype / relatable humor | 10% | Reach outside gym-advice graph |
| Promo / real-photo transformation | 5% | Converts; don't overdo |

## 4. Ready-to-author backlog (deduped against POST_LOG, 2026-08-12)

### Batch A — "THE SIMPLE VERSION" (made-simple cheat sheets)
1. **HOW MANY SETS / DO YOU NEED?** — 10–20 hard sets per muscle per week; the rest is noise.
2. **HOW LONG SHOULD / YOU REST?** — 2–3 min compounds, 60–90s isolation.
3. **HOW HEAVY SHOULD / YOU LIFT?** — 5–30 reps builds muscle if near failure.
4. **WHAT TO EAT BEFORE / AND AFTER LIFTING** — kills the anabolic-window residue.
5. **CUTTING IN / 4 RULES** — deficit, protein, lifting, patience.
6. **THE 80/20 OF / BUILDING MUSCLE** — the four things that matter.
7. **IS YOUR WORKOUT / TOO LONG?** — junk volume vs effective sets.
8. **CAN YOU GROW WITH / ONLY DUMBBELLS?** — home-lifter audience.
9. **THE ONLY 6 EXERCISES / A BEGINNER NEEDS** — starter template.
10. **HOW MUCH MUSCLE / IN A YEAR?** — natural rates by training age → perfect GainFrame compare plug.

### Batch B — myth-bust question hooks (fresh topics)
DOES LIFTING STUNT GROWTH? · WHAT BREAKS A FAST? · DO YOU NEED A REST DAY? ·
IS SORE THE NEXT DAY GOOD? · DOES CREATINE CAUSE HAIR LOSS? · IS BREAKFAST
REALLY THAT IMPORTANT? · DO CALVES EVEN GROW? · IS OVERTRAINING REAL? ·
DOES ALCOHOL ERASE A WORKOUT? · ARE GYM MACHINES SAFER?

### Batch C — series episodes
- **GYM TERMS YOU PRETEND TO KNOW**: RPE · PPL · DOMS · AMRAP · PR vs 1RM.
- **RANKED S TO F**: protein sources · cardio for lifters · rest-day
  activities · pre-workout rituals.
- **Comment-bait one-off:** HOW LONG UNTIL PEOPLE NOTICE YOU LIFT? (answers
  range 3–12 months → GainFrame photo-timeline plug writes itself).

## 5. Follow-ups (not in this PR)

- Pull @gymmadesimple's actual top posts from the Mac and re-weight lanes.
- Cross-post every carousel to Instagram via the `instagram-panel` skill;
  same art, no extra generation cost.
- Track per-lane performance in PostHog/TikTok analytics monthly; kill lanes
  that underperform two batches running.
