"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TemplateMetadata, TemplateSortOption } from "@/types/template";
import { switchTemplateAction } from "@/dashboard/template-actions";
import {
  Search,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  LayoutTemplate,
  Check,
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
}: TemplateBrowserClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<TemplateSortOption>("newest");

  // Template Switching Modal
  const [applyModalTemplate, setApplyModalTemplate] = useState<TemplateMetadata | null>(null);
  const [targetPortfolioId, setTargetPortfolioId] = useState<string>(userPortfolios[0]?.id || "");
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState<string | null>(null);

  // Filter logic
  let filtered = initialTemplates;

  if (selectedCategory && selectedCategory !== "all") {
    const cat = selectedCategory.toLowerCase();
    filtered = filtered.filter(
      (t) => t.category.toLowerCase() === cat || (t.tags && t.tags.some((tag) => tag.toLowerCase() === cat))
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
      setApplySuccessMsg(`Template '${applyModalTemplate.name}' applied successfully! All portfolio data preserved.`);
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
    { id: "researcher", label: "Researcher" },
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

        {/* CATEGORY PILLS & SORTING */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
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
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-indigo-500/50 hover:shadow-xl transition duration-200 group"
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

                {tpl.isPro ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pro Tier
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Free
                  </span>
                )}
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
              <Link
                href={`/templates/${tpl.id}`}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" /> Preview
              </Link>

              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    window.location.href = "/login?redirectTo=/templates";
                  } else {
                    setApplyModalTemplate(tpl);
                  }
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
              >
                <span>Use</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* APPLY TEMPLATE MODAL */}
      {applyModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 text-slate-100">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Apply Template</h3>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <p className="text-slate-300 font-semibold">
                Apply <strong className="text-white">{applyModalTemplate.name}</strong> to your portfolio?
              </p>
              <p className="text-slate-400 leading-relaxed">
                <strong>Content Preservation Guarantee:</strong> 100% of your projects, skills, profile, experience, and education entries remain saved and intact. Only visual rendering presentation will change.
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
