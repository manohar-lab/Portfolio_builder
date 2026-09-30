"use client";

import React, { useState } from "react";
import {
  AiActionType,
  AiToneOption,
  AiLengthOption,
  AiGenerationResult,
  SkillSuggestionItem,
} from "@/types/ai";
import { generateAiPortfolioContentAction, acceptAiSuggestionAction } from "@/dashboard/ai-actions";
import {
  Sparkles,
  Bot,
  X,
  Check,
  RotateCcw,
  Edit3,
  FileText,
  User,
  FolderGit2,
  Code2,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

interface AiAssistantModalProps {
  portfolioId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyToEditor?: (actionType: AiActionType, content: string | string[]) => void;
}

export function AiAssistantModal({
  portfolioId,
  isOpen,
  onClose,
  onApplyToEditor,
}: AiAssistantModalProps) {
  const [selectedAction, setSelectedAction] = useState<AiActionType>("generate_about");
  const [selectedTone, setSelectedTone] = useState<AiToneOption>("professional");
  const [selectedLength, setSelectedLength] = useState<AiLengthOption>("medium");
  const [customNotes, setCustomNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AiGenerationResult | null>(null);

  const [isEditingSuggestion, setIsEditingSuggestion] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    const res = await generateAiPortfolioContentAction(portfolioId, selectedAction, {
      tone: selectedTone,
      length: selectedLength,
      customPromptNotes: customNotes,
    });

    setIsLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      setEditedText(res.data.content || "");
      setIsEditingSuggestion(false);
    } else {
      setErrorMsg(res.error || "AI generation request failed.");
    }
  };

  const handleAccept = async () => {
    if (!result) return;
    setIsSaving(true);

    const finalContent = isEditingSuggestion ? editedText : result.content || editedText;

    const res = await acceptAiSuggestionAction(portfolioId, selectedAction, finalContent);
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      if (onApplyToEditor) {
        onApplyToEditor(selectedAction, finalContent);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Failed to save suggestion.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
      >
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="text-base font-bold flex items-center gap-2">
                AI Portfolio Assistant <Sparkles className="w-4 h-4 text-indigo-400" />
              </h2>
              <p className="text-[11px] text-slate-300">
                Factual suggestions grounded in your portfolio. You review & accept before saving.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ACTION TYPE SELECTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Select AI Action</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "generate_about" as const, label: "Generate About", icon: User },
                { id: "improve_about" as const, label: "Improve Bio", icon: FileText },
                { id: "generate_headline" as const, label: "Headlines", icon: Sparkles },
                { id: "improve_project" as const, label: "Improve Project", icon: FolderGit2 },
                { id: "suggest_skills" as const, label: "Suggest Skills", icon: Code2 },
                { id: "generate_summary" as const, label: "Portfolio Summary", icon: FileText },
              ].map((act) => {
                const IconComp = act.icon;
                const isSelected = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      setSelectedAction(act.id);
                      setResult(null);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TONE & LENGTH CONTROLS */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Tone
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["professional", "technical", "simple", "concise"] as AiToneOption[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTone(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                      selectedTone === t
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Length</label>
              <div className="flex gap-1.5">
                {(["short", "medium", "detailed"] as AiLengthOption[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSelectedLength(l)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-medium capitalize transition text-center ${
                      selectedLength === l
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="col-span-full space-y-1 pt-1">
              <label className="block text-[11px] font-bold text-slate-700">Optional Focus Notes</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Focus on backend microservices & AI projects"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating Grounded Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate AI Suggestion
              </>
            )}
          </button>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS ALERT */}
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Suggestion accepted & saved to portfolio!</span>
            </div>
          )}

          {/* REVIEW COMPARISON PANEL */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" /> AI Grounded Review & Diff Comparison
              </h3>

              {/* STACKED DIFF: CURRENT VS AI SUGGESTION */}
              {result.originalContent && (
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Current Portfolio Text
                  </span>
                  <p className="text-xs text-slate-700 italic">{result.originalContent || "(Empty)"}</p>
                </div>
              )}

              {/* AI SUGGESTION CONTENT */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    AI Suggested Grounded Text
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingSuggestion(!isEditingSuggestion)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> {isEditingSuggestion ? "Done Editing" : "Edit Text"}
                  </button>
                </div>

                {isEditingSuggestion ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-white border border-indigo-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-xs text-slate-900 leading-relaxed font-normal">
                    {editedText || result.content}
                  </p>
                )}

                {/* HEADLINES OPTION LIST */}
                {result.headlineOptions && result.headlineOptions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Headline Suggestions:</span>
                    <div className="space-y-1.5">
                      {result.headlineOptions.map((hl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditedText(hl)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition ${
                            editedText === hl
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white border-indigo-200 text-slate-800 hover:bg-indigo-100/50"
                          }`}
                        >
                          {hl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SKILL SUGGESTIONS LIST */}
                {result.skillSuggestions && result.skillSuggestions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Grounded Skill Suggestions:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.skillSuggestions.map((sk: SkillSuggestionItem, idx: number) => (
                        <div key={idx} className="p-2.5 bg-white border border-indigo-200 rounded-xl space-y-0.5">
                          <span className="font-bold text-xs text-indigo-900">{sk.skill}</span>
                          <p className="text-[10px] text-slate-500">{sk.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CONTROL BUTTONS */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Accept & Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
