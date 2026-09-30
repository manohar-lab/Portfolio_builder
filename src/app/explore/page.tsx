import React from "react";
import { Metadata } from "next";
import { ShowcaseService } from "@/services/showcase-service";
import { ShowcaseQueryParams } from "@/types/showcase";
import { ExploreClientPage } from "./ExploreClientPage";

export const metadata: Metadata = {
  title: "Explore Public Portfolios | PortfolioCraft Showcase",
  description:
    "Discover developer, researcher, and designer portfolios built with PortfolioCraft. Browse public profiles, skills, and projects.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Explore Public Portfolios | PortfolioCraft Showcase",
    description: "Discover developer, researcher, and designer portfolios built with PortfolioCraft.",
    type: "website",
  },
};

interface ExplorePageProps {
  searchParams: Promise<{
    query?: string;
    skill?: string;
    templateId?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;

  const queryParams: ShowcaseQueryParams = {
    query: resolvedParams.query || "",
    skill: resolvedParams.skill || "",
    templateId: resolvedParams.templateId || "all",
    sortBy: resolvedParams.sortBy === "recently_updated" ? "recently_updated" : "newest",
    page: parseInt(resolvedParams.page || "1", 10),
    pageSize: 12,
  };

  const showcaseService = new ShowcaseService();
  const searchResult = await showcaseService.getPublicShowcasePortfolios(queryParams);

  return <ExploreClientPage initialData={searchResult} initialParams={queryParams} />;
}
