// Thin wrapper for typed event tracking, fanned out to GA4 (gtag) and
// PostHog. Both scripts are loaded site-wide in app/layout.tsx; this module
// just provides a safe call site that no-ops on the server and before the
// scripts have finished loading (the PostHog snippet stub queues calls).

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
    dataLayer?: unknown[];
    posthog?: {
      capture?: (eventName: string, params?: Record<string, unknown>) => void;
    };
  }
}

export type AnalyticsEvent =
  // BF estimator tool
  | "bf_tool_view"
  | "bf_tool_photo_uploaded"
  | "bf_tool_estimate_requested"
  | "bf_tool_result_shown"
  | "bf_tool_photo_unusable"
  | "bf_tool_rate_limited"
  | "bf_tool_error"
  | "bf_tool_cta_clicked"
  // Generic
  | "outbound_app_store_click";

export function track(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
  if (typeof window.posthog?.capture === "function") {
    window.posthog.capture(event, params);
  }
}
