"use me";
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminMetricsAction } from "@/dashboard/admin-actions";
import { OwnerAnalyticsSummary } from "@/services/analytics-service";
import {
  ShieldCheck,
  Users,
  Layers,
  Globe,
  TrendingUp,
  FileText,
  Github,
  QrCode,
  Share2,
  Copy,
  LayoutTemplate,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Activity,
  BarChart3,
  Filter,
} from "lucide-react";

export default function OwnerAdminDashboardPage() {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [metrics, setMetrics] = useState<OwnerAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);

  useEffect(() => {
    loadMetrics(periodDays);
  }, [periodDays]);

  const loadMetrics = async (days: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsForbidden(false);

    try {
      const res = await getAdminMetricsAction(days);
      if (res.success && res.data) {
        setMetrics(res.data);
      } else {
        if (res.error && res.error.includes("403")) {
          setIsForbidden(true);
        } else {
          setErrorMsg(res.error || "Analytics are temporarily unavailable.");
        }
      }
    } catch {
      setErrorMsg("Analytics are temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  // 403 FORBIDDEN STATE FOR REGULAR USERS
  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">403 Access Forbidden</h1>
          <p className="text-xs text-slate-400">
            This dashboard is restricted to platform owners. Regular user accounts do not have access.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
              Platform Owner Dashboard
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> OWNER ROLE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Privacy-conscious product analytics and platform growth overview.
            </p>
          </div>

          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Period:</span>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={0}>All Time</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-400" />
            Loading aggregate owner analytics...
          </div>
        ) : metrics ? (
          <div className="space-y-8">
            {/* 1. OVERVIEW METRICS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{metrics.totalUsers}</p>
                <p className="text-[10px] text-indigo-300">+{metrics.newUsers} in period</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Portfolios</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{metrics.totalPortfolios}</p>
                <p className="text-[10px] text-slate-400">Created across platform</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Published</span>
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-400">{metrics.publishedPortfolios}</p>
                <p className="text-[10px] text-emerald-300 font-mono">{metrics.publishRate}% Publish Rate</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Custom Domains</span>
                  <Globe className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-2xl font-extrabold text-sky-400">{metrics.activeCustomDomains}</p>
                <p className="text-[10px] text-sky-300">Active custom routes</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Share Triggers</span>
                  <Share2 className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-extrabold text-amber-300">
                  {metrics.sharingStats.linkCopied + metrics.sharingStats.shareClicked}
                </p>
                <p className="text-[10px] text-slate-400">Shares & copies</p>
              </div>
            </div>

            {/* 2. PORTFOLIO FUNNEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Portfolio Conversion Funnel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">1. Signed Up</span>
                  <p className="text-xl font-extrabold text-white">{metrics.funnel.signedUp}</p>
                  <span className="text-[10px] text-slate-400">100%</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">2. Onboarding</span>
                  <p className="text-xl font-extrabold text-indigo-300">{metrics.funnel.completedOnboarding}</p>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {metrics.funnel.signedUp > 0 ? Math.round((metrics.funnel.completedOnboarding / metrics.funnel.signedUp) * 100) : 0}%
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">3. Created</span>
                  <p className="text-xl font-extrabold text-purple-300">{metrics.funnel.createdPortfolio}</p>
                  <span className="text-[10px] text-purple-400 font-mono">
                    {metrics.funnel.signedUp > 0 ? Math.round((metrics.funnel.createdPortfolio / metrics.funnel.signedUp) * 100) : 0}%
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">4. Template</span>
                  <p className="text-xl font-extrabold text-sky-300">{metrics.funnel.selectedTemplate}</p>
                  <span className="text-[10px] text-sky-400 font-mono">
                    {metrics.funnel.createdPortfolio > 0 ? Math.round((metrics.funnel.selectedTemplate / metrics.funnel.createdPortfolio) * 100) : 0}%
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">5. Published</span>
                  <p className="text-xl font-extrabold text-emerald-400">{metrics.funnel.publishedPortfolio}</p>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {metrics.funnel.createdPortfolio > 0 ? Math.round((metrics.funnel.publishedPortfolio / metrics.funnel.createdPortfolio) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. TEMPLATE & IMPORT ANALYTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Usage */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-indigo-400" /> Template Usage
                </h3>
                {metrics.templateUsage.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No template selections recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.templateUsage.map((item) => (
                      <div key={item.templateId} className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-300 font-medium">
                          <span className="capitalize">{item.templateId} Template</span>
                          <span>{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Import & Sharing Usage */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Import & Sharing Features
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Github className="w-3.5 h-3.5 text-indigo-400" /> GitHub Imports
                    </span>
                    <p className="text-lg font-bold text-white">{metrics.importStats.githubImports}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Resume Imports
                    </span>
                    <p className="text-lg font-bold text-white">{metrics.importStats.resumeImports}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5 text-indigo-400" /> Links Copied
                    </span>
                    <p className="text-lg font-bold text-white">{metrics.sharingStats.linkCopied}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" /> QRs Downloaded
                    </span>
                    <p className="text-lg font-bold text-white">{metrics.sharingStats.qrDownloaded}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. RECENT OPERATIONAL ACTIVITY STREAM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Recent Operational Activity Stream
              </h3>
              {metrics.recentActivity.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No recent activity recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {metrics.recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="font-semibold text-slate-200">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
