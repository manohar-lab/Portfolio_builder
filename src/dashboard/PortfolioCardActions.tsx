"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortfolioMeta } from "@/types/portfolio";
import { updatePortfolioStatusAction } from "@/dashboard/actions";
import { Edit3, ExternalLink, Copy, Check, Send } from "lucide-react";

export const PortfolioCardActions: React.FC<{ portfolio: PortfolioMeta }> = ({ portfolio }) => {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${portfolio.slug}`
    : `/u/${portfolio.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleTogglePublish = async () => {
    setIsUpdating(true);
    await updatePortfolioStatusAction(portfolio.id, !portfolio.isPublished);
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs font-semibold">
      <div className="flex items-center gap-2">
        {/* Open Full Editor */}
        <Link
          href={`/dashboard/portfolio/${portfolio.id}/editor`}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </Link>

        {/* Copy Link Button */}
        {portfolio.isPublished && (
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
            title="Copy Public URL"
          >
            {copied ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Link
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* View Link if Published */}
        {portfolio.isPublished ? (
          <a
            href={`/u/${portfolio.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live
          </a>
        ) : (
          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg transition-all flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" /> {isUpdating ? "Publishing..." : "Publish"}
          </button>
        )}
      </div>
    </div>
  );
};
