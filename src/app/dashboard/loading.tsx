import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-8">
      <div className="h-32 bg-slate-900 border border-slate-800 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
