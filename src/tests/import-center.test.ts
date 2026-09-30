import { describe, it, expect } from "vitest";
import { parseResumeContent } from "@/services/resume-parser";
import {
  annotateProjectDuplicates,
  annotateEducationDuplicates,
  detectProfileFieldConflicts,
  buildManualImportPayload,
} from "@/services/import-merge-service";
import { DbProject, DbEducation } from "@/types/database";

describe("Phase 22: Unified User-Controlled Profile Import Center", () => {
  it("1. Resume parser extracts structured fields accurately from text", () => {
    const rawText = `
      John Doe
      Senior Software Architect
      Email: john@example.com
      Skills: TypeScript, React, Rust, PostgreSQL, Docker
      Experience:
      Senior Architect at TechCorp (2020 - Present)
      Designed distributed cloud systems.
      Education:
      BS Computer Science, Stanford University (2016 - 2020)
      Projects:
      HyperMesh: High performance KV store built in Rust
    `;

    const parsed = parseResumeContent(rawText, "john_resume.pdf");

    expect(parsed.source).toBe("resume");
    expect(parsed.profile?.full_name).toContain("John");
    expect(parsed.skills.length).toBeGreaterThan(0);
    expect(parsed.projects.length).toBeGreaterThan(0);
  });

  it("2. Annotates exact and potential duplicate projects accurately", () => {
    const existingProjects = [
      {
        id: "p-existing-1",
        portfolio_id: "port-1",
        user_id: "u-1",
        title: "HyperMesh",
        short_description: "Existing KV store",
        detailed_description: "",
        technologies: ["Rust"],
        github_url: "https://github.com/john/hypermesh",
        live_demo_url: null,
        is_featured: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as DbProject[];

    const importedProjects = [
      {
        id: "imp-1",
        title: "HyperMesh",
        short_description: "New Rust KV store description",
        technologies: ["Rust", "Tokio"],
        github_url: "https://github.com/john/hypermesh",
        selected: true,
      },
      {
        id: "imp-2",
        title: "Brand New Engine",
        short_description: "Unrelated project",
        technologies: ["Go"],
        selected: true,
      },
    ];

    const annotated = annotateProjectDuplicates(existingProjects, importedProjects);

    expect(annotated[0].duplicate_status).toBe("exact");
    expect(annotated[0].existing_project_id).toBe("p-existing-1");
    expect(annotated[0].merge_action).toBe("skip");

    expect(annotated[1].duplicate_status).toBe("none");
    expect(annotated[1].merge_action).toBe("create_new");
  });

  it("3. Detects profile field conflicts between current and imported profiles", () => {
    const existing = {
      full_name: "John Doe",
      headline: "Software Engineer Student",
      bio: "Learning computer science.",
    };

    const imported = {
      full_name: "John Doe",
      headline: "Senior Distributed Systems Engineer",
      bio: "Building resilient microservices.",
    };

    const conflicts = detectProfileFieldConflicts(existing, imported);

    expect(conflicts.length).toBe(2);
    expect(conflicts.some((c) => c.field === "headline")).toBe(true);
    expect(conflicts.some((c) => c.field === "bio")).toBe(true);
  });

  it("4. Builds manual import payload cleanly without external dependencies", () => {
    const manualPayload = buildManualImportPayload({
      fullName: "Alex Rivera",
      headline: "Full Stack Engineer",
      bio: "Crafting web applications",
      skills: ["React", "TypeScript", "Node.js"],
      projects: [{ title: "Dev Tool", description: "Useful CLI", tech: ["Node.js"] }],
    });

    expect(manualPayload.source).toBe("manual");
    expect(manualPayload.profile?.full_name).toBe("Alex Rivera");
    expect(manualPayload.skills.length).toBe(3);
    expect(manualPayload.projects.length).toBe(1);
    expect(manualPayload.projects[0].merge_action).toBe("create_new");
  });

  it("5. Annotates education duplicates properly", () => {
    const existingEdu = [
      {
        id: "edu-1",
        portfolio_id: "port-1",
        user_id: "u-1",
        institution: "Stanford University",
        degree: "BS Computer Science",
        field_of_study: "CS",
        start_year: 2016,
        end_year: 2020,
        is_current_status: false,
        cgpa: "3.9",
        description: null,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as DbEducation[];

    const importedEdu = [
      {
        id: "imp-edu-1",
        institution: "Stanford University",
        degree: "B.S. CS",
        selected: true,
      },
    ];

    const annotated = annotateEducationDuplicates(existingEdu, importedEdu);

    expect(annotated[0].duplicate_status).toBe("potential");
    expect(annotated[0].existing_education_id).toBe("edu-1");
  });
});
