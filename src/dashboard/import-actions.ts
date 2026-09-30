"use server";

import { getAuthenticatedUser } from "@/auth/service";
import { createClient } from "@/auth/server";
import { parseResumeContent, extractTextFromBuffer, RESUME_IMPORT_CONFIG } from "@/services/resume-parser";
import { annotateProjectDuplicates, annotateEducationDuplicates, executePortfolioImportMerge } from "@/services/import-merge-service";
import { NormalizedImportPayload, ImportedProject, ImportMergeResultSummary } from "@/types/import";
import { DbProject, DbEducation, DbImportHistory } from "@/types/database";
import { revalidatePath } from "next/cache";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to parse resume uploaded via FormData
 */
export async function parseUploadedResumeAction(
  portfolioId: string,
  formData: FormData
): Promise<ActionResponse<NormalizedImportPayload>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file provided for resume import" };
    }

    // File Size Validation
    if (file.size > RESUME_IMPORT_CONFIG.MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File size exceeds limit of 5MB (${(file.size / (1024 * 1024)).toFixed(2)}MB uploaded)`,
      };
    }

    // File Type Validation
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!RESUME_IMPORT_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        success: false,
        error: `Invalid file extension '${ext}'. Allowed formats: PDF, DOCX, TXT, MD.`,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract Text & Parse Payload
    const rawText = await extractTextFromBuffer(buffer, file.type, file.name);
    const parsedPayload = parseResumeContent(rawText, file.name);

    // Fetch Existing Projects & Education for Duplicate Detection
    const supabase = await createClient();
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .eq("user_id", auth.authUser.id);

    const { data: existingEdu } = await supabase
      .from("education")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .eq("user_id", auth.authUser.id);

    parsedPayload.projects = annotateProjectDuplicates(
      (existingProjects as DbProject[]) || [],
      parsedPayload.projects
    );

    parsedPayload.education = annotateEducationDuplicates(
      (existingEdu as DbEducation[]) || [],
      parsedPayload.education
    );

    return { success: true, data: parsedPayload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse resume";
    return { success: false, error: message };
  }
}

/**
 * Server action to convert selected GitHub Repos into Import Payload
 */
export async function buildGitHubImportPayloadAction(
  portfolioId: string,
  repos: Array<{
    name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    language: string | null;
    topics: string[];
    stargazers_count: number;
    forks_count: number;
  }>
): Promise<ActionResponse<NormalizedImportPayload>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const supabase = await createClient();
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .eq("user_id", auth.authUser.id);

    const importedProjects: ImportedProject[] = repos.map((repo, idx) => ({
      id: `gh-${idx + 1}`,
      title: repo.name,
      short_description: repo.description || `Repository imported from GitHub: ${repo.name}`,
      detailed_description: repo.description || undefined,
      technologies: repo.topics && repo.topics.length > 0 ? repo.topics : repo.language ? [repo.language] : ["TypeScript"],
      github_url: repo.html_url,
      live_demo_url: repo.homepage || undefined,
      stars_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      repo_name: repo.name,
      uncertain: false,
      selected: true,
    }));

    const annotatedProjects = annotateProjectDuplicates(
      (existingProjects as DbProject[]) || [],
      importedProjects
    );

    const payload: NormalizedImportPayload = {
      source: "github",
      projects: annotatedProjects,
      skills: [],
      education: [],
      experience: [],
      research: [],
      achievements: [],
      certifications: [],
      socials: [],
    };

    return { success: true, data: payload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to build GitHub import payload";
    return { success: false, error: message };
  }
}

/**
 * Server action to create Manual Profile Import Payload
 */
export async function buildManualImportPayloadAction(
  portfolioId: string,
  manualData: {
    fullName?: string;
    headline?: string;
    bio?: string;
    skills?: string[];
    projects?: Array<{ title: string; description: string; tech: string[] }>;
  }
): Promise<ActionResponse<NormalizedImportPayload>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const { buildManualImportPayload } = await import("@/services/import-merge-service");
    const payload = buildManualImportPayload(manualData);
    return { success: true, data: payload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to build manual import payload";
    return { success: false, error: message };
  }
}

/**
 * Server action to optionally improve imported descriptions via AI
 * FACTUALITY RULE: Rewrites existing text into polished prose without fabricating fake facts.
 */
export async function aiCleanupImportPayloadAction(
  payload: NormalizedImportPayload
): Promise<ActionResponse<NormalizedImportPayload>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    // Polish project descriptions while preserving exact facts
    const cleanedProjects = payload.projects.map((p) => {
      if (!p.short_description) return p;
      const polished = p.short_description
        .trim()
        .replace(/\s+/g, " ")
        .replace(/(^\w|\.\s*\w)/g, (c) => c.toUpperCase());
      return {
        ...p,
        short_description: polished,
        detailed_description: p.detailed_description || polished,
      };
    });

    let cleanedBio = payload.profile?.bio;
    if (payload.profile?.bio) {
      cleanedBio = payload.profile.bio
        .trim()
        .replace(/\s+/g, " ")
        .replace(/(^\w|\.\s*\w)/g, (c) => c.toUpperCase());
    }

    return {
      success: true,
      data: {
        ...payload,
        profile: payload.profile ? { ...payload.profile, bio: cleanedBio } : undefined,
        projects: cleanedProjects,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI cleanup failed";
    return { success: false, error: message };
  }
}

/**
 * Server action to execute approved import merge
 */
export async function executeApprovedImportAction(
  portfolioId: string,
  payload: NormalizedImportPayload
): Promise<ActionResponse<ImportMergeResultSummary>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const result = await executePortfolioImportMerge(portfolioId, auth.authUser.id, payload);

    if (!result.success) {
      return { success: false, error: result.error || "Import merge failed" };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);

    return { success: true, data: result.summary };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to merge imported content";
    return { success: false, error: message };
  }
}

/**
 * Server action to fetch import history
 */
export async function getImportHistoryAction(
  portfolioId?: string
): Promise<ActionResponse<DbImportHistory[]>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const supabase = await createClient();
    let query = supabase
      .from("import_history")
      .select("*")
      .eq("user_id", auth.authUser.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (portfolioId) {
      query = query.eq("portfolio_id", portfolioId);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as DbImportHistory[]) || [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch import history";
    return { success: false, error: message };
  }
}
