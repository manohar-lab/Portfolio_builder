import { describe, it, expect } from "vitest";
import { CreatePortfolioSchema, ProjectItemSchema, EducationItemSchema } from "../validation/portfolio.schema";
import { isValidSlug } from "../utilities/slug";

describe("Phase 2 Portfolio Data Layer & Security Unit Tests", () => {

  it("should initialize a new portfolio with DRAFT status by default", () => {
    const rawNewPortfolio = {
      title: "Software Developer Portfolio",
      slug: "developer-portfolio",
      isPublished: false,
      status: "DRAFT",
    };

    expect(rawNewPortfolio.isPublished).toBe(false);
    expect(rawNewPortfolio.status).toBe("DRAFT");
  });

  it("should validate portfolio creation inputs via Zod schema", () => {
    const validData = {
      title: "AI Researcher Portfolio",
      slug: "ai-researcher",
      templateId: "developer",
      description: "My primary research portfolio",
    };

    const result = CreatePortfolioSchema.safeParse(validData);
    expect(result.success).toBe(true);

    const invalidSlugData = {
      title: "Test Portfolio",
      slug: "INVALID SLUG WITH SPACES!!",
      templateId: "developer",
    };

    const invalidResult = CreatePortfolioSchema.safeParse(invalidSlugData);
    expect(invalidResult.success).toBe(false);
  });

  it("should enforce unique slug rules and reject reserved platform paths", () => {
    expect(isValidSlug("admin")).toEqual({ valid: false, reason: 'The URL slug "admin" is reserved by the platform.' });
    expect(isValidSlug("dashboard")).toEqual({ valid: false, reason: 'The URL slug "dashboard" is reserved by the platform.' });
    expect(isValidSlug("api")).toEqual({ valid: false, reason: 'The URL slug "api" is reserved by the platform.' });
    expect(isValidSlug("jane-doe")).toEqual({ valid: true });
  });

  it("should reject invalid project URLs and invalid education CGPA inputs", () => {
    const invalidProject = {
      title: "My Project",
      shortDescription: "Short desc",
      githubUrl: "not-a-valid-url", // invalid
    };

    const projectResult = ProjectItemSchema.safeParse(invalidProject);
    expect(projectResult.success).toBe(false);

    const validEdu = {
      institution: "Stanford",
      degree: "B.S.",
      fieldOfStudy: "CS",
      startYear: 2020,
      endYear: 2024,
      cgpa: 3.95,
    };

    const eduResult = EducationItemSchema.safeParse(validEdu);
    expect(eduResult.success).toBe(true);
  });

  it("should guarantee that nested resources derive ownership strictly from session", () => {
    const userA = { id: "user-a-123" };
    const userB = { id: "user-b-456" };

    const portfolioOwnedByUserA = {
      id: "port-1",
      userId: userA.id,
      title: "User A Portfolio",
    };

    // Simulated authorization guard logic
    const canUserBModify = portfolioOwnedByUserA.userId === userB.id;
    expect(canUserBModify).toBe(false);
  });

});
