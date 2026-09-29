"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveSkillAction, deleteSkillAction } from "@/dashboard/actions";
import { SkillItem } from "@/types/portfolio";
import { ArrowLeft, Sparkles, Plus, Trash2, Loader2 } from "lucide-react";

interface SkillsEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function SkillsEditorPage({ params }: SkillsEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [skills, setSkills] = useState<SkillItem[]>([
    { id: "sk-1", name: "TypeScript", category: "languages", proficiency: "expert" },
    { id: "sk-2", name: "Next.js", category: "frontend", proficiency: "expert" },
    { id: "sk-3", name: "PostgreSQL", category: "backend", proficiency: "advanced" },
  ]);

  const [newSkillName, setNewSkillName] = useState("");
  const [newCategory, setNewCategory] = useState<SkillItem["category"]>("frontend");
  const [newProficiency, setNewProficiency] = useState<SkillItem["proficiency"]>("advanced");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsSaving(true);
    const skillPayload: SkillItem = {
      id: "",
      name: newSkillName.trim(),
      category: newCategory,
      proficiency: newProficiency,
    };

    try {
      const res = await saveSkillAction(portfolioId, skillPayload);
      if (res.success) {
        setSkills([...skills, { ...skillPayload, id: `sk-${Date.now()}` }]);
        setNewSkillName("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await deleteSkillAction(portfolioId, skillId);
      setSkills(skills.filter((s) => s.id !== skillId));
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
      </div>

      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" /> Add New Skill Item
        </h2>

        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 space-y-2 w-full">
            <label className="block text-xs font-semibold text-slate-300">Skill Name *</label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. PyTorch / Docker / React"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-44 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as SkillItem["category"])}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="ai_ml">AI / ML</option>
              <option value="devops">DevOps</option>
              <option value="languages">Languages</option>
              <option value="design">Design</option>
              <option value="tools">Tools</option>
            </select>
          </div>

          <div className="w-full sm:w-44 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Proficiency</label>
            <select
              value={newProficiency}
              onChange={(e) => setNewProficiency(e.target.value as SkillItem["proficiency"])}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving || !newSkillName.trim()}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Skill</>}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Current Skills ({skills.length})</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((s) => (
            <div key={s.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">{s.name}</span>
                <span className="text-[10px] text-slate-400 capitalize font-mono">{s.category} • {s.proficiency}</span>
              </div>

              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
