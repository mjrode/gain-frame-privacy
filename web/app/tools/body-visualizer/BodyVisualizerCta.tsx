"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ToolConversionCard from "@/components/ToolConversionCard";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
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

// The approved rollout has its own attribution; historical treatments stay intact.
const FUTURE_YOU_COPY = {
  style: "ink",
  headline: "Preview a future version of you.",
  body: "Your photo. AI preview. Requires Pro.",
  iosLabel: "Try Future You",
} as const;

export function useBodyVisualizerCta() {
  const platform = useDownloadPlatform();
  const [preview, setPreview] = useState(false);
  const [futurePreview, setFuturePreview] = useState(false);
  const [assignment, setAssignment] =
    useState<BodyVisualizerCtaAssignment | null>(null);
  const bridgeAnalytics = useMemo(
    () => createBodyVisualizerBridgeAnalytics(platform),
    [platform],
  );

  useEffect(() => {
    const rollout = getBodyVisualizerBridgeRollout(window.location.hostname, window.location.search);
    setPreview(rollout.local && platform !== "android");
    setFuturePreview(rollout.enabled);
    if (platform === "unknown" || platform === "android") return;
    setAssignment({ variant: rollout.variant, forced: rollout.local });
  }, [platform]);

  function selectVariant(variant: BodyVisualizerCtaVariant) {
    if (!preview || futurePreview) return;
    setAssignment({ variant, forced: true });
    const url = new URL(window.location.href);
    url.searchParams.set(BODY_VISUALIZER_CTA_QUERY, variant);
    window.history.replaceState(window.history.state, "", url);
  }

  return { platform, preview, futurePreview, assignment, selectVariant, bridgeAnalytics };
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
  const futureOffer = state.futurePreview && state.platform !== "android";
  const copy = futureOffer
    ? FUTURE_YOU_COPY
    : BODY_VISUALIZER_CTA_TREATMENTS[variant];
  return (
    <div
      ref={futureOffer ? state.bridgeAnalytics.refs.main_cta : undefined}
      onClick={futureOffer ? state.bridgeAnalytics.onClick : undefined}
      className={styles.appInvitation}
      data-visualizer-cta-style={copy.style}
      data-visualizer-cta-preview={futureOffer ? "future" : undefined}
    >
      {futureOffer && (
        <figure className={styles.futureTeaser}>
          <div className={styles.futureTeaserLabels} aria-hidden="true">
            <span>Your photo</span><span>AI preview</span>
          </div>
          <div className={styles.futureTeaserImage}>
            <Image
              src="/preview/body-visualizer-bridge/future-you-split.png"
              width={1290}
              height={2796}
              sizes="150px"
              alt="A starting photo beside an illustrative Future You AI preview in GainFrame."
            />
          </div>
          <figcaption>Illustrative app example</figcaption>
        </figure>
      )}
      <div className={styles.appInvitationAction}>
        <ToolConversionCard
          key={variant}
          tool="body_visualizer"
          campaign="web-body-visualizer"
          placement={
            futureOffer ? BODY_VISUALIZER_BRIDGE_MAIN_CTA
              : assignment ? bodyVisualizerCtaPlacement(variant) : "atlas_v6_android"
          }
          assignedExperiment={
            futureOffer && assignment
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
        {futureOffer && (
          <a className={styles.walkthroughLink} href="#photo-history">
            See how it works <span aria-hidden="true">↓</span>
          </a>
        )}
      </div>
    </div>
  );
}

/** Local review controls sit outside the workspace and never render in production. */
export function BodyVisualizerCtaPreview({ state }: { state: CtaState }) {
  if (!state.preview || state.futurePreview || !state.assignment) return null;
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
