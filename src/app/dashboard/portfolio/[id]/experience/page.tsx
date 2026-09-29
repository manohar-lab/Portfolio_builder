"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveExperienceAction, deleteExperienceAction } from "@/dashboard/actions";
import { ExperienceItem } from "@/types/portfolio";
import { ArrowLeft, Briefcase, Plus, Trash2, Edit3, Loader2 } from "lucide-react";

interface ExperienceEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function ExperienceEditorPage({ params }: ExperienceEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([
    {
      id: "exp-demo-1",
      company: "Tech Corp / Vercel",
      role: "Senior Software Engineer",
      location: "Remote",
      startDate: "2024-06",
      isCurrent: true,
      description: "Leading frontend core infrastructure, improving bundle loading times by 35%.",
      technologies: ["TypeScript", "Next.js", "Rust"],
    },
  ]);

  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openNewForm = () => {
    setEditingExp({
      id: "",
      company: "",
      role: "",
      location: "",
      startDate: "2024-01",
      isCurrent: true,
      description: "",
      technologies: [],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;

    setIsSaving(true);
    try {
      const res = await saveExperienceAction(portfolioId, editingExp);
      if (res.success) {
        if (!editingExp.id) {
          setExperienceList([...experienceList, { ...editingExp, id: `exp-${Date.now()}` }]);
        } else {
          setExperienceList(experienceList.map((e) => (e.id === editingExp.id ? editingExp : e)));
        }
        setEditingExp(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expId: string) => {
    if (!confirm("Delete experience entry?")) return;
    try {
      await deleteExperienceAction(portfolioId, expId);
      setExperienceList(experienceList.filter((e) => e.id !== expId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/portfolio/${portfolioId}`}
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio Management
        </Link>

        <button
          onClick={openNewForm}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {editingExp && (
        <div className="p-8 bg-slate-900 border border-blue-500/30 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">{editingExp.id ? "Edit Experience" : "Add Experience"}</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={editingExp.company}
                  onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Role / Position *</label>
                <input
                  type="text"
                  required
                  value={editingExp.role}
                  onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Description *</label>
              <textarea
                rows={3}
                required
                value={editingExp.description}
                onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingExp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Experience"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-400" /> Work Experience ({experienceList.length})
        </h2>

        {experienceList.map((exp) => (
          <div key={exp.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{exp.role}</h3>
              <p className="text-sm text-blue-400 font-medium">{exp.company}</p>
              <p className="text-xs text-slate-400">{exp.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setEditingExp(exp)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(exp.id)} className="p-2 bg-slate-800 hover:bg-rose-600/20 text-rose-400 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
