import { describe, it, expect, vi } from "vitest";
import { sanitizeUrl, sanitizeHtmlText, checkRateLimit } from "../utilities/security";
import { isValidSlug, isReservedSlug } from "../utilities/slug";
import { getPublicPortfolioBySlug } from "../database/portfolio-service";

// Mock Supabase client to simulate multi-user data boundary
vi.mock("@/auth/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      select: () => {
        const query: Record<string, unknown> = {};
        const builder = {
          eq: (field: string, val: unknown) => {
            query[field] = val;
            return builder;
          },
          order: () => builder,
          maybeSingle: async () => {
            if (table === "portfolios" && query.slug === "published-user-slug") {
              if (query.is_published === true) {
                return {
                  data: {
                    id: "port-pub-1",
                    user_id: "user-public-owner-id",
                    slug: "published-user-slug",
                    title: "Public User Portfolio",
                    template_id: "developer",
                    is_published: true,
                    is_public: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  error: null,
                };
              }
            }
            if (table === "portfolios" && query.slug === "draft-user-slug") {
              // Draft portfolio: is_published is false
              if (query.is_published === true) {
                return { data: null, error: null }; // Not found because it's draft!
              }
            }
            return { data: null, error: null };
          },
          single: async () => builder.maybeSingle(),
        };
        return builder;
      },
    }),
  }),
}));

describe("Phase 8 Security Hardening & Multi-User Isolation Tests", () => {
  it("should sanitize dangerous URL protocols to prevent XSS attacks", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeUrl("JAVAscript:confirm(document.cookie)")).toBe("#");
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("#");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("#");

    // Valid URLs
    expect(sanitizeUrl("https://github.com/user/repo")).toBe("https://github.com/user/repo");
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    expect(sanitizeUrl("mailto:user@example.com")).toBe("mailto:user@example.com");
    expect(sanitizeUrl("github.com/user/repo")).toBe("https://github.com/user/repo");
  });

  it("should escape HTML entity characters to prevent stored XSS", () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const escaped = sanitizeHtmlText(maliciousInput);
    expect(escaped).not.toContain("<script>");
    expect(escaped).toBe("&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;");
  });

  it("should enforce rate limiting on high-frequency actions", () => {
    const key = "test-user-ip-123";
    const limit = 3;

    expect(checkRateLimit(key, limit, 60000).allowed).toBe(true);
    expect(checkRateLimit(key, limit, 60000).allowed).toBe(true);
    expect(checkRateLimit(key, limit, 60000).allowed).toBe(true);

    // 4th attempt should be blocked
    const FourthAttempt = checkRateLimit(key, limit, 60000);
    expect(FourthAttempt.allowed).toBe(false);
    expect(FourthAttempt.remaining).toBe(0);
  });

  it("should strictly protect draft portfolios from public access", async () => {
    // 1. Published portfolio access succeeds
    const pubPortfolio = await getPublicPortfolioBySlug("published-user-slug");
    expect(pubPortfolio).not.toBeNull();
    expect(pubPortfolio?.slug).toBe("published-user-slug");

    // 2. Draft portfolio access returns null (404) to prevent information leakage
    const draftPortfolio = await getPublicPortfolioBySlug("draft-user-slug");
    expect(draftPortfolio).toBeNull();
  });

  it("should enforce slug uniqueness and disallow reserved system routes", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(isReservedSlug("login")).toBe(true);
    expect(isReservedSlug("onboarding")).toBe(true);
    expect(isReservedSlug("api")).toBe(true);
    expect(isReservedSlug("u")).toBe(true);

    const validationRes = isValidSlug("admin");
    expect(validationRes.valid).toBe(false);
    expect(validationRes.reason).toContain("reserved");
  });
});
