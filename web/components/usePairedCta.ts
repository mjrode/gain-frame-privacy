"use client";

import { useEffect, useState } from "react";
import { pairedCtaAssignment } from "@/lib/paired-cta-assignment";
import { track } from "@/lib/analytics";
import { assignedCtaProperties, type AssignedCtaExperiment } from "@/lib/assigned-cta-experiment";

export function usePairedCta(id: string, treatment: string, eligible: boolean, phase = "v1") {
  const [assignment, setAssignment] = useState<AssignedCtaExperiment | null>(null);
  useEffect(() => {
    if (!eligible) return;
    const preview = new URLSearchParams(window.location.search).get(id);
    const arm = pairedCtaAssignment(id, preview, phase);
    const experiment = {
      id, phase, variant: arm.treatment ? treatment : "control",
      forced: arm.forced, angle: id === "visualizer_result_example" ? "analysis" : "measurement",
      style: arm.treatment ? treatment : "control",
    };
    track("paired_cta_assigned", assignedCtaProperties(experiment));
    setAssignment(experiment);
  }, [id, treatment, eligible, phase]);
  return eligible ? assignment : null;
}
