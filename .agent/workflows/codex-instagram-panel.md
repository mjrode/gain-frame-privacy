---
description: Generate a GainFrame multi-panel Instagram carousel in Codex using GPT Image 2 (tiered "good/better/best" or "X per day → is Y per year" escalation, always clean white).
---

1. Read the Codex instagram-panel skill:
// turbo
```
view_file .agent/skills/codex-instagram-panel/SKILL.md
```

2. Read the canonical skill it references (formats, FAT LOSS copy sheet, CTA guidance, review checklist):
// turbo
```
view_file .agent/skills/instagram-panel/SKILL.md
```

3. Follow the skill instructions exactly. Pick a format (A tiered or B escalation), draft the slide copy with the user, then generate each slide one at a time with **GPT Image 2** (`gpt-image-2`). Keep every slide on a clean WHITE background and paste the CHARACTER BLOCK into every prompt so the mascot's bracket-frame head renders correctly (no human head behind it).
