"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ShowcaseSearchResult, ShowcaseQueryParams, ShowcasePortfolioCardData, ShowcaseSortOption } from "@/types/showcase";
import { ReportPortfolioModal } from "@/editor/ReportPortfolioModal";
import {
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Flag,
  Globe,
  Code2,
  RefreshCw,
  FolderKanban,
} from "lucide-react";

interface ExploreClientPageProps {
  initialData: ShowcaseSearchResult;
  initialParams: ShowcaseQueryParams;
}

export function ExploreClientPage({ initialData, initialParams }: ExploreClientPageProps) {
  const router = Router();
  const routerPathname = usePathname();
  const searchParams = useSearchParams();

  function Router() {
    return useRouter();
  }

  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(initialParams.query || "");
  const [selectedTemplate, setSelectedTemplate] = useState(initialParams.templateId || "all");
  const [selectedSort, setSelectedSort] = useState(initialParams.sortBy || "newest");

  // Report Modal State
  const [reportingPortfolio, setReportingPortfolio] = useState<{ id: string; title: string } | null>(null);

  const updateFilters = (newParams: Partial<ShowcaseQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    const merged = {
      query: searchQuery,
      templateId: selectedTemplate,
      sortBy: selectedSort,
      page: 1,
      ...newParams,
    };

    if (merged.query) params.set("query", merged.query);
    else params.delete("query");

    if (merged.templateId && merged.templateId !== "all") params.set("templateId", merged.templateId);
    else params.delete("templateId");

    if (merged.sortBy) params.set("sortBy", merged.sortBy);
    else params.delete("sortBy");

    if (merged.page && merged.page > 1) params.set("page", merged.page.toString());
    else params.delete("page");

    startTransition(() => {
      router.push(`${routerPathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchQuery, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTemplate("all");
    setSelectedSort("newest");
    startTransition(() => {
      router.push(routerPathname);
    });
  };

  const featuredPortfolios = initialData.portfolios.filter((p) => p.isFeatured);
  const standardPortfolios = initialData.portfolios.filter((p) => !p.isFeatured);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* HEADER NAV */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              P
            </div>
            <span>PortfolioCraft</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Showcase
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
            >
              Build Portfolio
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 bg-gradient-to-b from-indigo-950/30 via-slate-950 to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Public Portfolio Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Discover Great Work & Engineers
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Browse public portfolios created by developers, researchers, and creators. Discover projects, tech stacks, and career milestones.
          </p>

          {/* SEARCH & FILTER CONTROLS */}
          <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, headline, skills, or project..."
                className="w-full pl-12 pr-24 py-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl"
              />
              <button
                type="submit"
                disabled={isPending}
                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </button>
            </div>

            {/* SECONDARY FILTERS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Filter className="w-3.5 h-3.5" /> Template:
                </span>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    updateFilters({ templateId: e.target.value, page: 1 });
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Templates</option>
                  <option value="developer">Developer</option>
                  <option value="modern">Modern</option>
                  <option value="research">Academic / Research</option>
                  <option value="executive">Executive</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    const sortVal = e.target.value as ShowcaseSortOption;
                    setSelectedSort(sortVal);
                    updateFilters({ sortBy: sortVal, page: 1 });
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="newest">Newest</option>
                  <option value="recently_updated">Recently Updated</option>
                </select>

                {(searchQuery || selectedTemplate !== "all") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* MAIN CONTENT DIRECTORY AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* FEATURED PORTFOLIOS SECTION */}
        {featuredPortfolios.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">Featured Portfolios</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPortfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onReport={(id, title) => setReportingPortfolio({ id, title })}
                />
              ))}
            </div>
          </section>
        )}

        {/* ALL PUBLIC PORTFOLIOS GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" /> Public Portfolios
            </h2>
            <span className="text-xs text-slate-400">
              Showing {initialData.portfolios.length} of {initialData.total} discoverable portfolios
            </span>
          </div>

          {initialData.portfolios.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto">
              <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">
                  {searchQuery || selectedTemplate !== "all" ? "No portfolios found" : "No public portfolios yet"}
                </h3>
                <p className="text-xs text-slate-400">
                  {searchQuery || selectedTemplate !== "all"
                    ? "Try adjusting your search criteria or clearing active filters."
                    : "Be the first to publish and enable public discovery for your portfolio!"}
                </p>
              </div>
              {(searchQuery || selectedTemplate !== "all") && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
                >
                  Clear Search Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standardPortfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onReport={(id, title) => setReportingPortfolio({ id, title })}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {initialData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8">
              <button
                disabled={initialData.page <= 1 || isPending}
                onClick={() => updateFilters({ page: initialData.page - 1 })}
                className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-medium">
                Page {initialData.page} of {initialData.totalPages}
              </span>
              <button
                disabled={initialData.page >= initialData.totalPages || isPending}
                onClick={() => updateFilters({ page: initialData.page + 1 })}
                className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* REPORT MODAL */}
      {reportingPortfolio && (
        <ReportPortfolioModal
          portfolioId={reportingPortfolio.id}
          portfolioTitle={reportingPortfolio.title}
          isOpen={true}
          onClose={() => setReportingPortfolio(null)}
        />
      )}
    </div>
  );
}

{/* REUSABLE PORTFOLIO CARD COMPONENT */}
function PortfolioCard({
  portfolio,
  onReport,
}: {
  portfolio: ShowcasePortfolioCardData;
  onReport: (id: string, title: string) => void;
}) {
  const targetUrl = portfolio.customDomain ? `https://${portfolio.customDomain}` : `/u/${portfolio.slug}`;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition duration-200 group">
      <div className="space-y-4">
        {/* CARD TOP HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {portfolio.avatarUrl ? (
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center border border-indigo-400/30">
                {portfolio.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                {portfolio.fullName}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">{portfolio.headline}</p>
            </div>
          </div>

          {portfolio.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              Featured
            </span>
          )}
        </div>

        {/* LOCATION IF SPECIFIED */}
        {portfolio.location && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{portfolio.location}</span>
          </div>
        )}

        {/* SKILLS CHIPS */}
        {portfolio.topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {portfolio.topSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* FEATURED PROJECT PREVIEW */}
        {portfolio.featuredProjectTitle && (
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400">
              <Code2 className="w-3.5 h-3.5" /> Featured Project
            </div>
            <p className="text-xs font-semibold text-slate-200 line-clamp-1">{portfolio.featuredProjectTitle}</p>
          </div>
        )}
      </div>

      {/* CARD ACTIONS FOOTER */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <button
          onClick={() => onReport(portfolio.id, portfolio.fullName)}
          className="text-slate-500 hover:text-amber-400 transition flex items-center gap-1 text-[11px]"
          title="Report Portfolio"
        >
          <Flag className="w-3 h-3" /> Report
        </button>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <span>View Portfolio</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
