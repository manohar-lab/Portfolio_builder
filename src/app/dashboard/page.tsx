import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/auth/service";
import { getUserPortfolios } from "@/database/portfolio-service";
import { getUserOnboardingStatus } from "@/services/onboarding-service";
import { PortfolioCardActions } from "@/dashboard/PortfolioCardActions";
import { GitHubIntegrationCard } from "@/dashboard/GitHubIntegrationCard";
import { FeedbackTriggerButton } from "@/dashboard/FeedbackTriggerButton";
import {
  PlusCircle,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  LayoutTemplate,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const userData = await requireAuth("/dashboard");
  const onboardingStatus = await getUserOnboardingStatus();
  const portfolios = await getUserPortfolios();

  // FIRST-TIME USER REDIRECT: If no portfolio exists and onboarding incomplete, redirect to /onboarding
  if (portfolios.length === 0 && !onboardingStatus.onboardingCompleted) {
    redirect("/onboarding");
  }

  const displayName =
    userData.profile?.full_name ||
    userData.internalUser?.full_name ||
    userData.authUser.email.split("@")[0];

  const firstPortfolioId = portfolios.length > 0 ? portfolios[0].id : undefined;

  return (
    <div className="space-y-8">
      {/* CONTINUE ONBOARDING BANNER IF INCOMPLETE */}
      {!onboardingStatus.onboardingCompleted && (
        <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-amber-300">Continue building your portfolio?</h3>
            <p className="text-xs text-amber-200/70">
              You left onboarding at Step {onboardingStatus.onboardingStep}. Finish setup to configure template & sections.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            Resume Onboarding <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* WELCOME BANNER & ACTION HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Overview
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider">
              Beta Release
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-slate-400">
            Manage your portfolios, switch visual templates, import GitHub projects, and publish updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <FeedbackTriggerButton />

          <Link
            href="/dashboard/import"
            className="px-4 py-3 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 font-semibold rounded-xl text-xs transition border border-indigo-500/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> Import Information
          </Link>

          <Link
            href="/dashboard/templates"
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700 flex items-center gap-2"
          >
            <LayoutTemplate className="w-4 h-4 text-indigo-400" /> Template Gallery
          </Link>

          <Link
            href="/dashboard/portfolio/new"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Create New Portfolio
          </Link>
        </div>
      </div>

      {/* GITHUB INTEGRATION & PORTFOLIOS CATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <GitHubIntegrationCard defaultPortfolioId={firstPortfolioId} />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Your Portfolios ({portfolios.length})
            </h2>
          </div>

          {portfolios.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-white">{portfolio.title}</h3>
                        <p className="text-xs text-slate-400 font-mono pt-0.5">/u/{portfolio.slug}</p>
                      </div>

                      {portfolio.isPublished ? (
                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </div>

                    {/* Metadata & Template indicator */}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-300 font-mono capitalize">
                        Template: {portfolio.templateId}
                      </span>
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-400">
                        Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Portfolio Readiness Progress Indicator */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-300 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Portfolio Readiness Score
                        </span>
                        <span className="text-indigo-400 font-mono">80%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          style={{ width: "80%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <PortfolioCardActions portfolio={portfolio} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Portfolios Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create your first portfolio or start onboarding to customize your design.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" /> Start Onboarding
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
