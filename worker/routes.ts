const PROFILE_PATH_PATTERN = /^\/leaderboard\/u\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/?$/i;

/**
 * Keeps public profile links canonical while serving one static-export shell.
 * The client reads the opaque ID from the visible pathname, so auth IDs never
 * appear in the generated asset URL or HTML.
 */
export function profileShellRequest(request: Request): Request | null {
  const url = new URL(request.url);
  const match = PROFILE_PATH_PATTERN.exec(url.pathname);
  if (!match) return null;
  url.pathname = "/leaderboard/member/";
  url.searchParams.set("id", match[1].toLowerCase());
  return new Request(url, request);
}
