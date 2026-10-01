import { createClient } from "@/auth/server";
import { requireAuth } from "@/auth/service";
import { checkSlugAvailability } from "@/database/portfolio-service";
import { DEFAULT_PORTFOLIO_SECTIONS } from "@/config/constants";
import { SectionType } from "@/types/portfolio";

export interface OnboardingState {
  currentStep: number;
  profileType: string;
  sourceSelection: "resume" | "github" | "scratch" | "import" | "none";
  dataImport?: Record<string, unknown>;
  templateSelection: string;
  initialCustomization: { primaryColor?: string; fontFamily?: string; layoutDensity?: string };
  completed: boolean;
  skipped: string[];
  draftPortfolioId?: string | null;
  draftSlug?: string | null;
}

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  onboardingStep: number;
  profileType: string;
  portfoliosCount: number;
  hasPortfolios: boolean;
  onboardingState?: OnboardingState;
}

export interface CompleteOnboardingPayload {
  title: string;
  slug: string;
  templateId: string;
  profileType?: string;
  selectedSections?: SectionType[];
  isPublished?: boolean;
}

/**
 * Retrieves onboarding progress, state, and portfolio counts for the authenticated user.
 */
export async function getUserOnboardingStatus(): Promise<OnboardingStatus> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  // Query user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, onboarding_step, profile_type")
    .eq("user_id", internalUserId)
    .maybeSingle();

  // Query user portfolios count
  const { count, data: portfolios } = await supabase
    .from("portfolios")
    .select("id, slug, title, template_id, is_published", { count: "exact" })
    .eq("user_id", internalUserId);

  const portfoliosCount = count || 0;
  const onboardingCompleted = profile?.onboarding_completed ?? (portfoliosCount > 0);
  const onboardingStep = profile?.onboarding_step ?? 1;
  const profileType = profile?.profile_type ?? "developer";

  const draftPort = portfolios?.find((p) => !p.is_published) || portfolios?.[0];

  const onboardingState: OnboardingState = {
    currentStep: onboardingStep,
    profileType,
    sourceSelection: "none",
    templateSelection: draftPort?.template_id || "developer",
    initialCustomization: { primaryColor: "indigo", fontFamily: "inter" },
    completed: onboardingCompleted,
    skipped: [],
    draftPortfolioId: draftPort?.id || null,
    draftSlug: draftPort?.slug || null,
  };

  return {
    onboardingCompleted,
    onboardingStep,
    profileType,
    portfoliosCount,
    hasPortfolios: portfoliosCount > 0,
    onboardingState,
  };
}

/**
 * Updates current onboarding step and optional profile type.
 */
export async function saveOnboardingStep(
  step: number,
  profileType?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const payloadToUpdate: Record<string, unknown> = {
    onboarding_step: step,
    updated_at: new Date().toISOString(),
  };

  if (profileType) {
    payloadToUpdate.profile_type = profileType;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payloadToUpdate)
    .eq("user_id", internalUserId);

  if (error) {
    console.error("Error saving onboarding step:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Resets onboarding progress safely without deleting user's existing portfolios.
 */
export async function resetOnboardingState(): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_step: 1,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", internalUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Completes onboarding, creates the initial portfolio, and marks profile as onboarding_completed.
 */
export async function completeOnboarding(payload: CompleteOnboardingPayload): Promise<{
  success: boolean;
  portfolioId?: string;
  slug?: string;
  error?: string;
}> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  // Validate slug availability if not updating existing draft
  const cleanSlug = payload.slug.toLowerCase().trim();
  const availability = await checkSlugAvailability(cleanSlug);
  
  let targetPortfolioId: string | undefined;

  // Check if draft portfolio already exists for user
  const { data: existingDraft } = await supabase
    .from("portfolios")
    .select("id, slug")
    .eq("user_id", internalUserId)
    .eq("slug", cleanSlug)
    .maybeSingle();

  if (existingDraft) {
    targetPortfolioId = existingDraft.id;
    await supabase
      .from("portfolios")
      .update({
        title: payload.title,
        template_id: payload.templateId || "developer",
        is_published: payload.isPublished ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetPortfolioId);
  } else {
    if (!availability.available) {
      return { success: false, error: availability.reason || "Username/slug is unavailable." };
    }

    // 1. Create Portfolio entry as draft or published
    const { data: newPortfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .insert({
        user_id: internalUserId,
        title: payload.title,
        slug: cleanSlug,
        template_id: payload.templateId || "developer",
        is_published: payload.isPublished ?? true,
        is_public: true,
      })
      .select()
      .single();

    if (portfolioError || !newPortfolio) {
      console.error("Error creating onboarding portfolio:", portfolioError?.message);
      return { success: false, error: portfolioError?.message || "Failed to create portfolio." };
    }

    targetPortfolioId = newPortfolio.id;

    // 2. Provision portfolio sections with user's section visibility choices
    const selectedTypes = new Set(payload.selectedSections || ["hero", "about", "projects", "skills", "education", "social_links"]);
    
    const sectionsToInsert = DEFAULT_PORTFOLIO_SECTIONS.map((sec) => ({
      portfolio_id: newPortfolio.id,
      user_id: internalUserId,
      section_type: sec.type,
      title: sec.title,
      is_visible: selectedTypes.has(sec.type),
      sort_order: sec.order,
    }));

    await supabase.from("portfolio_sections").insert(sectionsToInsert);
  }

  // 3. Mark onboarding_completed = true in user profile
  await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_step: 7,
      profile_type: payload.profileType || "developer",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", internalUserId);

  // 4. Fail-safe analytics event tracking
  try {
    const { trackAnalyticsEvent } = await import("@/services/analytics-service");
    await trackAnalyticsEvent("onboarding_completed", { userId: internalUserId, portfolioId: targetPortfolioId });
    await trackAnalyticsEvent("portfolio_created", { userId: internalUserId, portfolioId: targetPortfolioId });
    await trackAnalyticsEvent("publish_completed", { userId: internalUserId, portfolioId: targetPortfolioId });
  } catch {
    // Fail-safe swallow
  }

  return {
    success: true,
    portfolioId: targetPortfolioId,
    slug: cleanSlug,
  };
}
