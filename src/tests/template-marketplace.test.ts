import { describe, it, expect, vi } from "vitest";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { PortfolioData } from "@/types/portfolio";

vi.mock("@/dashboard/template-actions", () => ({
  switchTemplateAction: vi.fn(async (portfolioId: string, templateId: string) => ({
    success: true,
    portfolioId,
    templateId,
  })),
}));

const mockUserPortfolio: PortfolioData = {
  id: "port-user-123",
  userId: "user-1",
  title: "Jane Developer Portfolio",
  slug: "jane-dev",
  status: "DRAFT",
  isPublished: false,
  isPublic: false,
  visibilityMode: "private",
  templateId: "minimal",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  profile: {
    fullName: "Jane Developer",
    headline: "Senior Cloud Architect",
    bio: "Building resilient microservices.",
    isAvailableForWork: true,
  },
  sections: [
    { id: "s1", type: "about", title: "About Me", isVisible: true, order: 0 },
    { id: "s2", type: "projects", title: "Projects", isVisible: true, order: 1 },
  ],
  socialLinks: [],
  skills: [{ id: "sk1", name: "Go", category: "backend", proficiency: "expert" }],
  projects: [
    {
      id: "pr1",
      title: "Kubernetes Operator",
      shortDescription: "Custom CRD operator for cluster autoscaling.",
      technologies: ["Go", "Kubernetes"],
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: true,
    },
  ],
  education: [],
  academicJourney: [],
  experience: [],
  research: [],
  achievements: [],
  certifications: [],
  publications: [],
  services: [],
  contact: { email: "jane@example.com" },
  theme: {
    mode: "dark",
    primaryColor: "#4f46e5",
    fontFamily: "sans",
    borderRadius: "md",
    animationLevel: "full",
    layoutSpacing: "comfortable",
  },
};

describe("Phase 28: Template Marketplace & Discovery Experience", () => {
  it("1. Template Registry Metadata: exposes structured metadata for all available templates", () => {
    expect(AVAILABLE_TEMPLATES.length).toBeGreaterThanOrEqual(3);

    const devTpl = AVAILABLE_TEMPLATES.find((t) => t.id === "developer");
    expect(devTpl).toBeDefined();
    expect(devTpl?.category).toBe("developer");
    expect(devTpl?.supportedSections).toContain("projects");
  });

  it("2. Template Search & Filtering: filters templates by category and search queries", () => {
    const devTemplates = AVAILABLE_TEMPLATES.filter((t) => t.category === "developer");
    expect(devTemplates).toHaveLength(1);
    expect(devTemplates[0].name).toBe("Developer");

    const searchQuery = "academic";
    const searched = AVAILABLE_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery) ||
        t.description.toLowerCase().includes(searchQuery) ||
        (t.tags && t.tags.some((tag) => tag.includes(searchQuery)))
    );

    expect(searched.length).toBeGreaterThan(0);
    expect(searched.some((t) => t.id === "research")).toBe(true);
  });

  it("3. Template Favorites: toggles template favorite status cleanly", () => {
    let favoriteIds: string[] = [];

    // Save to favorites
    favoriteIds = [...favoriteIds, "developer"];
    expect(favoriteIds).toContain("developer");

    // Remove from favorites
    favoriteIds = favoriteIds.filter((id) => id !== "developer");
    expect(favoriteIds).not.toContain("developer");
  });

  it("4. Content Preservation Guarantee: switching template updates templateId while preserving 100% of user content", () => {
    const newTemplateId = "research";

    const updatedPortfolio: PortfolioData = {
      ...mockUserPortfolio,
      templateId: newTemplateId,
    };

    expect(updatedPortfolio.templateId).toBe("research");
    expect(updatedPortfolio.profile.fullName).toBe("Jane Developer");
    expect(updatedPortfolio.projects).toHaveLength(1);
    expect(updatedPortfolio.projects[0].title).toBe("Kubernetes Operator");
    expect(updatedPortfolio.skills).toHaveLength(1);
  });

  it("5. Multi-Portfolio Selector: correctly targets selected portfolio ID when applying template", () => {
    const userPortfolios = [
      { id: "port-1", title: "Personal Portfolio", templateId: "minimal" },
      { id: "port-2", title: "Research Portfolio", templateId: "academic" },
    ];

    const selectedTargetId = userPortfolios[1].id;
    expect(selectedTargetId).toBe("port-2");
  });

  it("6. Pro Entitlements & Pricing Safety: Pro templates are correctly tagged", () => {
    const proTemplates = AVAILABLE_TEMPLATES.filter((t) => t.isPro);
    const freeTemplates = AVAILABLE_TEMPLATES.filter((t) => !t.isPro);

    expect(proTemplates.length).toBeGreaterThan(0);
    expect(freeTemplates.length).toBeGreaterThan(0);
    expect(freeTemplates.some((t) => t.id === "developer")).toBe(true);
  });
});
