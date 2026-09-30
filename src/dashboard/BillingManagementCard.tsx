"use client";

import React, { useState, useEffect } from "react";
import { UserSubscriptionRecord } from "@/types/billing";
import { PLAN_CONFIGS } from "@/config/plans";
import { getUserSubscriptionAction, cancelProSubscriptionAction } from "./billing-actions";
import { ProUpgradeModal } from "./ProUpgradeModal";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Check,
} from "lucide-react";

export function BillingManagementCard() {
  const [subscription, setSubscription] = useState<UserSubscriptionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSubscription = async () => {
    setIsLoading(true);
    const res = await getUserSubscriptionAction();
    setIsLoading(false);
    if (res.success && res.data) {
      setSubscription(res.data);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your Pro subscription? Your portfolio will remain active on the platform URL.")) {
      return;
    }

    setIsCancelling(true);
    setMsg(null);
    const res = await cancelProSubscriptionAction();
    setIsCancelling(false);

    if (res.success) {
      setMsg({ type: "success", text: "Subscription cancelled. Pro features will remain active until end of period." });
      fetchSubscription();
    } else {
      setMsg({ type: "error", text: res.error || "Failed to cancel subscription." });
    }
  };

  const isPro = subscription?.plan === "pro" && (subscription?.status === "active" || subscription?.status === "trialing");
  const planInfo = isPro ? PLAN_CONFIGS.pro : PLAN_CONFIGS.free;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Subscription & Billing
          </h3>
          <p className="text-xs text-slate-500">
            Manage your PortfolioCraft subscription plan, billing details, and entitlement features.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              isPro
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            {isPro ? <Zap className="w-3.5 h-3.5 text-amber-500" /> : <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />}
            {planInfo.name}
          </span>
        </div>
      </div>

      {/* FEEDBACK MESSAGES */}
      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {msg.type === "success" ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* SUBSCRIPTION DETAILS */}
      {isLoading ? (
        <div className="py-8 flex items-center justify-center text-slate-400 gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading subscription details...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CURRENT PLAN HIGHLIGHT */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Tier</span>
                <span className="text-xs font-bold text-slate-900">${planInfo.priceMonthly}/mo</span>
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">{planInfo.name}</h4>
              <p className="text-xs text-slate-600">{planInfo.description}</p>
            </div>

            {subscription?.currentPeriodEnd && (
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {subscription.cancelAtPeriodEnd ? "Expires on: " : "Renews on: "}
                  <strong className="text-slate-700">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* FEATURES CHECKLIST */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Plan Features & Entitlements:</span>
            <div className="space-y-2">
              {planInfo.featureList.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIONS FOOTER */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={fetchSubscription}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>

        <div className="flex items-center gap-3">
          {isPro ? (
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelling || subscription?.cancelAtPeriodEnd}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-50"
            >
              {subscription?.cancelAtPeriodEnd ? "Cancelled (Pending Expiry)" : "Cancel Subscription"}
            </button>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300" /> Upgrade to Pro ($12/mo)
            </button>
          )}
        </div>
      </div>

      {/* UPGRADE MODAL */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          fetchSubscription();
          setMsg({ type: "success", text: "Successfully upgraded to Pro!" });
        }}
      />
    </div>
  );
}
