"use client";

import React, { useState } from "react";
import {
  CustomizationConfig,
  ThemePresetId,
  HeadingFontFamily,
  BodyFontFamily,
  FontSizeScale,
  LayoutWidth,
  BorderRadiusStyle,
  ButtonStyle,
  ProjectLayoutMode,
} from "@/types/customization";
import { THEME_PRESETS, DEFAULT_CUSTOMIZATION } from "@/config/customization-presets";
import { validateColorContrast } from "@/utilities/contrast-checker";
import { savePortfolioCustomizationAction, resetPortfolioCustomizationAction } from "@/dashboard/customization-actions";
import {
  Palette,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
} from "lucide-react";

interface ThemeCustomizationPanelProps {
  portfolioId: string;
  initialConfig: CustomizationConfig;
  onConfigChange?: (updated: CustomizationConfig) => void;
  onSaved?: () => void;
}

export function ThemeCustomizationPanel({
  portfolioId,
  initialConfig,
  onConfigChange,
  onSaved,
}: ThemeCustomizationPanelProps) {
  const [config, setConfig] = useState<CustomizationConfig>(initialConfig || DEFAULT_CUSTOMIZATION);
  const [activeTab, setActiveTab] = useState<"presets" | "colors" | "typography" | "layout" | "sections" | "components">("presets");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Notify parent of live changes
  const updateConfig = (newConfig: CustomizationConfig) => {
    setConfig(newConfig);
    setIsDirty(true);
    if (onConfigChange) onConfigChange(newConfig);
  };

  // Contrast check
  const contrastCheck = validateColorContrast(config.colors.text, config.colors.background);

  const handleSelectPreset = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS[presetId];
    if (preset) {
      updateConfig({
        ...preset,
        sectionOrder: config.sectionOrder,
        sectionVisibility: config.sectionVisibility,
      });
    }
  };

  const handleColorChange = (key: keyof CustomizationConfig["colors"], value: string) => {
    updateConfig({
      ...config,
      colors: {
        ...config.colors,
        [key]: value,
      },
    });
  };

  const handleTypographyChange = <K extends keyof CustomizationConfig["typography"]>(
    key: K,
    value: CustomizationConfig["typography"][K]
  ) => {
    updateConfig({
      ...config,
      typography: {
        ...config.typography,
        [key]: value,
      },
    });
  };

  const handleLayoutChange = <K extends keyof CustomizationConfig["layout"]>(
    key: K,
    value: CustomizationConfig["layout"][K]
  ) => {
    updateConfig({
      ...config,
      layout: {
        ...config.layout,
        [key]: value,
      },
    });
  };

  const handleComponentChange = <K extends keyof CustomizationConfig["components"]>(
    key: K,
    value: CustomizationConfig["components"][K]
  ) => {
    updateConfig({
      ...config,
      components: {
        ...config.components,
        [key]: value,
      },
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...config.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    updateConfig({
      ...config,
      sectionOrder: newOrder,
    });
  };

  const handleToggleSectionVisibility = (secId: string) => {
    updateConfig({
      ...config,
      sectionVisibility: {
        ...config.sectionVisibility,
        [secId]: !config.sectionVisibility[secId],
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await savePortfolioCustomizationAction(portfolioId, config);
      if (res.success) {
        setIsDirty(false);
        setSaveSuccess(true);
        if (onSaved) onSaved();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(res.error || "Failed to save customization settings.");
      }
    } catch {
      setErrorMsg("An unexpected server error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await resetPortfolioCustomizationAction(portfolioId);
      if (res.success) {
        updateConfig(DEFAULT_CUSTOMIZATION);
        setIsDirty(false);
        setShowResetConfirm(false);
      } else {
        setErrorMsg(res.error || "Failed to reset customization.");
      }
    } catch {
      setErrorMsg("Failed to reset customization.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full text-slate-100 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Visual Customization
              {isDirty && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Unsaved Changes
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Personalize fonts, colors, layout, and section order.</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setPreviewViewport("desktop")}
            className={`p-1.5 rounded transition-colors ${previewViewport === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            title="Desktop Viewport"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewViewport("tablet")}
            className={`p-1.5 rounded transition-colors ${previewViewport === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            title="Tablet Viewport (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewViewport("mobile")}
            className={`p-1.5 rounded transition-colors ${previewViewport === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            title="Mobile Viewport (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`py-2.5 px-3.5 border-b-2 transition-colors shrink-0 ${activeTab === "presets" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("colors")}
          className={`py-2.5 px-3.5 border-b-2 transition-colors shrink-0 ${activeTab === "colors" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Colors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("typography")}
          className={`py-2.5 px-3.5 border-b-2 transition-colors shrink-0 ${activeTab === "typography" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Typography
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          className={`py-2.5 px-3.5 border-b-2 transition-colors shrink-0 ${activeTab === "layout" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Layout
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`py-2.5 px-3.5 border-b-2 transition-colors shrink-0 ${activeTab === "sections" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("components")}
          className={`py-2.5 px-3.5 border-b-2 transition-colors shrink-0 ${activeTab === "components" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Components
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Presets */}
        {activeTab === "presets" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Choose a predefined visual theme preset to quickly update colors and typography.</p>
            <div className="grid grid-cols-2 gap-3">
              {(["minimal", "developer", "research", "modern", "professional"] as ThemePresetId[]).map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => handleSelectPreset(pid)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.preset === pid
                      ? "bg-indigo-600/15 border-indigo-500 text-white shadow-lg"
                      : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold capitalize">{pid}</span>
                    {config.preset === pid && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: THEME_PRESETS[pid].colors.primary }} />
                    <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: THEME_PRESETS[pid].colors.accent }} />
                    <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: THEME_PRESETS[pid].colors.background }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Colors */}
        {activeTab === "colors" && (
          <div className="space-y-4">
            {!contrastCheck.pass && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{contrastCheck.warning}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.primary}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colors.primary}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colors.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.background}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colors.background}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Surface Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.surface}
                    onChange={(e) => handleColorChange("surface", e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colors.surface}
                    onChange={(e) => handleColorChange("surface", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.text}
                    onChange={(e) => handleColorChange("text", e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colors.text}
                    onChange={(e) => handleColorChange("text", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Muted Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.colors.mutedText}
                    onChange={(e) => handleColorChange("mutedText", e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colors.mutedText}
                    onChange={(e) => handleColorChange("mutedText", e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Typography */}
        {activeTab === "typography" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Heading Font Family</label>
              <select
                value={config.typography.headingFont}
                onChange={(e) => handleTypographyChange("headingFont", e.target.value as HeadingFontFamily)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              >
                <option value="Inter">Inter (Clean Sans)</option>
                <option value="Roboto">Roboto (Standard Sans)</option>
                <option value="Outfit">Outfit (Geometric Modern)</option>
                <option value="Playfair Display">Playfair Display (Academic Serif)</option>
                <option value="Fira Code">Fira Code (Developer Monospace)</option>
                <option value="System">System Native UI</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Body Font Family</label>
              <select
                value={config.typography.bodyFont}
                onChange={(e) => handleTypographyChange("bodyFont", e.target.value as BodyFontFamily)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="System">System Native</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Base Font Scale</label>
              <div className="grid grid-cols-3 gap-2">
                {(["small", "medium", "large"] as FontSizeScale[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleTypographyChange("fontSize", sz)}
                    className={`py-1.5 rounded text-xs font-semibold capitalize border transition-all ${
                      config.typography.fontSize === sz
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Layout */}
        {activeTab === "layout" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Container Width</label>
              <div className="grid grid-cols-3 gap-2">
                {(["compact", "standard", "wide"] as LayoutWidth[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleLayoutChange("width", w)}
                    className={`py-1.5 rounded text-xs font-semibold capitalize border transition-all ${
                      config.layout.width === w
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Border Radius Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(["sharp", "subtle", "rounded"] as BorderRadiusStyle[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleLayoutChange("borderRadius", r)}
                    className={`py-1.5 rounded text-xs font-semibold capitalize border transition-all ${
                      config.layout.borderRadius === r
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Section Order & Visibility */}
        {activeTab === "sections" && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-400">Reorder visible sections or toggle visibility per section.</p>
            <div className="space-y-2">
              {config.sectionOrder.map((secId, idx) => {
                const isVisible = config.sectionVisibility[secId] ?? true;
                return (
                  <div
                    key={secId}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSectionVisibility(secId)}
                        className={`p-1 rounded ${isVisible ? "text-indigo-400" : "text-slate-600"}`}
                        title="Toggle Section Visibility"
                      >
                        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <span className={`font-semibold capitalize ${isVisible ? "text-slate-200" : "text-slate-600 line-through"}`}>
                        {secId.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, "down")}
                        disabled={idx === config.sectionOrder.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: Components */}
        {activeTab === "components" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Button Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(["filled", "outline", "text"] as ButtonStyle[]).map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleComponentChange("buttonStyle", btn)}
                    className={`py-1.5 rounded text-xs font-semibold capitalize border transition-all ${
                      config.components.buttonStyle === btn
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Project Layout Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(["cards", "list", "featured"] as ProjectLayoutMode[]).map((pl) => (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => handleComponentChange("projectLayout", pl)}
                    className={`py-1.5 rounded text-xs font-semibold capitalize border transition-all ${
                      config.components.projectLayout === pl
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {pl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        <div className="flex gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Customization
          </button>
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      {showResetConfirm && (
        <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-xs text-red-200 flex items-center justify-between gap-2">
          <span>Reset visual settings to default preset? Your portfolio content will not be deleted.</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
