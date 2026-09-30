import { PortfolioData } from "./portfolio";

/**
 * Portfolio Template Registry & Component Interface
 */

import { SectionType } from "./portfolio";

export type TemplateCategory =
  | "student"
  | "developer"
  | "designer"
  | "research"
  | "researcher"
  | "minimal"
  | "professional"
  | "creative"
  | "ai_tech";

export type TemplateStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface TemplateMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: TemplateCategory;
  thumbnailUrl: string;
  version: number;
  status: TemplateStatus;
  isAvailable: boolean;
  isPro?: boolean;
  tags?: string[];
  bestFor?: string[];
  supportedSections?: SectionType[];
  createdAt?: string;
  updatedAt?: string;
}

export type TemplateSortOption = "newest" | "recently_updated" | "name";

export interface TemplateQueryParams {
  query?: string;
  category?: string;
  sortBy?: TemplateSortOption;
  userTier?: "free" | "pro";
}

export interface TemplateProps {
  data: PortfolioData;
  isPreview?: boolean;
}

export type TemplateComponent = React.ComponentType<TemplateProps>;

