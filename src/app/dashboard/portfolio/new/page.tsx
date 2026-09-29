"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortfolioAction } from "@/dashboard/actions";
import { generateSlug, isValidSlug } from "@/utilities/slug";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { ArrowLeft, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState("developer");
  const [description, setDescription] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isCustomSlug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const slugCheck = isValidSlug(slug);
    if (!slugCheck.valid) {
      setErrorMsg(slugCheck.reason || "Invalid slug format.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("templateId", templateId);
    formData.append("description", description);

    try {
      const res = await createPortfolioAction(formData);
      if (res.success && res.portfolio) {
        router.push(`/dashboard/portfolio/${res.portfolio.id}`);
      } else {
        setErrorMsg(res.error || "Failed to create portfolio.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> New Portfolio Entity
          </span>
          <h1 className="text-2xl font-bold text-white">Create New Portfolio</h1>
          <p className="text-xs text-slate-400">
            Portfolios start in DRAFT status and will receive a unique public URL.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TITLE */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Portfolio Name / Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Software Engineer Portfolio"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* SLUG */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Unique Portfolio Slug / Public URL <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-500 font-mono select-none">/u/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                placeholder="my-portfolio-slug"
                className="w-full bg-transparent text-sm text-white font-mono placeholder-slate-600 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Must be unique, lowercased, and contain only letters, numbers, and hyphens.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Optional Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of portfolio purpose"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* INITIAL TEMPLATE */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Initial Presentation Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {AVAILABLE_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} — {tmpl.description}
                </option>
              ))}
            </select>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title || !slug}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Portfolio...
                </>
              ) : (
                "Create Portfolio & Continue →"
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
