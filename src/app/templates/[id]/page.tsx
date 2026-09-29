import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailableTemplates } from "@/templates/registry";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import { getAuthenticatedUser } from "@/auth/service";
import { Sparkles, ArrowLeft, ArrowRight, LayoutTemplate } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const templates = getAvailableTemplates();
  const template = templates.find((t) => t.id === resolvedParams.id);

  if (!template) {
    return {
      title: "Template Not Found | PortfolioCraft",
    };
  }

  return {
    title: `${template.name} Template Preview | PortfolioCraft`,
    description: template.description,
  };
}

export default async function TemplateInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const templates = getAvailableTemplates();
  const template = templates.find((t) => t.id === resolvedParams.id);

  if (!template) {
    notFound();
  }

  const user = await getAuthenticatedUser();

  const sampleData = normalizePortfolioData({
    templateId: template.id,
    title: `${template.name} Preview Portfolio`,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> All Templates
          </Link>
          <span className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-xs">
            <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">{template.name} Template</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">({template.category})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={user ? `/dashboard/templates` : `/login?redirectTo=/onboarding`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Use This Template <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Inspection Container */}
      <main className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
          <PortfolioRenderer data={sampleData} isPreview={true} />
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <footer className="border-t border-slate-900 bg-slate-950 p-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto w-full gap-2">
        <p>Like this design? All user portfolio data maps cleanly to this template.</p>
        <Link
          href={user ? `/dashboard/templates` : `/login?redirectTo=/onboarding`}
          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
        >
          Build your portfolio with {template.name} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </footer>
    </div>
  );
}
