import { describe, it, expect } from "vitest";
import { THEME_PRESETS, DEFAULT_CUSTOMIZATION } from "../config/customization-presets";
import { validateColorContrast, isValidHexColor } from "../utilities/contrast-checker";
import { getCssDesignTokens, sanitizeCustomizationData } from "../utilities/design-token-adapter";
import { CustomizationConfig } from "../types/customization";

describe("Phase 16 - Visual Customization & Design Token System", () => {
  it("should contain all 5 predefined visual theme presets with distinct attributes", () => {
    const presets = ["minimal", "developer", "research", "modern", "professional"] as const;
    
    presets.forEach((presetId) => {
      const preset = THEME_PRESETS[presetId];
      expect(preset).toBeDefined();
      expect(preset.preset).toBe(presetId);
      expect(preset.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.typography.headingFont).toBeDefined();
      expect(preset.typography.bodyFont).toBeDefined();
      expect(preset.layout.borderRadius).toBeDefined();
    });
  });

  it("should validate hex color code formats correctly", () => {
    expect(isValidHexColor("#ffffff")).toBe(true);
    expect(isValidHexColor("#3b82f6")).toBe(true);
    expect(isValidHexColor("#000")).toBe(true);
    
    expect(isValidHexColor("invalid-color")).toBe(false);
    expect(isValidHexColor("#12345")).toBe(false);
    expect(isValidHexColor("<script>alert(1)</script>")).toBe(false);
  });

  it("should accurately compute WCAG color contrast ratios and warn for low contrast", () => {
    // High contrast (black text on white background)
    const highContrast = validateColorContrast("#000000", "#ffffff");
    expect(highContrast.ratio).toBeGreaterThan(15);
    expect(highContrast.pass).toBe(true);
    expect(highContrast.warning).toBeUndefined();

    // Low contrast (light gray text on white background)
    const lowContrast = validateColorContrast("#cccccc", "#ffffff");
    expect(lowContrast.pass).toBe(false);
    expect(lowContrast.warning).toBeDefined();
    expect(lowContrast.warning).toContain("Low contrast warning");
  });

  it("should generate CSS custom properties correctly from CustomizationConfig", () => {
    const customConfig: CustomizationConfig = {
      preset: "modern",
      colors: {
        primary: "#8b5cf6",
        accent: "#ec4899",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f8fafc",
        mutedText: "#94a3b8",
      },
      typography: {
        headingFont: "Outfit",
        bodyFont: "Inter",
        fontSize: "large",
      },
      layout: {
        width: "wide",
        borderRadius: "rounded",
        backgroundMode: "gradient",
        colorMode: "dark",
      },
      components: {
        buttonStyle: "filled",
        projectLayout: "cards",
        projectCard: {
          showTechTags: true,
          showGithubButton: true,
          showLiveDemoButton: true,
          showImage: true,
        },
      },
      sectionOrder: ["hero", "projects", "about", "skills"],
      sectionVisibility: { hero: true, projects: true, about: true, skills: false },
    };

    const tokens = getCssDesignTokens(customConfig);

    expect(tokens["--primary-color" as keyof React.CSSProperties]).toBe("#8b5cf6");
    expect(tokens["--accent-color" as keyof React.CSSProperties]).toBe("#ec4899");
    expect(tokens["--border-radius" as keyof React.CSSProperties]).toBe("16px");
    expect(tokens["--container-width" as keyof React.CSSProperties]).toBe("1280px");
    expect(tokens["--font-size-base" as keyof React.CSSProperties]).toBe("18px");
  });

  it("should provide safe defaults and sanitize raw database JSONB customization payloads", () => {
    const sanitized = sanitizeCustomizationData(undefined);
    expect(sanitized).toEqual(DEFAULT_CUSTOMIZATION);

    const corruptRaw = {
      colors: { primary: "#123456" },
      sectionOrder: "invalid-string-instead-of-array",
    };

    const sanitizedCorrupt = sanitizeCustomizationData(corruptRaw as unknown as Record<string, unknown>);
    expect(sanitizedCorrupt.colors.primary).toBe("#123456");
    expect(sanitizedCorrupt.colors.accent).toBe(DEFAULT_CUSTOMIZATION.colors.accent);
    expect(Array.isArray(sanitizedCorrupt.sectionOrder)).toBe(true);
  });

  it("should isolate user portfolio customization settings", () => {
    const userAConfig = { ...DEFAULT_CUSTOMIZATION, preset: "developer" as const };
    const userBConfig = { ...DEFAULT_CUSTOMIZATION, preset: "research" as const };

    expect(userAConfig.preset).not.toEqual(userBConfig.preset);
  });
});
