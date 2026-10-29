import assert from "node:assert/strict";
import { test } from "node:test";
import { getBodyFatAppPreview } from "./body-fat-app-preview.ts";

const DISABLED = { enabled: false, demo: false };
const ENABLED = { enabled: true, demo: false };
const DEMO = { enabled: true, demo: true };
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]", "LOCALHOST", "LocalHost"];
const PRODUCTION_HOSTS = ["gainframe.app", "www.gainframe.app", "GAINFRAME.APP", "WWW.GainFrame.App"];

test("production visitors receive the analysis bridge by default without a demo result", () => {
  for (const hostname of PRODUCTION_HOSTS) {
    assert.deepEqual(getBodyFatAppPreview(hostname, ""), ENABLED, hostname);
    assert.deepEqual(getBodyFatAppPreview(hostname, "?utm_source=search"), ENABLED, `${hostname} acquisition query`);
  }
});

test("production queries cannot disable the rollout or fabricate a demo result", () => {
  for (const hostname of PRODUCTION_HOSTS) {
    for (const search of [
      "?bf_bridge=current",
      "?bf_bridge=current&bf_result=demo",
      "?bf_bridge=analysis",
      "?bf_bridge=analysis&bf_result=demo",
      "?bf_result=demo",
      "?bf_bridge=",
      "?bf_bridge=unknown",
      "?bf_bridge=analysis&bf_bridge=current&bf_result=demo",
      "?bf_bridge=current&bf_bridge=analysis&bf_result=demo",
    ]) {
      assert.deepEqual(getBodyFatAppPreview(hostname, search), ENABLED, `${hostname} ${search}`);
    }
  }
});

test("local review still requires an exact local hostname and explicit opt-in", () => {
  for (const hostname of LOCAL_HOSTS) {
    assert.deepEqual(getBodyFatAppPreview(hostname, "?bf_bridge=analysis"), ENABLED, hostname);
    assert.deepEqual(getBodyFatAppPreview(hostname, ""), DISABLED, `${hostname} without opt-in`);
  }
});

test("local baseline and invalid bridge values preserve the existing page", () => {
  for (const search of [
    "?bf_bridge=current",
    "?bf_bridge=current&bf_result=demo",
    "?bf_bridge=",
    "?bf_bridge=future",
    "?bf_bridge=Analysis",
    "?BF_BRIDGE=analysis",
    "?bf_bridge=analysis-extra",
    "?bf_bridge=%20analysis",
    "?bf_bridge=analysis%20",
    "?other=bf_bridge%3Danalysis",
  ]) {
    assert.deepEqual(getBodyFatAppPreview("localhost", search), DISABLED, search);
  }
});

test("the sample result requires both local analysis preview and the demo flag", () => {
  for (const hostname of LOCAL_HOSTS) {
    assert.deepEqual(getBodyFatAppPreview(hostname, "?bf_bridge=analysis&bf_result=demo"), DEMO, hostname);
    assert.deepEqual(getBodyFatAppPreview(hostname, "?bf_result=demo"), DISABLED, `${hostname} bare demo`);
  }
  for (const search of [
    "?bf_bridge=analysis&bf_result=",
    "?bf_bridge=analysis&bf_result=current",
    "?bf_bridge=analysis&bf_result=Demo",
    "?bf_bridge=analysis&BF_RESULT=demo",
  ]) {
    assert.deepEqual(getBodyFatAppPreview("localhost", search), ENABLED, search);
  }
});

test("normal query ordering and unrelated parameters do not interfere with the preview", () => {
  for (const search of [
    "?bf_result=demo&bf_bridge=analysis",
    "?utm_source=local-review&bf_bridge=analysis&bf_result=demo&other=value",
    "?bf_bridge=%61nalysis&bf_result=demo",
  ]) {
    assert.deepEqual(getBodyFatAppPreview("127.0.0.1", search), DEMO, search);
  }
});

test("unsupported domains and lookalike hosts never enable the bridge or demo results", () => {
  for (const hostname of [
    "preview.gainframe.app",
    "gainframe.app.example.com",
    "www.gainframe.app.example.com",
    "wwwgainframe.app",
    "localhost.example.com",
    "sub.localhost",
    "localhost.gainframe.app",
    "127.0.0.1.example.com",
    "127.0.0.2",
    "0.0.0.0",
    "localhost.",
    "localhost:3013",
    "http://localhost",
    " localhost",
    "localhost ",
    "[::1].example.com",
    "",
  ]) {
    for (const search of ["", "?bf_bridge=analysis", "?bf_bridge=analysis&bf_result=demo", "?bf_result=demo"]) {
      assert.deepEqual(getBodyFatAppPreview(hostname, search), DISABLED, `${hostname} ${search}`);
    }
  }
});

test("query parameters cannot impersonate a local host to force a demo on production", () => {
  for (const hostname of PRODUCTION_HOSTS) {
    for (const search of [
      "?bf_bridge=analysis&bf_result=demo&hostname=localhost",
      "?bf_bridge=analysis&bf_result=demo&host=127.0.0.1&preview=true&force=true",
      "?bf_bridge=analysis&bf_result=demo&environment=local&local=true",
      "?bf_bridge=analysis&bf_result=demo&redirect=http%3A%2F%2Flocalhost%3A3013",
      "?bf_bridge=analysis&bf_result=demo&bf_bridge=current",
    ]) {
      assert.deepEqual(getBodyFatAppPreview(hostname, search), ENABLED, `${hostname} ${search}`);
    }
  }
});

test("a previous local demo decision cannot leak into a subsequent production or baseline decision", () => {
  assert.deepEqual(getBodyFatAppPreview("localhost", "?bf_bridge=analysis&bf_result=demo"), DEMO);
  assert.deepEqual(getBodyFatAppPreview("gainframe.app", "?bf_bridge=analysis&bf_result=demo"), ENABLED);
  assert.deepEqual(getBodyFatAppPreview("localhost", "?bf_bridge=current"), DISABLED);
  assert.deepEqual(getBodyFatAppPreview("localhost", "?bf_bridge=analysis"), ENABLED);
});
