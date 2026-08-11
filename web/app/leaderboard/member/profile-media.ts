export function profilePageSearch(
  profileId: string,
  cursor?: string | null,
): string {
  const params = new URLSearchParams({ id: profileId, limit: "50" });
  if (cursor) params.set("cursor", cursor);
  return params.toString();
}

export function profileMediaRefreshSearch(
  profileId: string,
  mediaId: string,
): string {
  return new URLSearchParams({ id: profileId, media_id: mediaId }).toString();
}

/** An image element gets one automatic signed-URL refresh per deliberate view. */
export function nextMediaRetryAttempt(currentAttempts: number): number | null {
  return currentAttempts < 1 ? currentAttempts + 1 : null;
}
