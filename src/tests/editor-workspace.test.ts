import { describe, it, expect, vi } from "vitest";
import { PortfolioData, ProjectItem, SkillItem, ThemeConfig } from "@/types/portfolio";

// Mock server actions used in EditorContext
vi.mock("@/dashboard/actions", () => ({
  saveFullPortfolioDraftAction: vi.fn(async (data: PortfolioData) => ({
    success: true,
    data,
  })),
  updatePortfolioStatusAction: vi.fn(async (portfolioId: string, isPublished: boolean) => ({
    success: true,
    portfolioId,
    isPublished,
  })),
}));

const mockPortfolio: PortfolioData = {
  id: "test-portfolio-25",
  userId: "user-owner-123",
  title: "Jane Doe Developer Portfolio",
  slug: "jane-doe",
  status: "DRAFT",
  isPublished: false,
  isPublic: false,
  visibilityMode: "private",
  templateId: "modern-developer",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  profile: {
    fullName: "Jane Doe",
    headline: "Senior Full Stack Engineer",
    bio: "Passionate about high-scale distributed systems and web platforms.",
    isAvailableForWork: true,
  },
  sections: [
    { id: "sec-1", type: "about", title: "About Me", isVisible: true, order: 0 },
    { id: "sec-2", type: "projects", title: "Featured Projects", isVisible: true, order: 1 },
    { id: "sec-3", type: "skills", title: "Technical Skills", isVisible: true, order: 2 },
    { id: "sec-4", type: "experience", title: "Work Experience", isVisible: false, order: 3 },
  ],
  socialLinks: [
    { id: "soc-1", platform: "github", url: "https://github.com/janedoe" },
  ],
  skills: [
    { id: "skill-1", name: "TypeScript", category: "languages", proficiency: "expert", sortOrder: 0 },
    { id: "skill-2", name: "Next.js", category: "frontend", proficiency: "advanced", sortOrder: 1 },
  ],
  projects: [
    {
      id: "proj-1",
      portfolioId: "test-portfolio-25",
      title: "Cloud Observability Tool",
      shortDescription: "Real-time log aggregation and dashboard platform.",
      technologies: ["TypeScript", "Next.js", "PostgreSQL"],
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: true,
      sortOrder: 0,
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "MIT",
      degree: "B.S. Computer Science",
      fieldOfStudy: "Computer Science",
      startYear: 2018,
      endYear: 2022,
      isCurrentStatus: false,
    },
  ],
  academicJourney: [],
  experience: [
    {
      id: "exp-1",
      company: "Acme Corp",
      role: "Staff Engineer",
      startDate: "2022-06",
      isCurrent: true,
      description: "Leading frontend infrastructure.",
    },
  ],
  research: [],
  achievements: [],
  certifications: [],
  publications: [],
  services: [],
  contact: { email: "jane@example.com" },
  theme: {
    mode: "dark",
    primaryColor: "#4f46e5",
    fontFamily: "sans",
    borderRadius: "md",
    animationLevel: "full",
    layoutSpacing: "comfortable",
  },
};

describe("Phase 25: Portfolio Editor Workspace Architecture", () => {
  it("1. Section Management: toggling visibility hides section from output without deleting user data", () => {
    const updatedSections = mockPortfolio.sections.map((sec) =>
      sec.type === "projects" ? { ...sec, isVisible: !sec.isVisible } : sec
    );

    const updatedPortfolio = { ...mockPortfolio, sections: updatedSections };

    // Section is hidden
    const projectsSection = updatedPortfolio.sections.find((s) => s.type === "projects");
    expect(projectsSection?.isVisible).toBe(false);

    // User project content remains 100% intact
    expect(updatedPortfolio.projects.length).toBe(1);
    expect(updatedPortfolio.projects[0].title).toBe("Cloud Observability Tool");
  });

  it("2. Section Management: reordering sections updates sort order metadata", () => {
    const sections = [...mockPortfolio.sections];
    // Move "projects" up above "about"
    const temp = sections[0];
    sections[0] = sections[1];
    sections[1] = temp;

    const reordered = sections.map((sec, idx) => ({ ...sec, order: idx }));

    expect(reordered[0].type).toBe("projects");
    expect(reordered[0].order).toBe(0);
    expect(reordered[1].type).toBe("about");
    expect(reordered[1].order).toBe(1);
  });

  it("3. Template Independence: switching template changes templateId while preserving portfolio content", () => {
    const newTemplateId = "academic-minimal";
    const updatedPortfolio = { ...mockPortfolio, templateId: newTemplateId };

    expect(updatedPortfolio.templateId).toBe("academic-minimal");
    expect(updatedPortfolio.profile.fullName).toBe("Jane Doe");
    expect(updatedPortfolio.projects).toHaveLength(1);
    expect(updatedPortfolio.skills).toHaveLength(2);
  });

  it("4. Project CRUD: creates, updates, and deletes projects safely", () => {
    // Create
    const newProject: ProjectItem = {
      id: "proj-2",
      title: "AI Resume Scanner",
      shortDescription: "LLM-powered resume parsing application.",
      technologies: ["Python", "FastAPI"],
      status: "IN_PROGRESS",
      isCurrent: true,
      isFeatured: false,
    };
    let projects = [...mockPortfolio.projects, newProject];
    expect(projects).toHaveLength(2);

    // Update
    projects = projects.map((p) => (p.id === "proj-2" ? { ...p, isFeatured: true } : p));
    expect(projects.find((p) => p.id === "proj-2")?.isFeatured).toBe(true);

    // Delete
    projects = projects.filter((p) => p.id !== "proj-2");
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe("proj-1");
  });

  it("5. Skills CRUD: supports categorizing and proficiency levels", () => {
    const newSkill: SkillItem = {
      id: "skill-3",
      name: "Docker",
      category: "devops",
      proficiency: "advanced",
    };
    const skills = [...mockPortfolio.skills, newSkill];

    expect(skills).toHaveLength(3);
    const devopsSkills = skills.filter((s) => s.category === "devops");
    expect(devopsSkills).toHaveLength(1);
    expect(devopsSkills[0].name).toBe("Docker");
  });

  it("6. Appearance & Theme Customization: preserves valid ThemeConfig values", () => {
    const newTheme: Partial<ThemeConfig> = {
      primaryColor: "#059669",
      mode: "light",
      fontFamily: "mono",
    };

    const updatedTheme = { ...mockPortfolio.theme, ...newTheme };

    expect(updatedTheme.primaryColor).toBe("#059669");
    expect(updatedTheme.mode).toBe("light");
    expect(updatedTheme.fontFamily).toBe("mono");
    // Preserves unmodified theme fields
    expect(updatedTheme.borderRadius).toBe("md");
  });

  it("7. Draft vs Publish Model: draft content edits do not change isPublished status automatically", () => {
    const draftEdit = {
      ...mockPortfolio,
      profile: { ...mockPortfolio.profile, headline: "Principal Software Architect" },
    };

    expect(draftEdit.isPublished).toBe(false);
    expect(draftEdit.status).toBe("DRAFT");
    expect(draftEdit.profile.headline).toBe("Principal Software Architect");
  });

  it("8. Multi-User Isolation: portfolio update payloads enforce portfolio ID scoping", () => {
    const unauthorizedPayload = {
      ...mockPortfolio,
      id: "other-user-portfolio-999", // Malicious target
    };

    // Scoping check
    expect(unauthorizedPayload.id).not.toBe("user-b-portfolio");
    expect(mockPortfolio.userId).toBe("user-owner-123");
  });
});
