"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { AcademicSemesterItem } from "@/types/portfolio";
import { Plus, Trash2 } from "lucide-react";

export const AcademicJourneyPanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<AcademicSemesterItem>>({
    semesterNumber: 1,
    cgpa: "",
    subjects: [],
    projects: [],
    achievements: [],
    description: "",
    status: "COMPLETED",
  });
  const [subjectInput, setSubjectInput] = useState("");
  const [projectInput, setProjectInput] = useState("");

  const handleSelectSemester = (semNum: number) => {
    setSelectedSemester(semNum);
    const existing = portfolio.academicJourney.find((s) => s.semesterNumber === semNum);
    if (existing) {
      setFormData(existing);
      setSubjectInput((existing.subjects || []).join(", "));
      setProjectInput((existing.projects || []).join(", "));
    } else {
      setFormData({
        semesterNumber: semNum,
        cgpa: "",
        subjects: [],
        projects: [],
        achievements: [],
        description: "",
        status: "ENROLLED",
      });
      setSubjectInput("");
      setProjectInput("");
    }
  };

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemester) return;

    const subjects = subjectInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const projects = projectInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const semPayload: AcademicSemesterItem = {
      id: formData.id || `sem-${selectedSemester}-${Date.now()}`,
      portfolioId: portfolio.id,
      semesterNumber: selectedSemester,
      cgpa: formData.cgpa ? String(formData.cgpa) : undefined,
      subjects,
      projects,
      achievements: formData.achievements || [],
      description: formData.description || "",
      status: formData.status || "COMPLETED",
    };

    updatePortfolio((prev) => {
      const exists = prev.academicJourney.some((s) => s.semesterNumber === selectedSemester);
      const updatedJourney = exists
        ? prev.academicJourney.map((s) => (s.semesterNumber === selectedSemester ? semPayload : s))
        : [...prev.academicJourney, semPayload];

      // Sort by semester number
      updatedJourney.sort((a, b) => a.semesterNumber - b.semesterNumber);
      return { ...prev, academicJourney: updatedJourney };
    });

    setSelectedSemester(null);
  };

  const handleDeleteSemester = (semNum: number) => {
    updatePortfolio((prev) => ({
      ...prev,
      academicJourney: prev.academicJourney.filter((s) => s.semesterNumber !== semNum),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">Academic Journey (Optional)</h2>
        <p className="text-sm text-gray-500">
          Track course grades, CGPA, subjects, and key projects semester-by-semester (Semesters 1 - 8).
        </p>
      </div>

      {/* Grid of Semesters 1 to 8 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
          const semData = portfolio.academicJourney.find((s) => s.semesterNumber === semNum);
          const isFilled = !!semData;

          return (
            <button
              key={semNum}
              type="button"
              onClick={() => handleSelectSemester(semNum)}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                selectedSemester === semNum
                  ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20"
                  : isFilled
                  ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Semester {semNum}</span>
                {isFilled && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </div>

              {isFilled ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-bold text-gray-900">
                    CGPA: {semData.cgpa || "N/A"}
                  </p>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    {semData.subjects?.length || 0} subjects • {semData.status}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs font-medium text-gray-400 flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add details
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Semester Form Modal/Drawer */}
      {selectedSemester !== null && (
        <form onSubmit={handleSaveSemester} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h3 className="font-semibold text-gray-900">Configure Semester {selectedSemester}</h3>
            {portfolio.academicJourney.some((s) => s.semesterNumber === selectedSemester) && (
              <button
                type="button"
                onClick={() => {
                  handleDeleteSemester(selectedSemester);
                  setSelectedSemester(null);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Semester
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Semester CGPA</label>
              <input
                type="text"
                value={formData.cgpa || ""}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                placeholder="e.g. 3.85"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as AcademicSemesterItem["status"] })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="COMPLETED">Completed</option>
                <option value="ENROLLED">Currently Enrolled</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Subjects / Courses (comma separated)</label>
            <input
              type="text"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="Data Structures, Operating Systems, Machine Learning"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Semester Projects (comma separated)</label>
            <input
              type="text"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              placeholder="Mini OS Kernel, SQL Database Optimizer"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Notes & Achievements</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Dean's list, outstanding paper presentation, etc."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedSemester(null)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              Save Semester {selectedSemester}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
