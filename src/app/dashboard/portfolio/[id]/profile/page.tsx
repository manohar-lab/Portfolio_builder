"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { updateProfileAction } from "@/dashboard/actions";
import { UserProfile } from "@/types/portfolio";
import { ArrowLeft, User, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ProfileEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function ProfileEditorPage({ params }: ProfileEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [profile, setProfile] = useState<UserProfile>({
    fullName: "Jane Doe",
    headline: "Senior Full Stack Engineer & Researcher",
    bio: "Passionate about building scalable web platforms, high-performance distributed systems, and accessible user experiences.",
    location: "San Francisco, CA",
    email: "jane.doe@example.com",
    phone: "+1 (555) 019-2834",
    website: "https://janedoe.example.com",
    githubUrl: "https://github.com/janedoe",
    linkedinUrl: "https://linkedin.com/in/janedoe",
    isAvailableForWork: true,
    resumeUrl: "https://example.com/resume.pdf",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const res = await updateProfileAction(profile, portfolioId);
      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      } else {
        setErrorMsg(res.error || "Failed to update profile.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred.";
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/portfolio/${portfolioId}`}
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio Management
        </Link>
      </div>

      <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Profile & Contact Details</h1>
            <p className="text-xs text-slate-400">Public representation across all presentation templates.</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Profile saved successfully!
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Professional Headline *</label>
              <input
                type="text"
                required
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Short Bio</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Public Contact Email</label>
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Location</label>
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Resume / CV Link</label>
              <input
                type="url"
                value={profile.resumeUrl || ""}
                onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={profile.isAvailableForWork}
              onChange={(e) => setProfile({ ...profile, isAvailableForWork: e.target.checked })}
              className="w-4 h-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950"
            />
            <label htmlFor="isAvailable" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Mark as available for new opportunities / hiring
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Changes"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
