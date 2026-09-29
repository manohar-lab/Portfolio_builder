"use client";

import React from "react";
import { useEditor } from "../EditorContext";
import { ImageUploader } from "../ImageUploader";
import { User } from "lucide-react";

export const ProfilePanel: React.FC = () => {
  const { portfolio, updatePortfolio } = useEditor();
  const profile = portfolio.profile;

  const handleChange = <K extends keyof typeof profile>(field: K, value: (typeof profile)[K]) => {
    updatePortfolio((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" /> Edit Profile Details
        </h2>
        <p className="text-xs text-gray-500">
          Personal identity, professional headline, public contact links, and resume.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* AVATAR UPLOADER */}
        <ImageUploader
          value={profile.avatarUrl}
          onChange={(url) => handleChange("avatarUrl", url)}
          label="Profile Picture / Avatar"
          maxSizeMB={5}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Full Name *</label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Professional Headline *</label>
            <input
              type="text"
              required
              value={profile.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Short Bio</label>
          <textarea
            rows={3}
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Public Contact Email</label>
            <input
              type="email"
              value={profile.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Location</label>
            <input
              type="text"
              value={profile.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Resume / CV Link</label>
            <input
              type="url"
              value={profile.resumeUrl || ""}
              onChange={(e) => handleChange("resumeUrl", e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="editorIsAvailable"
            checked={profile.isAvailableForWork}
            onChange={(e) => handleChange("isAvailableForWork", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="editorIsAvailable" className="text-xs text-gray-700 font-semibold cursor-pointer">
            Display &quot;Available for new opportunities&quot; badge
          </label>
        </div>

      </div>
    </div>
  );
};
