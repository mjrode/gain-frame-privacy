export function appendUniqueStandings<
  T extends { entry_id: string; profile_id: string },
>(current: T[], incoming: T[]): T[] {
  const knownEntryIds = new Set(current.map((entry) => entry.entry_id));
  const knownProfileIds = new Set(current.map((entry) => entry.profile_id));

  return [
    ...current,
    ...incoming.filter((entry) => {
      if (
        knownEntryIds.has(entry.entry_id) ||
        knownProfileIds.has(entry.profile_id)
      ) return false;
      knownEntryIds.add(entry.entry_id);
      knownProfileIds.add(entry.profile_id);
      return true;
    }),
  ];
}
