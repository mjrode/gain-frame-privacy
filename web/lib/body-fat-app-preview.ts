/** Approved public rollout. Sample results and the old-page switch stay local. */
export function getBodyFatAppPreview(hostname: string, search: string) {
  const host = hostname.toLowerCase();
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  const production = ["gainframe.app", "www.gainframe.app"].includes(host);
  const params = new URLSearchParams(search);
  const localPreview = local && params.get("bf_bridge") === "analysis";
  return { enabled: production || localPreview, demo: localPreview && params.get("bf_result") === "demo" };
}
