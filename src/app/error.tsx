"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server error for production observability without leaking stack trace to user
    console.error("Unhandled client boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-extrabold text-white">Something went wrong</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          An unexpected technical error occurred while loading this page. Our system logs have recorded the event.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>

        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
