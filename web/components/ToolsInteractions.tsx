"use client";

import { useEffect } from "react";

export default function ToolsInteractions() {
  useEffect(() => {
    // FAQ accordion
    const faqHandler = (e: Event) => {
      const btn = (e.target as HTMLElement).closest(".cl-faq-q");
      if (!btn) return;
      const item = btn.parentElement;
      if (!item) return;
      const wasOpen = item.classList.contains("open");
      document
        .querySelectorAll(".cl-faq-item")
        .forEach((el) => el.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    };
    document.addEventListener("click", faqHandler);

    // Active sidebar link on scroll
    const sections = document.querySelectorAll(".cl-section[id]");
    const links = document.querySelectorAll(".cl-nav-link");
    let sidebarObs: IntersectionObserver | null = null;
    if (sections.length && links.length) {
      sidebarObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              links.forEach((l) => l.classList.remove("cl-active"));
              const active = document.querySelector(
                `.cl-nav-link[href="#${e.target.id}"]`,
              );
              if (active) active.classList.add("cl-active");
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px" },
      );
      sections.forEach((s) => sidebarObs!.observe(s));
    }

    // Search filter
    const input = document.getElementById("cl-search") as HTMLInputElement | null;
    const clearBtn = document.getElementById("cl-search-clear");
    const wrap = document.getElementById("cl-search-wrap");
    const countEl = document.getElementById("cl-count");
    const cards = document.querySelectorAll(".cl-card[data-search]");
    const allSections = document.querySelectorAll(".cl-section[id]");
    const layout = document.querySelector(".cl-layout");
    let keyHandler: ((e: KeyboardEvent) => void) | null = null;
    let inputHandler: (() => void) | null = null;
    let clearHandler: (() => void) | null = null;

    if (input && wrap && countEl && layout) {
      keyHandler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          input.focus();
          input.select();
        }
        if (e.key === "Escape" && document.activeElement === input) {
          input.value = "";
          filter();
          input.blur();
        }
      };
      document.addEventListener("keydown", keyHandler);

      const filter = () => {
        const q = input.value.trim().toLowerCase();
        wrap.classList.toggle("has-value", q.length > 0);

        let visible = 0;
        cards.forEach((card) => {
          const hay = (card.getAttribute("data-search") || "").toLowerCase();
          const match = !q || hay.indexOf(q) !== -1;
          card.classList.toggle("cl-hidden", !match);
          if (match) visible++;
        });

        allSections.forEach((sec) => {
          const hasVisible =
            sec.querySelectorAll(".cl-card:not(.cl-hidden)").length > 0;
          sec.classList.toggle("cl-hidden", !hasVisible);
        });

        countEl.textContent = String(visible);

        const existingEmpty = layout.querySelector(".cl-empty");
        if (visible === 0) {
          const safe = q.replace(/</g, "&lt;");
          if (!existingEmpty) {
            const div = document.createElement("div");
            div.className = "cl-empty";
            div.innerHTML = `No calculators match <strong>"${safe}"</strong>. Try another keyword.`;
            const main = layout.querySelector("div:not(.cl-sidebar)");
            if (main) main.appendChild(div);
          } else {
            existingEmpty.innerHTML = `No calculators match <strong>"${safe}"</strong>. Try another keyword.`;
          }
        } else if (existingEmpty) {
          existingEmpty.remove();
        }
      };

      inputHandler = filter;
      clearHandler = () => {
        input.value = "";
        filter();
        input.focus();
      };
      input.addEventListener("input", inputHandler);
      clearBtn?.addEventListener("click", clearHandler);
    }

    return () => {
      document.removeEventListener("click", faqHandler);
      sidebarObs?.disconnect();
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
      if (input && inputHandler) input.removeEventListener("input", inputHandler);
      if (clearBtn && clearHandler)
        clearBtn.removeEventListener("click", clearHandler);
    };
  }, []);

  return null;
}
