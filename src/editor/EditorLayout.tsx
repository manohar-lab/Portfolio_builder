"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useEditor } from "@/editor/EditorContext";
import { PortfolioRenderer } from "@/templates/PortfolioRenderer";
import {
  User,
  Layers,
  Code2,
  FolderGit2,
  GraduationCap,
  BookOpen,
  Briefcase,
  FlaskConical,
  Award,
  ShieldCheck,
  Globe,
  Palette,
  LayoutTemplate,
  Settings,
  Save,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit3,
} from "lucide-react";

// Panels
import { SectionsPanel } from "./panels/SectionsPanel";
import { ProfilePanel } from "./panels/ProfilePanel";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { SkillsPanel } from "./panels/SkillsPanel";
import { EducationPanel } from "./panels/EducationPanel";
import { AcademicJourneyPanel } from "./panels/AcademicJourneyPanel";
import { ExperiencePanel } from "./panels/ExperiencePanel";
import { ResearchPanel } from "./panels/ResearchPanel";
import { AchievementsPanel } from "./panels/AchievementsPanel";
import { CertificationsPanel } from "./panels/CertificationsPanel";
import { SocialsPanel } from "./panels/SocialsPanel";
import { AppearancePanel } from "./panels/AppearancePanel";
import { TemplatePanel } from "./panels/TemplatePanel";
import { SettingsPanel } from "./panels/SettingsPanel";

import { calculatePortfolioReadiness } from "@/utilities/portfolio-readiness";

const NAV_GROUPS = [
  {
    category: "CONTENT",
    items: [
      { id: "sections", label: "Sections Order", icon: Layers },
      { id: "profile", label: "Profile", icon: User },
      { id: "projects", label: "Projects", icon: FolderGit2 },
      { id: "skills", label: "Skills", icon: Code2 },
      { id: "education", label: "Education", icon: GraduationCap },
      { id: "academic_journey", label: "Academic Journey", icon: BookOpen },
      { id: "experience", label: "Experience", icon: Briefcase },
      { id: "research", label: "Research", icon: FlaskConical },
      { id: "achievements", label: "Achievements", icon: Award },
      { id: "certifications", label: "Certifications", icon: ShieldCheck },
      { id: "socials", label: "Social Links", icon: Globe },
    ],
  },
  {
    category: "DESIGN",
    items: [
      { id: "appearance", label: "Appearance", icon: Palette },
      { id: "template", label: "Template", icon: LayoutTemplate },
    ],
  },
  {
    category: "PUBLISH",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export const EditorLayout: React.FC = () => {
  const {
    portfolio,
    isDirty,
    saveStatus,
    lastSaved,
    activePanel,
    setActivePanel,
    saveDraft,
    publishPortfolio,
  } = useEditor();

  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishWarning, setPublishWarning] = useState<string | null>(null);

  // Unsaved changes confirmation warning when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handlePublishClick = () => {
    // Validate required public profile fields
    if (!portfolio.profile.fullName || portfolio.profile.fullName.trim() === "") {
      setPublishWarning("Profile name is missing. It is recommended to fill your full name before publishing.");
    } else {
      setPublishWarning(null);
    }
    setShowPublishModal(true);
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case "sections":
        return <SectionsPanel />;
      case "profile":
        return <ProfilePanel />;
      case "projects":
        return <ProjectsPanel />;
      case "skills":
        return <SkillsPanel />;
      case "education":
        return <EducationPanel />;
      case "academic_journey":
        return <AcademicJourneyPanel />;
      case "experience":
        return <ExperiencePanel />;
      case "research":
        return <ResearchPanel />;
      case "achievements":
        return <AchievementsPanel />;
      case "certifications":
        return <CertificationsPanel />;
      case "socials":
        return <SocialsPanel />;
      case "appearance":
        return <AppearancePanel />;
      case "template":
        return <TemplatePanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <SectionsPanel />;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-100 text-gray-900">
      {/* Top Header Navigation */}
      <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="h-4 w-px bg-gray-200" />
          <h1 className="font-bold text-gray-900 text-sm truncate max-w-[200px] sm:max-w-xs">
            {portfolio.title}
          </h1>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 uppercase">
            {portfolio.status}
          </span>

          {/* Portfolio Readiness Badge */}
          {(() => {
            const readiness = calculatePortfolioReadiness(portfolio);
            return (
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold"
                title={`Portfolio Readiness: ${readiness.score}%\nCompleted: ${readiness.completedCount}/${readiness.totalCount} requirements`}
              >
                <span>Readiness:</span>
                <span className="font-bold">{readiness.score}%</span>
                <div className="w-12 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${readiness.score}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-3">
          {/* Save Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-indigo-600 font-medium animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && !isDirty && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved ({lastSaved})
              </span>
            )}
            {isDirty && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Unsaved changes
              </span>
            )}
          </div>

          {/* Save Draft Button */}
          <button
            onClick={() => saveDraft()}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5 text-gray-500" /> Save Draft
          </button>

          {/* Publish Button */}
          <button
            onClick={handlePublishClick}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm ${
              portfolio.isPublished
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {portfolio.isPublished ? "Published" : "Publish"}
          </button>
        </div>
      </header>

      {/* Mobile Tab Toggle */}
      <div className="flex border-b border-gray-200 bg-white md:hidden">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === "edit"
              ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Edit3 className="h-4 w-4" /> EDIT CONTENT
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === "preview"
              ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Eye className="h-4 w-4" /> LIVE PREVIEW
        </button>
      </div>

      {/* Main Split Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Navigation Sidebar + Panel Controls */}
        <div
          className={`flex flex-1 md:flex-none md:w-[540px] lg:w-[600px] border-r border-gray-200 bg-white overflow-hidden ${
            mobileTab === "preview" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Vertical Icon Navigation */}
          <nav className="flex w-16 shrink-0 flex-col items-center border-r border-gray-100 bg-gray-50 py-3 gap-3 overflow-y-auto">
            {NAV_GROUPS.map((group, groupIdx) => (
              <div key={group.category} className="w-full flex flex-col items-center gap-1">
                {groupIdx > 0 && <span className="w-8 h-px bg-gray-200 my-1" />}
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  {group.category}
                </span>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePanel === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      title={item.label}
                      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="absolute left-14 z-30 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-md group-hover:block whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Active Control Panel Form */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white">
            {renderActivePanel()}
          </main>
        </div>

        {/* Right Side: Split Screen Real-Time Live Preview */}
        <div
          className={`flex-1 bg-gray-900 overflow-hidden relative ${
            mobileTab === "edit" ? "hidden md:flex md:flex-col" : "flex flex-col"
          }`}
        >
          {/* Preview Header Bar */}
          <div className="flex h-10 w-full items-center justify-between border-b border-gray-800 bg-gray-950 px-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-gray-200">Live Preview</span>
              <span className="text-[11px] text-gray-500">
                ({portfolio.templateId} template)
              </span>
            </div>
            <div className="text-[11px] text-gray-500">Owner Preview Mode</div>
          </div>

          {/* Template Renderer Preview Window */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-gray-900">
            <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden min-h-[600px]">
              <PortfolioRenderer data={portfolio} isPreview={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">
              {portfolio.isPublished ? "Unpublish Portfolio?" : "Publish Portfolio?"}
            </h3>

            {publishWarning && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p>{publishWarning}</p>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-600 leading-relaxed">
              {portfolio.isPublished
                ? "Unpublishing will remove your portfolio from public access. You can publish it again anytime."
                : "Publishing makes your latest portfolio changes visible on your assigned public web link."}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await publishPortfolio(!portfolio.isPublished);
                  setShowPublishModal(false);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${
                  portfolio.isPublished
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Confirm {portfolio.isPublished ? "Unpublish" : "Publish Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
