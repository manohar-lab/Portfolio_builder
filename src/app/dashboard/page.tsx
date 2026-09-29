import React from "react";
import Link from "next/link";
import { requireAuth } from "@/auth/service";
import { getUserPortfolios } from "@/database/portfolio-service";
import { PortfolioCardActions } from "@/dashboard/PortfolioCardActions";
import { PlusCircle, Layers, Sparkles, CheckCircle2, Clock } from "lucide-react";

export default async function DashboardOverviewPage() {
  const userData = await requireAuth("/dashboard");
  const portfolios = await getUserPortfolios();

  const displayName =
    userData.profile?.full_name ||
    userData.internalUser?.full_name ||
    userData.authUser.email.split("@")[0];

  return (
    <div className="space-y-8">
      
      {/* WELCOME BANNER & ACTION HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Overview
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-slate-400">
            Create, edit, customize, and publish your professional portfolio websites.
          </p>
        </div>

        <Link
          href="/dashboard/portfolio/new"
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create New Portfolio
        </Link>
      </div>

      {/* PORTFOLIOS CATALOG */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Your Portfolios ({portfolios.length})
          </h2>
        </div>

        {portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
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

                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                    <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-300 font-mono">
                      Template: {portfolio.templateId}
                    </span>
                    <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-400">
                      Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                    </span>
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
                Create your first portfolio to start adding projects, experience, education, skills, and research entries.
              </p>
            </div>
            <Link
              href="/dashboard/portfolio/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" /> Create First Portfolio
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
