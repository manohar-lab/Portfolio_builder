"use server";

import { getAuthenticatedUser } from "@/auth/service";
import { createClient } from "@/auth/server";
import { GroundedAIService } from "@/services/ai-service";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import {
  AiActionType,
  AiRequestPayload,
  AiGenerationResult,
  AiActionResult,
} from "@/types/ai";
import { trackAnalyticsEvent } from "@/services/analytics-service";
import { revalidatePath } from "next/cache";

// Simple sliding window rate limiter (max 20 AI requests per portfolio per 10 minutes)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Server Action: Process AI Content Generation Request
 */
export async function generateAiPortfolioContentAction(
  portfolioId: string,
  actionType: AiActionType,
  payload: AiRequestPayload = {}
): Promise<AiActionResult<AiGenerationResult>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = auth.authUser.id;
    const supabase = await createClient();

    // 1. Verify Portfolio Ownership
    const { data: portfolioRecord, error: fetchErr } = await supabase
      .from("portfolios")
      .select("*, profile:portfolio_profiles(*), sections:portfolio_sections(*), projects:portfolio_projects(*), skills:portfolio_skills(*), experience:portfolio_experience(*), education:portfolio_education(*), research:portfolio_research(*)")
      .eq("id", portfolioId)
      .single();

    if (fetchErr || !portfolioRecord || portfolioRecord.user_id !== userId) {
      return { success: false, error: "Portfolio not found or access denied" };
    }

    // 2. Rate Limiting Check
    if (!checkRateLimit(`ai_${portfolioId}`)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please wait a few minutes before requesting more AI suggestions.",
      };
    }

    // 3. Normalize portfolio data for AI context
    const normalizedPortfolio = normalizePortfolioData({
      id: portfolioRecord.id,
      userId: portfolioRecord.user_id,
      title: portfolioRecord.title,
      slug: portfolioRecord.slug,
      profile: portfolioRecord.profile?.[0] || portfolioRecord.profile,
      sections: portfolioRecord.sections || [],
      projects: portfolioRecord.projects || [],
      skills: portfolioRecord.skills || [],
      experience: portfolioRecord.experience || [],
      education: portfolioRecord.education || [],
      research: portfolioRecord.research || [],
    });

    // 4. Analytics: Generation Requested
    await trackAnalyticsEvent("ai_generation_requested", {
      userId,
      portfolioId,
      metadata: { actionType },
    });

    // 5. Execute Grounded AI Generation
    const aiService = new GroundedAIService();
    const result = await aiService.processAiAction(actionType, normalizedPortfolio, payload);

    // 6. Analytics: Generation Success
    await trackAnalyticsEvent("ai_generation_success", {
      userId,
      portfolioId,
      metadata: { actionType },
    });

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI generation failed";

    // Analytics: Generation Failure
    await trackAnalyticsEvent("ai_generation_failed", {
      metadata: { actionType, error: message },
    });

    return {
      success: false,
      error: `AI Assistant unavailable: ${message}`,
    };
  }
}

/**
 * Server Action: Accept AI Suggestion and Save to Portfolio
 */
export async function acceptAiSuggestionAction(
  portfolioId: string,
  actionType: AiActionType,
  acceptedContent: string | string[] | Record<string, unknown>
): Promise<AiActionResult<{ saved: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = auth.authUser.id;
    const supabase = await createClient();

    // Verify ownership
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id, user_id, slug")
      .eq("id", portfolioId)
      .single();

    if (!portfolio || portfolio.user_id !== userId) {
      return { success: false, error: "Portfolio not found or access denied" };
    }

    // Update corresponding section based on action type
    if (actionType === "generate_about" || actionType === "improve_about") {
      if (typeof acceptedContent === "string") {
        await supabase
          .from("portfolio_profiles")
          .update({ bio: acceptedContent, updated_at: new Date().toISOString() })
          .eq("portfolio_id", portfolioId);
      }
    } else if (actionType === "generate_headline") {
      if (typeof acceptedContent === "string") {
        await supabase
          .from("portfolio_profiles")
          .update({ headline: acceptedContent, updated_at: new Date().toISOString() })
          .eq("portfolio_id", portfolioId);
      }
    }

    // Analytics: Suggestion Accepted
    await trackAnalyticsEvent("ai_suggestion_accepted", {
      userId,
      portfolioId,
      metadata: { actionType },
    });

    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);
    revalidatePath(`/u/${portfolio.slug}`);

    return { success: true, data: { saved: true } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to accept AI suggestion";
    return { success: false, error: msg };
  }
}
