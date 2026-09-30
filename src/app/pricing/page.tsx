import React from "react";
import Link from "next/link";
import { PLAN_CONFIGS } from "@/config/plans";
import { Check, Sparkles, ArrowRight, Zap } from "lucide-react";

export const metadata = {
  title: "Pricing Plans - PortfolioCraft SaaS",
  description: "Simple, transparent pricing for developers, engineers, and researchers. Build your professional portfolio for free or upgrade to Pro for custom domains.",
};

export default function PricingPage() {
  const freePlan = PLAN_CONFIGS.free;
  const proPlan = PLAN_CONFIGS.pro;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* HEADER NAV */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-lg text-white">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              P
            </div>
            PortfolioCraft
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN PRICING BODY */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Transparent Commercial Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Simple, Sustainable Pricing
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Build and publish a powerful portfolio for free. Upgrade to Pro anytime for custom domain branding and advanced customization.
          </p>
        </div>

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* FREE PLAN */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-slate-700 transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">{freePlan.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{freePlan.description}</p>
                </div>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
                  Free Forever
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>

              <hr className="border-slate-800" />

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Included Features:</span>
                {freePlan.featureList.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/onboarding"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition text-center block"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-xl">
              POPULAR
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {proPlan.name} <Zap className="w-4 h-4 text-amber-400" />
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">{proPlan.description}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">${proPlan.priceMonthly}</span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>

              <hr className="border-indigo-500/30" />

              <div className="space-y-3">
                <span className="text-xs font-bold text-indigo-300 block">Everything in Free, plus:</span>
                {proPlan.featureList.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-100">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard/account"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition text-center shadow-lg block flex items-center justify-center gap-2"
            >
              Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 PortfolioCraft SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
