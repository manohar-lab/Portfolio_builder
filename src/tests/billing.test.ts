import { describe, it, expect } from "vitest";
import { PLAN_CONFIGS } from "../config/plans";
import { canUserAccessFeature } from "../utilities/feature-gating";
import { BillingService } from "../services/billing-service";
import { UserSubscriptionRecord } from "../types/billing";

describe("Phase 18 - FREE + PRO Subscription Model & Feature Gating System", () => {
  it("should contain centralized plan configurations for Free ($0) and Pro ($12)", () => {
    expect(PLAN_CONFIGS.free).toBeDefined();
    expect(PLAN_CONFIGS.free.priceMonthly).toBe(0);
    expect(PLAN_CONFIGS.free.features.custom_domain).toBe(false);
    expect(PLAN_CONFIGS.free.features.public_platform_url).toBe(true);

    expect(PLAN_CONFIGS.pro).toBeDefined();
    expect(PLAN_CONFIGS.pro.priceMonthly).toBe(12);
    expect(PLAN_CONFIGS.pro.features.custom_domain).toBe(true);
    expect(PLAN_CONFIGS.pro.features.advanced_customization).toBe(true);
  });

  it("should default users without subscription records to the FREE plan", () => {
    const entitlement = canUserAccessFeature(null, "custom_domain");
    expect(entitlement.allowed).toBe(false);
    expect(entitlement.userPlan).toBe("free");
    expect(entitlement.upgradeRequired).toBe(true);
  });

  it("should grant access to Pro-only features for active Pro subscribers", () => {
    const activeProSub: UserSubscriptionRecord = {
      id: "sub-123",
      userId: "user-pro-1",
      plan: "pro",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const domainAccess = canUserAccessFeature(activeProSub, "custom_domain");
    expect(domainAccess.allowed).toBe(true);
    expect(domainAccess.upgradeRequired).toBe(false);

    const customizationAccess = canUserAccessFeature(activeProSub, "advanced_customization");
    expect(customizationAccess.allowed).toBe(true);
  });

  it("should enforce feature gating for Free users attempting Pro features", () => {
    const freeSub: UserSubscriptionRecord = {
      id: "sub-456",
      userId: "user-free-1",
      plan: "free",
      status: "free",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const customDomainAccess = canUserAccessFeature(freeSub, "custom_domain");
    expect(customDomainAccess.allowed).toBe(false);
    expect(customDomainAccess.upgradeRequired).toBe(true);

    const publicUrlAccess = canUserAccessFeature(freeSub, "public_platform_url");
    expect(publicUrlAccess.allowed).toBe(true);
  });

  it("should generate checkout sessions correctly", async () => {
    const billingService = new BillingService();
    const session = await billingService.createCheckoutSession("test-user-999", "http://localhost:3000/dashboard");

    expect(session.sessionId).toBeDefined();
    expect(session.url).toBeDefined();
    expect(session.url).toContain("http://localhost:3000/dashboard");
  });

  it("should handle webhook idempotency and skip duplicate webhook event IDs", async () => {
    const billingService = new BillingService();
    const mockEvent = {
      id: "evt_duplicate_test_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "sub_mock_123",
          customer: "cus_mock_123",
          client_reference_id: "user_test_id",
          metadata: { user_id: "user_test_id" },
        },
      },
    };

    // First processing
    const firstRes = await billingService.processWebhookEvent(mockEvent);
    expect(firstRes.processed).toBe(true);

    // Second processing (duplicate)
    const secondRes = await billingService.processWebhookEvent(mockEvent);
    expect(secondRes.processed).toBe(true);
    expect(secondRes.status).toBe("already_processed");
  });

  it("should safely handle subscription cancellation and preserve portfolio data", async () => {
    const cancelledSub: UserSubscriptionRecord = {
      id: "sub-789",
      userId: "user-cancelled-1",
      plan: "free",
      status: "cancelled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // User reverts to free features, basic platform URL access remains enabled
    const publicUrlAccess = canUserAccessFeature(cancelledSub, "public_platform_url");
    expect(publicUrlAccess.allowed).toBe(true);
  });
});
