export type BlogCtaIntent =
  | "body-fat"
  | "comparison"
  | "founder"
  | "general"
  | "progress"
  | "recomposition";

export type BlogCtaConfig = {
  button: string;
  copy: string;
  image: string;
  imageAlt: string;
  label: string;
  proof?: string;
  title: string;
};

export const BLOG_CTA_CONFIG: Record<Exclude<BlogCtaIntent, "founder">, BlogCtaConfig> = {
  "body-fat": {
    label: "Put the article to work",
    title: "See your body-fat trend, not just today’s estimate.",
    copy:
      "One check-in gives you a starting point. Consistent photos show whether the direction is real.",
    button: "Start a free check-in",
    image: "/app-screenshots/1.21/day-checkin-score.webp",
    imageAlt:
      "GainFrame check-in showing a physique score and estimated body-fat result.",
  },
  comparison: {
    label: "Try it on your own photo",
    title: "See what GainFrame shows before choosing a tracker.",
    copy:
      "Run one private check-in for body fat, FFMI, and muscle-group scores. No account is required.",
    button: "Try GainFrame free",
    image: "/app-screenshots/1.21/dashboard.webp",
    imageAlt:
      "GainFrame dashboard showing body-composition and progress insights.",
  },
  general: {
    label: "Your next useful step",
    title: "Turn the photos you already take into a progress signal.",
    copy:
      "GainFrame connects check-in photos with body-composition and training context, so you can see what changed.",
    button: "Start a free check-in",
    image: "/app-screenshots/1.21/home.webp",
    imageAlt: "GainFrame home screen with progress and check-in insights.",
  },
  progress: {
    label: "Make the next photo count",
    title: "Make your next progress photo comparable.",
    copy:
      "Keep pose-matched check-ins together and compare any two dates without digging through your camera roll.",
    button: "Start weekly tracking",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  recomposition: {
    label: "Track the change behind the scale",
    title: "See whether the change is muscle or fat.",
    copy:
      "Pair weekly photos with weight and muscle-group trends to see whether your bulk, cut, or recomp is moving correctly.",
    button: "Track my progress free",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison showing changes between check-ins.",
  },
};

export const BLOG_CTA_OVERRIDES: Record<string, BlogCtaConfig> = {
  "best-ai-body-fat-apps": {
    label: "Our top pick",
    title: "Turn one body-fat estimate into a trend.",
    copy:
      "Keep your photos, body-fat trend, FFMI, 12 muscle-group scores, and Coach together as your physique changes.",
    button: "Try GainFrame free",
    image: "/app-screenshots/2.33-live-2026-08-05/02.webp",
    imageAlt:
      "GainFrame check-in showing body fat, weight, a physique score, and Coach's verdict.",
    proof: "4.96 ★ on the US App Store · Free to start",
  },
  "best-body-scanning-measurement-apps": {
    label: "What a scanner cannot show",
    title: "See the visible change behind the measurements.",
    copy:
      "Compare your real progress photos with body fat, FFMI, and 12 muscle-group scores attached to every check-in.",
    button: "Compare my progress",
    image: "/app-screenshots/2.33-live-2026-08-05/01.webp",
    imageAlt:
      "GainFrame side-by-side progress comparison with body-fat and weight changes.",
    proof: "4.96 ★ on the US App Store · Free to start",
  },
  "average-bicep-size": {
    label: "Track more than the tape",
    title: "See whether your arms are actually growing.",
    copy:
      "Compare consistent progress photos with muscle-group scores, so a pump or a softer bulk does not masquerade as new muscle.",
    button: "Track my arm progress",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison between two progress check-ins.",
  },
  "average-waist-size-men": {
    label: "Make the number useful",
    title: "See whether your waistline is actually changing.",
    copy:
      "Pair consistent photos with a body-fat trend to separate a real cut or recomp from day-to-day tape noise.",
    button: "Track my waistline",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  "ideal-body-measurements-men": {
    label: "Find the lagging ratio",
    title: "See which muscle group is breaking the balance.",
    copy:
      "GainFrame scores 12 muscle groups from each check-in, so the proportions behind the tape have a visible baseline.",
    button: "Score my proportions",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison showing changes by muscle group.",
  },
  "ai-body-editor-apps-vs-real-analysis": {
    label: "Skip the fake edit",
    title: "Analyze the body you have, not an edited one.",
    copy:
      "Turn a real progress photo into a body-fat estimate, physique score, and muscle-group baseline you can compare later.",
    button: "Analyze my real progress",
    image: "/app-screenshots/2.33-live-2026-08-05/02.webp",
    imageAlt:
      "GainFrame check-in showing body fat, weight, physique score, and coaching feedback.",
  },
  "best-body-transformation-apps": {
    label: "Make the transformation legible",
    title: "Build a timeline you can actually compare.",
    copy:
      "Keep pose-matched check-ins together and compare any two dates without hunting through your camera roll.",
    button: "Start my timeline",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  "body-fat-percentage-chart": {
    label: "Put the chart to work",
    title: "Turn today’s estimate into a body-fat trend.",
    copy:
      "A single range is context. Consistent check-in photos show whether your cut, bulk, or recomp is moving in the right direction.",
    button: "Start my body-fat trend",
    image: "/app-screenshots/1.21/day-checkin-score.webp",
    imageAlt:
      "GainFrame check-in showing a physique score and estimated body-fat result.",
  },
  "body-fat-visible-jawline-men": {
    label: "Track the lean-out",
    title: "See when leaning out becomes visible.",
    copy:
      "Compare the same pose and lighting over time with a body-fat trend, instead of judging one mirror check.",
    button: "Track my cut",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  "average-chest-size": {
    label: "Track visible chest growth",
    title: "See whether your chest is actually growing.",
    copy:
      "Compare consistent check-ins with muscle-group scores, so ribcage, body fat, and a pump do not own the whole tape reading.",
    button: "Track my chest progress",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison between two progress check-ins.",
  },
  "average-thigh-size": {
    label: "Track more than circumference",
    title: "See whether your legs are visibly growing.",
    copy:
      "Pair repeatable photos with muscle-group scores to distinguish real leg development from a pump or changing body fat.",
    button: "Track my leg progress",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison between two progress check-ins.",
  },
  "shoulder-to-waist-ratio": {
    label: "Make the ratio visible",
    title: "See your V-taper change, not just the math.",
    copy:
      "Compare matched photos with body-fat and muscle-group trends to see whether the shoulder-to-waist gap is really improving.",
    button: "Track my V-taper",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison showing physique changes over time.",
  },
  "chest-to-waist-ratio": {
    label: "See what changed the ratio",
    title: "Separate chest growth from waist loss.",
    copy:
      "Matched photos plus body-fat and muscle-group trends show which side of your chest-to-waist ratio is actually moving.",
    button: "Track my ratio",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  "ideal-body-measurements-women": {
    label: "Use your own baseline",
    title: "Track your proportions on your frame.",
    copy:
      "Compare consistent photos with body-fat and muscle-group trends instead of chasing somebody else’s measurement chart.",
    button: "Track my proportions",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison showing changes between check-ins.",
  },
  "best-body-fat-scanner-apps": {
    label: "Keep the useful part",
    title: "Turn a body-fat scan into a trend.",
    copy:
      "GainFrame keeps the estimate beside the photo that produced it, so you can compare the visible change instead of collecting isolated numbers.",
    button: "Start a free check-in",
    image: "/app-screenshots/1.21/day-checkin-score.webp",
    imageAlt:
      "GainFrame check-in showing a physique score and estimated body-fat result.",
  },
  "rate-my-physique": {
    label: "Get a useful baseline",
    title: "Score the physique you can improve.",
    copy:
      "Get a physique score, body-fat estimate, and 12 muscle-group scores, then compare them with your next check-in.",
    button: "Rate my physique",
    image: "/app-screenshots/2.33-live-2026-08-05/02.webp",
    imageAlt:
      "GainFrame check-in showing body fat, weight, physique score, and coaching feedback.",
  },
  "average-forearm-size": {
    label: "Make arm progress visible",
    title: "Track the change the tape can miss.",
    copy:
      "Use repeatable progress photos and muscle-group trends to judge your whole arm against its own baseline.",
    button: "Track my arm progress",
    image: "/app-screenshots/1.21/muscle-compare.webp",
    imageAlt: "GainFrame muscle comparison between two progress check-ins.",
  },
  "best-free-progress-photo-apps": {
    label: "Use the photos you already have",
    title: "Turn your camera roll into a progress timeline.",
    copy:
      "Import existing gym photos, organize them by pose, and compare any two dates without starting over.",
    button: "Start tracking free",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  "average-waist-size-women": {
    label: "Make the number useful",
    title: "See whether your waistline is actually changing.",
    copy:
      "Pair consistent photos with a body-fat trend to separate a real change from bloating, timing, and tape noise.",
    button: "Track my waistline",
    image: "/app-screenshots/1.21/compare.webp",
    imageAlt: "GainFrame side-by-side progress photo comparison.",
  },
  "long-torso-short-legs": {
    label: "Your frame is the baseline",
    title: "Track your physique on your proportions.",
    copy:
      "Matched progress photos help you judge changes on your own torso and limb lengths instead of comparing frames you cannot copy.",
    button: "Start my baseline",
    image: "/app-screenshots/1.21/home.webp",
    imageAlt: "GainFrame home screen with progress and check-in insights.",
  },
  "ai-physique-rating-apps": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Get more than a score",
    title: "Turn your physique rating into a baseline.",
    copy:
      "Keep body fat, FFMI, and 12 muscle-group scores beside the photo, so your next rating shows what actually changed.",
    button: "Score my physique",
  },
  "best-ai-personal-trainer-apps": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Check whether the plan is working",
    title: "Give your AI trainer a visible progress signal.",
    copy:
      "Pair workouts with repeatable photo check-ins, body-fat trends, and muscle-group scores instead of judging the plan by effort alone.",
    button: "Track my results",
  },
  "why-do-i-look-fat-in-pictures": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Make the camera consistent",
    title: "Separate camera distortion from real change.",
    copy:
      "Use matched poses, distance, and lighting so the next photo compares your physique instead of your phone angle.",
    button: "Take a consistent check-in",
  },
  "average-shoulder-width": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track what training can change",
    title: "See whether your shoulders are getting broader.",
    copy:
      "Matched photos and shoulder scores help separate bone structure from the delt and upper-back growth you can build.",
    button: "Track my shoulder progress",
  },
  "what-would-i-look-like-with-less-body-fat": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Preview the direction",
    title: "See what leaning out could reveal.",
    copy:
      "Start with a photo-based body-fat baseline, then track the visible changes as your estimate moves instead of relying on a one-off edit.",
    button: "Start my lean-out",
  },
  "why-do-abs-only-show-when-flexing": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Track relaxed, not just flexed",
    title: "See whether your abs are becoming visible at rest.",
    copy:
      "Compare the same relaxed pose and lighting with your body-fat trend to catch definition that develops gradually.",
    button: "Track my ab definition",
  },
  "best-body-rating-apps": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Try the rating you can track",
    title: "Get a score that becomes more useful next time.",
    copy:
      "GainFrame combines a physique score with body fat and 12 muscle-group scores, then keeps the photo as your baseline.",
    button: "Rate my physique",
  },
  "best-inbody-alternatives": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Try the photo-first alternative",
    title: "Track the visible change between scans.",
    copy:
      "Pair body-fat and FFMI estimates with repeatable photos, so progress is not trapped inside a single machine reading.",
    button: "Start a free check-in",
  },
  "best-body-recomposition-apps": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Make your recomp visible",
    title: "See muscle gain and fat loss in the same timeline.",
    copy:
      "Compare body fat, weight, photos, and muscle-group scores to tell whether a flat scale is hiding real progress.",
    button: "Track my recomp",
  },
  "average-wrist-size": {
    ...BLOG_CTA_CONFIG.general,
    label: "Use your frame as context",
    title: "Track the physique built on your frame.",
    copy:
      "Your wrist is mostly structure. See how your shoulders, arms, and overall proportions change around that fixed baseline.",
    button: "Start my physique baseline",
  },
  "best-body-tracking-apps": {
    ...BLOG_CTA_CONFIG.general,
    label: "Keep every signal together",
    title: "Track the body, not just one number.",
    copy:
      "Pair photos with body fat, FFMI, weight, and muscle-group trends in one timeline that stays easy to compare.",
    button: "Start tracking free",
  },
  "why-do-i-look-smaller-in-photos": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Fix the comparison",
    title: "Make your photos reflect your real progress.",
    copy:
      "Repeat the same pose, distance, and lighting so lens distortion stops deciding whether you look bigger or smaller.",
    button: "Set my photo baseline",
  },
  "body-fat-percentage-quiz": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Check the estimate against a photo",
    title: "Turn your quiz result into a visual baseline.",
    copy:
      "Use a private photo check-in to add a body-fat estimate and preserve what that range actually looks like on you.",
    button: "Check my estimate",
  },
  "dexa-scan-alternative": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Track between expensive scans",
    title: "Keep a weekly signal between DEXA appointments.",
    copy:
      "Use consistent photos and body-fat trends to see direction without paying for a new scan every time curiosity hits.",
    button: "Start weekly tracking",
  },
  "waist-to-height-ratio": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Put the ratio in context",
    title: "See the visible change behind your waist-to-height ratio.",
    copy:
      "Pair waist changes with matched photos and body-fat trends so the ratio reflects a real cut or recomp, not tape noise.",
    button: "Track my waist trend",
  },
  "aesthetic-physique-body-fat-percentage": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track the whole look",
    title: "See body fat and proportions move together.",
    copy:
      "Matched photos plus muscle-group and body-fat trends show whether your physique is getting leaner, broader, and more balanced.",
    button: "Track my aesthetic progress",
  },
  "ai-body-fat-apps-android": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Try it on your own photo",
    title: "Get a body-fat baseline from one check-in.",
    copy:
      "Keep the estimate beside the photo that produced it, then compare against the same pose when your physique changes.",
    button: "Try GainFrame free",
  },
  "best-body-composition-scales": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "See what the scale misses",
    title: "Put every smart-scale reading beside the photo.",
    copy:
      "Weight and composition estimates make more sense when you can compare the visible change from the same dates.",
    button: "Track beyond the scale",
  },
  "best-zozofit-alternatives": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Try a photo-first alternative",
    title: "Track shape changes without a body suit.",
    copy:
      "Use repeatable photos with body-fat, FFMI, and muscle-group trends to build a comparison you can update from anywhere.",
    button: "Try GainFrame free",
  },
  "ai-body-fat-photo-accuracy-study": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Use the estimate correctly",
    title: "Treat body-fat AI as a trend, not a verdict.",
    copy:
      "Take repeatable photos under the same conditions, then follow the direction across check-ins instead of obsessing over one result.",
    button: "Start my body-fat trend",
  },
  "best-ai-fitness-apps-track-body": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Connect coaching to outcomes",
    title: "See whether the workouts are changing your body.",
    copy:
      "Pair your training with photo check-ins, body-fat trends, and muscle-group scores so the plan has a visible result.",
    button: "Track my results",
  },
  "face-fat-and-body-fat": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Track the lean-out",
    title: "See when facial changes match your body-fat trend.",
    copy:
      "Compare consistent front photos over time instead of letting one close-up, lens, or salty day decide what changed.",
    button: "Track my cut",
  },
  "natty-limit": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track your own ceiling",
    title: "See how much of your natural potential you are building.",
    copy:
      "Follow FFMI, physique photos, and muscle-group scores against your own baseline instead of chasing somebody else’s limit.",
    button: "Track my natural progress",
  },
  "average-shoulder-width-women": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track what can change",
    title: "See whether your shoulders are visibly developing.",
    copy:
      "Matched photos and shoulder scores help separate frame width from the delt and upper-back growth training can create.",
    button: "Track my shoulder progress",
  },
  "skeletal-muscle-mass-percentage": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Make the percentage visible",
    title: "Track muscle trends beyond a scale estimate.",
    copy:
      "Pair weight and muscle estimates with repeatable photos and muscle-group scores to see whether the direction makes sense.",
    button: "Track my muscle trend",
  },
  "average-hand-size": {
    ...BLOG_CTA_CONFIG.general,
    label: "Use your frame as context",
    title: "Track the physique built around your frame.",
    copy:
      "Hand size is mostly fixed. Your forearms, shoulders, and overall muscularity are not—and consistent photos make that change visible.",
    button: "Start my physique baseline",
  },
  "best-progress-photo-apps": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Make every photo comparable",
    title: "Build a progress timeline, not another album.",
    copy:
      "Keep pose-matched check-ins together and compare any two dates with body-composition context attached.",
    button: "Start my timeline",
  },
  "why-abs-show-in-some-lighting": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Standardize the lighting",
    title: "Make ab progress survive a lighting change.",
    copy:
      "Repeat the same pose and conditions so definition is measured against a fair baseline instead of the best shadow in the room.",
    button: "Track my ab definition",
  },
  "best-body-composition-apps": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track every layer together",
    title: "Keep body composition tied to the photo.",
    copy:
      "See weight, body fat, FFMI, and muscle-group scores beside each check-in so every estimate has visible context.",
    button: "Start tracking free",
  },
  "skinny-fat-to-muscular": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Measure the recomp",
    title: "See fat loss and muscle gain before the scale does.",
    copy:
      "Compare matched photos with body-fat and muscle-group trends to catch the slow two-way change a recomp creates.",
    button: "Track my recomp",
  },
  "body-fat-from-photo-app": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Try it on your own photo",
    title: "Get a private body-fat baseline in one check-in.",
    copy:
      "Keep the estimate with the original photo, then repeat the same pose later to see whether the direction is real.",
    button: "Check my body fat",
  },
  "best-free-body-fat-apps": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Start with one free check-in",
    title: "Turn a free estimate into a useful baseline.",
    copy:
      "Save the photo beside its body-fat result and compare future check-ins instead of collecting disconnected percentages.",
    button: "Check my body fat free",
  },
  "ffmi-chart": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Put your FFMI on a timeline",
    title: "See whether your FFMI is actually moving.",
    copy:
      "Track FFMI beside body weight, repeatable photos, and muscle-group scores so the chart becomes your baseline, not your destination.",
    button: "Track my FFMI",
  },
  "ray-fitness-app-review": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Track what coaching changes",
    title: "Give your AI trainer a physique scoreboard.",
    copy:
      "Pair the workouts with repeatable photos, body-fat trends, and muscle-group scores to see whether the coaching is working.",
    button: "Track my results",
  },
  "average-bicep-size-women": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track more than the tape",
    title: "See whether your arms are visibly developing.",
    copy:
      "Compare consistent photos with muscle-group scores, so a pump, pose, or softer bulk does not own the whole measurement.",
    button: "Track my arm progress",
  },
  "body-frame-size": {
    ...BLOG_CTA_CONFIG.general,
    label: "Your frame is fixed. Progress is not.",
    title: "Track the physique built on your structure.",
    copy:
      "Use matched photos to judge muscle and body-fat changes on your own frame instead of comparing bones you cannot change.",
    button: "Start my baseline",
  },
  "do-i-look-fat": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Replace the anxious mirror check",
    title: "Use one consistent baseline, not a bad-angle verdict.",
    copy:
      "A repeatable photo check-in makes change easier to judge without letting one mirror, meal, or camera angle define your progress.",
    button: "Start a private check-in",
  },
  "how-long-does-body-recomposition-take": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Make slow progress visible",
    title: "See the recomp before it feels dramatic.",
    copy:
      "Weekly photos with body-fat and muscle-group trends reveal small changes that disappear when you only compare day to day.",
    button: "Track my recomp timeline",
  },
  "jefit-vs-hevy": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Whichever log you choose",
    title: "Track the outcome, not only the workout.",
    copy:
      "Keep your training log where you like it, then use repeatable physique check-ins to see what all those sets produced.",
    button: "Track my physique results",
  },
  "spren-app-review": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Compare a scan with a timeline",
    title: "Keep the photo behind every body-fat result.",
    copy:
      "GainFrame preserves each check-in with body fat, FFMI, and muscle-group scores so you can compare more than isolated scans.",
    button: "Try GainFrame free",
  },
  "visceral-fat-level": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Track the changes you can see",
    title: "Follow body-fat direction without pretending it is a diagnosis.",
    copy:
      "Matched photos and body-fat trends add useful context between clinical checks, while visceral fat still belongs with a qualified measurement.",
    button: "Track my body-fat trend",
  },
  "body-transformation-tracker-apps": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Build the timeline now",
    title: "Make every stage of your transformation comparable.",
    copy:
      "Organize pose-matched photos with body-fat, weight, and muscle-group trends so the before-and-after has the story between.",
    button: "Start my transformation",
  },
  "body-recomposition-before-and-after": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Create your own before-and-after",
    title: "Capture the small changes between month one and twelve.",
    copy:
      "Compare any two check-ins with body-fat and muscle-group trends, so slow recomp progress does not disappear between endpoints.",
    button: "Start my recomp timeline",
  },
  "best-smart-scales-apple-health": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Give the weight a visual timeline",
    title: "See what changed when the scale moved—or did not.",
    copy:
      "Pair weight history with consistent physique photos and body-composition trends to make each weigh-in more useful.",
    button: "Track beyond the scale",
  },
  "why-do-i-have-skinny-arms": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Track the muscle you are building",
    title: "See whether your arms are catching up.",
    copy:
      "Compare repeatable photos with arm and shoulder scores to spot growth that the mirror normalizes week by week.",
    button: "Track my arm progress",
  },
  "am-i-skinny-fat-quiz": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Turn the result into a baseline",
    title: "Track the recomp your quiz points toward.",
    copy:
      "Pair consistent photos with body-fat and muscle-group trends to see whether you are getting leaner and more muscular at once.",
    button: "Start my recomp",
  },
  "best-progress-photo-apps-android": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Make the next photo comparable",
    title: "Turn scattered gym photos into a real timeline.",
    copy:
      "Use the same pose and framing, keep dates together, and compare the visible change instead of scrolling through your camera roll.",
    button: "Start tracking my photos",
  },
  "ozempic-before-and-after-photos-men": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Protect the muscle story",
    title: "Track more than weight loss in your photos.",
    copy:
      "Use repeatable check-ins with body-fat and muscle-group trends to see whether you are preserving shape as the scale falls.",
    button: "Track my transformation",
  },
  "thelo-app-review": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Compare analysis with tracking",
    title: "Turn an AI body scan into a timeline.",
    copy:
      "GainFrame keeps photos, body fat, FFMI, and muscle-group scores together so the next check-in can prove what changed.",
    button: "Try GainFrame free",
  },
  "future-physique-ai-prediction": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Turn the prediction into a target",
    title: "Track whether your future physique is getting closer.",
    copy:
      "Compare current check-ins with body-fat and muscle-group trends so the generated future becomes a direction you can measure.",
    button: "Track toward my goal",
  },
  "normal-bmi-but-look-fat": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Look beyond BMI",
    title: "Track the body composition BMI cannot show.",
    copy:
      "Pair repeatable photos with body-fat, FFMI, and muscle-group trends to see changes hidden inside the same BMI.",
    button: "Start my baseline",
  },
  "bulk-cut-or-recomp": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Check whether the choice is working",
    title: "Give your bulk, cut, or recomp a scoreboard.",
    copy:
      "Track photos, body fat, weight, and muscle-group scores together so you know when to stay the course or change direction.",
    button: "Track my phase",
  },
  "apps-like-umax": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Get more than a one-time rating",
    title: "Turn your physique score into progress tracking.",
    copy:
      "Keep body fat, FFMI, and 12 muscle-group scores beside each photo so your next check-in shows more than a new number.",
    button: "Rate and track my physique",
  },
  "beginner-intermediate-advanced-lifter": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Use progress as the test",
    title: "See whether your physique is advancing with your lifts.",
    copy:
      "Repeatable photos and muscle-group trends add a visible baseline to the training numbers that define your experience level.",
    button: "Track my lifting progress",
  },
  "best-leanlens-alternatives": {
    ...BLOG_CTA_CONFIG.comparison,
    label: "Try the deeper baseline",
    title: "Keep more than a single body-fat result.",
    copy:
      "GainFrame connects the photo with body fat, FFMI, physique score, and 12 muscle-group scores you can compare later.",
    button: "Try GainFrame free",
  },
  "understanding-ai-physique-score": {
    ...BLOG_CTA_CONFIG.recomposition,
    label: "Make the score actionable",
    title: "See which part of your physique moved the number.",
    copy:
      "Track the overall score beside 12 muscle groups, body fat, and the original photo to understand progress between check-ins.",
    button: "Track my physique score",
  },
  "visceral-fat-app": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Track the useful proxy",
    title: "Follow visible body-fat direction between clinical checks.",
    copy:
      "Use matched photos and a body-fat trend for context, while leaving visceral-fat diagnosis to validated medical measurements.",
    button: "Track my body-fat trend",
  },
  "why-do-i-look-leaner-in-the-morning": {
    ...BLOG_CTA_CONFIG.progress,
    label: "Control the time of day",
    title: "Compare your physique under the same conditions.",
    copy:
      "Take check-ins at a repeatable time, pose, and distance so food, water, and lighting stop impersonating progress.",
    button: "Set my photo baseline",
  },
  "body-composition-pictures": {
    ...BLOG_CTA_CONFIG["body-fat"],
    label: "Build your own visual reference",
    title: "See what each body-composition change looks like on you.",
    copy:
      "Keep repeatable photos beside body fat, FFMI, and weight so your own timeline becomes more useful than somebody else’s examples.",
    button: "Start my visual timeline",
  },
};

/**
 * Highest-click blog posts in Google Search Console for 2026-07-28 through
 * 2026-08-24. The initial and expansion cohorts stay separate so each rollout
 * keeps a clean before/after measurement window.
 */
export const BLOG_STICKY_CTA_INITIAL_SLUGS = [
  "best-body-scanning-measurement-apps",
  "best-ai-body-fat-apps",
  "average-bicep-size",
  "average-waist-size-men",
  "ideal-body-measurements-men",
  "ai-body-editor-apps-vs-real-analysis",
  "best-body-transformation-apps",
  "body-fat-percentage-chart",
  "body-fat-visible-jawline-men",
  "average-chest-size",
  "average-thigh-size",
  "shoulder-to-waist-ratio",
  "chest-to-waist-ratio",
  "ideal-body-measurements-women",
  "best-body-fat-scanner-apps",
  "rate-my-physique",
  "average-forearm-size",
  "best-free-progress-photo-apps",
  "average-waist-size-women",
  "long-torso-short-legs",
] as const;

export const BLOG_STICKY_CTA_EXPANSION_SLUGS = [
  "ai-physique-rating-apps",
  "best-ai-personal-trainer-apps",
  "why-do-i-look-fat-in-pictures",
  "average-shoulder-width",
  "what-would-i-look-like-with-less-body-fat",
  "why-do-abs-only-show-when-flexing",
  "best-body-rating-apps",
  "best-inbody-alternatives",
  "best-body-recomposition-apps",
  "average-wrist-size",
  "best-body-tracking-apps",
  "why-do-i-look-smaller-in-photos",
  "body-fat-percentage-quiz",
  "dexa-scan-alternative",
  "waist-to-height-ratio",
  "aesthetic-physique-body-fat-percentage",
  "ai-body-fat-apps-android",
  "best-body-composition-scales",
  "best-zozofit-alternatives",
  "ai-body-fat-photo-accuracy-study",
  "best-ai-fitness-apps-track-body",
  "face-fat-and-body-fat",
  "natty-limit",
  "average-shoulder-width-women",
  "skeletal-muscle-mass-percentage",
  "average-hand-size",
  "best-progress-photo-apps",
  "why-abs-show-in-some-lighting",
  "best-body-composition-apps",
  "skinny-fat-to-muscular",
  "body-fat-from-photo-app",
  "best-free-body-fat-apps",
  "ffmi-chart",
  "ray-fitness-app-review",
  "average-bicep-size-women",
  "body-frame-size",
  "do-i-look-fat",
  "how-long-does-body-recomposition-take",
  "jefit-vs-hevy",
  "spren-app-review",
  "visceral-fat-level",
  "body-transformation-tracker-apps",
  "body-recomposition-before-and-after",
  "best-smart-scales-apple-health",
  "why-do-i-have-skinny-arms",
  "am-i-skinny-fat-quiz",
  "best-progress-photo-apps-android",
  "ozempic-before-and-after-photos-men",
  "thelo-app-review",
  "future-physique-ai-prediction",
  "normal-bmi-but-look-fat",
  "bulk-cut-or-recomp",
  "apps-like-umax",
  "beginner-intermediate-advanced-lifter",
  "best-leanlens-alternatives",
  "understanding-ai-physique-score",
  "visceral-fat-app",
  "why-do-i-look-leaner-in-the-morning",
  "body-composition-pictures",
] as const;

export const BLOG_STICKY_CTA_SLUGS = [
  ...BLOG_STICKY_CTA_INITIAL_SLUGS,
  ...BLOG_STICKY_CTA_EXPANSION_SLUGS,
] as const;

export type BlogStickyCtaRollout = "initial_20" | "expansion_59";

const BLOG_STICKY_CTA_SLUG_SET = new Set<string>(BLOG_STICKY_CTA_SLUGS);
const BLOG_STICKY_CTA_INITIAL_SLUG_SET = new Set<string>(
  BLOG_STICKY_CTA_INITIAL_SLUGS,
);
const BLOG_STICKY_CTA_EXPANSION_SLUG_SET = new Set<string>(
  BLOG_STICKY_CTA_EXPANSION_SLUGS,
);

export function hasBlogStickyCta(slug: string): boolean {
  return BLOG_STICKY_CTA_SLUG_SET.has(slug);
}

export function getBlogStickyCtaRollout(
  slug: string,
): BlogStickyCtaRollout | null {
  if (BLOG_STICKY_CTA_INITIAL_SLUG_SET.has(slug)) return "initial_20";
  if (BLOG_STICKY_CTA_EXPANSION_SLUG_SET.has(slug)) return "expansion_59";
  return null;
}

type BlogIntentInput = {
  category?: string;
  slug: string;
  title?: string;
};

export function getBlogCtaIntent({
  category = "",
  slug,
  title = "",
}: BlogIntentInput): BlogCtaIntent {
  const categoryText = category.toLowerCase();
  const text = `${slug} ${title}`.toLowerCase();

  if (
    /founder|case study|product update|announcement/.test(categoryText) ||
    /mrr|revenue|retention|launching|marketing|seo-traffic|analytics|app-ads|copycats|user-feedback|goalposts|building-features/.test(
      text,
    )
  ) {
    return "founder";
  }

  if (
    /comparison|roundup|app review|fitness apps/.test(categoryText) ||
    /(^|\s)best-|\bvs\b|alternatives|apps-like|review/.test(text)
  ) {
    return "comparison";
  }

  if (
    /body fat|body composition|visceral|bmi|ffmi|dexa|waist|measurements|skinny-fat|skinny fat/.test(
      text,
    )
  ) {
    return "body-fat";
  }

  if (/progress photo|before-and-after|before after|transformation|photo pose/.test(text)) {
    return "progress";
  }

  if (/recomp|muscle|bulk|cut|weight|lean mass|physique/.test(text)) {
    return "recomposition";
  }

  return "general";
}
