import {
  getPosthogDistinctId,
  isProductionAnalyticsHost,
  getWebAnalyticsContext,
  type WebAnalyticsContext,
} from "./analytics.ts";

export const WEB_TOOL_COMPLETED_DOM_EVENT = "gainframe:web-tool-completed";
const WEB_TOOL_USAGE_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/web-tool-usage";

export const CLIENT_REPORTED_WEB_TOOLS = [
  "body-visualizer",
  "body-fat-visualizer",
  "ab-analyzer",
  "body-fat-estimator",
  "ffmi-calculator",
  "tdee-calculator",
  "macro-calculator",
  "calorie-deficit-calculator",
  "one-rep-max-calculator",
  "strength-standards-calculator",
  "calories-burned-calculator",
  "progress-photo-setup",
  "body-measurements-calculator",
  "progress-photo-compare",
  "recomp-reality-checker",
  "body-shape-compare",
] as const;

export type ClientReportedWebTool =
  (typeof CLIENT_REPORTED_WEB_TOOLS)[number];

export function buildWebToolUsagePayload(input: {
  tool: ClientReportedWebTool;
  usageId: string;
  distinctId: string | null;
  analyticsContext: WebAnalyticsContext;
}): Record<string, unknown> {
  return {
    tool: input.tool,
    usage_id: input.usageId,
    posthog_distinct_id: input.distinctId,
    analytics_context: input.analyticsContext,
  };
}

/** Best-effort reporting only. A Slack/PostHog outage must never interrupt a
 * calculator result, visualizer interaction, or AI analysis. */
export async function reportWebToolCompletion(
  tool: ClientReportedWebTool,
): Promise<void> {
  if (typeof window === "undefined" || !isProductionAnalyticsHost(window.location.hostname)) return;
  try {
    const usageId = crypto.randomUUID();
    await fetch(WEB_TOOL_USAGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(buildWebToolUsagePayload({
        tool,
        usageId,
        distinctId: getPosthogDistinctId(),
        analyticsContext: getWebAnalyticsContext(),
      })),
    });
  } catch {
    // Usage observability is deliberately non-blocking.
  }
}
