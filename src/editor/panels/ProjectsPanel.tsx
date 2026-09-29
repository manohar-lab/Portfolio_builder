"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { ProjectItem, ProjectStatus } from "@/types/portfolio";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown, Star } from "lucide-react";

export const ProjectsPanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    title: "",
    shortDescription: "",
    detailedDescription: "",
    problemStatement: "",
    solutionApproach: "",
    technologies: [],
    imageUrl: "",
    githubUrl: "",
    liveDemoUrl: "",
    paperUrl: "",
    startDate: "",
    endDate: "",
    status: "COMPLETED",
    isCurrent: false,
    isFeatured: false,
  });
  const [techInput, setTechInput] = useState("");

  const resetForm = () => {
    setFormData({
      title: "",
      shortDescription: "",
      detailedDescription: "",
      problemStatement: "",
      solutionApproach: "",
      technologies: [],
      imageUrl: "",
      githubUrl: "",
      liveDemoUrl: "",
      paperUrl: "",
      startDate: "",
      endDate: "",
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: false,
    });
    setTechInput("");
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setFormData(project);
    setTechInput((project.technologies || []).join(", "));
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDescription) return;

    const techs = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const projectPayload: ProjectItem = {
      id: editingId || `proj-${Date.now()}`,
      portfolioId: portfolio.id,
      title: formData.title || "",
      shortDescription: formData.shortDescription || "",
      detailedDescription: formData.detailedDescription || "",
      problemStatement: formData.problemStatement || "",
      solutionApproach: formData.solutionApproach || "",
      technologies: techs,
      imageUrl: formData.imageUrl || "",
      githubUrl: formData.githubUrl || "",
      liveDemoUrl: formData.liveDemoUrl || "",
      paperUrl: formData.paperUrl || "",
      startDate: formData.startDate || "",
      endDate: formData.endDate || "",
      status: (formData.status as ProjectStatus) || "COMPLETED",
      isCurrent: formData.isCurrent || false,
      isFeatured: formData.isFeatured || false,
      sortOrder: formData.sortOrder || portfolio.projects.length,
    };

    updatePortfolio((prev) => {
      const exists = prev.projects.some((p) => p.id === projectPayload.id);
      const updatedProjects = exists
        ? prev.projects.map((p) => (p.id === projectPayload.id ? projectPayload : p))
        : [...prev.projects, projectPayload];
      return { ...prev, projects: updatedProjects };
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
    setConfirmDeleteId(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= portfolio.projects.length) return;

    updatePortfolio((prev) => {
      const updated = [...prev.projects];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, projects: updated };
    });
  };

  const toggleFeatured = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p)),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projects Manager</h2>
          <p className="text-sm text-gray-500">Add, reorder, and feature key projects in your portfolio.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal/Section */}
      {showAddForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Edit Project" : "New Project"}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. AI Portfolio Engine"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IDEA">Idea / Concept</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Short Summary *</label>
            <input
              type="text"
              required
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief 1-2 sentence overview"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Detailed Description</label>
            <textarea
              rows={3}
              value={formData.detailedDescription}
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
              placeholder="Comprehensive details about feature set and scope"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Problem Statement</label>
              <textarea
                rows={2}
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="What challenge did this solve?"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Solution Approach</label>
              <textarea
                rows={2}
                value={formData.solutionApproach}
                onChange={(e) => setFormData({ ...formData, solutionApproach: e.target.value })}
                placeholder="How did you architect the solution?"
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
              placeholder="React, Next.js, TypeScript, PostgreSQL"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">GitHub Repository URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Live Demo URL</label>
              <input
                type="url"
                value={formData.liveDemoUrl}
                onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Paper / Case Study URL</label>
              <input
                type="url"
                value={formData.paperUrl}
                onChange={(e) => setFormData({ ...formData, paperUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Mark as Featured Project
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
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
              {editingId ? "Update Project" : "Save Project"}
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      {portfolio.projects.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No projects added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Plus className="h-4 w-4" /> Add your first project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.projects.map((project, idx) => (
            <div
              key={project.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-200 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{project.title}</h4>
                  {project.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <Star className="h-3 w-3 fill-amber-500" /> Featured
                    </span>
                  )}
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{project.shortDescription}</p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 ml-4">
                <button
                  type="button"
                  onClick={() => toggleFeatured(project.id)}
                  title="Toggle Featured"
                  className={`p-1.5 rounded-lg border transition ${
                    project.isFeatured
                      ? "border-amber-300 bg-amber-50 text-amber-600"
                      : "border-gray-200 text-gray-400 hover:text-amber-500"
                  }`}
                >
                  <Star className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === portfolio.projects.length - 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(project)}
                  className="p-1.5 rounded-lg border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(project.id)}
                  className="p-1.5 rounded-lg border border-gray-200 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Delete Confirmation Dialog */}
              {confirmDeleteId === project.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
                    <h3 className="font-bold text-gray-900">Delete Project?</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
