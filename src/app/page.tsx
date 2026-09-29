import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/auth/service";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Layers,
  Github,
  Palette,
  Globe,
  Lock,
  Eye,
  Edit3,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "PortfolioCraft | Build, Customize & Publish Developer & Research Portfolios",
  description:
    "A multi-user SaaS platform for creating, customizing, and publishing professional developer and researcher portfolio websites.",
};

const FEATURES_LIST = [
  {
    icon: Layers,
    title: "One Data Model, Multiple Templates",
    description: "Switch between Minimal, Developer, and Research designs seamlessly without re-entering projects or experience.",
  },
  {
    icon: Edit3,
    title: "Split-Screen Live Editor",
    description: "Instant live updates as you customize bio, skills, education, projects, and themes with debounced autosave.",
  },
  {
    icon: Github,
    title: "1-Click GitHub Repository Import",
    description: "Connect GitHub to import open-source repos into portfolio projects complete with star counts, languages, and topics.",
  },
  {
    icon: Palette,
    title: "Theme Presets & Appearance Editor",
    description: "Customize theme mode (light/dark/system), primary colors with contrast safety checks, typography, and spacing.",
  },
  {
    icon: Globe,
    title: "Personal Public URLs",
    description: "Get a clean unique URL at /u/[username] to share your portfolio across resumes, LinkedIn, and social profiles.",
  },
  {
    icon: Lock,
    title: "Draft Protection & Publishing Control",
    description: "Work safely in draft mode. Only content you explicitly publish is accessible to public visitors.",
  },
];

const AUDIENCE_LIST = [
  { title: "Developers & Builders", icon: Code2, desc: "Showcase tech stack, GitHub projects, live demo links, and work experience." },
  { title: "Researchers & Academics", icon: FlaskConical, desc: "Highlight research areas, methodologies, arXiv papers, and publication venues." },
  { title: "Students & Graduates", icon: GraduationCap, desc: "Track semester GPAs, academic progress, coursework, and early projects." },
  { title: "Freelancers & Practitioners", icon: Briefcase, desc: "Present client services, case studies, skill proficiencies, and direct contact options." },
];

const FAQS = [
  {
    q: "Is PortfolioCraft free to use?",
    a: "Yes! You can create, edit, customize, and publish your portfolio with our baseline template engine at no cost.",
  },
  {
    q: "How does the GitHub import work?",
    a: "You can securely connect your GitHub account via OAuth. PortfolioCraft fetches your public repositories and allows you to select specific projects to import into your portfolio.",
  },
  {
    q: "Can I switch templates later without losing my data?",
    a: "Absolutely! PortfolioCraft uses a presentation-agnostic data model. Changing templates alters only visual layout — all your projects, skills, education, and research remain 100% intact.",
  },
  {
    q: "What is the difference between Draft and Published status?",
    a: "Draft portfolios are private workspace versions accessible only to you while logged in. When you click Publish, your latest changes become visible on your assigned public URL.",
  },
  {
    q: "Can I unpublish or hide my portfolio anytime?",
    a: "Yes. You can unpublish your portfolio from your dashboard at any time, instantly revoking public access while preserving your portfolio data.",
  },
  {
    q: "Can I customize colors, fonts, and layout spacing?",
    a: "Yes! The appearance customizer offers mode selection (light/dark/system), custom hex color pickers with contrast warnings, typography selection, border radius, and spacing controls.",
  },
];

export default async function LandingPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" /> PortfolioCraft
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <Link href="/templates" className="hover:text-white transition">Templates</Link>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#github" className="hover:text-white transition">GitHub Import</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  href="/login?redirectTo=/onboarding"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
                >
                  Create Portfolio
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 space-y-24 py-12">
        <section className="max-w-6xl mx-auto px-6 text-center space-y-8 pt-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" /> Professional Portfolio Builder SaaS
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Build a portfolio that feels like <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">you</span>.
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Choose a design, add your work, import GitHub projects, customize colors & typography, and publish your personal website in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={user ? "/dashboard" : "/login?redirectTo=/onboarding"}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
            >
              {user ? "Open Dashboard" : "Create Your Portfolio"} <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/templates"
              className="px-7 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-2xl text-sm border border-slate-800 transition"
            >
              Explore Templates
            </Link>
          </div>

          {/* Product Demo Mock Frame */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-2">
              <div className="flex items-center justify-between px-3 py-1 text-xs text-slate-500 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-[11px] text-slate-400">portfoliocraft.app/u/developer</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-400 font-mono">Live Preview</span>
              </div>
              <div className="bg-slate-950 p-6 sm:p-10 rounded-2xl text-left space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Developer Template</span>
                    <h3 className="text-2xl font-bold text-white">Alex Rivera</h3>
                    <p className="text-xs text-slate-400">Senior Full-Stack Engineer &amp; Open-Source Contributor</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Published
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-xs">OmniStore Microservices</h4>
                    <p className="text-[11px] text-slate-400">High-throughput Next.js &amp; PostgreSQL platform.</p>
                    <div className="flex gap-1 pt-1">
                      <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 font-mono rounded">TypeScript</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 font-mono rounded">Next.js</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-xs">NeuroVision Medical AI</h4>
                    <p className="text-[11px] text-slate-400">PyTorch computer vision anomaly triage model.</p>
                    <div className="flex gap-1 pt-1">
                      <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 font-mono rounded">Python</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 font-mono rounded">PyTorch</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Simple Workflow</span>
            <h2 className="text-3xl font-extrabold text-white">How It Works</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              From sign up to personal published website in 4 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Choose Template", desc: "Select from Minimal, Developer, or Research visual designs." },
              { num: "02", title: "Add Your Content", desc: "Fill in bio, skills, education, or 1-click import from GitHub." },
              { num: "03", title: "Customize Style", desc: "Adjust theme modes, colors, fonts, radius, and spacing." },
              { num: "04", title: "Publish Website", desc: "Publish changes instantly to your assigned public URL." },
            ].map((step) => (
              <div key={step.num} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-2xl font-extrabold font-mono text-indigo-400">{step.num}</span>
                <h3 className="font-bold text-white text-base">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TEMPLATE SHOWCASE SECTION */}
        <section className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Visual Designs</span>
              <h2 className="text-3xl font-extrabold text-white">Template Catalog</h2>
              <p className="text-xs text-slate-400">Inspect template layouts before signing up.</p>
            </div>

            <Link
              href="/templates"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All Templates <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AVAILABLE_TEMPLATES.filter((t) => t.isAvailable).map((tpl) => (
              <div key={tpl.id} className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{tpl.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase">{tpl.category}</span>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">{tpl.description}</p>
                </div>

                <Link
                  href={`/templates/${tpl.id}`}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs text-center transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" /> Inspect Template
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* GITHUB INTEGRATION HIGHLIGHT */}
        <section id="github" className="max-w-6xl mx-auto px-6">
          <div className="p-8 sm:p-12 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Github className="w-3.5 h-3.5" /> GitHub Integration
              </span>
              <h2 className="text-3xl font-extrabold text-white">Already built projects on GitHub?</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your GitHub account and fetch your public repositories with stars, tech stacks, topics, and live links. Select which repositories to showcase with 1 click.
              </p>
            </div>

            <Link
              href={user ? "/dashboard" : "/login?redirectTo=/onboarding"}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
            >
              Import GitHub Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Platform Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white">Everything You Need to Showcase Your Work</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES_LIST.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TARGET AUDIENCE */}
        <section className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Crafted For Everyone</span>
            <h2 className="text-3xl font-extrabold text-white">Tailored for Every Career Discipline</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {AUDIENCE_LIST.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <div key={idx} className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{aud.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{aud.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PUBLIC PORTFOLIO EXAMPLES */}
        <section className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Demonstrations</span>
            <h2 className="text-3xl font-extrabold text-white">Live Example Portfolios</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Test real template rendering using sample demo profile data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href="/u/demo?template=developer"
              className="p-5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl space-y-2 transition group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Developer Demo</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-400">Software engineering projects, tech stack badges &amp; GitHub links.</p>
            </Link>

            <Link
              href="/u/demo?template=research"
              className="p-5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl space-y-2 transition group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Research Demo</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-400">Academic publications, research methodology &amp; paper URLs.</p>
            </Link>

            <Link
              href="/u/demo?template=minimal"
              className="p-5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl space-y-2 transition group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Minimal Demo</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-400">Typography-focused layout suitable for any general professional.</p>
            </Link>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Frequently Asked Questions</span>
            <h2 className="text-3xl font-extrabold text-white">Got Questions? We Have Answers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                <h3 className="font-bold text-white text-sm flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="max-w-4xl mx-auto px-6">
          <div className="p-8 sm:p-12 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to build your portfolio?</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Join students, developers, and researchers creating clean, customizable portfolios with PortfolioCraft.
            </p>
            <div>
              <Link
                href={user ? "/dashboard" : "/login?redirectTo=/onboarding"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-xl shadow-indigo-600/30"
              >
                {user ? "Go to Workspace Dashboard" : "Get Started Now"} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sparkles className="w-4 h-4 text-indigo-400" /> PortfolioCraft
          </div>

          <div className="flex items-center gap-6">
            <Link href="/templates" className="hover:text-slate-300 transition">Templates</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition">Terms of Service</Link>
            <Link href="/login" className="hover:text-slate-300 transition">Sign In</Link>
          </div>

          <p>&copy; 2026 PortfolioCraft SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
