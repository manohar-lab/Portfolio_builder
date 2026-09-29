"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveResearchAction, deleteResearchAction } from "@/dashboard/actions";
import { ResearchItem } from "@/types/portfolio";
import { ArrowLeft, BookOpen, Plus, Trash2, Edit3, Loader2 } from "lucide-react";

interface ResearchEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function ResearchEditorPage({ params }: ResearchEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [researchList, setResearchList] = useState<ResearchItem[]>([
    {
      id: "res-demo-1",
      title: "Efficient Quantization of Large Vision-Language Models",
      description: "Investigating 4-bit INT quantization techniques on multimodal LLMs.",
      researchArea: "Artificial Intelligence / ML",
      publicationStatus: "published",
      venue: "ICLR 2025",
      paperUrl: "https://arxiv.org/abs/example",
      technologies: ["PyTorch", "CUDA"],
    },
  ]);

  const [editingRes, setEditingRes] = useState<ResearchItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openNewForm = () => {
    setEditingRes({
      id: "",
      title: "",
      description: "",
      researchArea: "Computer Science",
      publicationStatus: "published",
      technologies: [],
      paperUrl: "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;

    setIsSaving(true);
    try {
      const res = await saveResearchAction(portfolioId, editingRes);
      if (res.success) {
        if (!editingRes.id) {
          setResearchList([...researchList, { ...editingRes, id: `res-${Date.now()}` }]);
        } else {
          setResearchList(researchList.map((r) => (r.id === editingRes.id ? editingRes : r)));
        }
        setEditingRes(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (resId: string) => {
    if (!confirm("Delete research entry?")) return;
    try {
      await deleteResearchAction(portfolioId, resId);
      setResearchList(researchList.filter((r) => r.id !== resId));
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
          <Plus className="w-4 h-4" /> Add Research Paper
        </button>
      </div>

      {editingRes && (
        <div className="p-8 bg-slate-900 border border-blue-500/30 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">{editingRes.id ? "Edit Research Paper" : "Add Research Paper"}</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Paper Title *</label>
              <input
                type="text"
                required
                value={editingRes.title}
                onChange={(e) => setEditingRes({ ...editingRes, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Research Area *</label>
                <input
                  type="text"
                  required
                  value={editingRes.researchArea}
                  onChange={(e) => setEditingRes({ ...editingRes, researchArea: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Paper URL (ArXiv / DOI)</label>
                <input
                  type="url"
                  value={editingRes.paperUrl || ""}
                  onChange={(e) => setEditingRes({ ...editingRes, paperUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Description / Abstract *</label>
              <textarea
                rows={3}
                required
                value={editingRes.description}
                onChange={(e) => setEditingRes({ ...editingRes, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRes(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Research Paper"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-400" /> Research & Papers ({researchList.length})
        </h2>

        {researchList.map((res) => (
          <div key={res.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{res.title}</h3>
              <p className="text-xs font-mono text-rose-400">{res.researchArea} {res.venue && `• ${res.venue}`}</p>
              <p className="text-xs text-slate-400">{res.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setEditingRes(res)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(res.id)} className="p-2 bg-slate-800 hover:bg-rose-600/20 text-rose-400 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
