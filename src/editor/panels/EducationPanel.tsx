"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { EducationItem } from "@/types/portfolio";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown } from "lucide-react";

export const EducationPanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<EducationItem>>({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startYear: new Date().getFullYear() - 4,
    endYear: new Date().getFullYear(),
    isCurrentStatus: false,
    cgpa: "",
    maxCgpa: "4.0",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: new Date().getFullYear() - 4,
      endYear: new Date().getFullYear(),
      isCurrentStatus: false,
      cgpa: "",
      maxCgpa: "4.0",
      description: "",
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (edu: EducationItem) => {
    setEditingId(edu.id);
    setFormData(edu);
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institution || !formData.degree) return;

    const eduPayload: EducationItem = {
      id: editingId || `edu-${Date.now()}`,
      portfolioId: portfolio.id,
      institution: formData.institution,
      degree: formData.degree,
      fieldOfStudy: formData.fieldOfStudy || "",
      startYear: Number(formData.startYear) || 2020,
      endYear: formData.isCurrentStatus ? undefined : Number(formData.endYear) || undefined,
      isCurrentStatus: formData.isCurrentStatus || false,
      cgpa: formData.cgpa ? String(formData.cgpa) : undefined,
      maxCgpa: formData.maxCgpa ? String(formData.maxCgpa) : "4.0",
      description: formData.description || "",
      sortOrder: formData.sortOrder || portfolio.education.length,
    };

    updatePortfolio((prev) => {
      const exists = prev.education.some((e) => e.id === eduPayload.id);
      const updatedEdu = exists
        ? prev.education.map((e) => (e.id === eduPayload.id ? eduPayload : e))
        : [...prev.education, eduPayload];
      return { ...prev, education: updatedEdu };
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= portfolio.education.length) return;

    updatePortfolio((prev) => {
      const updated = [...prev.education];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, education: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Education History</h2>
          <p className="text-sm text-gray-500">Manage academic degrees, institutions, and GPA details.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Education
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Edit Education" : "New Education Entry"}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Institution *</label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. Stanford University"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Degree *</label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. Bachelor of Science"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Field of Study</label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                placeholder="e.g. Computer Science"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Start Year</label>
              <input
                type="number"
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">End Year</label>
              <input
                type="number"
                disabled={formData.isCurrentStatus}
                value={formData.endYear || ""}
                onChange={(e) => setFormData({ ...formData, endYear: Number(e.target.value) })}
                placeholder={formData.isCurrentStatus ? "Present" : "2024"}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">CGPA / GPA (Decimal allowed)</label>
              <input
                type="text"
                value={formData.cgpa || ""}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                placeholder="e.g. 3.92"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Scale / Max CGPA</label>
              <input
                type="text"
                value={formData.maxCgpa || "4.0"}
                onChange={(e) => setFormData({ ...formData, maxCgpa: e.target.value })}
                placeholder="4.0 or 10.0"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCurrentEdu"
              checked={formData.isCurrentStatus}
              onChange={(e) => setFormData({ ...formData, isCurrentStatus: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isCurrentEdu" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Currently studying here
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Description / Key Highlights</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Honors, relevant coursework, activities"
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
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {portfolio.education.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No education entries added.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Plus className="h-4 w-4" /> Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.education.map((edu, idx) => (
            <div
              key={edu.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-200 transition"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                <p className="text-xs font-medium text-indigo-600">{edu.institution}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {edu.fieldOfStudy} • {edu.startYear} - {edu.isCurrentStatus ? "Present" : edu.endYear || "N/A"}
                  {edu.cgpa ? ` • CGPA: ${edu.cgpa}/${edu.maxCgpa || "4.0"}` : ""}
                </p>
                {edu.description && <p className="text-xs text-gray-600 mt-1.5">{edu.description}</p>}
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
                  disabled={idx === portfolio.education.length - 1}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(edu)}
                  className="p-1 rounded-md border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(edu.id)}
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
