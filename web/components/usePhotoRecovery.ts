"use client";

import { useRef } from "react";
import { track } from "@/lib/analytics";
import type { PhotoDiagnostics } from "@/lib/tool-client";

type Recovery = {
  failed_attempt_id: string;
  failure_code: string;
  failed_input_source?: PhotoDiagnostics["input_source"];
  failed_preprocessing_stage?: PhotoDiagnostics["preprocessing_stage"];
  recovery_action?: "retry" | "reselect";
};

/** In-memory metadata only. Never persists a photo or sends its contents. */
export function usePhotoRecovery(tool: string) {
  const pending = useRef<Recovery | null>(null);
  return {
    failed(attemptId: string, code: string, diagnostics?: PhotoDiagnostics) {
      pending.current = {
        failed_attempt_id: attemptId,
        failure_code: code,
        ...(diagnostics && {
          failed_input_source: diagnostics.input_source,
          failed_preprocessing_stage: diagnostics.preprocessing_stage,
        }),
      };
    },
    started(action: "retry" | "reselect") {
      if (!pending.current) return;
      pending.current.recovery_action = action;
      track("tool_photo_recovery_started", { tool, ...pending.current });
    },
    succeeded(attemptId: string, diagnostics?: PhotoDiagnostics) {
      if (pending.current?.recovery_action) {
        track("tool_photo_recovery_succeeded", { tool, ...pending.current, ...diagnostics, attempt_id: attemptId });
      }
      pending.current = null;
    },
    clear() { pending.current = null; },
  };
}
