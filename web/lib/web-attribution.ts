import {
  getPosthogDistinctId,
  getWebAnalyticsContext,
  type WebAnalyticsContext,
} from "./analytics.ts";
import {
  documentAnalyticsConsentDecision,
  type AnalyticsConsentDecision,
} from "./analytics-consent.ts";
import { SITE } from "./site.ts";

export const APPSFLYER_ONELINK_TEMPLATE_URL =
  process.env.NEXT_PUBLIC_APPSFLYER_ONELINK_URL?.trim() ||
    "https://go.gainframe.app/WufP";

const PRESERVED_QUERY_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "twclid",
  "ScCid",
] as const;

const ACQUISITION_STORAGE_KEY = "gf_web_acquisition_v1";

export type WebAttributionPayload = {
  first_page: string;
  download_page: string;
  cta: string;
  original_source: string;
  campaign: string;
  web_click_id: string;
  web_posthog_id?: string;
  web_session_id?: string;
  medium?: string;
  clicked_at: string;
};

type BuildOptions = {
  campaign: string;
  cta: string;
};

type BuildRuntime = {
  consentDecision?: AnalyticsConsentDecision;
  context?: WebAnalyticsContext;
  currentUrl?: string;
  now?: Date;
  oneLinkUrl?: string;
  posthogDistinctId?: string | null;
  randomUUID?: () => string;
  preservedParams?: Record<string, string>;
};

export type WebAttributionLink = {
  href: string;
  payload: WebAttributionPayload | null;
};

function currentConsentDecision(): AnalyticsConsentDecision {
  if (typeof document === "undefined") return "pending";
  return documentAnalyticsConsentDecision(document.documentElement);
}

function clean(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const result = Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 31 && codePoint !== 127;
    })
    .join("")
    .trim()
    .slice(0, maxLength);
  return result || undefined;
}

export function safeAnonymousPosthogId(value: unknown): string | undefined {
  const id = clean(value, 200);
  if (!id || id.includes("@") || /\s/.test(id)) return undefined;
  return /^[A-Za-z0-9._:$-]+$/.test(id) ? id : undefined;
}

function normalizedSource(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100) || "direct";
}

export function deriveOriginalSource(context: WebAnalyticsContext): string {
  if (context.utm_source) return normalizedSource(context.utm_source);

  const searchEngine = clean(context.search_engine, 80);
  if (searchEngine) return `${normalizedSource(searchEngine)}_organic`;

  const domain = normalizedSource(context.referring_domain || "direct");
  if (domain === "direct" || domain === "$direct") return "direct";
  if (domain.includes("google.")) return "google_organic";
  if (domain.includes("bing.")) return "bing_organic";
  if (domain.includes("duckduckgo.")) return "duckduckgo_organic";
  if (domain.includes("tiktok.")) return "tiktok";
  if (domain.includes("reddit.")) return "reddit";
  if (domain.includes("instagram.")) return "instagram";
  if (domain.includes("facebook.")) return "facebook";
  if (domain.includes("youtube.")) return "youtube";
  if (domain.includes("chatgpt.") || domain.includes("openai.")) {
    return "chatgpt";
  }
  return `referral_${domain}`.slice(0, 100);
}

function paramsFromSearch(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  return PRESERVED_QUERY_KEYS.reduce<Record<string, string>>((result, key) => {
    const value = clean(params.get(key), 300);
    if (value) result[key] = value;
    return result;
  }, {});
}

export function rememberAcquisitionParams(search: string): void {
  if (typeof window === "undefined" || currentConsentDecision() !== "granted") {
    return;
  }
  const current = paramsFromSearch(search);
  if (Object.keys(current).length === 0) return;

  try {
    const existingRaw = window.sessionStorage.getItem(ACQUISITION_STORAGE_KEY);
    const existing = existingRaw
      ? JSON.parse(existingRaw) as Record<string, string>
      : {};
    window.sessionStorage.setItem(
      ACQUISITION_STORAGE_KEY,
      JSON.stringify({ ...current, ...existing }),
    );
  } catch {
    // Attribution improves when storage works, but a blocked store must never
    // interfere with the download itself.
  }
}

function preservedAcquisitionParams(currentUrl: string): Record<string, string> {
  let stored: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(ACQUISITION_STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as Record<string, string>;
    } catch {
      // Ignore malformed or unavailable session storage.
    }
  }

  try {
    return { ...stored, ...paramsFromSearch(new URL(currentUrl).search) };
  } catch {
    return stored;
  }
}

function browserUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Build an AppsFlyer OneLink only after optional analytics consent is granted.
 * Before resolution or after a decline, return the ordinary App Store URL and
 * do not read analytics context, persist ad click IDs, or create a click ID.
 */
export function buildWebAttributionLink(
  options: BuildOptions,
  runtime: BuildRuntime = {},
): WebAttributionLink {
  const consentDecision = runtime.consentDecision ?? currentConsentDecision();
  if (consentDecision !== "granted") {
    return {
      href: SITE.appStoreUrl,
      payload: null,
    };
  }

  const context = runtime.context ?? getWebAnalyticsContext();
  const currentUrl = runtime.currentUrl ??
    (typeof window !== "undefined"
      ? window.location.href
      : "https://gainframe.app/");
  const currentPath = (() => {
    try {
      return new URL(currentUrl).pathname;
    } catch {
      return context.current_path;
    }
  })();
  const now = runtime.now ?? new Date();
  const clickId = (runtime.randomUUID ?? browserUUID)();
  const posthogId = safeAnonymousPosthogId(
    runtime.posthogDistinctId === undefined
      ? getPosthogDistinctId()
      : runtime.posthogDistinctId,
  );

  const payload: WebAttributionPayload = {
    first_page: clean(context.landing_path, 500) ?? "/",
    download_page: clean(currentPath || context.current_path, 500) ?? "/",
    cta: clean(options.cta, 120) ?? "link",
    original_source: deriveOriginalSource(context),
    campaign: clean(context.utm_campaign ?? options.campaign, 120) ??
      "owned_web",
    web_click_id: clean(clickId, 120) ?? browserUUID(),
    ...(posthogId ? { web_posthog_id: posthogId } : {}),
    ...(clean(context.session_id, 200)
      ? { web_session_id: clean(context.session_id, 200) }
      : {}),
    ...(clean(context.utm_medium, 120)
      ? { medium: clean(context.utm_medium, 120) }
      : {}),
    clicked_at: now.toISOString(),
  };

  const oneLinkUrl = clean(
    runtime.oneLinkUrl ?? APPSFLYER_ONELINK_TEMPLATE_URL,
    500,
  );
  if (!oneLinkUrl) {
    return {
      href: SITE.appStoreUrl,
      payload: null,
    };
  }

  const url = new URL(oneLinkUrl);
  url.searchParams.set("ct", options.campaign);
  url.searchParams.set("pid", "owned_web");
  url.searchParams.set("c", payload.campaign);
  url.searchParams.set("af_channel", payload.original_source);
  url.searchParams.set("af_ad", payload.cta);
  url.searchParams.set("af_siteid", payload.download_page);
  url.searchParams.set("af_js_web", "true");
  url.searchParams.set("deep_link_value", "web_attribution");
  url.searchParams.set("deep_link_sub1", payload.first_page);
  url.searchParams.set("deep_link_sub2", payload.download_page);
  url.searchParams.set("deep_link_sub3", payload.cta);
  url.searchParams.set("deep_link_sub4", payload.original_source);
  url.searchParams.set("deep_link_sub5", payload.campaign);
  url.searchParams.set("deep_link_sub6", payload.web_click_id);
  if (payload.web_posthog_id) {
    url.searchParams.set("deep_link_sub7", payload.web_posthog_id);
  }
  if (payload.web_session_id) {
    url.searchParams.set("deep_link_sub8", payload.web_session_id);
  }
  if (payload.medium) url.searchParams.set("deep_link_sub9", payload.medium);
  url.searchParams.set("deep_link_sub10", payload.clicked_at);

  const preserved = runtime.preservedParams ??
    preservedAcquisitionParams(currentUrl);
  for (const key of PRESERVED_QUERY_KEYS) {
    const value = clean(preserved[key], 300);
    if (value) url.searchParams.set(key, value);
  }

  return { href: url.toString(), payload };
}

export function isGainFrameDownloadUrl(href: string): boolean {
  try {
    const url = new URL(href, "https://gainframe.app");
    return (
      (url.hostname === "apps.apple.com" &&
        url.pathname.includes("6759252082")) ||
      (url.hostname === "gainframe.onelink.me" &&
        url.pathname.startsWith("/WufP")) ||
      (url.hostname === "go.gainframe.app" && url.pathname.startsWith("/WufP"))
    );
  } catch {
    return false;
  }
}
