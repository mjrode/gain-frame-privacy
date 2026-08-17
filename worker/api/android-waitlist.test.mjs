import assert from "node:assert/strict";
import test from "node:test";

const { handleAndroidWaitlist } = await import("./android-waitlist.ts");

function postRequest(body) {
  return new Request("https://gainframe.app/api/android-waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("returns 503 when RESEND_API_KEY is missing", async () => {
  const response = await handleAndroidWaitlist(
    postRequest({ email: "a@b.com" }),
    {},
  );
  assert.equal(response.status, 503);
});

test("rejects invalid JSON and invalid emails", async () => {
  const env = { RESEND_API_KEY: "re_test" };
  assert.equal((await handleAndroidWaitlist(postRequest("{"), env)).status, 400);
  assert.equal(
    (await handleAndroidWaitlist(postRequest({ email: "nope" }), env)).status,
    400,
  );
  assert.equal(
    (await handleAndroidWaitlist(postRequest({}), env)).status,
    400,
  );
});

test("sends the link email, adds to audience, and notifies", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response("{}", { status: 200 });
  });

  const response = await handleAndroidWaitlist(
    postRequest({ email: "Person@Example.COM", source: "physique_rater_result" }),
    {
      RESEND_API_KEY: "re_test",
      RESEND_ANDROID_AUDIENCE_ID: "aud-123",
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 3);

  const [link, audience, notify] = calls;
  assert.equal(link.url, "https://api.resend.com/emails");
  assert.equal(link.body.to, "person@example.com");
  assert.match(link.body.text, /apps\.apple\.com/);
  assert.match(link.body.text, /ct=web-rater-android-email/);

  assert.equal(
    audience.url,
    "https://api.resend.com/audiences/aud-123/contacts",
  );
  assert.equal(audience.body.email, "person@example.com");

  assert.equal(notify.url, "https://api.resend.com/emails");
  assert.match(notify.body.subject, /person@example\.com/);
  assert.match(notify.body.text, /physique_rater_result/);
});

test("fails the request when the link email cannot be sent", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response("nope", { status: 500 }),
  );
  const response = await handleAndroidWaitlist(
    postRequest({ email: "a@b.com" }),
    { RESEND_API_KEY: "re_test" },
  );
  assert.equal(response.status, 502);
});

test("still succeeds when no audience is configured", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    calls.push(String(url));
    return new Response("{}", { status: 200 });
  });
  const response = await handleAndroidWaitlist(
    postRequest({ email: "a@b.com" }),
    { RESEND_API_KEY: "re_test" },
  );
  assert.equal(response.status, 200);
  // link email + notification only, no audience call
  assert.equal(calls.length, 2);
  assert.ok(calls.every((u) => u === "https://api.resend.com/emails"));
});
