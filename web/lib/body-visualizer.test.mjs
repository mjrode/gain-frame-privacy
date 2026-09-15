import assert from "node:assert/strict";
import test from "node:test";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  BODY_VISUALIZER_STAGE_ORDER,
  bodyVisualizerRender,
  bodyVisualizerWeightRange,
} from "./body-visualizer.ts";

test("invalid BMI never displays a default body or invalid image URL", () => {
  for (const value of [null, NaN, Infinity, -Infinity, 0, -1]) {
    assert.equal(bodyVisualizerRender(value, "female"), null);
  }
});

test("selection advances at half-band boundaries and flags endpoints honestly", () => {
  for (const sex of ["female", "male"]) {
    assert.equal(bodyVisualizerRender(23.49, sex).stage, 8);
    assert.equal(bodyVisualizerRender(23.5, sex).stage, 9);
    assert.equal(bodyVisualizerRender(16, sex).outsideRange, false);
    assert.equal(bodyVisualizerRender(45, sex).outsideRange, false);
    assert.equal(bodyVisualizerRender(15.99, sex).stage, 1);
    assert.equal(bodyVisualizerRender(15.99, sex).outsideRange, true);
    assert.equal(bodyVisualizerRender(45.01, sex).stage, 30);
    assert.equal(bodyVisualizerRender(45.01, sex).outsideRange, true);
  }
});

test("both sexes use all 30 distinct stages in ascending display order", () => {
  for (const sex of ["female", "male"]) {
    assert.equal(new Set(BODY_VISUALIZER_STAGE_ORDER[sex]).size, 30);
    const seen = new Set();
    let lastStage = 0;
    for (let bmi = 15; bmi < 46; bmi += 0.05) {
      const result = bodyVisualizerRender(bmi, sex);
      assert.ok(result.stage >= lastStage);
      lastStage = result.stage;
      seen.add(result.front);
      assert.equal(
        result.front.replace("-front.webp", "-back.webp"),
        result.back,
      );
    }
    assert.equal(seen.size, 30);
  }
});

test("weight slider bounds stay within supported inputs in metric and US units", () => {
  const metric = bodyVisualizerWeightRange(1.7);
  const imperial = bodyVisualizerWeightRange(1.7, true);
  assert.deepEqual(metric, { min: 47, max: 130 });
  assert.deepEqual(imperial, { min: 102, max: 286 });
  for (const height of [1.2, 1.7, 2.3]) {
    const kg = bodyVisualizerWeightRange(height);
    assert.ok(kg.min >= 35 && kg.max <= 250 && kg.min < kg.max);
    const lb = bodyVisualizerWeightRange(height, true);
    assert.ok(lb.min >= 77 && lb.max <= 551 && lb.min < lb.max);
  }
  assert.equal(bodyVisualizerWeightRange(NaN), null);
  assert.equal(bodyVisualizerWeightRange(0), null);
});

test("every stage ships with two unique, consistently sized, bounded image files", async () => {
  const hashes = new Set();
  for (const sex of ["female", "male"]) {
    for (let bmi = 16; bmi <= 45; bmi++) {
      const render = bodyVisualizerRender(bmi, sex);
      for (const view of ["front", "back"]) {
        const file = new URL(`../public${render[view]}`, import.meta.url);
        const bytes = await readFile(file);
        assert.ok(
          (await stat(file)).size < 180_000,
          `Oversized image: ${file}`,
        );
        const { width, height, format } = await sharp(bytes).metadata();
        assert.deepEqual(
          { width, height, format },
          { width: 768, height: 1024, format: "webp" },
        );
        hashes.add(createHash("sha256").update(bytes).digest("hex"));
      }
    }
  }
  assert.equal(hashes.size, 120, "All 120 views must be distinct assets");
});

test("unit conversion preserves supported endpoints through a round trip", async () => {
  const { measurementsFrom, bodyVisualizerUnitInputs } =
    await import("./body-visualizer-measurements.ts");
  for (const original of [
    { heightM: 1.2, weightKg: 35 },
    { heightM: 2.3, weightKg: 250 },
    { heightM: 1.7, weightKg: 68 },
  ]) {
    const converted = bodyVisualizerUnitInputs(original);
    const imperial = measurementsFrom("us", converted.metric, converted.us);
    assert.ok(imperial, "Converted US input remains valid");
    const returned = bodyVisualizerUnitInputs(imperial);
    const metric = measurementsFrom("metric", returned.metric, returned.us);
    assert.ok(metric, "Metric round trip remains valid");
    assert.ok(Math.abs(metric.heightM - original.heightM) <= 0.0011);
    assert.ok(Math.abs(metric.weightKg - original.weightKg) <= 0.11);
  }
});

test("rounding carries inches into feet instead of producing 12 inches", async () => {
  const { measurementsFrom, bodyVisualizerUnitInputs } =
    await import("./body-visualizer-measurements.ts");
  const converted = bodyVisualizerUnitInputs({ heightM: 1.828, weightKg: 68 });
  assert.equal(converted.us.feet, "6");
  assert.equal(converted.us.inches, "0");
  assert.ok(measurementsFrom("us", converted.metric, converted.us));
});

test("empty, nonfinite and fractional feet inputs cannot produce a result", async () => {
  const { measurementsFrom } =
    await import("./body-visualizer-measurements.ts");
  const metric = { heightCm: "170", weightKg: "68" };
  const us = { feet: "5", inches: "7", pounds: "150" };
  assert.equal(
    measurementsFrom("metric", { ...metric, heightCm: "" }, us),
    null,
  );
  assert.equal(
    measurementsFrom("metric", { ...metric, weightKg: "Infinity" }, us),
    null,
  );
  assert.equal(measurementsFrom("us", metric, { ...us, feet: "5.5" }), null);
});
