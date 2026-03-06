# GainFrame App Store Launch Plan

## Overview

GainFrame is transitioning from TestFlight beta (87 test users) to public App Store availability. This plan covers beta user migration, a phased marketing launch, and post-launch momentum.

## Confirmed Details

| Item | Value |
|---|---|
| **Pricing** | $4.99/month · $29.99/year · 1-week free trial |
| **TestFlight users** | 87 (handful of highly engaged) |
| **Mailchimp list** | 150 subscribers (used for TestFlight invites) |
| **Product Hunt** | Week +1 or +2 (not launch day) |

---

## Phase 0: Beta User Migration (Week -2 to -1)

Your 87 TestFlight users are your most important asset right now. Handle them well.

### Thank-You Communication (Top ~10 Engaged Testers)
Send a **personal email** (not bulk) to each tester who gave meaningful feedback:
- Thank them by name for specific feedback they gave
- Give them a **free year of Pro** (their goodwill is worth more than $29.99)
- Ask them to leave an honest review on Day 1 — this is critical for early App Store ranking

### Broader Beta User Email (All 87)
Send 1 week before launch via Mailchimp (segment: TestFlight users):
- Subject: *"GainFrame is going live — and you helped build it"*
- Offer all beta testers a **free month of Pro** as thanks (promo code or extended trial)
- Explain that TestFlight builds will expire — download from the App Store
- Include direct App Store link
- Ask for an honest review

### Technical Prep
- [ ] Ensure `isPro` TestFlight override won't apply to App Store builds
- [ ] Verify RevenueCat production `appl_` key is configured
- [ ] Submit to App Review at least 1 week early (buffer for rejection iterations)
- [ ] Prepare App Store screenshots, description, and keywords (use the ASO skill)
- [ ] Update the website: replace all TestFlight links with App Store links
- [ ] Update all blog posts: swap TestFlight CTAs for App Store buttons


---

## Mailchimp Strategy (150 Subscribers)

Your email list is your highest-conversion owned channel. These people already raised their hands.

### Email 1: Pre-Launch Hype (Week -1)
- **Subject**: *"GainFrame launches next week — here's what's coming"*
- What the app does (for subscribers who signed up months ago and may have forgotten)
- Tease the key features: AI body fat analysis, ghost overlay, trend tracking
- Pricing reveal: *"$4.99/month or $29.99/year — with a free week to try everything"*
- Build anticipation: *"Reply to this email if you want early access on Day 1"*

### Email 2: Launch Day Blast (Day 0)
- **Subject**: *"It's here. GainFrame is live on the App Store."*
- Direct App Store download link (big, prominent button)
- 1-week free trial CTA: *"Try every Pro feature free for a full week"*
- Brief feature highlights with screenshots
- Ask for a review: *"If you like what you see, a quick review helps more than you know"*

### Email 3: Post-Launch Follow-Up (Day +5)
- **Subject**: *"Your free trial ends in 2 days — here's what you'll keep"*
- Remind what Pro unlocks vs. free tier
- Share a beta tester testimonial
- Conversion-focused: *"Lock in $29.99/year (save 50% vs monthly)"*

### Email 4: Product Hunt Day (Week +1-2)
- **Subject**: *"We're live on Product Hunt — can we count on your vote?"*
- Direct PH link
- Explain why it matters (1 sentence)
- This email alone can drive 20-30 upvotes from your list

### Ongoing: Update the Signup Flow
- Update Mailchimp signup forms on the website from "Join the Beta" → "Download on the App Store"
- Update email welcome sequence to point to App Store (not TestFlight)

---

## Phase 1: Launch Day Content (Day 0)

### Blog Post: "GainFrame Is Live on the App Store"
Use the Blog Post Generator workflow:
- **Opening hook**: Not "we're excited to announce" — instead lead with the problem you solve: *"Your gym selfies have been lying to you. Starting today, they can tell the truth."*
- Cover: what the app does, why it exists, what makes it different
- Include the DEXA validation data point (19% vs 18.6%)
- Link to the npj Digital Medicine study
- Screenshots: deep dive, ghost overlay, trend dashboard
- End with App Store download CTA (not TestFlight)

### Social Posts (all same day)

**Twitter/X:**
- Thread format (5-7 tweets)
- Tweet 1: Hook — *"I built an app that turns your gym selfies into DEXA-quality body fat analysis. Today it's live on the App Store."*
- Tweet 2: The problem (scales lie, DEXA is expensive)
- Tweet 3: The 2025 study (0.98 CCC with DEXA)
- Tweet 4: What the app actually does (with screenshot/GIF)
- Tweet 5: What beta testers said (pull a real quote if you have one)
- Tweet 6: App Store link
- Tweet 7: Vision/roadmap teaser

**Instagram:**
- Carousel post (8-10 slides)
- Slide 1: Bold hook text on brand background
- Slides 2-5: Before/after screenshots, app features
- Slide 6: Study validation data
- Slide 7-8: User testimonials (ask beta testers for permission)
- Slide 9: App Store QR code / link in bio
- Also post a Reel (15-30s) showing the app in action

**TikTok:**
- Short-form video (30-60s)
- Format: "POV: you just found out your $30 smart scale is wrong by 5%"
- Show the app scanning a photo → results appearing
- End card with App Store link
- Use trending sounds if applicable
- Target: #fitness #gymtok #bodyfat #gym

### Reddit Strategy

> [!WARNING]
> Reddit hates self-promotion. Every post must provide genuine value first.

**Target subreddits** (sorted by fit):
1. **r/fitness** — post as a discussion about AI body fat tracking, reference the study, mention your app exists as one option
2. **r/bodybuilding** — share the comparison image from your blog showing body fat percentages
3. **r/loseit** — frame around tracking progress without obsessing over the scale
4. **r/naturalbodybuilding** — technical discussion about body composition tracking methods
5. **r/leangains** — body recomp tracking angle

**Format**: Lead with value (study data, visual guide, tracking tips). Mention GainFrame only in a comment, not the main post. Let people discover it organically.

---

## Phase 2: Product Hunt (Week +1 or +2)

> [!TIP]
> **Do NOT launch on Product Hunt on the same day as the App Store.** You want your App Store listing to already have reviews and a few days of data before sending PH traffic. PH visitors are tech-savvy and will notice a brand-new listing with 0 reviews.

### Preparation (Week -1 to 0)
- [ ] Create a Product Hunt maker profile
- [ ] Prepare assets: logo, gallery images (5-6), tagline, short description
- [ ] Write the long description (use hook style, not corporate speak)
- [ ] Record a 60-90s demo video (screen recording + voiceover)
- [ ] Prepare a "first comment" that tells your founder story
- [ ] Line up 10-15 supporters to upvote and comment on launch morning
- [ ] Reach out to PH community members in advance

### Tagline Options
- "Turn your gym selfies into DEXA-quality body fat analysis"
- "AI body composition tracking, validated by peer-reviewed research"
- "Your phone camera is more accurate than your smart scale"

### Launch Day (Tuesday–Thursday)
- Post at 12:01 AM PT
- Be online all day responding to every comment
- Share the PH link across all social channels
- Direct all traffic to the App Store listing

---

## Paid Ads: Wait (Week +3 or Later)

> [!CAUTION]
> **Do NOT run paid ads at launch.** Here's why:

1. **No conversion data yet**: You don't know your App Store conversion rate, retention, or LTV. Running ads without this data is burning money.
2. **No social proof**: App Store reviews take 1-2 weeks to accumulate. Ads pointing to a listing with 2 reviews won't convert.
3. **Organic signals first**: Apple rewards organic installs and engagement. Let the algorithm work for you initially.

### When to Start Ads (Week 3+)
- Once you have 10+ App Store reviews (4.5+ stars)
- Once you know your Day 7 and Day 30 retention rates
- Start with **Apple Search Ads** (highest intent, lowest waste):
  - Keywords: "body fat calculator", "body fat app", "body composition tracker"
  - Budget: $10-20/day to test
- Then experiment with **Meta ads** (Instagram/Facebook):
  - Target: fitness enthusiasts, gym-goers, 20-45
  - Creative: before/after format or "your scale is lying" hook

---

## Post-Launch Momentum (Week +2 to +4)

### Keep Launching
Per the ORB framework, every update is a launch opportunity:
- **Week 2**: Publish a "What We Learned From Launch" blog post
- **Week 3**: Share user milestone (first 100 downloads, interesting feedback)
- **Week 4**: Feature spotlight post (pick one feature, go deep)

### Comparison/SEO Pages
Publish at least 2 comparison posts:
- "GainFrame vs Formfy" (capitalize on Formfy's forced-rating pain point)
- "GainFrame vs Smart Scales" (capitalize on BIA frustration)

### Email Sequence
Set up a 5-email onboarding drip for new users:
1. Welcome + quick start guide (Day 0)
2. "Take your first photo" nudge (Day 1)
3. Feature spotlight: Deep Dive report (Day 3)
4. "Import your gym selfies" prompt (Day 7)
5. Pro features + upgrade prompt (Day 14)

---

## Launch Checklist

### Week -2
- [ ] Submit app to App Review
- [ ] Prepare App Store listing (screenshots, description, keywords)
- [ ] Draft all social posts
- [ ] Draft launch blog post
- [ ] Record TikTok/Reel video
- [ ] Send personal thank-you emails to top ~10 beta testers
- [ ] Send Mailchimp Email 1 (pre-launch hype) to full list

### Week -1
- [ ] App approved and set to "Manual Release"
- [ ] Update website: swap all TestFlight → App Store links
- [ ] Update all blog CTAs to point to App Store
- [ ] Update Mailchimp signup forms ("Join Beta" → "Download")
- [ ] Prepare Product Hunt listing (don't publish yet)
- [ ] Send beta user migration email (all 87)
- [ ] Schedule social posts

### Launch Day
- [ ] Release app on the App Store
- [ ] Send Mailchimp Email 2 (launch day blast) to full list
- [ ] Publish blog post
- [ ] Post all social content (Twitter thread, IG carousel + Reel, TikTok)
- [ ] Post Reddit contributions (value-first, no spam)
- [ ] Monitor App Store Connect for crash reports
- [ ] Respond to every comment and DM

### Day +3
- [ ] Send Mailchimp Email 3 (trial ending follow-up)
- [ ] Follow up with beta testers who haven't reviewed

### Week +1
- [ ] Product Hunt launch (Tue–Thu)
- [ ] Send Mailchimp Email 4 (PH vote request)
- [ ] Monitor and respond to App Store reviews
- [ ] Publish first post-launch content piece

### Week +2-4
- [ ] Publish comparison pages (vs Formfy, vs smart scales)
- [ ] Set up Mailchimp onboarding email sequence (5-email drip)
- [ ] Analyze retention data
- [ ] Consider Apple Search Ads (if reviews ≥ 10)
