import { PortfolioData } from "../types/portfolio";
import { DEFAULT_PORTFOLIO_SECTIONS } from "../config/constants";

/**
 * Ensures any partial or incoming raw portfolio payload is normalized
 * into a complete, type-safe PortfolioData domain model.
 */
export function normalizePortfolioData(raw: Partial<PortfolioData>): PortfolioData {
  const sections = (raw.sections && raw.sections.length > 0)
    ? raw.sections.sort((a, b) => a.order - b.order)
    : DEFAULT_PORTFOLIO_SECTIONS;

  return {
    id: raw.id || "demo-portfolio-id",
    userId: raw.userId || "demo-user-id",
    slug: raw.slug || "johndoe",
    title: raw.title || "John Doe Portfolio",
    description: raw.description || "",
    status: raw.status || (raw.isPublished ? "PUBLISHED" : "DRAFT"),
    templateId: raw.templateId || "developer",
    isPublished: raw.isPublished ?? true,
    isPublic: raw.isPublic ?? true,
    profile: {
      fullName: raw.profile?.fullName || "Jane Doe",
      headline: raw.profile?.headline || "Senior Full Stack Engineer & Open Source Contributor",
      bio: raw.profile?.bio || "Passionate about building scalable web platforms, high-performance distributed systems, and accessible user experiences.",
      avatarUrl: raw.profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      location: raw.profile?.location || "San Francisco, CA",
      email: raw.profile?.email || "jane.doe@example.com",
      phone: raw.profile?.phone || "+1 (555) 019-2834",
      isAvailableForWork: raw.profile?.isAvailableForWork ?? true,
      resumeUrl: raw.profile?.resumeUrl || "https://example.com/resume.pdf",
    },
    sections,
    socialLinks: raw.socialLinks || [
      { id: "s-1", platform: "github", url: "https://github.com", label: "GitHub" },
      { id: "s-2", platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
      { id: "s-3", platform: "twitter", url: "https://x.com", label: "Twitter" },
    ],
    skills: raw.skills || [
      { id: "sk-1", name: "TypeScript", category: "languages", proficiency: "expert" },
      { id: "sk-2", name: "React / Next.js", category: "frontend", proficiency: "expert" },
      { id: "sk-3", name: "Node.js", category: "backend", proficiency: "advanced" },
      { id: "sk-4", name: "PostgreSQL", category: "backend", proficiency: "advanced" },
      { id: "sk-5", name: "Tailwind CSS", category: "frontend", proficiency: "expert" },
      { id: "sk-6", name: "PyTorch / ML", category: "ai_ml", proficiency: "intermediate" },
    ],
    projects: raw.projects || [
      {
        id: "p-1",
        title: "OmniStore E-Commerce Platform",
        shortDescription: "High-throughput microservices-based e-commerce suite with real-time inventory tracking.",
        detailedDescription: "Architected end-to-end e-commerce platform processing 10k requests/sec using Next.js, Redis, and PostgreSQL.",
        problemStatement: "Legacy monolithic platform suffered frequent downtime during peak flash sales.",
        solutionApproach: "Decoupled frontend onto Vercel edge networks and implemented event-driven inventory sync.",
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Tailwind CSS"],
        imageUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800",
        githubUrl: "https://github.com/example/omnistore",
        liveDemoUrl: "https://omnistore-demo.example.com",
        status: "COMPLETED",
        isCurrent: false,
        isFeatured: true,
      },
      {
        id: "p-2",
        title: "NeuroVision AI Classifier",
        shortDescription: "Deep learning computer vision platform for real-time medical scan anomaly detection.",
        detailedDescription: "Trained custom ResNet and ViT architectures on anonymized radiology datasets.",
        problemStatement: "Manual triage of medical scans resulted in diagnostic bottlenecks in rural emergency clinics.",
        solutionApproach: "Deployed lightweight ONNX runtime model to edge devices for instant pre-screening.",
        technologies: ["Python", "PyTorch", "FastAPI", "Docker", "React"],
        imageUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800",
        githubUrl: "https://github.com/example/neurovision",
        paperUrl: "https://arxiv.org/abs/2300.00000",
        status: "IN_PROGRESS",
        isCurrent: true,
        isFeatured: true,
      },
    ],
    education: raw.education || [
      {
        id: "ed-1",
        institution: "Stanford University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        startYear: 2020,
        endYear: 2024,
        isCurrentStatus: false,
        cgpa: "3.92",
        maxCgpa: "4.0",
        description: "Specialized in Artificial Intelligence and Distributed Systems. Graduated with Honors.",
      },
    ],
    academicJourney: raw.academicJourney || [
      {
        id: "sem-1",
        semesterNumber: 1,
        cgpa: "3.90",
        subjects: ["Data Structures & Algorithms", "Linear Algebra", "Intro to CS"],
        projects: ["Binary Tree Visualizer"],
        achievements: ["Dean's Honor List"],
      },
      {
        id: "sem-2",
        semesterNumber: 2,
        cgpa: "3.95",
        subjects: ["Operating Systems", "Discrete Mathematics", "Probability"],
        projects: ["Mini Kernel OS Scheduler"],
        achievements: ["Hackathon 1st Place"],
      },
    ],
    experience: raw.experience || [
      {
        id: "exp-1",
        company: "Vercel / Tech Corp",
        role: "Senior Software Engineer",
        location: "Remote",
        startDate: "2024-06",
        isCurrent: true,
        description: "Leading frontend core infrastructure, improving bundle loading times by 35% across client projects.",
        technologies: ["TypeScript", "Next.js", "Rust", "WebAssembly"],
      },
    ],
    research: raw.research || [
      {
        id: "res-1",
        title: "Efficient Quantization of Large Vision-Language Models",
        description: "Investigating 4-bit INT quantization techniques on multimodal LLMs without accuracy degradation.",
        researchArea: "Artificial Intelligence / ML",
        methodology: "Post-training quantization with Hessian-aware metric calibration.",
        dataset: "LAION-5B & MS-COCO",
        technologies: ["PyTorch", "CUDA", "Python"],
        paperUrl: "https://arxiv.org/abs/example",
        publicationStatus: "published",
        publicationDate: "2025-02-15",
        venue: "ICLR 2025",
      },
    ],
    achievements: raw.achievements || [],
    certifications: raw.certifications || [],
    publications: raw.publications || [],
    services: raw.services || [],
    contact: raw.contact || {
      email: raw.profile?.email || "jane.doe@example.com",
      phone: raw.profile?.phone || "+1 (555) 019-2834",
      location: raw.profile?.location || "San Francisco, CA",
      customNote: "Available for technical consulting, speaking, and full-time opportunities.",
    },
    theme: {
      mode: raw.theme?.mode || "system",
      primaryColor: raw.theme?.primaryColor || "#3b82f6",
      fontFamily: raw.theme?.fontFamily || "sans",
      borderRadius: raw.theme?.borderRadius || "md",
      animationLevel: raw.theme?.animationLevel || "subtle",
      layoutSpacing: raw.theme?.layoutSpacing || "comfortable",
    },
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}
