"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveSocialLinkAction, deleteSocialLinkAction } from "@/dashboard/actions";
import { SocialLink } from "@/types/portfolio";
import { ArrowLeft, Share2, Plus, Trash2, ExternalLink } from "lucide-react";

interface SocialsEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function SocialsEditorPage({ params }: SocialsEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [socials, setSocials] = useState<SocialLink[]>([
    { id: "s-1", platform: "github", label: "GitHub", url: "https://github.com/janedoe" },
    { id: "s-2", platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
    { id: "s-3", platform: "twitter", label: "Twitter", url: "https://x.com/janedoe" },
  ]);

  const [platform, setPlatform] = useState("github");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSaving(true);
    const linkPayload: SocialLink = {
      id: "",
      platform,
      url: url.trim(),
      label: label.trim() || platform,
    };

    try {
      const res = await saveSocialLinkAction(portfolioId, linkPayload);
      if (res.success) {
        setSocials([...socials, { ...linkPayload, id: `s-${Date.now()}` }]);
        setUrl("");
        setLabel("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    try {
      await deleteSocialLinkAction(portfolioId, linkId);
      setSocials(socials.filter((s) => s.id !== linkId));
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
          <Share2 className="w-5 h-5 text-cyan-400" /> Add Social Profile Link
        </h2>

        <form onSubmit={handleAddSocial} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-44 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
              <option value="scholar">Google Scholar</option>
              <option value="youtube">YouTube</option>
              <option value="medium">Medium</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex-1 space-y-2 w-full">
            <label className="block text-xs font-semibold text-slate-300">Target Profile URL *</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-40 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Display Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. GitHub"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || !url.trim()}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Connected Social Links ({socials.length})</h2>

        <div className="space-y-3">
          {socials.map((s) => (
            <div key={s.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-sm capitalize">{s.label || s.platform}</span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  {s.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
