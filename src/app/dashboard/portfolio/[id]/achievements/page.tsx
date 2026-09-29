"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { saveAchievementAction, deleteAchievementAction, saveCertificationAction, deleteCertificationAction } from "@/dashboard/actions";
import { AchievementItem, CertificationItem } from "@/types/portfolio";
import { ArrowLeft, Award, Plus, Trash2 } from "lucide-react";

interface AchievementsEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function AchievementsEditorPage({ params }: AchievementsEditorPageProps) {
  const { id: portfolioId } = use(params);

  const [achievements, setAchievements] = useState<AchievementItem[]>([
    { id: "ach-1", title: "1st Place Global Hackathon", issuer: "Tech Foundation", date: "2024-11", description: "Built real-time medical scan triage app." },
  ]);

  const [certifications, setCertifications] = useState<CertificationItem[]>([
    { id: "cert-1", name: "AWS Certified Solutions Architect", issuingOrganization: "Amazon Web Services", issueDate: "2024-03" },
  ]);

  const [editingAch, setEditingAch] = useState<AchievementItem | null>(null);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAch) return;
    setIsSaving(true);
    try {
      const res = await saveAchievementAction(portfolioId, editingAch);
      if (res.success) {
        if (!editingAch.id) setAchievements([...achievements, { ...editingAch, id: `ach-${Date.now()}` }]);
        else setAchievements(achievements.map((a) => (a.id === editingAch.id ? editingAch : a)));
        setEditingAch(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAch = async (achId: string) => {
    try {
      await deleteAchievementAction(portfolioId, achId);
      setAchievements(achievements.filter((a) => a.id !== achId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setIsSaving(true);
    try {
      const res = await saveCertificationAction(portfolioId, editingCert);
      if (res.success) {
        if (!editingCert.id) setCertifications([...certifications, { ...editingCert, id: `cert-${Date.now()}` }]);
        else setCertifications(certifications.map((c) => (c.id === editingCert.id ? editingCert : c)));
        setEditingCert(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCert = async (certId: string) => {
    try {
      await deleteCertificationAction(portfolioId, certId);
      setCertifications(certifications.filter((c) => c.id !== certId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/portfolio/${portfolioId}`}
          className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio Management
        </Link>
      </div>

      {/* ACHIEVEMENTS SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Achievements ({achievements.length})
          </h2>
          <button
            onClick={() => setEditingAch({ id: "", title: "", issuer: "", description: "" })}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Achievement
          </button>
        </div>

        {editingAch && (
          <form onSubmit={handleSaveAch} className="p-6 bg-slate-900 border border-blue-500/30 rounded-2xl space-y-4">
            <input
              type="text"
              required
              placeholder="Achievement Title *"
              value={editingAch.title}
              onChange={(e) => setEditingAch({ ...editingAch, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Issuer / Organization *"
              value={editingAch.issuer}
              onChange={(e) => setEditingAch({ ...editingAch, issuer: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingAch(null)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {achievements.map((ach) => (
            <div key={ach.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white text-sm block">{ach.title}</span>
                <span className="text-xs text-slate-400">{ach.issuer}</span>
              </div>
              <button onClick={() => handleDeleteAch(ach.id)} className="p-1.5 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* CERTIFICATIONS SECTION */}
      <div className="space-y-4 border-t border-slate-800/80 pt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" /> Certifications ({certifications.length})
          </h2>
          <button
            onClick={() => setEditingCert({ id: "", name: "", issuingOrganization: "" })}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Certification
          </button>
        </div>

        {editingCert && (
          <form onSubmit={handleSaveCert} className="p-6 bg-slate-900 border border-blue-500/30 rounded-2xl space-y-4">
            <input
              type="text"
              required
              placeholder="Certification Name *"
              value={editingCert.name}
              onChange={(e) => setEditingCert({ ...editingCert, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Issuing Organization *"
              value={editingCert.issuingOrganization}
              onChange={(e) => setEditingCert({ ...editingCert, issuingOrganization: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCert(null)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-white text-sm block">{cert.name}</span>
                <span className="text-xs text-slate-400">{cert.issuingOrganization}</span>
              </div>
              <button onClick={() => handleDeleteCert(cert.id)} className="p-1.5 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
