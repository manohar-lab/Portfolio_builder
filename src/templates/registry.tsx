import React from "react";
import { TemplateComponent, TemplateProps } from "./types";
import { MinimalTemplate } from "./minimal/MinimalTemplate";
import { DeveloperTemplate } from "./developer/DeveloperTemplate";
import { ResearchTemplate } from "./research/ResearchTemplate";
import { AVAILABLE_TEMPLATES } from "@/config/templates";

/**
 * Central Template Registry
 * Maps stable template ID strings to presentation components.
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateComponent> = {
  minimal: MinimalTemplate,
  developer: DeveloperTemplate,
  research: ResearchTemplate,
  creative: MinimalTemplate,
  student: MinimalTemplate,
  ai_tech: DeveloperTemplate,
};

/**
 * Retrieves list of available templates metadata
 */
export function getAvailableTemplates() {
  return AVAILABLE_TEMPLATES;
}

/**
 * Retrieves the matching Template Component or falls back to DeveloperTemplate safely.
 */
export function getTemplateById(templateId: string): TemplateComponent {
  const Component = TEMPLATE_REGISTRY[templateId];
  return Component || DeveloperTemplate;
}

/**
 * Render helper component
 */
export const RenderPortfolioTemplate: React.FC<TemplateProps> = ({ data, isPreview }) => {
  const TemplateComp = getTemplateById(data.templateId);
  return <TemplateComp data={data} isPreview={isPreview} />;
};
