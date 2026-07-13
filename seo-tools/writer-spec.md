# GainFrame Blog Post Writer Spec (canonical — lives in repo)

Read ONE exemplar before writing: `web/content/blog/average-waist-size-men.mdx` (stats format) or `web/content/blog/best-glp1-muscle-tracking-apps.mdx` (roundup format). Match frontmatter shape, schema format, and voice exactly.

## Hard invariants
- Author block verbatim: `"author":{"@type":"Person","name":"Michael Rode","url":"https://gainframe.app/about"}`
- Publisher block verbatim: `"publisher":{"@type":"Organization","name":"GainFrame","url":"https://gainframe.app","logo":{"@type":"ImageObject","url":"https://gainframe.app/assets/favicons/favicon.webp"}}`
- App Store link: `https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082` (NEVER id6742498826 — dead listing)
- File: `web/content/blog/<slug>.mdx`. Assets: `docs/blog/<slug>/assets/` (create dir). Hero + og/twitter/schema image reference `assets/cover.webp` (generated separately — reference it anyway with plausible alt).
- MDX = JSX: className, self-closed `<img />`, style objects. No `<script>`, no JS — quizzes are self-scoring checklists. Markdown pipe tables ARE supported and auto-styled. NO emoji; check/X SVGs copied from exemplar tables.

## Figures — USE THE NEW CLASS
Centered render figures use `.post-render-figure` (NOT post-inline-screenshot, which is a float card):
`<div className="post-render-figure scroll-reveal"><img src="assets/<name>.webp" alt="<query-rich alt>" loading="lazy" /><p className="post-caption">...</p></div>`
No inline styles needed — the class handles centering, sizing, caption styling.

## Structure (every post)
1. Hero cover div (copy exemplar) → quick-answer callout (40–60 words, count them) → personal-frustration hook with specific numbers.
2. H2s as full questions with question marks. Paragraphs ≤4 sentences. Second person.
3. FAQ: 5 questions, 40–70 word answers, matching FAQPage schema entry (single-line JSON). Body text = schema text.
4. Closing CTA div + Related Articles div (5 links). datePublished/dateModified/displayDate per task brief.

## Voice & honesty
- Authority first. GainFrame max twice (once in body, once CTA). Honest limits: iOS only; estimates from photos; free tier 25 photos lifetime; Pro $5.99/mo or $39.99/yr.
- Hedge every stat: "commonly cited", "survey data generally reports". NEVER invent studies or precise figures. Reference ranges from existing posts must stay consistent (men athletic 6–13 / fitness 14–17 / average 18–24 / obese 25+; women 14–20 / 21–24 / 25–31 / 32+).
- GainFrame facts allowed: AI photo → BF%, BMI, FFMI, 1–100 score, 12 muscle ratings; Deep Dive Compare; Future Physique (with its "Illustrative AI projection" disclaimer); Smart Import; Hevy integration; on-device, no account, photos never stored on a server.

## Visualizer renders (the differentiating asset)
Source: `docs/tools/body-fat-visualizer/assets/physiques/{male,female}-age{20s,30s,40s,50s,60s}-bf{male: 8,13,18,23,28,33 | female: 18,22,27,32,37,42}.webp` (1792×2400, standardized).
Convert: `cwebp -q 78 -resize 640 0 <src> -o docs/blog/<slug>/assets/<descriptive-name>.webp`
Always disclose: "standardized, photorealistic AI renders from our body fat visualizer — same build, pose, and lighting" + link /tools/body-fat-visualizer/.

App screenshots (copy with cp): score-card.webp & muscle-map.webp from docs/blog/methreesixty-vs-gainframe/assets/; compare.webp from docs/blog/best-body-scanning-measurement-apps/assets/; weight.webp from docs/blog/recomp-ai-vs-gainframe/assets/.

## Link pool (5 in Related + 1–3 contextual; pick most relevant)
/blog/body-fat-percentage-chart/ · /blog/average-body-fat-percentage-by-age/ · /blog/average-waist-size-men/ · /blog/average-bicep-size/ · /blog/waist-to-height-ratio/ · /blog/shoulder-to-waist-ratio/ · /blog/ffmi-percentiles/ · /blog/what-is-ffmi/ · /blog/natty-limit/ · /blog/how-to-tell-if-skinny-fat/ · /blog/am-i-skinny-fat-quiz/ · /blog/skinny-fat-to-muscular/ · /blog/bulk-cut-or-recomp/ · /blog/should-i-bulk-or-cut-quiz/ · /blog/first-cut-guide/ · /blog/lean-bulk-vs-dirty-bulk/ · /blog/how-long-to-see-results-from-lifting/ · /blog/signs-you-are-building-muscle/ · /blog/why-weight-goes-up-when-lifting/ · /blog/how-much-muscle-can-you-gain-in-a-month/ (same batch) · /blog/body-recomposition-for-women/ · /blog/aesthetic-physique-body-fat-percentage/ · /blog/10-pounds-fat-vs-muscle/ · /tools/body-fat-visualizer/ · /tools/body-fat-from-photo/ · /tools/ffmi-calculator/

## Return format
Final message = ONLY: file paths created + one line per post: slug | quick-answer word count | FAQ count | assets. No prose.
