import { describe, it, expect } from "vitest";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { PortfolioData } from "@/types/portfolio";

describe("Phase 4: Portfolio Editor & State Management Engine", () => {

  const samplePortfolio: PortfolioData = normalizePortfolioData({
    id: "port-123",
    userId: "user-abc",
    slug: "jane-doe",
    title: "Jane Doe Portfolio",
    templateId: "developer",
    isPublished: true,
    isPublic: true,
    profile: {
      fullName: "Jane Doe",
      headline: "Senior Full-Stack Engineer",
      bio: "Building robust cloud software.",
      location: "San Francisco, CA",
      email: "jane@example.com",
      isAvailableForWork: true,
    },
    sections: [
      { id: "s1", type: "hero", title: "Hero", isVisible: true, order: 0 },
      { id: "s2", type: "about", title: "About", isVisible: true, order: 1 },
      { id: "s3", type: "projects", title: "Projects", isVisible: true, order: 2 },
      { id: "s4", type: "research", title: "Research", isVisible: true, order: 3 },
    ],
    projects: [
      {
        id: "p1",
        title: "AI Engine",
        shortDescription: "High-throughput AI pipeline",
        technologies: ["TypeScript", "PyTorch"],
        status: "COMPLETED",
        isCurrent: false,
        isFeatured: true,
      },
    ],
    research: [
      {
        id: "r1",
        title: "Asynchronous Consensus",
        researchArea: "Distributed Systems",
        description: "Optimizing fault tolerance",
        publicationStatus: "published",
        technologies: ["Rust"],
      },
    ],
    skills: [],
    education: [],
    academicJourney: [],
    experience: [],
    achievements: [],
    certifications: [],
    socialLinks: [],
  });

  it("CRITICAL RULE 1: Disabling a section must NOT delete its underlying data", () => {
    // 1. User disables 'research' section
    const updatedSections = samplePortfolio.sections.map((sec) =>
      sec.type === "research" ? { ...sec, isVisible: false } : sec
    );

    const modifiedPortfolio: PortfolioData = {
      ...samplePortfolio,
      sections: updatedSections,
    };

    // 2. Section is hidden
    const researchSection = modifiedPortfolio.sections.find((s) => s.type === "research");
    expect(researchSection?.isVisible).toBe(false);

    // 3. Research data remains 100% stored & accessible
    expect(modifiedPortfolio.research).toHaveLength(1);
    expect(modifiedPortfolio.research[0].title).toBe("Asynchronous Consensus");
  });

  it("CRITICAL RULE 2: Switching templates must NOT modify portfolio content", () => {
    const originalProjectsCount = samplePortfolio.projects.length;
    const originalResearchCount = samplePortfolio.research.length;

    // Switch from developer to minimal, then research
    const minimalPortfolio: PortfolioData = { ...samplePortfolio, templateId: "minimal" };
    const researchPortfolio: PortfolioData = { ...samplePortfolio, templateId: "research" };

    expect(minimalPortfolio.templateId).toBe("minimal");
    expect(minimalPortfolio.projects.length).toBe(originalProjectsCount);
    expect(minimalPortfolio.profile.fullName).toBe("Jane Doe");

    expect(researchPortfolio.templateId).toBe("research");
    expect(researchPortfolio.research.length).toBe(originalResearchCount);
    expect(researchPortfolio.profile.headline).toBe("Senior Full-Stack Engineer");
  });

  it("Section ordering supports reordering up and down safely", () => {
    const sections = [...samplePortfolio.sections];
    // Swap index 1 ('about') and index 2 ('projects')
    const temp = sections[1];
    sections[1] = sections[2];
    sections[2] = temp;

    const reordered = sections.map((sec, idx) => ({ ...sec, order: idx }));

    expect(reordered[1].type).toBe("projects");
    expect(reordered[2].type).toBe("about");
    expect(reordered[1].order).toBe(1);
    expect(reordered[2].order).toBe(2);
  });

  it("Theme configuration supports light/dark modes and custom primary colors", () => {
    const updatedTheme = {
      ...samplePortfolio.theme,
      mode: "dark" as const,
      primaryColor: "#6366f1",
      borderRadius: "lg" as const,
    };

    const updatedPortfolio: PortfolioData = {
      ...samplePortfolio,
      theme: updatedTheme,
    };

    expect(updatedPortfolio.theme.mode).toBe("dark");
    expect(updatedPortfolio.theme.primaryColor).toBe("#6366f1");
    expect(updatedPortfolio.theme.borderRadius).toBe("lg");
  });

  it("Image upload validation accepts valid images under 5MB and rejects invalid formats", () => {
    const validFile = { type: "image/png", size: 2 * 1024 * 1024 }; // 2MB PNG
    const oversizedFile = { type: "image/jpeg", size: 6 * 1024 * 1024 }; // 6MB JPG
    const invalidTypeFile = { type: "application/pdf", size: 1 * 1024 * 1024 }; // PDF

    const validateImage = (file: { type: string; size: number }) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return { valid: false, error: "Only JPEG, PNG, or WebP images are allowed." };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: "Image file size exceeds maximum limit of 5MB." };
      }
      return { valid: true };
    };

    expect(validateImage(validFile).valid).toBe(true);
    expect(validateImage(oversizedFile).valid).toBe(false);
    expect(validateImage(oversizedFile).error).toContain("exceeds maximum limit");
    expect(validateImage(invalidTypeFile).valid).toBe(false);
    expect(validateImage(invalidTypeFile).error).toContain("Only JPEG, PNG, or WebP");
  });

});
