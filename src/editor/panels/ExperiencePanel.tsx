"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { ExperienceItem } from "@/types/portfolio";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown } from "lucide-react";

export const ExperiencePanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ExperienceItem>>({
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    technologies: [],
  });
  const [techInput, setTechInput] = useState("");

  const resetForm = () => {
    setFormData({
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      technologies: [],
    });
    setTechInput("");
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (exp: ExperienceItem) => {
    setEditingId(exp.id);
    setFormData(exp);
    setTechInput((exp.technologies || []).join(", "));
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    const techs = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const expPayload: ExperienceItem = {
      id: editingId || `exp-${Date.now()}`,
      portfolioId: portfolio.id,
      company: formData.company,
      role: formData.role,
      location: formData.location || "",
      startDate: formData.startDate || "",
      endDate: formData.isCurrent ? undefined : formData.endDate || "",
      isCurrent: formData.isCurrent || false,
      description: formData.description || "",
      technologies: techs,
      sortOrder: formData.sortOrder || portfolio.experience.length,
    };

    updatePortfolio((prev) => {
      const exists = prev.experience.some((e) => e.id === expPayload.id);
      const updatedExp = exists
        ? prev.experience.map((e) => (e.id === expPayload.id ? expPayload : e))
        : [...prev.experience, expPayload];
      return { ...prev, experience: updatedExp };
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= portfolio.experience.length) return;

    updatePortfolio((prev) => {
      const updated = [...prev.experience];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, experience: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500">Document your career history, roles, and technical achievements.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Experience
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Edit Work Experience" : "New Experience Entry"}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Company / Organization *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Inc"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Role / Position *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (Remote)"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="e.g. Jan 2022"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">End Date</label>
              <input
                type="text"
                disabled={formData.isCurrent}
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                placeholder={formData.isCurrent ? "Present" : "Dec 2023"}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCurrentExp"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isCurrentExp" className="text-xs font-semibold text-gray-700 cursor-pointer">
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Technologies Used (comma separated)</label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="TypeScript, Node.js, AWS, Kubernetes"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Description & Accomplishments</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Architected microservices, improved API performance by 40%..."
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
              {editingId ? "Update Experience" : "Save Experience"}
            </button>
          </div>
        </form>
      )}

      {portfolio.experience.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No work experience added.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Plus className="h-4 w-4" /> Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.experience.map((exp, idx) => (
            <div
              key={exp.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-200 transition"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                <p className="text-xs font-medium text-indigo-600">{exp.company}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || "N/A"}
                  {exp.location ? ` • ${exp.location}` : ""}
                </p>
                {exp.description && <p className="text-xs text-gray-600 mt-1.5">{exp.description}</p>}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exp.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
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
                  disabled={idx === portfolio.experience.length - 1}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(exp)}
                  className="p-1 rounded-md border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exp.id)}
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
