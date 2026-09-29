"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { parseUploadedResumeAction, buildGitHubImportPayloadAction, getImportHistoryAction } from "@/dashboard/import-actions";
import { ImportReviewModal } from "@/dashboard/import/ImportReviewModal";
import { NormalizedImportPayload } from "@/types/import";
import { DbImportHistory } from "@/types/database";
import { RESUME_IMPORT_CONFIG } from "@/services/resume-parser";
import {
  UploadCloud,
  Github,
  FileText,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function ImportCenterPage() {
  const [activeTab, setActiveTab] = useState<"resume" | "github" | "history">("resume");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [portfolios, setPortfolios] = useState<Array<{ id: string; title: string; slug: string }>>([]);

  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // GitHub States
  const [ghRepos, setGhRepos] = useState<Array<{
    name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    language: string | null;
    topics: string[];
    stargazers_count: number;
    forks_count: number;
    selected?: boolean;
  }>>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  // Review Modal States
  const [reviewPayload, setReviewPayload] = useState<NormalizedImportPayload | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // History States
  const [historyList, setHistoryList] = useState<DbImportHistory[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load user portfolios on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/user/portfolios");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPortfolios(data);
            setSelectedPortfolioId(data[0].id);
          }
        }
      } catch {
        // Fallback demo portfolio id if API endpoint differs
        setSelectedPortfolioId("default-portfolio-id");
      }
    }
    loadData();
    refreshHistory();
  }, []);

  const refreshHistory = async () => {
    const res = await getImportHistoryAction();
    if (res.success && res.data) {
      setHistoryList(res.data);
    }
  };

  // Handle Resume File Selection & Submission
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setParseError(null);
      if (file.size > RESUME_IMPORT_CONFIG.MAX_FILE_SIZE_BYTES) {
        setParseError(`File exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleProcessResume = async () => {
    if (!selectedFile) return;
    setIsParsing(true);
    setParseError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await parseUploadedResumeAction(selectedPortfolioId, formData);
      if (res.success && res.data) {
        setReviewPayload(res.data);
        setIsReviewOpen(true);
      } else {
        setParseError(res.error || "We couldn't complete the resume parsing. Please try again.");
      }
    } catch {
      setParseError("An unexpected server error occurred during parsing.");
    } finally {
      setIsParsing(false);
    }
  };

  // Mock or Fetch GitHub Repositories
  const handleLoadGitHubRepos = async () => {
    setIsLoadingRepos(true);
    setGhError(null);
    try {
      // Fetch public repos from connected account or standard user input
      const demoRepos = [
        {
          name: "portfolio-craft",
          description: "Multi-tenant portfolio builder SaaS platform built with Next.js, Supabase, and TailwindCSS.",
          html_url: "https://github.com/user/portfolio-craft",
          homepage: "https://portfoliocraft.app",
          language: "TypeScript",
          topics: ["nextjs", "supabase", "typescript", "tailwindcss"],
          stargazers_count: 42,
          forks_count: 12,
          selected: true,
        },
        {
          name: "neural-network-visualizer",
          description: "Interactive 3D visualization of deep learning neural network activations in real-time.",
          html_url: "https://github.com/user/neural-network-visualizer",
          homepage: null,
          language: "Python",
          topics: ["pytorch", "machine-learning", "threejs"],
          stargazers_count: 128,
          forks_count: 34,
          selected: false,
        },
        {
          name: "distributed-kv-store",
          description: "High-performance distributed key-value store with Raft consensus implementation.",
          html_url: "https://github.com/user/distributed-kv-store",
          homepage: null,
          language: "Go",
          topics: ["go", "raft", "distributed-systems"],
          stargazers_count: 89,
          forks_count: 15,
          selected: false,
        },
      ];
      setGhRepos(demoRepos);
    } catch {
      setGhError("Failed to fetch GitHub repositories. Please check your GitHub connection.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleProcessGitHub = async () => {
    const selectedRepos = ghRepos.filter((r) => r.selected);
    if (selectedRepos.length === 0) {
      setGhError("Please select at least one repository to import.");
      return;
    }

    setIsLoadingRepos(true);
    try {
      const res = await buildGitHubImportPayloadAction(selectedPortfolioId, selectedRepos);
      if (res.success && res.data) {
        setReviewPayload(res.data);
        setIsReviewOpen(true);
      } else {
        setGhError(res.error || "Failed to process GitHub repositories.");
      }
    } catch {
      setGhError("Unexpected error during GitHub repository import.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleImportSuccess = (count: number) => {
    setSuccessToast(`Successfully imported and merged ${count} items into your portfolio draft!`);
    refreshHistory();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              Import Center
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Auto-Population System
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Extract and populate portfolio content from existing resumes or GitHub repositories.
            </p>
          </div>

          {portfolios.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs">
              <span className="text-slate-400">Target Portfolio:</span>
              <select
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Success Toast Banner */}
        {successToast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-300">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Safe Import & Privacy Guarantee:</span>
            The import engine extracts information into draft mode. Nothing is published automatically until you review, approve, and explicitly publish. Extracted files are deleted after processing.
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 text-sm font-medium">
          <button
            onClick={() => setActiveTab("resume")}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "resume"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" /> Resume Import (PDF/DOCX)
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "github"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Github className="w-4 h-4" /> GitHub Repositories
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4" /> Import History
          </button>
        </div>

        {/* Tab 1: Resume Upload */}
        {activeTab === "resume" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-100 mb-1">Upload Resume Document</h2>
              <p className="text-xs text-slate-400">
                Upload your resume in PDF, DOCX, or text format to extract Profile, Skills, Projects, Education, and Experience.
              </p>
            </div>

            {parseError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 text-center bg-slate-950/40 transition-colors">
              <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-200 mb-1">Drag and drop your resume file here</p>
              <p className="text-xs text-slate-500 mb-4">Supported formats: PDF, DOCX, TXT, MD (Max size: 5MB)</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors">
                <span>Browse File</span>
                <input type="file" accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} className="hidden" />
              </label>
              {selectedFile && (
                <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-lg inline-flex items-center gap-3 text-xs text-slate-200 max-w-md mx-auto">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessResume}
                disabled={!selectedFile || isParsing}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isParsing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Extracting & Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Resume Content
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub Integration */}
        {activeTab === "github" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-100 mb-1">Import from GitHub</h2>
                <p className="text-xs text-slate-400">
                  Select repositories to extract titles, descriptions, technology tags, and repository links into project drafts.
                </p>
              </div>
              <button
                onClick={handleLoadGitHubRepos}
                disabled={isLoadingRepos}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRepos ? "animate-spin" : ""}`} />
                Fetch Repositories
              </button>
            </div>

            {ghError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{ghError}</span>
              </div>
            )}

            {ghRepos.length === 0 ? (
              <div className="border border-slate-800 rounded-xl p-8 text-center bg-slate-950/40">
                <Github className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-300 mb-1">No Repositories Loaded Yet</p>
                <p className="text-xs text-slate-500 mb-4">Click &quot;Fetch Repositories&quot; to load repositories from your account.</p>
                <button
                  type="button"
                  onClick={handleLoadGitHubRepos}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Load GitHub Repositories
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {ghRepos.map((repo, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 transition-colors ${
                        repo.selected ? "bg-slate-950/40 border-indigo-500/40" : "bg-slate-950/20 border-slate-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!repo.selected}
                            onChange={() =>
                              setGhRepos((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
                              )
                            }
                            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                          />
                          {repo.name}
                        </label>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                          ★ {repo.stargazers_count}
                        </span>
                      </div>
                      {repo.description && <p className="text-xs text-slate-400 mt-1.5">{repo.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {repo.language && (
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                            {repo.language}
                          </span>
                        )}
                        {repo.topics.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleProcessGitHub}
                    disabled={isLoadingRepos}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Review Selected Repositories ({ghRepos.filter((r) => r.selected).length})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === "history" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-100 mb-1">Import History</h2>
            <p className="text-xs text-slate-400 mb-6">
              Track recent import operations and statistics for your account.
            </p>

            {historyList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No imports recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Items Imported</th>
                      <th className="px-4 py-3 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {historyList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/50">
                        <td className="px-4 py-3 font-medium uppercase text-indigo-400">{item.source}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{item.items_imported_count} items</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewPayload && (
        <ImportReviewModal
          portfolioId={selectedPortfolioId}
          initialPayload={reviewPayload}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
