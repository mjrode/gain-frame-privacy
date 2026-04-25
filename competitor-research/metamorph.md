# Competitor Profile: Metamorph (Progress Pic Photos)

**Last scanned:** 2026-04-25
**Primary surface:** App Store only (no separate marketing website discovered)
**App Store URL:** https://apps.apple.com/us/app/progress-pic-photos-metamorph/id6544789120
**Scope:** App Store metadata + listing copy

---

## Positioning

- **App Name:** Progress Pic Photos: Metamorph
- **Subtitle:** "Fitness Pictures Tracker App"
- **Developer:** Tiny Ideas Pty Ltd (Australia)
- **Hero claim:** "The easiest way to capture changes in your body through progress pics"
- **Target audience signals:** Anyone tracking body changes — fitness gains, weight loss, "personal growth." NOT gym-specific. NOT lifter-focused. Broad consumer angle.
- **Primary CTA:** App Store download → in-app subscription paywall

### CRITICAL POSITIONING — Anti-AI / Privacy-First

This is Metamorph's defining angle. Verbatim from their description:
> *"Built for privacy: Your photos stay on your device or iCloud — we don't store, or even have access to your photos."*

And from their LocalOneLabs review (gathered in discovery):
> *"Long-term, accurate visual progress using your real photos, kept private on your device and in iCloud, rather than uploading them to AI systems."*

**Translation:** Metamorph explicitly positions AGAINST AI body comp apps like GainFrame. The "we don't even have access to your photos" line is a direct, deliberate dig at apps that send photos to cloud AI (which GainFrame does — to Google Gemini).

This is the most defined attack on GainFrame's product model in the entire competitor set. **Direct comparison-article candidate.**

---

## Pricing

| Tier | Price | Notes |
|---|---|---|
| Free | $0 | Base app |
| Pro Weekly | $4.99 / wk | |
| Pro Monthly | $4.99 / mo | (note: weekly and monthly are the same price — likely a positioning trick) |
| Pro Annual | $29.99 / yr | **25% cheaper than GainFrame yearly** |
| Lifetime Pro | **$129.99 one-time** | Unique vs GainFrame's subscription-only model |

Lifetime IAP is interesting — appeals to subscription-fatigued users. GainFrame has no comparable lifetime tier.

---

## Advertised Features

(Verbatim, paraphrased)

- Take or upload progress photos
- **Automatic alignment and overlays** for consistent progress pics
- Daily / weekly / custom reminders
- Time-lapse and before/after video creation
- GIF and video export, social-ready
- Camera timer for hands-free
- Full-screen viewing mode
- Siri integration via App Intents

**Notable absence:** No AI body composition. No body fat percentage. No muscle scoring. No workout integration. No Future Physique. **Pure photo tracking — no analysis layer.**

---

## Content Footprint

- **No marketing website.** App Store listing only.
- **Reviews:** 64 ratings @ 4.5 stars (vs GainFrame's 20)
- **Update velocity:** Version 2.13, last updated **April 9, 2026** — recent, active
- **App size:** 55 MB (lean)
- **Age rating:** 4+
- **Platform reach:** **iPhone, iPad, Mac, Vision, Apple Watch** — broader Apple ecosystem support than GainFrame (iPhone-only)

---

## Overlap with GainFrame's existing content

None — Metamorph has no published content to overlap with.

---

## Topics they cover but GainFrame does NOT

None content-wise — but their **anti-AI privacy positioning** is a topic GainFrame should address head-on. A blog post titled "AI body composition apps vs privacy-first photo trackers: when does each make sense?" would directly counter Metamorph's framing while being honest about GainFrame's Gemini dependency.

---

## Notes for comparison article writing

If `comparison-article-generator` ever writes "Metamorph vs GainFrame" or "Privacy-first vs AI-powered progress photo apps":

- **Verified pricing:** Free + Weekly $4.99 + Monthly $4.99 + Annual $29.99 + Lifetime $129.99. Yearly is **$10/yr cheaper than GainFrame**; lifetime is a unique offering GainFrame doesn't match.
- **Verified accuracy claim:** **None — they don't measure body composition.** They're a photo tracker, not a body comp tool. This is a feature not a bug for their audience.
- **Verified target audience:** Generic body change tracking. Includes "weight loss" and "personal growth" framing — NOT gym-specific.
- **Known limitations (from missing features):**
  - No body fat estimation
  - No muscle scoring
  - No workout integration
  - No Future Physique prediction
  - No analysis at all — purely a photo album with overlay/comparison tools
- **Verified strengths to acknowledge:**
  - **Privacy positioning is real and defensible** — "we don't have access to your photos" is provably true if photos never leave the device. GainFrame cannot match this without redesigning the AI inference flow.
  - Lifetime $129.99 pricing is a genuine alternative to subscription fatigue
  - Apple ecosystem reach (iPad, Mac, Vision, Watch) exceeds GainFrame
  - Cleaner, more focused product (one job: track photos)
- **Honest framing:** Metamorph and GainFrame solve different problems for different users. **Metamorph is right for users who:** (a) trust their own eyes more than AI estimates, (b) prioritize photos-never-leave-device privacy, (c) want a one-time-purchase option, (d) use multiple Apple devices. **GainFrame is right for users who:** (a) want measurable physique data alongside photos, (b) want AI feedback on muscle group development, (c) want Future Physique prediction, (d) want workout context auto-attached.
- **Critical:** Don't pretend GainFrame's privacy posture matches Metamorph's. **It doesn't.** GainFrame sends photos to Google Gemini for inference (then never persists them). That's a meaningful difference. Acknowledge it honestly — your `product-context.md` already lists this as an honest limitation. Use that hedging.

---

## Methodology

- App Store listing fetched via WebFetch (1 call)
- Anti-AI positioning verified across two sources: their own App Store description AND a third-party review (LocalOneLabs blog) that called out the framing
- No marketing website confirmed via discovery search snippets

**Last refresh:** 2026-04-25 — refresh in 6 months OR if Metamorph adds any analysis features (would weaken their privacy positioning).
