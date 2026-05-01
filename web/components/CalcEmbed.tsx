"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  script: string;
};

export default function CalcEmbed({ html, script }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!script.trim()) return;
    // Inject as a real <script> element so functions like `calculate()`
    // declared at the top level land on window — matching the original
    // page behavior. `new Function()` would create a local scope.
    const el = document.createElement("script");
    el.textContent = script;
    document.body.appendChild(el);
    return () => {
      el.remove();
    };
  }, [script]);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
