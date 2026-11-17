/** A preview never writes to the saved production arm. */
const pageArms = new Map<string, boolean>();

export function pairedCtaAssignment(id: string, preview: string | null, phase = "v1") {
  if (preview === "control" || preview === "treatment") {
    return { treatment: preview === "treatment", forced: true };
  }
  const key = `gainframe:experiment:${id}:${phase}`;
  let arm = pageArms.get(key);
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === "control" || saved === "treatment") arm = saved === "treatment";
  } catch { /* Storage can be disabled. */ }
  if (arm === undefined) arm = Math.random() < 0.5;
  pageArms.set(key, arm);
  try {
    window.localStorage.setItem(key, arm ? "treatment" : "control");
  } catch { /* Keep the page assignment stable. */ }
  return { treatment: arm, forced: false };
}
