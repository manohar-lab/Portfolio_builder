import React from "react";
import Link from "next/link";
import { Sparkles, Home, LayoutTemplate } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | PortfolioCraft",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
        <Sparkles className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
          404 Error
        </span>
        <h1 className="text-3xl font-extrabold text-white">Page Not Found</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested page or portfolio does not exist, has been unpublished, or is restricted.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Home className="w-4 h-4" /> Go to Home
        </Link>

        <Link
          href="/templates"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center gap-2"
        >
          <LayoutTemplate className="w-4 h-4 text-indigo-400" /> Explore Templates
        </Link>
      </div>
    </div>
  );
}
