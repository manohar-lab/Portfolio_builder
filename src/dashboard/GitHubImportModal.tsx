"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GitHubRepo } from "@/types/portfolio";
import { fetchUserRepositoriesAction, importGitHubRepositoriesAction } from "@/dashboard/actions";
import {
  Github,
  Search,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react";

interface GitHubImportModalProps {
  portfolioId: string;
  isOpen: boolean;
  onClose: () => void;
  existingProjectGithubUrls?: string[];
  onImportSuccess?: (importedCount: number) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  portfolioId,
  isOpen,
  onClose,
  existingProjectGithubUrls = [],
  onImportSuccess,
}) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ imported: number; skipped: number } | null>(null);

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchUserRepositoriesAction({
      search: searchQuery,
      language: languageFilter,
      sort: sortBy,
    });

    if (res.success && res.repos) {
      // Mark already imported repos
      const mapped = res.repos.map((r) => ({
        ...r,
        isAlreadyImported: existingProjectGithubUrls.some(
          (url) => url.toLowerCase() === r.htmlUrl.toLowerCase() || url.includes(r.id.toString())
        ),
      }));
      setRepos(mapped);
    } else {
      setErrorMsg(res.error || "Failed to load GitHub repositories.");
    }
    setLoading(false);
  }, [searchQuery, languageFilter, sortBy, existingProjectGithubUrls]);

  useEffect(() => {
    if (isOpen) {
      loadRepositories();
      setSuccessResult(null);
      setSelectedRepoIds(new Set());
    }
  }, [isOpen, loadRepositories]);

  if (!isOpen) return null;

  const toggleSelectRepo = (id: number, isAlreadyImported?: boolean) => {
    if (isAlreadyImported) return;
    const next = new Set(selectedRepoIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRepoIds(next);
  };

  const handleSelectAll = () => {
    const importableIds = repos.filter((r) => !r.isAlreadyImported).map((r) => r.id);
    if (selectedRepoIds.size === importableIds.length) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(importableIds));
    }
  };

  const handleImportSubmit = async () => {
    if (selectedRepoIds.size === 0) return;
    setImporting(true);
    setErrorMsg(null);

    const reposToImport = repos.filter((r) => selectedRepoIds.has(r.id));
    const res = await importGitHubRepositoriesAction(portfolioId, reposToImport);

    setImporting(false);

    if (res.success) {
      setSuccessResult({ imported: res.importedCount, skipped: res.skippedCount });
      if (onImportSuccess) onImportSuccess(res.importedCount);
    } else {
      setErrorMsg(res.error || "Import operation failed.");
    }
  };

  const uniqueLanguages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean) as string[])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[640px] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Import GitHub Repositories</h2>
              <p className="text-xs text-gray-500">Select repositories to convert into portfolio project entries.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 bg-white sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Languages</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "updated" | "stars" | "name")}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="stars">Most Stars</option>
              <option value="name">Alphabetical</option>
            </select>

            <button
              onClick={handleSelectAll}
              disabled={repos.length === 0}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-40"
            >
              Select All
            </button>
          </div>
        </div>

        {/* Success Result View */}
        {successResult ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                {successResult.imported} Projects Successfully Imported
              </h3>
              <p className="text-xs text-gray-500">
                {successResult.skipped > 0
                  ? `${successResult.skipped} duplicate projects were skipped.`
                  : "All selected repositories have been converted into portfolio projects."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Done & View Projects
            </button>
          </div>
        ) : (
          /* Repositories List View */
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-xs text-gray-500 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" /> Loading GitHub repositories...
              </div>
            ) : errorMsg ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            ) : repos.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No matching repositories found.
              </div>
            ) : (
              repos.map((repo) => {
                const isSelected = selectedRepoIds.has(repo.id);

                return (
                  <div
                    key={repo.id}
                    onClick={() => toggleSelectRepo(repo.id, repo.isAlreadyImported)}
                    className={`flex items-start justify-between rounded-xl border p-4 transition cursor-pointer ${
                      repo.isAlreadyImported
                        ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                        : "border-gray-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        disabled={repo.isAlreadyImported}
                        checked={isSelected || repo.isAlreadyImported}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{repo.name}</h4>
                          {repo.isPrivate && (
                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold text-gray-700 uppercase">
                              Private
                            </span>
                          )}
                          {repo.isAlreadyImported && (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              Already imported
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{repo.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-500">
                          {repo.language && (
                            <span className="font-semibold text-indigo-600">{repo.language}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-400" /> {repo.stargazersCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="h-3 w-3 text-gray-400" /> {repo.forksCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!successResult && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
            <span className="text-xs font-semibold text-gray-500">
              {selectedRepoIds.size} repository selected
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={selectedRepoIds.size === 0 || importing}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    Import Selected ({selectedRepoIds.size}) <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
