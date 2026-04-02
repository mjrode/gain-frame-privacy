# GainFrame Mascot — TikTok Carousel Style Guide

## The Character
- **Head:** GainFrame scan-frame logo (bracket corners in black, with the "S"-curve nose, two googly eyes, and a red bracket accent in the bottom-right)
- **Body:** Solid black/dark charcoal silhouette figure wearing olive/army-green shorts and gray/brown chunky sneakers
- **Build:** Can range from average (template pose) to muscular (gym scenes) depending on the slide context
- **Expression:** Conveyed through the googly eyes and nose position — curious, strained, happy, sleeping, etc.

## Visual Style Constants
- **Background:** Warm beige/tan (#E8D5B7 to #F0E0C8) — flat, no gradients
- **Art style:** Clean cartoon/comic illustration — thick outlines, flat colors, minimal shading
- **Color palette:** Black body, olive-green shorts, gray-brown shoes, red bracket accent. Props use muted realistic tones (silver gym equipment, blue bedding, etc.)
- **Aspect ratio:** 9:16 (1080×1920) for TikTok carousel
- **No text in illustrations:** Text banners are added separately in CapCut/Canva on top of the illustration

## Slide Layout Patterns

### Cover Slide (Slide 0)
- Bold, all-caps title text (white text on black banner/pill, or large bold text with accent color on key words)
- Mascot in a simple pose or action that represents the topic
- May include the mascot interacting with a prop (whiteboard, clipboard, etc.)

### Numbered Content Slides (1-5)
- **Title banner:** Numbered title at top in black pill/banner with white text (e.g., "1. You Won't See Progress Overnight")
- **Subtitle:** 2-3 lines of supporting text in bold, dark text below the banner
- **Illustration:** Mascot performing an action that visualizes the tip
- Common visual devices:
  - ✅/❌ comparison (correct form vs. wrong form)
  - Mirror reflection (aspiration vs. reality)
  - Props: barbells, dumbbells, leg press, phone on tripod, bed + alarm clock
  - Thought bubbles for aspirations
  - Before/After arrows
  - Multiple mascot instances in one scene (do this / don't do this)

## Scene Reference Library

| Scenario | Description | File Reference |
|----------|-------------|----------------|
| Template/Neutral | Standing front-facing, arms at sides | `gf-mascot-template.jpeg` |
| Mirror Reflection | Flexing in front of mirror, thought bubble with muscular version | `mirror-mascot.jpeg` |
| Good vs Bad Form | Two mascots squatting — one correct (✅), one wrong (❌) | `mascot-form.jpeg` |
| Leg Day | Muscular build, doing shoulder press near leg press machine | `mascot-legs.jpeg` |
| Progress Photos | Double bicep flex pose next to phone on tripod | `mascot-pictures.jpeg` |
| Sleeping/Recovery | Lying in bed with alarm clock, peaceful expression | `mascot-sleep.jpeg` |

## Competitor Reference — Title Patterns (Blue Mascot Accounts)

These are proven high-engagement title formats from similar mascot-style fitness TikTok accounts (500K-1.3M+ views each):

### Workout Structure
- "THE ULTIMATE SHOULDERS & ARMS WORKOUT"
- "STRUCTURE THE PERFECT LEG DAY"
- "THE BEST UPPER BODY WORKOUT"
- "THE ULTIMATE UPPER BODY DAY"
- "5-DAY GYM SPLIT"
- "PPL SPLIT REVIEW"
- "IS THIS THE PERFECT PULL DAY?"
- "Build Your Perfect Bulking Routine"

### Exercise Recommendations
- "EVERY S-TIER EXERCISE YOU NEED IN YOUR PROGRAM"
- "TOP 5 EXERCISES FOR HUGE QUADS"
- "TOP 5 EXERCISES FOR A HUGE CHEST"
- "The Only 5 Exercises You Need To Grow Huge Arms"
- "HOW TO HIT EVERY PART OF YOUR ARMS"
- "HIT ALL 3 HEADS OF THE SHOULDER"

### Mistakes & Fundamentals
- "KNOW THE FUNDAMENTALS" (Reps, Sets, Rest, Intensity, Frequency)
- "Know The Gym Fundamentals" (Sets, Reps, Rest)
- "GYM ADVICE YOU MUST KNOW"
- "THE #1 MISTAKE KILLING YOUR GAINS"
- "STOP SKIPPING YOUR SHOULDER WARM-UP"
- "REDUNDANT EXERCISES IN THE SAME WORKOUT"

### Body Composition & Nutrition
- "The Secret To Cutting Right" (Before → After)
- "DO THIS IF YOU'RE SKINNY FAT"
- "HOW MUCH IS 30G OF PROTEIN?"

### Title Format Patterns
1. **"THE ULTIMATE [BODY PART] [WORKOUT/DAY]"** — authority framing
2. **"TOP 5 [EXERCISES] FOR [GOAL]"** — listicle format
3. **"THE #1 MISTAKE [NEGATIVE OUTCOME]"** — fear/curiosity hook
4. **"STOP [BAD HABIT]"** — command format
5. **"[QUESTION]?"** — curiosity gap
6. **"HOW TO [ACHIEVE GOAL]"** — instructional
7. **"DO THIS IF YOU'RE [CONDITION]"** — conditional targeting
8. **Key word highlighting:** One or two words in red/accent color (e.g., "THE PERFECT **ARM** WORKOUT", "Build Your Perfect **Bulking Routine**")

## Prompt Engineering Notes

When generating mascot illustrations via Nano Banana (GEMINI_GENERATE_IMAGE), always include:

### Base Prompt Prefix (use for every generation)
```
A cartoon illustration of a character with a square bracket-frame head (like a camera viewfinder/scan frame with corner brackets), googly eyes, an S-curve nose, and a red bracket accent on the bottom-right of the face. The character has a solid black body wearing olive-green shorts and gray-brown chunky sneakers. Clean cartoon comic style with thick outlines and flat colors on a warm beige/tan background. No text in the image.
```

### Scene Suffix (append based on the slide content)
Examples:
- "The character is squatting with a barbell across their shoulders with proper form"
- "Two versions of the character side by side — left one with a green checkmark doing an exercise correctly, right one with a red X doing it wrong"
- "The character is lying in a bed with a large alarm clock next to them, sleeping peacefully"
- "The character is flexing in front of a mirror, with a thought bubble showing a very muscular version of themselves"
