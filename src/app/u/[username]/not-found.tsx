import React from "react";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function PublicPortfolioNotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
      <div className="mx-auto flex max-w-md flex-col items-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 shadow-xl">
          <FileQuestion className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Portfolio Unavailable</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The portfolio you are looking for does not exist, is set to private draft mode, or has been unpublished by its owner.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Home className="h-4 w-4" /> Return to Homepage
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Create Your Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
