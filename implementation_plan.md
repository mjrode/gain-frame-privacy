# GainFrame Marketing Updates Implementation Plan

This document outlines the step-by-step plan for incorporating the new promotional assets (`assets/GF-Promo/`) into the GainFrame marketing website and blog.

## Asset Inventory

The following new screenshots and videos are available to use:
* `album-sync.PNG`
* `deep-dive-single-picture.mov`
* `face-blur.PNG`
* `home-page.PNG`
* `single-picture-hevy-integration.PNG`
* `smart-compare-options.PNG`
* `time-line-video.PNG`
* `timeline-day.PNG`
* `timeline-quarter.PNG`

## Proposed Changes

### Phase 1: Website Homepage (`index.html` & `styles.css`)

The current `index.html` uses placeholder screenshot paths (`assets/smart-import.PNG`, `assets/throwback.PNG`, etc.) that were established during the Cal AI-style redesign. We will map the new precise assets to these sections or create new sections where appropriate.

#### [MODIFY] `index.html`
* **Hero Section:** Replace the placeholder `hero-dashboard.PNG` with `assets/GF-Promo/home-page.PNG`.
* **Feature: AI Deep Dive:** Ensure the video `deep-dive-single-picture.mov` can be embedded and auto-played (looping, muted, playsinline) instead of a static PNG, or determine if it's better suited for the blog. *If used here, we'll need to wrap it in a styled HTML5 `<video>` tag.*
* **Feature: AI Compare:** The placeholder is `deep-dive-compare.PNG`. We will add a mention or sub-section for the new filtering features and use `assets/GF-Promo/smart-compare-options.PNG`.
* **Feature: Built for the Gym (Grid):**
    * Update the **Face Blur & BG Remove** card description and consider adding `assets/GF-Promo/face-blur.PNG` as a visual if the grid supports images, or leave it icon-based.
    * Update the **Apple Health & Hevy** card to explicitly mention the new integration and potentially link to a new blog post using `assets/GF-Promo/single-picture-hevy-integration.PNG`.

#### [MODIFY] `styles.css`
* Add responsive CSS rules for embedding `.mov` or `.mp4` video files within the existing `feature-image-mockup` phone mockup containers (border-radius, object-fit, etc.).

---

### Phase 2: Update Existing Blog Posts

#### [MODIFY] `blog/5-tips-better-progress-photos.html`
* Review current image usage.
* Inject `assets/GF-Promo/smart-compare-options.PNG` when discussing how to filter and find the best comparison photos.

#### [MODIFY] `blog/how-ai-body-composition-analysis-works.html`
* Replace static examples with the new video `assets/GF-Promo/deep-dive-single-picture.mov` to visually demonstrate the AI review process from start to finish.
* Add HTML5 video embed code and fallback styling in CSS if necessary.

#### [MODIFY] `blog/future-physique-ai-prediction.html`
* Review the current placeholder assets. Ensure the narrative flows with the existing prediction logic.

---

### Phase 3: Write New Blog Posts

We will create two new blog posts to highlight specific high-value features, adding them to the `/blog` directory and linking them from `blog.html` and `index.html`.

#### [NEW] `blog/timeline-tracking-guide.html`
* **Topic:** How to visualize your progress over time using the Timeline features.
* **Assets Used:** `assets/GF-Promo/timeline-day.PNG`, `assets/GF-Promo/timeline-quarter.PNG`, and `assets/GF-Promo/time-line-video.PNG`.
* **Content:** Explain the difference between Daily, Monthly, and Quarterly views, and how generating a timeline video helps visualize subtle changes.

#### [NEW] `blog/smart-integrations-hevy.html`
* **Topic:** Maximizing your progress photos with Hevy and smart sync logic.
* **Assets Used:** `assets/GF-Promo/single-picture-hevy-integration.PNG` and `assets/GF-Promo/album-sync.PNG`.
* **Content:** Detail how GainFrame auto-attaches workout volume from Hevy to the exact photo taken that day, and how the Smart Sync engine manages thousands of photos in the background.

#### [MODIFY] `blog.html`
* Add cards for the two new articles to the grid.
* Update thumbnail paths for existing featured articles if they changed.

---

## User Review Required

> [!IMPORTANT]
> - Do you want the `deep-dive-single-picture.mov` video embedded natively on the `index.html` homepage, or should we keep the homepage lightweight with static images and strictly use the video in the blog post?
> - Are you okay with adding custom CSS to `styles.css` to properly style HTML5 `<video>` tags so they look seamless inside the phone mockup frames?

## Verification Plan

### Manual Verification
1. I will use the `run_command` tool to serve the website locally (e.g., using Python's `http.server`).
2. I will use the `read_url_content` or terminal `curl` tools to verify no broken links or missing asset paths exist in the updated HTML files.
3. You will need to open `index.html` and the `/blog` pages in a standard web browser (Safari/Chrome) to verify that:
    - The new screenshots look correct within the layout frames.
    - The video file auto-plays natively on desktop and mobile.
    - The two new blog posts are accessible from the main `blog.html` feed.

---

### Phase 4: Write "Before vs. After" Blog Post

#### [NEW] `blog/before-after-comparing-progress-photos.html`
* **Topic:** What Comparing Progress Photos Actually Looked Like Before GainFrame.
* **Assets Used:**
  * Raw before photos from camera roll (`assets/before-after/before.PNG` and `assets/before-after/after.PNG`)
  * GainFrame's compare view showing aligned photos with stats (`assets/before-after/compare.PNG`)
  * Slider compare feature in action (`assets/before-after/slider.PNG`)
  * Hevy integration view (`assets/GF-Promo/single-picture-hevy-integration.PNG`)
* **Content:** 6 distinct problem-solution pairs showing the contrast between the old manual way and GainFrame's automated AI body composition analysis, auto-alignment, Hevy tracking, and slider compare features.

#### [MODIFY] `blog.html`
* Add a card for "What Comparing Progress Photos Actually Looked Like Before GainFrame".
* Use `assets/before-after/compare.PNG` as the thumbnail.
