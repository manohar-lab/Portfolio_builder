import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicPortfolioBySlug } from "@/database/portfolio-service";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import { isReservedSlug } from "@/utilities/slug";

interface PublicPortfolioPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;

  if (isReservedSlug(username)) {
    return {
      title: "Page Not Found",
      description: "The requested page does not exist.",
    };
  }

  const portfolio = await getPublicPortfolioBySlug(username);

  if (!portfolio || !portfolio.isPublished) {
    return {
      title: "Portfolio Not Found | PortfolioCraft",
      description: "The requested portfolio is unavailable or private.",
    };
  }

  const fullName = portfolio.profile.fullName || portfolio.title || username;
  const headline = portfolio.profile.headline || "Professional Portfolio";
  const bio = portfolio.profile.bio || `Explore ${fullName}'s portfolio, projects, skills, and background.`;
  const avatar = portfolio.profile.avatarUrl;

  return {
    title: `${fullName} | ${headline}`,
    description: bio.slice(0, 160),
    openGraph: {
      title: `${fullName} — ${headline}`,
      description: bio.slice(0, 200),
      type: "website",
      siteName: "PortfolioCraft Platform",
      images: avatar ? [{ url: avatar, alt: `${fullName} Profile Picture` }] : [],
    },
    twitter: {
      card: avatar ? "summary_large_image" : "summary",
      title: `${fullName} — ${headline}`,
      description: bio.slice(0, 200),
      images: avatar ? [avatar] : [],
    },
  };
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { username } = await params;

  if (isReservedSlug(username)) {
    notFound();
  }

  const portfolio = await getPublicPortfolioBySlug(username);

  // DRAFT PROTECTION: If unpublished or non-existent, trigger 404
  if (!portfolio || !portfolio.isPublished) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-white text-gray-900">
      <PortfolioRenderer data={portfolio} isPreview={false} />
    </main>
  );
}
