import Link from "next/link";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { CheckCircle2, Layers, ShieldCheck, Sparkles, UserCheck, ArrowRight, Database } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-16">
      
      {/* HERO SECTION */}
      <section className="text-center space-y-6 pt-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Multi-User SaaS Platform Architecture — Phase 0 Ready
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Build & Publish Professional Portfolios in Seconds
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-light">
          A real multi-user SaaS platform where students, developers, researchers, and creators customize and publish their personal portfolios with a single shared data model across multiple templates.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/u/demo"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            Explore Public Portfolio Demo (/u/demo) <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#architecture"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm border border-slate-800 transition-all"
          >
            View Architecture & DB Schema
          </a>
        </div>
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Single Data Model, Multiple Templates</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Switch between Minimal, Developer, Research, or Student templates seamlessly without re-entering your projects or experience.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Tailored for Every Discipline</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Full support for academic semester tracking, GPAs, computer vision research, paper URLs, and software tech stacks.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Server-Side RLS & Unique Slugs</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            PostgreSQL Row Level Security ensures users can only modify their own portfolios. Unique slugs guarantee clean URLs.
          </p>
        </div>
      </section>

      {/* AVAILABLE TEMPLATES CATALOG */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white">Template Architecture</h2>
            <p className="text-sm text-slate-400">Presentation layers consuming standard PortfolioData</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {AVAILABLE_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white">{tmpl.name}</h3>
                  {tmpl.isAvailable ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                      Planned
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>
              </div>

              {tmpl.isAvailable && (
                <Link
                  href={`/u/demo?template=${tmpl.id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 pt-2 border-t border-slate-800"
                >
                  Preview with Demo Data <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PHASE 0 ARCHITECTURE OVERVIEW */}
      <section id="architecture" className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Phase 0 Architecture Specification</h2>
            <p className="text-xs text-slate-400">Strict isolation of concerns & multi-tenant security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Database & RLS
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              PostgreSQL schema defined with 17 normalized tables (`portfolios`, `projects`, `education`, `research`, `academic_semesters`). Row Level Security (RLS) policies restrict mutation to `auth.uid()`.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standardized PortfolioData
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly typed TypeScript domain model (`src/types/portfolio.ts`) validated via Zod schemas. Presentation templates consume this data without hardcoded information.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Public URL Strategy
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scalable `/u/[username]` dynamic route strategy with reserved slug protection (`admin`, `api`, `dashboard`, `auth`).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Testing & Build Verification
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vitest suite configured for slug validation, portfolio normalization, and Zod schemas. Fully typed with strict mode enabled.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
