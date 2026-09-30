"use server";

import { getAuthenticatedUser } from "@/auth/service";
import { createClient } from "@/auth/server";
import { CustomizationConfig } from "@/types/customization";
import { DEFAULT_CUSTOMIZATION } from "@/config/customization-presets";
import { isValidHexColor } from "@/utilities/contrast-checker";
import { trackAnalyticsEvent } from "@/services/analytics-service";
import { revalidatePath } from "next/cache";

export interface CustomizationActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to save portfolio visual customization settings
 */
export async function savePortfolioCustomizationAction(
  portfolioId: string,
  config: CustomizationConfig
): Promise<CustomizationActionResult<{ saved: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = auth.authUser.id;
    const supabase = await createClient();

    // 1. Verify Portfolio Ownership
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id, user_id, slug")
      .eq("id", portfolioId)
      .single();

    if (!portfolio || portfolio.user_id !== userId) {
      return { success: false, error: "Portfolio not found or access denied" };
    }

    // 2. Validate Hex Colors
    const colors = config.colors;
    if (
      !isValidHexColor(colors.primary) ||
      !isValidHexColor(colors.accent) ||
      !isValidHexColor(colors.background) ||
      !isValidHexColor(colors.surface) ||
      !isValidHexColor(colors.text) ||
      !isValidHexColor(colors.mutedText)
    ) {
      return { success: false, error: "Invalid hex color code format." };
    }

    // 3. Update theme_data JSONB column
    const { error: updateErr } = await supabase
      .from("portfolios")
      .update({
        theme_data: config as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", portfolioId)
      .eq("user_id", userId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // 4. Update section visibility & order in portfolio_sections
    if (config.sectionOrder && config.sectionOrder.length > 0) {
      for (let i = 0; i < config.sectionOrder.length; i++) {
        const secType = config.sectionOrder[i];
        const isVisible = config.sectionVisibility[secType] ?? true;

        await supabase
          .from("portfolio_sections")
          .update({
            sort_order: i + 1,
            is_visible: isVisible,
            updated_at: new Date().toISOString(),
          })
          .eq("portfolio_id", portfolioId)
          .eq("section_type", secType);
      }
    }

    // 5. Fail-safe analytics tracking
    await trackAnalyticsEvent("template_selected", {
      userId,
      portfolioId,
      metadata: { preset: config.preset },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);
    revalidatePath(`/u/${portfolio.slug}`);

    return { success: true, data: { saved: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save customization settings";
    return { success: false, error: message };
  }
}

/**
 * Server action to reset portfolio visual customization to default theme preset
 */
export async function resetPortfolioCustomizationAction(
  portfolioId: string
): Promise<CustomizationActionResult<{ reset: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = auth.authUser.id;
    const supabase = await createClient();

    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id, user_id, slug")
      .eq("id", portfolioId)
      .single();

    if (!portfolio || portfolio.user_id !== userId) {
      return { success: false, error: "Portfolio not found or access denied" };
    }

    await supabase
      .from("portfolios")
      .update({
        theme_data: DEFAULT_CUSTOMIZATION as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", portfolioId)
      .eq("user_id", userId);

    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);
    revalidatePath(`/u/${portfolio.slug}`);

    return { success: true, data: { reset: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset customization";
    return { success: false, error: message };
  }
}
