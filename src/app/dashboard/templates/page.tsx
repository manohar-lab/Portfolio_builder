import React from "react";
import { requireAuth } from "@/auth/service";
import { getUserPortfolios, getPortfolioById } from "@/database/portfolio-service";
import { TemplateGalleryClient } from "./TemplateGalleryClient";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { PortfolioData } from "@/types/portfolio";

export default async function TemplateGalleryPage() {
  await requireAuth("/dashboard/templates");

  const portfolios = await getUserPortfolios();
  let sampleData: PortfolioData | null = null;

  if (portfolios.length > 0) {
    // Attempt to load real user portfolio data for template comparison
    const fullMeta = await getPortfolioById(portfolios[0].id);
    if (fullMeta) {
      // Fetch full portfolio object if possible, or fallback to normalized mock
      sampleData = normalizePortfolioData({
        id: fullMeta.id,
        title: fullMeta.title,
        slug: fullMeta.slug,
        templateId: fullMeta.templateId,
      });
    }
  }

  if (!sampleData) {
    sampleData = normalizePortfolioData({});
  }

  return (
    <TemplateGalleryClient
      initialPortfolios={portfolios}
      samplePortfolio={sampleData}
    />
  );
}
