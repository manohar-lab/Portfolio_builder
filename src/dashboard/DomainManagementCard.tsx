"use me";
"use client";

import React, { useState, useEffect } from "react";
import {
  getCustomDomainAction,
  addCustomDomainAction,
  verifyCustomDomainAction,
  disconnectCustomDomainAction,
} from "@/dashboard/domain-actions";
import { DbCustomDomain } from "@/types/database";
import { DnsInstruction } from "@/utilities/domain-utils";
import { copyToClipboard } from "@/utilities/share-utils";
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  HelpCircle,
  ShieldCheck,
  Plus,
} from "lucide-react";

interface DomainManagementCardProps {
  portfolioId: string;
  slug: string;
}

export function DomainManagementCard({ portfolioId, slug }: DomainManagementCardProps) {
  const [domainRecord, setDomainRecord] = useState<DbCustomDomain | null>(null);
  const [instructions, setInstructions] = useState<DnsInstruction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form States
  const [domainInput, setDomainInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Verification & Disconnect States
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const platformUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${slug}`;

  useEffect(() => {
    loadDomainData();
  }, [portfolioId]);

  const loadDomainData = async () => {
    setIsLoading(true);
    setFormError(null);
    try {
      const res = await getCustomDomainAction(portfolioId);
      if (res.success && res.data) {
        setDomainRecord(res.data.domainRecord);
        setInstructions(res.data.instructions || null);
      }
    } catch {
      // Error fetching domain configuration
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (val: string) => {
    const success = await copyToClipboard(val);
    if (success) {
      setCopiedValue(val);
      setTimeout(() => setCopiedValue(null), 3000);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    setIsSubmitting(true);
    setFormError(null);
    setVerificationFeedback(null);

    try {
      const res = await addCustomDomainAction(portfolioId, domainInput);
      if (res.success && res.data) {
        setDomainRecord(res.data.domainRecord);
        setInstructions(res.data.instructions);
        setDomainInput("");
      } else {
        setFormError(res.error || "Failed to add domain.");
      }
    } catch {
      setFormError("An unexpected server error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainRecord) return;
    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      const res = await verifyCustomDomainAction(domainRecord.id, portfolioId);
      if (res.success && res.data) {
        setDomainRecord(res.data.domainRecord);
        setVerificationFeedback({
          success: true,
          message: "Domain verified and activated successfully!",
        });
      } else {
        setVerificationFeedback({
          success: false,
          message: res.error || "Verification DNS TXT record was not found yet. DNS changes may take some time to propagate.",
        });
        if (res.data?.domainRecord) {
          setDomainRecord(res.data.domainRecord);
        }
      }
    } catch {
      setVerificationFeedback({
        success: false,
        message: "An unexpected error occurred during verification.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnectDomain = async () => {
    if (!domainRecord) return;
    setIsDisconnecting(true);
    try {
      const res = await disconnectCustomDomainAction(domainRecord.id, portfolioId);
      if (res.success) {
        setDomainRecord(null);
        setInstructions(null);
        setShowDisconnectConfirm(false);
      }
    } catch {
      // Disconnect error
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
        Loading domain settings...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Domain Configuration</h3>
            <p className="text-xs text-slate-400">Connect a custom domain or use your free platform URL.</p>
          </div>
        </div>
      </div>

      {/* 1. Free Platform URL Card */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Free Platform URL</span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Always Available
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 pl-3">
          <span className="text-xs text-indigo-300 font-mono truncate">{platformUrl}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(platformUrl)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-md text-xs transition-colors"
              title="Copy Platform URL"
            >
              {copiedValue === platformUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-md text-xs transition-colors"
              title="Visit Platform URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Custom Domain Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">Custom Domain</h4>
          {domainRecord && (
            <div>
              {domainRecord.status === "active" || domainRecord.status === "verified" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ● Active
                </span>
              ) : domainRecord.status === "failed" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  ✕ Verification Failed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ○ Pending Verification
                </span>
              )}
            </div>
          )}
        </div>

        {/* State A: No domain connected */}
        {!domainRecord && (
          <form onSubmit={handleAddDomain} className="space-y-3 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">
              Connect your own domain (e.g. <span className="font-mono text-slate-300">example.com</span> or <span className="font-mono text-slate-300">portfolio.example.com</span>).
            </p>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="example.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={isSubmitting || !domainInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Custom Domain
                  </>
                )}
              </button>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
              <span>
                Don&apos;t have a domain? Your free platform URL will always remain active.
              </span>
            </div>
          </form>
        )}

        {/* State B & C: Domain connected */}
        {domainRecord && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">Configured Domain</span>
                <span className="text-sm font-bold text-indigo-300 font-mono">{domainRecord.domain}</span>
              </div>
              <div className="flex items-center gap-2">
                {(domainRecord.status === "active" || domainRecord.status === "verified") && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopy(`https://${domainRecord.domain}`)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      {copiedValue === `https://${domainRecord.domain}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Link
                    </button>
                    <a
                      href={`https://${domainRecord.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                  title="Disconnect Domain"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DNS Instructions if Pending / Failed */}
            {domainRecord.status !== "active" && domainRecord.status !== "verified" && instructions && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> DNS Verification Instructions
                  </h5>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Add the following TXT record at your domain registrar (Namecheap, GoDaddy, Cloudflare, Route53, etc.) to verify ownership:
                </p>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Record Type:</span>
                    <span className="text-slate-200 font-bold">{instructions.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Host / Name:</span>
                    <span className="text-indigo-300 font-bold">{instructions.host}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 shrink-0">TXT Value:</span>
                    <span className="text-amber-300 font-bold truncate max-w-xs">{instructions.value}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(instructions.value)}
                      className="p-1 text-slate-400 hover:text-slate-200 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {verificationFeedback && (
                  <div
                    className={`p-2.5 rounded-lg border flex items-center gap-2 text-[11px] ${
                      verificationFeedback.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    }`}
                  >
                    {verificationFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{verificationFeedback.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 italic">
                    DNS changes may take some time to become visible.
                  </span>
                  <button
                    type="button"
                    onClick={handleVerifyDomain}
                    disabled={isVerifying}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {isVerifying ? "Verifying..." : "Verify Domain"}
                  </button>
                </div>
              </div>
            )}

            {/* Disconnect Confirmation Modal */}
            {showDisconnectConfirm && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2 text-xs text-red-200">
                <p className="font-semibold">Remove custom domain &apos;{domainRecord.domain}&apos;?</p>
                <p className="text-[11px] text-red-300/80">
                  Your portfolio will continue to be accessible using your free platform URL.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDisconnectDomain}
                    disabled={isDisconnecting}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium text-xs"
                  >
                    {isDisconnecting ? "Disconnecting..." : "Confirm Disconnect"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
