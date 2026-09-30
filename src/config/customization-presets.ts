import { CustomizationConfig, ThemePresetId } from "@/types/customization";

export const THEME_PRESETS: Record<ThemePresetId, CustomizationConfig> = {
  minimal: {
    preset: "minimal",
    colors: {
      primary: "#0f172a",
      accent: "#475569",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      mutedText: "#64748b",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      fontSize: "medium",
    },
    layout: {
      width: "standard",
      borderRadius: "subtle",
      backgroundMode: "solid",
      colorMode: "light",
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
    sectionOrder: ["hero", "about", "projects", "skills", "experience", "education", "social_links"],
    sectionVisibility: {
      hero: true,
      about: true,
      projects: true,
      skills: true,
      experience: true,
      education: true,
      social_links: true,
    },
  },

  developer: {
    preset: "developer",
    colors: {
      primary: "#6366f1",
      accent: "#a855f7",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      mutedText: "#94a3b8",
    },
    typography: {
      headingFont: "Fira Code",
      bodyFont: "Inter",
      fontSize: "medium",
    },
    layout: {
      width: "wide",
      borderRadius: "subtle",
      backgroundMode: "solid",
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
    sectionOrder: ["hero", "about", "skills", "projects", "experience", "education", "social_links"],
    sectionVisibility: {
      hero: true,
      about: true,
      skills: true,
      projects: true,
      experience: true,
      education: true,
      social_links: true,
    },
  },

  research: {
    preset: "research",
    colors: {
      primary: "#1e3a8a",
      accent: "#3b82f6",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#1e293b",
      mutedText: "#64748b",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Roboto",
      fontSize: "medium",
    },
    layout: {
      width: "compact",
      borderRadius: "sharp",
      backgroundMode: "solid",
      colorMode: "light",
    },
    components: {
      buttonStyle: "outline",
      projectLayout: "list",
      projectCard: {
        showTechTags: true,
        showGithubButton: true,
        showLiveDemoButton: true,
        showImage: false,
      },
    },
    sectionOrder: ["hero", "about", "research", "projects", "skills", "education", "achievements", "social_links"],
    sectionVisibility: {
      hero: true,
      about: true,
      research: true,
      projects: true,
      skills: true,
      education: true,
      achievements: true,
      social_links: true,
    },
  },

  modern: {
    preset: "modern",
    colors: {
      primary: "#ec4899",
      accent: "#8b5cf6",
      background: "#090d16",
      surface: "#111827",
      text: "#f9fafb",
      mutedText: "#9ca3af",
    },
    typography: {
      headingFont: "Outfit",
      bodyFont: "Inter",
      fontSize: "medium",
    },
    layout: {
      width: "standard",
      borderRadius: "rounded",
      backgroundMode: "gradient",
      colorMode: "dark",
    },
    components: {
      buttonStyle: "filled",
      projectLayout: "featured",
      projectCard: {
        showTechTags: true,
        showGithubButton: true,
        showLiveDemoButton: true,
        showImage: true,
      },
    },
    sectionOrder: ["hero", "about", "projects", "skills", "experience", "education", "social_links"],
    sectionVisibility: {
      hero: true,
      about: true,
      projects: true,
      skills: true,
      experience: true,
      education: true,
      social_links: true,
    },
  },

  professional: {
    preset: "professional",
    colors: {
      primary: "#0f766e",
      accent: "#0d9488",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#134e4a",
      mutedText: "#5eead4",
    },
    typography: {
      headingFont: "Roboto",
      bodyFont: "Roboto",
      fontSize: "medium",
    },
    layout: {
      width: "standard",
      borderRadius: "subtle",
      backgroundMode: "solid",
      colorMode: "light",
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
    sectionOrder: ["hero", "about", "experience", "skills", "education", "projects", "social_links"],
    sectionVisibility: {
      hero: true,
      about: true,
      experience: true,
      skills: true,
      education: true,
      projects: true,
      social_links: true,
    },
  },
};

export const DEFAULT_CUSTOMIZATION: CustomizationConfig = THEME_PRESETS.minimal;
