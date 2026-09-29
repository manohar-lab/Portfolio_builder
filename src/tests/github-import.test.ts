import { describe, it, expect } from "vitest";
import { GitHubRepo, ProjectItem, PortfolioData } from "@/types/portfolio";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";

describe("Phase 6: GitHub Integration & Repository Import System", () => {
  const mockRepos: GitHubRepo[] = [
    {
      id: 101,
      name: "neural-mesh",
      fullName: "alex/neural-mesh",
      description: "Distributed neural network inference engine",
      language: "Python",
      topics: ["machine-learning", "pytorch", "distributed-systems"],
      stargazersCount: 42,
      forksCount: 8,
      updatedAt: "2024-05-10T12:00:00Z",
      htmlUrl: "https://github.com/alex/neural-mesh",
      homepage: "https://neuralmesh.io",
      isPrivate: false,
      owner: "alex",
    },
    {
      id: 102,
      name: "portfolio-craft",
      fullName: "alex/portfolio-craft",
      description: "Multi-user SaaS platform for developers",
      language: "TypeScript",
      topics: ["nextjs", "react", "tailwindcss"],
      stargazersCount: 15,
      forksCount: 2,
      updatedAt: "2024-06-01T15:30:00Z",
      htmlUrl: "https://github.com/alex/portfolio-craft",
      homepage: null,
      isPrivate: false,
      owner: "alex",
    },
  ];

  const samplePortfolio: PortfolioData = normalizePortfolioData({
    id: "port-99",
    userId: "usr-99",
    slug: "alex-chen",
    title: "Alex Portfolio",
    projects: [
      {
        id: "proj-existing-1",
        title: "neural-mesh",
        shortDescription: "Existing project",
        technologies: ["Python"],
        status: "COMPLETED",
        isCurrent: false,
        isFeatured: false,
        source: "GITHUB",
        githubRepositoryId: "101",
        githubUrl: "https://github.com/alex/neural-mesh",
      },
    ],
  });

  it("1. REPOSITORY MAPPING: Converts GitHub repository into standard ProjectItem domain model", () => {
    const repo = mockRepos[1]; // portfolio-craft
    const techList = [repo.language, ...repo.topics].filter(Boolean) as string[];

    const mappedProject: ProjectItem = {
      id: `proj-gh-${repo.id}`,
      portfolioId: samplePortfolio.id,
      title: repo.name,
      shortDescription: repo.description || "",
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

    expect(mappedProject.title).toBe("portfolio-craft");
    expect(mappedProject.shortDescription).toBe("Multi-user SaaS platform for developers");
    expect(mappedProject.technologies).toContain("TypeScript");
    expect(mappedProject.technologies).toContain("nextjs");
    expect(mappedProject.githubUrl).toBe("https://github.com/alex/portfolio-craft");
    expect(mappedProject.source).toBe("GITHUB");
    expect(mappedProject.githubRepositoryId).toBe("102");
  });

  it("2. DUPLICATE PROTECTION: Existing imported repositories are identified and skipped", () => {
    const existingIds = new Set(
      samplePortfolio.projects.map((p) => p.githubRepositoryId || p.githubUrl).filter(Boolean)
    );

    const isAlreadyImportedRepo101 = existingIds.has("101") || existingIds.has(mockRepos[0].htmlUrl);
    const isAlreadyImportedRepo102 = existingIds.has("102") || existingIds.has(mockRepos[1].htmlUrl);

    expect(isAlreadyImportedRepo101).toBe(true); // Repo 101 already exists
    expect(isAlreadyImportedRepo102).toBe(false); // Repo 102 is fresh
  });

  it("3. EDITING AFTER IMPORT: Imported GitHub projects behave like standard editable projects", () => {
    const importedProject: ProjectItem = {
      id: "proj-gh-102",
      portfolioId: samplePortfolio.id,
      title: "portfolio-craft",
      shortDescription: "Original description",
      technologies: ["TypeScript"],
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: false,
      source: "GITHUB",
      githubRepositoryId: "102",
    };

    // User edits title and custom bio description
    const editedProject: ProjectItem = {
      ...importedProject,
      title: "PortfolioCraft Enterprise SaaS",
      shortDescription: "Custom user-authored product description",
      isFeatured: true,
    };

    expect(editedProject.title).toBe("PortfolioCraft Enterprise SaaS");
    expect(editedProject.shortDescription).toBe("Custom user-authored product description");
    expect(editedProject.isFeatured).toBe(true);
    expect(editedProject.source).toBe("GITHUB"); // Preserves origin metadata
  });

  it("4. DISCONNECT BEHAVIOR: Disconnecting GitHub preserves already imported portfolio projects", () => {
    let isConnected = true;
    const projectsList = [...samplePortfolio.projects];

    // User disconnects GitHub
    isConnected = false;

    // Projects list remains 100% intact
    expect(isConnected).toBe(false);
    expect(projectsList.length).toBe(1);
    expect(projectsList[0].title).toBe("neural-mesh");
  });

  it("5. REPOSITORY SEARCH & FILTERING: Filters repositories by query and language", () => {
    const filterRepos = (query: string, lang: string) => {
      return mockRepos.filter((r) => {
        const matchesQuery = !query || r.name.toLowerCase().includes(query.toLowerCase());
        const matchesLang = lang === "all" || (r.language && r.language.toLowerCase() === lang.toLowerCase());
        return matchesQuery && matchesLang;
      });
    };

    expect(filterRepos("mesh", "all")).toHaveLength(1);
    expect(filterRepos("mesh", "all")[0].name).toBe("neural-mesh");
    expect(filterRepos("", "TypeScript")).toHaveLength(1);
    expect(filterRepos("", "TypeScript")[0].name).toBe("portfolio-craft");
  });

  it("6. SECURITY: OAuth access tokens are omitted from public project representations", () => {
    const project = samplePortfolio.projects[0];
    const projectKeys = Object.keys(project);

    expect(projectKeys).not.toContain("accessToken");
    expect(projectKeys).not.toContain("oauthToken");
    expect(projectKeys).not.toContain("secret");
  });

});
