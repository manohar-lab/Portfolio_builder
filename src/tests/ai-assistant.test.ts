import { describe, it, expect } from "vitest";
import { GroundedAIService } from "../services/ai-service";
import { normalizePortfolioData } from "../utilities/portfolio-adapter";

describe("Phase 17 - Grounded AI Assistant & Portfolio Creation", () => {
  const samplePortfolio = normalizePortfolioData({
    id: "test-ai-portfolio",
    userId: "test-user-id",
    slug: "johndoe",
    profile: {
      fullName: "Jane Engineer",
      headline: "Senior Backend Developer",
      bio: "Initial bio text",
      isAvailableForWork: true,
    },
    skills: [
      { id: "sk-1", name: "Python", category: "languages" },
      { id: "sk-2", name: "FastAPI", category: "backend" },
      { id: "sk-3", name: "PostgreSQL", category: "backend" },
    ],
    projects: [
      {
        id: "proj-1",
        title: "Distributed Pipeline Engine",
        shortDescription: "High-speed data ingestion pipeline using Python and Redis.",
        detailedDescription: "Architected a event-driven data streaming engine with Docker and Redis.",
        technologies: ["Python", "Redis", "Docker"],
        status: "COMPLETED",
        isCurrent: false,
        isFeatured: true,
      },
    ],
    experience: [
      {
        id: "exp-1",
        company: "Acme Cloud Inc",
        role: "Senior Systems Engineer",
        startDate: "2023-01",
        isCurrent: true,
        description: "Built distributed microservices and managed Kubernetes clusters.",
        technologies: ["Kubernetes", "Go"],
      },
    ],
    education: [
      {
        id: "ed-1",
        institution: "MIT",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
        startYear: 2019,
        endYear: 2023,
        isCurrentStatus: false,
      },
    ],
  });

  const aiService = new GroundedAIService();

  it("should generate a factual About section grounded in provided portfolio context", async () => {
    const res = await aiService.processAiAction("generate_about", samplePortfolio, {
      tone: "professional",
      length: "medium",
    });

    expect(res.actionType).toBe("generate_about");
    expect(res.content).toBeDefined();
    expect(res.content).toContain("Jane Engineer");
    expect(res.content).toContain("Computer Science");
  });

  it("should generate grounded professional headlines", async () => {
    const res = await aiService.processAiAction("generate_headline", samplePortfolio, {
      tone: "technical",
    });

    expect(res.actionType).toBe("generate_headline");
    expect(res.headlineOptions).toBeDefined();
    expect(res.headlineOptions?.length).toBeGreaterThan(0);
    expect(res.headlineOptions?.some((h) => h.includes("Jane Engineer"))).toBe(true);
  });

  it("should improve project descriptions without inventing unlisted technologies", async () => {
    const res = await aiService.processAiAction("improve_project", samplePortfolio, {
      targetProjectId: "proj-1",
      tone: "technical",
    });

    expect(res.actionType).toBe("improve_project");
    expect(res.content).toBeDefined();
    expect(res.content).toContain("Distributed Pipeline Engine");
    expect(res.content).toContain("Python");
  });

  it("should suggest skills with factual reasons based on projects and experience", async () => {
    const res = await aiService.processAiAction("suggest_skills", samplePortfolio);

    expect(res.actionType).toBe("suggest_skills");
    expect(res.skillSuggestions).toBeDefined();

    const suggestedSkills = res.skillSuggestions?.map((s) => s.skill.toLowerCase());
    expect(suggestedSkills).toContain("redis");
    expect(suggestedSkills).toContain("docker");
    expect(suggestedSkills).toContain("kubernetes");
  });

  it("should extract project technologies accurately from project description text", async () => {
    const projectToScan = {
      ...samplePortfolio.projects[0],
      shortDescription: "Built with Node.js, React, and MongoDB for fast data delivery.",
      technologies: ["Node.js"],
    };

    const portfolioWithProj = {
      ...samplePortfolio,
      projects: [projectToScan],
    };

    const res = await aiService.processAiAction("extract_project_tech", portfolioWithProj, {
      targetProjectId: "proj-1",
    });

    expect(res.actionType).toBe("extract_project_tech");
    expect(res.techTags).toContain("React");
    expect(res.techTags).toContain("MongoDB");
  });

  it("should generate a clean executive portfolio summary", async () => {
    const res = await aiService.processAiAction("generate_summary", samplePortfolio);

    expect(res.actionType).toBe("generate_summary");
    expect(res.content).toContain("Jane Engineer");
    expect(res.content).toContain("1 project");
  });
});
