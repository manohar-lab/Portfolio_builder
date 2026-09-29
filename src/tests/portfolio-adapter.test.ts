import { describe, it, expect } from "vitest";
import { normalizePortfolioData } from "../utilities/portfolio-adapter";
import { ProjectItem } from "../types/portfolio";

describe("Portfolio Data Normalization Adapter", () => {
  it("should provide type-safe fallback defaults for missing portfolio fields", () => {
    const raw = {
      slug: "test-user",
      profile: {
        fullName: "Test User",
        headline: "Software Architect",
        bio: "Test bio",
        isAvailableForWork: true,
      },
    };

    const normalized = normalizePortfolioData(raw);

    expect(normalized.slug).toBe("test-user");
    expect(normalized.profile.fullName).toBe("Test User");
    expect(normalized.templateId).toBe("developer");
    expect(normalized.sections.length).toBeGreaterThan(0);
    expect(normalized.theme.mode).toBe("system");
    expect(normalized.theme.primaryColor).toBe("#3b82f6");
  });

  it("should preserve custom projects and education entries", () => {
    const customProject: ProjectItem = {
      id: "p-custom",
      title: "Custom SaaS Engine",
      shortDescription: "Custom test description",
      technologies: ["Next.js", "TypeScript"],
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: true,
    };

    const normalized = normalizePortfolioData({
      projects: [customProject],
    });

    expect(normalized.projects.length).toBe(1);
    expect(normalized.projects[0].title).toBe("Custom SaaS Engine");
  });
});
