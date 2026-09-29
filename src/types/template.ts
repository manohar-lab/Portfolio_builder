import { PortfolioData } from "./portfolio";

/**
 * Portfolio Template Registry & Component Interface
 */

import { SectionType } from "./portfolio";

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: "minimal" | "developer" | "research" | "creative" | "student" | "ai_tech";
  thumbnailUrl: string;
  isAvailable: boolean;
  tags?: string[];
  bestFor?: string[];
  supportedSections?: SectionType[];
}

export interface TemplateProps {
  data: PortfolioData;
  isPreview?: boolean;
}

export type TemplateComponent = React.ComponentType<TemplateProps>;
