"use client";

import { useEffect, useState } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import {
  BODY_VISUALIZER_CTA_QUERY,
  BODY_VISUALIZER_CTA_TREATMENTS,
  BODY_VISUALIZER_CTA_VARIANTS,
  bodyVisualizerAssignedExperiment,
  bodyVisualizerCtaPlacement,
  getBodyVisualizerCtaAssignment,
  isBodyVisualizerCtaPreviewHost,
  isBodyVisualizerCtaVariant,
  type BodyVisualizerCtaAssignment,
  type BodyVisualizerCtaVariant,
} from "@/lib/body-visualizer-cta-experiment";
import styles from "./VisualizerWorkspace.module.css";

export function useBodyVisualizerCta() {
  const platform = useDownloadPlatform();
  const [preview, setPreview] = useState(false);
  const [assignment, setAssignment] =
    useState<BodyVisualizerCtaAssignment | null>(null);

  useEffect(() => {
    const local = isBodyVisualizerCtaPreviewHost(window.location.hostname);
    setPreview(local && platform !== "android");
    if (platform === "unknown" || platform === "android") return;
    if (local) {
      const requested = new URLSearchParams(window.location.search).get(
        BODY_VISUALIZER_CTA_QUERY,
      );
      setAssignment({
        variant: isBodyVisualizerCtaVariant(requested) ? requested : "direct",
        forced: true,
      });
    } else {
      setAssignment(getBodyVisualizerCtaAssignment());
    }
  }, [platform]);

  function selectVariant(variant: BodyVisualizerCtaVariant) {
    if (!preview) return;
    setAssignment({ variant, forced: true });
    const url = new URL(window.location.href);
    url.searchParams.set(BODY_VISUALIZER_CTA_QUERY, variant);
    window.history.replaceState(window.history.state, "", url);
  }

  return { platform, preview, assignment, selectVariant };
}

type CtaState = ReturnType<typeof useBodyVisualizerCta>;

export function BodyVisualizerCta({ state }: { state: CtaState }) {
  if (
    state.platform === "unknown" ||
    (state.platform !== "android" && !state.assignment)
  ) {
    return <div className={styles.ctaPlaceholder} aria-hidden="true" />;
  }
  const assignment = state.platform === "android" ? null : state.assignment;
  const variant = assignment?.variant ?? "direct";
  const copy = BODY_VISUALIZER_CTA_TREATMENTS[variant];
  return (
    <div
      className={styles.appInvitation}
      data-visualizer-cta-style={copy.style}
    >
      <ToolConversionCard
        key={variant}
        tool="body_visualizer"
        campaign="web-body-visualizer"
        placement={
          assignment ? bodyVisualizerCtaPlacement(variant) : "atlas_v6_android"
        }
        assignedExperiment={
          assignment ? bodyVisualizerAssignedExperiment(assignment) : undefined
        }
        sticky={false}
        headline={copy.headline}
        body={copy.body}
        androidBody="Email yourself the iPhone app link."
        iosLabel={copy.iosLabel}
        proof=""
      />
    </div>
  );
}

/** Local review controls sit outside the workspace and never render in production. */
export function BodyVisualizerCtaPreview({ state }: { state: CtaState }) {
  if (!state.preview || !state.assignment) return null;
  return (
    <div className={styles.ctaPreview}>
      <div className={styles.ctaPreviewHeading}>
        <strong>Compare the 4 CTAs</strong>
        <span>Local preview only</span>
      </div>
      <div
        className={styles.ctaPreviewOptions}
        role="group"
        aria-label="CTA preview"
      >
        {BODY_VISUALIZER_CTA_VARIANTS.map((variant) => {
          const treatment = BODY_VISUALIZER_CTA_TREATMENTS[variant];
          return (
            <button
              key={variant}
              type="button"
              aria-pressed={state.assignment?.variant === variant}
              onClick={() => state.selectVariant(variant)}
            >
              <b>{treatment.letter}</b>
              <span>{treatment.label}</span>
            </button>
          );
        })}
      </div>
      <p>
        Choose a version to try it above. Live visitors will see one consistent
        version.
      </p>
    </div>
  );
}
