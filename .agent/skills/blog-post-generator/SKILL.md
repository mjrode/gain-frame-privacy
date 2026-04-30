---
name: Blog Post Generator
description: Interactive workflow for generating, structuring, and publishing SEO-optimized marketing blog posts for GainFrame.
triggers:
  - "write a blog post"
  - "new blog post"
  - "blog-post-generator"
---

# Blog Post Generator Skill

## Overview
This skill orchestrates the end-to-end creation of SEO-optimized marketing blog posts for GainFrame. It enforces a strict conversational workflow: capturing the narrative angle via user interview, gathering visual assets, optimizing those assets, generating the HTML structure with proper metadata, and publishing to the live site.

## The Workflow

When triggered, you MUST follow these steps sequentially. **Do not proceed to the next step until the user has fully answered the current one.**

### Phase 0: Duplicate Check
1. **Search Existing:** Before asking for a topic, use `list_dir` on `/docs/blog/` to see what already exists.
2. **Warn User:** If the requested topic is very similar to an existing slug (e.g. they ask for "how to take progress photos" but `5-tips-better-progress-photos` exists), warn them. Ask if they want to update the existing post or spin up a new, specific angle.

### Phase 1: Topic & Angle Interview
1. **Topic Selection:** Ask the user for the target SEO keyword/topic. If they don't have one, check `TODO_SEO.md` backlog and suggest the highest ROI option.
2. **The "Why":** Ask the user 1-2 pointed questions to capture their raw, unfiltered thoughts on the topic. (e.g., "What is the single most frustrating thing about [Topic]?")
3. **The Solution:** Ask how GainFrame specifically solves this problem better than the alternative.

### Phase 2: Asset Gathering

**Step 1 — Check the curated screenshot library FIRST** (before asking the user for anything). The library lives at `/Users/michael.rode/code/project/gain-frame-privacy/docs/app-screenshots/[version]/` — currently `1.21`. These are the canonical in-app screenshots maintained by the user. **Default to these whenever they fit.** Only ask the user for net-new screenshots if the article needs something this catalog doesn't cover.

#### Screenshot Library Catalog (v1.21 — 10 screenshots)

| Filename | What it shows | Recommend for articles about |
|---|---|---|
| `home.png` | Home screen — weekly check-in calendar (S–F days), latest check-in photo with body fat % overlay (15% BF, −1% delta), GainFrame Score badge (74, +6 delta), streak indicator (1/3 this week, "Start a new streak"), bottom nav (Home / Compare / Insights) | App overview, weekly check-ins, streak tracking, the "feed-like" daily UX, score reveals |
| `dashboard.png` | Insights dashboard — in-app chat CTA ("Tap here to chat with Mike"), "View Transformation" record card (−8.0% Body Fat), Weight + Body Fat trend chart (183 lbs / −15%), pose timelines breakdown (Front 32 photos / Left Side 1 / Front Flexed 1) | Trend tracking, transformation history, founder access, multi-pose tracking, in-app chat / support story |
| `photo-gallery.png` | Progress Photos grid — All / By Month / By Year tabs, 6 photo tiles each tagged with score badge + date + weight + pose type ("Front") | Progress photo organization, camera roll workflow, pose classification, browsing your timeline, Smart Import results |
| `compare.png` | Compare view — side-by-side with two photos, BF% delta (−23%), time elapsed (2yr 11mo 17d), Smart Filters dropdown (10 new filters), Deep Dive Analysis CTA, Side by Side / Slider toggle, Adjust / Swap / Auto / Blur / Background buttons | Side-by-side comparisons, transformation deltas, the Compare feature, Smart Filters, the Deep Dive entry point, before/after content |
| `muscle-map.png` | Muscle map — Front/Back toggle, Before/After body silhouettes color-coded by muscle development, gradient legend (Needs Work → Developing → Solid → Strong → Elite), radar chart of 8 muscle areas (Front Delts, Side/Rear Delts, Upper Chest, Mid/Lower Chest, Biceps, Abs, Obliques) | Per-muscle scoring, 12 muscle group ratings, the "Developing → Strong" progression labels, weak-point identification, training recommendations, muscle group analysis |
| `check-ins.png` | Check-In Streak screen — "Week Secured" badge, "2 Weeks Active" headline, "This week is locked in" message, weekly calendar (M–S, today highlighted), today's log (239 lbs, 1 photo Front), overview stats (8 wks best / 3 this month / 33 total) | Consistency / streaks, weekly habit, gamification, accountability, why frequency matters, the streak protection mechanic |
| `future-you.png` | Future You / Goal Preview — "Your movie-cover outcome" headline, NOW vs +6 MONTHS AI-projected side-by-side images (goal: Lose Fat, Build Muscle), Slider / Split toggle, **"Illustrative AI projection — not a prediction or medical advice" disclaimer**, Intensity slider with "Fantasy" mode (Stylized and dramatic, no realism constraints) | Future Physique feature, AI projections, goal visualization, motivation content. Note: the disclaimer matters — if the article frames this as a prediction, get the hedging right |
| `post-check-in-photo-score.png` | Score card detail — "IMPRESSIVE" trend badge, GainFrame Score 68 with body fat 17.0% + weight 239 lbs, narrative feedback ("Strong shoulder width and chest fullness with visible midsection leanness"), 4-metric breakdown (Body Fat 65 / Muscle 72 / Proportions 70 / Goal Fit 68), trajectory section ("Recomp On Track") | The Deep Dive Report, score breakdown, narrative AI feedback, the 4-metric framework, "what your score means" content |
| `throwback.png` | Throwback comparison — "1 Month Ago" THEN (Mar 31) vs NOW (Apr 25) photos, Weight delta (+10 lbs gained), GF Score delta (+16 improvement), Preview & Share button | The Throwback feature, auto-best then-vs-now comparisons, sharing milestones, the "1 month / 3 months / 1 year" memory hook |
| `weight-chart.png` | Weight tracking screen — 239.0 lbs current (−12.0 from start), milestone tracker (1 of 3 milestones, goal 229.0 lbs, next milestone 236.3 lbs), 90-day trajectory chart with start/current/goal markers, Rate of Change section | Weight tracking, milestone goals, trajectory visualization, recomp content, Apple Health weight integration |
| `ffmi.png` | FFMI detail screen — "Your ffmi is Excellent" badge, score 23.0, horizontal range bar (Below Avg 0–18 gray → Average 18–20 orange → Above Avg 20–23 green → Excellent >23 dark), in-app definitions for "What is FFMI?" and "Why does FFMI matter?", disclaimer "Values above 25 are extremely rare naturally" | FFMI explainer posts, body composition metric posts, FFMI chart posts, recomp tracking, why FFMI beats BMI content |

#### Asset Gathering Workflow

1. **Match article topic to library screenshots.** Recommend 2-4 by filename. Example: an article about "before and after comparisons" naturally pulls `compare.png` + `throwback.png` + maybe `photo-gallery.png`. An article about per-muscle scoring pulls `muscle-map.png` + `post-check-in-photo-score.png`.
2. **Tell the user which ones you picked + why** before copying. They can swap or add. Example: *"I'll use compare.png (for the side-by-side feature section), muscle-map.png (for the per-muscle scoring section), and dashboard.png (for the trend overview). Sound right?"*
3. **Copy + convert to WebP.** When the user confirms, copy each into `docs/blog/[slug]/assets/` and convert PNG → WebP with `cwebp -q 80 source.png -o target.webp`. Suggested naming: keep the original name (e.g. `compare.webp`).
4. **Only ask for new screenshots** if the article needs a specific screen this catalog doesn't cover. Be specific: *"The library doesn't have a screenshot of [X] — could you provide one?"* Don't ask for screenshots the library already has.
5. **WebP conversion always happens** (whether the source is library PNG or user-provided PNG/JPG). Never link `.png` or `.jpg` in the final HTML.

#### Catalog maintenance

- The library is **versioned by app release** (`/docs/app-screenshots/1.21/`, `/docs/app-screenshots/1.22/`, ...). Always check for the latest version directory before recommending — newer versions may add or replace screens.
- If the user adds new screenshots to the library, the catalog above should be updated. Suggest editing this skill file when you notice a screenshot in the library that isn't in the catalog.
- If a UI redesign happens (major version bump that changes screen layouts), the catalog descriptions need updating to match. Flag this to the user when you notice catalogued descriptions don't match the current screenshots.

### Phase 3: Drafting & Implementation
Once the interview is complete and assets are provided, execute the following implementation plan automatically:

1. **Setup Directory:** Create `/docs/blog/[slug-name]/assets/`.
2. **Process Images:** Move the user's provided images into the `assets/` folder. Use the `run_command` tool to run `cwebp` to convert all `.png`/`.jpg` files to `.webp` format with `-q 80`. Delete the original files.
3. **Generate Cover Image:** Invoke the `image-generate` skill (`.agent/skills/image-generate/SKILL.md`) to create a striking 4:3 cover image for the blog grid. The skill wraps Google Gemini's Nano Banana 2 model (`gemini-3.1-flash-image-preview`) and the brand prompt template is its built-in `style_template: "blog-cover"` default — you only need to provide a `subject` and a `target_path`. Cost ~$0.039 per image. Save to `docs/blog/[slug]/assets/cover.webp` and reference at 4 places in the HTML: `og:image`, `twitter:image`, JSON-LD `image`, hero `<img src>` (relative path: `assets/cover.webp`). Plus the blog index card image.

   **Prompt template (used internally by `image-generate` — shown here for reference):**
   > *"A minimalist, abstract vector line-art illustration of [SUBJECT]. Thin, precise UI-style lines in dark charcoal gray (#2D3748) against a very light off-white/cream background (#F7FAFC). Subtle, muted pastel accent colors (coral red #FF6B6B, sage green #48BB78, golden yellow #ECC94B) used sparingly to highlight key elements. The style should resemble high-end SaaS product illustrations, clean, geometric, with plenty of negative space. No text, no text rendering."*
4. **Draft the Content** following the **Writing Voice & Style** rules below.
   - Ensure the primary keyword is in the H1, the first paragraph, and at least one H2.

## Writing Voice & Style

These rules define GainFrame's editorial voice. Every blog post MUST follow them.

### Tone: Authority First, Sell Later
- Write like an objective fitness resource that **earns trust before asking for anything**.
- Do NOT weave GainFrame pitches into every section. Mention the product **at most twice** in the body — once naturally within a relevant section, once in the closing CTA.
- Be honest about limitations: *"accuracy varies depending on tool, lighting, and body type"* builds more credibility than *"our AI analyzes topological features with unbiased precision."*
- **Hedge scientific claims:** When citing accuracy figures, always attribute them (*"studies generally report..."*, *"research suggests..."*) rather than stating them as absolute facts.
- Google's Helpful Content guidelines reward content that serves the reader first. Write for the reader, not the business.

### Structure Rules
1. **Quick Answer block (mandatory — AEO-critical):** Immediately after the H1, BEFORE the opening hook, emit a `post-callout` block containing a **40–60 word** direct answer to the article's primary question. This is what AI Overviews (Google AI, ChatGPT, Perplexity, Claude) extract verbatim when citing your article — and what Google often pulls for featured snippets. Every guide post MUST have one. Format:
   ```html
   <div class="post-callout post-quick-answer">
       <p><strong>Quick answer:</strong> [40–60 words directly answering the article's main question — no setup, no qualifier sentence first, just the answer.]</p>
   </div>
   ```
   - ✅ *"Quick answer: 15% body fat on a man looks like visible abdominal definition without prominent veins, well-defined chest separation, and arms with clear muscle outlines under the skin. On a woman, the same percentage looks substantially leaner — visible abs, defined arms, and almost no subcutaneous softness on the hips or thighs."*
   - ❌ *"Body fat percentage is a complex topic that depends on many factors..."* (setup, not an answer)

   **Word count discipline:** under 40 words and you don't say enough; over 60 and AI Overviews truncate mid-sentence. Count words before committing.
2. **Opening hook (mandatory):** AFTER the Quick Answer block, open the prose body with a frustration the reader has personally experienced. Use specific numbers. Make them nod before they scroll. Do not use a generic thesis statement or SEO keyword summary. Examples:
   - ✅ *"You step on your bathroom scale and it tells you that you're 18% body fat. The next morning... it reads 21%."*
   - ✅ *"Someone tells you they're at 15% body fat. What does that actually look like?"*
   - ❌ *"Search intent for body fat estimation is relentless and highly visual."*
3. **Body sections — H2s as full questions (mandatory — AEO-critical):** Phrase every H2 as a full grammatical question with a question mark. AI Overviews and featured snippets extract preferentially from question-format sections. The H2 should literally be a query a real user would type or speak. The Quick Answer callout is the answer to the H1; each H2 is the answer to a related sub-query.
   - ✅ *"What does 15% body fat look like on men and women?"*
   - ✅ *"How accurate is body fat estimation from a photo compared to DEXA?"*
   - ❌ *"What 15% body fat looks like"* (missing question mark, missing full subject)
   - ❌ *"The 15% Range"* (descriptive, not a query)
   - ❌ *"Accuracy Comparison"* (descriptive, not a query)
4. **Mid-post Checklist (for guide/comparison posts):** Include a 'Quick Checklist' or 'How to Standardize' section with bullet-pointed, do-it-today advice that readers can easily copy and paste. When this section is a numbered step framework, render it inside `<div class="post-steps">` AND emit `HowTo` JSON-LD (see HTML scaffold below).
5. **FAQ section (mandatory for guide posts; already mandatory for comparison articles):** Every guide post should end with a 4–8 question FAQ section before the closing CTA. Each answer 40–70 words, snippet-friendly, direct, honest. The FAQ section enables `FAQPage` JSON-LD (see HTML scaffold below), which is what AI Overviews extract for follow-up answers. Use H3s for each question and `<p>` tags for each answer — no fancy markup, snippet extractors prefer plain text. Each FAQ Q/A captures a separate long-tail query — they're free traffic.
6. **Actionable closing (mandatory):** End with a concrete numbered framework the reader can follow — not a GainFrame sales pitch. Example: *"First, choose a target. Second, pick a tracking method. Third, reassess every 4–8 weeks."*
7. **Closing blockquote (optional but encouraged):** A summative callout that reinforces the core takeaway.

### Paragraph & Sentence Style
- **Maximum 3–4 sentences per paragraph.** If a paragraph exceeds 4 sentences, split it.
- **Short punchy declarations > long complex sentences.** Use periods, not semicolons.
  - ✅ *"Same number, completely different appearance."*
  - ❌ *"This means that a female at 20% body fat looks vastly different — and is significantly leaner relative to her gender — than a male at 20% body fat."*
- **Second-person address.** Write "you" directly. Avoid "users" or "one."
- **No fluff.** Every sentence must either advance the argument, provide data, or give actionable advice. Delete anything that is merely transitional filler.

### GainFrame Integration
- App screenshots use `.post-inline-screenshot` class (240px floated right on desktop, centered on mobile).
- Never use `.post-hero-image` for phone screenshots — those are for wide comparison images only.
- Mention GainFrame as one option among several, not the only solution. Credibility > conversion.

### Author & Publisher Entity (E-E-A-T anchor — DO NOT DRIFT)

Every blog post emits two entity declarations inside its `BlogPosting` JSON-LD: an `author` (Person) and a `publisher` (Organization). Together they form the **E-E-A-T anchor** — the machine-readable layer of Google's "Experience, Expertise, Authoritativeness, Trustworthiness" content quality framework. Drift across posts fragments the entity and discards the compounding signal. Hold these invariants:

**The exact author block, never modified:**
```json
"author": {
    "@type": "Person",
    "name": "Michael Rode",
    "url": "https://gainframe.app/about"
}
```

**The exact publisher block, never modified:**
```json
"publisher": {
    "@type": "Organization",
    "name": "GainFrame",
    "url": "https://gainframe.app",
    "logo": {
        "@type": "ImageObject",
        "url": "https://gainframe.app/assets/favicon.webp"
    }
}
```

**Hard rules:**
1. **Never change `author.name`.** It is `"Michael Rode"` on every post — not "GainFrame Team", not "The GainFrame Team", not "Mike Rode". Consistency across all 67+ posts is what builds the entity in Google's Knowledge Graph.
2. **Never change `author.url`.** It points at `https://gainframe.app/about` — and `docs/about/index.html` MUST exist there with a matching `Person` schema (see "The /about contract" below). If you ever move `/about`, both pages and every blog post's `author.url` must move together.
3. **Never change `publisher.name`, `publisher.url`, or `publisher.logo.url`.** These three together identify the GainFrame Organization entity. If the favicon path ever changes, the publisher logo URL must update across every blog post in lockstep.
4. **`Person` and `Organization` `sameAs` arrays must NEVER share URLs.** Person `sameAs` is for Michael's *personal* profiles (LinkedIn, GitHub, personal X, App Store developer page). Organization `sameAs` is for GainFrame's *brand* profiles (the @gainframe X / TikTok / Instagram accounts). Putting brand accounts on the Person object collapses the two entities — Google treats them as the same thing and the entity distinction disappears.
5. **The author URL must resolve to a real page**, not a 404. If you ever delete `/about`, you have hundreds of broken Knowledge-Graph references to chase down.

**The /about contract:**

`docs/about/index.html` is the single canonical entity-anchor page. It must always emit, in JSON-LD:
- One `Organization` block whose `@id` is `https://gainframe.app/#organization` and whose `name`, `url`, `logo` exactly match the publisher block above
- One `Person` block whose `@id` is `https://gainframe.app/about/#michael-rode` and whose `name` is "Michael Rode"
- One `AboutPage` block referencing both
- One `BreadcrumbList` block

Treat `docs/about/` as a sister-document to this skill. Whenever the author or publisher block changes here, `docs/about/index.html` changes in the same commit. Never split them.

**On `sameAs` (the Knowledge Graph multiplier):**

`sameAs` is the schema.org property that disambiguates an entity by linking it to its identifiers on other authoritative sites. Without `sameAs`, Google sees `"name": "Michael Rode"` and can't tell which Michael Rode you are. With `sameAs` pointing at LinkedIn / GitHub / App Store developer / etc., Google cross-references those URLs and builds a single Knowledge Graph node that accumulates authority across every page that names you as author. **It is the single highest-leverage E-E-A-T signal** after having a real `/about` page.

Maintain `sameAs` arrays on `docs/about/index.html`:
- **Person.sameAs** — Michael's personal profiles only. LinkedIn is the highest-value entry; GitHub is high value for an engineer. Pick profiles you actually maintain — a stale or empty profile hurts more than no link.
- **Organization.sameAs** — GainFrame's brand profiles only. Add the App Store developer page when known (high authority signal).

**Pre-flight before writing or modifying a blog post:**

1. Confirm `author` and `publisher` blocks in your scaffold are the verbatim canonical versions above.
2. If you're tempted to add a co-author, second author, or "team" attribution, STOP — open a chat about it instead of drifting silently.
3. If a post needs a different author for any reason (guest post, etc.), flag it explicitly to the user and discuss before introducing variation.

### Visual Components Available
- `post-callout` blockquotes for key takeaways
- `post-callout post-quick-answer` for the mandatory Quick Answer block (see Structure Rules)
- `post-feature-grid` / `post-feature-card` for visual marker cards (SF Symbol icon + title + description)
- `post-inline-screenshot` for phone screenshots floated inline with text
- `post-hero-image` for full-width wide images (comparison grids, charts)
- `post-table-wrapper` / `post-table` for data tables (see "Comparison tables" below)
- `post-steps` ordered list for numbered frameworks

### Comparison tables — column order convention

Comparison tables wider than the viewport on desktop hide their rightmost column behind a horizontal scroll. **The column readers don't see should be the LEAST important one — never GainFrame.** Use the `gainframe-first` modifier to flip the sage-tinted highlight from the last column to the first data column (column 2, after the Feature label).

**Default for tables with 4+ data columns (5+ total columns counting the Feature label):**
```html
<div class="post-table-wrapper scroll-reveal">
    <table class="post-table gainframe-first">
        <thead>
            <tr>
                <th>Feature</th>
                <th>GainFrame</th>          <!-- ← column 2, sage-tinted, always visible -->
                <th>Competitor A</th>
                <th>Competitor B</th>
                <th>Competitor C</th>
                <th>Competitor D (least important)</th>  <!-- ← gets cut off first on narrow viewports -->
            </tr>
        </thead>
        ...
    </table>
</div>
```

**Default for tables with ≤3 data columns** (e.g. single-competitor comparison: Feature | Competitor | GainFrame): omit the modifier, keep GainFrame as the LAST column. The default `:last-child` sage highlight is fine because the table fits the viewport without scroll.

**Why "least important" goes last (the column most likely to be hidden):** order competitors by relevance to the article's primary audience. For example, in an "AI body fat apps" comparison, app competitors come before non-app methods; legacy/abandoned products go last.

### Comparison tables — content and accessibility

- Use sage check `<svg>` for "yes/has-feature" cells, gray X `<svg>` for "no/missing-feature" cells. **Never** ✅ or ❌ emoji.
- The GainFrame column should use `<strong>` text wrappers for any cells with text (e.g. `<strong>12 groups</strong>`, `<strong>Free tier</strong>`). The first-column label is auto-bolded by `.post-table` CSS.
- Cell SVGs use `aria-label="Yes"` and `aria-label="No"` for screen readers.

### Icons: SF Symbols — Never Emoji

**Do NOT use emoji characters (💪, 🎯, 📐, etc.) anywhere in blog post HTML.** They render inconsistently across OSes, look amateurish on desktop, and conflict with GainFrame's typographic voice.

**Instead, use inline SVG paths from SF Symbols.** Source symbol paths at: https://andrewtavis.github.io/sf-symbols-online/

**How to use:**
1. Go to https://andrewtavis.github.io/sf-symbols-online/
2. Search for the symbol you need (e.g. `figure.arms.open`, `heart.text.square`, `ruler`, `flame`)
3. Click the symbol → copy the SVG path data
4. Paste it as an inline `<svg>` in the `.post-feature-icon` span

**Standard icon markup for `post-feature-card`:**
```html
<span class="post-feature-icon">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
    <path d="[PATH FROM SF SYMBOLS ONLINE]"/>
  </svg>
</span>
```

**Common symbols for fitness/body content:**
| Use case | Symbol name to search |
|---|---|
| Body / physique | `figure.arms.open` or `person` |
| Muscle / strength | `dumbbell` or `bolt` |
| Measurement | `ruler` or `number.square` |
| Health / stats | `heart.text.square` or `chart.bar` |
| Camera / photo | `camera` or `photo.on.rectangle` |
| Checklist | `checkmark.circle` |
| Warning / note | `exclamationmark.triangle` |

**This rule applies everywhere in the post HTML** — feature cards, callouts, list markers, inline icons, CTA icons. No exceptions.

### Research Citation Rules (for evidence-based posts)
When a post cites scientific studies or peer-reviewed research, these additional rules apply:
1. **Separate findings from recommendations.** Clearly distinguish what the study validated from what you're recommending. Example: *"The study tested two photos under controlled lab conditions. The tips below are about reducing user error at home, not claims validated by the research."*
2. **Include a "What the Study Did NOT Test" section** (or equivalent) when extrapolating beyond the study's scope. This is critical for E-E-A-T credibility.
3. **Include a "Limitations" section** before the closing. Acknowledge single-study limitations, controlled conditions vs. real-world use, and the need for replication.
4. **Use honest hedging language.** Prefer:
   - ✅ *"showed strong agreement with"* over *"operated interchangeably with"*
   - ✅ *"suggests"* / *"the findings offer promising evidence"* over *"proves"* / *"is definitive"*
   - ✅ *"according to the published findings"* attributing claims to the source
5. **Always link to the original source** — preferably in both the body text and a dedicated callout blockquote.
5. **Scaffold HTML:** Create `index.html` in the new folder using **exactly** this boilerplate — do not invent custom `<style>` blocks or CSS variables. All styling comes from `../../styles.css`.

   **Required `<head>` (copy verbatim, fill in placeholders):**
   ```html
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>[POST TITLE] | GainFrame</title>
       <meta name="robots" content="max-image-preview:large">
       <meta name="description" content="[META DESCRIPTION — 150-160 chars]">
       <meta name="keywords" content="[COMMA SEPARATED KEYWORDS]">
       <meta property="og:title" content="[POST TITLE]">
       <meta property="og:description" content="[OG DESCRIPTION]">
       <meta property="og:type" content="article">
       <meta property="og:image" content="https://gainframe.app/blog/[SLUG]/assets/cover.webp">
       <meta property="og:url" content="https://gainframe.app/blog/[SLUG]/">
       <meta name="twitter:card" content="summary_large_image">
       <meta name="twitter:title" content="[POST TITLE]">
       <meta name="twitter:description" content="[TWITTER DESCRIPTION]">
       <meta name="twitter:image" content="https://gainframe.app/blog/[SLUG]/assets/cover.webp">
       <link rel="canonical" href="https://gainframe.app/blog/[SLUG]/">
       <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
       <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
       <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
       <link rel="apple-touch-icon" sizes="192x192" href="/assets/favicon-192.png">
       <link rel="stylesheet" href="../../styles.css">
       <link rel="preconnect" href="https://fonts.googleapis.com">
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
       <script async src="https://www.googletagmanager.com/gtag/js?id=G-N6YPFBB8JE"></script>
       <script>
           window.dataLayer = window.dataLayer || [];
           function gtag() { dataLayer.push(arguments); }
           gtag('js', new Date());
           gtag('config', 'G-N6YPFBB8JE');
       </script>
       <!-- Schema 1 of 4: BlogPosting — ALWAYS emit -->
       <script type="application/ld+json">
       {
           "@context": "https://schema.org",
           "@type": "BlogPosting",
           "headline": "[POST TITLE]",
           "description": "[META DESCRIPTION]",
           "image": "https://gainframe.app/blog/[SLUG]/assets/cover.webp",
           "datePublished": "[YYYY-MM-DD]",
           "dateModified": "[YYYY-MM-DD]",
           "author": { "@type": "Person", "name": "Michael Rode", "url": "https://gainframe.app/about" },
           "publisher": { "@type": "Organization", "name": "GainFrame", "url": "https://gainframe.app", "logo": { "@type": "ImageObject", "url": "https://gainframe.app/assets/favicon.webp" } },
           "mainEntityOfPage": { "@type": "WebPage", "@id": "https://gainframe.app/blog/[SLUG]/" },
           "articleSection": "[CATEGORY]"
       }
       </script>
       <!-- Schema 2 of 4: BreadcrumbList — ALWAYS emit -->
       <script type="application/ld+json">
       {
           "@context": "https://schema.org",
           "@type": "BreadcrumbList",
           "itemListElement": [
               { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gainframe.app/" },
               { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://gainframe.app/blog/" },
               { "@type": "ListItem", "position": 3, "name": "[POST TITLE]", "item": "https://gainframe.app/blog/[SLUG]/" }
           ]
       }
       </script>
       <!-- Schema 3 of 4: FAQPage — emit ONLY IF the post has a FAQ section.
            Each Question/Answer must MIRROR the visible H3/p verbatim — Google penalizes mismatch.
            Expand the mainEntity array to include EVERY visible FAQ entry (not just two). Delete the entire <script> block if no FAQ section. -->
       <script type="application/ld+json">
       {
           "@context": "https://schema.org",
           "@type": "FAQPage",
           "mainEntity": [
               {
                   "@type": "Question",
                   "name": "[Question 1 — exact wording as visible H3]",
                   "acceptedAnswer": {
                       "@type": "Answer",
                       "text": "[Answer 1 — 40–70 words, mirror the visible answer paragraph verbatim]"
                   }
               },
               {
                   "@type": "Question",
                   "name": "[Question 2]",
                   "acceptedAnswer": {
                       "@type": "Answer",
                       "text": "[Answer 2]"
                   }
               }
           ]
       }
       </script>
       <!-- Schema 4 of 4: HowTo — emit ONLY IF the post contains a numbered step framework rendered as <div class="post-steps">.
            Each HowToStep must MIRROR the visible step verbatim. Expand the step array to include EVERY visible step.
            Delete the entire <script> block if there's no step framework. -->
       <script type="application/ld+json">
       {
           "@context": "https://schema.org",
           "@type": "HowTo",
           "name": "How to [task — mirror the section heading]",
           "step": [
               {
                   "@type": "HowToStep",
                   "position": 1,
                   "name": "[Step 1 short name]",
                   "text": "[Step 1 description — mirror the visible step]"
               },
               {
                   "@type": "HowToStep",
                   "position": 2,
                   "name": "[Step 2 short name]",
                   "text": "[Step 2 description]"
               }
           ]
       }
       </script>
   </head>
   ```

   **⚠️ NEVER add a custom `<style>` block** unless a specific UI component (e.g., a custom 2-column card grid) has absolutely no equivalent in `styles.css`. If you do add one, keep it to that component only — never redefine `:root` variables or global typography.

   **⚠️ STRUCTURAL RULES — these mistakes break the layout and have happened before:**

   1. **The outer wrapper is `<article class="post"><div class="container post-container">` — never `<div class="post-container">` alone.** The `article.post` class controls the dark background and vertical rhythm. Dropping it causes the page to render full-width and unstyled.
   2. **The content wrapper is `<div class="post-body">` — never `<article class="post-body">`.** `post-body` is a `div`, not an `article`. Using an `<article>` tag here breaks semantic HTML and can conflict with CSS selectors.
   3. **The CTA (`blog-post-cta`) and related articles (`post-related`) MUST be inside `<div class="post-body">` — never in a separate `<footer>` outside the article.** Any content placed outside `post-body` will render outside the centered content column.
   4. **The hero image goes inside `post-body` as the first child — NOT inside `<header class="post-header">`.** The header contains only: `post-meta`, `h1.post-title`, `p.post-subtitle`.
   5. **Never add a custom breadcrumb `<div class="post-breadcrumb">`.** The breadcrumb is injected automatically by `shared-nav.js`. Adding one manually creates a duplicate.

   **⚠️ SCRIPTS — exactly these three, in this order, at the bottom of `<body>`:**
   ```html
   <script src="/assets/shared-footer.js"></script>
   <script src="/assets/email-capture-bar.js"></script>
   <script src="/assets/scroll-reveal.js"></script>
   ```
   **`email-capture-bar.js` is required on every post** — it powers the email capture bar that appears at the bottom of the page. Do not omit it.

   **NEVER add:** TikTok pixel, Cloudflare analytics, inline `IntersectionObserver` scripts, or any other script not in the list above. Those are from old post templates and must not be copied into new posts.

   **Required `<body>` structure:**
   ```html
   <body>
       <div data-site-nav></div>
       <script src="/assets/shared-nav.js"></script>

       <article class="post">
           <div class="container post-container">
               <header class="post-header hero-text-stagger">
                   <div class="post-meta">
                       <span class="post-category">[CATEGORY]</span>
                       <span class="post-date">[Mon DD, YYYY]</span>
                       <span class="post-read-time">[N] min read</span>
                   </div>
                   <h1 class="post-title">[POST TITLE]</h1>
                   <p class="post-subtitle">[SUBTITLE / LEAD]</p>
               </header>

               <div class="post-body">
                   <!-- hero image -->
                   <div class="post-hero-image scroll-reveal" style="margin-bottom: 3rem;">
                       <img src="assets/cover.webp" alt="[ALT]" loading="lazy"
                           style="border-radius: 16px; border: 1px solid var(--color-border); box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                   </div>

                   <!-- article content here -->

                   <div class="blog-post-cta scroll-reveal">
                       <h3>[CTA HEADLINE]</h3>
                       <p>[CTA BODY]</p>
                       <a href="https://apps.apple.com/us/app/gainframe/id6742498826" class="cta-button" target="_blank" rel="noopener">
                           Download GainFrame Free
                       </a>
                   </div>

                   <hr class="post-divider">

                   <div class="post-related scroll-reveal">
                       <h3>Related Articles</h3>
                       <div class="post-related-grid">
                           <a href="/blog/[slug]/" class="post-related-card">
                               <div class="post-related-content">
                                   <span class="post-related-category">[Category]</span>
                                   <h4>[Title]</h4>
                                   <p>[One-line description]</p>
                               </div>
                           </a>
                       </div>
                   </div>
               </div>
           </div>
       </article>

       <div data-site-footer></div>
       <script src="/assets/shared-footer.js"></script>
       <script src="/assets/email-capture-bar.js"></script>
       <script src="/assets/scroll-reveal.js"></script>
   </body>
   ```

   **Available post-body component classes** (all styled in `styles.css` — use these, never custom CSS):
   - `<hr class="post-divider">` — section divider
   - `<div class="post-callout"><p>…</p></div>` — highlighted callout block
   - `<div class="post-table-wrapper"><table class="post-table">…</table></div>` — data tables
   - `<div class="post-inline-screenshot scroll-reveal">` + `<p class="post-caption">` — phone screenshots
   - `<div class="post-steps">` — numbered step frameworks
   - `<div class="post-feature-grid">` / `<div class="post-feature-card">` — feature comparison cards

6. **Update Index:** Add the new blog post to the top of the grid in `docs/blog/index.html`. Use the generated vector cover image. **CRITICAL:** Use the standard card structure — `blog-card-content` > `post-meta` > `post-category` + `post-date`, then `h3`, then `p`. Do NOT use `blog-card-body` / `blog-card-category` / `blog-card-title` — those are an old format that doesn't match the site's typography.
7. **Update Sitemap:** Add the new blog post to `docs/sitemap.xml`.
8. **Update Backlog:** If this post was from `seo-tools/TODO_SEO.md`, check it off and add the publish date.
8. **Deploy (MANDATORY — do not skip):** After all files are written and the blog index is updated, stage only the new/modified files (never `git add -A` — it can catch sensitive files). Then commit and push:
   ```bash
   git add docs/blog/[slug]/ docs/blog/index.html docs/sitemap.xml seo-tools/TODO_SEO.md
   git commit -m "feat: [keyword] blog post"
   git push origin main
   ```
   The site is hosted on GitHub Pages, so pushing to `main` triggers an automatic deployment. The post is not "published" until this step completes.

## Rules & Constraints
- **Never write the post in one shot without the interview.** The user's specific tone and raw answers are what make the content rank and convert.
- **Images must be WebP.** Never link a .png or .jpg in the final HTML.
- **Mobile First CTAs:** Ensure the inline and bottom CTAs use the `<div class="blog-post-cta scroll-reveal">` class structure so they stack elegantly on mobile.
- **Internal Linking:** Always include a "Related Articles" block at the bottom of the article linking to 3-5 other existing blog posts. Use this exact markup (the `.post-related` class supplies all styling — never use inline styles, never call it "Related posts" lowercase, always "Related Articles"):

  ```html
  <div class="post-related">
      <h3>Related Articles</h3>
      <ul>
          <li><a href="/blog/[slug-1]/">Title of related post 1</a></li>
          <li><a href="/blog/[slug-2]/">Title of related post 2</a></li>
          <li><a href="/blog/[slug-3]/">Title of related post 3</a></li>
      </ul>
  </div>
  ```

  The `.post-related` class auto-generates the chevron (`»`) icon before each link via CSS pseudo-element — do NOT add `<svg>` markup inside the `<a>`. Older posts have inline-styled SVGs but new posts should use the class.

## Reference Files
- `/seo-tools/product-context.md` — **READ THIS FIRST.** Authoritative source for tagline, target audience, features, differentiators, honest limitations, and brand voice. Use it to ground every post (especially the "GainFrame Integration" mention and the closing CTA). Do NOT invent product features or fabricate differentiators — only what's listed in this file is verifiable.
- `/docs/about/index.html` — **The E-E-A-T anchor page** (sister-document to this skill). Holds the canonical `Person` (Michael Rode) and `Organization` (GainFrame) JSON-LD blocks that every blog post's `author` and `publisher` fields reference. If you change `author.name`, `author.url`, `publisher.name`, `publisher.url`, or `publisher.logo.url` in a blog post, you MUST update `/docs/about/index.html` in the same commit so the entity stays consistent across the site. See "Author & Publisher Entity (E-E-A-T anchor)" section above.
- `/docs/blog/index.html` (Must be updated with the new post — this is the blog index, not `blog.html`)
- `/docs/sitemap.xml` (Must be updated with the new post)
- `/seo-tools/TODO_SEO.md` (For topic inspiration and task tracking)
- `/docs/styles.css` (For reference to standard typography and CTA classes)

---

## Mailchimp Email Generation

When the user asks to generate an email, create subscriber update, or send a campaign, use this section instead of the blog post workflow above.

### Email Design Philosophy

**The GainFrame email voice is "founder writing to a friend."** No heavy branding, no emoji bullet sections, no marketing-speak. The inspiration is a plain-text personal email from a real human — like the PostGenius founder email style.

**DO:**
- Write like a person, not a brand. First person ("I shipped...", "I built this because...").
- Keep it short. 150–250 words max for the body. People scan emails on their phone.
- Use line breaks between paragraphs. No walls of text.
- Sign off with `— Michael` and a link to GainFrame.
- Include one clear CTA. Two max. Never three.
- Use plain `<a>` links inline, not big flashy buttons (one small CTA button at the bottom is OK).

**DO NOT:**
- Use a giant logo header or hero image.
- Use emoji bullet point sections (📸 Import your gym selfies...).
- Use multiple colored buttons stacked on top of each other.
- Write like a marketing email ("We're thrilled to announce..."). Write like a text to a friend.
- Use sections, dividers, or card layouts. It should read like one continuous message.

### Email Structure Template

Every email follows this skeleton:

1. **One-line greeting** — `Hey {{FNAME}},` (use Mailchimp merge tag)
2. **The hook** — 1-2 sentences. What's new and why should they care? Lead with the benefit, not the feature name.
3. **The details** — 2-4 short paragraphs explaining what shipped. Be specific. Use bold for key phrases, not for entire sentences.
4. **The ask (optional)** — Reply to this email, try the feature, read the blog post.
5. **Sign-off** — `— Michael` with a small link to gainframe.app.
6. **Single CTA button (optional)** — One clean, dark button. Left-aligned or centered. No stacking multiple buttons.

### HTML Template (Paste into Mailchimp)

When generating the email HTML, use this base template. Replace the `<!-- CONTENT -->` section with the email body. The template is designed to render as clean plain text in all email clients.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GainFrame</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- CONTENT START -->
          <tr>
            <td style="font-size:16px; line-height:1.6; color:#1a1a1a;">

              <!-- REPLACE THIS SECTION WITH EMAIL BODY -->

            </td>
          </tr>
          <!-- CONTENT END -->

          <!-- CTA BUTTON (optional — delete if not needed) -->
          <tr>
            <td style="padding:28px 0 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1a1a1a; border-radius:6px;">
                    <a href="https://gainframe.app" target="_blank"
                       style="display:inline-block; padding:12px 28px; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600;">
                      Try It Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:40px 0 0 0; font-size:12px; line-height:1.5; color:#999999;">
              <p style="margin:0;">— Michael</p>
              <p style="margin:4px 0 0 0;"><a href="https://gainframe.app" style="color:#999999;">GainFrame</a></p>
              <p style="margin:20px 0 0 0; border-top:1px solid #eeeeee; padding-top:16px;">
                You're receiving this because you signed up at gainframe.app.<br>
                <a href="*|UNSUB|*" style="color:#999999;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### UTM Tracking (Mandatory)

All links in emails MUST include UTM parameters for Google Analytics attribution. Use this format:

```
https://gainframe.app/blog/[slug]/index.html?utm_source=mailchimp&utm_medium=email&utm_campaign=[campaign-name]
```

- `utm_source` — always `mailchimp`
- `utm_medium` — always `email`
- `utm_campaign` — a short, descriptive slug for this email (e.g., `new-features`, `welcome-follow`, `weekly-update`)

In HTML, encode `&` as `&amp;` within `href` attributes.

### Mailchimp Merge Tags

Use these merge tags in the HTML template — Mailchimp replaces them at send time:

| Tag | Purpose |
|-----|---------|
| `*|UNSUB|*` | **Required.** One-click unsubscribe URL. All campaigns must include this. |
| `*|FNAME|*` | First name personalization (falls back to empty if not set). |
| `*|EMAIL|*` | Subscriber's email address. |

### Workflow When User Asks for an Email

1. **Ask what the email is about.** New feature? Blog post announcement? Launch update?
2. **Draft the plain-text body first.** Show the user the raw copy before wrapping it in HTML. Get approval on the words.
3. **Generate the HTML.** Slot the approved copy into the template above using proper `<p>` tags with `style="margin:0 0 16px 0;"` for spacing. Use `<strong>` for bold. Use inline `<a>` tags for links. **All links must include UTM parameters.**
4. **Output the complete HTML** in a fenced code block so the user can copy-paste it directly into Mailchimp's HTML editor.
5. **Remind the user** to preview in Mailchimp and send a test email to themselves before sending.
