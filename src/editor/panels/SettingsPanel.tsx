"use client";

import React, { useState } from "react";
import { useEditor } from "../EditorContext";
import { checkSlugAvailabilityAction } from "@/dashboard/actions";
import { Settings, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const SettingsPanel: React.FC = () => {
  const { portfolio, updatePortfolio, publishPortfolio } = useEditor();
  const [slugError, setSlugError] = useState<string | null>(null);

  const handleSlugBlur = async () => {
    setSlugError(null);
    const res = await checkSlugAvailabilityAction(portfolio.slug, portfolio.id);
    if (!res.available) {
      setSlugError(res.reason || "Slug is unavailable.");
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" /> Portfolio Settings & Publication
        </h2>
        <p className="text-xs text-gray-500">
          Configure portfolio title, unique URL slug, and published visibility.
        </p>
      </div>

      <div className="space-y-4">
        
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Portfolio Title *</label>
          <input
            type="text"
            required
            value={portfolio.title}
            onChange={(e) => updatePortfolio((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Unique Public URL Slug *</label>
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl">
            <span className="text-xs text-gray-500 font-mono select-none">/u/</span>
            <input
              type="text"
              required
              value={portfolio.slug}
              onBlur={handleSlugBlur}
              onChange={(e) => updatePortfolio((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
              className="w-full bg-transparent text-sm text-gray-900 font-mono focus:outline-none"
            />
          </div>
          {slugError && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {slugError}
            </p>
          )}
        </div>

        {/* PUBLICATION & VISIBILITY CONTROL BOX */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Publication Status</h3>
              <p className="text-xs text-gray-600">
                {portfolio.isPublished ? "Portfolio is live and viewable." : "Portfolio is in Draft mode and private."}
              </p>
            </div>

            {portfolio.isPublished ? (
              <span className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Published
              </span>
            ) : (
              <span className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Draft Mode
              </span>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => publishPortfolio(!portfolio.isPublished)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                portfolio.isPublished
                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {portfolio.isPublished ? "Set Portfolio to Draft" : "Publish Portfolio Live"}
            </button>
          </div>

          {/* DISCOVERY VISIBILITY MODEL */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Portfolio Visibility Settings
            </h4>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="radio"
                  name="visibilityMode"
                  value="private"
                  checked={(portfolio.visibilityMode || "unlisted") === "private"}
                  onChange={() => updatePortfolio((prev) => ({ ...prev, visibilityMode: "private", isPublic: false }))}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-900 block">Private</span>
                  <p className="text-[11px] text-gray-500">
                    Portfolio is not publicly accessible via link or discovery showcase.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="radio"
                  name="visibilityMode"
                  value="unlisted"
                  checked={(portfolio.visibilityMode || "unlisted") === "unlisted"}
                  onChange={() => updatePortfolio((prev) => ({ ...prev, visibilityMode: "unlisted", isPublic: true }))}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-900 block">Unlisted</span>
                  <p className="text-[11px] text-gray-500">
                    Accessible to anyone with the direct URL, but hidden from the public showcase directory.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="radio"
                  name="visibilityMode"
                  value="public"
                  checked={(portfolio.visibilityMode || "unlisted") === "public"}
                  onChange={() => updatePortfolio((prev) => ({ ...prev, visibilityMode: "public", isPublic: true }))}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-900 block">Public (Discoverable)</span>
                  <p className="text-[11px] text-gray-500">
                    Published and discoverable on the platform&apos;s public showcase (/explore) and sitemap.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

