import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID,
  BODY_VISUALIZER_BRIDGE_PHASE,
  BODY_VISUALIZER_BRIDGE_MAIN_CTA,
  BODY_VISUALIZER_BRIDGE_RESULT_CTA,
  bodyVisualizerBridgeExperiment,
  getBodyVisualizerBridgeRollout,
} from "./body-visualizer-bridge-rollout.ts";
import {
  BODY_VISUALIZER_CTA_EXPERIMENT_ID,
  BODY_VISUALIZER_CTA_PHASE,
  BODY_VISUALIZER_CTA_VARIANTS,
  bodyVisualizerCtaPlacement,
  getBodyVisualizerCtaAssignment,
} from "./body-visualizer-cta-experiment.ts";
import { assignedCtaProperties } from "./assigned-cta-experiment.ts";

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

test("both production hosts use analysis with the walkthrough despite old preview queries", () => {
  for (const host of ["gainframe.app", "www.gainframe.app"]) {
    for (const search of [
      "",
      "?bv_bridge=current",
      "?bv_bridge=current&bv_cta=analysis",
      ...BODY_VISUALIZER_CTA_VARIANTS.map((variant) => `?bv_cta=${variant}`),
      "?bv_bridge=unknown&bv_cta=unknown",
    ]) {
      assert.deepEqual(getBodyVisualizerBridgeRollout(host, search), {
        enabled: true, local: false, variant: "analysis",
      }, `${host}${search}`);
    }
  }
});

test("local preview defaults to analysis with the walkthrough and supersedes stale selections", () => {
  for (const host of LOCAL_HOSTS) {
    for (const search of [
      "",
      "?bv_bridge=future&bv_cta=analysis",
      "?bv_bridge=proposed&bv_cta=direct",
      ...BODY_VISUALIZER_CTA_VARIANTS.map((variant) => `?bv_cta=${variant}`),
    ]) {
      assert.deepEqual(getBodyVisualizerBridgeRollout(host, search), {
        enabled: true, local: true, variant: "analysis",
      }, `${host}${search}`);
    }
  }
});

test("local current-page review disables the bridge and retains all historical QA variants", () => {
  for (const host of LOCAL_HOSTS) {
    for (const variant of BODY_VISUALIZER_CTA_VARIANTS) {
      assert.deepEqual(
        getBodyVisualizerBridgeRollout(host, `?bv_bridge=current&bv_cta=${variant}`),
        { enabled: false, local: true, variant },
        `${host}: ${variant}`,
      );
    }
    for (const search of [
      "?bv_bridge=current",
      "?bv_bridge=current&bv_cta=",
      "?bv_bridge=current&bv_cta=unknown",
    ]) {
      assert.deepEqual(getBodyVisualizerBridgeRollout(host, search), {
        enabled: false, local: true, variant: "analysis",
      }, `${host}${search}`);
    }
  }
});

test("unsupported hosts cannot opt in through a preview or CTA query", () => {
  for (const host of [
    "",
    "preview.gainframe.app",
    "gainframe.app.example.com",
    "www.gainframe.app.example.com",
    "localhost.example.com",
    "127.0.0.1.example.com",
    "0.0.0.0",
    "192.168.1.2",
    "gainframe.app:443",
    "gainframe-preview.vercel.app",
  ]) {
    for (const search of ["", "?bv_bridge=future&bv_cta=future", "?bv_bridge=current&bv_cta=progress"]) {
      assert.deepEqual(getBodyVisualizerBridgeRollout(host, search), {
        enabled: false, local: false, variant: "analysis",
      }, `${host}${search}`);
    }
  }
});

test("rollout resolution does not consume or overwrite saved experiment assignments", (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      get localStorage() { throw Error("must not access historical assignment storage"); },
      get sessionStorage() { throw Error("must not access session assignment storage"); },
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  });

  assert.deepEqual(getBodyVisualizerBridgeRollout("gainframe.app", "?bv_cta=analysis"), {
    enabled: true, local: false, variant: "analysis",
  });
  assert.deepEqual(getBodyVisualizerBridgeRollout("localhost", "?bv_bridge=current"), {
    enabled: false, local: true, variant: "analysis",
  });
});

test("the bridge has fresh main and result attribution without changing the frozen rollout", () => {
  assert.equal(BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID, "body_visualizer_app_bridge");
  assert.equal(BODY_VISUALIZER_BRIDGE_PHASE, "analysis_primary_walkthrough_v2");
  assert.equal(BODY_VISUALIZER_BRIDGE_MAIN_CTA, "body_visualizer_analysis_primary_walkthrough_v2_main");
  assert.equal(BODY_VISUALIZER_BRIDGE_RESULT_CTA, "body_visualizer_analysis_primary_walkthrough_v2_future_result");
  assert.notEqual(BODY_VISUALIZER_BRIDGE_MAIN_CTA, BODY_VISUALIZER_BRIDGE_RESULT_CTA);

  assert.equal(BODY_VISUALIZER_CTA_EXPERIMENT_ID, "body_visualizer_cta_v1");
  assert.equal(BODY_VISUALIZER_CTA_PHASE, "analysis_rollout_v2");
  assert.notEqual(BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID, BODY_VISUALIZER_CTA_EXPERIMENT_ID);
  assert.notEqual(BODY_VISUALIZER_BRIDGE_PHASE, BODY_VISUALIZER_CTA_PHASE);
  assert.deepEqual(getBodyVisualizerCtaAssignment(""), { variant: "analysis", forced: false });

  for (const variant of BODY_VISUALIZER_CTA_VARIANTS) {
    const historicalPlacement = bodyVisualizerCtaPlacement(variant);
    assert.equal(historicalPlacement, `atlas_v6_analysis_rollout_v2_${variant}`);
    assert.notEqual(BODY_VISUALIZER_BRIDGE_MAIN_CTA, historicalPlacement);
    assert.notEqual(BODY_VISUALIZER_BRIDGE_RESULT_CTA, historicalPlacement);
  }
});

test("bridge metadata identifies the restored analysis offer and marks only explicit QA as forced", () => {
  const expected = {
    id: "body_visualizer_app_bridge",
    phase: "analysis_primary_walkthrough_v2",
    variant: "analysis",
    angle: "analysis",
    style: "ink",
    forced: false,
  };
  assert.deepEqual(bodyVisualizerBridgeExperiment(), expected);
  assert.deepEqual(bodyVisualizerBridgeExperiment(true), { ...expected, forced: true });
  assert.deepEqual(bodyVisualizerBridgeExperiment(false), expected);
  assert.deepEqual(assignedCtaProperties(bodyVisualizerBridgeExperiment()), {
    experiment_id: expected.id,
    experiment_phase: expected.phase,
    experiment_variant: "analysis",
    experiment_forced: false,
    cta_angle: "analysis",
    cta_style: "ink",
  });
});

test("the supporting Future You CTA keeps the page treatment while identifying its own angle", () => {
  for (const forced of [false, true]) {
    const main = bodyVisualizerBridgeExperiment(forced);
    const supporting = bodyVisualizerBridgeExperiment(forced, "future");
    assert.deepEqual(supporting, { ...main, angle: "future" });
    assert.deepEqual(assignedCtaProperties(supporting), {
      ...assignedCtaProperties(main),
      cta_angle: "future",
    });
    assert.equal(supporting.variant, "analysis");
  }
});
