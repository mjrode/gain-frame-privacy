# Photo upload recovery, September 29, 2026

Release: `81187297`, live **2026-09-29 17:33:40 UTC**, Worker version `4fc16e18-560c-4096-8aa0-6c00bd6fe81b`. See [execution receipt](../../seo-tools/content-audits/2026-09-29-execution.md).

Applies to the photo body-fat estimator and the shared transformation client,
including its measurements mode. The server, safety rejection rules, raw MIME
allowlist, size limits, request timeouts, rate limits and result CTAs are unchanged.

FileReader errors and aborts get one Blob.arrayBuffer fallback. A readable Blob
retains the original bytes and MIME. When both methods fail, the error remains
`raw_file_read_failed`, non-retryable: choose the photo again, saving a cloud photo
locally if necessary. The picker clears its input value after a selection so the
same filename can be reselected. Cancelling preserves the current error and inputs.

Retryable request errors allow retrying the same File and current inputs. Reselection
preserves sex, goal, intensity and zones instead of calling the full reset function.
Only the estimator's `insufficient_visual_evidence` state gets a compact framing
example. Other server rejection messages remain intact and receive no workaround.

## Measurement

`tool_photo_recovery_started` carries tool, failed_attempt_id, failure_code and
recovery_action (`retry` or `reselect`). `tool_photo_recovery_succeeded` adds the
new successful attempt_id after a validated success response. No photo bytes,
filenames, email addresses or user-entered values enter these events. Context is
memory-only and cleared on success, full reset or rate limit. Repeated failures
start a new recovery context. Picker cancellation emits no start.

Use distinct successful attempt IDs joined to the referenced failed attempt and
report by tool, browser and operating system. Keep same-photo retry and fresh
selection separate. A start is an explicit recovery action, not a result. The
photo tool's Android results/email path is the immediate business outcome; do not
claim this change caused iOS installs or subscriptions.

## Verification

The old implementation fails a mocked Android-style FileReader NotReadableError
when Blob bytes are still available. The new implementation recovers exact bytes.
A separately tested revoked handle still fails, requires reselection and releases
its object URL. These are deterministic browser-API reproductions, not a claim
that every Android device has been tested. Additional UI and release checks are
recorded in the September 29 SEO execution receipt.
