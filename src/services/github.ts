"use server";

import { createClient } from "@/auth/server";
import { requireAuth } from "@/auth/service";
import { saveProject } from "@/database/section-services";
import { getPortfolioFullData } from "@/database/portfolio-service";
import { GitHubRepo, GitHubConnectionStatus, ProjectItem } from "@/types/portfolio";
import { revalidatePath } from "next/cache";

/**
 * Checks if the current authenticated session has a connected GitHub account.
 */
export async function getGitHubConnectionStatus(): Promise<GitHubConnectionStatus> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const internalUserId = user.internalUser?.id || user.authUser.id;

    // Check connected_accounts table
    const { data: connectedAccount } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("user_id", internalUserId)
      .eq("provider", "github")
      .maybeSingle();

    const userMetadata = (user.authUser.user_metadata || {}) as Record<string, unknown>;
    const appMetadata = (user.authUser.app_metadata || {}) as Record<string, unknown>;

    const metaAvatar = typeof userMetadata.avatar_url === "string" ? userMetadata.avatar_url : "";
    const metaUsername =
      typeof userMetadata.user_name === "string"
        ? userMetadata.user_name
        : typeof userMetadata.preferred_username === "string"
        ? userMetadata.preferred_username
        : user.authUser.email.split("@")[0];

    if (connectedAccount) {
      return {
        isConnected: true,
        username: user.profile?.full_name || metaUsername,
        avatarUrl: user.profile?.avatar_url || metaAvatar,
      };
    }

    // Fallback: check if auth provider was github
    const providerStr = typeof appMetadata.provider === "string" ? appMetadata.provider : "";
    const issStr = typeof userMetadata.iss === "string" ? userMetadata.iss : "";
    const isGithubAuth = providerStr === "github" || issStr.includes("github");

    if (isGithubAuth) {
      return {
        isConnected: true,
        username: metaUsername,
        avatarUrl: metaAvatar,
      };
    }

    return { isConnected: false };
  } catch (err: unknown) {
    console.error("Error checking GitHub status:", err);
    return { isConnected: false, error: "Failed to determine GitHub connection status." };
  }
}

/**
 * Fetches user repositories from GitHub REST API.
 * Uses public fallback or authenticated provider token if available.
 */
export async function fetchUserRepositories(params?: {
  search?: string;
  language?: string;
  sort?: "updated" | "stars" | "name";
}): Promise<{ success: boolean; repos: GitHubRepo[]; error?: string }> {
  try {
    const status = await getGitHubConnectionStatus();
    if (!status.isConnected || !status.username) {
      return { success: false, repos: [], error: "GitHub account is not connected." };
    }

    const username = status.username.trim();
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "PortfolioCraft-SaaS",
      },
      next: { revalidate: 60 }, // Cache GitHub API calls for 60s to prevent rate limits
    });

    if (!response.ok) {
      if (response.status === 403) {
        return { success: false, repos: [], error: "GitHub API rate limit exceeded. Please try again later." };
      }
      return { success: false, repos: [], error: `GitHub API error (${response.status})` };
    }

    const rawRepos = await response.json();

    if (!Array.isArray(rawRepos)) {
      return { success: false, repos: [] };
    }

    let repos: GitHubRepo[] = rawRepos.map((r: {
      id: number;
      name: string;
      full_name: string;
      description?: string | null;
      language?: string | null;
      topics?: string[];
      stargazers_count?: number;
      forks_count?: number;
      updated_at?: string;
      html_url: string;
      homepage?: string | null;
      private?: boolean;
      owner?: { login?: string };
    }) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description || null,
      language: r.language || null,
      topics: Array.isArray(r.topics) ? r.topics : [],
      stargazersCount: r.stargazers_count || 0,
      forksCount: r.forks_count || 0,
      updatedAt: r.updated_at || new Date().toISOString(),
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      isPrivate: r.private || false,
      owner: r.owner?.login || username,
    }));

    // Filter by search query if provided
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      repos = repos.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
      );
    }

    // Filter by language if provided
    if (params?.language && params.language !== "all") {
      repos = repos.filter((r) => r.language && r.language.toLowerCase() === params.language?.toLowerCase());
    }

    // Sort repos
    if (params?.sort === "stars") {
      repos.sort((a, b) => b.stargazersCount - a.stargazersCount);
    } else if (params?.sort === "name") {
      repos.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // default: updated
      repos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return { success: true, repos };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error fetching GitHub repositories.";
    console.error("fetchUserRepositories error:", err);
    return { success: false, repos: [], error: errorMsg };
  }
}

/**
 * Imports selected GitHub repositories into a target portfolio.
 * DUPLICATE PROTECTION: Skips repositories that are already imported into the target portfolio.
 */
export async function importGitHubRepositories(
  portfolioId: string,
  reposToImport: GitHubRepo[]
): Promise<{ success: boolean; importedCount: number; skippedCount: number; error?: string }> {
  try {
    if (!portfolioId || reposToImport.length === 0) {
      return { success: false, importedCount: 0, skippedCount: 0, error: "No repositories selected." };
    }

    // Fetch existing portfolio projects for duplicate checking
    const existingPortfolio = await getPortfolioFullData(portfolioId);
    if (!existingPortfolio) {
      return { success: false, importedCount: 0, skippedCount: 0, error: "Target portfolio not found or unauthorized." };
    }

    const existingRepoIds = new Set(
      existingPortfolio.projects
        .map((p) => p.githubRepositoryId || p.githubUrl)
        .filter(Boolean)
    );

    let importedCount = 0;
    let skippedCount = 0;

    for (const repo of reposToImport) {
      // DUPLICATE CHECK: Skip if repo ID or matching GitHub URL already exists
      if (existingRepoIds.has(repo.id.toString()) || existingRepoIds.has(repo.htmlUrl)) {
        skippedCount++;
        continue;
      }

      // Map GitHub Repository to Portfolio Project model
      const techList = [repo.language, ...repo.topics].filter(Boolean) as string[];

      const newProjectPayload: ProjectItem = {
        id: `proj-gh-${repo.id}-${Date.now()}`,
        portfolioId,
        title: repo.name,
        shortDescription: repo.description || `GitHub repository: ${repo.fullName}`,
        detailedDescription: `Imported from GitHub repository ${repo.fullName}. Stars: ${repo.stargazersCount}, Forks: ${repo.forksCount}.`,
        technologies: Array.from(new Set(techList)),
        githubUrl: repo.htmlUrl,
        liveDemoUrl: repo.homepage || "",
        status: "COMPLETED",
        isCurrent: false,
        isFeatured: false,
        source: "GITHUB",
        githubRepositoryId: repo.id.toString(),
        githubFullName: repo.fullName,
        githubLastSyncedAt: new Date().toISOString(),
      };

      const saveRes = await saveProject(portfolioId, newProjectPayload);
      if (saveRes.success) {
        importedCount++;
      } else {
        skippedCount++;
      }
    }

    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath(`/dashboard/portfolio/${portfolioId}/editor`);
    revalidatePath("/dashboard");

    return {
      success: true,
      importedCount,
      skippedCount,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to import GitHub repositories.";
    console.error("importGitHubRepositories error:", err);
    return { success: false, importedCount: 0, skippedCount: 0, error: errorMsg };
  }
}

/**
 * Disconnects GitHub account.
 * IMPORTANT CRITICAL RULE: Already imported portfolio projects are NEVER deleted upon disconnect.
 */
export async function disconnectGitHubAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const internalUserId = user.internalUser?.id || user.authUser.id;

    // Delete provider connection record
    await supabase
      .from("connected_accounts")
      .delete()
      .eq("user_id", internalUserId)
      .eq("provider", "github");

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to disconnect GitHub account.";
    console.error("disconnectGitHubAccount error:", err);
    return { success: false, error: errorMsg };
  }
}
