"use client";

import React from "react";
import { useEditor } from "../EditorContext";
import { getAvailableTemplates } from "@/templates/registry";
import { Layers, CheckCircle2, ShieldCheck } from "lucide-react";

export const TemplatePanel: React.FC = () => {
  const { portfolio, changeTemplate } = useEditor();
  const availableTemplates = getAvailableTemplates();

  return (
    <div className="space-y-6">
      
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" /> Presentation Template Selector
        </h2>
        <p className="text-xs text-slate-400">
          Switch presentation styles. All your portfolio data, project details, education, and research entries are 100% preserved.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {availableTemplates.map((tmpl) => {
          const isSelected = portfolio.templateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => changeTemplate(tmpl.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? "bg-slate-900 border-blue-500 ring-2 ring-blue-500/20"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{tmpl.name}</h3>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{tmpl.description}</p>
              </div>

              <button
                type="button"
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {isSelected ? "Selected" : "Select Template"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Data Preservation: Changing templates alters only visual rendering. Your underlying projects, skills, and education remain identical.</span>
      </div>

    </div>
  );
};
