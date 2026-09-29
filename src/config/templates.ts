import { TemplateMetadata } from "../types/template";

export const AVAILABLE_TEMPLATES: TemplateMetadata[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "A clean, typography-focused layout ideal for crisp readability and modern simplicity.",
    category: "minimal",
    thumbnailUrl: "/templates/minimal-preview.png",
    isAvailable: true,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Designed for software engineers, showcasing tech stack, GitHub projects, and live demos.",
    category: "developer",
    thumbnailUrl: "/templates/developer-preview.png",
    isAvailable: true,
  },
  {
    id: "research",
    name: "Research",
    description: "Structured layout highlighting academic publications, methodology, papers, and datasets.",
    category: "research",
    thumbnailUrl: "/templates/research-preview.png",
    isAvailable: true,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Visual-forward design crafted for designers, artists, and media professionals.",
    category: "creative",
    thumbnailUrl: "/templates/creative-preview.png",
    isAvailable: false,
  },
  {
    id: "student",
    name: "Student",
    description: "Emphasizes education, semester-wise academic progress, coursework, and projects.",
    category: "student",
    thumbnailUrl: "/templates/student-preview.png",
    isAvailable: false,
  },
  {
    id: "ai_tech",
    name: "AI / Technology",
    description: "Futuristic dark theme tailored for AI/ML engineers, data scientists, and researchers.",
    category: "ai_tech",
    thumbnailUrl: "/templates/aitech-preview.png",
    isAvailable: false,
  },
];
