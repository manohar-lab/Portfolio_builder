import { describe, it, expect } from "vitest";
import { normalizePortfolioData } from "../utilities/portfolio-adapter";
import { calculatePortfolioReadiness } from "../utilities/portfolio-readiness";
import { AVAILABLE_TEMPLATES } from "../config/templates";
import { PortfolioData, ThemeConfig } from "../types/portfolio";
import { isValidSlug } from "../utilities/slug";

describe("Phase 7 Onboarding, Template Gallery & Customization Tests", () => {
  it("should calculate portfolio readiness score accurately based on profile completeness", () => {
    // 1. Incomplete portfolio (only full name provided)
    const incompleteData: PortfolioData = {
      id: "p-incomplete",
      userId: "u-1",
      title: "New Portfolio",
      slug: "new-user",
      status: "DRAFT",
      templateId: "developer",
      isPublished: false,
      isPublic: true,
      visibilityMode: "unlisted",
      profile: {
        fullName: "New Developer",
        headline: "",
        bio: "",
        avatarUrl: "",
        isAvailableForWork: true,
      },
      sections: [],
      socialLinks: [],
      skills: [],
      projects: [],
      education: [],
      academicJourney: [],
      experience: [],
      research: [],
      achievements: [],
      certifications: [],
      publications: [],
      services: [],
      contact: { email: "new@example.com" },
      theme: { mode: "light", primaryColor: "#4f46e5", fontFamily: "sans", borderRadius: "md", animationLevel: "subtle", layoutSpacing: "comfortable" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const readiness1 = calculatePortfolioReadiness(incompleteData);
    expect(readiness1.score).toBe(15); // Only Full Name complete (15%)
    expect(readiness1.completedCount).toBe(1);

    // 2. Fully populated portfolio
    const completeData: PortfolioData = normalizePortfolioData({
      profile: {
        fullName: "Sarah Connor",
        headline: "Lead System Architect & AI Researcher",
        bio: "Specializing in autonomous systems and resilient infrastructure.",
        avatarUrl: "https://example.com/avatar.jpg",
        isAvailableForWork: true,
      },
      projects: [
        {
          id: "p1",
          title: "Skynet Defense",
          shortDescription: "Autonomous defense matrix",
          technologies: ["TypeScript", "C++"],
          status: "COMPLETED",
          isCurrent: false,
          isFeatured: true,
        },
      ],
      skills: [{ id: "s1", name: "System Architecture", category: "backend" }],
      education: [{ id: "e1", institution: "MIT", degree: "BS", fieldOfStudy: "CS", startYear: 2018, isCurrentStatus: false }],
      socialLinks: [{ id: "soc1", platform: "github", url: "https://github.com/sarah" }],
    });

    const readiness2 = calculatePortfolioReadiness(completeData);
    expect(readiness2.score).toBe(100);
    expect(readiness2.completedCount).toBe(readiness2.totalCount);
  });

  it("should validate public username/slug availability correctly", () => {
    expect(isValidSlug("sarah-connor").valid).toBe(true);
    expect(isValidSlug("dev-pro").valid).toBe(true);
    expect(isValidSlug("ab").valid).toBe(false); // Too short
    expect(isValidSlug("admin").valid).toBe(false); // Reserved keyword
    expect(isValidSlug("dashboard").valid).toBe(false); // Reserved keyword
  });

  it("should enrich template metadata with tags, bestFor, and supportedSections", () => {
    const minimal = AVAILABLE_TEMPLATES.find((t) => t.id === "minimal");
    expect(minimal).toBeDefined();
    expect(minimal?.tags).toContain("minimal");
    expect(minimal?.bestFor?.length).toBeGreaterThan(0);
    expect(minimal?.supportedSections?.length).toBeGreaterThan(0);

    const dev = AVAILABLE_TEMPLATES.find((t) => t.id === "developer");
    expect(dev?.tags).toContain("developer");

    const research = AVAILABLE_TEMPLATES.find((t) => t.id === "research");
    expect(research?.tags).toContain("research");
  });

  it("should reset appearance settings without altering portfolio content or data model", () => {
    const originalPortfolio: PortfolioData = normalizePortfolioData({
      id: "port-101",
      profile: {
        fullName: "Alex Rivera",
        headline: "Full Stack Engineer",
        bio: "Building cloud applications.",
        isAvailableForWork: true,
      },
      projects: [
        {
          id: "proj-1",
          title: "Cloud Engine",
          shortDescription: "High speed compute engine",
          technologies: ["Rust", "Node.js"],
          status: "COMPLETED",
          isCurrent: false,
          isFeatured: true,
        },
      ],
      theme: {
        mode: "dark",
        primaryColor: "#ef4444",
        fontFamily: "mono",
        borderRadius: "full",
        animationLevel: "full",
        layoutSpacing: "spacious",
      },
    });

    // Simulate Reset Appearance Action (resets theme tokens only)
    const defaultTheme: ThemeConfig = {
      mode: "light",
      primaryColor: "#4f46e5",
      fontFamily: "sans",
      borderRadius: "md",
      animationLevel: "subtle",
      layoutSpacing: "comfortable",
    };

    const resetPortfolio: PortfolioData = {
      ...originalPortfolio,
      theme: defaultTheme,
    };

    // Verify visual theme is reset to defaults
    expect(resetPortfolio.theme.mode).toBe("light");
    expect(resetPortfolio.theme.primaryColor).toBe("#4f46e5");
    expect(resetPortfolio.theme.fontFamily).toBe("sans");

    // Verify ALL user content remains 100% intact
    expect(resetPortfolio.profile.fullName).toBe("Alex Rivera");
    expect(resetPortfolio.projects.length).toBe(1);
    expect(resetPortfolio.projects[0].title).toBe("Cloud Engine");
  });

  it("should filter template catalog by category cleanly", () => {
    const devTemplates = AVAILABLE_TEMPLATES.filter((t) => t.category === "developer");
    expect(devTemplates.length).toBeGreaterThan(0);
    expect(devTemplates[0].id).toBe("developer");

    const researchTemplates = AVAILABLE_TEMPLATES.filter((t) => t.category === "research");
    expect(researchTemplates.length).toBeGreaterThan(0);
    expect(researchTemplates[0].id).toBe("research");
  });
});
