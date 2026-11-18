/** Metadata for a CTA experiment whose assignment is owned by its page. */
export type AssignedCtaExperiment = {
  id: string;
  phase: string;
  variant: string;
  forced: boolean;
  angle: string;
  style: string;
  buttonPlacement?: {
    phase: string;
    variant: "above_image" | "below_image";
  };
};

export function assignedCtaProperties(experiment: AssignedCtaExperiment) {
  return {
    experiment_id: experiment.id,
    experiment_phase: experiment.phase,
    experiment_variant: experiment.variant,
    experiment_forced: experiment.forced,
    cta_angle: experiment.angle,
    cta_style: experiment.style,
    ...(experiment.buttonPlacement && {
      button_placement_phase: experiment.buttonPlacement.phase,
      button_placement: experiment.buttonPlacement.variant,
    }),
  };
}

/** Initial observer callbacks may intersect without reaching the threshold. */
export function isAssignedCtaVisible(entry: {
  isIntersecting: boolean;
  intersectionRatio: number;
}) {
  return entry.isIntersecting && entry.intersectionRatio >= 0.4;
}
