"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Code2,
  FlaskConical,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Github,
  Check,
  X,
  Eye,
  Edit3,
  Globe,
  UserCheck,
  FileText,
  Palette,
  Monitor,
  Smartphone,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import {
  getOnboardingStatusAction,
  saveOnboardingStepAction,
  resetOnboardingAction,
  completeOnboardingAction,
  checkSlugAvailabilityAction,
  getGitHubStatusAction,
} from "@/dashboard/actions";

import { AVAILABLE_TEMPLATES } from "@/config/templates";
import { TemplateMetadata } from "@/types/template";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { SectionType, GitHubConnectionStatus } from "@/types/portfolio";
import { SAMPLE_PORTFOLIO_DATA } from "@/templates/sample-portfolio-data";
import { THEME_PRESETS } from "@/config/customization-presets";

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
    recommendedTemplate: "student",
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

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetMode = searchParams.get("reset") === "true";

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(false);

  // Form State
  const [profileType, setProfileType] = useState<string>("developer");
  const [startMethod, setStartMethod] = useState<"scratch" | "resume" | "github" | "import">("scratch");
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
  const [primaryColor, setPrimaryColor] = useState<string>("indigo");
  const [fontFamily, setFontFamily] = useState<string>("inter");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Resume Upload / Parse State
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [parsedItemsCount, setParsedItemsCount] = useState<{ projects: number; skills: number; experience: number }>({
    projects: 0,
    skills: 0,
    experience: 0,
  });

  // AI Assistance State
  const [isAiApplied, setIsAiApplied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Slug Checking State
  const [, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  // GitHub Connection
  const [githubStatus, setGithubStatus] = useState<GitHubConnectionStatus>({ isConnected: false });

  // Templates list from registry
  const [availableTemplates, setAvailableTemplates] = useState<TemplateMetadata[]>([]);

  // Preview Modal State
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Created Result State
  const [, setCreatedPortfolioId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Load existing onboarding status on initial mount
  useEffect(() => {
    async function init() {
      try {
        setAvailableTemplates(AVAILABLE_TEMPLATES.filter((t) => t.status === "ACTIVE" && t.isAvailable));

        const [status, ghStatus] = await Promise.all([
          getOnboardingStatusAction(),
          getGitHubStatusAction(),
        ]);

        setGithubStatus(ghStatus);

        // EXISTING USER BYPASS LOGIC:
        // If user already has portfolios and is NOT in explicit reset mode, bypass onboarding to /dashboard
        if (status.hasPortfolios && status.onboardingCompleted && !isResetMode) {
          router.replace("/dashboard");
          return;
        }

        // RESUME ONBOARDING PROMPT:
        // If user left midway at step > 1 and has no completed portfolio, offer Resume / Start Over prompt
        if (status.onboardingStep > 1 && !status.onboardingCompleted && !isResetMode) {
          setShowResumePrompt(true);
        }

        if (status.onboardingStep >= 1 && status.onboardingStep <= 7) {
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
  }, [router, isResetMode]);

  // Update sections when profile type changes
  const handleSelectProfileType = (typeId: string) => {
    setProfileType(typeId);
    const matched = PROFILE_TYPES.find((p) => p.id === typeId);
    if (matched) {
      setSelectedTemplateId(matched.recommendedTemplate);
      setSelectedSections(matched.defaultSections as SectionType[]);
    }
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

  // Step Navigation with server persistence
  const goToNextStep = async () => {
    const nextStep = Math.min(step + 1, 7);
    setStep(nextStep);
    await saveOnboardingStepAction(nextStep, profileType);
  };

  const goToPrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStartOver = async () => {
    setShowResumePrompt(false);
    setStep(1);
    await resetOnboardingAction();
  };

  // Simulated Resume Upload / Parse Handler
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    setIsParsingResume(true);

    setTimeout(() => {
      setIsParsingResume(false);
      setParsedItemsCount({ projects: 3, skills: 8, experience: 2 });
    }, 1200);
  };

  // Simulated AI Assistance Handler
  const handleApplyAiHelp = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setIsAiApplied(true);
    }, 1000);
  };

  // Final Completion Action (Publish Portfolio)
  const handlePublishPortfolio = async () => {
    const titleToUse = portfolioTitle.trim() || "My Portfolio";
    const slugToUse = (slug || "user-portfolio").trim().toLowerCase();

    setSubmitting(true);
    try {
      const res = await completeOnboardingAction({
        title: titleToUse,
        slug: slugToUse,
        templateId: selectedTemplateId,
        profileType: profileType,
        selectedSections: selectedSections,
        isPublished: true,
      });

      if (res.success && res.portfolioId && res.slug) {
        setCreatedPortfolioId(res.portfolioId);
        setCreatedSlug(res.slug);
        setStep(7);
      } else {
        alert(res.error || "Failed to publish portfolio. Please try again.");
      }
    } catch (err) {
      console.error("Error creating portfolio in onboarding:", err);
      alert("An error occurred while publishing your portfolio.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-slate-300">Loading onboarding wizard...</span>
        </div>
      </div>
    );
  }

  // Construct draft preview portfolio data for live preview engine
  const previewPortfolioData = {
    ...normalizePortfolioData({
      ...SAMPLE_PORTFOLIO_DATA,
      title: portfolioTitle || "Alex Morgan Portfolio",
      slug: slug || "alex-morgan",
      templateId: selectedTemplateId,
      profile: {
        ...SAMPLE_PORTFOLIO_DATA.profile,
        fullName: portfolioTitle ? portfolioTitle.replace(" Portfolio", "") : "Alex Morgan",
      },
    }),
    theme_data: {
      ...THEME_PRESETS.minimal,
      colors: {
        ...THEME_PRESETS.minimal.colors,
        primary: primaryColor === "indigo" ? "#4f46e5" : primaryColor === "emerald" ? "#10b981" : "#2563eb",
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* RESUME ONBOARDING PROMPT MODAL */}
      {showResumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-slate-100 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Resume Portfolio Setup?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have an incomplete portfolio setup in progress at <strong>Step {step} of 6</strong>.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartOver}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Start Over
              </button>
              <button
                type="button"
                onClick={() => setShowResumePrompt(false)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
              >
                Continue Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              P
            </div>
            <span>PortfolioCraft</span>
          </Link>
          <span className="h-4 w-px bg-slate-800" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Creation Wizard
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400">
            {["Profile", "Content", "Design", "Customize", "Preview", "Publish"].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = step === stepNum;
              const isPast = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isPast ? "✓" : stepNum}
                  </span>
                  <span className={isActive ? "text-white font-bold" : "text-slate-500"}>
                    {label}
                  </span>
                  {idx < 5 && <span className="text-slate-800">→</span>}
                </div>
              );
            })}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Step {step}/6</span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        
        {/* STEP 1: PROFILE TYPE */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Step 1 of 6
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">What best describes you?</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                This helps us suggest relevant templates and section choices. You can customize everything later.
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

            <div className="flex justify-between items-center pt-4 border-t border-slate-900">
              <button
                onClick={goToNextStep}
                className="text-xs text-slate-500 hover:text-slate-300 underline font-medium"
              >
                Skip Profile Selection
              </button>

              <button
                onClick={goToNextStep}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: START METHOD & CONTENT IMPORT */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 2 of 6</span>
              <h2 className="text-3xl font-extrabold text-white">How would you like to start?</h2>
              <p className="text-xs text-slate-400">
                Import existing information or build your portfolio from scratch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setStartMethod("resume")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  startMethod === "resume"
                    ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Import Resume</h3>
                <p className="text-xs text-slate-400">Upload PDF/DOCX to parse experience, education, and skills.</p>
              </div>

              <div
                onClick={() => setStartMethod("github")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  startMethod === "github"
                    ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Github className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Connect GitHub</h3>
                <p className="text-xs text-slate-400">Fetch repositories, tech stack tags, stars, and descriptions.</p>
              </div>

              <div
                onClick={() => setStartMethod("scratch")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  startMethod === "scratch"
                    ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Start from Scratch</h3>
                <p className="text-xs text-slate-400">Enter your basic name, headline, and bio manually.</p>
              </div>
            </div>

            {/* DYNAMIC METHOD PATH CONFIGURATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              {startMethod === "resume" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" /> Resume Upload & Parser
                  </h4>
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center space-y-3 transition">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-file-input"
                    />
                    <label htmlFor="resume-file-input" className="cursor-pointer space-y-2 block">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 mx-auto flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-300 font-semibold">
                        {resumeFileName ? `Selected: ${resumeFileName}` : "Click to select or drop Resume file"}
                      </p>
                      <p className="text-[10px] text-slate-500">Supports PDF, DOCX (Max 10MB)</p>
                    </label>
                  </div>

                  {isParsingResume && (
                    <div className="p-3 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Parsing resume sections and extracting structure...</span>
                    </div>
                  )}

                  {parsedItemsCount.projects > 0 && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>
                        Extracted {parsedItemsCount.projects} projects, {parsedItemsCount.skills} skills, and {parsedItemsCount.experience} experience entries!
                      </span>
                    </div>
                  )}
                </div>
              )}

              {startMethod === "github" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Github className="w-4 h-4 text-emerald-400" /> GitHub Repository Import
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">
                        {githubStatus.isConnected ? `Connected: @${githubStatus.username}` : "Connect your GitHub account"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {githubStatus.isConnected ? "Ready to import public repositories." : "Authorize access to view top repos."}
                      </p>
                    </div>

                    {!githubStatus.isConnected ? (
                      <a
                        href="/api/auth/github"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                      >
                        <Github className="w-4 h-4" /> Connect GitHub
                      </a>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
                        ✓ Account Synced
                      </span>
                    )}
                  </div>
                </div>
              )}

              {startMethod === "scratch" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-400" /> Basic Profile Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        value={portfolioTitle ? portfolioTitle.replace(" Portfolio", "") : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPortfolioTitle(`${val} Portfolio`);
                          if (!slug) {
                            setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]/g, "-"));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Public Slug / Username</label>
                      <input
                        type="text"
                        placeholder="e.g. alex-morgan"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
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

        {/* STEP 3: CONTENT SUMMARY & REVIEW */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 3 of 6</span>
              <h2 className="text-3xl font-extrabold text-white">Review your content setup</h2>
              <p className="text-xs text-slate-400">
                Summary of sections prepared for your portfolio draft. Missing items can be added later.
              </p>
            </div>

            {/* Checklist Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Portfolio Content Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Profile Info</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Ready
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Projects</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {parsedItemsCount.projects || 2} Items
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Skills & Stack</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {parsedItemsCount.skills || 6} Items
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Experience & Education</span>
                  <span className="text-amber-400 font-medium text-[11px]">Can add in editor</span>
                </div>
              </div>

              {/* AI Assistance Option */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Want AI to polish your summary & descriptions?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    AI suggests improvements. You review and approve before anything is saved.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyAiHelp}
                  disabled={isAiLoading || isAiApplied}
                  className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold rounded-xl transition shrink-0 flex items-center gap-1.5"
                >
                  {isAiLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isAiApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> AI Polished
                    </>
                  ) : (
                    "Use AI Assistant"
                  )}
                </button>
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
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TEMPLATE DESIGN SELECTION */}
        {step === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 4 of 6</span>
              <h2 className="text-3xl font-extrabold text-white">Choose a template design</h2>
              <p className="text-xs text-slate-400">
                Templates control visual rendering. Switch designs anytime later without losing portfolio data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`rounded-3xl border p-5 space-y-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{tpl.name}</h3>
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                            {tpl.category} • v{tpl.version}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-md">
                            Selected
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <button
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select Template"}
                      </button>

                      <button
                        onClick={() => setPreviewTemplateId(tpl.id)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center justify-center"
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

        {/* STEP 5: INITIAL APPEARANCE CUSTOMIZATION */}
        {step === 5 && (
          <div className="space-y-8 animate-fadeIn max-w-lg mx-auto w-full">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 5 of 6</span>
              <h2 className="text-3xl font-extrabold text-white">Customize initial appearance</h2>
              <p className="text-xs text-slate-400">
                Choose primary accent color and typography font. Fine-tune advanced styling in the dashboard editor.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              {/* PRIMARY COLOR SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" /> Primary Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: "indigo", bg: "bg-indigo-600", label: "Indigo" },
                    { id: "emerald", bg: "bg-emerald-600", label: "Emerald" },
                    { id: "sapphire", bg: "bg-blue-600", label: "Sapphire" },
                    { id: "violet", bg: "bg-purple-600", label: "Violet" },
                    { id: "rose", bg: "bg-rose-600", label: "Rose" },
                    { id: "amber", bg: "bg-amber-600", label: "Amber" },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setPrimaryColor(col.id)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition ${
                        primaryColor === col.id
                          ? "border-white ring-2 ring-indigo-500/50 bg-slate-950"
                          : "border-slate-800 bg-slate-950/60"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${col.bg}`} />
                      <span className="text-[10px] text-slate-300 font-medium">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONT FAMILY SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Typography Font</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="inter">Inter (Clean Modern Sans)</option>
                  <option value="outfit">Outfit (Geometric Tech)</option>
                  <option value="roboto">Roboto (Versatile Standard)</option>
                  <option value="playfair">Playfair Display (Elegant Serif)</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500 italic text-center">
                * You can modify fonts, spacing, layout order, and colors anytime later.
              </p>
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

        {/* STEP 6: LIVE PREVIEW & PRE-PUBLISH CHECKLIST */}
        {step === 6 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 6 of 6</span>
              <h2 className="text-3xl font-extrabold text-white">Preview & Publish</h2>
              <p className="text-xs text-slate-400">
                Review your live portfolio rendering before publishing to your public link.
              </p>
            </div>

            {/* PREVIEW CONTAINER WITH DEVICE TOGGLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" /> Live Render Preview
                </span>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      previewDevice === "desktop" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      previewDevice === "mobile" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              </div>

              {/* RENDER BODY */}
              <div className="p-4 flex justify-center bg-slate-950/60 max-h-[500px] overflow-y-auto">
                <div
                  className={`w-full transition-all duration-300 ${
                    previewDevice === "mobile" ? "max-w-[375px] border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl" : "max-w-full"
                  }`}
                >
                  <PortfolioRenderer data={previewPortfolioData} isPreview={true} mode="public" />
                </div>
              </div>
            </div>

            {/* PRE-PUBLISH CHECKLIST */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pre-Publish Checklist
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                <li className="flex items-center gap-1.5">✓ Title: {portfolioTitle || "Alex Morgan"}</li>
                <li className="flex items-center gap-1.5 font-mono">✓ Link: /u/{slug || "alex-morgan"}</li>
                <li className="flex items-center gap-1.5 capitalize">✓ Template: {selectedTemplateId}</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handlePublishPortfolio}
                disabled={submitting}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Publishing Portfolio...
                  </>
                ) : (
                  <>
                    Publish Portfolio <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: SUCCESS SCREEN & SHARING */}
        {step === 7 && (
          <div className="space-y-8 animate-fadeIn text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🎉 Portfolio Published
              </span>
              <h2 className="text-4xl font-extrabold text-white">Your portfolio is live!</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your portfolio is now accessible globally. Share your personal URL with employers and peers.
              </p>
            </div>

            {/* Assigned URL Display Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Your Public Portfolio Link</span>
              <div className="flex items-center justify-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-sm font-mono text-indigo-400 font-bold select-all">
                  /u/{createdSlug || slug}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/u/${createdSlug || slug}`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition"
                  title="Copy public URL"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SUCCESS ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
              <Link
                href={`/u/${createdSlug || slug}`}
                target="_blank"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <ExternalLink className="w-4 h-4" /> Open Portfolio
              </Link>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                Go to Dashboard
              </button>
            </div>

            {/* CUSTOM DOMAIN TEASER */}
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Globe className="w-4 h-4 text-indigo-400" /> Want a custom domain like <strong>yourname.com</strong>?
              </span>
              <button
                type="button"
                onClick={() => router.push("/dashboard/account")}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline"
              >
                Set Up Domain
              </button>
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

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
              <PortfolioRenderer
                data={{
                  ...previewPortfolioData,
                  templateId: previewTemplateId,
                }}
                isPreview={true}
                mode="public"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
