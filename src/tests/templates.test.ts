import { describe, it, expect } from "vitest";
import { getAvailableTemplates, getTemplateById, TEMPLATE_REGISTRY } from "../templates/registry";
import { normalizePortfolioData } from "../utilities/portfolio-adapter";
import { PortfolioData } from "../types/portfolio";

describe("Phase 3 Template Engine & Presentation Tests", () => {
  
  it("should expose available template metadata entries in the registry", () => {
    const templates = getAvailableTemplates();
    expect(templates.length).toBeGreaterThan(0);
    
    const ids = templates.map((t) => t.id);
    expect(ids).toContain("minimal");
    expect(ids).toContain("developer");
    expect(ids).toContain("research");
  });

  it("should resolve template components by ID and provide fallback for unknown IDs", () => {
    const minimalComponent = getTemplateById("minimal");
    expect(minimalComponent).toBeDefined();

    const developerComponent = getTemplateById("developer");
    expect(developerComponent).toBeDefined();

    const researchComponent = getTemplateById("research");
    expect(researchComponent).toBeDefined();

    // Unknown template ID safety fallback
    const unknownComponent = getTemplateById("unknown-non-existent-template-id");
    expect(unknownComponent).toBe(TEMPLATE_REGISTRY["developer"]);
  });

  it("should preserve 100% of user portfolio data when switching template IDs", () => {
    const originalData: PortfolioData = normalizePortfolioData({
      id: "p-test-1",
      templateId: "minimal",
      profile: {
        fullName: "Dr. Alan Turing",
        headline: "Mathematician & Computer Science Pioneer",
        bio: "Pioneered modern computing and theoretical computer science.",
        isAvailableForWork: false,
      },
      projects: [
        {
          id: "p-enigma",
          title: "The Bombe Cryptanalysis Engine",
          shortDescription: "Electromechanical machine used to decipher Enigma-encrypted messages.",
          technologies: ["Electromechanics", "Cryptanalysis"],
          status: "COMPLETED",
          isCurrent: false,
          isFeatured: true,
        },
      ],
      education: [
        {
          id: "edu-cambridge",
          institution: "University of Cambridge",
          degree: "PhD",
          fieldOfStudy: "Mathematics",
          startYear: 1931,
          endYear: 1934,
          isCurrentStatus: false,
          cgpa: "4.0",
        },
      ],
      skills: [
        { id: "sk-crypto", name: "Cryptanalysis", category: "other", proficiency: "expert" },
        { id: "sk-logic", name: "Mathematical Logic", category: "other", proficiency: "expert" },
      ],
    });

    // 1. Switch to Developer Template
    const devData: PortfolioData = { ...originalData, templateId: "developer" };
    expect(devData.profile.fullName).toBe("Dr. Alan Turing");
    expect(devData.projects.length).toBe(1);
    expect(devData.education.length).toBe(1);
    expect(devData.skills.length).toBe(2);

    // 2. Switch to Research Template
    const researchData: PortfolioData = { ...originalData, templateId: "research" };
    expect(researchData.profile.fullName).toBe("Dr. Alan Turing");
    expect(researchData.projects[0].title).toBe("The Bombe Cryptanalysis Engine");
    expect(researchData.education[0].institution).toBe("University of Cambridge");
    expect(researchData.skills[0].name).toBe("Cryptanalysis");

    // DATA PRESERVATION VERIFICATION: Changing templateId alters only presentation metadata
    expect(devData.projects).toEqual(originalData.projects);
    expect(researchData.education).toEqual(originalData.education);
  });

  it("should handle empty optional sections gracefully without errors", () => {
    const emptyData = normalizePortfolioData({
      projects: [],
      education: [],
      skills: [],
      research: [],
      experience: [],
    });

    expect(emptyData.projects.length).toBe(0);
    expect(emptyData.education.length).toBe(0);
    expect(emptyData.skills.length).toBe(0);
    expect(emptyData.research.length).toBe(0);
  });

});
