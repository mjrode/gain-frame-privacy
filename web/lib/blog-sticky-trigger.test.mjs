import assert from "node:assert/strict";
import test from "node:test";
import { observeBlogStickyTrigger } from "./blog-sticky-trigger.ts";

function browserFixture(t, { width = 1280, height = 720, top = 1818 } = {}) {
  const previousWindow = globalThis.window;
  const previousObserver = globalThis.IntersectionObserver;
  const observers = [];
  const listeners = new Map();
  const frames = new Map();
  let nextFrame = 0;
  let triggerTop = top;
  let activated = 0;
  globalThis.window = {
    innerWidth: width,
    innerHeight: height,
    addEventListener(name, callback, options) {
      listeners.set(name, { callback, options });
    },
    removeEventListener(name, callback) {
      if (listeners.get(name)?.callback === callback) listeners.delete(name);
    },
    requestAnimationFrame(callback) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  globalThis.IntersectionObserver = class {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.disconnected = false;
      observers.push(this);
    }
    observe(element) { this.target = element; }
    disconnect() { this.disconnected = true; }
  };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousObserver === undefined) delete globalThis.IntersectionObserver;
    else globalThis.IntersectionObserver = previousObserver;
  });
  const trigger = { getBoundingClientRect: () => ({ top: triggerTop }) };
  return {
    observers, listeners, frames, trigger,
    activate: () => { activated += 1; },
    get activated() { return activated; },
    setTop(value) { triggerTop = value; },
    emit(name) { listeners.get(name)?.callback(); },
    flushFrame() {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback());
    },
  };
}

for (const [width, height] of [[1280, 720], [1440, 900], [800, 1200]]) {
  test(`uses viewport height and the exact threshold at ${width}x${height}`, (t) => {
    const f = browserFixture(t, { width, height });
    const stop = observeBlogStickyTrigger(f.trigger, f.activate);
    assert.equal(f.observers[0].options.rootMargin, `0px 0px -${height * 0.6}px 0px`);
    assert.equal(f.listeners.get("scroll").options.passive, true);
    f.setTop(height * 0.4 + 1);
    f.observers[0].callback();
    assert.equal(f.activated, 0);
    f.setTop(height * 0.4);
    f.observers[0].callback();
    assert.equal(f.activated, 1);
    assert.equal(f.observers[0].disconnected, true);
    assert.equal(f.listeners.size, 0);
    stop();
  });
}

test("a fast jump past the heading activates without an observer callback", (t) => {
  const f = browserFixture(t);
  observeBlogStickyTrigger(f.trigger, f.activate);
  f.setTop(-1062);
  f.emit("scroll");
  f.emit("scroll");
  assert.equal(f.frames.size, 1);
  assert.equal(f.activated, 0);
  f.flushFrame();
  assert.equal(f.activated, 1);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.frames.size, 0);
});

test("resize refreshes the observer and uses the new height for activation", (t) => {
  const f = browserFixture(t, { top: 500 });
  observeBlogStickyTrigger(f.trigger, f.activate);
  window.innerHeight = 1000;
  f.emit("resize");
  f.flushFrame();
  assert.equal(f.activated, 0);
  assert.equal(f.observers[0].disconnected, true);
  assert.equal(f.observers[1].options.rootMargin, "0px 0px -600px 0px");
  window.innerHeight = 1250;
  f.emit("resize");
  f.flushFrame();
  assert.equal(f.activated, 1);
  assert.equal(f.observers[1].disconnected, true);
});

test("restored scroll activates at mount or a later pageshow", (t) => {
  const f = browserFixture(t, { top: -500 });
  observeBlogStickyTrigger(f.trigger, f.activate);
  assert.equal(f.activated, 1);
  assert.equal(f.observers.length, 0);

  f.setTop(1000);
  observeBlogStickyTrigger(f.trigger, f.activate);
  f.setTop(-500);
  f.emit("pageshow");
  f.flushFrame();
  assert.equal(f.activated, 2);
});

test("activation is one-shot so scrolling cannot reopen a dismissed card", (t) => {
  const f = browserFixture(t);
  observeBlogStickyTrigger(f.trigger, f.activate);
  f.setTop(100);
  f.emit("scroll");
  // An observer delivery can win the race against the queued scroll frame.
  f.observers[0].callback();
  assert.equal(f.activated, 1);
  assert.equal(f.frames.size, 0);
  f.observers[0].callback();
  f.emit("scroll");
  f.emit("resize");
  f.emit("pageshow");
  f.flushFrame();
  assert.equal(f.activated, 1);
});

test("cleanup prevents queued work and stale observer deliveries after navigation", (t) => {
  const f = browserFixture(t);
  const stop = observeBlogStickyTrigger(f.trigger, f.activate);
  f.emit("scroll");
  stop();
  f.setTop(-500);
  f.observers[0].callback();
  f.flushFrame();
  assert.equal(f.activated, 0);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.frames.size, 0);

  // A new article gets its own trigger after the old one has been cleaned up.
  f.setTop(1000);
  const stopNext = observeBlogStickyTrigger(f.trigger, f.activate);
  assert.equal(f.activated, 0);
  f.setTop(200);
  f.emit("scroll");
  f.flushFrame();
  assert.equal(f.activated, 1);
  stopNext();
});

test("missing headings and IntersectionObserver retain immediate fallback", (t) => {
  const f = browserFixture(t);
  observeBlogStickyTrigger(null, f.activate);
  assert.equal(f.activated, 1);
  delete globalThis.IntersectionObserver;
  observeBlogStickyTrigger(f.trigger, f.activate);
  assert.equal(f.activated, 2);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.observers.length, 0);
});
