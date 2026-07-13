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
  | "bf_tool_visualizer_clicked"
  | "bf_tool_email_opened"
  | "bf_tool_email_submitted"
  | "bf_tool_report_sent"
  | "bf_tool_report_error"
  // Homepage promo film
  | "promo_film_sound_on"
  | "promo_film_watched_75"
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

// In-memory fallback guard for browsers where localStorage is unavailable
// (private mode, storage disabled). Collapses a rapid duplicate burst within a
// single page load even when we can't persist per-day state.
const memoryDedup = new Map<string, number>();
const RAPID_WINDOW_MS = 60_000;

function dayStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/**
 * Fires `event` at most once per user per calendar day. Prevents duplicate /
 * rapid-fire events — e.g. a single App Store tap that the browser reports two
 * or three times — from inflating counts.
 *
 * Dedup state is keyed by the event name plus a caller-supplied `key`
 * (default: the event name) so distinct placements can each fire once per day.
 * State persists in localStorage against the current day; if localStorage is
 * blocked it falls back to an in-memory guard that still collapses the burst.
 *
 * Returns true if the event was sent, false if it was suppressed.
 */
export function trackOncePerDay(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
  key: string = event,
): boolean {
  if (typeof window === "undefined") return false;

  const dedupKey = `gf_dedup:${event}:${key}`;
  const today = dayStamp();

  try {
    const store = window.localStorage;
    if (store.getItem(dedupKey) === today) return false;
    store.setItem(dedupKey, today);
    track(event, params);
    return true;
  } catch {
    const now = Date.now();
    const last = memoryDedup.get(dedupKey) ?? 0;
    if (now - last < RAPID_WINDOW_MS) return false;
    memoryDedup.set(dedupKey, now);
    track(event, params);
    return true;
  }
}
