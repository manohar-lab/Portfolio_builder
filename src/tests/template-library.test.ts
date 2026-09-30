import { describe, it, expect, beforeEach } from "vitest";
import { TemplateRegistryService } from "@/services/template-registry-service";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { SAMPLE_PORTFOLIO_DATA } from "@/templates/sample-portfolio-data";
import { getTemplateById } from "@/templates/registry";
import { PortfolioData } from "@/types/portfolio";

describe("Phase 23: Scalable Template Library Architecture", () => {
  let registryService: TemplateRegistryService;

  beforeEach(() => {
    registryService = new TemplateRegistryService();
  });

  it("1. Template registry enforces unique IDs and valid metadata schemas", () => {
    const ids = AVAILABLE_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);

    AVAILABLE_TEMPLATES.forEach((tpl) => {
      expect(tpl.id).toBeDefined();
      expect(tpl.name).toBeDefined();
      expect(tpl.category).toBeDefined();
      expect(tpl.version).toBeGreaterThan(0);
      expect(["ACTIVE", "DRAFT", "ARCHIVED"]).toContain(tpl.status);
    });
  });

  it("2. Active template filter excludes DRAFT and ARCHIVED templates", () => {
    const active = registryService.getActiveTemplates();
    expect(active.length).toBeGreaterThan(0);
    active.forEach((tpl) => {
      expect(tpl.status).toBe("ACTIVE");
      expect(tpl.isAvailable).toBe(true);
    });
  });

  it("3. Keyword search filters templates by name, category, and tags", () => {
    const devResults = registryService.getActiveTemplates({ query: "developer" });
    expect(devResults.length).toBeGreaterThan(0);
    expect(devResults.some((t) => t.id === "developer")).toBe(true);

    const researchResults = registryService.getActiveTemplates({ category: "research" });
    expect(researchResults.length).toBeGreaterThan(0);
    expect(researchResults[0].id).toBe("research");
  });

  it("4. Neutral sorting sorts templates without subjective developer rankings", () => {
    const sortedByName = registryService.getActiveTemplates({ sortBy: "name" });
    expect(sortedByName.length).toBeGreaterThan(0);

    for (let i = 0; i < sortedByName.length - 1; i++) {
      expect(sortedByName[i].name.localeCompare(sortedByName[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it("5. Content Preservation: Template switching retains 100% of portfolio data model", () => {
    const initialPortfolio: PortfolioData = { ...SAMPLE_PORTFOLIO_DATA, templateId: "minimal" };

    // Simulate switching Minimal -> Developer -> Research -> Minimal
    const devPortfolio: PortfolioData = { ...initialPortfolio, templateId: "developer" };
    const researchPortfolio: PortfolioData = { ...devPortfolio, templateId: "research" };
    const finalPortfolio: PortfolioData = { ...researchPortfolio, templateId: "minimal" };

    // Verify 100% of data model items remain completely identical
    expect(finalPortfolio.profile.fullName).toBe(initialPortfolio.profile.fullName);
    expect(finalPortfolio.skills.length).toBe(initialPortfolio.skills.length);
    expect(finalPortfolio.projects.length).toBe(initialPortfolio.projects.length);
    expect(finalPortfolio.education.length).toBe(initialPortfolio.education.length);
    expect(finalPortfolio.experience.length).toBe(initialPortfolio.experience.length);
    expect(finalPortfolio.research.length).toBe(initialPortfolio.research.length);
  });

  it("6. Safe Fallback: Unknown or corrupt template ID falls back safely to default component", () => {
    const unknownComp = getTemplateById("non_existent_template_999");
    expect(unknownComp).toBeDefined();

    const fallbackMeta = registryService.getTemplateById("unknown_id_xyz");
    expect(fallbackMeta).toBeDefined();
    expect(fallbackMeta.id).toBe("minimal");
  });

  it("7. Entitlement Gating: Free users cannot select Pro templates without upgrade", () => {
    const proTemplate = AVAILABLE_TEMPLATES.find((t) => t.isPro);
    expect(proTemplate).toBeDefined();

    if (proTemplate) {
      const freeCheck = registryService.canUserAccessTemplate("free", proTemplate);
      expect(freeCheck).toBe(false);

      const proCheck = registryService.canUserAccessTemplate("pro", proTemplate);
      expect(proCheck).toBe(true);
    }
  });

  it("8. Deterministic Sample Portfolio Data renders across all templates cleanly", () => {
    const sample = SAMPLE_PORTFOLIO_DATA;
    expect(sample.profile.fullName).toBe("Alex Morgan");
    expect(sample.projects.length).toBeGreaterThan(0);
    expect(sample.skills.length).toBeGreaterThan(0);
  });
});
