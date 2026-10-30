"use client";

import { useEffect } from "react";

/** Progressive enhancement: all content remains visible without JavaScript. */
export default function HomepageMotion() {
  useEffect(() => {
    const root = document.getElementById("gainframe-homepage");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;

    const animate = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      if (reducedMotion.matches || typeof element.animate !== "function") return;
      const animation = element.animate(frames, options);
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };

    const stop = () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };

    if (!reducedMotion.matches) {
      const scenes = [
        ["copy", "translateY(12px)", "translateY(0)", 0],
        ["lead", "translate(-50%,24px)", "translate(-50%,0)", 100],
        ["left", "translate(16px,18px) rotate(-4deg)", "translate(0,0) rotate(-7deg)", 190],
        ["right", "translate(-16px,18px) rotate(4deg)", "translate(0,0) rotate(7deg)", 240],
      ] as const;

      scenes.forEach(([name, from, to, delay]) => {
        const element = root.querySelector(`[data-intro="${name}"]`);
        if (element) animate(element, [
          { opacity: 0, transform: from },
          { opacity: 1, transform: to },
        ], { duration: 720, delay, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" });
      });

      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            observer?.unobserve(target);
            if (target.hasAttribute("data-gary")) {
              animate(target, [
                { transform: "translateY(0) rotate(0deg)" },
                { transform: "translateY(-7px) rotate(-2deg)", offset: 0.45 },
                { transform: "translateY(0) rotate(0deg)" },
              ], { duration: 3800, iterations: 2, easing: "ease-in-out" });
            } else if (!target.contains(document.activeElement)) {
              animate(target, [
                { opacity: 0, transform: "translateY(18px)" },
                { opacity: 1, transform: "translateY(0)" },
              ], { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" });
            }
          });
        }, { threshold: 0.06, rootMargin: "0px 0px -5% 0px" });

        root.querySelectorAll("[data-reveal], [data-gary]").forEach((element) => {
          // Leave already-visible content alone, including restored scroll positions.
          if (element.getBoundingClientRect().top >= window.innerHeight * 0.92) {
            observer?.observe(element);
          }
        });
      }
    }

    const onPreferenceChange = () => { if (reducedMotion.matches) stop(); };
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const section = target.closest("[data-reveal]");
      if (!section) return;
      observer?.unobserve(section);
      animations.forEach((animation) => {
        if (animation.effect instanceof KeyframeEffect && animation.effect.target === section) {
          animation.cancel();
          animations.delete(animation);
        }
      });
    };
    const onMenuClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("nav a")) {
        const details = target.closest("details");
        if (details) details.open = false;
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const menu = root.querySelector<HTMLDetailsElement>("header details[open]");
      if (menu) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    };

    reducedMotion.addEventListener("change", onPreferenceChange);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("click", onMenuClick);
    root.addEventListener("keydown", onEscape);
    return () => {
      stop();
      reducedMotion.removeEventListener("change", onPreferenceChange);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("click", onMenuClick);
      root.removeEventListener("keydown", onEscape);
    };
  }, []);

  return null;
}
