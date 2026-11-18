"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { claimOncePerPageView, track } from "@/lib/analytics";
import { assignedCtaProperties, type AssignedCtaExperiment } from "@/lib/assigned-cta-experiment";
import { placementPreview, screenPreview, visualizerScreenAssignment } from "@/lib/visualizer-screen-test";
import ToolConversionCard from "@/components/ToolConversionCard";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import { ANALYSIS_APP_STORE_PAGE } from "@/lib/site";
import { createBodyVisualizerBridgeAnalytics, observeBridgeVisibility } from "@/lib/body-visualizer-bridge-analytics";
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
  const [adjusted, setAdjusted] = useState(false);
  const [example, setExample] = useState<AssignedCtaExperiment | null>(null);
  const enrolled = useRef(false);
  useEffect(() => {
    const forced = screenPreview(window.location.search);
    const forcedPlacement = placementPreview(window.location.search);
    if (enrolled.current || platform === "unknown" || platform === "android") return;
    if (!forced && !forcedPlacement && (platform !== "ios" || !adjusted)) return;
    const arm = visualizerScreenAssignment(forced, forcedPlacement);
    enrolled.current = true;
    track("paired_cta_assigned", { ...assignedCtaProperties(arm), platform });
    setExample(arm);
  }, [platform, adjusted]);
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

  return { platform, example, setAdjusted, preview, bridgeEnabled, assignment, selectVariant, bridgeAnalytics };
}

type CtaState = ReturnType<typeof useBodyVisualizerCta>;

const SCREEN_OFFERS = {
  future_you: {
    image: "future-you-example.webp", height: 479, alt: "The Future You app showing a starting photo beside an AI-generated example",
    label: "Future You · GainFrame Pro", headline: "See a leaner or more muscular version of yourself",
    body: "Add one photo and choose a goal. GainFrame Pro shows your original beside an AI-generated preview.",
    iosLabel: "Preview my photo in the app",
  },
  front_side: {
    image: "front-side-example.webp", height: 520, alt: "The app’s front and side sample photos used for a two-photo body-fat estimate",
    label: "Body-fat estimate · GainFrame Pro", headline: "Estimate body fat from two photos",
    body: "Add a front photo and a side photo. GainFrame Pro gives you an estimated body-fat percentage.",
    iosLabel: "Estimate in the app",
  },
} as const;

export function BodyVisualizerCta({ state }: { state: CtaState }) {
  const actionRef = useRef<HTMLDivElement>(null);
  const experiment = state.example;
  useEffect(() => {
    const placement = experiment?.buttonPlacement;
    const button = actionRef.current?.querySelector<HTMLAnchorElement>("a.tcc-primary");
    if (!experiment || !placement || !button) return;
    return observeBridgeVisibility(button, () => {
      const key = `body_visualizer_button_viewed:${placement.phase}:${placement.variant}:${experiment.forced}`;
      if (claimOncePerPageView(key)) {
        track("body_visualizer_button_viewed", {
          ...assignedCtaProperties(experiment), tool: "body_visualizer", platform: state.platform,
        });
      }
    });
  }, [experiment, state.platform, state.assignment]);

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
  const screen = state.example?.variant;
  const offer = screen === "future_you" || screen === "front_side" ? SCREEN_OFFERS[screen] : null;
  const copy = offer ?? BODY_VISUALIZER_CTA_TREATMENTS[variant];
  const buttonFirst = experiment?.buttonPlacement?.variant === "above_image";
  const offerFigure = offer && (
    <figure className={styles.screenFigure}>
      <img src={`/tools/body-visualizer/${offer.image}`} alt={offer.alt} width="720" height={offer.height} />
      <figcaption>{offer.label}</figcaption>
    </figure>
  );
  return (
    <div
      ref={bridgeOffer ? state.bridgeAnalytics.refs.main_cta : undefined}
      onClick={bridgeOffer ? state.bridgeAnalytics.onClick : undefined}
      className={offer ? `${styles.appInvitation} ${styles.screenOffer}` : styles.appInvitation}
      data-visualizer-cta-style={BODY_VISUALIZER_CTA_TREATMENTS[variant].style}
      data-button-first={buttonFirst || undefined}
    >
      {!buttonFirst && offerFigure}
      {state.example?.variant === "score_example" && (
        <figure className={styles.scoreExample}>
          <img src="/tools/body-visualizer/single-photo-report-3-33.webp" width="600" height="456" alt="GainFrame muscle map with front delts selected and an example area score of 82 out of 100" />
          <figcaption>Example from the iPhone app<br /><strong>Single-photo Deep Dive</strong></figcaption>
        </figure>
      )}
      <div className={styles.appInvitationAction} ref={actionRef}>
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
            state.example ?? (bridgeOffer && assignment
              ? bodyVisualizerBridgeExperiment(assignment.forced)
              : assignment ? bodyVisualizerAssignedExperiment(assignment)
              : undefined)
          }
          sticky={false}
          afterActions={buttonFirst ? offerFigure : undefined}
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
