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
      robots: { index: false, follow: false },
    };
  }

  const portfolio = await getPublicPortfolioBySlug(username);

  if (!portfolio || !portfolio.isPublished) {
    return {
      title: "Portfolio Not Found | PortfolioCraft",
      description: "The requested portfolio is unavailable or private.",
      robots: { index: false, follow: false },
    };
  }

  const fullName = portfolio.profile.fullName || portfolio.title || username;
  const headline = portfolio.profile.headline || "Professional Portfolio";
  const bio = portfolio.profile.bio || `Explore ${fullName}'s portfolio, projects, skills, and background.`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const canonicalUrl = `${appUrl.replace(/\/$/, "")}/u/${encodeURIComponent(username)}`;
  const ogImageUrl = `${appUrl.replace(/\/$/, "")}/api/og/${encodeURIComponent(username)}`;

  return {
    metadataBase: new URL(appUrl),
    title: `${fullName} | ${headline}`,
    description: bio.slice(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: portfolio.visibilityMode === "public",
      follow: portfolio.visibilityMode === "public",
    },
    openGraph: {
      title: `${fullName} — ${headline}`,
      description: bio.slice(0, 200),
      url: canonicalUrl,
      type: "website",
      siteName: "PortfolioCraft Platform",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${fullName}'s Public Portfolio Social Preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullName} — ${headline}`,
      description: bio.slice(0, 200),
      images: [ogImageUrl],
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
