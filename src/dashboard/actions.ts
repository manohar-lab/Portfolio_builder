"use server";

import { revalidatePath } from "next/cache";
import {
  createPortfolio,
  updatePortfolioMeta,
  deletePortfolio,
  checkSlugAvailability,
} from "@/database/portfolio-service";
import {
  updateProfile,
  saveProject,
  deleteProject,
  saveEducation,
  deleteEducation,
  saveSkill,
  deleteSkill,
  saveExperience,
  deleteExperience,
  saveResearch,
  deleteResearch,
  saveAchievement,
  deleteAchievement,
  saveCertification,
  deleteCertification,
  saveSocialLink,
  deleteSocialLink,
} from "@/database/section-services";
import {
  getGitHubConnectionStatus,
  fetchUserRepositories,
  importGitHubRepositories,
  disconnectGitHubAccount,
} from "@/services/github";
import { CreatePortfolioSchema } from "@/validation/portfolio.schema";
import {
  PortfolioData,
  ProjectItem,
  EducationItem,
  SkillItem,
  ExperienceItem,
  ResearchItem,
  AchievementItem,
  CertificationItem,
  SocialLink,
  UserProfile,
  GitHubRepo,
} from "@/types/portfolio";

export async function checkSlugAvailabilityAction(slug: string, excludePortfolioId?: string) {
  return await checkSlugAvailability(slug, excludePortfolioId);
}

export async function createPortfolioAction(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const templateId = (formData.get("templateId") as string) || "developer";
  const description = (formData.get("description") as string) || "";

  const validation = CreatePortfolioSchema.safeParse({ title, slug, templateId, description });
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const result = await createPortfolio({
    title,
    slug,
    templateId,
    description,
  });

  if (result.success) {
    revalidatePath("/dashboard");
  }

  return result;
}

export async function updatePortfolioStatusAction(portfolioId: string, isPublished: boolean) {
  const result = await updatePortfolioMeta(portfolioId, { isPublished, status: isPublished ? "PUBLISHED" : "DRAFT" });
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath("/dashboard");
  }
  return result;
}

export async function updateTemplateAction(portfolioId: string, templateId: string) {
  const result = await updatePortfolioMeta(portfolioId, { templateId });
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/template`);
    revalidatePath("/dashboard");
  }
  return result;
}

export async function deletePortfolioAction(portfolioId: string) {
  const result = await deletePortfolio(portfolioId);
  if (result.success) {
    revalidatePath("/dashboard");
  }
  return result;
}

export async function saveFullPortfolioDraftAction(portfolio: PortfolioData) {
  try {
    // 1. Save Meta & Template
    const metaRes = await updatePortfolioMeta(portfolio.id, {
      title: portfolio.title,
      slug: portfolio.slug,
      templateId: portfolio.templateId,
    });
    if (!metaRes.success) return metaRes;

    // 2. Save Profile
    if (portfolio.profile) {
      await updateProfile(portfolio.profile);
    }

    revalidatePath(`/dashboard/portfolio/${portfolio.id}`);
    revalidatePath(`/dashboard/portfolio/${portfolio.id}/editor`);
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save portfolio draft";
    console.error("Save draft error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function updateProfileAction(profileData: UserProfile, portfolioId: string) {
  const result = await updateProfile(profileData);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveProjectAction(portfolioId: string, project: ProjectItem) {
  const result = await saveProject(portfolioId, project);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteProjectAction(portfolioId: string, projectId: string) {
  const result = await deleteProject(portfolioId, projectId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveEducationAction(portfolioId: string, edu: EducationItem) {
  const result = await saveEducation(portfolioId, edu);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteEducationAction(portfolioId: string, eduId: string) {
  const result = await deleteEducation(portfolioId, eduId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveSkillAction(portfolioId: string, skill: SkillItem) {
  const result = await saveSkill(portfolioId, skill);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteSkillAction(portfolioId: string, skillId: string) {
  const result = await deleteSkill(portfolioId, skillId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveExperienceAction(portfolioId: string, exp: ExperienceItem) {
  const result = await saveExperience(portfolioId, exp);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteExperienceAction(portfolioId: string, expId: string) {
  const result = await deleteExperience(portfolioId, expId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveResearchAction(portfolioId: string, res: ResearchItem) {
  const result = await saveResearch(portfolioId, res);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteResearchAction(portfolioId: string, resId: string) {
  const result = await deleteResearch(portfolioId, resId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveAchievementAction(portfolioId: string, ach: AchievementItem) {
  const result = await saveAchievement(portfolioId, ach);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteAchievementAction(portfolioId: string, achId: string) {
  const result = await deleteAchievement(portfolioId, achId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveCertificationAction(portfolioId: string, cert: CertificationItem) {
  const result = await saveCertification(portfolioId, cert);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteCertificationAction(portfolioId: string, certId: string) {
  const result = await deleteCertification(portfolioId, certId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function saveSocialLinkAction(portfolioId: string, link: SocialLink) {
  const result = await saveSocialLink(portfolioId, link);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

export async function deleteSocialLinkAction(portfolioId: string, linkId: string) {
  const result = await deleteSocialLink(portfolioId, linkId);
  if (result.success) {
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
  }
  return result;
}

/* =========================================================
 * GITHUB INTEGRATION ACTIONS (PHASE 6)
 * ========================================================= */
export async function getGitHubStatusAction() {
  return await getGitHubConnectionStatus();
}

export async function fetchUserRepositoriesAction(params?: {
  search?: string;
  language?: string;
  sort?: "updated" | "stars" | "name";
}) {
  return await fetchUserRepositories(params);
}

export async function importGitHubRepositoriesAction(
  portfolioId: string,
  reposToImport: GitHubRepo[]
) {
  return await importGitHubRepositories(portfolioId, reposToImport);
}

export async function disconnectGitHubAction() {
  return await disconnectGitHubAccount();
}

/* =========================================================
 * ONBOARDING ACTIONS (PHASE 7)
 * ========================================================= */
import {
  getUserOnboardingStatus,
  saveOnboardingStep,
  resetOnboardingState,
  completeOnboarding,
  CompleteOnboardingPayload,
} from "@/services/onboarding-service";

export async function getOnboardingStatusAction() {
  return await getUserOnboardingStatus();
}

export async function saveOnboardingStepAction(step: number, profileType?: string) {
  return await saveOnboardingStep(step, profileType);
}

export async function resetOnboardingAction() {
  const res = await resetOnboardingState();
  if (res.success) {
    revalidatePath("/onboarding");
  }
  return res;
}

export async function completeOnboardingAction(payload: CompleteOnboardingPayload) {
  const res = await completeOnboarding(payload);
  if (res.success) {
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
  }
  return res;
}

/* =========================================================
 * FEEDBACK ACTIONS (PHASE 11)
 * ========================================================= */
import { submitUserFeedback, SubmitFeedbackPayload } from "@/services/feedback-service";

export async function submitFeedbackAction(payload: SubmitFeedbackPayload) {
  return await submitUserFeedback(payload);
}

/* =========================================================
 * SLUG & SHARING ACTIONS (PHASE 13)
 * ========================================================= */
import { updatePortfolioSlug } from "@/database/portfolio-service";

export async function updatePortfolioSlugAction(portfolioId: string, newSlug: string) {
  const result = await updatePortfolioSlug(portfolioId, newSlug);
  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/u/${newSlug}`);
  }
  return result;
}

