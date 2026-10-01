/**
 * PortfolioCraft - Resilience & Retry Utilities (Phase 30)
 * Safely executes asynchronous external operations with exponential backoff
 * and fallback handling so optional service failures never crash core workflows.
 */

import { logStructuredEvent } from "@/utilities/observability";

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  operationName?: string;
}

/**
 * Executes an async task with automatic retry and exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 200;
  const backoffFactor = options.backoffFactor ?? 2;
  const name = options.operationName || "ExternalOperation";

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (attempt < maxRetries) {
        logStructuredEvent({
          level: "WARN",
          message: `${name} failed (Attempt ${attempt}/${maxRetries}): ${errorMsg}. Retrying in ${delay}ms...`,
          route: "resilience_retry",
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffFactor;
      }
    }
  }

  logStructuredEvent({
    level: "ERROR",
    message: `${name} failed all ${maxRetries} retry attempts.`,
    route: "resilience_retry",
  });

  throw lastError;
}

/**
 * Executes an async operation with a fallback default value if it fails,
 * ensuring optional third-party failures degrade gracefully.
 */
export async function withGracefulFallback<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  operationName: string = "OptionalService"
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStructuredEvent({
      level: "WARN",
      message: `Graceful degradation triggered for ${operationName}: ${msg}. Returning fallback response.`,
      route: "resilience_fallback",
    });
    return fallbackValue;
  }
}
