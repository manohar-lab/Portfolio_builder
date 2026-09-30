import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateRegistryService } from "@/services/template-registry-service";
import { SAMPLE_PORTFOLIO_DATA } from "@/templates/sample-portfolio-data";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import { getAuthenticatedUser } from "@/auth/service";
import { Sparkles, ArrowLeft, ArrowRight, LayoutTemplate, Lock } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const registryService = new TemplateRegistryService();
  const template = registryService.getTemplateById(resolvedParams.id);

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
  const registryService = new TemplateRegistryService();
  const template = registryService.getTemplateById(resolvedParams.id);

  if (!template) {
    notFound();
  }

  const user = await getAuthenticatedUser();
  let isProUser = false;
  if (user?.authUser) {
    const { BillingService } = await import("@/services/billing-service");
    const billingService = new BillingService();
    const sub = await billingService.getUserSubscription(user.authUser.id);
    isProUser = sub.plan === "pro";
  }

  const canAccess = registryService.canUserAccessTemplate(isProUser ? "pro" : "free", template);

  // Deterministic sample portfolio rendered with target templateId
  const sampleData = {
    ...SAMPLE_PORTFOLIO_DATA,
    templateId: template.id,
    title: `${template.name} Live Preview Portfolio`,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
            <span className="text-[10px] text-slate-400 font-mono uppercase">({template.category} • v{template.version})</span>
          </div>

          {template.isPro && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Pro
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {canAccess ? (
            <Link
              href={user ? `/dashboard/templates` : `/login?redirectTo=/templates`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Use This Template <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Upgrade to Pro to Unlock <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Main Inspection Container rendering deterministic sample data */}
      <main className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
          <PortfolioRenderer data={sampleData} isPreview={true} />
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <footer className="border-t border-slate-900 bg-slate-950 p-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto w-full gap-2">
        <p>Like this design? All user portfolio data maps cleanly to this template without data loss.</p>
        <Link
          href={user ? `/dashboard/templates` : `/login?redirectTo=/templates`}
          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
        >
          Build your portfolio with {template.name} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </footer>
    </div>
  );
}
