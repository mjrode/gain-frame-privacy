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
};

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
