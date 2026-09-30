import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/auth/service";
import { TemplateRegistryService } from "@/services/template-registry-service";
import { getUserPortfolios } from "@/database/portfolio-service";
import { TemplateBrowserClient } from "./TemplateBrowserClient";
import { ArrowLeft, LayoutTemplate } from "lucide-react";

export const metadata = {
  title: "Portfolio Template Library | PortfolioCraft",
  description:
    "Browse student, developer, researcher, and creative portfolio templates. Switch presentation themes anytime while preserving 100% of your portfolio content.",
};

import { BillingService } from "@/services/billing-service";

export default async function PublicTemplatesPage() {
  const user = await getAuthenticatedUser();
  const registryService = new TemplateRegistryService();
  const templates = registryService.getActiveTemplates();

  let userPortfolios: Array<{ id: string; title: string; templateId: string }> = [];
  let isProUser = false;

  if (user?.authUser) {
    try {
      const ports = await getUserPortfolios();
      userPortfolios = ports.map((p) => ({ id: p.id, title: p.title, templateId: p.templateId }));
    } catch {
      userPortfolios = [];
    }

    const billingService = new BillingService();
    const sub = await billingService.getUserSubscription(user.authUser.id);
    isProUser = sub.plan === "pro";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              P
            </div>
            <span>PortfolioCraft</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Build Portfolio
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <LayoutTemplate className="w-4 h-4" /> Scalable Template Engine
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Explore Portfolio Templates
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            All templates consume the exact same underlying portfolio data model. Switch designs anytime without re-keying your projects, skills, research, or experience.
          </p>
        </div>

        {/* Template Browser Client Grid */}
        <TemplateBrowserClient
          initialTemplates={templates}
          userPortfolios={userPortfolios}
          isLoggedIn={!!user?.authUser}
          isProUser={isProUser}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-600">
        PortfolioCraft SaaS &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
