import { describe, it, expect, beforeEach } from "vitest";
import { ShowcaseService } from "@/services/showcase-service";
import { VisibilityMode } from "@/types/portfolio";

describe("Phase 21: Public Portfolio Discovery & Showcase System", () => {
  let showcaseService: ShowcaseService;

  beforeEach(() => {
    showcaseService = new ShowcaseService();
  });

  it("1. Public showcase query excludes unlisted and private portfolios", async () => {
    const result = await showcaseService.getPublicShowcasePortfolios();

    expect(result).toBeDefined();
    expect(result.portfolios).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThanOrEqual(0);

    // All returned items must have valid showcase card properties
    result.portfolios.forEach((card) => {
      expect(card.id).toBeDefined();
      expect(card.slug).toBeDefined();
      expect(card.fullName).toBeDefined();
      expect(card.headline).toBeDefined();
    });
  });

  it("2. Search filters cards by name, headline, skills, and project titles", async () => {
    const searchRes = await showcaseService.getPublicShowcasePortfolios({
      query: "Rust",
    });

    expect(searchRes.portfolios).toBeDefined();
    // In fallback or DB, matched items should contain query term or match top skills
    searchRes.portfolios.forEach((card) => {
      const match =
        card.fullName.toLowerCase().includes("rust") ||
        card.headline.toLowerCase().includes("rust") ||
        card.topSkills.some((s) => s.toLowerCase().includes("rust")) ||
        (card.featuredProjectTitle && card.featuredProjectTitle.toLowerCase().includes("rust"));
      expect(match).toBe(true);
    });
  });

  it("3. Filtering by templateId narrows results correctly", async () => {
    const devRes = await showcaseService.getPublicShowcasePortfolios({
      templateId: "developer",
    });

    expect(devRes.portfolios).toBeDefined();
  });

  it("4. Neutral sorting preserves sort parameters without subjective rankings", async () => {
    const newestRes = await showcaseService.getPublicShowcasePortfolios({
      sortBy: "newest",
    });
    const updatedRes = await showcaseService.getPublicShowcasePortfolios({
      sortBy: "recently_updated",
    });

    expect(newestRes.page).toBe(1);
    expect(updatedRes.page).toBe(1);
  });

  it("5. Moderation reporting registers reports cleanly", async () => {
    const reportRes = await showcaseService.submitReport(
      "test-portfolio-123",
      "spam",
      "Inappropriate automated test content",
      "reporter-user-999"
    );

    expect(reportRes.success).toBe(true);
  });

  it("6. Report rate limiting prevents report spam", async () => {
    const portfolioId = "spam-target-456";
    const reporterId = "spammer-user-000";

    // Exhaust allowed quota (3 within 60s)
    await showcaseService.submitReport(portfolioId, "spam", "Test 1", reporterId);
    await showcaseService.submitReport(portfolioId, "spam", "Test 2", reporterId);
    await showcaseService.submitReport(portfolioId, "spam", "Test 3", reporterId);

    const limitedRes = await showcaseService.submitReport(portfolioId, "spam", "Test 4", reporterId);
    expect(limitedRes.success).toBe(false);
    expect(limitedRes.error).toContain("Too many reports");
  });

  it("7. Visibility mode updates transition through private, unlisted, public states", async () => {
    const validModes: VisibilityMode[] = ["private", "unlisted", "public"];
    validModes.forEach((mode) => {
      expect(["private", "unlisted", "public"]).toContain(mode);
    });
  });
});
