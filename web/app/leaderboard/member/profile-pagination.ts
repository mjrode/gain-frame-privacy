export function appendUniqueEntries<T extends { entry_id: string }>(
  current: T[],
  incoming: T[],
): T[] {
  const knownIds = new Set(current.map((entry) => entry.entry_id));
  return [
    ...current,
    ...incoming.filter((entry) => {
      if (knownIds.has(entry.entry_id)) return false;
      knownIds.add(entry.entry_id);
      return true;
    }),
  ];
}
