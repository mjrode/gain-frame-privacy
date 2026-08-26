import assert from "node:assert/strict";
import test from "node:test";

import {
  BODY_VISUALIZER_RENDERS,
  bodyVisualizerRender,
} from "./body-visualizer.ts";

test("uses every canonical male render as BMI rises", () => {
  const seen = new Set();
  for (let bmi = 14; bmi <= 35; bmi += 0.1) {
    seen.add(bodyVisualizerRender(bmi, "male").bodyFat);
  }

  assert.deepEqual([...seen], [...BODY_VISUALIZER_RENDERS.male]);
});

test("uses every canonical female render as BMI rises", () => {
  const seen = new Set();
  for (let bmi = 14; bmi <= 40; bmi += 0.1) {
    seen.add(bodyVisualizerRender(bmi, "female").bodyFat);
  }

  assert.deepEqual([...seen], [...BODY_VISUALIZER_RENDERS.female]);
});

test("clamps measurements outside the display range to the end renders", () => {
  assert.deepEqual(bodyVisualizerRender(10, "male"), {
    bodyFat: 8,
    count: 16,
    index: 0,
  });
  assert.deepEqual(bodyVisualizerRender(50, "female"), {
    bodyFat: 40,
    count: 14,
    index: 13,
  });
});
