"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PortfolioMeta, VisibilityMode } from "@/types/portfolio";
import {
  deletePortfolioAction,
  updatePortfolioStatusAction,
  updatePortfolioSlugAction,
} from "@/dashboard/actions";
import { updateVisibilityModeAction } from "@/dashboard/showcase-actions";
import { SharePanel } from "@/dashboard/SharePanel";
import { GitHubIntegrationCard } from "@/dashboard/GitHubIntegrationCard";
import { FeedbackTriggerButton } from "@/dashboard/FeedbackTriggerButton";
import {
  PlusCircle,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  LayoutTemplate,
  Search,
  ChevronDown,
  Edit3,
  ExternalLink,
  Share2,
  Settings,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Globe,
  ShieldAlert,
  X,
  Copy,
  Check,
} from "lucide-react";

interface DashboardClientWorkspaceProps {
  initialPortfolios: PortfolioMeta[];
  displayName: string;
  onboardingStatus: {
    onboardingCompleted: boolean;
    onboardingStep: number;
  };
}

export function DashboardClientWorkspace({
  initialPortfolios,
  displayName,
  onboardingStatus,
}: DashboardClientWorkspaceProps) {
  const [portfolios, setPortfolios] = useState<PortfolioMeta[]>(initialPortfolios);
  const [activePortfolioId, setActivePortfolioId] = useState<string>(
    initialPortfolios.length > 0 ? initialPortfolios[0].id : ""
  );

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | VisibilityMode>("ALL");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated");

  // Active Modals State
  const [shareModalPortfolio, setShareModalPortfolio] = useState<PortfolioMeta | null>(null);
  const [settingsModalPortfolio, setSettingsModalPortfolio] = useState<PortfolioMeta | null>(null);
  const [unpublishConfirmPortfolio, setUnpublishConfirmPortfolio] = useState<PortfolioMeta | null>(null);
  const [deleteConfirmPortfolio, setDeleteConfirmPortfolio] = useState<PortfolioMeta | null>(null);
  const [deleteInputText, setDeleteInputText] = useState("");

  // Settings Modal Tabs
  const [settingsTab, setSettingsTab] = useState<"general" | "visibility" | "danger">("general");
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Copy URL Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Time-of-day greeting
  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Active Portfolio object
  const activePortfolio = useMemo(() => {
    return portfolios.find((p) => p.id === activePortfolioId) || portfolios[0] || null;
  }, [portfolios, activePortfolioId]);

  // Filtered & Sorted Portfolios
  const filteredPortfolios = useMemo(() => {
    return portfolios
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "PUBLISHED" && p.isPublished) ||
          (statusFilter === "DRAFT" && !p.isPublished);
        const matchesVisibility =
          visibilityFilter === "ALL" || p.visibilityMode === visibilityFilter;

        return matchesSearch && matchesStatus && matchesVisibility;
      })
      .sort((a, b) => {
        if (sortBy === "updated") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === "created") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.title.localeCompare(b.title);
      });
  }, [portfolios, searchQuery, statusFilter, visibilityFilter, sortBy]);

  // Quick Copy URL
  const handleCopyLink = async (slug: string, id: string) => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/u/${slug}`
      : `/u/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      console.error("Failed to copy link");
    }
  };

  // Toggle Publish / Unpublish Action
  const handleTogglePublish = async (portfolio: PortfolioMeta) => {
    if (portfolio.isPublished) {
      setUnpublishConfirmPortfolio(portfolio);
      return;
    }
    // Publish Action
    const res = await updatePortfolioStatusAction(portfolio.id, true);
    if (res.success) {
      setPortfolios((prev) =>
        prev.map((p) => (p.id === portfolio.id ? { ...p, isPublished: true, status: "PUBLISHED" } : p))
      );
    }
  };

  const confirmUnpublish = async () => {
    if (!unpublishConfirmPortfolio) return;
    const res = await updatePortfolioStatusAction(unpublishConfirmPortfolio.id, false);
    if (res.success) {
      setPortfolios((prev) =>
        prev.map((p) => (p.id === unpublishConfirmPortfolio.id ? { ...p, isPublished: false, status: "DRAFT" } : p))
      );
    }
    setUnpublishConfirmPortfolio(null);
  };

  // Visibility Mode Change Action
  const handleVisibilityChange = async (portfolioId: string, mode: VisibilityMode) => {
    const isPublicFlag = mode !== "private";
    const res = await updateVisibilityModeAction(portfolioId, mode);
    if (res.success) {
      setPortfolios((prev) =>
        prev.map((p) => (p.id === portfolioId ? { ...p, visibilityMode: mode, isPublic: isPublicFlag } : p))
      );
      setSettingsMessage("Visibility updated successfully.");
    } else {
      setSettingsMessage("Failed to update visibility mode.");
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsModalPortfolio) return;
    setSavingSettings(true);
    setSettingsMessage(null);

    if (editSlug !== settingsModalPortfolio.slug) {
      const slugRes = await updatePortfolioSlugAction(settingsModalPortfolio.id, editSlug);
      if (!slugRes.success) {
        setSettingsMessage(slugRes.error || "Failed to update slug.");
        setSavingSettings(false);
        return;
      }
    }

    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === settingsModalPortfolio.id
          ? { ...p, title: editTitle, slug: editSlug, updatedAt: new Date().toISOString() }
          : p
      )
    );
    setSavingSettings(false);
    setSettingsMessage("Settings saved successfully.");
  };

  // Delete Portfolio Action
  const handleDeletePortfolio = async () => {
    if (!deleteConfirmPortfolio) return;
    if (deleteInputText.trim() !== deleteConfirmPortfolio.title.trim()) return;

    const res = await deletePortfolioAction(deleteConfirmPortfolio.id);
    if (res.success) {
      const updated = portfolios.filter((p) => p.id !== deleteConfirmPortfolio.id);
      setPortfolios(updated);
      if (activePortfolioId === deleteConfirmPortfolio.id && updated.length > 0) {
        setActivePortfolioId(updated[0].id);
      }
      setDeleteConfirmPortfolio(null);
      setDeleteInputText("");
    }
  };

  const openSettingsModal = (portfolio: PortfolioMeta) => {
    setSettingsModalPortfolio(portfolio);
    setEditTitle(portfolio.title);
    setEditSlug(portfolio.slug);
    setSettingsTab("general");
    setSettingsMessage(null);
  };

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

      {/* HEADER BANNER & ACTIVE PORTFOLIO SWITCHER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Authenticated Workspace
            </span>
            {activePortfolio && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Active: {activePortfolio.title}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {greetingTime}, {displayName}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Manage, edit, customize, and publish your personal portfolio websites from a single control center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Portfolio Switcher Dropdown (Multi-Portfolio Support) */}
          {portfolios.length > 1 && (
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Portfolio Context
              </label>
              <div className="relative">
                <select
                  value={activePortfolioId}
                  onChange={(e) => setActivePortfolioId(e.target.value)}
                  className="appearance-none bg-slate-900 border border-indigo-500/40 text-slate-100 font-semibold text-xs rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-md"
                >
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.isPublished ? "Published" : "Draft"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-indigo-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <FeedbackTriggerButton />

          <Link
            href="/dashboard/import"
            className="px-4 py-2.5 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 font-semibold rounded-xl text-xs transition border border-indigo-500/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> Import Center
          </Link>

          <Link
            href="/dashboard/portfolio/new"
            className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Create Portfolio
          </Link>
        </div>
      </div>

      {/* SEARCH, FILTER & NEUTRAL SORT TOOLBAR */}
      {portfolios.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search portfolios by title or URL slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-500 hover:text-slate-300 absolute right-3 top-2.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as "ALL" | VisibilityMode)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Visibility</option>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "updated" | "created" | "title")}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none font-medium"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Created Date</option>
              <option value="title">Name (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* MAIN BODY GRID: SIDEBAR INTEGRATIONS & PORTFOLIOS CATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Integrations & Quick Links */}
        <div className="md:col-span-1 space-y-6">
          <GitHubIntegrationCard defaultPortfolioId={activePortfolioId} />

          {/* Quick Dashboard Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Management Shortcuts
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/dashboard/templates"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <span className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-indigo-400" /> Browse Template Library
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
              <Link
                href="/dashboard/import"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Unified Profile Import
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
              <Link
                href="/dashboard/account"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" /> Subscription & Settings
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Portfolios Cards Catalog */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Your Portfolios ({filteredPortfolios.length})
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-400">
                Filtered from {portfolios.length} total
              </span>
            )}
          </div>

          {filteredPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredPortfolios.map((portfolio) => {
                const isActive = portfolio.id === activePortfolioId;

                return (
                  <div
                    key={portfolio.id}
                    className={`p-6 rounded-2xl space-y-5 transition-all flex flex-col justify-between border ${
                      isActive
                        ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/40"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header & Badges */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">{portfolio.title}</h3>
                            {isActive && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-600 text-white tracking-wide">
                                Active Context
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono pt-0.5">/u/{portfolio.slug}</p>
                        </div>

                        {/* Status & Visibility Badges with Explanations */}
                        <div className="flex items-center gap-2">
                          {/* Publish Status Badge */}
                          {portfolio.isPublished ? (
                            <div className="group relative">
                              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-1 cursor-help">
                                <CheckCircle2 className="w-3 h-3" /> Published
                              </span>
                              <div className="absolute right-0 top-7 z-30 hidden w-48 rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-300 shadow-xl border border-slate-800 group-hover:block whitespace-normal">
                                <strong>Published:</strong> Your latest approved edits are publicly live.
                              </div>
                            </div>
                          ) : (
                            <div className="group relative">
                              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md flex items-center gap-1 cursor-help">
                                <Clock className="w-3 h-3" /> Draft
                              </span>
                              <div className="absolute right-0 top-7 z-30 hidden w-48 rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-300 shadow-xl border border-slate-800 group-hover:block whitespace-normal">
                                <strong>Draft:</strong> Changes are saved locally and not yet published.
                              </div>
                            </div>
                          )}

                          {/* Visibility Mode Badge */}
                          <div className="group relative">
                            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded-md capitalize flex items-center gap-1 cursor-help">
                              <Globe className="w-3 h-3 text-indigo-400" /> {portfolio.visibilityMode || "unlisted"}
                            </span>
                            <div className="absolute right-0 top-7 z-30 hidden w-56 rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-300 shadow-xl border border-slate-800 group-hover:block whitespace-normal">
                              {portfolio.visibilityMode === "public" && (
                                <span><strong>Public:</strong> Listed in Showcase Discovery and indexed by search engines.</span>
                              )}
                              {(portfolio.visibilityMode === "unlisted" || !portfolio.visibilityMode) && (
                                <span><strong>Unlisted:</strong> Accessible via direct link, but hidden from Showcase and Sitemap.</span>
                              )}
                              {portfolio.visibilityMode === "private" && (
                                <span><strong>Private:</strong> Only visible to you in workspace preview.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Details */}
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-300 font-mono capitalize">
                          Template: {portfolio.templateId}
                        </span>
                        <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-400">
                          Updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Readiness Guidance Bar */}
                      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Portfolio Readiness
                          </span>
                          <span className="text-indigo-400 font-mono">85% Complete</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                            style={{ width: "85%" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <Link
                          href={`/dashboard/portfolio/${portfolio.id}/editor`}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </Link>

                        {/* Copy Link */}
                        {portfolio.isPublished && (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(portfolio.slug, portfolio.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
                          >
                            {copiedId === portfolio.id ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3.5 h-3.5" /> Copied!
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Link
                              </>
                            )}
                          </button>
                        )}

                        {/* Share Modal Trigger */}
                        {portfolio.isPublished && (
                          <button
                            type="button"
                            onClick={() => setShareModalPortfolio(portfolio)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Share & QR
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Settings Button */}
                        <button
                          type="button"
                          onClick={() => openSettingsModal(portfolio)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition"
                          title="Portfolio Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>

                        {/* View Live / Publish Toggle */}
                        {portfolio.isPublished ? (
                          <a
                            href={`/u/${portfolio.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Live
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(portfolio)}
                            className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Portfolios Match Filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or filter parameters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setVisibilityFilter("ALL");
                }}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SHARE MODAL (PHASE 26 REUSE) */}
      {shareModalPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end pb-2">
              <button
                onClick={() => setShareModalPortfolio(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SharePanel
              portfolioId={shareModalPortfolio.id}
              slug={shareModalPortfolio.slug}
              isPublished={shareModalPortfolio.isPublished}
              displayName={displayName}
            />
          </div>
        </div>
      )}

      {/* UNPUBLISH CONFIRMATION MODAL */}
      {unpublishConfirmPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Unpublish Portfolio?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unpublishing &quot;{unpublishConfirmPortfolio.title}&quot; will make its public URL temporarily unavailable. All projects, skills, and portfolio data will remain preserved.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUnpublishConfirmPortfolio(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnpublish}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl"
              >
                Confirm Unpublish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL (GENERAL, VISIBILITY & DANGER ZONE) */}
      {settingsModalPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Portfolio Settings: {settingsModalPortfolio.title}
              </h3>
              <button
                onClick={() => setSettingsModalPortfolio(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setSettingsTab("general")}
                className={`flex-1 py-2 text-center transition border-b-2 ${
                  settingsTab === "general"
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setSettingsTab("visibility")}
                className={`flex-1 py-2 text-center transition border-b-2 ${
                  settingsTab === "visibility"
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Visibility
              </button>
              <button
                onClick={() => setSettingsTab("danger")}
                className={`flex-1 py-2 text-center transition border-b-2 ${
                  settingsTab === "danger"
                    ? "border-rose-500 text-rose-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-rose-400"
                }`}
              >
                Danger Zone
              </button>
            </div>

            {settingsMessage && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                {settingsMessage}
              </div>
            )}

            {/* Tab 1: General Settings */}
            {settingsTab === "general" && (
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Portfolio Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Public URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Public link will be: /u/{editSlug}
                  </span>
                </div>
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    {savingSettings ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Visibility Mode Controls */}
            {settingsTab === "visibility" && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400">Choose how your portfolio is discovered and indexed:</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50">
                    <input
                      type="radio"
                      name="visMode"
                      checked={settingsModalPortfolio.visibilityMode === "public"}
                      onChange={() => handleVisibilityChange(settingsModalPortfolio.id, "public")}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="font-bold text-white block">Public</span>
                      <span className="text-[11px] text-slate-400">Discoverable in showcase and indexed by search engines.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50">
                    <input
                      type="radio"
                      name="visMode"
                      checked={settingsModalPortfolio.visibilityMode === "unlisted" || !settingsModalPortfolio.visibilityMode}
                      onChange={() => handleVisibilityChange(settingsModalPortfolio.id, "unlisted")}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="font-bold text-white block">Unlisted</span>
                      <span className="text-[11px] text-slate-400">Accessible via direct link, but hidden from Showcase and Sitemap.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50">
                    <input
                      type="radio"
                      name="visMode"
                      checked={settingsModalPortfolio.visibilityMode === "private"}
                      onChange={() => handleVisibilityChange(settingsModalPortfolio.id, "private")}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="font-bold text-white block">Private</span>
                      <span className="text-[11px] text-slate-400">Only visible to you while editing in workspace.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: Danger Zone & Deletion Confirmation */}
            {settingsTab === "danger" && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Permanent Portfolio Deletion
                  </span>
                  <p className="text-[11px] text-rose-200/80">
                    Deleting a portfolio permanently removes its profile data, projects, skills, and configuration. This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmPortfolio(settingsModalPortfolio);
                    setDeleteInputText("");
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Portfolio
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PORTFOLIO DELETION CONFIRMATION DIALOG */}
      {deleteConfirmPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/40 p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Portfolio Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To prevent accidental deletion, please type the exact title of your portfolio below to confirm:
            </p>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono font-bold text-xs text-indigo-400">
              {deleteConfirmPortfolio.title}
            </div>
            <div>
              <input
                type="text"
                value={deleteInputText}
                onChange={(e) => setDeleteInputText(e.target.value)}
                placeholder="Type exact portfolio title"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPortfolio(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePortfolio}
                disabled={deleteInputText.trim() !== deleteConfirmPortfolio.title.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
