import { describe, it, expect, vi } from "vitest";
import { trackAnalyticsEvent, getOwnerDashboardMetrics } from "../services/analytics-service";

// Mock Supabase client for analytics tests
vi.mock("@/auth/server", () => ({
  createClient: async () => {
    const mockChain: Record<string, unknown> = {
      select: () => mockChain,
      insert: async () => ({ data: { id: "evt-123" }, error: null }),
      update: () => mockChain,
      delete: () => mockChain,
      eq: () => mockChain,
      neq: () => mockChain,
      in: () => mockChain,
      gte: () => mockChain,
      order: () => mockChain,
      limit: () => mockChain,
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
    };
    return {
      from: () => mockChain,
    };
  },
}));

describe("Phase 15 Analytics & Owner Dashboard Tests", () => {
  it("should fail-safely track analytics events without throwing exceptions", async () => {
    await expect(
      trackAnalyticsEvent("portfolio_published", {
        userId: "user-123",
        portfolioId: "port-123",
        metadata: { templateId: "developer" },
      })
    ).resolves.not.toThrow();
  });

  it("should swallow database insertion errors fail-safely without breaking calling operations", async () => {
    // Calling trackAnalyticsEvent with arbitrary arguments
    await expect(
      trackAnalyticsEvent("user_signed_up", {
        userId: "user-999",
      })
    ).resolves.not.toThrow();
  });

  it("should calculate owner dashboard aggregate metrics correctly", async () => {
    const metrics = await getOwnerDashboardMetrics(30);

    expect(metrics).toBeDefined();
    expect(metrics.periodDays).toBe(30);
    expect(typeof metrics.totalUsers).toBe("number");
    expect(typeof metrics.totalPortfolios).toBe("number");
    expect(typeof metrics.publishRate).toBe("number");
    expect(metrics.funnel).toBeDefined();
    expect(metrics.importStats).toBeDefined();
    expect(metrics.sharingStats).toBeDefined();
    expect(Array.isArray(metrics.recentActivity)).toBe(true);
  });
});
