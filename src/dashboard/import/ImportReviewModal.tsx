"use client";

import React, { useState } from "react";
import { NormalizedImportPayload, ImportedProject, ImportedEducation } from "@/types/import";
import { executeApprovedImportAction } from "@/dashboard/import-actions";
import { AlertTriangle, CheckCircle2, ShieldCheck, X, FileText, Github, Check } from "lucide-react";

interface ImportReviewModalProps {
  portfolioId: string;
  initialPayload: NormalizedImportPayload;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (itemsImported: number) => void;
}

export function ImportReviewModal({
  portfolioId,
  initialPayload,
  isOpen,
  onClose,
  onSuccess,
}: ImportReviewModalProps) {
  const [payload, setPayload] = useState<NormalizedImportPayload>(initialPayload);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Toggle selection helpers
  const toggleProjectSelected = (id: string) => {
    setPayload((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    }));
  };

  const updateProjectMergeAction = (id: string, action: ImportedProject["merge_action"]) => {
    setPayload((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, merge_action: action } : p)),
    }));
  };

  const toggleSkillSelected = (id: string) => {
    setPayload((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)),
    }));
  };

  const toggleEducationSelected = (id: string) => {
    setPayload((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)),
    }));
  };

  const updateEduMergeAction = (id: string, action: ImportedEducation["merge_action"]) => {
    setPayload((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, merge_action: action } : e)),
    }));
  };

  const toggleProfileSelected = () => {
    setPayload((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, selected: !prev.profile.selected } : undefined,
    }));
  };

  const handleSelectAll = (select: boolean) => {
    setPayload((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, selected: select } : undefined,
      projects: prev.projects.map((p) => ({ ...p, selected: select })),
      skills: prev.skills.map((s) => ({ ...s, selected: select })),
      education: prev.education.map((e) => ({ ...e, selected: select })),
      experience: prev.experience.map((ex) => ({ ...ex, selected: select })),
      research: prev.research.map((r) => ({ ...r, selected: select })),
      achievements: prev.achievements.map((a) => ({ ...a, selected: select })),
      certifications: prev.certifications.map((c) => ({ ...c, selected: select })),
      socials: prev.socials.map((s) => ({ ...s, selected: select })),
    }));
  };

  const countSelectedItems = () => {
    let count = 0;
    if (payload.profile?.selected) count += 1;
    count += payload.projects.filter((p) => p.selected && p.merge_action !== "skip").length;
    count += payload.skills.filter((s) => s.selected).length;
    count += payload.education.filter((e) => e.selected && e.merge_action !== "skip").length;
    count += payload.experience.filter((ex) => ex.selected).length;
    count += payload.research.filter((r) => r.selected).length;
    count += payload.achievements.filter((a) => a.selected).length;
    count += payload.certifications.filter((c) => c.selected).length;
    count += payload.socials.filter((s) => s.selected).length;
    return count;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await executeApprovedImportAction(portfolioId, payload);
      if (res.success && res.data) {
        onSuccess(res.data.itemsImported);
        onClose();
      } else {
        setErrorMessage(res.error || "We couldn't complete the import. Please try again.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during import merge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = countSelectedItems();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              {payload.source === "github" ? <Github className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Review Imported Information
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {payload.source.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Review, edit, and approve items before adding them to your portfolio drafts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center gap-3 text-xs text-amber-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Draft Mode Guarantee:</strong> Imported items remain private in draft mode and are never published automatically.
          </span>
        </div>

        {errorMessage && (
          <div className="m-6 mb-0 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Controls bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>Select items to import:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="hover:text-indigo-400 underline transition-colors"
              >
                Select All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="hover:text-indigo-400 underline transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* 1. Profile Section */}
          {payload.profile && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!payload.profile.selected}
                    onChange={toggleProfileSelected}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                  Profile Information
                </label>
                {payload.profile.uncertain && (
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Please verify
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Full Name</span>
                  <input
                    type="text"
                    value={payload.profile.full_name || ""}
                    onChange={(e) =>
                      setPayload((prev) => ({
                        ...prev,
                        profile: prev.profile ? { ...prev.profile, full_name: e.target.value } : undefined,
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Headline</span>
                  <input
                    type="text"
                    value={payload.profile.headline || ""}
                    onChange={(e) =>
                      setPayload((prev) => ({
                        ...prev,
                        profile: prev.profile ? { ...prev.profile, headline: e.target.value } : undefined,
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500 block mb-1">Bio</span>
                  <textarea
                    rows={2}
                    value={payload.profile.bio || ""}
                    onChange={(e) =>
                      setPayload((prev) => ({
                        ...prev,
                        profile: prev.profile ? { ...prev.profile, bio: e.target.value } : undefined,
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Projects Section */}
          {payload.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200 flex items-center justify-between">
                <span>Projects ({payload.projects.length})</span>
              </h3>
              <div className="space-y-3">
                {payload.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      proj.selected ? "bg-slate-950/40 border-slate-800" : "bg-slate-950/20 border-slate-900 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!proj.selected}
                          onChange={() => toggleProjectSelected(proj.id)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                        />
                        {proj.title}
                      </label>

                      {/* Duplicate Status Badge */}
                      {proj.duplicate_status === "exact" && (
                        <span className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                          Exact Duplicate
                        </span>
                      )}
                      {proj.duplicate_status === "potential" && (
                        <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          Potential Duplicate
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mb-3">{proj.short_description}</p>

                    {/* Merge action options if duplicate */}
                    {proj.duplicate_status && proj.duplicate_status !== "none" && (
                      <div className="bg-slate-900 border border-slate-800 rounded p-2.5 text-xs flex items-center justify-between gap-2">
                        <span className="text-slate-400">Duplicate strategy:</span>
                        <select
                          value={proj.merge_action || "skip"}
                          onChange={(e) => updateProjectMergeAction(proj.id, e.target.value as ImportedProject["merge_action"])}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        >
                          <option value="skip">Skip (Keep Existing)</option>
                          <option value="update_existing">Update Existing Project</option>
                          <option value="create_new">Create Separate Project</option>
                        </select>
                      </div>
                    )}

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-indigo-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Skills Section */}
          {payload.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200">Skills ({payload.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {payload.skills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkillSelected(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      skill.selected
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    {skill.selected ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Education Section */}
          {payload.education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-200">Education ({payload.education.length})</h3>
              <div className="space-y-2">
                {payload.education.map((edu) => (
                  <div key={edu.id} className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 text-xs flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200">
                      <input
                        type="checkbox"
                        checked={!!edu.selected}
                        onChange={() => toggleEducationSelected(edu.id)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                      />
                      <span>{edu.degree} - {edu.institution}</span>
                    </label>
                    {edu.duplicate_status === "potential" && (
                      <select
                        value={edu.merge_action || "skip"}
                        onChange={(e) => updateEduMergeAction(edu.id, e.target.value as ImportedEducation["merge_action"])}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        <option value="skip">Skip</option>
                        <option value="create_new">Create New</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel Import
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              Select All ({payload.projects.length + payload.skills.length + payload.education.length})
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCount === 0}
              className="px-5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Merging into Portfolio...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Selected ({selectedCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
