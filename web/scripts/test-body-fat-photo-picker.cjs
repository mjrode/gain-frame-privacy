// Browser regression. Start the local web app, then run this file with Playwright
// available on NODE_PATH. Set ESTIMATOR_URL to test a local release preview.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const url = new URL(process.env.ESTIMATOR_URL || "http://localhost:3000/tools/body-fat-from-photo/");
assert(["localhost", "127.0.0.1"].includes(url.hostname), "Use a local estimator preview");

async function testPicker() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36",
      viewport: { width: 393, height: 852 },
    });
    const submitted = [];
    await page.route("**/functions/v1/bf-estimate", async route => {
      submitted.push(route.request().postDataJSON().photo_base64);
      await route.fulfill({
        json: { estimate: "20", confidence: "medium", one_line: "Example", model_used: "fixture" },
      });
    });

    // Undecodable HEIC exercises both original-byte read paths. Only fixture
    // files have simulated provider access, and each file can be revoked separately.
    await page.addInitScript(() => {
      const read = FileReader.prototype.readAsDataURL;
      const controls = new Map();
      FileReader.prototype.readAsDataURL = function (file) {
        const control = controls.get(file);
        if (!control) return read.call(this, file);
        if (!control.accessible) {
          queueMicrotask(() => this.onerror?.(new Event("error")));
          return;
        }
        if (control.held) control.releaseRead = () => read.call(this, file);
        else read.call(this, file);
      };
      window.pickFixture = (value, options = {}) => {
        const file = new File([value], "fixture.heic", { type: "image/heic" });
        const control = { accessible: true, ...options };
        controls.set(file, control);
        const getBytes = file.arrayBuffer.bind(file);
        file.arrayBuffer = () => control.accessible
          ? getBytes()
          : Promise.reject(new DOMException("Picker permission expired", "NotReadableError"));
        const transfer = new DataTransfer();
        transfer.items.add(file);
        const input = document.querySelector("input[type=file]");
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return control;
      };
    });
    async function openForm() {
      await page.goto(url.href);
      await page.getByRole("button", { name: "Skip", exact: true }).click();
    }
    const submit = page.getByRole("button", { name: "Get my estimate" });
    const chooseAgain = page.getByRole("button", { name: "Choose photo again" });

    await openForm();
    await page.evaluate(() => { window.first = window.pickFixture("first"); });
    await submit.waitFor();
    await page.evaluate(() => { window.first.accessible = false; });
    await submit.click();
    await page.locator("#body-fat-result").waitFor();
    assert.deepEqual(submitted, [Buffer.from("first").toString("base64")]);

    await openForm();
    await page.evaluate(() => { window.pickFixture("unavailable", { accessible: false }); });
    await chooseAgain.waitFor();
    await page.evaluate(() => {
      document.querySelector("input[type=file]").dispatchEvent(new Event("cancel", { bubbles: true }));
    });
    assert.equal(await chooseAgain.isVisible(), true);
    assert.equal(submitted.length, 1);

    await page.evaluate(() => { window.old = window.pickFixture("old", { held: true }); });
    await page.waitForFunction(() => typeof window.old.releaseRead === "function");
    assert.equal(await page.getByRole("button", { name: "Preparing your photo" }).isDisabled(), true);
    await page.evaluate(() => { window.pickFixture("replacement"); });
    await submit.waitFor();
    await page.evaluate(async () => {
      window.old.releaseRead();
      // FileReader's load event and the subsequent React update are asynchronous.
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    await submit.click();
    await page.locator("#body-fat-result").waitFor();
    assert.deepEqual(submitted.map(value => Buffer.from(value, "base64").toString()), ["first", "replacement"]);
    console.log("Passed delayed submit, expired picker, cancel, reselection and stale-read checks.");
  } finally {
    await browser.close();
  }
}

testPicker().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
