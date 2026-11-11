---
name: tiktotk
description: "Create saveable GainFrame workout-tip carousels with the lean-athletic comic mascot, useful training examples, and a relevant GainFrame app plug in every post. Generates every slide (typography included) with the OpenAI image API (gpt-image-2) via _pipeline/openai_image.py, then writes captions, gallery assets, iCloud drafts and Postiz bookings. Use for \"tiktok\", \"tiktok post\", \"new comics\", \"carousel batch\", \"mascot post\", \"gainframe guy\". For plush Gary use the tiktok-gainframe-plush skill."
---

# GainFrame TikTok Creator

Create complete posts: copy, finished artwork, captions, gallery assets, phone
drafts, and (when asked) Postiz bookings.

**Default since October 27, 2026:** the original lean-athletic comic GainFrame
Guy, more frequent app promotion, and workout advice people will save and use.
This supersedes the September 24 plush default and the older Gemini + Pillow
six-slide pipeline (still used to edit old posts, see "Editing older posts").

## Select the workflow

- Default, `style=comic`, "old mascot", "old comic style": this file.
- Explicit `style=plush` or plush Gary: the separate `tiktok-gainframe-plush`
  skill (`.agents/skills/tiktok-gainframe-plush/`). Never blend the two head designs.
- Standalone memes or joke batches: follow `.agents/skills/tiktok-meme/`. Do not
  force an educational carousel onto a meme.
- Integration announcements use the current comic mascot unless another style is
  explicitly requested. Verify release status and actual behavior first.

## Default character

Read `docs/assets/gainframe-guy/illustrations/STYLE_GUIDE.md` and look at:
- `gainframe-guy-lean-athletic-reference.png`: physique, shading, palette (current master).
- `gary-badge.png`: face identity.
- `gainframe-guy-default-numbered.png`: numbered-slide header/layout only; its
  older bulkier body does not override the lean-athletic reference.
- `gainframe-guy-default-cover.png`: historical bulkier cover; comic treatment only.

All live in `docs/assets/gainframe-guy/illustrations/`. Pass them as `--ref`
images and name each image's role in the prompt ("Image 1 is the visual master
for physique, shading and palette; image 2 is the face reference").

Look: open scan-frame head made of four disconnected L corners with a white/open
interior, three black corners and a red lower-right corner, asymmetric eyes and
an attached sweeping S-curve nose. Strong lean-athletic charcoal body (moderately
broad shoulders, smaller chest and arms, natural waist, restrained definition),
restrained two-tone cel shading, olive shorts, taupe trainers. Crisp comic
linework, mostly pure white background with one or two small pale washes (ice
blue, blush, lavender, pale gold) away from the text. No filled cushion head,
plush texture, bodybuilder proportions, or large red diagonal streak.

## Saveable workout content

Check `web/lib/comics-manifest.mjs`, `docs/assets/tiktok/comic/POST_LOG.md` and
recent batches for duplicate angles.

Prefer a concrete gym decision or reference over general reminders: exercise
setup checklists, substitution maps, realistic session templates, progression
examples, rep-quality cues, troubleshooting trees. Make the hook specific and
deliver its promise.

Every educational carousel must include:
- A clear use case: what the reader can do differently in their next workout.
- Five numbered value slides; "Top N" delivers exactly N items.
- At least one screenshot-ready checklist, worked example, comparison, or
  compact reference table within those value slides.
- At least one accurately drawn action scene, and a do/don't comparison when it
  teaches a meaningful distinction.
- A final action the reader can use, not a generic motivation slogan.

State example sets, reps and schedules as examples, not universal prescriptions.
Explain important conditions in plain language. Verify substantive
health/training claims against current primary sources. Keep citations in
`spec.md`, never `content.md`. Do not promise guaranteed gains, diagnose from
photos, or imply a visual muscle score measures activation or growth.

Before generating, write the plan into `<slug>/spec.md`:

| Slide | Title | Subtitle | Scene |
|---|---|---|---|
| Cover | 4-8 word hook, 2-3 lines, red words marked | - | clear visual story |
| 1-5 | 3-7 words, one idea | one short sentence | scene that teaches the point |
| 6 | promo headline tied to the lesson | - | phone + real screenshot |

plus source notes. Spell-check every title and subtitle in the table before any
image is generated; the model renders text verbatim, so a copy typo becomes an
art typo. An authorized batch covers routine topic, copy and artwork choices;
proceed without extra approval checkpoints unless asked.

## GainFrame in every educational post

Structure: **cover + five numbered value slides + one GainFrame promo = seven
slides**. Never replace a promised tip with an ad.

- Tie the promo to the lesson: the training is the action; GainFrame helps the
  user review visual progress or another verified, relevant feature.
- Specific benefit plus a short CTA, e.g. "Track your progress in GainFrame",
  "Compare your check-ins in GainFrame".
- An app mention inside a value slide is optional and must help that slide's
  lesson. No repetitive advertising on every tip.
- Verify features from current product sources and screenshots. Hevy imports
  are not native workout logging. Do not invent workout plans, automatic load
  recommendations, form analysis, clinical measurements or guaranteed outcomes.
- Use a real current screenshot from the newest version folder in
  `docs/app-screenshots/` as a `--ref`. Keep its data/text faithful and inspect
  the output. Never present sample transformations as guaranteed results or as
  the outcome of the featured routine.
- Promo layout: one large portrait phone, slightly tilted, held by one charcoal
  comic hand entering bottom-right; short lesson-linked headline at the top;
  small GainFrame mark beside the phone, never over the screen. No full body,
  arm or huge bicep, no corner badge.
- If no truthful feature connection exists, change the topic or bridge before
  generating the promo.

## Generate with the OpenAI image API

Claude Code has no built-in image tool. Every finished slide, typography
included, comes from `gpt-image-2` through the pipeline helper. Do not switch to
Gemini or another provider without the user's say-so.

```bash
H=docs/assets/tiktok/comic/_pipeline/openai_image.py
I=docs/assets/gainframe-guy/illustrations
python3 $H --out docs/assets/tiktok/comic/<slug>/slide-1.png \
  --prompt-file /tmp/<slug>-slide-1.txt \
  --ref $I/gainframe-guy-lean-athletic-reference.png \
  --ref $I/gainframe-guy-default-numbered.png \
  --ref $I/gary-badge.png
```

- Requests 1088x1360 (exact 4:5; the API needs multiples of 16) and saves a
  1080x1350 PNG. The untouched output goes to `<slug>/_art/<name>.orig.png`; the
  exact prompt, refs, model and token usage go to `<slug>/prompts.json`.
- `--quality high` is the default for finished slides. Use `--quality low` only
  for throwaway composition tests.
- `OPENAI_API_KEY` is read from the environment or `~/.zshrc`.
- **References (learned 2026-11-11):** the lean-athletic master alone renders a
  bulkier mascot than the shipped posts. For the **cover**, use an accepted cover
  from a recent shipped post as image 1 (e.g.
  `docs/assets/tiktok/comic/two-day-full-body-plan/slide-0-cover.png`) plus
  `gary-badge.png`, and tell the model to copy its body, mascot size, light grey
  gym background and wordmark badge. For **slides 1-5**, image 1 is this
  carousel's accepted cover, then `gary-badge.png`, then the numbered master
  (layout only). For the **promo**, this carousel's cover (hand/linework) plus
  the real app screenshot, cropped to the phone screen.
- Generate one slide at a time and look at it (Read the PNG) before the next.
  Independent carousels may run in parallel.

Shared prompt core (append the slide-specific layout):

> Create one finished 4:5 GainFrame Guy fitness comic slide. Match the visual
> master: strong lean-athletic charcoal anatomy with moderate muscle size and
> restrained definition (not a bodybuilder), natural waist, olive shorts,
> taupe-gray trainers, crisp dark outlines, polished two-tone cel shading,
> expressive pose, subtle pale color washes on a mostly pure-white background,
> kept away from text. Head: four SEPARATE floating L brackets with open gaps at
> every side midpoint, black except the red lower-right bracket, white
> background visible inside, asymmetric eyes and S-curve nose from the face
> reference; no filled head or helmet. Exactly one torso, two arms, two hands,
> two legs; plausible grips and equipment. Impact/Bebas-style bold condensed
> titles, clean Helvetica-style subtitles. Render all supplied text verbatim; no
> extra labels or microcopy.

- **Cover:** huge bare uppercase title, 2-3 lines, one or two words red #E53935,
  the rest near-black #1A1A1A; no box or banner behind it. Headline starts around
  18-20% of canvas height, ends by 38%, inside the central 60-70% width. It must
  survive a centered square crop (135 px off top and bottom at 1080x1350).
  Shorten copy before shrinking it. Small badge top-left (may sit outside the crop).
- **Numbered slides:** top edge-to-edge black bar with square corners, about 13%
  of height, red "#N" and white uppercase title on one baseline; dark centered
  sans-serif subtitle below; top 28% free of artwork; scene in the lower 70%. No
  badge, no repeated cover title.
- **Promo:** as described above.

Review every slide for exact wording and spelling, face marks, open head,
physique (the model drifts toward bodybuilder bulk; regenerate if so), limb and
finger counts, odd skin tints, grips, equipment mechanics, copy/scene agreement,
chart arithmetic, real app UI, and crop safety. Repair real defects by
regenerating with a corrected prompt; never paint text on with Pillow. Do not
regenerate good slides for tiny aesthetic variation.

## Save, gallery and phone delivery

Completed posts live in `docs/assets/tiktok/comic/<slug>/`:
`slide-0-cover.png`, `slide-1.png` ... `slide-5.png`, promo `slide-6.png`,
`content.md`, plus `spec.md` and `prompts.json`. Hyphens only, never
underscores; the manifest, transcripts, iCloud sync and Postiz all rely on it.

- `content.md`: exactly one casual caption line with a natural GainFrame
  benefit/CTA, one blank line, exactly five relevant hashtags. Nothing else; it
  is posted verbatim by Postiz.
- Append date, title, slug, seven-slide count, GainFrame mention, style and Done
  status to `POST_LOG.md`.
- Add entries at the top of `web/lib/comics-manifest.mjs` with `ext: "webp"` and
  `slideCount: 7`. Never hand-edit the generated `docs/.../comics-manifest.js`.
- Run `npm run prebuild` from `web/` for WebP siblings and the served manifest.
- Populate `web/lib/comics-transcripts.json` from the visually verified rendered
  text, including labels and the promo (or run
  `node web/scripts/generate-comics-transcripts.mjs`).
- Copy finished PNGs and `content.md` to
  `~/Library/Mobile Documents/com~apple~CloudDocs/TikTok-Drafts/<slug>/`, compare
  hashes, and say that remote iCloud sync is not verified by a local copy.
- Keep assets, manifest and transcripts together in any commit. Do not commit,
  push, deploy, schedule or post unless the task asks.

Experiments stay under `docs/assets/tiktok/comic/_drafts/<dated-batch>/` until
approved. Finish with the completed count, a preview link, the phone location
and an honest upload status.

## Scheduling (Postiz)

`_pipeline/schedule_postiz.py` books built posts into Postiz. Every booking,
manual post and skip is recorded in the committed `_pipeline/postiz-ledger.json`,
so nothing is queued twice. Config is `_pipeline/postiz.config.json`; the key is
`POSTIZ_API_KEY` in `~/.zshrc` (Postiz: Settings > Developers).

**A weekly job books new posts automatically.** launchd agent
`~/Library/LaunchAgents/app.gainframe.postiz-weekly.plist` runs
`_pipeline/weekly_postiz.sh` every Monday 9:00 from the main checkout
(`~/code/project/gain-frame-privacy`). It books every post that is listed in
`POST_LOG.md` and has slides plus `content.md`, splits them across the two lanes,
commits the ledger and pushes. So: **listing a finished post in POST_LOG makes it
go out**. Keep unfinished work out of POST_LOG, or `skip` it. Log:
`~/Library/Logs/gainframe-postiz-weekly.log`.

Two lanes, a different comic on each TikTok account every day at 18:30:
- lane 1 `--channels tiktok,instagram`: TikTok @gainframeguy + Instagram @gainframe.app
- lane 2 `--channels tiktok-2`: TikTok @gainframeapp

```bash
P=docs/assets/tiktok/comic/_pipeline/schedule_postiz.py
python3 $P queue                                          # built + unbooked
python3 $P schedule --next 5 --channels tiktok,instagram  # dry run
python3 $P schedule --next 5 --channels tiktok,instagram --commit
python3 $P schedule --next 5 --channels tiktok-2 --commit # run after lane 1
python3 $P status                                         # QUEUE / PUBLISHED / ERROR
python3 $P unschedule <slug>
python3 $P mark-posted <slug> --date YYYY-MM-DD           # posted by hand
python3 $P skip <slug> --reason "..."                     # never book
```

- Show the dry run before any manual `--commit`; commit the ledger afterwards.
- TikTok `UPLOAD` mode puts each carousel in the TikTok inbox; the user adds a
  sound and posts it within 24 h. Captions reach the editor only when opened from
  the inbox notification. `DIRECT_POST` publishes outright with auto music.
  Instagram always publishes directly and allows at most 10 slides.
- Never send the same carousel to both TikTok accounts.

## Editing older posts (pre-October 27)

Older six-slide posts were built by the Gemini + Pillow pipeline
(`_pipeline/posts.json`, `build.py`, `compose.py`): Gemini drew only the mascot
and Pillow drew all text. To fix a text typo in one of those, edit the copy in
`posts.json` and recompose from cached art for free:

```bash
python3 docs/assets/tiktok/comic/_pipeline/build.py --post <slug> --slides 1 --recompose
```

Then refresh that slide's `.webp`, its entry in `web/lib/comics-transcripts.json`,
and the iCloud draft copy. Do not use this pipeline for new posts.
