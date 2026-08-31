import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatToolCtaReport,
  sendToolCtaDailyReport,
  summarizeToolCtaRows,
} from "./tool-cta-report.ts";

test("CTA report fills missing variants and calculates CTR", () => {
  const summary = summarizeToolCtaRows([
    ["improve", 20, 5],
    ["future", 10, 1],
  ]);
  assert.deepEqual(summary, [
    { variant: "improve", viewers: 20, clickers: 5, ctr: 0.25 },
    { variant: "track", viewers: 0, clickers: 0, ctr: 0 },
    { variant: "future", viewers: 10, clickers: 1, ctr: 0.1 },
  ]);
});

test("CTA Slack message labels the directional leader without declaring a winner", () => {
  const daily = summarizeToolCtaRows([
    ["improve", 20, 5],
    ["track", 20, 3],
    ["future", 20, 2],
  ]);
  const text = formatToolCtaReport({
    generatedAt: new Date("2026-08-25T14:05:00Z"),
    daily,
    weekly: daily,
  });
  assert.match(text, /A · Improve next/);
  assert.match(text, /Directional leader/);
  assert.doesNotMatch(text, /winner/i);
  assert.match(text, /25\.0%/);
});

test("scheduled report queries PostHog and posts one Slack message", async () => {
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).includes("posthog.com")) {
      return new Response(
        JSON.stringify({
          results: [
            ["improve", 30, 6],
            ["track", 30, 5],
            ["future", 30, 4],
          ],
        }),
        { status: 200 },
      );
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  try {
    const result = await sendToolCtaDailyReport(
      {
        POSTHOG_PERSONAL_API_KEY: "phx_test",
        SLACK_REPORT_BOT_TOKEN: "xoxb-test",
        SLACK_REPORT_CHANNEL_ID: "C0BALSSUGJU",
      },
      new Date("2026-08-25T14:05:00Z"),
    );
    assert.deepEqual(result, { sent: true });
    const posthogCalls = calls.filter((call) => call.url.includes("posthog.com"));
    assert.equal(posthogCalls.length, 2);
    for (const call of posthogCalls) {
      assert.match(String(call.init.body), /expanded_result_cards_v2/);
    }
    const slack = calls.find((call) => call.url.includes("slack.com/api"));
    assert.ok(slack);
    assert.match(String(slack.init.body), /Tool result CTA/);
    assert.match(String(slack.init.body), /C0BALSSUGJU/);
  } finally {
    globalThis.fetch = realFetch;
  }
});
