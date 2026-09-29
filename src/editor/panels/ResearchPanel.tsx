"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { ResearchItem } from "@/types/portfolio";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown } from "lucide-react";

export const ResearchPanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ResearchItem>>({
    title: "",
    researchArea: "",
    description: "",
    problemStatement: "",
    methodology: "",
    dataset: "",
    technologies: [],
    resultsSummary: "",
    paperUrl: "",
    githubUrl: "",
    publicationStatus: "published",
    publicationDate: "",
    venue: "",
  });
  const [techInput, setTechInput] = useState("");

  const resetForm = () => {
    setFormData({
      title: "",
      researchArea: "",
      description: "",
      problemStatement: "",
      methodology: "",
      dataset: "",
      technologies: [],
      resultsSummary: "",
      paperUrl: "",
      githubUrl: "",
      publicationStatus: "published",
      publicationDate: "",
      venue: "",
    });
    setTechInput("");
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (res: ResearchItem) => {
    setEditingId(res.id);
    setFormData(res);
    setTechInput((res.technologies || []).join(", "));
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.researchArea) return;

    const techs = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const resPayload: ResearchItem = {
      id: editingId || `res-${Date.now()}`,
      portfolioId: portfolio.id,
      title: formData.title,
      researchArea: formData.researchArea,
      description: formData.description || "",
      problemStatement: formData.problemStatement || "",
      methodology: formData.methodology || "",
      dataset: formData.dataset || "",
      technologies: techs,
      resultsSummary: formData.resultsSummary || "",
      paperUrl: formData.paperUrl || "",
      githubUrl: formData.githubUrl || "",
      publicationStatus: (formData.publicationStatus as ResearchItem["publicationStatus"]) || "published",
      publicationDate: formData.publicationDate || "",
      venue: formData.venue || "",
      sortOrder: formData.sortOrder || portfolio.research.length,
    };

    updatePortfolio((prev) => {
      const exists = prev.research.some((r) => r.id === resPayload.id);
      const updatedResearch = exists
        ? prev.research.map((r) => (r.id === resPayload.id ? resPayload : r))
        : [...prev.research, resPayload];
      return { ...prev, research: updatedResearch };
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      research: prev.research.filter((r) => r.id !== id),
    }));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= portfolio.research.length) return;

    updatePortfolio((prev) => {
      const updated = [...prev.research];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, research: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Research & Publications</h2>
          <p className="text-sm text-gray-500">Showcase academic research, preprints, papers, and methodologies.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Research
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Edit Research" : "New Research Entry"}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Paper Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Distributed Consensus in Asynchronous Networks"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Research Area *</label>
              <input
                type="text"
                required
                value={formData.researchArea}
                onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                placeholder="e.g. Distributed Systems, Machine Learning"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Publication Status</label>
              <select
                value={formData.publicationStatus}
                onChange={(e) =>
                  setFormData({ ...formData, publicationStatus: e.target.value as ResearchItem["publicationStatus"] })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="published">Published</option>
                <option value="accepted">Accepted</option>
                <option value="under_review">Under Review</option>
                <option value="submitted">Submitted</option>
                <option value="pre_print">Pre-print (arXiv)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Journal / Conference Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. IEEE S&P 2024 / NeurIPS"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Publication Date</label>
              <input
                type="text"
                value={formData.publicationDate}
                onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                placeholder="e.g. May 2024"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Abstract / Summary</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High-level overview of findings..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Methodology</label>
              <textarea
                rows={2}
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                placeholder="Experimental design and algorithms..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Dataset / Benchmarks</label>
              <textarea
                rows={2}
                value={formData.dataset}
                onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                placeholder="Datasets utilized or curated..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Paper / PDF Link</label>
              <input
                type="url"
                value={formData.paperUrl}
                onChange={(e) => setFormData({ ...formData, paperUrl: e.target.value })}
                placeholder="https://arxiv.org/abs/..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Code Artifact / GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Technologies (comma separated)</label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="PyTorch, CUDA, Python, LaTeX"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {editingId ? "Update Research" : "Save Research"}
            </button>
          </div>
        </form>
      )}

      {portfolio.research.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No research entries added.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Plus className="h-4 w-4" /> Add Research
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.research.map((res, idx) => (
            <div
              key={res.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-200 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{res.title}</h4>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 uppercase">
                    {res.publicationStatus.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs font-medium text-indigo-600">{res.researchArea} {res.venue ? `• ${res.venue}` : ""}</p>
                {res.description && <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{res.description}</p>}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === portfolio.research.length - 1}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(res)}
                  className="p-1 rounded-md border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(res.id)}
                  className="p-1 rounded-md border border-gray-200 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
