import { directAppStoreUrl } from "./web-attribution.ts";

export const WINTER_ARC_DAYS = 90;
export const WINTER_ARC_GOALS = {
  consistency: "Build consistency",
  muscle: "Build muscle",
  fat_loss: "Lose fat",
  recomp: "Body recomposition",
} as const;

export type WinterArcGoal = keyof typeof WINTER_ARC_GOALS;
export type WinterArcCheckIn = {
  day: number;
  date: string;
  label: string;
  review: boolean;
};
export type WinterArcPlan = {
  start: string;
  finish: string;
  goal: WinterArcGoal;
  checkIns: WinterArcCheckIn[];
};

const DAY_MS = 86_400_000;

function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Choose a valid start date.");
  }
  const date = new Date(value + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Choose a valid start date.");
  }
  if (value < "2020-01-01" || value > "2099-12-31") {
    throw new Error("Choose a start date between 2020 and 2099.");
  }
  return date;
}

function addDays(start: Date, days: number): string {
  return new Date(start.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export function formatArcDate(value: string, includeYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}

export function defaultArcStart(now = new Date()): string {
  const year = now.getFullYear();
  const localToday = String(year) + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
  const autumnStart = String(year) + "-10-01";
  return localToday < autumnStart ? autumnStart : localToday;
}

export function createWinterArcPlan(start: string, goal: WinterArcGoal): WinterArcPlan {
  const startDate = parseDate(start);
  if (!Object.hasOwn(WINTER_ARC_GOALS, goal)) throw new Error("Choose a goal for your plan.");
  const offsets = [...Array.from({ length: 13 }, (_, index) => index * 7), 89];
  return {
    start,
    finish: addDays(startDate, 89),
    goal,
    checkIns: offsets.map((offset) => ({
      day: offset + 1,
      date: addDays(startDate, offset),
      label: offset === 0 ? "Take your baseline" :
        offset === 89 ? "Compare your full arc" :
        offset === 28 ? "Your first comparison" :
        offset === 56 ? "Review your direction" : "Weekly photo check-in",
      review: offset === 28 || offset === 56 || offset === 89,
    })),
  };
}

export function winterArcChecklist(plan: WinterArcPlan): string {
  return [
    "MY WINTER ARC",
    formatArcDate(plan.start, true) + " to " + formatArcDate(plan.finish, true),
    "90 days | " + WINTER_ARC_GOALS[plan.goal] + " | 14 photo check-ins",
    "",
    "MY REPEATABLE PHOTO SETUP",
    "[ ] Same location and light",
    "[ ] Same camera height, distance, and angle",
    "[ ] Same poses and similar clothing",
    "[ ] Similar time of day, before a workout",
    "",
    "MY CHECK-IN DATES",
    ...plan.checkIns.map((item) =>
      "[ ] Day " + item.day + " | " + formatArcDate(item.date, true) + " | " + item.label),
    "",
    "Keep your existing training plan. Capture weekly; compare at days 29, 57, and 90.",
    "Missed a check-in? Continue with the next date. No restart required.",
    "",
    "Track your full Winter Arc in GainFrame.",
    "Keep your photos together and compare your progress in the iPhone app.",
    directAppStoreUrl({ campaign: "web-winter-arc-checklist", cta: "winter_arc_checklist" }),
    "",
    "Free planner: https://gainframe.app/tools/winter-arc-planner/",
  ].join("\n");
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

// RFC 5545 folds content lines after at most 75 octets, not 75 characters.
function foldIcs(line: string): string {
  let result = "";
  let size = 0;
  for (const character of line) {
    const bytes = new TextEncoder().encode(character).length;
    if (size + bytes > 75) {
      result += "\r\n ";
      size = 1;
    }
    result += character;
    size += bytes;
  }
  return result;
}

export function winterArcCalendar(plan: WinterArcPlan, generatedAt = new Date()): string {
  const stamp = generatedAt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GainFrame//Winter Arc Planner//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:My Winter Arc",
  ];
  for (const item of plan.checkIns) {
    const description = [
      "Goal: " + WINTER_ARC_GOALS[plan.goal] + ".",
      "Take front, side, and back photos with the same light, camera position, and poses.",
      item.review ? "Compare with your baseline. Note what changed and what is still unclear." :
        "Keep this check-in. Save your bigger comparisons for days 29, 57, and 90.",
      "Track your full Winter Arc in GainFrame: " +
        directAppStoreUrl({ campaign: "web-winter-arc-calendar", cta: "winter_arc_calendar" }),
    ].join("\n");
    lines.push(
      "BEGIN:VEVENT",
      "UID:winter-arc-" + plan.start + "-" + item.day + "@gainframe.app",
      "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + item.date.replace(/-/g, ""),
      "DTEND;VALUE=DATE:" + addDays(new Date(item.date + "T00:00:00Z"), 1).replace(/-/g, ""),
      "SUMMARY:" + escapeIcs("Winter Arc day " + item.day + ": " + item.label),
      "DESCRIPTION:" + escapeIcs(description),
      "URL:https://gainframe.app/tools/winter-arc-planner/",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcs).join("\r\n") + "\r\n";
}
