"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  flushAnalyticsAfterInlineScript,
  flushQueuedAnalyticsEvents,
  isProductionAnalyticsHost,
} from "@/lib/analytics";
import { SITE } from "@/lib/site";

type ClarityFunction = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

function googleConsentPayload() {
  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  } as const;
}

function clarityConsentPayload() {
  return {
    ad_Storage: "denied",
    analytics_Storage: "granted",
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

  gtag("consent", "default", googleConsentPayload());
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
  clarity("consentv2", clarityConsentPayload());

  if (document.getElementById("clarity-library")) return;

  const script = document.createElement("script");
  script.id = "clarity-library";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(SITE.clarityId)}`;
  document.head.appendChild(script);
}

/** Start production analytics on page load; early events queue until SDKs load. */
export default function AnalyticsProvider() {
  const [production, setProduction] = useState(false);

  useEffect(() => {
    if (!isProductionAnalyticsHost(window.location.hostname)) return;
    initializeGoogleAnalytics();
    initializeClarity();
    flushQueuedAnalyticsEvents();
    setProduction(true);
  }, []);

  if (!production) return null;
  return (
    <Script
      id="posthog-init"
      strategy="afterInteractive"
      onReady={flushAnalyticsAfterInlineScript}
    >
      {`
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_distinct_id get_property getSessionProperty getSurveysLoaded onSurveysLoaded alias reset get_session_id get_session_replay_url createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${SITE.posthogKey}', {api_host: '${SITE.posthogHost}', defaults: '2025-05-24'});
        posthog.opt_in_capturing();
      `}
    </Script>
  );
}
