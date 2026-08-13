"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ANALYTICS_CONSENT_DOCUMENT_ATTRIBUTE,
  ANALYTICS_CONSENT_STATE_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  OPEN_ANALYTICS_PREFERENCES_EVENT,
  type AnalyticsConsent,
  type AnalyticsConsentDecision,
  combinedStoredAnalyticsConsent,
  isProductionAnalyticsHost,
  resolveAnalyticsConsentState,
} from "@/lib/analytics-consent";
import { SITE } from "@/lib/site";
import styles from "./analytics-consent.module.css";

type ClarityFunction = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

type PrivacyRegionResponse = {
  requiresConsent: boolean;
  regionKnown: boolean;
};

const ANALYTICS_CONSENT_COOKIE = "gainframe_analytics_consent";

function googleConsentPayload(consent: AnalyticsConsent) {
  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: consent,
  } as const;
}

function clarityConsentPayload(consent: AnalyticsConsent) {
  return {
    ad_Storage: "denied",
    analytics_Storage: consent,
  } as const;
}

function ensureGtagQueue(): NonNullable<Window["gtag"]> {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
  }
  return window.gtag;
}

function initializeGoogleAnalytics(): void {
  const gtag = ensureGtagQueue();
  if (document.getElementById("ga4-library")) return;

  gtag("consent", "default", googleConsentPayload("granted"));
  gtag("set", "ads_data_redaction", true);

  const script = document.createElement("script");
  script.id = "ga4-library";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(SITE.ga4Id)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", SITE.ga4Id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

function updateGoogleConsent(consent: AnalyticsConsent): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", googleConsentPayload(consent));
}

function ensureClarityQueue(): ClarityFunction {
  if (typeof window.clarity === "function") {
    return window.clarity as ClarityFunction;
  }

  const clarity: ClarityFunction = (...args: unknown[]) => {
    clarity.q = clarity.q || [];
    clarity.q.push(args);
  };
  window.clarity = clarity;
  return clarity;
}

function initializeClarity(): void {
  const clarity = ensureClarityQueue();
  // Consent V2 must be queued before the external tag executes.
  clarity("consentv2", clarityConsentPayload("granted"));

  if (document.getElementById("clarity-library")) return;

  const script = document.createElement("script");
  script.id = "clarity-library";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(SITE.clarityId)}`;
  document.head.appendChild(script);
}

function updateClarityConsent(consent: AnalyticsConsent): void {
  if (typeof window.clarity !== "function") return;
  window.clarity("consentv2", clarityConsentPayload(consent));
}

function readConsentCookie(): string | null {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.split("=", 2)[1] || "") : null;
}

function readSavedChoice(): string | null {
  const cookieChoice = readConsentCookie();
  let localChoice: string | null = null;

  try {
    localChoice = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch {
    // The first-party preference cookie remains available when possible.
  }

  const choice = combinedStoredAnalyticsConsent(cookieChoice, localChoice);
  if (!choice) return null;

  // Reconcile partial writes. Most importantly, a denial in either store
  // replaces an older grant in the other store whenever that store is usable.
  if (localChoice !== choice) {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
    } catch {
      // Best effort only; denial precedence is still enforced in memory.
    }
  }
  if (cookieChoice !== choice) {
    try {
      document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(choice)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    } catch {
      // Best effort only; denial precedence is still enforced in memory.
    }
  }

  return choice;
}

function saveChoice(choice: AnalyticsConsent): boolean {
  let persisted = false;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
    persisted =
      window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === choice;
  } catch {
    // Try a first-party preference cookie below.
  }

  try {
    document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(choice)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    persisted = persisted || readConsentCookie() === choice;
  } catch {
    // If all browser storage is blocked, the choice lasts for this document.
  }

  return persisted;
}

function removeLoadedScript(id: string): void {
  document.getElementById(id)?.remove();
}

function isPrivacyRegionResponse(value: unknown): value is PrivacyRegionResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as PrivacyRegionResponse).requiresConsent === "boolean" &&
      typeof (value as PrivacyRegionResponse).regionKnown === "boolean",
  );
}

export default function AnalyticsConsentManager() {
  const [production, setProduction] = useState(false);
  const [regionResolved, setRegionResolved] = useState(false);
  const [decision, setDecision] =
    useState<AnalyticsConsentDecision>("pending");
  const [showBanner, setShowBanner] = useState(false);
  const preferencesRequested = useRef(false);

  useEffect(() => {
    if (!isProductionAnalyticsHost(window.location.hostname)) return;
    setProduction(true);

    const controller = new AbortController();
    const savedChoice = readSavedChoice();

    void fetch("/api/privacy-region", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Privacy region lookup failed");
        const payload: unknown = await response.json();
        if (!isPrivacyRegionResponse(payload)) {
          throw new Error("Privacy region response was invalid");
        }
        return payload;
      })
      .catch(() => null)
      .then((region) => {
        if (controller.signal.aborted) return;
        const nextState = resolveAnalyticsConsentState(
          savedChoice,
          region?.requiresConsent ?? false,
        );
        setDecision(nextState.decision);
        setRegionResolved(true);
        setShowBanner(
          preferencesRequested.current ||
            Boolean(region?.regionKnown && region.requiresConsent),
        );
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const publishedDecision = production && regionResolved
      ? decision
      : "pending";
    document.documentElement.setAttribute(
      ANALYTICS_CONSENT_DOCUMENT_ATTRIBUTE,
      publishedDecision,
    );
    window.dispatchEvent(new CustomEvent(
      ANALYTICS_CONSENT_STATE_EVENT,
      { detail: publishedDecision },
    ));

    return () => {
      document.documentElement.setAttribute(
        ANALYTICS_CONSENT_DOCUMENT_ATTRIBUTE,
        "pending",
      );
      window.dispatchEvent(new CustomEvent(
        ANALYTICS_CONSENT_STATE_EVENT,
        { detail: "pending" },
      ));
    };
  }, [decision, production, regionResolved]);

  useEffect(() => {
    const openPreferences = () => {
      preferencesRequested.current = true;
      setShowBanner(true);
    };
    window.addEventListener(
      OPEN_ANALYTICS_PREFERENCES_EVENT,
      openPreferences,
    );
    return () =>
      window.removeEventListener(
        OPEN_ANALYTICS_PREFERENCES_EVENT,
        openPreferences,
      );
  }, []);

  useEffect(() => {
    if (!production || !regionResolved) return;
    // In consent-required regions, do not load analytics until the visitor
    // opts in. Unknown locations track by policy. A saved decline always wins.
    if (decision !== "granted") return;

    initializeGoogleAnalytics();
    initializeClarity();
  }, [decision, production, regionResolved]);

  const choose = useCallback(
    (choice: AnalyticsConsent) => {
      const wasGranted = decision === "granted";
      const choicePersisted = saveChoice(choice);
      preferencesRequested.current = false;
      setDecision(choice);
      setShowBanner(false);
      updateGoogleConsent(choice);
      updateClarityConsent(choice);

      if (choice === "denied" && wasGranted) {
        try {
          window.posthog?.opt_out_capturing?.();
        } catch {
          // A persisted choice allows a hard reload to remove the SDK below.
        }
        if (choicePersisted) {
          window.setTimeout(() => window.location.reload(), 0);
        } else {
          // If preference storage is blocked, the choice can only last for
          // this document. Remove the loaders immediately and keep the denied
          // state in memory instead of reloading back into implied consent.
          removeLoadedScript("ga4-library");
          removeLoadedScript("clarity-library");
          removeLoadedScript("posthog-init");
          for (const script of document.querySelectorAll<HTMLScriptElement>(
            'script[src*="googletagmanager.com/gtag/js"], script[src*="clarity.ms/tag/"], script[src*="posthog.com/static/array.js"]',
          )) {
            script.remove();
          }
        }
      }
    },
    [decision],
  );

  const postHogEnabled =
    production && regionResolved && decision === "granted";

  return (
    <>
      {postHogEnabled && (
        <Script id="posthog-init" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_distinct_id get_property getSessionProperty getSurveysLoaded onSurveysLoaded alias reset get_session_id get_session_replay_url createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${SITE.posthogKey}', {api_host: '${SITE.posthogHost}', defaults: '2025-05-24'});
            posthog.opt_in_capturing();
          `}
        </Script>
      )}

      {production && regionResolved && showBanner && (
        <aside
          className={styles.banner}
          role="region"
          aria-labelledby="analytics-consent-title"
          aria-describedby="analytics-consent-description"
        >
          <div className={styles.copy}>
            <strong id="analytics-consent-title">Analytics choices</strong>
            <p id="analytics-consent-description">
              GainFrame uses optional analytics cookies to understand which
              content helps people find the app. Microsoft Clarity provides
              heatmaps and session replay across the website, with form fields
              masked. Decline turns optional analytics off; accept allows
              measurement.{" "}
              <a href="/privacy/">Privacy details</a>
            </p>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.decline}
              type="button"
              onClick={() => choose("denied")}
            >
              Decline
            </button>
            <button
              className={styles.accept}
              type="button"
              onClick={() => choose("granted")}
            >
              Accept analytics
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
