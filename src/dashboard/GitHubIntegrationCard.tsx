"use client";

import React, { useState, useEffect } from "react";
import { GitHubConnectionStatus } from "@/types/portfolio";
import { getGitHubStatusAction, disconnectGitHubAction } from "@/dashboard/actions";
import { signInWithOAuthAction } from "@/auth/actions";
import { GitHubImportModal } from "./GitHubImportModal";
import { Github, CheckCircle2, AlertTriangle, Unplug, Plus } from "lucide-react";

export const GitHubIntegrationCard: React.FC<{ defaultPortfolioId?: string }> = ({
  defaultPortfolioId,
}) => {
  const [status, setStatus] = useState<GitHubConnectionStatus>({ isConnected: false });
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadStatus = async () => {
    const res = await getGitHubStatusAction();
    setStatus(res);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleConnect = async () => {
    await signInWithOAuthAction("github", "/dashboard");
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await disconnectGitHubAction();
    setDisconnecting(false);
    setShowDisconnectDialog(false);
    loadStatus();
  };

  return (
    <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-white">
            <Github className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">GitHub Integration</h3>
            <p className="text-xs text-slate-400">Import public repositories into your portfolio projects.</p>
          </div>
        </div>

        {status.isConnected ? (
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
            Not Connected
          </span>
        )}
      </div>

      {status.isConnected ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            {status.avatarUrl ? (
              <img src={status.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                GH
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-white">● Connected as {status.username}</p>
              <p className="text-[11px] text-slate-400">Public repository import enabled.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {defaultPortfolioId && (
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Import Projects
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDisconnectDialog(true)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Unplug className="w-3.5 h-3.5 text-rose-400" /> Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConnect}
            className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Github className="w-4 h-4" /> Connect GitHub Account
          </button>
        </div>
      )}

      {/* Disconnect Warning Dialog */}
      {showDisconnectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-gray-900">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-bold text-base">Disconnect GitHub?</h4>
            </div>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Disconnecting will un-link your GitHub account integration.
              <br />
              <strong className="text-gray-900 font-bold mt-1 block">
                Already imported portfolio projects will NOT be deleted.
              </strong>
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDisconnectDialog(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                {disconnecting ? "Disconnecting..." : "Confirm Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {defaultPortfolioId && (
        <GitHubImportModal
          portfolioId={defaultPortfolioId}
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};
