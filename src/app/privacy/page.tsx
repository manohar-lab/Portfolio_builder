import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | PortfolioCraft",
  description: "Learn how PortfolioCraft collects, handles, and protects user portfolio data and account information.",
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: September 29, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              PortfolioCraft collects information you explicitly provide when creating an account and building your portfolio. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-2">
              <li><strong>Account Information</strong>: Name, email address, and profile avatar supplied via OAuth providers (Google or GitHub).</li>
              <li><strong>Portfolio Content</strong>: Profile headlines, bios, projects, skills, education history, research publications, achievements, and social links.</li>
              <li><strong>GitHub Integration Data</strong>: Public repository metadata (titles, descriptions, topics, star counts, URLs) when you explicitly authorize GitHub import.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
            <p>
              Your data is exclusively used to render your portfolio templates, enable editing in your private workspace, and host your published public web pages at <code>/u/[username]</code>. We do not sell your personal data to third parties or advertising networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Data Visibility & Public Portfolios</h2>
            <p>
              You maintain complete control over what content is published. Draft portfolios remain strictly private and accessible only to you. Only content you explicitly publish becomes accessible via your unique public portfolio URL.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Cookies & Authentication</h2>
            <p>
              We use secure, HTTP-only authentication cookies strictly necessary to maintain your session state. We do not use intrusive third-party tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Account Deletion & Data Removal</h2>
            <p>
              You may request account deletion or unpublish your portfolio anytime from your dashboard settings. Unpublishing instantly revokes public access to your personal portfolio.
            </p>
          </section>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
            <strong>Legal Notice:</strong> This privacy policy serves as an overview of platform data handling. For formal enterprise compliance or legal inquiries, please contact our administrative team.
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-600">
        PortfolioCraft SaaS &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
