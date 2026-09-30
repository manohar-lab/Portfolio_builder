/**
 * PortfolioCraft - Advanced Customization Data Types
 */

export type ThemePresetId = "minimal" | "developer" | "research" | "modern" | "professional";

export type HeadingFontFamily = "Inter" | "Roboto" | "Outfit" | "Playfair Display" | "Fira Code" | "System";
export type BodyFontFamily = "Inter" | "Roboto" | "System";
export type FontSizeScale = "small" | "medium" | "large";

export type LayoutWidth = "compact" | "standard" | "wide";
export type BorderRadiusStyle = "sharp" | "subtle" | "rounded";
export type BackgroundMode = "solid" | "gradient";
export type ColorMode = "light" | "dark" | "system";

export type ButtonStyle = "filled" | "outline" | "text";
export type ProjectLayoutMode = "cards" | "list" | "featured";

export interface ColorCustomization {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
}

export interface TypographyCustomization {
  headingFont: HeadingFontFamily;
  bodyFont: BodyFontFamily;
  fontSize: FontSizeScale;
}

export interface LayoutCustomization {
  width: LayoutWidth;
  borderRadius: BorderRadiusStyle;
  backgroundMode: BackgroundMode;
  colorMode: ColorMode;
}

export interface ProjectCardCustomization {
  showTechTags: boolean;
  showGithubButton: boolean;
  showLiveDemoButton: boolean;
  showImage: boolean;
}

export interface ComponentCustomization {
  buttonStyle: ButtonStyle;
  projectLayout: ProjectLayoutMode;
  projectCard: ProjectCardCustomization;
}

export interface CustomizationConfig {
  preset: ThemePresetId;
  colors: ColorCustomization;
  typography: TypographyCustomization;
  layout: LayoutCustomization;
  components: ComponentCustomization;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
}
