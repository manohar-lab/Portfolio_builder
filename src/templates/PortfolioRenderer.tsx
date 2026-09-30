"use client";

import React from "react";
import { PortfolioData } from "@/types/portfolio";
import { getTemplateById } from "./registry";
import { Lock, Sparkles } from "lucide-react";
import { getCssDesignTokens } from "@/utilities/design-token-adapter";
import { CustomizationConfig } from "@/types/customization";

interface PortfolioRendererProps {
  data: PortfolioData & { theme_data?: CustomizationConfig };
  isPreview?: boolean;
  mode?: "editor" | "public";
}

/**
 * PortfolioRenderer — Unified Single Rendering Entry Point
 * Handles mode validation, published/draft safety guard, template resolution, and graceful fallback.
 */
export const PortfolioRenderer: React.FC<PortfolioRendererProps> = ({
  data,
  isPreview = false,
  mode = "public",
}) => {
  // Public Mode Authorization Guard: Do not expose draft content on public routes unless in preview context
  if (mode === "public" && !data.isPublished && !isPreview) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Portfolio is Currently Private</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The owner of this portfolio has set it to Draft status. Please check back later once updates are published.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-slate-800 text-slate-400">
              <Sparkles className="w-3 h-3 text-blue-400" /> PortfolioCraft SaaS Platform
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Resolve template component from registry with fallback protection
  const TemplateComponent = getTemplateById(data.templateId);

  // Extract customization design tokens
  const designTokens = getCssDesignTokens(data.theme_data);

  return (
    <div style={designTokens} className="portfolio-customization-root w-full min-h-screen">
      <TemplateErrorBoundary fallbackTemplateId="minimal" data={data} isPreview={isPreview}>
        <TemplateComponent data={data} isPreview={isPreview} />
      </TemplateErrorBoundary>
    </div>
  );
};

interface TemplateErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTemplateId: string;
  data: PortfolioData;
  isPreview?: boolean;
}

interface TemplateErrorBoundaryState {
  hasError: boolean;
}

/**
 * Class-based Error Boundary to catch template render errors gracefully
 */
class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Template render failure caught by TemplateErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComp = getTemplateById(this.props.fallbackTemplateId);
      return (
        <div className="w-full min-h-screen">
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-400 font-medium">
            Selected template is temporarily unavailable. Displaying safe fallback layout.
          </div>
          <FallbackComp data={this.props.data} isPreview={this.props.isPreview} />
        </div>
      );
    }

    return this.props.children;
  }
}

