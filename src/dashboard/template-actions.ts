"use server";

import { getAuthenticatedUser } from "@/auth/service";
import { TemplateRegistryService } from "@/services/template-registry-service";
import { TemplateMetadata, TemplateQueryParams } from "@/types/template";
import { revalidatePath } from "next/cache";

export interface TemplateActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Switch portfolio template safely while preserving 100% of portfolio data
 */
export async function switchTemplateAction(
  portfolioId: string,
  targetTemplateId: string
): Promise<TemplateActionResult<{ templateId: string }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const { BillingService } = await import("@/services/billing-service");
    const billingService = new BillingService();
    const sub = await billingService.getUserSubscription(auth.authUser.id);
    const userTier = sub.plan === "pro" ? "pro" : "free";

    const registryService = new TemplateRegistryService();
    const res = await registryService.switchPortfolioTemplate(portfolioId, auth.authUser.id, targetTemplateId, userTier);

    if (!res.success) {
      return { success: false, error: res.error || "Failed to switch template" };
    }

    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);
    revalidatePath("/templates");

    return { success: true, data: { templateId: targetTemplateId } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to switch template";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Fetch Active Templates metadata
 */
export async function getActiveTemplatesAction(
  params: TemplateQueryParams = {}
): Promise<TemplateActionResult<TemplateMetadata[]>> {
  try {
    const registryService = new TemplateRegistryService();
    const templates = registryService.getActiveTemplates(params);
    return { success: true, data: templates };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch active templates";
    return { success: false, error: msg };
  }
}
