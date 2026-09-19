import assert from "node:assert/strict";
import test from "node:test";
import { createWinterArcPlan, defaultArcStart, winterArcCalendar, winterArcChecklist } from "./winter-arc.ts";

test("90 inclusive days include the baseline, weekly photos, and final comparison", () => {
  const plan = createWinterArcPlan("2026-10-01", "consistency");
  assert.equal(plan.finish, "2026-12-29");
  assert.equal(plan.checkIns.length, 14);
  assert.equal(new Set(plan.checkIns.map((item) => item.date)).size, 14);
  assert.deepEqual(plan.checkIns.filter((item) => item.review).map((item) => item.day), [29, 57, 90]);
  assert.deepEqual(plan.checkIns.slice(0, 3).map((item) => item.date), ["2026-10-01", "2026-10-08", "2026-10-15"]);
  assert.equal(plan.checkIns.at(-2).date, "2026-12-24");
});

test("date arithmetic survives leap days, year boundaries, and daylight saving", () => {
  assert.equal(createWinterArcPlan("2028-02-01", "muscle").finish, "2028-04-30");
  assert.equal(createWinterArcPlan("2026-12-31", "recomp").finish, "2027-03-30");
  const original = process.env.TZ;
  try {
    for (const zone of ["America/New_York", "Pacific/Honolulu", "Pacific/Auckland"]) {
      process.env.TZ = zone;
      assert.equal(createWinterArcPlan("2026-10-01", "consistency").checkIns[5].date, "2026-11-05");
      assert.equal(createWinterArcPlan("2026-03-01", "consistency").checkIns[2].date, "2026-03-15");
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("invalid or normalized dates and invalid goals are rejected", () => {
  for (const date of ["", "2026-02-29", "2026-04-31", "2026-13-01", "2026-1-01", "2019-12-31", "2100-01-01"]) {
    assert.throws(() => createWinterArcPlan(date, "consistency"));
  }
  assert.throws(() => createWinterArcPlan("2026-10-01", "invalid"));
  assert.throws(() => createWinterArcPlan("2026-10-01", "toString"));
});

test("default date uses October 1 before autumn and the local day afterward", () => {
  assert.equal(defaultArcStart(new Date(2026, 8, 19, 12)), "2026-10-01");
  assert.equal(defaultArcStart(new Date(2026, 9, 15, 12)), "2026-10-15");
  assert.equal(defaultArcStart(new Date(2027, 8, 19, 12)), "2027-10-01");
});

test("calendar exports complete all-day events with exclusive end dates and RFC line folding", () => {
  const plan = createWinterArcPlan("2026-10-01", "recomp");
  const calendar = winterArcCalendar(plan, new Date("2026-09-19T14:05:00Z"));
  const unfolded = calendar.replace(/\r\n /g, "");
  assert.equal(unfolded.split("BEGIN:VEVENT").length - 1, 14);
  assert.equal(unfolded.split("END:VEVENT").length - 1, 14);
  assert.match(unfolded, /DTSTAMP:20260919T140500Z/);
  assert.match(unfolded, /DTSTART;VALUE=DATE:20261229\r\nDTEND;VALUE=DATE:20261230/);
  assert.match(unfolded, /Goal: Body recomposition/);
  assert.match(unfolded, /Track your full Winter Arc in GainFrame/);
  assert.match(unfolded, /apps.apple.com\/us\/app\/gainframe-progress-photos\/id6759252082\?pt=128456047&ct=web-winter-arc-calendar&mt=8/);
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
  for (const line of calendar.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
  const ids = [...unfolded.matchAll(/^UID:(.+)$/gm)].map((match) => match[1]);
  assert.equal(new Set(ids).size, 14);
});

test("downloadable checklist contains every date, the setup, and the app destination", () => {
  const plan = createWinterArcPlan("2026-10-01", "fat_loss");
  const checklist = winterArcChecklist(plan);
  assert.equal(checklist.split("[ ] Day ").length - 1, 14);
  assert.match(checklist, /Day 90 \| Dec 29, 2026/);
  assert.match(checklist, /90 days \| Lose fat/);
  assert.match(checklist, /Track your full Winter Arc in GainFrame/);
});
