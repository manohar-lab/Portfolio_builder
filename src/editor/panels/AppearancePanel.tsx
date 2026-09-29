"use client";

import React, { useState } from "react";
import { useEditor } from "../EditorContext";
import { PRIMARY_COLOR_PALETTE } from "@/config/constants";
import { ThemeConfig } from "@/types/portfolio";
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  Type,
  AlertTriangle,
  RotateCcw,
  Check,
} from "lucide-react";

const PRESET_THEMES: {
  id: string;
  name: string;
  description: string;
  config: Partial<ThemeConfig>;
}[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Indigo theme with clean sans typography and comfortable spacing.",
    config: {
      mode: "light",
      primaryColor: "#4f46e5",
      fontFamily: "sans",
      borderRadius: "md",
      layoutSpacing: "comfortable",
      animationLevel: "subtle",
    },
  },
  {
    id: "minimal",
    name: "Minimalist Mono",
    description: "Slate tones with crisp monospace fonts and sharp borders.",
    config: {
      mode: "light",
      primaryColor: "#475569",
      fontFamily: "mono",
      borderRadius: "none",
      layoutSpacing: "compact",
      animationLevel: "none",
    },
  },
  {
    id: "dark_emerald",
    name: "Dark Emerald",
    description: "Sleek dark theme with vibrant emerald accents.",
    config: {
      mode: "dark",
      primaryColor: "#10b981",
      fontFamily: "sans",
      borderRadius: "lg",
      layoutSpacing: "comfortable",
      animationLevel: "subtle",
    },
  },
  {
    id: "academic",
    name: "Academic Serif",
    description: "Burgundy accents with classical serif typography.",
    config: {
      mode: "light",
      primaryColor: "#800020",
      fontFamily: "serif",
      borderRadius: "sm",
      layoutSpacing: "spacious",
      animationLevel: "subtle",
    },
  },
  {
    id: "modern_vibrant",
    name: "Modern Cyber",
    description: "Vibrant purple with full pill borders and spacious layout.",
    config: {
      mode: "dark",
      primaryColor: "#8b5cf6",
      fontFamily: "sans",
      borderRadius: "full",
      layoutSpacing: "spacious",
      animationLevel: "full",
    },
  },
];

// Helper: Calculate relative luminance to detect low contrast color combinations
function getLuminance(hexColor: string): number {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return 0.5;
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const AppearancePanel: React.FC = () => {
  const { portfolio, updateTheme } = useEditor();
  const theme = portfolio.theme;
  const [showResetNotice, setShowResetNotice] = useState(false);

  const currentLuminance = getLuminance(theme.primaryColor);
  const isLightMode = theme.mode === "light";
  const isLowContrast = isLightMode ? currentLuminance > 0.85 : currentLuminance < 0.1;

  const handleResetAppearance = () => {
    updateTheme({
      mode: "light",
      primaryColor: "#4f46e5",
      fontFamily: "sans",
      borderRadius: "md",
      layoutSpacing: "comfortable",
      animationLevel: "subtle",
    });
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" /> Appearance & Theme Customizer
          </h2>
          <p className="text-xs text-gray-500">
            Personalize theme mode, colors, typography, and spacing. Updates apply immediately in live preview.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAppearance}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
          title="Reset visual theme settings to default"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" /> Reset
        </button>
      </div>

      {showResetNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Appearance reset to default template theme. Content remains untouched!</span>
        </div>
      )}

      {/* THEME PRESETS */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Theme Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => updateTheme(preset.config)}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900">{preset.name}</span>
                <span
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: preset.config.primaryColor }}
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="space-y-6">
        {/* LIGHT / DARK / SYSTEM MODE */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Theme Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light" as const, label: "Light", icon: Sun },
              { id: "dark" as const, label: "Dark", icon: Moon },
              { id: "system" as const, label: "System", icon: Laptop },
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = theme.mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateTheme({ mode: item.id })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <IconComp className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRIMARY COLOR PALETTE */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700">Primary Color</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">{theme.primaryColor}</span>
              <input
                type="color"
                value={theme.primaryColor || "#4f46e5"}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                title="Custom color picker"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {PRIMARY_COLOR_PALETTE.map((col) => {
              const isSelected = theme.primaryColor === col.hex;
              return (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => updateTheme({ primaryColor: col.hex })}
                  className={`w-9 h-9 rounded-full transition-all flex items-center justify-center border-2 ${
                    isSelected ? "border-white ring-2 ring-indigo-500 scale-110" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Color Safety Contrast Warning */}
          {isLowContrast && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Contrast Warning</span>
                <span>
                  The chosen primary color may have low contrast against your background. Consider picking a bolder or darker shade for better readability.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* FONT FAMILY */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-indigo-600" /> Typography Family
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "sans" as const, label: "Sans-Serif", sample: "Inter / Roboto" },
              { id: "serif" as const, label: "Serif", sample: "Playfair Display" },
              { id: "mono" as const, label: "Monospace", sample: "Fira Code" },
            ].map((f) => {
              const isSelected = theme.fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateTheme({ fontFamily: f.id })}
                  className={`p-3 rounded-xl border text-xs text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="font-bold block">{f.label}</span>
                  <span className="text-[10px] text-gray-500">{f.sample}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BORDER RADIUS & LAYOUT SPACING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Border Radius</label>
            <select
              value={theme.borderRadius}
              onChange={(e) => updateTheme({ borderRadius: e.target.value as ThemeConfig["borderRadius"] })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="none">Square (Sharp)</option>
              <option value="sm">Small (Sm)</option>
              <option value="md">Rounded (Medium)</option>
              <option value="lg">Large (Lg)</option>
              <option value="full">Pill (Full)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Layout Spacing</label>
            <select
              value={theme.layoutSpacing}
              onChange={(e) => updateTheme({ layoutSpacing: e.target.value as ThemeConfig["layoutSpacing"] })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>

        {/* ANIMATION LEVEL */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Animation Level</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "none" as const, label: "None" },
              { id: "subtle" as const, label: "Subtle" },
              { id: "full" as const, label: "Full Dynamic" },
            ].map((a) => {
              const isSelected = theme.animationLevel === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateTheme({ animationLevel: a.id })}
                  className={`py-2 rounded-xl border text-xs font-semibold transition ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
