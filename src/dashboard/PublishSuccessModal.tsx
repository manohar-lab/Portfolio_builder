"use client";

import React from "react";
import { SharePanel } from "@/dashboard/SharePanel";
import { CheckCircle2, X, ExternalLink, Sparkles } from "lucide-react";

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  slug: string;
  displayName: string;
  headline?: string;
  bio?: string;
}

export function PublishSuccessModal({
  isOpen,
  onClose,
  portfolioId,
  slug,
  displayName,
  headline,
  bio,
}: PublishSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Your portfolio is live! <Sparkles className="w-4 h-4 text-indigo-400" />
              </h2>
              <p className="text-xs text-indigo-200/80">
                Your changes have been published to your public link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <SharePanel
            portfolioId={portfolioId}
            slug={slug}
            isPublished={true}
            displayName={displayName}
            headline={headline}
            bio={bio}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Continue Editing
          </button>
          <a
            href={`/u/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            View Live Portfolio <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
