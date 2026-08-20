# GainFrame 3.0 App Store Screenshots

The currently staged English (U.S.) App Store assets remain unchanged in
`final/en-US/`. The new-feature refresh is isolated in `review/en-US/` so it
can be approved before anything is copied to Fastlane staging.

The legacy simulator captures remain at this directory's root. Fresh semantic
captures from the preserved Gainframe simulator live in
`raw/en-US/iphone-6.3/` (1206 x 2622). They include real production UI with
deterministic DEBUG-only fixtures for Archetype, Nutrition, and Leaderboard,
plus three Deep Dive alternatives. The fixtures use an isolated in-memory
store and the leaderboard contains fictional users only.

## Current final iPhone order

1. **See what's actually changing.** — before/after transformation
2. **Know where you stand.** — score and body composition
3. **Get coaching that knows you.** — context-aware Coach
4. **See every muscle changing.** — muscle-group comparison
5. **See your future self.** — disclosed AI-generated projection
6. **One clear daily read.** — check-in, body fat, and recovery
7. **See what the scale misses.** — connected training and recovery trends
8. **Bring every photo together.** — camera-roll history import
9. **Follow the trend, not the noise.** — weight trajectory and milestones
10. **Make consistency visible.** — check-in streak

All final files are 1320 x 2868 RGB PNGs without alpha channels. The set is
for the iPhone 6.9-inch App Store screenshot slot. iPad and localized sets are
not included in this release folder.

## New-feature review order

1. **See what's actually changing.** — before/after transformation
2. **Know where you stand.** — score and body composition
3. **Get coaching that knows you.** — context-aware Coach
4. **Find your physique archetype.** — local archetype match
5. **See every muscle changing.** — muscle-group comparison
6. **See your future self.** — disclosed AI-generated projection
7. **One clear daily read.** — check-in, body fat, and recovery
8. **Fuel the physique you're building.** — nutrition and macro targets
9. **Put your score on the board.** — privacy-conscious leaderboard
10. **Bring every photo together.** — camera-roll history import

The review output is also 1320 x 2868 RGB without alpha. The three new cards
embed unretouched app UI captured from the 6.3-inch simulator into the accepted
6.9-inch App Store canvas.

## Regenerating the review set

Run `scripts/generate_app_store_screenshots_v300_refresh.py` with the bundled
Codex Python environment. The generator validates raw dimensions, opaque
alpha, final dimensions, RGB output, and uniqueness, and writes both raw and
final contact sheets. It never changes `final/en-US/`.

Fastlane publishing is deliberately opt-in via `--publish-fastlane` and has
not been run for this review set.
