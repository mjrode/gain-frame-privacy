---
name: feature-page-generator
description: "Interactive workflow for generating, structuring, and publishing feature subpages for GainFrame's features hub. Use when the user says \"new feature page\", \"create feature page\", \"feature-page-generator\"."
---

# Feature Page Generator Skill

## Overview
This skill orchestrates the creation of individual feature subpages for GainFrame. Each subpage lives at `/docs/features/[slug]/index.html` and provides a detailed, visual walkthrough of a single app feature — similar to how Hevy structures their feature/use-case pages. It enforces a conversational workflow: interview the user, gather screenshots, draft the page, link it from the features hub, and deploy.

## The Workflow

When triggered, follow these steps sequentially. **Do not proceed to the next step until the user has fully answered the current one.**

### Phase 0: Feature Selection
1. **Check Existing:** Use `list_dir` on `/docs/features/` to see what subpages already exist.
2. **Check Hub:** Open `docs/features.html` to see the full list of feature cards. Present the user with the features that do NOT yet have subpages — these are the easiest to spin up since the card already exists.
3. **Confirm Selection:** Ask the user which feature they want to create a page for. If it's a net-new feature not on the hub, note that you'll also add a card to `docs/features.html`.

### Phase 1: Feature Interview (3 Questions)
Ask these one at a time:

1. **The Problem:** "What problem does [feature] solve? What was the user doing before this existed, and why did it suck?"
2. **The Walkthrough:** "Walk me through how someone actually uses this feature — step by step. What do they tap, what do they see?"
3. **The Payoff:** "After someone uses this feature, what changes for them? What do they know or have that they didn't before?"

### Phase 2: Asset Gathering
1. **Identify Needs:** Based on their walkthrough, tell the user exactly what 3-5 screenshots would best visualize this feature page. Be specific (e.g., "The AI scan results screen showing body fat %", "The before/after slider comparison").
2. **Collect:** Ask the user to drop the screenshots into the chat or provide file paths.
3. **Note:** Tell the user you will automatically convert these to highly optimized `.webp` formats.

### Phase 3: Drafting & Implementation
Once the interview is complete and assets are provided, execute the following implementation plan automatically:

1. **Setup Directory:** Create `/docs/features/[slug]/assets/`.
2. **Process Images:** Move the user's provided images into the `assets/` folder. Use the `run_command` tool to run `cwebp` to convert all `.png`/`.jpg` files to `.webp` format with `-q 80`. Delete the originals.
3. **Generate Hero Image:** Use the `generate_image` tool to create a wide hero-style image for the page. **Use this exact prompt structure (fill in the SUBJECT):**
   > *Prompt: "A minimalist, abstract vector line-art illustration of [SUBJECT]. Thin, precise UI-style lines in dark charcoal gray (#2D3748) against a very light off-white/cream background (#F7FAFC). Subtle, muted pastel accent colors (coral red #FF6B6B, sage green #48BB78, golden yellow #ECC94B) used sparingly to highlight key elements. The style should resemble high-end SaaS product illustrations, clean, geometric, with plenty of negative space. No text, no text rendering."*
4. **Draft the Content** following the **Writing Voice & Style** rules below.
5. **Scaffold HTML:** Create `index.html` in the new folder using the **HTML Template** below.
6. **Link from Hub:** Update the corresponding card in `docs/features.html` to wrap it in an `<a>` tag linking to the new subpage.
7. **Update Sitemap:** Add the new feature page to `docs/sitemap.xml`.
8. **Deploy (MANDATORY — do not skip):**
   ```bash
   cd /Users/michael.rode/code/project/gain-frame-privacy && git add -A && git commit -m "feat: add '[feature-name]' feature page" && git push
   ```
   The site is hosted on GitHub Pages, so pushing to `main` triggers an automatic deployment.

## Writing Voice & Style

Feature pages are NOT blog posts. They are product marketing pages — visual, scannable, punchy. Follow these rules:

### Tone: Show, Don't Tell
- Lead with the user's problem, not the feature name.
- Use short declarative sentences. No fluff.
- Write in second person ("you") — talk directly to the user.
- One GainFrame mention max per section. Let screenshots do the selling.

### Structure Rules
1. **Hero Section:** Feature name as H1. One-sentence tagline underneath. App Store badge CTA.
2. **Problem Section:** 2-3 paragraphs max. What sucks about the old way? Be specific and relatable.
3. **How It Works:** 3-4 steps with screenshot for each. Number them. Use H3 for each step title.
4. **Key Details (optional):** Bullet list of secondary capabilities or specs (e.g., "Works offline", "Supports front/side/back poses").
5. **Related Features:** Link cards to 2-3 other feature subpages or blog posts.
6. **Bottom CTA:** App Store download badge.

### Visual Rules
- Use `.feature-page-screenshot` class for phone screenshots (max-width 280px, centered with shadow).
- Use `.feature-page-wide-image` for full-width comparison images.
- Steps section should use alternating left/right layout for screenshots (screenshot left on odd steps, right on even).
- All images must be `.webp` format.

### Paragraph & Sentence Style
- **Maximum 2-3 sentences per paragraph.**
- **Short punchy declarations > long complex sentences.**
- **Second-person address.** Write "you" directly.
- **No filler.** Every sentence must either show value, describe the workflow, or provide a concrete detail.

## HTML Template

Feature subpages use a structure similar to blog posts but with feature-specific sections. **Follow the existing blog post structure** for head metadata, nav, footer, analytics scripts — adapting these key differences:

### Head Metadata
- `<title>`: `[Feature Name] — GainFrame`
- `og:type`: `website` (not `article`)
- JSON-LD: Use `WebPage` schema (not `BlogPosting`)
- Breadcrumbs: Home → Features → [Feature Name]
- Canonical: `https://gainframe.app/features/[slug]/index.html`

### Navigation
Use the same `blog-nav` structure. Set "Features" link as `.active` instead of "Blog":
```html
<nav class="blog-nav">
    <div class="container blog-nav-inner">
        <a href="../../index.html" class="blog-nav-logo">
            <img src="../../assets/favicon.webp" alt="GainFrame" loading="lazy" class="blog-nav-icon">
            <span class="blog-nav-wordmark">GainFrame</span>
        </a>
        <div class="blog-nav-links">
            <a href="../../index.html">Home</a>
            <a href="../../features.html" class="active">Features</a>
            <a href="../../blog.html">Blog</a>
        </div>
    </div>
</nav>
```

### Content Structure
```html
<article class="post">
    <div class="container post-container">
        <!-- Breadcrumb -->
        <nav class="post-breadcrumb scroll-reveal">
            <a href="../../features.html">← All Features</a>
        </nav>

        <!-- Title block -->
        <header class="post-header scroll-reveal">
            <span class="post-category">[CATEGORY: AI Analysis | Progress Tracking | Sharing & Privacy]</span>
            <h1 class="post-title">[Feature Name]: [Tagline]</h1>
            <p class="post-subtitle">[One-sentence benefit statement]</p>
        </header>

        <!-- Hero screenshot -->
        <div class="post-hero-image scroll-reveal">
            <img src="assets/hero.webp" alt="[Feature] in GainFrame" loading="lazy">
        </div>

        <!-- Problem section -->
        <section class="post-body scroll-reveal">
            <h2>[Problem headline phrased as user frustration]</h2>
            <p>...</p>
        </section>

        <!-- How it works steps -->
        <section class="post-body scroll-reveal">
            <h2>How it works</h2>

            <div class="feature-step">
                <h3>1. [Step Title]</h3>
                <p>[Description]</p>
                <img src="assets/step-1.webp" alt="[Step 1]" class="post-inline-screenshot" loading="lazy">
            </div>

            <div class="feature-step">
                <h3>2. [Step Title]</h3>
                <p>[Description]</p>
                <img src="assets/step-2.webp" alt="[Step 2]" class="post-inline-screenshot" loading="lazy">
            </div>

            <!-- ... more steps ... -->
        </section>

        <!-- Key details (optional) -->
        <section class="post-body scroll-reveal">
            <h2>Details</h2>
            <ul>
                <li>...</li>
            </ul>
        </section>

        <!-- Related features -->
        <div class="post-related scroll-reveal">
            <h3>Related Features</h3>
            <ul>
                <li><a href="../[slug]/index.html">[Feature Name]</a></li>
            </ul>
        </div>

        <!-- Bottom CTA -->
        <div class="blog-post-cta scroll-reveal" style="margin-top: 2.5rem; margin-bottom: 2.5rem;">
            <h3>Try [Feature Name] today.</h3>
            <p class="cta-subtitle">Download GainFrame from the App Store — free to start.</p>
            <div class="app-store-wrapper" style="margin-top: 1rem; display: flex; justify-content: center;">
                <a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082" class="app-store-badge-link" target="_blank" rel="noopener">
                    <img src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png" alt="Download on the App Store" style="height: 48px; width: auto;" />
                </a>
            </div>
        </div>

        <!-- Back link -->
        <footer class="post-footer scroll-reveal">
            <a href="../../features.html" class="post-back-link">← Back to all features</a>
        </footer>
    </div>
</article>
```

### Footer & Scripts
Use the exact same site footer and analytics scripts as blog posts (TikTok pixel, Cloudflare analytics, scroll-reveal observer) — with `../../` relative paths.

## Linking from Features Hub

When the feature subpage is created, update the corresponding card in `docs/features.html` to link to it. Wrap the entire `.feature-link-card` content in an anchor tag:

```html
<a href="features/[slug]/index.html" class="feature-link-card scroll-reveal reveal-delay-N" style="text-decoration: none; color: inherit;">
    <!-- existing card content stays the same -->
</a>
```

If the card is a `<div>`, change it to an `<a>` tag. Keep all existing classes and content.

## Rules & Constraints
- **Never write the page without the interview.** The user's specific answers about the problem and workflow are what make feature pages compelling.
- **Images must be WebP.** Never link a .png or .jpg in the final HTML.
- **Pro Badge:** If the feature requires a Pro subscription, include `<span class="pro-label">Pro</span>` next to the feature name in the H1.
- **Mobile First:** Ensure all screenshots and steps stack cleanly on mobile. Use the existing responsive classes.
- **Internal Linking:** Always include a "Related Features" section linking to at least 2 other feature subpages or relevant blog posts.

## Reference Files
- `/docs/features.html` (Hub page — must link the new card)
- `/docs/sitemap.xml` (Must be updated)
- `/docs/styles.css` (For existing component classes)
- `/docs/blog/deep-dive-compare/index.html` (Reference for HTML structure, metadata, nav, footer)
