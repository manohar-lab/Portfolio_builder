"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { SkillItem } from "@/types/portfolio";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown } from "lucide-react";

const SKILL_CATEGORIES = [
  { value: "frontend", label: "Frontend Development" },
  { value: "backend", label: "Backend Development" },
  { value: "ai_ml", label: "AI & Machine Learning" },
  { value: "devops", label: "DevOps & Cloud" },
  { value: "languages", label: "Programming Languages" },
  { value: "design", label: "UI/UX & Design" },
  { value: "tools", label: "Tools & Frameworks" },
  { value: "other", label: "Other Skills" },
];

export const SkillsPanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SkillItem>>({
    name: "",
    category: "frontend",
    proficiency: "intermediate",
  });

  const resetForm = () => {
    setFormData({ name: "", category: "frontend", proficiency: "intermediate" });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (skill: SkillItem) => {
    setEditingId(skill.id);
    setFormData(skill);
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const skillPayload: SkillItem = {
      id: editingId || `skill-${Date.now()}`,
      name: formData.name,
      category: (formData.category as SkillItem["category"]) || "frontend",
      proficiency: (formData.proficiency as SkillItem["proficiency"]) || "intermediate",
      sortOrder: formData.sortOrder || portfolio.skills.length,
    };

    updatePortfolio((prev) => {
      const exists = prev.skills.some((s) => s.id === skillPayload.id);
      const updatedSkills = exists
        ? prev.skills.map((s) => (s.id === skillPayload.id ? skillPayload : s))
        : [...prev.skills, skillPayload];
      return { ...prev, skills: updatedSkills };
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= portfolio.skills.length) return;

    updatePortfolio((prev) => {
      const updated = [...prev.skills];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, skills: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Skills & Tech Stack</h2>
          <p className="text-sm text-gray-500">Categorize and highlight your technical proficiencies.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Skill
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Edit Skill" : "New Skill"}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Skill Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. TypeScript"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SkillItem["category"] })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Proficiency Level</label>
              <select
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: e.target.value as SkillItem["proficiency"] })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
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
              {editingId ? "Update Skill" : "Save Skill"}
            </button>
          </div>
        </form>
      )}

      {portfolio.skills.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No skills added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Plus className="h-4 w-4" /> Add your first skill
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.skills.map((skill, idx) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm hover:border-indigo-200 transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 text-sm">{skill.name}</span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 uppercase tracking-wide">
                  {skill.category.replace("_", " ")}
                </span>
                {skill.proficiency && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 capitalize">
                    {skill.proficiency}
                  </span>
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
                  disabled={idx === portfolio.skills.length - 1}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(skill)}
                  className="p-1 rounded-md border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(skill.id)}
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
