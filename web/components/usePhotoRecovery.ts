"use client";

import { useRef } from "react";
import { track } from "@/lib/analytics";

type Recovery = {
  failed_attempt_id: string;
  failure_code: string;
  recovery_action?: "retry" | "reselect";
};

/** In-memory metadata only. Never persists a photo or sends its contents. */
export function usePhotoRecovery(tool: string) {
  const pending = useRef<Recovery | null>(null);
  return {
    failed(attemptId: string, code: string) {
      pending.current = { failed_attempt_id: attemptId, failure_code: code };
    },
    started(action: "retry" | "reselect") {
      if (!pending.current) return;
      pending.current.recovery_action = action;
      track("tool_photo_recovery_started", { tool, ...pending.current });
    },
    succeeded(attemptId: string) {
      if (pending.current?.recovery_action) {
        track("tool_photo_recovery_succeeded", { tool, ...pending.current, attempt_id: attemptId });
      }
      pending.current = null;
    },
    clear() { pending.current = null; },
  };
}
