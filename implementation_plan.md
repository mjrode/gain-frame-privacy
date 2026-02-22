# Goal Description
Write and publish a new blog post targeting Hevy app users, emphasizing how GainFrame connects their precise workout tracking (volume, sets, reps) directly to their visual physique progress. Add the new post to the main blog index.

## Proposed Changes

### Blog Content
#### [NEW] `blog/hevy-app-gainframe-integration.html`
- Create a new, SEO-optimized blog post with the working title: **"GainFrame + Hevy: The Ultimate Physique Tracking Stack"**
- **Audience Focus:** Hevy users who meticulously track their workouts but lack connected visual progress.
- **Content Structure:**
  - **Lede:** Focuses on the pain point—you track every set, rep, and pound of volume in Hevy, but your progress photos are sitting disconnected in your camera roll.
  - **Feature Highlight 1:** Auto-attaching Hevy workouts to GainFrame progress photos. Will feature the `single-picture-hevy-integration.PNG` asset.
  - **Feature Highlight 2:** Seeing your training context over time in the timeline view. Will feature the `timeline-day.PNG` asset.
  - **Branding:** Include the provided Hevy SVG logo alongside GainFrame's standard styling (scroll-reveal, feature grids, typography).
  - **CTA:** Get early access to GainFrame.

#### [MODIFY] `blog.html`
- Add a new post card to the `blog-grid` section, right at the top (or in the prominent magazine grid).
- Ensure the card links properly to the new `hevy-app-gainframe-integration.html` file and includes a thumbnail (e.g., `timeline-day.PNG`).

## Verification Plan
### Manual Verification
- View `blog/hevy-app-gainframe-integration.html` via the running local server (`http://localhost:8000/blog/hevy-app-gainframe-integration.html`) to verify layout, responsive design, image paths, and scroll animations.
- View `blog.html` to confirm the new post appears correctly in the grid and that the link routes to the new article properly.
- Ensure the requested Hevy logo SVG renders correctly on the page.
