import { track } from "./analytics.ts";
import { trackToolFunnelStep } from "./tool-funnel.ts";
import type { ProgressPhotoCompareMode, ProgressPhotoInputMode } from "./progress-photo-compare.ts";

const tool = "progress_photo_compare" as const;

export function trackProgressPhotoCompareResult(
  inputMode: ProgressPhotoInputMode | null,
  comparisonMode: ProgressPhotoCompareMode,
) {
  if (!inputMode) return;
  const properties = { input_mode: inputMode, comparison_mode: comparisonMode };
  if (inputMode === "local_images") {
    trackToolFunnelStep(tool, "result_shown", properties);
  } else {
    track("progress_photo_compare_demo_result_shown", { tool, ...properties });
  }
}

export function trackProgressPhotoCompareExport(
  inputMode: ProgressPhotoInputMode,
  comparisonMode: ProgressPhotoCompareMode,
  hasLabels: boolean,
  privacyBlur: boolean,
) {
  track(inputMode === "local_images"
    ? "progress_photo_compare_exported"
    : "progress_photo_compare_demo_exported", {
    tool,
    input_mode: inputMode,
    comparison_mode: comparisonMode,
    has_labels: hasLabels,
    privacy_blur: privacyBlur,
  });
}
