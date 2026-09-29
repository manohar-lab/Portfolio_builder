import { describe, it, expect } from "vitest";
import { parseResumeContent, RESUME_IMPORT_CONFIG } from "../services/resume-parser";
import {
  normalizeSkillName,
  annotateProjectDuplicates,
  annotateEducationDuplicates,
} from "../services/import-merge-service";
import { ImportedProject, ImportedEducation } from "../types/import";
import { DbProject, DbEducation } from "../types/database";

describe("Phase 12 Import System & Auto-Population Tests", () => {
  it("should validate resume upload file size and extension constraints", () => {
    expect(RESUME_IMPORT_CONFIG.MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(RESUME_IMPORT_CONFIG.ALLOWED_EXTENSIONS).toContain(".pdf");
    expect(RESUME_IMPORT_CONFIG.ALLOWED_EXTENSIONS).toContain(".docx");
    expect(RESUME_IMPORT_CONFIG.ALLOWED_EXTENSIONS).toContain(".txt");
  });

  it("should extract profile, skills, education, and experience from resume text", () => {
    const sampleResume = `
      John Doe
      Software Engineer | AI Developer
      john.doe@example.com
      https://github.com/johndoe
      https://linkedin.com/in/johndoe

      SUMMARY
      Experienced full-stack engineer building high performance web apps.

      SKILLS
      JavaScript, TypeScript, Python, React, Next.js, Node.js, PostgreSQL, Docker

      EDUCATION
      Bachelor of Science in Computer Science - Stanford University 2018 - 2022

      EXPERIENCE
      Senior Software Engineer at Acme Tech (2022 - Present)
      Built scalable microservices and real-time dashboard apps.

      PROJECTS
      Project: Portfolio Craft
      Multi-tenant portfolio builder SaaS platform using Next.js and Supabase.
    `;

    const parsed = parseResumeContent(sampleResume, "john_doe_resume.pdf");

    expect(parsed.profile?.full_name).toContain("John Doe");
    expect(parsed.profile?.email).toBe("john.doe@example.com");
    expect(parsed.profile?.github_url).toBe("https://github.com/johndoe");
    expect(parsed.skills.length).toBeGreaterThanOrEqual(5);

    const skillNames = parsed.skills.map((s) => s.name);
    expect(skillNames).toContain("JavaScript");
    expect(skillNames).toContain("TypeScript");
    expect(skillNames).toContain("Python");
    expect(skillNames).toContain("React");

    expect(parsed.education.length).toBeGreaterThan(0);
    expect(parsed.education[0].institution).toContain("Stanford University");

    expect(parsed.projects.length).toBeGreaterThan(0);
    expect(parsed.projects[0].title).toContain("Portfolio Craft");
  });

  it("should normalize tech skill names accurately", () => {
    expect(normalizeSkillName("javascript")).toBe("JavaScript");
    expect(normalizeSkillName("js")).toBe("JavaScript");
    expect(normalizeSkillName("typescript")).toBe("TypeScript");
    expect(normalizeSkillName("react.js")).toBe("React");
    expect(normalizeSkillName("nextjs")).toBe("Next.js");
    expect(normalizeSkillName("postgres")).toBe("PostgreSQL");
  });

  it("should detect project duplicates against existing portfolio projects", () => {
    const existingProjects: Partial<DbProject>[] = [
      {
        id: "ex-1",
        title: "Portfolio Craft",
        github_url: "https://github.com/johndoe/portfolio-craft",
        short_description: "Existing portfolio app",
      },
    ];

    const importedProjects: ImportedProject[] = [
      {
        id: "imp-1",
        title: "Portfolio Craft",
        short_description: "Imported duplicate",
        technologies: ["Next.js"],
        github_url: "https://github.com/johndoe/portfolio-craft",
      },
      {
        id: "imp-2",
        title: "Neural Visualizer",
        short_description: "Brand new project",
        technologies: ["Python"],
        github_url: "https://github.com/johndoe/neural-vis",
      },
    ];

    const annotated = annotateProjectDuplicates(
      existingProjects as DbProject[],
      importedProjects
    );

    expect(annotated[0].duplicate_status).toBe("exact");
    expect(annotated[0].merge_action).toBe("skip");

    expect(annotated[1].duplicate_status).toBe("none");
    expect(annotated[1].merge_action).toBe("create_new");
  });

  it("should detect education duplicates against existing portfolio records", () => {
    const existingEdu: Partial<DbEducation>[] = [
      {
        id: "edu-ex-1",
        institution: "Stanford University",
        degree: "Bachelor of Science",
      },
    ];

    const importedEdu: ImportedEducation[] = [
      {
        id: "edu-imp-1",
        institution: "Stanford University",
        degree: "B.S. Computer Science",
      },
      {
        id: "edu-imp-2",
        institution: "MIT",
        degree: "Master of Science",
      },
    ];

    const annotated = annotateEducationDuplicates(
      existingEdu as DbEducation[],
      importedEdu
    );

    expect(annotated[0].duplicate_status).toBe("potential");
    expect(annotated[0].merge_action).toBe("skip");

    expect(annotated[1].duplicate_status).toBe("none");
    expect(annotated[1].merge_action).toBe("create_new");
  });
});
