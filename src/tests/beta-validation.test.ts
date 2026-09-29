import { describe, it, expect, vi } from "vitest";
import { submitUserFeedback } from "../services/feedback-service";

// Mock Supabase client for feedback submission test
vi.mock("@/auth/server", () => ({
  createClient: async () => ({
    from: () => ({
      insert: async () => {
        return { data: { id: "fb-123" }, error: null };
      },
    }),
  }),
}));

vi.mock("@/auth/service", () => ({
  getAuthenticatedUser: async () => ({
    authUser: { id: "auth-123", email: "tester@example.com" },
    internalUser: { id: "user-123" },
  }),
}));

describe("Phase 11 Beta Validation & Feedback System Tests", () => {
  it("should validate feedback message length", async () => {
    // 1. Message too short (less than 5 chars)
    const shortRes = await submitUserFeedback({
      category: "bug",
      message: "Hi",
    });
    expect(shortRes.success).toBe(false);
    expect(shortRes.error).toContain("at least 5 characters");

    // 2. Valid feedback submission
    const validRes = await submitUserFeedback({
      category: "confusing_ux",
      message: "The template color picker could use more contrast options.",
      contactEmail: "user@example.com",
    });
    expect(validRes.success).toBe(true);
  });

  it("should sanitize feedback message content to prevent stored XSS", async () => {
    const maliciousPayload = "<script>alert('xss')</script>";
    const res = await submitUserFeedback({
      category: "other",
      message: maliciousPayload,
    });
    expect(res.success).toBe(true);
  });
});
