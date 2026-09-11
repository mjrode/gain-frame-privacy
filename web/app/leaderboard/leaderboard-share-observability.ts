import { track } from "@/lib/analytics";
import {
  shareEventProperties,
  type LeaderboardShareContext,
  type LeaderboardSharePlacement,
  type LeaderboardShareTemplate,
} from "./leaderboard-share";

export function trackLeaderboardSharePreview(input: {
  context: LeaderboardShareContext;
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
}): void {
  if (typeof window === "undefined") return;
  track("leaderboard_share_previewed", {
    ...shareEventProperties(input),
  });
}

export function trackLeaderboardShareTemplate(input: {
  context: LeaderboardShareContext;
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
}): void {
  if (typeof window === "undefined") return;
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

  const properties = shareEventProperties(input);
  track("leaderboard_share_clicked", { ...properties });
}
