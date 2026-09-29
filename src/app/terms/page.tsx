import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | PortfolioCraft",
  description: "Terms and conditions for using the PortfolioCraft SaaS platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" /> PortfolioCraft
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 flex-1">
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: September 29, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By signing in to PortfolioCraft, creating a portfolio, or publishing a public web page, you agree to comply with these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Acceptable Use & Content Ownership</h2>
            <p>
              You retain 100% ownership of all content, projects, publications, and images you upload or publish through PortfolioCraft. You are solely responsible for ensuring your published content does not infringe copyright, contain malicious scripts, or violate applicable laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Public Username & Slug Policy</h2>
            <p>
              Public usernames (`/u/[username]`) are assigned on a first-come, first-served basis. Impersonation, trademark squatting, or claiming reserved system names (such as <code>admin</code>, <code>api</code>, <code>dashboard</code>) is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Availability & Service Integrity</h2>
            <p>
              We strive to maintain high availability for your published portfolio pages. However, the service is provided on an &quot;as-is&quot; basis without warranties of uninterrupted availability during scheduled infrastructure maintenance.
            </p>
          </section>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
            <strong>Notice:</strong> These terms govern platform usage. For enterprise inquiries or custom SLA requests, please contact our platform support.
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-600">
        PortfolioCraft SaaS &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
