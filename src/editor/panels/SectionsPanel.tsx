"use client";

import React from "react";
import { useEditor } from "../EditorContext";
import { Eye, EyeOff, ArrowUp, ArrowDown, Layers, ShieldCheck } from "lucide-react";

export const SectionsPanel: React.FC = () => {
  const { portfolio, toggleSectionVisibility, moveSection } = useEditor();

  const sortedSections = [...portfolio.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" /> Section Visibility & Order
        </h2>
        <p className="text-xs text-slate-400">
          Enable or disable sections and adjust display order. Disabling a section hides it from output without deleting its data.
        </p>
      </div>

      <div className="space-y-3">
        {sortedSections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              sec.isVisible
                ? "bg-slate-900/90 border-slate-800 text-white"
                : "bg-slate-950/60 border-slate-900 text-slate-500 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSectionVisibility(sec.type)}
                className={`p-2 rounded-xl transition-colors ${
                  sec.isVisible
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-800 text-slate-500 hover:text-slate-300"
                }`}
                title={sec.isVisible ? "Disable Section" : "Enable Section"}
              >
                {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <div>
                <span className="font-bold text-sm block">{sec.title}</span>
                <span className="text-[10px] font-mono capitalize text-slate-500">
                  {sec.type.replace("_", " ")} • {sec.isVisible ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>

            {/* ACCESSIBLE REORDER CONTROLS */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveSection(sec.type, "up")}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === sortedSections.length - 1}
                onClick={() => moveSection(sec.type, "down")}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Data Safety: Disabling a section hides it from public portfolios while preserving all projects, skills, and research data.</span>
      </div>

    </div>
  );
};
