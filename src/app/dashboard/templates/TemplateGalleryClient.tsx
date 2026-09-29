"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { PortfolioMeta, PortfolioData } from "@/types/portfolio";
import { updateTemplateAction } from "@/dashboard/actions";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import {
  LayoutTemplate,
  Eye,
  Check,
  Filter,
  ArrowLeft,
  X,
  ArrowRight,
} from "lucide-react";

interface TemplateGalleryClientProps {
  initialPortfolios: PortfolioMeta[];
  samplePortfolio: PortfolioData;
}

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "developer", label: "Developer" },
  { id: "research", label: "Research" },
  { id: "minimal", label: "Minimal" },
  { id: "student", label: "Student" },
  { id: "creative", label: "Creative" },
];

export const TemplateGalleryClient: React.FC<TemplateGalleryClientProps> = ({
  initialPortfolios,
  samplePortfolio,
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(
    initialPortfolios.length > 0 ? initialPortfolios[0].id : ""
  );
  const [applying, setApplying] = useState<boolean>(false);

  const filteredTemplates = AVAILABLE_TEMPLATES.filter((tpl) => {
    if (selectedCategory === "all") return true;
    return tpl.category === selectedCategory;
  });

  const handleApplyTemplate = async (templateId: string) => {
    if (!selectedPortfolioId) {
      // If no portfolio exists, redirect to onboarding or new portfolio page
      router.push(`/dashboard/portfolio/new?templateId=${templateId}`);
      return;
    }

    setApplying(true);
    try {
      const res = await updateTemplateAction(selectedPortfolioId, templateId);
      if (res.success) {
        router.push(`/dashboard/portfolio/${selectedPortfolioId}`);
      } else {
        alert(res.error || "Failed to update template.");
      }
    } catch (err) {
      console.error("Error applying template:", err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <LayoutTemplate className="w-7 h-7 text-indigo-400" /> Template Gallery
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Choose a visual design tailored for your profile. All templates use the same portfolio data model — switch designs anytime without re-keying information.
          </p>
        </div>

        {/* Portfolio Selection Dropdown if user owns portfolios */}
        {initialPortfolios.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-slate-300">Target Portfolio to Customize:</span>
            <select
              value={selectedPortfolioId}
              onChange={(e) => setSelectedPortfolioId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-semibold focus:outline-none focus:border-indigo-500"
            >
              {initialPortfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (/u/{p.slug})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pr-2">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Templates Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          const activePortfolio = initialPortfolios.find((p) => p.id === selectedPortfolioId);
          const isCurrentTemplate = activePortfolio?.templateId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                tpl.isAvailable
                  ? isCurrentTemplate
                    ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                  : "bg-slate-900/40 border-slate-800/60 opacity-60"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{tpl.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      {tpl.category}
                    </span>
                  </div>

                  {isCurrentTemplate && (
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}

                  {!tpl.isAvailable && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-slate-800 text-slate-500 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                {tpl.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tpl.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] bg-slate-800/80 text-slate-300 font-mono rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {tpl.bestFor && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Best Suited For:</span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {tpl.bestFor.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6">
                {tpl.isAvailable ? (
                  <>
                    <button
                      onClick={() => handleApplyTemplate(tpl.id)}
                      disabled={applying || isCurrentTemplate}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isCurrentTemplate
                          ? "bg-slate-800 text-slate-400 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      }`}
                    >
                      {isCurrentTemplate ? "Currently Applied" : "Use Template"}
                    </button>

                    <button
                      onClick={() => setPreviewTemplateId(tpl.id)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center"
                      title="Preview template design"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800/50 text-slate-500 cursor-not-allowed text-center"
                  >
                    Template In Development
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Realistic Live Preview Modal */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-white text-sm capitalize">
                  Realistic Template Preview: {previewTemplateId}
                </h3>
              </div>

              <button
                onClick={() => setPreviewTemplateId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
              <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl bg-white">
                <PortfolioRenderer
                  data={{
                    ...samplePortfolio,
                    templateId: previewTemplateId,
                  }}
                  isPreview={true}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  const tplId = previewTemplateId;
                  setPreviewTemplateId(null);
                  handleApplyTemplate(tplId);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                Use {previewTemplateId} Template <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
