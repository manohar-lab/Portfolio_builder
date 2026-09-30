import { createClient } from "@/auth/server";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { TemplateMetadata, TemplateQueryParams, TemplateSortOption } from "@/types/template";
import { trackAnalyticsEvent } from "@/services/analytics-service";

/**
 * Server-Side Template Registry Service
 */
export class TemplateRegistryService {
  /**
   * Retrieves active templates with optional search, category filter, and neutral sorting.
   * STRICT FILTER GUARD: Only templates with status === 'ACTIVE' and isAvailable === true are returned to normal users.
   */
  getActiveTemplates(params: TemplateQueryParams = {}): TemplateMetadata[] {
    let templates = AVAILABLE_TEMPLATES.filter((t) => t.status === "ACTIVE" && t.isAvailable);

    // Filter by Category
    if (params.category && params.category !== "all") {
      const cat = params.category.toLowerCase().trim();
      templates = templates.filter(
        (t) => t.category.toLowerCase() === cat || (t.tags && t.tags.some((tag) => tag.toLowerCase() === cat))
      );
    }

    // Search Query (name, description, category, tags)
    if (params.query && params.query.trim() !== "") {
      const q = params.query.toLowerCase().trim();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // Neutral Sorting
    const sortBy: TemplateSortOption = params.sortBy || "newest";
    if (sortBy === "name") {
      templates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "recently_updated") {
      templates.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    } else {
      // Default newest
      templates.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return templates;
  }

  /**
   * Retrieves single template metadata by ID or fallback
   */
  getTemplateById(id: string): TemplateMetadata {
    const found = AVAILABLE_TEMPLATES.find((t) => t.id === id || t.slug === id);
    if (found) return found;

    // Fallback template metadata
    return (
      AVAILABLE_TEMPLATES.find((t) => t.id === "minimal") || {
        id: "minimal",
        name: "Minimal",
        slug: "minimal",
        description: "Standard clean fallback layout",
        category: "minimal",
        thumbnailUrl: "/templates/minimal-preview.png",
        version: 1,
        status: "ACTIVE",
        isAvailable: true,
        isPro: false,
      }
    );
  }

  /**
   * Server-Side Entitlement Check: Verifies if user tier can access template
   */
  canUserAccessTemplate(userTier: "free" | "pro" = "free", template: TemplateMetadata): boolean {
    if (!template.isPro) return true;
    return userTier === "pro";
  }

  /**
   * Switches portfolio template while preserving 100% of portfolio content
   */
  async switchPortfolioTemplate(
    portfolioId: string,
    userId: string,
    targetTemplateId: string,
    userTier: "free" | "pro" = "free"
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.getTemplateById(targetTemplateId);

    // Entitlement Check
    if (!this.canUserAccessTemplate(userTier, template)) {
      return {
        success: false,
        error: `The '${template.name}' template is a Pro feature. Please upgrade to Pro to unlock this template.`,
      };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: portfolio, error: fetchErr } = await supabase
      .from("portfolios")
      .select("id, user_id, template_id")
      .eq("id", portfolioId)
      .single();

    if (fetchErr || !portfolio || portfolio.user_id !== userId) {
      return { success: false, error: "Portfolio not found or access denied." };
    }

    const previousTemplateId = portfolio.template_id;

    // Update template_id (CONTENT PRESERVATION: Only presentation template_id is mutated)
    const { error: updateErr } = await supabase
      .from("portfolios")
      .update({
        template_id: template.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", portfolioId)
      .eq("user_id", userId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Analytics tracking
    await trackAnalyticsEvent("template_selected", {
      userId,
      portfolioId,
      metadata: { previousTemplateId, targetTemplateId: template.id },
    });

    return { success: true };
  }
}
