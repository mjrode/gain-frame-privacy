import { track } from "./analytics.ts";

const BODY_FAT_VISUALIZER_DEEP_LINK_KEYS = [
  "g",
  "sex",
  "bf",
  "age",
  "view",
] as const;

export type BodyFatVisualizerDeepLinkSource =
  | "query"
  | "hash"
  | "query_and_hash";

function hasBodyFatVisualizerParams(value: string): boolean {
  if (!value) return false;
  try {
    const params = new URLSearchParams(value.replace(/^[?#]/, ""));
    return BODY_FAT_VISUALIZER_DEEP_LINK_KEYS.some((key) => params.has(key));
  } catch {
    return false;
  }
}

/** Identify only intentional visualizer params, never unrelated UTM state. */
export function bodyFatVisualizerDeepLinkSource(
  search: string,
  hash: string,
): BodyFatVisualizerDeepLinkSource | null {
  const query = hasBodyFatVisualizerParams(search);
  const fragment = hasBodyFatVisualizerParams(hash);
  if (query && fragment) return "query_and_hash";
  if (fragment) return "hash";
  if (query) return "query";
  return null;
}

export const TOOL_FUNNEL_STEPS = [
  "viewed",
  "started",
  "result_shown",
  "cta_clicked",
] as const;

export type ToolFunnelStep = (typeof TOOL_FUNNEL_STEPS)[number];

/** Stable identifiers used by the normalized web-tool funnel. */
export const TOOL_FUNNEL_IDS = [
  "body_visualizer",
  "body_fat_calculator",
  "body_fat_visualizer",
  "ab_analyzer",
  "bf_from_photo",
  "ffmi_calculator",
  "tdee_calculator",
  "macro_calculator",
  "calorie_deficit_calculator",
  "one_rep_max_calculator",
  "strength_standards_calculator",
  "calories_burned_calculator",
  "progress_photo_setup",
  "body_measurements",
  "ai_body_transformation",
  "physique_rater",
  "six_pack_timeline",
  "progress_photo_compare",
  "recomp_reality_checker",
  "body_shape_compare",
] as const;

export type ToolFunnelId = (typeof TOOL_FUNNEL_IDS)[number];

/**
 * Calculator slugs predate the normalized analytics vocabulary. Keep their
 * public URLs unchanged while folding them into stable snake_case tool ids.
 */
const TOOL_FUNNEL_ALIASES = {
  "body-visualizer": "body_visualizer",
  "body-fat-visualizer": "body_fat_visualizer",
  "ab-analyzer": "ab_analyzer",
  "body-fat-estimator": "body_fat_calculator",
  "ffmi-calculator": "ffmi_calculator",
  "tdee-calculator": "tdee_calculator",
  "macro-calculator": "macro_calculator",
  "calorie-deficit-calculator": "calorie_deficit_calculator",
  "one-rep-max-calculator": "one_rep_max_calculator",
  "strength-standards-calculator": "strength_standards_calculator",
  "calories-burned-calculator": "calories_burned_calculator",
  "progress-photo-setup": "progress_photo_setup",
  "body-measurements-calculator": "body_measurements",
  "progress-photo-compare": "progress_photo_compare",
  "recomp-reality-checker": "recomp_reality_checker",
  "body-shape-compare": "body_shape_compare",
} as const satisfies Record<string, ToolFunnelId>;

export type ToolFunnelSource =
  | ToolFunnelId
  | keyof typeof TOOL_FUNNEL_ALIASES;

const TOOL_FUNNEL_EVENTS = {
  viewed: "tool_funnel_viewed",
  started: "tool_funnel_started",
  result_shown: "tool_funnel_result_shown",
  cta_clicked: "tool_funnel_cta_clicked",
} as const;

export function normalizeToolFunnelId(
  source: ToolFunnelSource,
): ToolFunnelId {
  return TOOL_FUNNEL_ALIASES[source as keyof typeof TOOL_FUNNEL_ALIASES] ??
    (source as ToolFunnelId);
}

/**
 * Emit a privacy-safe, cross-tool funnel step while preserving each tool's
 * richer legacy events. Callers may attach operational context, but `tool`
 * and `funnel_step` are always controlled here so the funnel cannot fragment.
 */
export function trackToolFunnelStep(
  source: ToolFunnelSource,
  step: ToolFunnelStep,
  properties: Record<string, unknown> = {},
): boolean {
  return track(TOOL_FUNNEL_EVENTS[step], {
    ...properties,
    tool: normalizeToolFunnelId(source),
    funnel_step: step,
  });
}
