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
1. **Search Existing:** Before asking for a topic, use `list_dir` on `/blog/` to see what already exists.
2. **Warn User:** If the requested topic is very similar to an existing slug (e.g. they ask for "how to take progress photos" but `5-tips-better-progress-photos` exists), warn them. Ask if they want to update the existing post or spin up a new, specific angle.

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
3. **Generate Cover Image:** Use the `generate_image` tool (or `fal-generate` skill) to create a striking 4:3 cover image for the blog grid. **You MUST use this exact prompt structure (fill in the SUBJECT):**
   > *Prompt: "A minimalist, abstract vector line-art illustration of [SUBJECT]. Thin, precise UI-style lines in dark charcoal gray (#2D3748) against a very light off-white/cream background (#F7FAFC). Subtle, muted pastel accent colors (coral red #FF6B6B, sage green #48BB78, golden yellow #ECC94B) used sparingly to highlight key elements. The style should resemble high-end SaaS product illustrations, clean, geometric, with plenty of negative space. No text, no text rendering."*
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
1. **Opening hook (mandatory):** Open with a frustration the reader has personally experienced. Use specific numbers. Make them nod before they scroll. Do not use a generic thesis statement or SEO keyword summary. Examples:
   - ✅ *"You step on your bathroom scale and it tells you that you're 18% body fat. The next morning... it reads 21%."*
   - ✅ *"Someone tells you they're at 15% body fat. What does that actually look like?"*
   - ❌ *"Search intent for body fat estimation is relentless and highly visual."*
2. **Body sections:** Use direct, specific H2s that target long-tail keywords. Prefer "What 15% body fat looks like" over "The 15% Range."
3. **Mid-post Checklist (for guide/comparison posts):** Include a 'Quick Checklist' or 'How to Standardize' section with bullet-pointed, do-it-today advice that readers can easily copy and paste.
4. **Actionable closing (mandatory):** End with a concrete numbered framework the reader can follow — not a GainFrame sales pitch. Example: *"First, choose a target. Second, pick a tracking method. Third, reassess every 4–8 weeks."*
5. **Closing blockquote (optional but encouraged):** A summative callout that reinforces the core takeaway.

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

### Visual Components Available
- `post-callout` blockquotes for key takeaways
- `post-feature-grid` / `post-feature-card` for visual marker cards (emoji icon + title + description)
- `post-inline-screenshot` for phone screenshots floated inline with text
- `post-hero-image` for full-width wide images (comparison grids, charts)
- `post-table-wrapper` / `post-table` for data tables
- `post-steps` ordered list for numbered frameworks

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
5. **Scaffold HTML:** Create `index.html` in the new folder. 
   - Use the standard structure from existing blog posts (e.g., `blog/measure-muscle-gain-without-scale/index.html`).
   - Include Twitter/OpenGraph meta cards. Set the `og:image` to one of the screenshots (not the abstract cover).
   - Include JSON-LD structured data for `BlogPosting`.
   - Ensure you use the standard TestFlight CTA (`.blog-post-cta` container with standard button).
6. **Update Index:** Add the new blog post to the top of the grid in `blog.html`. Use the generated vector cover image.
7. **Update Sitemap:** Add the new blog post to `sitemap.xml`.
8. **Update Backlog:** If this post was from `TODO_SEO.md`, check it off and add the publish date.
8. **Deploy (MANDATORY — do not skip):** After all files are written and the blog index is updated, you MUST run the following commands automatically:
   ```bash
   cd /Users/michael.rode/code/project/gain-frame-privacy && git add -A && git commit -m "feat: add '[keyword]' SEO blog post" && git push
   ```
   The site is hosted on GitHub Pages, so pushing to `main` triggers an automatic deployment. The post is not "published" until this step completes.

## Rules & Constraints
- **Never write the post in one shot without the interview.** The user's specific tone and raw answers are what make the content rank and convert.
- **Images must be WebP.** Never link a .png or .jpg in the final HTML.
- **Mobile First CTAs:** Ensure the inline and bottom CTAs use the `<div class="blog-post-cta scroll-reveal">` class structure so they stack elegantly on mobile.
- **Internal Linking:** Always include a "Related posts" `<ul>` at the bottom of the article linking to at least 3 other existing blog posts.

## Reference Files
- `/blog.html` (Must be updated with the new post)
- `/sitemap.xml` (Must be updated with the new post)
- `/TODO_SEO.md` (For topic inspiration and task tracking)
- `/styles.css` (For reference to standard typography and CTA classes)

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
