import { CustomizationConfig } from "@/types/customization";
import { DEFAULT_CUSTOMIZATION } from "@/config/customization-presets";

/**
 * Converts a CustomizationConfig into an object of CSS Custom Properties
 */
export function getCssDesignTokens(config?: Partial<CustomizationConfig>): React.CSSProperties {
  const merged: CustomizationConfig = {
    ...DEFAULT_CUSTOMIZATION,
    ...config,
    colors: { ...DEFAULT_CUSTOMIZATION.colors, ...(config?.colors || {}) },
    typography: { ...DEFAULT_CUSTOMIZATION.typography, ...(config?.typography || {}) },
    layout: { ...DEFAULT_CUSTOMIZATION.layout, ...(config?.layout || {}) },
    components: { ...DEFAULT_CUSTOMIZATION.components, ...(config?.components || {}) },
  };

  const headingFontMap: Record<string, string> = {
    Inter: "'Inter', sans-serif",
    Roboto: "'Roboto', sans-serif",
    Outfit: "'Outfit', sans-serif",
    "Playfair Display": "'Playfair Display', serif",
    "Fira Code": "'Fira Code', monospace",
    System: "system-ui, -apple-system, sans-serif",
  };

  const bodyFontMap: Record<string, string> = {
    Inter: "'Inter', sans-serif",
    Roboto: "'Roboto', sans-serif",
    System: "system-ui, -apple-system, sans-serif",
  };

  const fontSizeMap: Record<string, string> = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };

  const borderRadiusMap: Record<string, string> = {
    sharp: "0px",
    subtle: "8px",
    rounded: "16px",
  };

  const containerWidthMap: Record<string, string> = {
    compact: "896px", // max-w-4xl
    standard: "1024px", // max-w-5xl
    wide: "1280px", // max-w-7xl
  };

  return {
    "--font-heading": headingFontMap[merged.typography.headingFont] || headingFontMap.Inter,
    "--font-body": bodyFontMap[merged.typography.bodyFont] || bodyFontMap.Inter,
    "--font-size-base": fontSizeMap[merged.typography.fontSize] || "16px",
    "--primary-color": merged.colors.primary,
    "--accent-color": merged.colors.accent,
    "--background-color": merged.colors.background,
    "--surface-color": merged.colors.surface,
    "--text-color": merged.colors.text,
    "--muted-color": merged.colors.mutedText,
    "--border-radius": borderRadiusMap[merged.layout.borderRadius] || "8px",
    "--container-width": containerWidthMap[merged.layout.width] || "1024px",
  } as React.CSSProperties;
}

/**
 * Returns clean sanitized CustomizationConfig from raw JSONB object with fallback defaults
 */
export function sanitizeCustomizationData(raw?: Record<string, unknown>): CustomizationConfig {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_CUSTOMIZATION;
  }

  return {
    preset: (raw.preset as CustomizationConfig["preset"]) || DEFAULT_CUSTOMIZATION.preset,
    colors: {
      primary: (raw.colors as CustomizationConfig["colors"])?.primary || DEFAULT_CUSTOMIZATION.colors.primary,
      accent: (raw.colors as CustomizationConfig["colors"])?.accent || DEFAULT_CUSTOMIZATION.colors.accent,
      background: (raw.colors as CustomizationConfig["colors"])?.background || DEFAULT_CUSTOMIZATION.colors.background,
      surface: (raw.colors as CustomizationConfig["colors"])?.surface || DEFAULT_CUSTOMIZATION.colors.surface,
      text: (raw.colors as CustomizationConfig["colors"])?.text || DEFAULT_CUSTOMIZATION.colors.text,
      mutedText: (raw.colors as CustomizationConfig["colors"])?.mutedText || DEFAULT_CUSTOMIZATION.colors.mutedText,
    },
    typography: {
      headingFont: (raw.typography as CustomizationConfig["typography"])?.headingFont || DEFAULT_CUSTOMIZATION.typography.headingFont,
      bodyFont: (raw.typography as CustomizationConfig["typography"])?.bodyFont || DEFAULT_CUSTOMIZATION.typography.bodyFont,
      fontSize: (raw.typography as CustomizationConfig["typography"])?.fontSize || DEFAULT_CUSTOMIZATION.typography.fontSize,
    },
    layout: {
      width: (raw.layout as CustomizationConfig["layout"])?.width || DEFAULT_CUSTOMIZATION.layout.width,
      borderRadius: (raw.layout as CustomizationConfig["layout"])?.borderRadius || DEFAULT_CUSTOMIZATION.layout.borderRadius,
      backgroundMode: (raw.layout as CustomizationConfig["layout"])?.backgroundMode || DEFAULT_CUSTOMIZATION.layout.backgroundMode,
      colorMode: (raw.layout as CustomizationConfig["layout"])?.colorMode || DEFAULT_CUSTOMIZATION.layout.colorMode,
    },
    components: {
      buttonStyle: (raw.components as CustomizationConfig["components"])?.buttonStyle || DEFAULT_CUSTOMIZATION.components.buttonStyle,
      projectLayout: (raw.components as CustomizationConfig["components"])?.projectLayout || DEFAULT_CUSTOMIZATION.components.projectLayout,
      projectCard: {
        showTechTags: (raw.components as CustomizationConfig["components"])?.projectCard?.showTechTags ?? DEFAULT_CUSTOMIZATION.components.projectCard.showTechTags,
        showGithubButton: (raw.components as CustomizationConfig["components"])?.projectCard?.showGithubButton ?? DEFAULT_CUSTOMIZATION.components.projectCard.showGithubButton,
        showLiveDemoButton: (raw.components as CustomizationConfig["components"])?.projectCard?.showLiveDemoButton ?? DEFAULT_CUSTOMIZATION.components.projectCard.showLiveDemoButton,
        showImage: (raw.components as CustomizationConfig["components"])?.projectCard?.showImage ?? DEFAULT_CUSTOMIZATION.components.projectCard.showImage,
      },
    },
    sectionOrder: Array.isArray(raw.sectionOrder) ? (raw.sectionOrder as string[]) : DEFAULT_CUSTOMIZATION.sectionOrder,
    sectionVisibility: (raw.sectionVisibility as Record<string, boolean>) || DEFAULT_CUSTOMIZATION.sectionVisibility,
  };
}
