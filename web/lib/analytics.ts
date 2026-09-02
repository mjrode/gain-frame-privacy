// Thin wrapper for typed event tracking, fanned out to GA4 (gtag) and
// PostHog. Events that happen while consent/region resolution is pending stay
// in a bounded in-memory queue. A grant flushes them after both providers are
// ready; a denial discards them without writing analytics state to storage.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    posthog?: {
      capture?: (eventName: string, params?: Record<string, unknown>) => void;
      captureException?: (
        error: unknown,
        additionalProperties?: Record<string, unknown>,
      ) => void;
      get_distinct_id?: () => string;
      get_property?: (propertyName: string) => unknown;
      get_session_id?: () => string;
      opt_in_capturing?: () => void;
      opt_out_capturing?: () => void;
    };
  }
}

export type WebAnalyticsContext = {
  referrer: string;
  referring_domain: string;
  landing_path: string;
  current_path: string;
  browser: string;
  os: string;
  device_type: string;
  search_engine?: string;
  session_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

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
  | "bf_tool_email_submitted"
  | "bf_tool_report_sent"
  | "bf_tool_report_error"
  // Body transformation tool
  | "bt_tool_view"
  | "bt_tool_status_failed"
  | "bt_tool_photo_uploaded"
  | "bt_tool_generate_requested"
  | "bt_tool_result_shown"
  | "bt_tool_unusable"
  | "bt_tool_rate_limited"
  | "bt_tool_email_submitted"
  | "bt_tool_second_run_unlocked"
  | "bt_tool_unlock_error"
  | "bt_tool_download_clicked"
  | "bt_tool_download_completed"
  | "bt_tool_download_error"
  | "bt_tool_cta_clicked"
  | "bt_tool_error"
  // Body fat visualizer (static calc body — instrumented by VisualizerAnalytics)
  | "bfv_tool_view"
  | "bfv_slider_engaged"
  | "bfv_gender_changed"
  | "bfv_view_changed"
  | "bfv_reference_selected"
  | "bfv_deep_link_loaded"
  | "bfv_cta_clicked"
  // BMI body visualizer
  | "body_visualizer_result_shown"
  // Waist percentile widget (embedded in the average-waist-size posts)
  | "waist_tool_calculated"
  // Physique rater tool
  | "physique_rater_requested"
  | "physique_rater_scored"
  | "physique_rater_rate_limited"
  | "physique_rater_cta_click"
  // Shared ToolConversionCard events (components/ToolConversionCard.tsx):
  // impression, click, dismissal, and Android email capture, all carrying {tool,
  // placement, platform} so CTA impression → click is measurable per tool.
  | "tool_cta_viewed"
  | "tool_cta_clicked"
  | "tool_cta_dismissed"
  | "tool_android_email_submitted"
  // Contextual sticky CTA on the fixed top-blog rollout cohorts.
  | "blog_sticky_cta_viewed"
  | "blog_sticky_cta_clicked"
  | "blog_sticky_cta_dismissed"
  // Randomized top-blog sticky-vs-editorial experiment. Exposure requires at
  // least 50% visibility for 800ms; continued reading is the first later
  // article section reached after a material exposure.
  | "blog_cta_experiment_viewed"
  | "blog_cta_experiment_clicked"
  | "blog_cta_experiment_dismissed"
  | "blog_cta_experiment_continued_reading"
  // Ab analyzer tool
  | "ab_tool_requested"
  | "ab_tool_scored"
  | "ab_tool_cta_click"
  // Six-pack timeline tool
  | "six_pack_tool_view"
  | "six_pack_tool_photo_uploaded"
  | "six_pack_tool_timeline_shown"
  | "six_pack_tool_render_shown"
  | "six_pack_tool_render_unavailable"
  | "six_pack_tool_download_clicked"
  | "six_pack_tool_cta_clicked"
  | "six_pack_tool_error"
  // Body measurements & proportion calculator
  | "measurements_tool_view"
  | "measurements_tool_calculated"
  | "measurements_tool_target_changed"
  | "measurements_tool_targets_reset"
  | "measurements_tool_preview_started"
  | "measurements_tool_cta_clicked"
  // Normalized cross-tool funnel. Per-tool events above remain the detailed
  // source of truth; these four events make equivalent steps comparable.
  | "tool_funnel_viewed"
  | "tool_funnel_started"
  | "tool_funnel_result_shown"
  | "tool_funnel_cta_clicked"
  // Homepage promo film
  | "promo_film_sound_on"
  | "promo_film_watched_75"
  // Public leaderboard sharing
  | "leaderboard_share_previewed"
  | "leaderboard_share_template_selected"
  | "leaderboard_share_clicked"
  // Generic
  | "cta_platform_alternative_click"
  | "web_download_clicked"
  | "outbound_app_store_click";

type QueuedAnalyticsEvent = {
  event: AnalyticsEvent;
  params: Record<string, unknown>;
  gaDelivered: boolean;
  posthogDelivered: boolean;
  dedupKey: string;
};

const queuedAnalyticsEvents: QueuedAnalyticsEvent[] = [];
const MAX_QUEUED_ANALYTICS_EVENTS = 100;
const CONSENT_ATTRIBUTE = "data-gainframe-analytics-consent";

function analyticsConsentDecision(): "pending" | "granted" | "denied" {
  const value = window.document?.documentElement?.getAttribute?.(
    CONSENT_ATTRIBUTE,
  );
  if (value === "granted" || value === "denied") return value;
  // Unit tests and non-DOM consumers historically call the wrapper with a
  // minimal window shim. Preserve immediate delivery in that environment.
  return window.document ? "pending" : "granted";
}

function eventDedupKey(
  event: AnalyticsEvent,
  params: Record<string, unknown>,
): string {
  try {
    return `${event}:${JSON.stringify(params)}`;
  } catch {
    return event;
  }
}

function enqueueAnalyticsEvent(entry: QueuedAnalyticsEvent): void {
  const existing = queuedAnalyticsEvents.find(
    (queued) => queued.dedupKey === entry.dedupKey,
  );
  if (existing) {
    existing.gaDelivered ||= entry.gaDelivered;
    existing.posthogDelivered ||= entry.posthogDelivered;
    return;
  }
  if (queuedAnalyticsEvents.length >= MAX_QUEUED_ANALYTICS_EVENTS) {
    queuedAnalyticsEvents.shift();
  }
  queuedAnalyticsEvents.push(entry);
}

function deliverAnalyticsEvent(entry: QueuedAnalyticsEvent): void {
  if (!entry.gaDelivered && typeof window.gtag === "function") {
    try {
      window.gtag("event", entry.event, entry.params);
      entry.gaDelivered = true;
    } catch {
      // PostHog and a later flush still get a chance when GA throws.
    }
  }
  if (
    !entry.posthogDelivered &&
    typeof window.posthog?.capture === "function"
  ) {
    try {
      window.posthog.capture(entry.event, entry.params);
      entry.posthogDelivered = true;
    } catch {
      // Best-effort telemetry only; never fail a user action for analytics.
    }
  }
}

/** Flush pending, consented events without double-sending to a provider. */
export function flushQueuedAnalyticsEvents(): number {
  if (typeof window === "undefined") return 0;
  const consent = analyticsConsentDecision();
  if (consent === "denied") {
    clearQueuedAnalyticsEvents();
    return 0;
  }
  if (consent !== "granted") return 0;

  let completed = 0;
  for (let index = 0; index < queuedAnalyticsEvents.length;) {
    const entry = queuedAnalyticsEvents[index];
    deliverAnalyticsEvent(entry);
    if (entry.gaDelivered && entry.posthogDelivered) {
      queuedAnalyticsEvents.splice(index, 1);
      completed += 1;
    } else {
      index += 1;
    }
  }
  return completed;
}

export function clearQueuedAnalyticsEvents(): void {
  queuedAnalyticsEvents.length = 0;
}

export function track(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
): boolean {
  if (typeof window === "undefined") return false;
  const consent = analyticsConsentDecision();
  if (consent === "denied") {
    clearQueuedAnalyticsEvents();
    return false;
  }

  const entry: QueuedAnalyticsEvent = {
    event,
    params: { ...params },
    gaDelivered: false,
    posthogDelivered: false,
    dedupKey: eventDedupKey(event, params),
  };
  if (consent === "granted") deliverAnalyticsEvent(entry);
  if (!entry.gaDelivered || !entry.posthogDelivered) {
    enqueueAnalyticsEvent(entry);
  }
  return entry.gaDelivered || entry.posthogDelivered;
}

export function captureException(
  error: unknown,
  properties: Record<string, unknown> = {},
): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (typeof window.posthog?.captureException !== "function") return false;
    window.posthog.captureException(error, properties);
    return true;
  } catch {
    return false;
  }
}

export function getPosthogDistinctId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = window.posthog?.get_distinct_id?.();
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

function contextString(value: unknown, maxLength = 300): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 31 && codePoint !== 127;
    })
    .join("")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function safeAttributionUrl(value: unknown): string | undefined {
  const raw = contextString(value, 1_000);
  if (!raw || raw === "$direct") return raw;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    // Referrers can carry search terms, email addresses, or auth tokens. The
    // origin + path preserves useful acquisition context without forwarding
    // query strings or fragments into server events and Slack.
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return undefined;
  }
}

function domainFromUrl(value: string | undefined): string | undefined {
  if (!value || value === "$direct") return value;
  try {
    return new URL(value).hostname.slice(0, 255);
  } catch {
    return undefined;
  }
}

function posthogProperty(name: string): unknown {
  try {
    return window.posthog?.get_property?.(name);
  } catch {
    return undefined;
  }
}

/**
 * Captures the small, privacy-safe slice of browser context that a server-side
 * completion event cannot infer. Values are forwarded with public web-tool
 * requests so ad-blocker-proof Slack alerts still retain acquisition context.
 */
/**
 * User-agent fallback for os/device_type, mirroring PostHog's value names
 * ("iOS", "Android", "Mac OS X", …) so downstream breakdowns stay in one
 * vocabulary regardless of which source supplied the value.
 */
function platformFromUserAgent(): { os: string; device_type: string } {
  const ua = window.navigator?.userAgent ?? "";
  const touchMac =
    /Macintosh/i.test(ua) && (window.navigator?.maxTouchPoints ?? 0) > 1;
  if (/iPhone|iPod/i.test(ua)) return { os: "iOS", device_type: "Mobile" };
  if (/iPad/i.test(ua) || touchMac) return { os: "iOS", device_type: "Tablet" };
  if (/Android/i.test(ua)) {
    return {
      os: "Android",
      device_type: /Mobile/i.test(ua) ? "Mobile" : "Tablet",
    };
  }
  if (/Windows/i.test(ua)) return { os: "Windows", device_type: "Desktop" };
  if (/Macintosh|Mac OS X/i.test(ua)) {
    return { os: "Mac OS X", device_type: "Desktop" };
  }
  if (/CrOS/i.test(ua)) return { os: "Chrome OS", device_type: "Desktop" };
  if (/Linux/i.test(ua)) return { os: "Linux", device_type: "Desktop" };
  return { os: "unknown", device_type: "unknown" };
}

export function getWebAnalyticsContext(): WebAnalyticsContext {
  const initialReferrer = safeAttributionUrl(
    posthogProperty("$initial_referrer"),
  );
  const currentReferrer = safeAttributionUrl(
    posthogProperty("$referrer") ?? window.document?.referrer,
  );
  const referrer = initialReferrer ?? currentReferrer ?? "$direct";
  const referringDomain = contextString(
    posthogProperty("$initial_referring_domain") ??
      posthogProperty("$referring_domain"),
    255,
  ) ?? domainFromUrl(referrer) ?? "$direct";

  const initialPath = contextString(
    posthogProperty("$initial_pathname"),
    500,
  );
  const initialUrl = safeAttributionUrl(
    posthogProperty("$initial_current_url"),
  );
  const landingPath = initialPath ?? (() => {
    try {
      return initialUrl ? new URL(initialUrl).pathname : undefined;
    } catch {
      return undefined;
    }
  })() ?? window.location.pathname;

  const params = new URLSearchParams(window.location.search);
  const utm = (name: string) =>
    contextString(params.get(name) ?? posthogProperty(name), 120);

  let sessionId: string | undefined;
  try {
    sessionId = contextString(window.posthog?.get_session_id?.(), 200);
  } catch {
    // Session context is useful but optional; acquisition should never block a
    // tool request when the analytics SDK is unavailable.
  }

  const uaPlatform = platformFromUserAgent();

  return {
    referrer,
    referring_domain: referringDomain,
    landing_path: landingPath.slice(0, 500),
    current_path: window.location.pathname.slice(0, 500),
    browser: contextString(posthogProperty("$browser"), 120) ?? "unknown",
    // PostHog's $os/$device_type only exist after consent, which left
    // server-side web_tool_completed events with platform "unknown" for
    // pre-consent users — fall back to a user-agent read.
    os: contextString(posthogProperty("$os"), 120) ?? uaPlatform.os,
    device_type: contextString(posthogProperty("$device_type"), 120) ??
      uaPlatform.device_type,
    ...(contextString(posthogProperty("$search_engine"), 120)
      ? { search_engine: contextString(posthogProperty("$search_engine"), 120) }
      : {}),
    ...(sessionId ? { session_id: sessionId } : {}),
    ...(utm("utm_source") ? { utm_source: utm("utm_source") } : {}),
    ...(utm("utm_medium") ? { utm_medium: utm("utm_medium") } : {}),
    ...(utm("utm_campaign") ? { utm_campaign: utm("utm_campaign") } : {}),
    ...(utm("utm_content") ? { utm_content: utm("utm_content") } : {}),
  };
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
  const now = Date.now();
  const last = memoryDedup.get(dedupKey) ?? 0;
  if (now - last < RAPID_WINDOW_MS) return false;

  let store: Storage | null = null;
  try {
    store = window.localStorage;
    if (store.getItem(dedupKey) === today) return false;
  } catch {
    // Persistent storage is optional; the in-memory guard above still works.
  }

  const delivered = track(event, params);
  if (!delivered) return false;

  try {
    store?.setItem(dedupKey, today);
  } catch {
    // Fall through to the in-memory guard when persistent storage rejects.
  }
  memoryDedup.set(dedupKey, now);
  return true;
}
