/**
 * PortfolioCraft - Public Discovery & Showcase System Types (Phase 21)
 */


export type ShowcaseSortOption = "newest" | "recently_updated";

export interface ShowcaseQueryParams {
  query?: string;
  skill?: string;
  templateId?: string;
  sortBy?: ShowcaseSortOption;
  page?: number;
  pageSize?: number;
}

export interface ShowcasePortfolioCardData {
  id: string;
  slug: string;
  title: string;
  fullName: string;
  headline: string;
  avatarUrl?: string;
  location?: string;
  templateId: string;
  topSkills: string[];
  featuredProjectTitle?: string;
  featuredProjectTech?: string[];
  updatedAt: string;
  isFeatured?: boolean;
  customDomain?: string;
}

export interface ShowcaseSearchResult {
  portfolios: ShowcasePortfolioCardData[];
  total: number;
  page: number;
  totalPages: number;
}

export type ReportReason = "spam" | "inappropriate" | "impersonation" | "copyright" | "other";
export type ReportStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export interface PortfolioReportRecord {
  id: string;
  portfolioId: string;
  reporterUserId?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface ShowcaseActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
