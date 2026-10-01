"use client";

import React, { useState, useEffect } from "react";
import { TemplateMetadata, TemplateSortOption } from "@/types/template";
import { switchTemplateAction } from "@/dashboard/template-actions";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import { SAMPLE_PORTFOLIO_DATA } from "@/templates/sample-portfolio-data";
import {
  Search,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  LayoutTemplate,
  Check,
  Heart,
  Monitor,
  Tablet,
  Smartphone,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface TemplateBrowserClientProps {
  initialTemplates: TemplateMetadata[];
  userPortfolios?: Array<{ id: string; title: string; templateId: string }>;
  isLoggedIn: boolean;
  isProUser: boolean;
}

export function TemplateBrowserClient({
  initialTemplates,
  userPortfolios = [],
  isLoggedIn,
  isProUser,
}: TemplateBrowserClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<TemplateSortOption>("newest");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Favorites State
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("favorite_templates");
      if (saved) setFavoriteIds(JSON.parse(saved));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleFavorite = (templateId: string) => {
    const updated = favoriteIds.includes(templateId)
      ? favoriteIds.filter((id) => id !== templateId)
      : [...favoriteIds, templateId];
    setFavoriteIds(updated);
    try {
      localStorage.setItem("favorite_templates", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<TemplateMetadata | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Template Switching / Apply Modal
  const [applyModalTemplate, setApplyModalTemplate] = useState<TemplateMetadata | null>(null);
  const [targetPortfolioId, setTargetPortfolioId] = useState<string>(userPortfolios[0]?.id || "");
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState<string | null>(null);

  // Filter logic
  let filtered = initialTemplates;

  if (showFavoritesOnly) {
    filtered = filtered.filter((t) => favoriteIds.includes(t.id));
  }

  if (selectedCategory && selectedCategory !== "all") {
    const cat = selectedCategory.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.category.toLowerCase() === cat ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase() === cat))
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  if (selectedSort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedSort === "recently_updated") {
    filtered.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  } else {
    filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  const handleApplyTemplate = async () => {
    if (!applyModalTemplate || !targetPortfolioId) return;
    setIsApplying(true);
    setApplyErrorMsg(null);
    setApplySuccessMsg(null);

    const res = await switchTemplateAction(targetPortfolioId, applyModalTemplate.id);
    setIsApplying(false);

    if (res.success) {
      setApplySuccessMsg(`Template '${applyModalTemplate.name}' applied successfully! All portfolio content preserved.`);
      setTimeout(() => {
        setApplySuccessMsg(null);
        setApplyModalTemplate(null);
      }, 1800);
    } else {
      setApplyErrorMsg(res.error || "Failed to switch template.");
    }
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: "all", label: "All Templates" },
    { id: "minimal", label: "Minimal" },
    { id: "developer", label: "Developer" },
    { id: "research", label: "Researcher" },
    { id: "student", label: "Student" },
    { id: "creative", label: "Creative" },
    { id: "ai_tech", label: "AI / Tech" },
  ];

  return (
    <div className="space-y-8">
      {/* SEARCH AND FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, category, tech stack, or target role..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* CATEGORY PILLS, FAVORITES TOGGLE & SORTING */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowFavoritesOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedCategory === cat.id && !showFavoritesOnly
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                showFavoritesOnly
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-rose-300"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-white" : ""}`} />
              Saved Favorites ({favoriteIds.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as TemplateSortOption)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="recently_updated">Recently Updated</option>
              <option value="name">Alphabetical (Name)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TEMPLATE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => {
          const isFav = favoriteIds.includes(tpl.id);
          const isProLocked = tpl.isPro && !isProUser;

          return (
            <div
              key={tpl.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-indigo-500/50 hover:shadow-xl transition duration-200 group relative"
            >
              <div className="space-y-4">
                {/* CARD TOP HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                      {tpl.name}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block mt-0.5">
                      {tpl.category} • v{tpl.version}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleFavorite(tpl.id)}
                      title={isFav ? "Remove from Favorites" : "Save to Favorites"}
                      className={`p-1.5 rounded-xl border transition ${
                        isFav
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:text-rose-400"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-rose-400" : ""}`} />
                    </button>

                    {tpl.isPro ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Pro
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Free
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                {/* SUITABILITY ITEMS */}
                {tpl.bestFor && tpl.bestFor.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Best Suited For:</span>
                    <ul className="space-y-1">
                      {tpl.bestFor.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" /> Preview
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      window.location.href = "/login?redirectTo=/templates";
                    } else {
                      setApplyModalTemplate(tpl);
                    }
                  }}
                  className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm ${
                    isProLocked
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE PREVIEW MODAL WITH DEVICE VIEWPORT TOGGLES */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          {/* Preview Modal Header */}
          <div className="flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <LayoutTemplate className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{previewTemplate.name} Template</h3>
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  {previewTemplate.category} • v{previewTemplate.version}
                </span>
              </div>
            </div>

            {/* Device Viewport Selector */}
            <div className="flex items-center gap-1 bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setPreviewDevice("desktop")}
                title="Desktop View (100%)"
                className={`p-1.5 rounded-lg transition ${
                  previewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                title="Tablet View (768px)"
                className={`p-1.5 rounded-lg transition ${
                  previewDevice === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                title="Mobile View (375px)"
                className={`p-1.5 rounded-lg transition ${
                  previewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setApplyModalTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" /> Use This Template
              </button>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950">
            <div
              className={`bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
                previewDevice === "desktop"
                  ? "w-full max-w-5xl"
                  : previewDevice === "tablet"
                  ? "w-[768px] max-w-full my-auto"
                  : "w-[375px] max-w-full my-auto border-8 border-slate-800 rounded-[32px]"
              }`}
            >
              <PortfolioRenderer
                data={{
                  ...SAMPLE_PORTFOLIO_DATA,
                  templateId: previewTemplate.id,
                  title: `${previewTemplate.name} Synthetic Demo`,
                }}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* APPLY TEMPLATE CONFIRMATION MODAL WITH CONTENT PRESERVATION GUARANTEE */}
      {applyModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 text-slate-100">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Apply Template</h3>
            </div>

            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2 text-xs">
              <p className="text-indigo-200 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Content Preservation Guarantee
              </p>
              <p className="text-slate-300 leading-relaxed">
                Your portfolio content will remain 100% intact. Name, About, Projects, Skills, Experience, Education, Certifications, and Contact info are preserved completely. Only visual presentation will change.
              </p>
            </div>

            {userPortfolios.length > 0 ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Select Target Portfolio</label>
                <select
                  value={targetPortfolioId}
                  onChange={(e) => setTargetPortfolioId(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {userPortfolios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                You will be redirected to onboarding to create your first portfolio with this template.
              </p>
            )}

            {applyErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs">
                {applyErrorMsg}
              </div>
            )}

            {applySuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{applySuccessMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalTemplate(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyTemplate}
                disabled={isApplying}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isApplying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Apply Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

