"use client";

import { useEffect, useRef } from "react";
import {
  type ClientReportedWebTool,
  reportWebToolCompletion,
  WEB_TOOL_COMPLETED_DOM_EVENT,
} from "@/lib/web-tool-usage";

type Props = {
  html: string;
  script: string;
  tool: ClientReportedWebTool;
};

export default function CalcEmbed({ html, script, tool }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let reported = false;
    const onCompleted = () => {
      if (reported) return;
      reported = true;
      void reportWebToolCompletion(tool);
    };
    window.addEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, onCompleted);

    if (!script.trim()) {
      return () => {
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
      window.removeEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, onCompleted);
      el.remove();
    };
  }, [script, tool]);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
