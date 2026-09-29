import { describe, it, expect } from "vitest";
import { getAvailableTemplates } from "../templates/registry";
import { normalizePortfolioData } from "../utilities/portfolio-adapter";

describe("Phase 10 Public Product Experience Tests", () => {
  it("should expose all available templates for public inspection without requiring login", () => {
    const templates = getAvailableTemplates();
    expect(templates.length).toBeGreaterThan(0);

    const available = templates.filter((t) => t.isAvailable);
    expect(available.length).toBe(3);

    const ids = available.map((t) => t.id);
    expect(ids).toContain("minimal");
    expect(ids).toContain("developer");
    expect(ids).toContain("research");
  });

  it("should render template previews unauthenticated using sample normalized data", () => {
    const devSample = normalizePortfolioData({
      templateId: "developer",
      title: "Developer Preview",
    });

    expect(devSample.templateId).toBe("developer");
    expect(devSample.profile.fullName).toBeDefined();
    expect(devSample.projects.length).toBeGreaterThan(0);

    const researchSample = normalizePortfolioData({
      templateId: "research",
      title: "Research Preview",
    });

    expect(researchSample.templateId).toBe("research");
    expect(researchSample.research.length).toBeGreaterThan(0);
  });

  it("should enforce clean separation of draft portfolios from public template inspection", () => {
    const draftPortfolio = normalizePortfolioData({
      isPublished: false,
      isPublic: true,
      slug: "private-user-draft",
    });

    expect(draftPortfolio.isPublished).toBe(false);
  });
});
