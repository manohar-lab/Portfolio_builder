import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/auth/service";
import { getPortfolioFullData } from "@/database/portfolio-service";
import { updatePortfolioStatusAction, deletePortfolioAction } from "@/dashboard/actions";
import {
  User,
  GraduationCap,
  Code2,
  Briefcase,
  BookOpen,
  Award,
  Share2,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowLeft,
  Layers,
  Sparkles,
} from "lucide-react";

interface PortfolioDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioDetailsPage({ params }: PortfolioDetailsPageProps) {
  const { id } = await params;
  await requireAuth(`/dashboard/portfolio/${id}`);

  const portfolio = await getPortfolioFullData(id);
  if (!portfolio) {
    notFound();
  }

  const publicUrl = `/u/${portfolio.slug}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER NAV */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard Overview
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" /> Live Preview <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* PORTFOLIO OVERVIEW HEADER */}
      <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white">{portfolio.title}</h1>
              {portfolio.isPublished ? (
                <span className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Published
                </span>
              ) : (
                <span className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Draft
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Public URL: <strong className="text-blue-400">{publicUrl}</strong>
            </p>
          </div>

          {/* STATUS TOGGLE FORM */}
          <form
            action={async () => {
              "use server";
              await updatePortfolioStatusAction(portfolio.id, !portfolio.isPublished);
            }}
          >
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 ${
                portfolio.isPublished
                  ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
              }`}
            >
              {portfolio.isPublished ? "Unpublish (Set to Draft)" : "Publish Portfolio"}
            </button>
          </form>
        </div>

        {/* CONTENT SUMMARY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-4 border-t border-slate-800">
          
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Profile</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Projects</span>
            <div className="text-sm font-bold text-white">{portfolio.projects.length}</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Skills</span>
            <div className="text-sm font-bold text-white">{portfolio.skills.length}</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Education</span>
            <div className="text-sm font-bold text-white">{portfolio.education.length}</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Experience</span>
            <div className="text-sm font-bold text-white">{portfolio.experience.length}</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Research</span>
            <div className="text-sm font-bold text-white">{portfolio.research.length}</div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Socials</span>
            <div className="text-sm font-bold text-white">{portfolio.socialLinks.length}</div>
          </div>

        </div>
      </div>

      {/* SECTION MANAGEMENT TABS GRID */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> Manage Portfolio Content Sections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <Link
            href={`/dashboard/portfolio/${portfolio.id}/profile`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Profile & Contact Info</h3>
            <p className="text-xs text-slate-400">Full name, headline, bio, location, contact details & resume.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/projects`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Projects ({portfolio.projects.length})</h3>
            <p className="text-xs text-slate-400">Tech stack, problem statements, demo links & featured flags.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/education`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Education & Semesters ({portfolio.education.length})</h3>
            <p className="text-xs text-slate-400">Institutions, degrees, CGPA, and semester-wise progress.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/skills`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Skills ({portfolio.skills.length})</h3>
            <p className="text-xs text-slate-400">Programming languages, frameworks, AI/ML tools & categories.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/experience`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Experience ({portfolio.experience.length})</h3>
            <p className="text-xs text-slate-400">Work history, roles, companies, dates & descriptions.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/research`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Research ({portfolio.research.length})</h3>
            <p className="text-xs text-slate-400">Academic papers, methodology, datasets & venues.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/achievements`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Achievements & Certifications</h3>
            <p className="text-xs text-slate-400">Awards, credentials, hackathons & certifications.</p>
          </Link>

          <Link
            href={`/dashboard/portfolio/${portfolio.id}/socials`}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Social Profiles ({portfolio.socialLinks.length})</h3>
            <p className="text-xs text-slate-400">GitHub, LinkedIn, Twitter/X, Google Scholar & custom links.</p>
          </Link>

        </div>
      </div>

      {/* DANGEROUS ZONE */}
      <div className="p-6 bg-rose-950/20 border border-rose-500/20 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-bold text-rose-300 text-sm">Delete Portfolio Entity</h4>
          <p className="text-xs text-rose-400/80">Permanently delete this portfolio entity and its associated section entries.</p>
        </div>

        <form
          action={async () => {
            "use server";
            await deletePortfolioAction(portfolio.id);
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-200 font-semibold text-xs rounded-xl border border-rose-500/40 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Portfolio
          </button>
        </form>
      </div>

    </div>
  );
}
