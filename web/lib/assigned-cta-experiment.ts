/** Metadata for a CTA experiment whose assignment is owned by its page. */
export type AssignedCtaExperiment = {
  id: string;
  phase: string;
  variant: string;
  forced: boolean;
  angle: string;
  style: string;
};

export function assignedCtaProperties(experiment: AssignedCtaExperiment) {
  return {
    experiment_id: experiment.id,
    experiment_phase: experiment.phase,
    experiment_variant: experiment.variant,
    experiment_forced: experiment.forced,
    cta_angle: experiment.angle,
    cta_style: experiment.style,
  };
}

/** Initial observer callbacks may intersect without reaching the threshold. */
export function isAssignedCtaVisible(entry: {
  isIntersecting: boolean;
  intersectionRatio: number;
}) {
  return entry.isIntersecting && entry.intersectionRatio >= 0.4;
}
