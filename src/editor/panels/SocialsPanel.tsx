"use client";

import React, { useState } from "react";
import { useEditor } from "@/editor/EditorContext";
import { SocialLink } from "@/types/portfolio";
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown, Globe } from "lucide-react";

const PLATFORM_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "scholar", label: "Google Scholar" },
  { value: "youtube", label: "YouTube" },
  { value: "medium", label: "Medium / Blog" },
  { value: "website", label: "Personal Website" },
  { value: "other", label: "Other Link" },
];

export const SocialsPanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    platform: "github",
    label: "",
    url: "",
  });

  const resetForm = () => {
    setFormData({ platform: "github", label: "", url: "" });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setFormData(link);
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    const linkPayload: SocialLink = {
      id: editingId || `soc-${Date.now()}`,
      platform: formData.platform || "github",
      label: formData.label || formData.platform || "Link",
      url: formData.url,
      sortOrder: formData.sortOrder || portfolio.socialLinks.length,
    };

    updatePortfolio((prev) => {
      const exists = prev.socialLinks.some((l) => l.id === linkPayload.id);
      const updatedLinks = exists
        ? prev.socialLinks.map((l) => (l.id === linkPayload.id ? linkPayload : l))
        : [...prev.socialLinks, linkPayload];
      return { ...prev, socialLinks: updatedLinks };
    });

    resetForm();
  };

  const handleDelete = (id: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((l) => l.id !== id),
    }));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= portfolio.socialLinks.length) return;

    updatePortfolio((prev) => {
      const updated = [...prev.socialLinks];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, socialLinks: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Social & Web Links</h2>
          <p className="text-sm text-gray-500">Connect your profiles across GitHub, LinkedIn, Google Scholar, and websites.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Social Link
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">{editingId ? "Edit Link" : "New Link"}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Custom Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. GitHub Profile"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {editingId ? "Update Link" : "Save Link"}
            </button>
          </div>
        </form>
      )}

      {portfolio.socialLinks.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No social links added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
          >
            <Plus className="h-4 w-4" /> Add Social Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.socialLinks.map((link, idx) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm hover:border-indigo-200 transition"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{link.label || link.platform}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-indigo-600 hover:underline truncate max-w-xs"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === portfolio.socialLinks.length - 1}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(link)}
                  className="p-1 rounded-md border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="p-1 rounded-md border border-gray-200 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
