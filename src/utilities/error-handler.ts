/**
 * PortfolioCraft - Standardized Application Error Handling & Error Codes (Phase 30)
 */

import { NextResponse } from "next/server";
import { logStructuredEvent, generateRequestId } from "@/utilities/observability";

export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "PORTFOLIO_NOT_FOUND"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "DEPENDENCY_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface StandardErrorBody {
  error: {
    code: AppErrorCode;
    message: string;
    correlationId: string;
  };
}

/**
 * Creates a standardized JSON response for client consumption.
 * Never leaks stack traces, raw SQL error messages, or internal implementation details.
 */
export function createAppErrorResponse(
  code: AppErrorCode,
  userFriendlyMessage: string,
  status: number = 400,
  correlationId?: string
): NextResponse<StandardErrorBody> {
  const reqId = correlationId || generateRequestId();
  const refCode = `ERR_${reqId.split("_").pop()?.toUpperCase() || "UNKNOWN"}`;

  return NextResponse.json(
    {
      error: {
        code,
        message: userFriendlyMessage,
        correlationId: refCode,
      },
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Correlation-ID": refCode,
      },
    }
  );
}

/**
 * Catches raw server errors, logs structured diagnostics safely,
 * and returns a safe, sanitized client response.
 */
export function handleServerError(
  err: unknown,
  route: string = "api_route",
  requestId?: string
): NextResponse<StandardErrorBody> {
  const reqId = requestId || generateRequestId();
  const rawMsg = err instanceof Error ? err.message : "Unknown runtime exception";

  // Safe structured log for internal monitoring
  logStructuredEvent({
    level: "ERROR",
    message: `Server Error on ${route}: ${rawMsg}`,
    requestId: reqId,
    route,
    status: 500,
    metadata: {
      errorType: err instanceof Error ? err.name : typeof err,
    },
  });

  return createAppErrorResponse(
    "INTERNAL_ERROR",
    "An unexpected error occurred. Please try again or contact support with reference ID.",
    500,
    reqId
  );
}
