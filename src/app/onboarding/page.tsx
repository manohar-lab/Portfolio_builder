"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Code2,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  Github,
  Check,
  X,
  Eye,
  Edit3,
  Award,
  ShieldCheck,
  Globe,
  BookOpen,
  FolderGit2,
  UserCheck,
} from "lucide-react";

import {
  getOnboardingStatusAction,
  saveOnboardingStepAction,
  completeOnboardingAction,
  checkSlugAvailabilityAction,
  getGitHubStatusAction,
} from "@/dashboard/actions";
import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { SectionType, GitHubConnectionStatus } from "@/types/portfolio";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";

const PROFILE_TYPES = [
  {
    id: "developer",
    title: "Developer / Software Engineer",
    description: "Showcase code, GitHub repos, tech stack, and web applications.",
    icon: Code2,
    recommendedTemplate: "developer",
    defaultSections: ["hero", "about", "skills", "projects", "experience", "education", "social_links"],
  },
  {
    id: "researcher",
    title: "Researcher / Academic",
    description: "Highlight publications, research areas, datasets, papers, and credentials.",
    icon: FlaskConical,
    recommendedTemplate: "research",
    defaultSections: ["hero", "about", "research", "projects", "skills", "education", "achievements", "social_links"],
  },
  {
    id: "student",
    title: "Student / Graduate",
    description: "Emphasize coursework, academic progress, education, and early projects.",
    icon: GraduationCap,
    recommendedTemplate: "minimal",
    defaultSections: ["hero", "about", "education", "academic_journey", "projects", "skills", "social_links"],
  },
  {
    id: "freelancer",
    title: "Freelancer / Consultant",
    description: "Clean layout for client projects, services, skills, and direct contact.",
    icon: Briefcase,
    recommendedTemplate: "minimal",
    defaultSections: ["hero", "about", "projects", "skills", "experience", "contact", "social_links"],
  },
  {
    id: "professional",
    title: "General Professional",
    description: "Versatile professional background, achievements, and work experience.",
    icon: UserCheck,
    recommendedTemplate: "minimal",
    defaultSections: ["hero", "about", "experience", "skills", "education", "achievements", "social_links"],
  },
];

const AVAILABLE_SECTION_OPTIONS: { id: SectionType; title: string; icon: React.ElementType }[] = [
  { id: "projects", title: "Projects", icon: FolderGit2 },
  { id: "skills", title: "Skills & Technologies", icon: Code2 },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "experience", title: "Work Experience", icon: Briefcase },
  { id: "research", title: "Research & Publications", icon: FlaskConical },
  { id: "achievements", title: "Achievements & Awards", icon: Award },
  { id: "certifications", title: "Certifications", icon: ShieldCheck },
  { id: "academic_journey", title: "Academic Journey", icon: BookOpen },
  { id: "social_links", title: "Social Links", icon: Globe },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [profileType, setProfileType] = useState<string>("developer");
  const [selectedSections, setSelectedSections] = useState<SectionType[]>([
    "hero",
    "about",
    "projects",
    "skills",
    "education",
    "experience",
    "social_links",
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("developer");
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  // Slug Checking State
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  // GitHub Connection
  const [githubStatus, setGithubStatus] = useState<GitHubConnectionStatus>({ isConnected: false });

  // Preview Modal State
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Created Result State
  const [createdPortfolioId, setCreatedPortfolioId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Load existing onboarding status on initial mount
  useEffect(() => {
    async function init() {
      try {
        const [status, ghStatus] = await Promise.all([
          getOnboardingStatusAction(),
          getGitHubStatusAction(),
        ]);

        setGithubStatus(ghStatus);

        if (status.onboardingStep > 1 && status.onboardingStep <= 7) {
          setStep(status.onboardingStep);
        }
        if (status.profileType) {
          setProfileType(status.profileType);
        }
      } catch (err) {
        console.error("Failed to initialize onboarding status:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Update sections when profile type changes
  const handleSelectProfileType = (typeId: string) => {
    setProfileType(typeId);
    const matched = PROFILE_TYPES.find((p) => p.id === typeId);
    if (matched) {
      setSelectedTemplateId(matched.recommendedTemplate);
      setSelectedSections(matched.defaultSections as SectionType[]);
    }
  };

  // Toggle section visibility selection
  const toggleSectionChoice = (secId: SectionType) => {
    setSelectedSections((prev) =>
      prev.includes(secId) ? prev.filter((id) => id !== secId) : [...prev, secId]
    );
  };

  // Real-time Slug Check (Debounced)
  useEffect(() => {
    if (!slug || slug.trim().length < 3) {
      setSlugStatus({ checking: false });
      return;
    }

    setSlugStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await checkSlugAvailabilityAction(slug);
        setSlugStatus({ checking: false, available: res.available, reason: res.reason });
      } catch {
        setSlugStatus({ checking: false, available: false, reason: "Error checking username." });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  // Handle Step Advancement with persistence
  const goToNextStep = async () => {
    const nextStep = Math.min(step + 1, 7);
    setStep(nextStep);
    await saveOnboardingStepAction(nextStep, profileType);
  };

  const goToPrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Completion Action
  const handleFinishOnboarding = async () => {
    if (!portfolioTitle.trim()) return;
    if (!slug || !slugStatus.available) return;

    setSubmitting(true);
    try {
      const res = await completeOnboardingAction({
        title: portfolioTitle.trim(),
        slug: slug.trim(),
        templateId: selectedTemplateId,
        profileType: profileType,
        selectedSections: selectedSections,
      });

      if (res.success && res.portfolioId && res.slug) {
        setCreatedPortfolioId(res.portfolioId);
        setCreatedSlug(res.slug);
        setStep(7);
      } else {
        alert(res.error || "Failed to finalize portfolio. Please try again.");
      }
    } catch (err) {
      console.error("Error creating portfolio in onboarding:", err);
      alert("An error occurred while creating your portfolio.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-slate-300">Loading onboarding workflow...</span>
        </div>
      </div>
    );
  }

  // Active step rendering logic
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" /> PortfolioCraft
          </Link>
          <span className="h-4 w-px bg-slate-800" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            First-time Onboarding
          </span>
        </div>

        {/* Progress Bar Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Step {step} of 7</span>
          </div>
          <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        
        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-4 h-4" /> Welcome to PortfolioCraft
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Let&apos;s build your portfolio.
              </h1>
              <p className="text-base text-slate-400 leading-relaxed">
                Create a stunning, professional portfolio website in under 3 minutes.
                Pick your style, showcase your work, and get a unique public link to share.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Modular Templates</h3>
                <p className="text-xs text-slate-400">
                  Switch between Developer, Research, and Minimal designs without losing data.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Github className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">1-Click GitHub Import</h3>
                <p className="text-xs text-slate-400">
                  Connect your GitHub and import projects with stars, topics, and live links.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Instant Public Link</h3>
                <p className="text-xs text-slate-400">
                  Publish updates in real time with your unique personal URL.
                </p>
              </div>
            </div>

            <div className="pt-6 text-center">
              <button
                onClick={goToNextStep}
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/30"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHAT DESCRIBES YOU */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 2 of 7</span>
              <h2 className="text-3xl font-extrabold text-white">What describes you best?</h2>
              <p className="text-xs text-slate-400">
                This selection helps us recommend optimal template layouts and default sections.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROFILE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = profileType === type.id;

                return (
                  <div
                    key={type.id}
                    onClick={() => handleSelectProfileType(type.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">{type.title}</h3>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={goToNextStep}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WHAT DO YOU WANT TO SHOWCASE */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 3 of 7</span>
              <h2 className="text-3xl font-extrabold text-white">What do you want to showcase?</h2>
              <p className="text-xs text-slate-400">
                Choose initial sections to display. You can enable or disable sections anytime in the editor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AVAILABLE_SECTION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isChecked = selectedSections.includes(opt.id);

                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleSectionChoice(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? "bg-indigo-950/40 border-indigo-500 text-white"
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isChecked ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="text-xs font-bold">{opt.title}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={goToNextStep}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE A STARTING DESIGN */}
        {step === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 4 of 7</span>
              <h2 className="text-3xl font-extrabold text-white">Choose a starting design</h2>
              <p className="text-xs text-slate-400">
                Select a template. You can switch between templates anytime without losing data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {AVAILABLE_TEMPLATES.filter((t) => t.isAvailable).map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`rounded-2xl border p-5 space-y-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{tpl.name}</h3>
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                            {tpl.category}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded">
                            Selected
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                      {tpl.bestFor && (
                        <div className="space-y-1 pt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Best Suited For:</span>
                          <div className="flex flex-wrap gap-1">
                            {tpl.bestFor.map((item, idx) => (
                              <span key={idx} className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded-md">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <button
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select Template"}
                      </button>

                      <button
                        onClick={() => setPreviewTemplateId(tpl.id)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center justify-center"
                        title="Preview template design"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={goToNextStep}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CREATE PORTFOLIO IDENTITY */}
        {step === 5 && (
          <div className="space-y-8 animate-fadeIn max-w-lg mx-auto w-full">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 5 of 7</span>
              <h2 className="text-3xl font-extrabold text-white">Create portfolio identity</h2>
              <p className="text-xs text-slate-400">
                Choose a title for your portfolio and claim your unique public username.
              </p>
            </div>

            <div className="space-y-5 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Portfolio Title</label>
                <input
                  type="text"
                  placeholder="e.g. Naveen Kumar Portfolio"
                  value={portfolioTitle}
                  onChange={(e) => {
                    setPortfolioTitle(e.target.value);
                    if (!slug) {
                      setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Public Username / Slug</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. naveen-kumar"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {slugStatus.checking && (
                    <span className="absolute right-3 top-3.5 h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  )}
                </div>

                <div className="text-xs pt-1">
                  {slug.trim().length < 3 ? (
                    <p className="text-slate-500">Username must be at least 3 alphanumeric characters.</p>
                  ) : slugStatus.checking ? (
                    <p className="text-indigo-400">Checking availability...</p>
                  ) : slugStatus.available ? (
                    <p className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ✓ {slug} is available
                    </p>
                  ) : (
                    <p className="text-rose-400 font-semibold flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> ✕ {slugStatus.reason || "Username is unavailable"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={goToNextStep}
                disabled={!portfolioTitle.trim() || !slugStatus.available}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: IMPORT OR ADD INFORMATION */}
        {step === 6 && (
          <div className="space-y-8 animate-fadeIn max-w-xl mx-auto w-full">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 6 of 7</span>
              <h2 className="text-3xl font-extrabold text-white">Import or add information</h2>
              <p className="text-xs text-slate-400">
                Choose how you want to populate your initial project content.
              </p>
            </div>

            <div className="space-y-4">
              {/* GitHub Connected / Connect Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">GitHub Integration</h3>
                      <p className="text-xs text-slate-400">
                        {githubStatus.isConnected
                          ? `Connected as @${githubStatus.username}`
                          : "Connect GitHub to import open-source repositories into projects."}
                      </p>
                    </div>
                  </div>

                  {githubStatus.isConnected && (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold">
                      Connected
                    </span>
                  )}
                </div>

                {!githubStatus.isConnected ? (
                  <a
                    href="/api/auth/github"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition"
                  >
                    <Github className="w-4 h-4" /> Connect GitHub
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 pt-1">
                    You can import selected repositories directly after finishing onboarding!
                  </p>
                )}
              </div>

              {/* Add Manually Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" /> Add Content Manually
                </h3>
                <p className="text-xs text-slate-400">
                  You can fill in your projects, profile headline, education, skills, and experience directly in the visual editor.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleFinishOnboarding}
                disabled={submitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating Portfolio...
                  </>
                ) : (
                  <>
                    Create Portfolio <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: FINISH & CONFIRMATION */}
        {step === 7 && (
          <div className="space-y-8 animate-fadeIn text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Setup Complete
              </span>
              <h2 className="text-4xl font-extrabold text-white">Your portfolio is ready!</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                We&apos;ve initialized your portfolio <span className="text-white font-bold">{portfolioTitle}</span> with your selected template and sections.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Assigned Public URL</span>
              <p className="text-sm font-mono text-indigo-400 font-bold">
                /u/{createdSlug || slug}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <button
                onClick={() => router.push(`/dashboard/portfolio/${createdPortfolioId || ""}`)}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Edit3 className="w-4 h-4" /> Open Editor
              </button>

              <Link
                href={`/u/${createdSlug || slug}`}
                target="_blank"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Preview Draft
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* Interactive Template Preview Modal */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-white text-sm capitalize">
                  Template Preview: {previewTemplateId}
                </h3>
              </div>

              <button
                onClick={() => setPreviewTemplateId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
              <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl bg-white">
                <PortfolioRenderer
                  data={normalizePortfolioData({
                    templateId: previewTemplateId,
                    title: `${portfolioTitle || "Demo"} Portfolio`,
                  })}
                  isPreview={true}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  setSelectedTemplateId(previewTemplateId);
                  setPreviewTemplateId(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Use {previewTemplateId} Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-600">
        PortfolioCraft SaaS &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
