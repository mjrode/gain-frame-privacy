"use client";

import { useEffect, useRef } from "react";
import {
  type ClientReportedWebTool,
  reportWebToolCompletion,
  WEB_TOOL_COMPLETED_DOM_EVENT,
} from "@/lib/web-tool-usage";
import { trackToolFunnelStep } from "@/lib/tool-funnel";

type Props = {
  html: string;
  script: string;
  tool: ClientReportedWebTool;
};

export default function CalcEmbed({ html, script, tool }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackedToolRef = useRef<ClientReportedWebTool>(tool);
  const viewedRef = useRef(false);
  const startedRef = useRef(false);
  const resultRef = useRef(false);

  useEffect(() => {
    if (trackedToolRef.current !== tool) {
      trackedToolRef.current = tool;
      viewedRef.current = false;
      startedRef.current = false;
      resultRef.current = false;
    }
    if (!viewedRef.current) {
      viewedRef.current = true;
      trackToolFunnelStep(tool, "viewed", { input_mode: "calculator" });
    }

    const container = containerRef.current;
    const onStarted = (event: Event) => {
      if (startedRef.current) return;
      const target = event.target instanceof Element ? event.target : null;
      if (
        !target?.closest(
          "input:not([type='hidden']), select, textarea, button, [role='slider'], [contenteditable='true']",
        )
      ) {
        return;
      }
      startedRef.current = true;
      trackToolFunnelStep(tool, "started", {
        input_mode: "calculator",
        start_trigger: event.type,
      });
    };

    const onCompleted = () => {
      if (resultRef.current) return;
      // Some legacy calculators only expose a completion signal. Preserve a
      // complete funnel even when their first interaction was keyboard-only
      // or dispatched before this client boundary finished hydrating.
      if (!startedRef.current) {
        startedRef.current = true;
        trackToolFunnelStep(tool, "started", {
          input_mode: "calculator",
          start_trigger: "completion_fallback",
        });
      }
      resultRef.current = true;
      trackToolFunnelStep(tool, "result_shown", {
        input_mode: "calculator",
      });
      void reportWebToolCompletion(tool);
    };
    container?.addEventListener("input", onStarted, true);
    container?.addEventListener("change", onStarted, true);
    container?.addEventListener("click", onStarted, true);
    window.addEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, onCompleted);

    if (!script.trim()) {
      return () => {
        container?.removeEventListener("input", onStarted, true);
        container?.removeEventListener("change", onStarted, true);
        container?.removeEventListener("click", onStarted, true);
        window.removeEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, onCompleted);
      };
    }
    // Inject as a real <script> element so functions like `calculate()`
    // declared at the top level land on window — matching the original
    // page behavior. `new Function()` would create a local scope.
    const el = document.createElement("script");
    el.textContent = script;
    document.body.appendChild(el);
    return () => {
      container?.removeEventListener("input", onStarted, true);
      container?.removeEventListener("change", onStarted, true);
      container?.removeEventListener("click", onStarted, true);
      window.removeEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, onCompleted);
      el.remove();
    };
  }, [script, tool]);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
