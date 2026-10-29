const STORAGE_KEY = "gf_article_assistance_v1";
export const ARTICLE_ASSISTANCE_TTL_MS = 30 * 60 * 1000;

export type ArticleAssistance = {
  article_slug: string;
  journey_intent: "body-fat" | "progress" | "proportions";
  destination_kind: "tool" | "guide";
  destination_path: string;
  placement: "after_answer" | "after_chart";
  rollout: "measurement_v1";
  clicked_at_ms: number;
};

/** Only editorial identifiers and paths; never photo, measurement or query data. */
export function parseArticleAssistance(value: unknown, now = Date.now()): ArticleAssistance | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.article_slug !== "string" ||
    !/^[a-z0-9-]{1,120}$/.test(item.article_slug) ||
    typeof item.journey_intent !== "string" ||
    !["body-fat", "progress", "proportions"].includes(item.journey_intent) ||
    typeof item.destination_kind !== "string" ||
    !["tool", "guide"].includes(item.destination_kind) ||
    typeof item.destination_path !== "string" ||
    !/^\/(tools|blog)\/[a-z0-9-]{1,120}\/$/.test(item.destination_path) ||
    !item.destination_path.startsWith(item.destination_kind === "tool" ? "/tools/" : "/blog/") ||
    typeof item.placement !== "string" ||
    !["after_answer", "after_chart"].includes(item.placement) ||
    item.rollout !== "measurement_v1" ||
    typeof item.clicked_at_ms !== "number" ||
    !Number.isFinite(item.clicked_at_ms) ||
    item.clicked_at_ms > now || now - item.clicked_at_ms >= ARTICLE_ASSISTANCE_TTL_MS
  ) return null;
  return {
    article_slug: item.article_slug,
    journey_intent: item.journey_intent as ArticleAssistance["journey_intent"],
    destination_kind: item.destination_kind as ArticleAssistance["destination_kind"],
    destination_path: item.destination_path,
    placement: item.placement as ArticleAssistance["placement"],
    rollout: "measurement_v1",
    clicked_at_ms: item.clicked_at_ms,
  };
}

export function rememberArticleAssistance(value: ArticleAssistance): void {
  const valid = parseArticleAssistance(value);
  if (!valid || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {
    // Storage is optional; the click event still supports ordered session joins.
  }
}

/** Last explicit editorial next-step click within 30 minutes, not proof of causality. */
export function getArticleAssistanceProperties(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const item = raw ? parseArticleAssistance(JSON.parse(raw)) : null;
    if (!item) return {};
    return {
      assisted_article: item.article_slug,
      assisted_intent: item.journey_intent,
      assisted_destination_kind: item.destination_kind,
      assisted_destination_path: item.destination_path,
      assisted_placement: item.placement,
      assisted_rollout: item.rollout,
      assisted_clicked_at: new Date(item.clicked_at_ms).toISOString(),
    };
  } catch {
    return {};
  }
}
