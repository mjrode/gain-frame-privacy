"use client";

import { useEffect, useMemo, useState } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import { ANALYSIS_APP_STORE_PAGE } from "@/lib/site";
import { createBodyVisualizerBridgeAnalytics } from "@/lib/body-visualizer-bridge-analytics";
import {
  BODY_VISUALIZER_BRIDGE_MAIN_CTA,
  bodyVisualizerBridgeExperiment,
  getBodyVisualizerBridgeRollout,
} from "@/lib/body-visualizer-bridge-rollout";
import {
  BODY_VISUALIZER_CTA_QUERY,
  BODY_VISUALIZER_CTA_TREATMENTS,
  BODY_VISUALIZER_CTA_VARIANTS,
  bodyVisualizerAssignedExperiment,
  bodyVisualizerCtaPlacement,
  type BodyVisualizerCtaAssignment,
  type BodyVisualizerCtaVariant,
} from "@/lib/body-visualizer-cta-experiment";
import styles from "./VisualizerWorkspace.module.css";

export function useBodyVisualizerCta() {
  const platform = useDownloadPlatform();
  const [preview, setPreview] = useState(false);
  const [bridgeEnabled, setBridgeEnabled] = useState(false);
  const [assignment, setAssignment] =
    useState<BodyVisualizerCtaAssignment | null>(null);
  const bridgeAnalytics = useMemo(
    () => createBodyVisualizerBridgeAnalytics(platform),
    [platform],
  );

  useEffect(() => {
    const rollout = getBodyVisualizerBridgeRollout(window.location.hostname, window.location.search);
    setPreview(rollout.local && platform !== "android");
    setBridgeEnabled(rollout.enabled);
    if (platform === "unknown" || platform === "android") return;
    setAssignment({ variant: rollout.variant, forced: rollout.local });
  }, [platform]);

  function selectVariant(variant: BodyVisualizerCtaVariant) {
    if (!preview || bridgeEnabled) return;
    setAssignment({ variant, forced: true });
    const url = new URL(window.location.href);
    url.searchParams.set(BODY_VISUALIZER_CTA_QUERY, variant);
    window.history.replaceState(window.history.state, "", url);
  }

  return { platform, preview, bridgeEnabled, assignment, selectVariant, bridgeAnalytics };
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
  // Android keeps its existing email capture instead of an unavailable app CTA.
  const bridgeOffer = state.bridgeEnabled && state.platform !== "android";
  const copy = BODY_VISUALIZER_CTA_TREATMENTS[variant];
  return (
    <div
      ref={bridgeOffer ? state.bridgeAnalytics.refs.main_cta : undefined}
      onClick={bridgeOffer ? state.bridgeAnalytics.onClick : undefined}
      className={styles.appInvitation}
      data-visualizer-cta-style={copy.style}
    >
      <div className={styles.appInvitationAction}>
        <ToolConversionCard
          key={variant}
          tool="body_visualizer"
          campaign="web-body-visualizer"
          customProductPageId={bridgeOffer ? ANALYSIS_APP_STORE_PAGE.id : undefined}
          placement={
            bridgeOffer ? BODY_VISUALIZER_BRIDGE_MAIN_CTA
              : assignment ? bodyVisualizerCtaPlacement(variant) : "atlas_v6_android"
          }
          assignedExperiment={
            bridgeOffer && assignment
              ? bodyVisualizerBridgeExperiment(assignment.forced)
              : assignment ? bodyVisualizerAssignedExperiment(assignment)
              : undefined
          }
          sticky={false}
          headline={copy.headline}
          body={copy.body}
          androidBody="Email yourself the iPhone app link."
          iosLabel={copy.iosLabel}
          proof=""
        />
      </div>
    </div>
  );
}

/** Local review controls sit outside the workspace and never render in production. */
export function BodyVisualizerCtaPreview({ state }: { state: CtaState }) {
  if (!state.preview || state.bridgeEnabled || !state.assignment) return null;
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
