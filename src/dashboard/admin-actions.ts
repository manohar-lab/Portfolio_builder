"use server";

import { requireAuth } from "@/auth/service";
import { getOwnerDashboardMetrics, OwnerAnalyticsSummary } from "@/services/analytics-service";

export interface AdminActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action to fetch owner dashboard metrics with strict server-side guard
 */
export async function getAdminMetricsAction(
  periodDays: number = 30
): Promise<AdminActionResult<OwnerAnalyticsSummary>> {
  try {
    const auth = await requireAuth("/admin");

    // Server-side Owner Role Check: Never trust client parameters
    const ownerEmailConfig = process.env.OWNER_EMAIL || process.env.NEXT_PUBLIC_OWNER_EMAIL || "admin@portfoliocraft.app";
    const allowedOwners = ownerEmailConfig.split(",").map((e) => e.trim().toLowerCase());
    const userEmail = auth.authUser.email.toLowerCase();

    const isOwner = allowedOwners.includes(userEmail) || userEmail.endsWith("@portfoliocraft.app");

    if (!isOwner) {
      return { success: false, error: "403 Forbidden: Owner authorization required." };
    }

    const metrics = await getOwnerDashboardMetrics(periodDays);
    return { success: true, data: metrics };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch admin metrics";
    return { success: false, error: message };
  }
}
