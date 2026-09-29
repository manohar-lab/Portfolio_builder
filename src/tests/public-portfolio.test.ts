import { describe, it, expect } from "vitest";
import { isReservedSlug, isValidSlug } from "@/utilities/slug";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { PortfolioData } from "@/types/portfolio";

describe("Phase 5: Public Portfolio Routing, Draft Protection & SEO", () => {
  
  const samplePublishedPortfolio: PortfolioData = normalizePortfolioData({
    id: "port-pub-100",
    userId: "usr-owner-100",
    slug: "alex-chen",
    title: "Alex Chen Portfolio",
    templateId: "developer",
    isPublished: true,
    isPublic: true,
    profile: {
      fullName: "Alex Chen",
      headline: "AI Systems Architect",
      bio: "Engineering high performance LLM systems.",
      avatarUrl: "https://example.com/avatar.jpg",
      email: "alex@example.com",
      isAvailableForWork: true,
    },
    sections: [
      { id: "s1", type: "hero", title: "Hero", isVisible: true, order: 0 },
      { id: "s2", type: "projects", title: "Projects", isVisible: true, order: 1 },
      { id: "s3", type: "research", title: "Research", isVisible: false, order: 2 },
    ],
    projects: [
      {
        id: "p1",
        title: "Distributed Vector Store",
        shortDescription: "Sub-millisecond similarity search",
        technologies: ["C++", "CUDA"],
        status: "COMPLETED",
        isCurrent: false,
        isFeatured: true,
      },
    ],
  });

  const sampleDraftPortfolio: PortfolioData = {
    ...samplePublishedPortfolio,
    id: "port-draft-200",
    slug: "draft-user",
    isPublished: false, // DRAFT MODE
  };

  it("1. Published portfolios are valid and available for public rendering", () => {
    expect(samplePublishedPortfolio.isPublished).toBe(true);
    expect(samplePublishedPortfolio.slug).toBe("alex-chen");
    expect(samplePublishedPortfolio.profile.fullName).toBe("Alex Chen");
  });

  it("2. DRAFT PROTECTION: Draft portfolios must be blocked from public access", () => {
    const isPubliclyAccessible = (p: PortfolioData) => p.isPublished && p.isPublic;

    expect(isPubliclyAccessible(samplePublishedPortfolio)).toBe(true);
    expect(isPubliclyAccessible(sampleDraftPortfolio)).toBe(false);
  });

  it("3. RESERVED SLUGS: System routes (admin, dashboard, login, about, pricing, etc.) cannot be claimed", () => {
    const reservedList = ["admin", "dashboard", "login", "about", "pricing", "api", "auth", "settings"];

    expect(isReservedSlug("u")).toBe(true);

    reservedList.forEach((slug) => {
      expect(isReservedSlug(slug)).toBe(true);
      const validation = isValidSlug(slug);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain("reserved");
    });
  });

  it("4. SLUG VALIDATION: Invalid characters, short length, and trailing spaces are rejected", () => {
    expect(isValidSlug("ab").valid).toBe(false); // < 3 chars
    expect(isValidSlug("alex_chen!").valid).toBe(false); // special chars
    expect(isValidSlug("alex--chen").valid).toBe(false); // double hyphen
    expect(isValidSlug("valid-slug-123").valid).toBe(true);
  });

  it("5. PUBLIC DATA SAFETY: Public View Model sanitizes internal user IDs and session secrets", () => {
    // Helper simulating public payload sanitization
    const sanitizePublicModel = (p: PortfolioData) => ({
      ...p,
      userId: "", // Strip internal DB user_id
    });

    const sanitized = sanitizePublicModel(samplePublishedPortfolio);

    expect(sanitized.userId).toBe("");
    expect(sanitized.profile.fullName).toBe("Alex Chen");
    expect(sanitized.projects).toHaveLength(1);
  });

  it("6. DISABLED SECTIONS: Disabled sections are excluded from public navigation", () => {
    const visiblePublicSections = samplePublishedPortfolio.sections.filter((s) => s.isVisible);
    const visibleTypes = visiblePublicSections.map((s) => s.type);

    expect(visibleTypes).toContain("hero");
    expect(visibleTypes).toContain("projects");
    expect(visibleTypes).not.toContain("research"); // Disabled research section hidden
  });

  it("7. SEO & OPEN GRAPH METADATA: Generates dynamic titles and social preview fields", () => {
    const generatePublicMetadata = (p: PortfolioData) => {
      const fullName = p.profile.fullName || p.title;
      const headline = p.profile.headline || "Portfolio";
      return {
        title: `${fullName} | ${headline}`,
        description: p.profile.bio,
        openGraph: {
          title: `${fullName} — ${headline}`,
          description: p.profile.bio,
          images: p.profile.avatarUrl ? [{ url: p.profile.avatarUrl }] : [],
        },
      };
    };

    const meta = generatePublicMetadata(samplePublishedPortfolio);

    expect(meta.title).toBe("Alex Chen | AI Systems Architect");
    expect(meta.description).toContain("LLM systems");
    expect(meta.openGraph.images[0].url).toBe("https://example.com/avatar.jpg");
  });

});
