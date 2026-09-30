"use server";

import { getAuthenticatedUser } from "@/auth/service";
import { ShowcaseService } from "@/services/showcase-service";
import { VisibilityMode } from "@/types/portfolio";
import { ReportReason, ShowcaseActionResult } from "@/types/showcase";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Update Portfolio Visibility Mode (Private, Unlisted, Public)
 */
export async function updateVisibilityModeAction(
  portfolioId: string,
  mode: VisibilityMode
): Promise<ShowcaseActionResult<{ mode: VisibilityMode }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const showcaseService = new ShowcaseService();
    const success = await showcaseService.setPortfolioVisibilityMode(portfolioId, auth.authUser.id, mode);

    if (!success) {
      return { success: false, error: "Failed to update portfolio visibility settings." };
    }

    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);
    revalidatePath("/explore");

    return { success: true, data: { mode } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update visibility mode";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Submit Portfolio Moderation Report
 */
export async function submitPortfolioReportAction(
  portfolioId: string,
  reason: ReportReason,
  description?: string
): Promise<ShowcaseActionResult<{ reported: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    const reporterUserId = auth?.authUser?.id;

    const showcaseService = new ShowcaseService();
    const res = await showcaseService.submitReport(portfolioId, reason, description, reporterUserId);

    if (!res.success) {
      return { success: false, error: res.error || "Failed to submit report." };
    }

    return { success: true, data: { reported: true } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit report";
    return { success: false, error: msg };
  }
}
