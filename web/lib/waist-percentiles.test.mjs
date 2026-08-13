import assert from "node:assert/strict";
import test from "node:test";

import { swrBand, swrWomenBand, whrBand, whtrBand } from "./waist-percentiles.ts";

test("swrBand matches the published men's chart boundaries", () => {
  assert.equal(swrBand(1.2), "minimal");
  assert.equal(swrBand(1.299), "minimal");
  assert.equal(swrBand(1.3), "some");
  assert.equal(swrBand(1.449), "some");
  assert.equal(swrBand(1.45), "clear");
  assert.equal(swrBand(1.549), "clear");
  assert.equal(swrBand(1.55), "strong");
  assert.equal(swrBand(1.617), "strong");
  assert.equal(swrBand(1.618), "golden");
  assert.equal(swrBand(1.8), "golden");
});

test("swrWomenBand matches the published women's target zone", () => {
  assert.equal(swrWomenBand(1.2), "below");
  assert.equal(swrWomenBand(1.299), "below");
  assert.equal(swrWomenBand(1.3), "target");
  assert.equal(swrWomenBand(1.449), "target");
  assert.equal(swrWomenBand(1.45), "above");
  assert.equal(swrWomenBand(1.6), "above");
});

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
