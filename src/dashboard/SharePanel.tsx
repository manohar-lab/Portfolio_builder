"use client";

import React, { useState, useEffect } from "react";
import {
  getCanonicalPublicUrl,
  generateSocialShareLinks,
  copyToClipboard,
  triggerNativeWebShare,
} from "@/utilities/share-utils";
import { generateQrPngDataUrl, downloadQrCode } from "@/utilities/qr-utils";
import { checkSlugAvailabilityAction, updatePortfolioSlugAction } from "@/dashboard/actions";
import {
  Copy,
  Check,
  Share2,
  Globe,
  QrCode,
  Download,
  AlertTriangle,
  ExternalLink,
  Linkedin,
  MessageCircle,
  Twitter,
  Mail,
  ShieldCheck,
  Eye,
  RefreshCw,
} from "lucide-react";

interface SharePanelProps {
  portfolioId: string;
  slug: string;
  isPublished: boolean;
  displayName: string;
  headline?: string;
  bio?: string;
  onSlugUpdated?: (newSlug: string) => void;
}

export function SharePanel({
  portfolioId,
  slug,
  isPublished,
  displayName,
  headline,
  bio,
  onSlugUpdated,
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState<number>(300);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Slug Edit States
  const [editingSlug, setEditingSlug] = useState(slug);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"available" | "unavailable" | "invalid" | null>(null);
  const [isSavingSlug, setIsSavingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const publicUrl = getCanonicalPublicUrl(slug);
  const shareTitle = `${displayName} | ${headline || "Portfolio"}`;
  const shareDesc = bio || `Portfolio of ${displayName} — projects, skills, research, and experience.`;
  const socialLinks = generateSocialShareLinks(publicUrl, shareTitle, shareDesc);

  // Generate QR Code on URL or size change
  useEffect(() => {
    let isMounted = true;
    async function loadQr() {
      if (!isPublished) return;
      setIsGeneratingQr(true);
      try {
        const dataUrl = await generateQrPngDataUrl(publicUrl, { width: qrSize });
        if (isMounted) setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("QR Code loading error:", err);
      } finally {
        if (isMounted) setIsGeneratingQr(false);
      }
    }
    loadQr();
    return () => {
      isMounted = false;
    };
  }, [publicUrl, qrSize, isPublished]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(publicUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    const shared = await triggerNativeWebShare({
      title: shareTitle,
      text: shareDesc,
      url: publicUrl,
    });
    if (!shared) {
      handleCopyLink();
    }
  };

  // Check Slug Availability
  const handleSlugInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    setEditingSlug(newSlug);
    setSlugError(null);

    if (newSlug === slug) {
      setSlugStatus(null);
      return;
    }

    if (newSlug.length < 3) {
      setSlugStatus("invalid");
      return;
    }

    setIsCheckingSlug(true);
    try {
      const res = await checkSlugAvailabilityAction(newSlug);
      if (res.available) {
        setSlugStatus("available");
      } else {
        setSlugStatus("unavailable");
      }
    } catch {
      setSlugStatus("invalid");
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSaveSlug = async () => {
    if (editingSlug === slug || slugStatus !== "available") return;
    setIsSavingSlug(true);
    setSlugError(null);
    try {
      const res = await updatePortfolioSlugAction(portfolioId, editingSlug);
      if (res.success) {
        if (onSlugUpdated) onSlugUpdated(editingSlug);
        setSlugStatus(null);
      } else {
        setSlugError(res.error || "Failed to update public username/slug");
      }
    } catch {
      setSlugError("An error occurred while updating slug");
    } finally {
      setIsSavingSlug(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-slate-100 shadow-xl">
      {/* 1. Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Public Portfolio Identity & Sharing</h3>
            <p className="text-xs text-slate-400">Share your live portfolio across channels, social media, and QR code.</p>
          </div>
        </div>

        <div>
          {isPublished ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ● Published & Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              ○ Unpublished / Private
            </span>
          )}
        </div>
      </div>

      {/* UNPUBLISHED WARNING NOTICE */}
      {!isPublished && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
          <h4 className="text-sm font-semibold text-slate-200">Your portfolio isn&apos;t public yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Publish your portfolio to generate your public URL, social preview cards, and scannable QR code.
          </p>
        </div>
      )}

      {/* PUBLISHED CONTENT & SHARING CONTROLS */}
      {isPublished && (
        <div className="space-y-6">
          {/* 2. Public Canonical URL & Copy */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Public Canonical URL
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 pl-3">
              <span className="text-xs text-indigo-400 font-mono truncate flex-1">{publicUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                title="Open Public Portfolio"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3. Share Button & Social Quick Links */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share Portfolio
              </button>

              <div className="flex items-center justify-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Share on X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={socialLinks.email}
                  className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Share via Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* 4. Social Share Preview Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Eye className="w-4 h-4 text-indigo-400" /> How your portfolio appears when shared
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 max-w-md mx-auto">
              <div className="h-32 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 text-center border-b border-slate-800">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    PORTFOLIOCRAFT PREVIEW
                  </span>
                  <p className="text-sm font-extrabold text-white mt-1">{displayName}</p>
                  <p className="text-xs text-indigo-300/80 line-clamp-1">{headline || "Software Engineer"}</p>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">
                  portfoliocraft.app
                </span>
                <p className="text-xs font-bold text-slate-200 line-clamp-1">{shareTitle}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{shareDesc}</p>
              </div>
            </div>
          </div>

          {/* 5. QR Code Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <QrCode className="w-4 h-4 text-indigo-400" /> Public QR Code
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Size:</span>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
                >
                  <option value={200}>200 px</option>
                  <option value={300}>300 px</option>
                  <option value={400}>400 px</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-slate-900/50 rounded-lg">
              <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-700 flex items-center justify-center">
                {isGeneratingQr ? (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-500 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt={`QR code linking to ${displayName}'s public portfolio`}
                    className="w-40 h-40 object-contain"
                  />
                )}
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <p className="text-xs text-slate-400 max-w-xs">
                  Scan with any mobile camera to open your public portfolio instantly.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => downloadQrCode(publicUrl, `${slug}-qr`, "png", qrSize)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadQrCode(publicUrl, `${slug}-qr`, "svg", qrSize)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download SVG
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Slug Management & Warning */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Public Username / Slug</label>
              {slugStatus === "available" && <span className="text-[11px] text-emerald-400 font-medium">✓ Available</span>}
              {slugStatus === "unavailable" && <span className="text-[11px] text-red-400 font-medium">✕ Unavailable</span>}
              {slugStatus === "invalid" && <span className="text-[11px] text-amber-400 font-medium">Min 3 characters</span>}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={editingSlug}
                  onChange={handleSlugInputChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 font-mono"
                />
                {isCheckingSlug && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500 absolute right-3 top-2.5" />
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveSlug}
                disabled={editingSlug === slug || slugStatus !== "available" || isSavingSlug}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSavingSlug ? "Updating..." : "Update Slug"}
              </button>
            </div>

            {slugError && <p className="text-xs text-red-400">{slugError}</p>}

            <div className="flex items-start gap-2 text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Changing your username changes your public URL. Existing shared links will point to the new URL.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
