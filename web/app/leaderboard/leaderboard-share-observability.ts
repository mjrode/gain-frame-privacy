import { track } from "@/lib/analytics";
import {
  ANALYTICS_CONSENT_STATE_EVENT,
  documentAnalyticsConsentDecision,
  documentAnalyticsConsentGranted,
} from "@/lib/analytics-consent";
import {
  shareEventProperties,
  type LeaderboardShareContext,
  type LeaderboardSharePlacement,
  type LeaderboardShareTemplate,
} from "./leaderboard-share";

async function analyticsConsentGranted(): Promise<boolean> {
  const current = documentAnalyticsConsentDecision(
    window.document.documentElement,
  );
  if (current !== "pending") return current === "granted";

  return await new Promise((resolve) => {
    let timeout: ReturnType<typeof setTimeout>;
    const finish = (granted: boolean) => {
      clearTimeout(timeout);
      window.removeEventListener(ANALYTICS_CONSENT_STATE_EVENT, onDecision);
      resolve(granted);
    };
    const onDecision = () => {
      const decision = documentAnalyticsConsentDecision(
        window.document.documentElement,
      );
      if (decision !== "pending") finish(decision === "granted");
    };
    window.addEventListener(ANALYTICS_CONSENT_STATE_EVENT, onDecision);
    timeout = setTimeout(() => finish(false), 10_000);
    onDecision();
  });
}

export function trackLeaderboardSharePreview(input: {
  context: LeaderboardShareContext;
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
}): void {
  if (
    typeof window === "undefined" ||
    !documentAnalyticsConsentGranted(window.document.documentElement)
  ) return;
  track("leaderboard_share_previewed", {
    ...shareEventProperties(input),
  });
}

export function trackLeaderboardShareTemplate(input: {
  context: LeaderboardShareContext;
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
}): void {
  if (
    typeof window === "undefined" ||
    !documentAnalyticsConsentGranted(window.document.documentElement)
  ) return;
  track("leaderboard_share_template_selected", {
    ...shareEventProperties(input),
  });
}

/**
 * Records final share/download intent. This privacy-safe PostHog event is the
 * single input to the central Slack product monitor, so the browser never
 * receives a Slack secret or calls a webhook directly.
 */
export async function reportLeaderboardShareIntent(input: {
  context: LeaderboardShareContext;
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (!(await analyticsConsentGranted())) return;

  const properties = shareEventProperties(input);
  track("leaderboard_share_clicked", { ...properties });
}
