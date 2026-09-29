"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { updateTemplateAction } from "@/dashboard/actions";
import { getAvailableTemplates, RenderPortfolioTemplate } from "@/templates/registry";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { ArrowLeft, CheckCircle2, Sparkles, Loader2, Globe } from "lucide-react";

interface TemplateSelectorPageProps {
  params: Promise<{ id: string }>;
}

export default function TemplateSelectorPage({ params }: TemplateSelectorPageProps) {
  const { id: portfolioId } = use(params);

  const availableTemplates = getAvailableTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState("developer");
  const [activeTemplateId, setActiveTemplateId] = useState("developer");
  const [isApplying, setIsApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Mock hydration for preview using real data structure
  const portfolioData = normalizePortfolioData({
    id: portfolioId,
    templateId: selectedTemplateId,
  });

  const handleApplyTemplate = async (templateId: string) => {
    setIsApplying(true);
    setSuccessMsg(false);
    try {
      const res = await updateTemplateAction(portfolioId, templateId);
      if (res.success) {
        setActiveTemplateId(templateId);
        setSelectedTemplateId(templateId);
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/portfolio/${portfolioId}`}
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio Management
        </Link>
      </div>

      <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Presentation Layer Engine
            </span>
            <h1 className="text-2xl font-bold text-white">Select Portfolio Template</h1>
            <p className="text-xs text-slate-400">
              Switch presentation styles instantly. All your projects, skills, education, and research entries are preserved.
            </p>
          </div>

          {successMsg && (
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Template Applied Successfully!
            </div>
          )}
        </div>
      </div>

      {/* TEMPLATE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableTemplates.map((tmpl) => {
          const isActive = activeTemplateId === tmpl.id;
          const isSelected = selectedTemplateId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`p-6 bg-slate-900/90 border rounded-3xl space-y-4 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-lg">{tmpl.name}</h3>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-xs text-blue-400 font-medium">
                  {isSelected ? "Currently Previewing" : "Click to Preview"}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTemplate(tmpl.id);
                  }}
                  disabled={isApplying || isActive}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? "bg-slate-800 text-slate-500 cursor-default"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  }`}
                >
                  {isApplying && isSelected ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isActive ? (
                    "In Use"
                  ) : (
                    "Apply Template"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE PREVIEW FRAME CONTAINER */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> Live Interactive Preview ({selectedTemplateId.toUpperCase()} Template)
          </h2>
          <span className="text-xs text-slate-400">Rendering with your portfolio data model</span>
        </div>

        <div className="border border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-950">
          <RenderPortfolioTemplate data={portfolioData} isPreview={true} />
        </div>
      </div>

    </div>
  );
}
