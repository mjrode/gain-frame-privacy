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
};

/**
 * Highest-click blog posts in Google Search Console for 2026-07-28 through
 * 2026-08-24. Keep this cohort fixed while measuring the sticky CTA rollout;
 * changing membership mid-test would make the before/after read unreliable.
 */
export const BLOG_STICKY_CTA_SLUGS = [
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

const BLOG_STICKY_CTA_SLUG_SET = new Set<string>(BLOG_STICKY_CTA_SLUGS);

export function hasBlogStickyCta(slug: string): boolean {
  return BLOG_STICKY_CTA_SLUG_SET.has(slug);
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
