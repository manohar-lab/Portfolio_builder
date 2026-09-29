/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { requireAuth } from "@/auth/service";
import { User, Mail, Calendar, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";

export default async function AccountPage() {
  const userData = await requireAuth("/dashboard/account");

  const fullName =
    userData.profile?.full_name ||
    userData.internalUser?.full_name ||
    userData.authUser.email.split("@")[0];

  const avatarUrl =
    userData.profile?.avatar_url ||
    userData.internalUser?.avatar_url ||
    (userData.authUser.user_metadata?.avatar_url as string) ||
    "";

  const createdAtDate = userData.internalUser?.created_at
    ? new Date(userData.internalUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently created";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* ACCOUNT PROFILE CARD */}
      <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 font-bold text-2xl">
              <User className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> {userData.authUser.email}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Member since: {createdAtDate}
            </p>
          </div>
        </div>

        {/* SECURITY & CONNECTED IDENTITIES */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-400" /> Authenticated Identity Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Primary Auth Method</span>
              <p className="text-sm font-semibold text-slate-200 capitalize">
                {(userData.authUser.app_metadata?.provider as string) || "OAuth Provider"}
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Row Level Security</span>
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Enforced by PostgreSQL
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
