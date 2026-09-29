import React from "react";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
        <span className="text-xs font-semibold text-slate-300">Loading PortfolioCraft...</span>
      </div>
    </div>
  );
}
