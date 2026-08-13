# Leaderboard share cards

The public leaderboard and listed member profiles can create a 1080 × 1350
(4:5) PNG from the same narrow public standings DTO already shown in the UI.

## Templates

- `standings`: cream top-five scorebook plus a separate selected row
  when the member is outside the top five.
- `rank_flex`: coral achievement poster with the selected rank and compact top
  five.
- `chasing_five`: cream/sage progress card with the score gap to rank five.

When the selected member is already in the top five, their existing row is
highlighted and is never duplicated. Cards contain public username, rank,
score, selected goal filter, and period only. Avatar, bio, region, training
details, proof photos, and scan media are not read by the renderer.

The browser renders the card to a canvas at export resolution. It uses the Web
Share API when file sharing is supported and otherwise downloads a PNG.

## Analytics and Slack

Final Share or Download intent emits:

```text
leaderboard_share_clicked
```

Properties are strictly:

```text
platform=web
template=standings | rank_flex | chasing_five
placement=leaderboard | member_profile
rank_bucket=top_1 | top_5 | top_10 | top_25 | rank_26_plus
goal=all | Lose Weight | Gain Muscle | Body Recomp
period=all_time | year | month | week
```

The event is subject to the website analytics consent decision and is best
effort. No username, profile/entry ID, avatar, or browser identity is attached
by the share feature. The central server-side PostHog product monitor owns the
private Slack notification; the browser has no Slack webhook or secret.

Supporting consent-aware events use the same property contract:

- `leaderboard_share_previewed`
- `leaderboard_share_template_selected`

## Verification

```bash
npm run test:leaderboard
npm run test:tools
npx tsc --noEmit
npm run build
```
