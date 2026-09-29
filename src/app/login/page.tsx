"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { signInWithOAuthAction } from "@/auth/actions";
import { Github, Sparkles, AlertCircle, Loader2 } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirectTo } = use(searchParams);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    try {
      await signInWithOAuthAction(provider, redirectTo || "/dashboard");
    } catch (err) {
      console.error("Login trigger error:", err);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12 bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* BACKGROUND DECORATIVE GRADIENT */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> PortfolioCraft SaaS
          </Link>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create your portfolio
          </h1>
          <p className="text-sm text-slate-400">
            Build your professional identity.
          </p>
        </div>

        {/* ERROR NOTIFICATION BAR */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-rose-200">Authentication Alert: </strong>
              {decodeURIComponent(error)}
            </div>
          </div>
        )}

        {/* OAUTH BUTTONS */}
        <div className="space-y-4 pt-2">
          {/* GOOGLE OAUTH BUTTON */}
          <button
            onClick={() => handleOAuthLogin("google")}
            disabled={loadingProvider !== null}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.05.0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{loadingProvider === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* GITHUB OAUTH BUTTON */}
          <button
            onClick={() => handleOAuthLogin("github")}
            disabled={loadingProvider !== null}
            className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loadingProvider === "github" ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
            ) : (
              <Github className="w-4 h-4 text-slate-200" />
            )}
            <span>{loadingProvider === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
          </button>
        </div>

        {/* FOOTER DISCLOSURE */}
        <div className="border-t border-slate-800/80 pt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Protected by server-side OAuth authentication & PostgreSQL Row Level Security.
          </p>
          <Link href="/" className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-block">
            ← Back to Platform Overview
          </Link>
        </div>

      </div>
    </div>
  );
}
