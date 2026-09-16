import assert from "node:assert/strict";
import test from "node:test";
import { calculateLeanBodyMass, convertMass } from "./lean-body-mass.ts";

test("fat and fat-free mass partition the supplied body weight", () => {
  const result = calculateLeanBodyMass(180, 20, 2);
  assert.equal(result.fatMass, 36);
  assert.equal(result.fatFreeMass, 144);
  assert.equal(result.fatMass + result.fatFreeMass, 180);
  assert.equal(result.range.lowBodyFat, 18);
  assert.equal(result.range.highBodyFat, 22);
  assert.ok(Math.abs(result.range.lowMass - 140.4) < 1e-10);
  assert.ok(Math.abs(result.range.highMass - 147.6) < 1e-10);
});
test("equivalent kg and lb inputs produce equivalent tissue estimates", () => {
  const lb = calculateLeanBodyMass(180, 20);
  const kg = calculateLeanBodyMass(convertMass(180, "lb", "kg"), 20);
  assert.ok(
    Math.abs(convertMass(kg.fatFreeMass, "kg", "lb") - lb.fatFreeMass) < 1e-10,
  );
  assert.equal(kg.range, null);
});
test("a range is a bounded sensitivity illustration, including zero uncertainty", () => {
  assert.equal(calculateLeanBodyMass(80, 3, 5).range.highMass, 80);
  assert.equal(calculateLeanBodyMass(80, 98, 5).range.lowMass, 0);
  const r = calculateLeanBodyMass(80, 20, 0);
  assert.equal(r.range.lowMass, r.fatFreeMass);
  assert.equal(r.range.highMass, r.fatFreeMass);
});
test("rejects missing, nonfinite, and out-of-domain inputs", () => {
  for (const [weight, bf, range] of [
    [NaN, 20, null],
    [0, 20, null],
    [-5, 20, null],
    [80, NaN, null],
    [80, 0, null],
    [80, 100, null],
    [80, 20, -1],
    [80, 20, Infinity],
    [80, 20, 51],
  ]) {
    assert.throws(() => calculateLeanBodyMass(weight, bf, range), RangeError);
  }
});
test("report example uses fat divided by total mass, and includes bone mineral in fat-free mass", () => {
  const r = calculateLeanBodyMass(232.8, (41.7 / 232.8) * 100);
  assert.ok(Math.abs(r.fatMass - 41.7) < 1e-10);
  assert.ok(Math.abs(r.fatFreeMass - (182.1 + 9)) < 1e-10);
});
