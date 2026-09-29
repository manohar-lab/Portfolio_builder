"use client";

import React from "react";
import { useEditor } from "../EditorContext";
import { PRIMARY_COLOR_PALETTE } from "@/config/constants";
import { ThemeConfig } from "@/types/portfolio";
import { Palette, Sun, Moon, Laptop, Sparkles, Type } from "lucide-react";

export const AppearancePanel: React.FC = () => {
  const { portfolio, updateTheme } = useEditor();
  const theme = portfolio.theme;

  return (
    <div className="space-y-6">
      
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600" /> Theme & Appearance Customizer
        </h2>
        <p className="text-xs text-gray-500">
          Personalize colors, typography, border radius, and spacing. Changes update live in the preview panel.
        </p>
      </div>

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
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Primary Color Palette</label>
          <div className="flex flex-wrap gap-3 pt-1">
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
        </div>

        {/* FONT FAMILY */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-indigo-600" /> Typography Family
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "sans" as const, label: "Sans-Serif", sample: "Inter / Sans" },
              { id: "serif" as const, label: "Serif", sample: "Merriweather" },
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
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="none">Square (None)</option>
              <option value="sm">Small (Sm)</option>
              <option value="md">Rounded (Md)</option>
              <option value="lg">Large (Lg)</option>
              <option value="full">Pill (Full)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Layout Spacing</label>
            <select
              value={theme.layoutSpacing}
              onChange={(e) => updateTheme({ layoutSpacing: e.target.value as ThemeConfig["layoutSpacing"] })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
