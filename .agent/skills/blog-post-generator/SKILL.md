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

### Phase 1: Topic & Angle Interview
1. **Topic Selection:** Ask the user for the target SEO keyword/topic. If they don't have one, check `TODO_SEO.md` backlog and suggest the highest ROI option.
2. **The "Why":** Ask the user 1-2 pointed questions to capture their raw, unfiltered thoughts on the topic. (e.g., "What is the single most frustrating thing about [Topic]?")
3. **The Solution:** Ask how GainFrame specifically solves this problem better than the alternative.

### Phase 2: Asset Gathering
1. **Identify Needs:** Based on their answers, tell the user exactly what 2-4 screenshots would best visualize this post (e.g., "A side-by-side comparison", "The Deep Dive analysis screen").
2. **Collect:** Ask the user to drop the screenshots into the chat or provide file paths.
3. **Note:** Tell the user you will automatically convert these to highly optimized `.webp` formats.

### Phase 3: Drafting & Implementation
Once the interview is complete and assets are provided, execute the following implementation plan automatically:

1. **Setup Directory:** Create `/blog/[slug-name]/assets/`.
2. **Process Images:** Move the user's provided images into the `assets/` folder. Use the `run_command` tool to run `cwebp` to convert all `.png`/`.jpg` files to `.webp` format with `-q 80`. Delete the original files.
3. **Draft the Content:** 
   - Write the blog post using the raw interview notes. 
   - Ensure the primary keyword is in the H1, the first paragraph, and at least one H2.
   - Use the `content-creator` SEO best practices: solve a pain point, keep paragraphs short, and avoid fluff.
4. **Scaffold HTML:** Create `index.html` in the new folder. 
   - Use the standard structure from existing blog posts (e.g., `blog/measure-muscle-gain-without-scale/index.html`).
   - Include Twitter/OpenGraph meta cards. Set the `og:image` to the most visually striking WebP asset you just converted.
   - Include JSON-LD structured data for `BlogPosting`.
   - Ensure you use the standard TestFlight CTA (`.blog-post-cta` container with standard button).
5. **Update Index:** Add the new blog post to the top of the grid in `blog.html`. Use a relevant cover image or one of the assets.
6. **Update Backlog:** If this post was from `TODO_SEO.md`, check it off and add the publish date.
7. **Deploy:** Git add, commit with `feat: add '[keyword]' SEO blog post`, and push to origin.

## Rules & Constraints
- **Never write the post in one shot without the interview.** The user's specific tone and raw answers are what make the content rank and convert.
- **Images must be WebP.** Never link a .png or .jpg in the final HTML.
- **Mobile First CTAs:** Ensure the inline and bottom CTAs use the `<div class="blog-post-cta scroll-reveal">` class structure so they stack elegantly on mobile.
- **Internal Linking:** Always include a "Related posts" `<ul>` at the bottom of the article linking to at least 3 other existing blog posts.

## Reference Files
- `/blog.html` (Must be updated with the new post)
- `/TODO_SEO.md` (For topic inspiration and task tracking)
- `/styles.css` (For reference to standard typography and CTA classes)
