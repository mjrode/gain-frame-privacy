const ACTIVATION_VIEWPORT_RATIO = 0.4;

/** Activate once the first section reaches 40% of the viewport height. */
export function observeBlogStickyTrigger(
  trigger: Element | null,
  activate: () => void,
): () => void {
  let stopped = false;
  let observer: IntersectionObserver | null = null;
  let observedHeight = 0;
  let frame: number | null = null;

  function stop() {
    stopped = true;
    observer?.disconnect();
    window.removeEventListener("scroll", queueCheck);
    window.removeEventListener("resize", queueCheck);
    window.removeEventListener("pageshow", queueCheck);
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
  }

  function check() {
    if (stopped) return true;
    if (
      trigger &&
      trigger.getBoundingClientRect().top >
        window.innerHeight * ACTIVATION_VIEWPORT_RATIO
    ) {
      return false;
    }

    // Remove every trigger before rendering, so a dismissed card stays closed.
    stop();
    activate();
    return true;
  }

  function updateObserver() {
    observer?.disconnect();
    observedHeight = window.innerHeight;
    observer = new IntersectionObserver(check, {
      // Percentage root margins use viewport width, including vertical margins.
      rootMargin: `0px 0px -${observedHeight * (1 - ACTIVATION_VIEWPORT_RATIO)}px 0px`,
    });
    observer.observe(trigger!);
  }

  function queueCheck() {
    if (stopped || frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      if (check()) return;
      if (window.innerHeight !== observedHeight) updateObserver();
    });
  }

  // Preserve the existing fallback for articles or browsers without a trigger.
  if (!trigger || typeof IntersectionObserver === "undefined") {
    stop();
    activate();
    return stop;
  }
  if (check()) return stop;

  updateObserver();
  // Fast scrolling can jump over the observer's band without intersecting it.
  window.addEventListener("scroll", queueCheck, { passive: true });
  window.addEventListener("resize", queueCheck);
  window.addEventListener("pageshow", queueCheck);
  return stop;
}
