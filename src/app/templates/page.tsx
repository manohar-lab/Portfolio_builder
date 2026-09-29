import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/auth/service";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import {
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  ArrowLeft,
  LayoutTemplate,
} from "lucide-react";

export const metadata = {
  title: "Portfolio Templates | PortfolioCraft",
  description:
    "Explore developer, research, and minimal portfolio template designs. Switch templates anytime without re-entering your data.",
};

export default async function PublicTemplatesPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" /> PortfolioCraft
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Create Portfolio
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <LayoutTemplate className="w-4 h-4" /> Professional Template Engine
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Explore Portfolio Templates
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            All templates share the exact same underlying portfolio data model. Pick a design now and switch anytime without re-keying your projects, skills, or experience.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                tpl.isAvailable
                  ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl"
                  : "bg-slate-900/40 border-slate-800/60 opacity-60"
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{tpl.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      {tpl.category}
                    </span>
                  </div>

                  {tpl.isAvailable ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-800 text-slate-500 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                {tpl.bestFor && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Best Suited For:</span>
                    <ul className="space-y-1">
                      {tpl.bestFor.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6">
                {tpl.isAvailable ? (
                  <>
                    <Link
                      href={`/templates/${tpl.id}`}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> Inspect Template
                    </Link>

                    <Link
                      href={user ? `/dashboard/templates` : `/login?redirectTo=/onboarding`}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl text-center transition flex items-center gap-1"
                    >
                      Use <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-800/50 text-slate-500 text-xs font-semibold rounded-xl text-center cursor-not-allowed"
                  >
                    Template In Development
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-600">
        PortfolioCraft SaaS &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
