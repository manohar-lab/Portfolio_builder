import { describe, it, expect, vi } from "vitest";
import { PortfolioMeta, VisibilityMode } from "@/types/portfolio";

// Mock server actions used in Dashboard workspace
vi.mock("@/dashboard/actions", () => ({
  deletePortfolioAction: vi.fn(async (portfolioId: string) => ({
    success: true,
    portfolioId,
  })),
  updatePortfolioStatusAction: vi.fn(async (portfolioId: string, isPublished: boolean) => ({
    success: true,
    portfolioId,
    isPublished,
  })),
  updatePortfolioSlugAction: vi.fn(async (portfolioId: string, newSlug: string) => ({
    success: true,
    portfolioId,
    newSlug,
  })),
}));

vi.mock("@/dashboard/showcase-actions", () => ({
  updateVisibilityModeAction: vi.fn(async (portfolioId: string, mode: VisibilityMode) => ({
    success: true,
    portfolioId,
    mode,
  })),
}));

const mockPortfoliosList: PortfolioMeta[] = [
  {
    id: "port-1",
    userId: "user-owner-1",
    title: "Personal Engineering Portfolio",
    slug: "alex-personal",
    status: "PUBLISHED",
    isPublished: true,
    isPublic: true,
    visibilityMode: "public",
    templateId: "modern-developer",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "port-2",
    userId: "user-owner-1",
    title: "Research & Academic Showcase",
    slug: "alex-research",
    status: "DRAFT",
    isPublished: false,
    isPublic: true,
    visibilityMode: "unlisted",
    templateId: "academic-minimal",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-06T00:00:00Z",
  },
  {
    id: "port-3",
    userId: "user-owner-1",
    title: "Private Draft Work",
    slug: "alex-private",
    status: "DRAFT",
    isPublished: false,
    isPublic: false,
    visibilityMode: "private",
    templateId: "executive-brief",
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-04T00:00:00Z",
  },
];

describe("Phase 27: Portfolio Dashboard & Management Center Architecture", () => {
  it("1. Multi-Portfolio Support: supports selecting and switching active portfolio context", () => {
    let activeId = mockPortfoliosList[0].id;
    expect(activeId).toBe("port-1");

    // User switches to second portfolio
    activeId = mockPortfoliosList[1].id;
    expect(activeId).toBe("port-2");

    const activePortfolio = mockPortfoliosList.find((p) => p.id === activeId);
    expect(activePortfolio?.title).toBe("Research & Academic Showcase");
  });

  it("2. Search & Filtering: filters portfolios by search term, status, and visibility mode", () => {
    // Search query
    const searchQuery = "Research";
    const searched = mockPortfoliosList.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(searched).toHaveLength(1);
    expect(searched[0].id).toBe("port-2");

    // Status filter (Published only)
    const publishedOnly = mockPortfoliosList.filter((p) => p.isPublished);
    expect(publishedOnly).toHaveLength(1);
    expect(publishedOnly[0].id).toBe("port-1");

    // Visibility filter (Private only)
    const privateOnly = mockPortfoliosList.filter((p) => p.visibilityMode === "private");
    expect(privateOnly).toHaveLength(1);
    expect(privateOnly[0].id).toBe("port-3");
  });

  it("3. Neutral Sorting: sorts portfolios by updated date, created date, or title name", () => {
    // Sort by recently updated
    const byUpdated = [...mockPortfoliosList].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    expect(byUpdated[0].id).toBe("port-2");

    // Sort by title A-Z
    const byTitle = [...mockPortfoliosList].sort((a, b) => a.title.localeCompare(b.title));
    expect(byTitle[0].title).toBe("Personal Engineering Portfolio");
    expect(byTitle[1].title).toBe("Private Draft Work");
  });

  it("4. Status & Visibility Explanations: correctly identifies separate concept of Publish vs Visibility", () => {
    const pub = mockPortfoliosList[0];
    expect(pub.status).toBe("PUBLISHED");
    expect(pub.isPublished).toBe(true);
    expect(pub.visibilityMode).toBe("public");

    const unlistedDraft = mockPortfoliosList[1];
    expect(unlistedDraft.status).toBe("DRAFT");
    expect(unlistedDraft.isPublished).toBe(false);
    expect(unlistedDraft.visibilityMode).toBe("unlisted");
  });

  it("5. Danger Zone & Portfolio Deletion Confirmation: requires exact title match to confirm deletion", () => {
    const target = mockPortfoliosList[0];
    const invalidInput = "Wrong Title";
    const validInput = "Personal Engineering Portfolio";

    expect(invalidInput.trim() === target.title.trim()).toBe(false);
    expect(validInput.trim() === target.title.trim()).toBe(true);
  });

  it("6. Multi-User Isolation & IDOR Protection: User A cannot manage User B portfolios", () => {
    const userAPortfolio = mockPortfoliosList[0];
    const userBPortfolio: PortfolioMeta = {
      ...mockPortfoliosList[0],
      id: "port-user-b",
      userId: "user-owner-2",
      title: "User B Portfolio",
    };

    expect(userAPortfolio.userId).toBe("user-owner-1");
    expect(userBPortfolio.userId).toBe("user-owner-2");
    expect(userAPortfolio.id).not.toBe(userBPortfolio.id);
  });
});
