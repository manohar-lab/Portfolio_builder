import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { RenderPortfolioTemplate } from "@/templates/registry";
import { isReservedSlug } from "@/utilities/slug";

interface PublicPortfolioPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ template?: string }>;
}

export async function generateMetadata({ params }: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;

  if (isReservedSlug(username)) {
    return { title: "Not Found" };
  }

  const sampleData = normalizePortfolioData({
    slug: username,
    profile: {
      fullName: username === "demo" ? "Jane Doe" : `${username.toUpperCase()} Portfolio`,
      headline: "Senior Full Stack Engineer & Researcher",
      bio: "Building distributed platforms, AI models, and modern web applications.",
      isAvailableForWork: true,
    },
  });

  return {
    title: `${sampleData.profile.fullName} — Portfolio`,
    description: sampleData.profile.headline,
  };
}

export default async function PublicPortfolioPage({ params, searchParams }: PublicPortfolioPageProps) {
  const { username } = await params;
  const { template } = await searchParams;

  if (isReservedSlug(username)) {
    notFound();
  }

  // Hydrate standardized portfolio data (Phase 0 mock adapter, Phase 1 will query Supabase PostgreSQL)
  const portfolioData = normalizePortfolioData({
    slug: username,
    templateId: template || "developer",
    profile: {
      fullName: username === "demo" ? "Jane Doe" : `${username.replace(/-/g, " ")}`,
      headline: "Senior Full Stack Engineer & Open Source Contributor",
      bio: "Passionate about building scalable web platforms, high-performance distributed systems, and accessible user experiences.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      location: "San Francisco, CA",
      email: "jane.doe@example.com",
      isAvailableForWork: true,
      resumeUrl: "https://example.com/resume.pdf",
    },
  });

  return (
    <div className="relative">
      {/* TEMPLATE SWITCHER PREVIEW BAR FOR TESTING PRESENTATION INDEPENDENCE */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs px-4 py-2 flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Public URL: <strong className="text-white">/u/{username}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Switch Template:</span>
          <a
            href={`/u/${username}?template=developer`}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              portfolioData.templateId === "developer"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Developer
          </a>
          <a
            href={`/u/${username}?template=minimal`}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              portfolioData.templateId === "minimal"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Minimal
          </a>
        </div>
      </div>

      <RenderPortfolioTemplate data={portfolioData} />
    </div>
  );
}
