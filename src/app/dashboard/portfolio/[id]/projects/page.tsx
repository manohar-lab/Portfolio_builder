"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveProjectAction, deleteProjectAction } from "@/dashboard/actions";
import { ProjectItem, ProjectStatus } from "@/types/portfolio";
import { ArrowLeft, Code2, Plus, Trash2, Edit3, Loader2 } from "lucide-react";

interface ProjectsEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectsEditorPage({ params }: ProjectsEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p-demo-1",
      title: "OmniStore E-Commerce Platform",
      shortDescription: "High-throughput microservices-based e-commerce suite with real-time inventory tracking.",
      detailedDescription: "Architected end-to-end e-commerce platform processing 10k requests/sec using Next.js and PostgreSQL.",
      problemStatement: "Legacy monolithic platform suffered frequent downtime.",
      solutionApproach: "Decoupled frontend onto Vercel edge networks.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Redis"],
      githubUrl: "https://github.com/example/omnistore",
      liveDemoUrl: "https://omnistore-demo.example.com",
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: true,
    },
  ]);

  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openNewProjectForm = () => {
    setEditingProject({
      id: "",
      title: "",
      shortDescription: "",
      detailedDescription: "",
      problemStatement: "",
      solutionApproach: "",
      technologies: [],
      githubUrl: "",
      liveDemoUrl: "",
      paperUrl: "",
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSaving(true);
    try {
      const res = await saveProjectAction(portfolioId, editingProject);
      if (res.success) {
        if (!editingProject.id) {
          setProjects([...projects, { ...editingProject, id: `p-${Date.now()}` }]);
        } else {
          setProjects(projects.map((p) => (p.id === editingProject.id ? editingProject : p)));
        }
        setEditingProject(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProjectAction(portfolioId, projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
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
          onClick={openNewProjectForm}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      {/* EDITING / CREATING FORM MODAL OR PANEL */}
      {editingProject && (
        <div className="p-8 bg-slate-900 border border-blue-500/30 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">
            {editingProject.id ? "Edit Project" : "Add New Project"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Project Title *</label>
              <input
                type="text"
                required
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Short Description *</label>
              <input
                type="text"
                required
                value={editingProject.shortDescription}
                onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Problem Statement</label>
                <textarea
                  rows={2}
                  value={editingProject.problemStatement || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, problemStatement: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Solution & Approach</label>
                <textarea
                  rows={2}
                  value={editingProject.solutionApproach || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, solutionApproach: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Technologies (comma separated)</label>
              <input
                type="text"
                value={editingProject.technologies.join(", ")}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="Next.js, TypeScript, PostgreSQL"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">GitHub Repository URL</label>
                <input
                  type="url"
                  value={editingProject.githubUrl || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Live Demo URL</label>
                <input
                  type="url"
                  value={editingProject.liveDemoUrl || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, liveDemoUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Project Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="IDEA">IDEA</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={editingProject.isFeatured}
                onChange={(e) => setEditingProject({ ...editingProject, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950"
              />
              <label htmlFor="isFeatured" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Mark as Featured Project
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Project"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* PROJECTS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" /> Portfolio Projects ({projects.length})
        </h2>

        {projects.map((project) => (
          <div key={project.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                {project.isFeatured && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded">
                    Featured
                  </span>
                )}
                <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded">
                  {project.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 max-w-2xl">{project.shortDescription}</p>

              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {project.technologies.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditingProject(project)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2 bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
