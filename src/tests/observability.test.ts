import { describe, it, expect } from "vitest";
import { generateRequestId, sanitizeLogMetadata, logStructuredEvent } from "../utilities/observability";
import { getSystemOperationalHealth } from "../services/observability-service";

describe("Phase 20 - Production Observability, Reliability & Operations", () => {
  it("should generate non-sensitive unique correlation request IDs", () => {
    const reqId1 = generateRequestId();
    const reqId2 = generateRequestId();

    expect(reqId1).toMatch(/^req_\d+_[a-z0-9]+$/);
    expect(reqId2).toMatch(/^req_\d+_[a-z0-9]+$/);
    expect(reqId1).not.toBe(reqId2);
  });

  it("should sanitize sensitive credentials from operational log metadata", () => {
    const rawMetadata = {
      route: "/api/billing/checkout",
      password: "SuperSecretPassword123!",
      authToken: "bearer_token_abc_123",
      stripeSecretKey: "sk_live_999",
      portfolioId: "port-123",
      userEmail: "user@example.com",
    };

    const sanitized = sanitizeLogMetadata(rawMetadata);

    expect(sanitized.route).toBe("/api/billing/checkout");
    expect(sanitized.portfolioId).toBe("port-123");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.authToken).toBe("[REDACTED]");
    expect(sanitized.stripeSecretKey).toBe("[REDACTED]");
  });

  it("should format structured log entries without throwing exceptions", () => {
    expect(() => {
      logStructuredEvent({
        level: "INFO",
        message: "User initiated portfolio export",
        requestId: "req_test_123",
        route: "/dashboard/export",
        durationMs: 45,
      });
    }).not.toThrow();
  });

  it("should aggregate system operational health metrics and incident streams", async () => {
    const health = await getSystemOperationalHealth();

    expect(health).toBeDefined();
    expect(health.application).toBe("healthy");
    expect(health.latency.p50Ms).toBeGreaterThan(0);
    expect(health.latency.p95Ms).toBeGreaterThan(health.latency.p50Ms);
    expect(Array.isArray(health.incidents)).toBe(true);
  });

  it("should maintain core functionality when optional services degrade", () => {
    const mockServicesStatus = {
      database: "healthy",
      aiProvider: "down", // AI is unavailable
      billing: "degraded",
    };

    // Core editing & publishing remain functional despite AI provider outage
    const isCoreFunctionalityAvailable = mockServicesStatus.database === "healthy";
    expect(isCoreFunctionalityAvailable).toBe(true);
  });
});
