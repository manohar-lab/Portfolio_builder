import { describe, it, expect, vi } from "vitest";
import {
  normalizeDomain,
  validateDomainInput,
  generateVerificationToken,
  getDnsInstructions,
} from "../utilities/domain-utils";
import {
  addCustomDomain,
  verifyCustomDomain,
  disconnectCustomDomain,
} from "../services/domain-service";

// Mock Supabase client for domain service tests
vi.mock("@/auth/server", () => ({
  createClient: async () => {
    const mockChain: Record<string, unknown> = {
      select: () => mockChain,
      insert: () => mockChain,
      update: () => mockChain,
      delete: () => mockChain,
      eq: () => mockChain,
      neq: () => mockChain,
      in: () => mockChain,
      single: async () => ({
        data: {
          id: "dom-123",
          user_id: "user-123",
          portfolio_id: "port-123",
          domain: "example.com",
          status: "active",
          verification_token: "pc-verify-123456",
        },
        error: null,
      }),
      maybeSingle: async () => ({
        data: null, // No domain collision in test
        error: null,
      }),
    };
    return {
      from: () => mockChain,
    };
  },
}));

describe("Phase 14 Custom Domain System Tests", () => {
  it("should normalize raw domain input representations cleanly", () => {
    expect(normalizeDomain("https://Naveen-Kumar.com/")).toBe("naveen-kumar.com");
    expect(normalizeDomain("http://example.com/about?query=1")).toBe("example.com");
    expect(normalizeDomain("portfolio.developer.org:8080")).toBe("portfolio.developer.org");
    expect(normalizeDomain("  MY-DOMAIN.IO  ")).toBe("my-domain.io");
  });

  it("should validate domain format and reject unsafe or invalid inputs", () => {
    // Valid domains
    expect(validateDomainInput("example.com").valid).toBe(true);
    expect(validateDomainInput("portfolio.naveen.dev").valid).toBe(true);
    expect(validateDomainInput("https://sub.domain.co.uk/").valid).toBe(true);

    // Invalid domains
    expect(validateDomainInput("localhost").valid).toBe(false);
    expect(validateDomainInput("127.0.0.1").valid).toBe(false);
    expect(validateDomainInput("192.168.1.1").valid).toBe(false);
    expect(validateDomainInput("invalid_domain!").valid).toBe(false);
    expect(validateDomainInput("domain with spaces.com").valid).toBe(false);
  });

  it("should generate unpredictable cryptographically secure verification tokens", () => {
    const token1 = generateVerificationToken();
    const token2 = generateVerificationToken();

    expect(token1).toMatch(/^pc-verify-[a-f0-9]+$/);
    expect(token2).toMatch(/^pc-verify-[a-f0-9]+$/);
    expect(token1).not.toBe(token2);
  });

  it("should generate clear DNS TXT record instructions", () => {
    const instructions = getDnsInstructions("example.com", "token123");
    expect(instructions.type).toBe("TXT");
    expect(instructions.host).toBe("_verification");
    expect(instructions.value).toBe("portfolio-craft-verify=token123");
  });

  it("should handle adding custom domain with authorization check", async () => {
    const res = await addCustomDomain("port-123", "user-123", "example.com");
    expect(res.success).toBe(true);
    expect(res.data?.domainRecord.domain).toBe("example.com");
    expect(res.data?.instructions.type).toBe("TXT");
  });

  it("should reject unauthorized domain addition for non-owned portfolio", async () => {
    // Mock user mismatch
    const res = await addCustomDomain("port-123", "other-user-999", "example.com");
    expect(res.success).toBe(false);
    expect(res.error).toContain("access denied");
  });

  it("should verify custom domain DNS and update status to active in test mode", async () => {
    const res = await verifyCustomDomain("dom-123", "user-123");
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe("active");
  });

  it("should disconnect custom domain safely", async () => {
    const res = await disconnectCustomDomain("dom-123", "user-123");
    expect(res.success).toBe(true);
    expect(res.data?.disconnected).toBe(true);
  });
});
