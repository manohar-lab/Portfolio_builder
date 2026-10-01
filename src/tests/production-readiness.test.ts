import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as healthHandler } from "@/app/api/health/route";
import { GET as readyHandler } from "@/app/api/ready/route";
import { validateEnvironmentVariables } from "@/config/env-validator";
import { createAppErrorResponse, handleServerError } from "@/utilities/error-handler";
import { sanitizeLogMetadata } from "@/utilities/observability";
import { withRetry, withGracefulFallback } from "@/utilities/resilience";

// Mock Supabase Server for readiness handler
vi.mock("@/auth/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ count: 5, error: null }),
    }),
  })),
}));

describe("Phase 30: Production Readiness, Monitoring, Observability, and Operations System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Liveness check (/api/health) should return 200 OK without exposing secrets", async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.service).toBe("PortfolioCraft SaaS");
    expect(json.version).toBeDefined();
    expect(json.uptimeSeconds).toBeGreaterThanOrEqual(0);
    // Ensure no connection strings or secrets exist
    expect(JSON.stringify(json)).not.toContain("postgres://");
    expect(JSON.stringify(json)).not.toContain("secret");
  });

  it("2. Readiness check (/api/ready) should report database and environment health", async () => {
    const res = await readyHandler();
    const json = await res.json();

    expect([200, 503]).includes(res.status);
    expect(json.dependencies).toBeDefined();
    expect(json.dependencies.database.required).toBe(true);
    expect(json.dependencies.gitHubIntegration.required).toBe(false);
  });

  it("3. Environment validator should identify required and optional variables safely", () => {
    const result = validateEnvironmentVariables();
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("missingRequired");
    expect(result).toHaveProperty("optionalStatus");
    expect(Array.isArray(result.missingRequired)).toBe(true);
  });

  it("4. Error handler should generate standardized error responses with correlation IDs", () => {
    const res = createAppErrorResponse("PORTFOLIO_NOT_FOUND", "Portfolio not found", 404, "req_test_123");
    expect(res.status).toBe(404);

    const correlationHeader = res.headers.get("X-Correlation-ID");
    expect(correlationHeader).toContain("ERR_123");
  });

  it("5. Server error handler should catch exceptions and return safe user-facing response", async () => {
    const rawError = new Error("Database connection pool exhausted at postgresql://user:pass@host:5432/db");
    const res = handleServerError(rawError, "/api/test", "req_test_999");

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
    // Raw SQL host string should NOT be exposed to client
    expect(json.error.message).not.toContain("postgresql://");
    expect(json.error.correlationId).toBeDefined();
  });

  it("6. Secret sanitization should redact sensitive metadata fields in logs", () => {
    const meta = {
      user: "alex",
      password: "SuperSecretPassword123!",
      api_key: "sk_live_123456789",
      nested: {
        token: "bearer_xyz",
        publicData: 42,
      },
    };

    const sanitized = sanitizeLogMetadata(meta);
    expect(sanitized.user).toBe("alex");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.api_key).toBe("[REDACTED]");
    expect((sanitized.nested as Record<string, unknown>).token).toBe("[REDACTED]");
    expect((sanitized.nested as Record<string, unknown>).publicData).toBe(42);
  });

  it("7. Retry utility with exponential backoff should succeed after initial failure", async () => {
    let attempts = 0;
    const flakyTask = async () => {
      attempts++;
      if (attempts < 2) throw new Error("Temporary network glitch");
      return "SuccessData";
    };

    const result = await withRetry(flakyTask, { maxRetries: 3, initialDelayMs: 10, operationName: "FlakyTask" });
    expect(result).toBe("SuccessData");
    expect(attempts).toBe(2);
  });

  it("8. Graceful fallback utility should return fallback response when optional service fails", async () => {
    const failingOptionalService = async () => {
      throw new Error("GitHub API rate limit exceeded");
    };

    const fallbackResponse = { items: [], degraded: true };
    const result = await withGracefulFallback(failingOptionalService, fallbackResponse, "GitHubService");

    expect(result).toEqual(fallbackResponse);
    expect(result.degraded).toBe(true);
  });
});
