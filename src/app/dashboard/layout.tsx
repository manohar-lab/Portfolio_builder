import React from "react";
import Link from "next/link";
import { requireAuth } from "@/auth/service";
import { signOutAction } from "@/auth/actions";
import { LayoutDashboard, User, LogOut, Sparkles } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side authorization check (redirects to /login if unauthenticated)
  const userData = await requireAuth("/dashboard");

  const displayName =
    userData.profile?.full_name ||
    userData.internalUser?.full_name ||
    userData.authUser.email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg">
            <span className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            PortfolioCraft <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Dashboard</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>

            <Link
              href="/dashboard/account"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <User className="w-3.5 h-3.5" /> Account
            </Link>

            <div className="h-4 w-px bg-slate-800 my-auto" />

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                {displayName}
              </span>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-300 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 hover:border-rose-500/30 transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </form>
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
