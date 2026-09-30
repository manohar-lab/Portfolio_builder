"use client";

import React, { useState } from "react";
import { PLAN_CONFIGS } from "@/config/plans";
import { createProCheckoutSessionAction, activateMockProSubscriptionAction } from "./billing-actions";
import {
  Sparkles,
  Zap,
  Check,
  X,
  Globe,
  Palette,
  ShieldCheck,
  Bot,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  reason?: string;
  onSuccess?: () => void;
}

export function ProUpgradeModal({
  isOpen,
  onClose,
  featureName = "Custom Domain Hosting",
  reason = "This feature requires a Pro Plan subscription.",
  onSuccess,
}: ProUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const proPlan = PLAN_CONFIGS.pro;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const returnUrl = window.location.href;
    const res = await createProCheckoutSessionAction(returnUrl);

    if (res.success && res.data?.url) {
      // Check if sandbox mock checkout returned
      if (res.data.url.includes("mock=true") && res.data.url.includes("session_id=")) {
        const urlObj = new URL(res.data.url);
        const mockSessionId = urlObj.searchParams.get("session_id") || "mock_session";

        const activateRes = await activateMockProSubscriptionAction(mockSessionId);
        setIsLoading(false);

        if (activateRes.success) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setErrorMsg(activateRes.error || "Failed to activate Pro subscription.");
        }
      } else {
        // Redirect to external payment provider checkout URL
        window.location.href = res.data.url;
      }
    } else {
      setIsLoading(false);
      setErrorMsg(res.error || "Failed to initiate checkout session.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-upgrade-title"
      >
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-3">
            <Zap className="w-3.5 h-3.5" /> PRO UPGRADE REQUIRED
          </div>

          <h2 id="pro-upgrade-title" className="text-xl font-bold">
            Unlock {featureName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{reason}</p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* PRICING DISPLAY */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-indigo-950">${proPlan.priceMonthly}</span>
              <span className="text-xs text-slate-600 font-medium"> / month</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Cancel anytime. No hidden fees.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg shadow-sm">
              Pro Tier
            </span>
          </div>

          {/* FEATURE CHECKLIST */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-900 block">Everything included in Pro:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {[
                { text: "Custom Domain (yourdomain.com)", icon: Globe },
                { text: "Premium Templates", icon: Sparkles },
                { text: "Advanced Design Tokens", icon: Palette },
                { text: "Unlimited AI Assistant", icon: Bot },
                { text: "Remove Platform Branding", icon: ShieldCheck },
                { text: "Priority Edge Hosting", icon: Zap },
              ].map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <IconComp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">{feat.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* UPGRADE BUTTON */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Preparing Secure Checkout...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" /> Upgrade to Pro - ${proPlan.priceMonthly}/mo
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
