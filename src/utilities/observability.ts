/**
 * PortfolioCraft - Production Observability & Structured Logging Utilities (Phase 20)
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface LogEventPayload {
  level: LogLevel;
  message: string;
  requestId?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generates a unique, non-sensitive correlation request ID
 */
export function generateRequestId(): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `req_${Date.now()}_${rand}`;
}

/**
 * Sanitizes metadata to ensure sensitive secrets (passwords, tokens, API keys) are never logged
 */
export function sanitizeLogMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
  if (!meta || typeof meta !== "object") return {};

  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ["password", "token", "secret", "key", "authorization", "cookie", "cvv", "card"];

  Object.entries(meta).forEach(([key, val]) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeLogMetadata(val as Record<string, unknown>);
    } else {
      sanitized[key] = val;
    }
  });

  return sanitized;
}

/**
 * Outputs structured JSON logs to stdout/stderr safely
 */
export function logStructuredEvent(payload: LogEventPayload): void {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && payload.level === "DEBUG") return; // Suppress debug logs in production

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: payload.level,
    message: payload.message,
    requestId: payload.requestId || "req_internal",
    route: payload.route || "server_action",
    status: payload.status || 200,
    durationMs: payload.durationMs ?? 0,
    userId: payload.userId ? `usr_${payload.userId.slice(0, 8)}` : undefined,
    metadata: sanitizeLogMetadata(payload.metadata),
  };

  const output = JSON.stringify(logEntry);

  if (payload.level === "ERROR" || payload.level === "CRITICAL") {
    console.error(output);
  } else {
    console.log(output);
  }
}
