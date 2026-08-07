import assert from "node:assert/strict";
import test from "node:test";

import { whrBand, whtrBand } from "./waist-percentiles.ts";

test("whrBand applies the men's cutoffs from the published chart", () => {
  assert.equal(whrBand(0.85, "male"), "favorable");
  assert.equal(whrBand(0.899, "male"), "favorable");
  assert.equal(whrBand(0.9, "male"), "moderate");
  assert.equal(whrBand(0.99, "male"), "moderate");
  assert.equal(whrBand(1.0, "male"), "elevated");
  assert.equal(whrBand(1.2, "male"), "elevated");
});

test("whrBand applies the women's cutoffs from the published chart", () => {
  assert.equal(whrBand(0.7, "female"), "favorable");
  assert.equal(whrBand(0.799, "female"), "favorable");
  assert.equal(whrBand(0.8, "female"), "moderate");
  assert.equal(whrBand(0.849, "female"), "moderate");
  assert.equal(whrBand(0.85, "female"), "elevated");
  assert.equal(whrBand(1.0, "female"), "elevated");
});

test("whtrBand boundaries are unchanged", () => {
  assert.equal(whtrBand(0.39), "low");
  assert.equal(whtrBand(0.4), "healthy");
  assert.equal(whtrBand(0.49), "healthy");
  assert.equal(whtrBand(0.5), "increased");
  assert.equal(whtrBand(0.6), "high");
});
