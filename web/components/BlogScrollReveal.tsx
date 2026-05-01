"use client";

import { useEffect } from "react";

const SELECTOR =
  ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .parallax-float, .badge-pop, .tilt-in, .hero-text-stagger, .hero-image-stagger";

export default function BlogScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(SELECTOR);
    if (!elements.length) return;

    const reveal = (el: Element) => el.classList.add("visible");

    if (!("IntersectionObserver" in window)) {
      elements.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(el);
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
