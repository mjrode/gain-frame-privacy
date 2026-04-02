# GainFrame Mascot — TikTok Carousel Comic Style Guide

## The Character
- **Head:** GainFrame scan-frame logo (bracket corners in black, with the "S"-curve nose, two googly eyes, and a red bracket accent in the bottom-right)
- **Body:** Solid black/dark charcoal silhouette figure wearing olive/army-green shorts and gray/brown chunky sneakers
- **Build:** Can range from average (template pose) to muscular (gym scenes) depending on the slide context
- **Expression:** Conveyed through the googly eyes and nose position — curious, strained, happy, sleeping, etc.

## Visual Style Constants
- **Background:** Warm beige/tan (#E8D5B7 to #F0E0C8) — flat, no gradients
- **Art style:** Clean cartoon/comic illustration — thick outlines, flat colors, minimal shading
- **Color palette:** Black body, olive-green shorts, gray-brown shoes, red bracket accent. Props use muted realistic tones (silver gym equipment, blue bedding, etc.)
- **Aspect ratio:** 4:5 (1080×1350) for TikTok carousel photos
- **Text IN the image:** Title banners and subtitle text are generated directly in the image via Nano Banana — NOT added later in CapCut/Canva. The AI generates the complete slide (illustration + text) in one shot.

## Slide Layout Patterns

### Cover Slide (Slide 0)
- Bold, all-caps title text (white text on black banner/pill, or large bold text with accent color on key words)
- Text is PART OF the generated image — Nano Banana renders the title directly
- Mascot in a simple pose or action that represents the topic
- May include the mascot interacting with a prop (whiteboard, clipboard, etc.)

### Numbered Content Slides (1-5)
- **Title banner:** Numbered title at top in black pill/banner with white text (e.g., "1. You Won't See Progress Overnight") — rendered in the image by Nano Banana
- **Subtitle:** 2-3 lines of supporting text in bold, dark text below the banner — also rendered in the image
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

### Progress & Tracking (GainFrame Tie-Ins)
- "HOW TO ACTUALLY TRACK YOUR GAINS"
- "STOP GUESSING YOUR BODY FAT"
- "WHY YOUR PROGRESS PHOTOS LIE"
- "THE RIGHT WAY TO MEASURE PROGRESS"
- "5 SIGNS YOU'RE MAKING GAINS (You Don't See Yet)"

### Motivation & Mindset
- "THE TRUTH ABOUT CONSISTENCY"
- "WHY YOU'RE NOT SEEING RESULTS"
- "PATIENCE IS THE REAL GAINS"
- "GYM MOTIVATION NOBODY TELLS YOU"

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

### ⚠️ CRITICAL: Use `generate_image` with `ImagePaths` — NOT Rube/Composio

**DO NOT use `GEMINI_GENERATE_IMAGE` via Rube/Composio for mascot illustrations.** That tool only accepts a text `prompt` parameter — it cannot pass reference images as actual image data to the model. URLs embedded in the prompt text are treated as noise and ignored, causing the model to hallucinate random characters (dragons, human faces, etc.).

**ALWAYS use Antigravity's built-in `generate_image` tool** with `ImagePaths` pointing to the mascot reference files. This passes the images as real multimodal input so the model can actually SEE and replicate the design.

### Required Tool Configuration

```
Tool: generate_image
ImagePaths: [
  "assets/gf-mascot/gf-mascot-template.jpeg",   # ALWAYS include template
  "assets/gf-mascot/mascot-pictures.jpeg"         # Include 1-2 scene refs
]
```

Use absolute paths when calling the tool. Pick 1-2 reference images from the Scene Reference Library that are closest to the scene you're generating.

### Base Prompt Prefix (use for every generation)
```
A cartoon illustration of this exact character from the reference images in a new scene. 
CRITICAL: The head is NOT a solid square — it is four separate corner brackets floating 
in space with the background visible between them. The eyes and S-curve nose float inside 
the bracket frame with NO background fill, NO square, NO box behind them. Copy the head 
design from the reference images exactly — open bracket corners, not a filled square.

Scene: [SCENE DESCRIPTION HERE]
```

### Text Integration in Prompts
For numbered content slides, append:
```
At the top, a black rounded rectangle banner with bold white text reads "[NUMBER]. [TITLE]". 
Below, bold dark text reads "[SUBTITLE]." Clean cartoon style, thick outlines, flat colors, 
warm beige background. 4:5 TikTok format. No watermarks.
```

For cover slides:
```
Large bold text at the top reads "[COVER TITLE]" with the word "[ACCENT WORD]" in red. 
Very prominent and eye-catching. Clean cartoon style, thick outlines, flat colors, 
warm beige background. 4:5 TikTok format. No watermarks.
```

### Scene Suffix Examples
- "The character is squatting with a barbell across their shoulders with proper form"
- "Two versions of the character side by side — left one with a green checkmark doing an exercise correctly, right one with a red X doing it wrong"
- "The character is lying in a bed with a large alarm clock next to them, sleeping peacefully"
- "The character is flexing in front of a mirror, with a thought bubble showing a very muscular version of themselves"
