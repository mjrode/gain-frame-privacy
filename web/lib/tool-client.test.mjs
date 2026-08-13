import assert from "node:assert/strict";
import test from "node:test";

import {
  RAW_FALLBACK_MAX_BYTES,
  ToolClientError,
  fetchWithTimeout,
  preprocessImageForUpload,
  validatedJson,
} from "./tool-client.ts";
import {
  buildWebToolUsagePayload,
  reportWebToolCompletion,
} from "./web-tool-usage.ts";

test("web tool usage payload contains only completion metadata", () => {
  assert.deepEqual(
    buildWebToolUsagePayload({
      tool: "ffmi-calculator",
      usageId: "11111111-1111-4111-8111-111111111111",
      distinctId: "anonymous-browser",
      analyticsContext: {
        referrer: "$direct",
        referring_domain: "$direct",
        landing_path: "/tools/ffmi-calculator/",
        current_path: "/tools/ffmi-calculator/",
        browser: "Safari",
        os: "iOS",
        device_type: "Mobile",
      },
    }),
    {
      tool: "ffmi-calculator",
      usage_id: "11111111-1111-4111-8111-111111111111",
      posthog_distinct_id: "anonymous-browser",
      analytics_context: {
        referrer: "$direct",
        referring_domain: "$direct",
        landing_path: "/tools/ffmi-calculator/",
        current_path: "/tools/ffmi-calculator/",
        browser: "Safari",
        os: "iOS",
        device_type: "Mobile",
      },
    },
  );
});

test("web tool usage reporting honors optional analytics consent", async (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  t.after(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      delete globalThis.window;
    }
    if (originalFetch) {
      Object.defineProperty(globalThis, "fetch", originalFetch);
    } else {
      delete globalThis.fetch;
    }
  });

  let consent = "pending";
  const fetchCalls = [];
  const consentListeners = new Set();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      document: {
        documentElement: {
          getAttribute: () => consent,
        },
        referrer: "",
      },
      location: {
        pathname: "/tools/ffmi-calculator/",
        search: "",
      },
      addEventListener: (name, listener) => {
        if (name === "gainframe:analytics-consent-state") {
          consentListeners.add(listener);
        }
      },
      removeEventListener: (_name, listener) => {
        consentListeners.delete(listener);
      },
    },
  });
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (...args) => {
      fetchCalls.push(args);
      return { ok: true };
    },
  });

  const pendingReport = reportWebToolCompletion("ffmi-calculator");
  assert.equal(fetchCalls.length, 0);

  consent = "granted";
  for (const listener of consentListeners) listener(new Event("consent"));
  await pendingReport;
  assert.equal(fetchCalls.length, 1);

  consent = "denied";
  await reportWebToolCompletion("ffmi-calculator");
  assert.equal(fetchCalls.length, 1);
});

test("fetchWithTimeout classifies a timed-out request", async () => {
  const neverCompletes = (_input, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener(
        "abort",
        () => reject(init.signal.reason ?? new Error("aborted")),
        { once: true },
      );
    });

  await assert.rejects(
    fetchWithTimeout("https://example.test", {}, 5, neverCompletes),
    (error) =>
      error instanceof ToolClientError &&
      error.errorType === "timeout" &&
      error.code === "request_timeout",
  );
});

test("fetchWithTimeout distinguishes network failures", async () => {
  const networkFailure = async () => {
    throw new TypeError("Failed to fetch");
  };

  await assert.rejects(
    fetchWithTimeout("https://example.test", {}, 100, networkFailure),
    (error) =>
      error instanceof ToolClientError &&
      error.errorType === "network" &&
      error.code === "network_error",
  );
});

test("validatedJson rejects a malformed successful response", async () => {
  const response = new Response(JSON.stringify({ wrong: true }), { status: 200 });
  await assert.rejects(
    validatedJson(
      response,
      (value) => typeof value === "object" && value !== null && "ok" in value,
    ),
    (error) =>
      error instanceof ToolClientError && error.code === "invalid_response_shape",
  );
});

function installDecodeFailureBrowser() {
  const revoked = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      async createImageBitmap() {
        throw new Error("bitmap decode failed");
      },
    },
  });
  Object.defineProperty(globalThis, "URL", {
    configurable: true,
    value: {
      createObjectURL() {
        return "blob:test";
      },
      revokeObjectURL(value) {
        revoked.push(value);
      },
    },
  });
  Object.defineProperty(globalThis, "Image", {
    configurable: true,
    value: class {
      set src(_value) {
        queueMicrotask(() => this.onerror?.(new Error("decode failed")));
      }
    },
  });
  Object.defineProperty(globalThis, "FileReader", {
    configurable: true,
    value: class {
      readAsDataURL(file) {
        file.arrayBuffer().then((buffer) => {
          this.result = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;
          this.onload?.();
        }, (error) => {
          this.error = error;
          this.onerror?.();
        });
      }
    },
  });
  return revoked;
}

test("image preprocessing falls back to original supported bytes and MIME", async () => {
  const revoked = installDecodeFailureBrowser();
  const file = new File([new Uint8Array([1, 2, 3])], "photo.jpg", {
    type: "image/jpeg",
  });

  const result = await preprocessImageForUpload(file, {
    allowedRawMimes: ["image/jpeg"],
  });

  assert.equal(result.method, "raw_fallback");
  assert.equal(result.photoMime, "image/jpeg");
  assert.equal(result.base64, "AQID");
  assert.deepEqual(revoked, ["blob:test"]);
});

test("image preprocessing allows provider-supported HEIC raw fallback", async () => {
  installDecodeFailureBrowser();
  const file = new File([new Uint8Array([1, 2])], "photo.heic", {
    type: "image/heic",
  });

  const result = await preprocessImageForUpload(file, {
    allowedRawMimes: ["image/heic"],
  });

  assert.equal(result.method, "raw_fallback");
  assert.equal(result.photoMime, "image/heic");
});

test("image preprocessing rejects unsupported and oversized fallback files stably", async () => {
  installDecodeFailureBrowser();
  const dng = new File([new Uint8Array([1])], "photo.dng", { type: "image/dng" });
  await assert.rejects(
    preprocessImageForUpload(dng, { allowedRawMimes: ["image/jpeg"] }),
    (error) => error instanceof ToolClientError && error.code === "unsupported_format",
  );

  const largeJpeg = new File(
    [new Uint8Array(RAW_FALLBACK_MAX_BYTES + 1)],
    "large.jpg",
    { type: "image/jpeg" },
  );
  await assert.rejects(
    preprocessImageForUpload(largeJpeg, { allowedRawMimes: ["image/jpeg"] }),
    (error) => error instanceof ToolClientError && error.code === "decode_failed_large",
  );
});
