"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveEducationAction, deleteEducationAction } from "@/dashboard/actions";
import { EducationItem, AcademicSemesterItem } from "@/types/portfolio";
import { ArrowLeft, GraduationCap, Plus, Trash2, Edit3, Loader2 } from "lucide-react";

interface EducationEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EducationEditorPage({ params }: EducationEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      id: "edu-demo-1",
      institution: "Stanford University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startYear: 2020,
      endYear: 2024,
      isCurrentStatus: false,
      cgpa: "3.92",
      maxCgpa: "4.0",
      description: "Specialized in Artificial Intelligence and Distributed Systems.",
    },
  ]);

  const [semesters] = useState<AcademicSemesterItem[]>([
    { id: "sem-1", semesterNumber: 1, cgpa: "3.90", subjects: ["Algorithms", "Linear Algebra"] },
    { id: "sem-2", semesterNumber: 2, cgpa: "3.95", subjects: ["Operating Systems", "Discrete Math"] },
  ]);

  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openNewEduForm = () => {
    setEditingEdu({
      id: "",
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: 2023,
      endYear: 2027,
      isCurrentStatus: false,
      cgpa: "3.8",
      maxCgpa: "4.0",
      description: "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;

    setIsSaving(true);
    try {
      const res = await saveEducationAction(portfolioId, editingEdu);
      if (res.success) {
        if (!editingEdu.id) {
          setEducationList([...educationList, { ...editingEdu, id: `edu-${Date.now()}` }]);
        } else {
          setEducationList(educationList.map((e) => (e.id === editingEdu.id ? editingEdu : e)));
        }
        setEditingEdu(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (eduId: string) => {
    if (!confirm("Are you sure you want to delete this education entry?")) return;
    try {
      await deleteEducationAction(portfolioId, eduId);
      setEducationList(educationList.filter((e) => e.id !== eduId));
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
          onClick={openNewEduForm}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>

      {editingEdu && (
        <div className="p-8 bg-slate-900 border border-blue-500/30 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">{editingEdu.id ? "Edit Education" : "Add Education"}</h2>

          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Institution *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.institution}
                  onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Degree *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.degree}
                  onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                  placeholder="B.S. / B.Tech / M.S."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Field of Study *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.fieldOfStudy}
                  onChange={(e) => setEditingEdu({ ...editingEdu, fieldOfStudy: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Start Year *</label>
                <input
                  type="number"
                  required
                  value={editingEdu.startYear}
                  onChange={(e) => setEditingEdu({ ...editingEdu, startYear: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">End Year</label>
                <input
                  type="number"
                  value={editingEdu.endYear || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, endYear: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">CGPA / GPA</label>
                <input
                  type="text"
                  value={editingEdu.cgpa || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, cgpa: e.target.value })}
                  placeholder="3.92"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Max CGPA</label>
                <input
                  type="text"
                  value={editingEdu.maxCgpa || "4.0"}
                  onChange={(e) => setEditingEdu({ ...editingEdu, maxCgpa: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingEdu(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Education"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* EDUCATION LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-purple-400" /> Education History ({educationList.length})
        </h2>

        {educationList.map((edu) => (
          <div key={edu.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{edu.institution}</h3>
              <p className="text-sm text-slate-300">
                {edu.degree} in {edu.fieldOfStudy}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {edu.startYear} – {edu.endYear || "Present"} {edu.cgpa && `| CGPA: ${edu.cgpa}/${edu.maxCgpa || "4.0"}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setEditingEdu(edu)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(edu.id)} className="p-2 bg-slate-800 hover:bg-rose-600/20 text-rose-400 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ACADEMIC JOURNEY SEMESTER BREAKDOWN */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="font-bold text-white text-base">Academic Journey (Optional Semesters 1 to 8)</h3>
        <p className="text-xs text-slate-400">Track semester-wise GPAs, coursework, and projects for student portfolios.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {semesters.map((sem) => (
            <div key={sem.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Semester {sem.semesterNumber}</span>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">GPA: {sem.cgpa}</span>
              </div>
              <p className="text-xs text-slate-400">Courses: {sem.subjects.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
