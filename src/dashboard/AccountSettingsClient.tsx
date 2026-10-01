/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  updateAccountProfileAction,
  updateAccountPreferencesAction,
  changePasswordAction,
  exportUserDataAction,
  deleteAccountAction,
} from "@/dashboard/account-actions";
import { disconnectGitHubAction } from "@/dashboard/actions";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Settings,
  Github,
  Moon,
  Sun,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Globe,
  Info,
  Check,
  ShieldAlert,
  Save,
} from "lucide-react";

interface AccountSettingsClientProps {
  userData: {
    authUser: {
      id: string;
      email: string;
      email_confirmed_at?: string | null;
      app_metadata?: {
        provider?: string | null;
      } | null;
      user_metadata?: {
        avatar_url?: string | null;
        full_name?: string | null;
      } | null;
    };
    internalUser?: {
      id: string;
      full_name?: string | null;
      avatar_url?: string | null;
      created_at?: string | null;
    } | null;
    profile?: {
      full_name?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
      theme_preference?: string | null;
      email_notifications?: boolean | null;
    } | null;
  };
  portfoliosCount: number;
  githubConnected: boolean;
  githubUsername?: string;
}

export function AccountSettingsClient({
  userData,
  portfoliosCount,
  githubConnected: initialGithubConnected,
  githubUsername: initialGithubUsername,
}: AccountSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "connections" | "preferences" | "privacy">("profile");

  // Account Profile Form State
  const initialName =
    userData.profile?.full_name ||
    userData.internalUser?.full_name ||
    userData.authUser.email.split("@")[0];
  const initialAvatar =
    userData.profile?.avatar_url ||
    userData.internalUser?.avatar_url ||
    userData.authUser.user_metadata?.avatar_url ||
    "";
  const initialBio = userData.profile?.bio || "";

  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [bio, setBio] = useState(initialBio);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Security Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Connections State
  const [isGithubConnected, setIsGithubConnected] = useState(initialGithubConnected);
  const [githubUser, setGithubUser] = useState(initialGithubUsername);
  const [isDisconnectingGithub, setIsDisconnectingGithub] = useState(false);

  // Preferences Form State
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [prefMessage, setPrefMessage] = useState<string | null>(null);

  // Privacy / Export / Delete State
  const [isExporting, setIsExporting] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isEmailVerified = !!userData.authUser.email_confirmed_at;
  const createdAtDate = userData.internalUser?.created_at
    ? new Date(userData.internalUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently created";

  // Handle Account Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    const res = await updateAccountProfileAction({
      fullName,
      avatarUrl,
      bio,
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileMessage({ type: "success", text: "Account profile updated successfully!" });
    } else {
      setProfileMessage({ type: "error", text: res.error || "Failed to update profile." });
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);

    const res = await changePasswordAction(newPassword);
    setIsChangingPassword(false);

    if (res.success) {
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: res.error || "Failed to change password." });
    }
  };

  // Handle GitHub Disconnect (Preserves imported portfolio data)
  const handleDisconnectGithub = async () => {
    setIsDisconnectingGithub(true);
    const res = await disconnectGitHubAction();
    setIsDisconnectingGithub(false);
    if (res.success) {
      setIsGithubConnected(false);
      setGithubUser(undefined);
    }
  };

  // Handle Preferences Save
  const handleSavePreferences = async () => {
    setIsSavingPref(true);
    setPrefMessage(null);
    const res = await updateAccountPreferencesAction({
      theme: themeMode,
      emailNotifications,
    });
    setIsSavingPref(false);
    if (res.success) {
      setPrefMessage("Preferences saved successfully!");
    }
  };

  // Handle Data Export
  const handleExportData = async () => {
    setIsExporting(true);
    const res = await exportUserDataAction();
    setIsExporting(false);
    if (res.success && res.data) {
      setExportedJson(JSON.stringify(res.data, null, 2));
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteInputText.trim() !== "DELETE MY ACCOUNT") return;
    setIsDeleting(true);
    const res = await deleteAccountAction(deleteInputText);
    if (res.success) {
      window.location.href = "/";
    } else {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-100">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs font-mono text-slate-400">
          Portfolios Owned: <strong className="text-indigo-400">{portfoliosCount}</strong>
        </span>
      </div>

      {/* ACCOUNT PROFILE vs PORTFOLIO PROFILE DISTINCTION NOTICE */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-indigo-200">Account Identity vs Portfolio Content:</span>
          <p className="text-slate-300 leading-relaxed">
            Account settings control your global login identity, display avatar, security, and preferences. Portfolio content (projects, skills, research, and custom bios) is managed independently inside individual portfolio editors.
          </p>
        </div>
      </div>

      {/* ACCOUNT HEADER CARD */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-bold text-xl shrink-0">
              <User className="w-7 h-7" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{fullName}</h1>
              {isEmailVerified && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {userData.authUser.email}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Member since: {createdAtDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
            Primary Auth: <strong className="text-indigo-400 capitalize">{(userData.authUser.app_metadata?.provider as string) || "OAuth Provider"}</strong>
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-2.5 px-4 rounded-t-xl transition border-b-2 flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-400 font-bold bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4" /> Account Profile
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`py-2.5 px-4 rounded-t-xl transition border-b-2 flex items-center gap-2 ${
            activeTab === "security"
              ? "border-indigo-500 text-indigo-400 font-bold bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" /> Security & Auth
        </button>

        <button
          onClick={() => setActiveTab("connections")}
          className={`py-2.5 px-4 rounded-t-xl transition border-b-2 flex items-center gap-2 ${
            activeTab === "connections"
              ? "border-indigo-500 text-indigo-400 font-bold bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Github className="w-4 h-4" /> Connected Accounts
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`py-2.5 px-4 rounded-t-xl transition border-b-2 flex items-center gap-2 ${
            activeTab === "preferences"
              ? "border-indigo-500 text-indigo-400 font-bold bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" /> Preferences
        </button>

        <button
          onClick={() => setActiveTab("privacy")}
          className={`py-2.5 px-4 rounded-t-xl transition border-b-2 flex items-center gap-2 ${
            activeTab === "privacy"
              ? "border-rose-500 text-rose-400 font-bold bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-rose-400"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Privacy & Danger Zone
        </button>
      </div>

      {/* TAB 1: ACCOUNT PROFILE FORM */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Global Account Identity</h3>
            <p className="text-slate-400">Update your account display name, profile avatar, and account-level bio.</p>
          </div>

          {profileMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                profileMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {profileMessage.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Account Display Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Account Bio (Internal)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief account bio summary..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY & AUTH */}
      {activeTab === "security" && (
        <div className="space-y-6 text-xs">
          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Password Management
            </h3>

            {passwordMessage && (
              <div
                className={`p-3 rounded-xl border ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          {/* Active Session & Security Audit */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Session & Row Level Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Active Auth Session</span>
                <p className="text-slate-200 font-mono text-xs">Verified SSR Session</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Database Isolation</span>
                <p className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tenant RLS Active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONNECTED ACCOUNTS */}
      {activeTab === "connections" && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">OAuth Connections & Integrations</h3>
            <p className="text-slate-400">Manage third-party authentication and data import connections safely.</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 text-white rounded-xl">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block">GitHub Integration</span>
                <span className="text-slate-400 text-[11px]">
                  {isGithubConnected ? `Connected as @${githubUser || "user"}` : "Not Connected"}
                </span>
              </div>
            </div>

            {isGithubConnected ? (
              <button
                type="button"
                onClick={handleDisconnectGithub}
                disabled={isDisconnectingGithub}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-300 text-slate-300 border border-slate-700 rounded-xl font-semibold transition"
              >
                {isDisconnectingGithub ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : (
              <Link
                href="/api/auth/github"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
              >
                Connect GitHub
              </Link>
            )}
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Data Protection:</strong> Disconnecting an integration stops automated syncs but preserves all previously imported portfolio projects.</span>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES */}
      {activeTab === "preferences" && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Dashboard Preferences</h3>
            <p className="text-slate-400">Customize workspace theme and non-critical email alert preferences.</p>
          </div>

          {prefMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl">
              {prefMessage}
            </div>
          )}

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Workspace Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setThemeMode("dark")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  themeMode === "dark"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("light")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  themeMode === "light"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("system")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  themeMode === "system"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="w-4 h-4" /> System
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="font-semibold text-slate-300 block">Email Notifications</label>
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <span className="font-semibold text-white block">Product & Portfolio Activity Alerts</span>
                <span className="text-slate-400 text-[11px]">Receive non-critical updates regarding portfolio views and publishing.</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isSavingPref}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
            >
              {isSavingPref ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & DANGER ZONE */}
      {activeTab === "privacy" && (
        <div className="space-y-6 text-xs">
          {/* Data Export Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" /> Export Account Data (JSON)
              </h3>
              <p className="text-slate-400">Download a JSON archive containing your account identity and portfolio metadata.</p>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl font-bold transition flex items-center gap-2"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export Account Backup
            </button>

            {exportedJson && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-mono text-[10px] text-emerald-400 block font-bold">Export Backup Ready:</span>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                  {exportedJson}
                </pre>
              </div>
            )}
          </div>

          {/* Account Deletion Danger Zone */}
          <div className="p-6 bg-slate-900 border border-rose-500/30 rounded-3xl space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Account Deletion Danger Zone
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Permanently delete your account and remove all associated portfolios, projects, and custom domains. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteInputText("");
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/40 p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To prevent accidental deletion, please type <strong className="text-white font-mono">DELETE MY ACCOUNT</strong> below to confirm:
            </p>
            <div>
              <input
                type="text"
                value={deleteInputText}
                onChange={(e) => setDeleteInputText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInputText.trim() !== "DELETE MY ACCOUNT" || isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl"
              >
                {isDeleting ? "Deleting..." : "Confirm Permanent Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
