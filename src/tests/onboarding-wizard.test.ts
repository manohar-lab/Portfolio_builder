import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * PHASE 24 UNIT & INTEGRATION TEST SUITE:
 * First-Time User Onboarding & Portfolio Creation Wizard
 */

// Mock Supabase & Auth
vi.mock("@/auth/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() =>
                Promise.resolve({
                  data: {
                    user_id: "user_test_123",
                    onboarding_completed: false,
                    onboarding_step: 2,
                    profile_type: "developer",
                  },
                })
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      if (table === "portfolios") {
        const createEqMock = () => {
          const eqObj: Record<string, unknown> = {
            eq: vi.fn(() => eqObj),
            maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
            single: vi.fn(() =>
              Promise.resolve({
                data: {
                  id: "port_onboard_123",
                  user_id: "user_test_123",
                  title: "Alex Morgan Portfolio",
                  slug: "alex-morgan",
                  template_id: "developer",
                  is_published: true,
                },
                error: null,
              })
            ),
          };
          return eqObj;
        };

        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => createEqMock()),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: {
                    id: "port_onboard_123",
                    user_id: "user_test_123",
                    title: "Alex Morgan Portfolio",
                    slug: "alex-morgan",
                    template_id: "developer",
                    is_published: true,
                  },
                  error: null,
                })
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      if (table === "portfolio_sections") {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
        };
      }
      if (table === "analytics_events") {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
        };
      }
      return {
        select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [] })) })),
      };
    }),
  })),
}));

vi.mock("@/auth/service", () => ({
  requireAuth: vi.fn(() =>
    Promise.resolve({
      authUser: { id: "user_test_123", email: "test@portfoliocraft.com" },
      internalUser: { id: "user_test_123", full_name: "Test User" },
      profile: { onboarding_completed: false, onboarding_step: 2, profile_type: "developer" },
    })
  ),
}));

vi.mock("@/database/portfolio-service", () => ({
  checkSlugAvailability: vi.fn((slug: string) =>
    Promise.resolve({
      available: slug !== "reserved",
      reason: slug === "reserved" ? "Slug is reserved" : undefined,
    })
  ),
}));

import {
  getUserOnboardingStatus,
  saveOnboardingStep,
  resetOnboardingState,
  completeOnboarding,
} from "@/services/onboarding-service";

describe("Phase 24 — First-Time User Onboarding & Portfolio Creation Wizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Should retrieve onboarding status and persistent state for user", async () => {
    const status = await getUserOnboardingStatus();
    expect(status.onboardingCompleted).toBe(false);
    expect(status.onboardingStep).toBe(2);
    expect(status.profileType).toBe("developer");
    expect(status.onboardingState).toBeDefined();
    expect(status.onboardingState?.currentStep).toBe(2);
  });

  it("2. Should save onboarding step progress", async () => {
    const result = await saveOnboardingStep(3, "researcher");
    expect(result.success).toBe(true);
  });

  it("3. Should reset onboarding state safely without affecting portfolios", async () => {
    const result = await resetOnboardingState();
    expect(result.success).toBe(true);
  });

  it("4. Should complete onboarding and create portfolio draft / published record", async () => {
    const res = await completeOnboarding({
      title: "Alex Morgan Portfolio",
      slug: "alex-morgan",
      templateId: "developer",
      profileType: "developer",
      isPublished: true,
    });

    expect(res.success).toBe(true);
    expect(res.portfolioId).toBe("port_onboard_123");
    expect(res.slug).toBe("alex-morgan");
  });

  it("5. Should reject unavailable public username slugs during onboarding", async () => {
    const res = await completeOnboarding({
      title: "Reserved Portfolio",
      slug: "reserved",
      templateId: "developer",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Slug is reserved");
  });

  it("6. Should allow skipping optional sections during onboarding without blocking", async () => {
    const res = await completeOnboarding({
      title: "Minimal Portfolio",
      slug: "minimal-user",
      templateId: "minimal",
      selectedSections: ["hero", "about", "projects"],
    });

    expect(res.success).toBe(true);
  });
});
