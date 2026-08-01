export const RAW_FALLBACK_MAX_BYTES = 5 * 1024 * 1024;

export type ToolErrorType =
  | "timeout"
  | "network"
  | "invalid_response"
  | "unsupported_image"
  | "image_decode"
  | "image_processing"
  | "validation"
  | "http"
  | "unknown";

export class ToolClientError extends Error {
  readonly errorType: ToolErrorType;
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      errorType: ToolErrorType;
      code: string;
      status?: number;
      retryable: boolean;
      cause?: unknown;
    },
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ToolClientError";
    this.errorType = options.errorType;
    this.code = options.code;
    this.status = options.status ?? 0;
    this.retryable = options.retryable;
  }
}

export function toolNow(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function createAttemptId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function terminalTelemetry(options: {
  attemptId: string;
  startedAt: number;
  phase: string;
  errorType: string;
  code: string;
  status?: number;
  retryable: boolean;
  source: "client" | "server" | "preflight";
}): Record<string, unknown> {
  return {
    phase: options.phase,
    error_type: options.errorType,
    code: options.code,
    status: options.status ?? 0,
    duration_ms: Math.max(0, Math.round(toolNow() - options.startedAt)),
    attempt_id: options.attemptId,
    retryable: options.retryable,
    source: options.source,
  };
}

export function asToolClientError(error: unknown): ToolClientError {
  if (error instanceof ToolClientError) return error;
  const message = error instanceof Error ? error.message : "Unexpected client error.";
  return new ToolClientError(message, {
    errorType: "unknown",
    code: "unexpected_client_error",
    retryable: true,
    cause: error,
  });
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const controller = new AbortController();
  const externalSignal = init.signal;
  let timedOut = false;

  const forwardAbort = () => controller.abort(externalSignal?.reason);
  if (externalSignal?.aborted) forwardAbort();
  else externalSignal?.addEventListener("abort", forwardAbort, { once: true });

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException("Request timed out", "TimeoutError"));
  }, timeoutMs);

  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      throw new ToolClientError("The request timed out.", {
        errorType: "timeout",
        code: "request_timeout",
        retryable: true,
        cause: error,
      });
    }
    if (externalSignal?.aborted) {
      throw new ToolClientError("The request was cancelled.", {
        errorType: "network",
        code: "request_aborted",
        retryable: true,
        cause: error,
      });
    }
    throw new ToolClientError(
      error instanceof Error ? error.message : "Network request failed.",
      {
        errorType: "network",
        code: "network_error",
        retryable: true,
        cause: error,
      },
    );
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }
}

export async function validatedJson<T>(
  response: Response,
  isValid: (value: unknown) => value is T,
): Promise<T> {
  let value: unknown;
  try {
    value = await response.json();
  } catch (error) {
    throw new ToolClientError("The server returned invalid JSON.", {
      errorType: "invalid_response",
      code: "invalid_json_response",
      status: response.status,
      retryable: true,
      cause: error,
    });
  }
  if (!isValid(value)) {
    throw new ToolClientError("The server returned an invalid response.", {
      errorType: "invalid_response",
      code: "invalid_response_shape",
      status: response.status,
      retryable: true,
    });
  }
  return value;
}

export async function errorResponseJson(
  response: Response,
): Promise<Record<string, unknown>> {
  try {
    const value = (await response.json()) as unknown;
    return value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export type ImagePreprocessingMethod =
  | "resized_jpeg"
  | "bitmap_resized_jpeg"
  | "raw_fallback";

export type PreprocessedImage = {
  base64: string;
  sizeKb: number;
  photoMime: string;
  method: ImagePreprocessingMethod;
};

const EXTENSION_MIMES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  dng: "image/dng",
};

export function imageMime(file: Pick<File, "name" | "type">): string {
  const declared = file.type.toLowerCase().split(";", 1)[0].trim();
  if (declared === "image/jpg") return "image/jpeg";
  if (declared && declared !== "application/octet-stream") return declared;
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
  return EXTENSION_MIMES[extension] ?? declared;
}

export function isLikelyImageFile(file: Pick<File, "name" | "type">): boolean {
  return imageMime(file).startsWith("image/");
}

function rawFallbackError(
  file: File,
  mime: string,
  allowedRawMimes: readonly string[],
): ToolClientError | null {
  if (file.size === 0) {
    return new ToolClientError("That image file is empty or corrupt.", {
      errorType: "image_decode",
      code: "corrupt_image",
      retryable: false,
    });
  }
  if (!allowedRawMimes.includes(mime)) {
    return new ToolClientError(
      "That image format isn't supported. Use JPEG, PNG, WebP, HEIC, or HEIF.",
      {
        errorType: "unsupported_image",
        code: "unsupported_format",
        retryable: false,
      },
    );
  }
  if (file.size > RAW_FALLBACK_MAX_BYTES) {
    return new ToolClientError(
      "That photo couldn't be decoded and is too large to send as-is. Re-save it or choose one under 5 MB.",
      {
        errorType: "image_decode",
        code: "decode_failed_large",
        retryable: false,
      },
    );
  }
  return null;
}

async function fileAsBase64(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.split(",", 2)[1] ?? "";
      if (base64) resolve(base64);
      else reject(new Error("The original file was empty."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

async function rawImageFallback(
  file: File,
  allowedRawMimes: readonly string[],
): Promise<PreprocessedImage> {
  const mime = imageMime(file);
  const classification = rawFallbackError(file, mime, allowedRawMimes);
  if (classification) throw classification;

  try {
    const base64 = await fileAsBase64(file);
    return {
      base64,
      sizeKb: Math.round(file.size / 1024),
      photoMime: mime,
      method: "raw_fallback",
    };
  } catch (error) {
    throw new ToolClientError("Couldn't read the original image file.", {
      errorType: "image_processing",
      code: "raw_file_read_failed",
      retryable: false,
      cause: error,
    });
  }
}

async function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Browser image decode failed."));
    image.src = url;
  });
}

export async function preprocessImageForUpload(
  file: File,
  options: {
    allowedRawMimes: readonly string[];
    maxDimension?: number;
  },
): Promise<PreprocessedImage> {
  const mime = imageMime(file);
  if (mime === "image/dng" || mime === "image/x-adobe-dng") {
    throw new ToolClientError(
      "DNG photos aren't supported. Export the photo as JPEG, PNG, WebP, HEIC, or HEIF.",
      {
        errorType: "unsupported_image",
        code: "unsupported_format",
        retryable: false,
      },
    );
  }
  const url = URL.createObjectURL(file);
  let bitmap: ImageBitmap | null = null;
  let source: CanvasImageSource | null = null;
  let width = 0;
  let height = 0;
  let usedBitmap = false;

  try {
    try {
      const image = await loadHtmlImage(url);
      source = image;
      width = image.width;
      height = image.height;
    } catch {
      if (typeof window.createImageBitmap === "function") {
        try {
          bitmap = await window.createImageBitmap(file);
          source = bitmap;
          width = bitmap.width;
          height = bitmap.height;
          usedBitmap = true;
        } catch {
          // Raw fallback below preserves supported files the browser cannot decode.
        }
      }
    }

    if (!source || width <= 0 || height <= 0) {
      return await rawImageFallback(file, options.allowedRawMimes);
    }

    try {
      const maxDimension = options.maxDimension ?? 1024;
      const ratio = Math.min(1, maxDimension / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable.");
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",", 2)[1] ?? "";
      if (!base64) throw new Error("Canvas encoding returned no data.");
      return {
        base64,
        sizeKb: Math.round((base64.length * 3) / 4 / 1024),
        photoMime: "image/jpeg",
        method: usedBitmap ? "bitmap_resized_jpeg" : "resized_jpeg",
      };
    } catch {
      return await rawImageFallback(file, options.allowedRawMimes);
    }
  } finally {
    bitmap?.close();
    URL.revokeObjectURL(url);
  }
}
