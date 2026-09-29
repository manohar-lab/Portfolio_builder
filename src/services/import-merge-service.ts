import { createClient } from "@/auth/server";
import { NormalizedImportPayload, ImportedProject, ImportedEducation } from "@/types/import";
import { DbProject, DbEducation } from "@/types/database";

/**
 * Skill Normalization Dictionary
 */
const SKILL_ALIASES: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  react: "React",
  reactjs: "React",
  "react.js": "React",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  py: "Python",
  python: "Python",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  tailwind: "TailwindCSS",
  tailwindcss: "TailwindCSS",
  aws: "AWS",
  "amazon web services": "AWS",
  docker: "Docker",
  git: "Git",
  github: "GitHub",
};

export function normalizeSkillName(name: string): string {
  const clean = name.trim().toLowerCase();
  return SKILL_ALIASES[clean] || name.trim();
}

/**
 * Detect Duplicate Projects against existing portfolio records
 */
export function annotateProjectDuplicates(
  existingProjects: DbProject[],
  importedProjects: ImportedProject[]
): ImportedProject[] {
  return importedProjects.map((imp) => {
    const exactMatch = existingProjects.find((ex) => {
      const matchUrl = imp.github_url && ex.github_url && imp.github_url.toLowerCase() === ex.github_url.toLowerCase();
      const matchTitle = imp.title.toLowerCase() === ex.title.toLowerCase();
      return matchUrl || matchTitle;
    });

    if (exactMatch) {
      return {
        ...imp,
        duplicate_status: "exact",
        existing_project_id: exactMatch.id,
        merge_action: "skip", // Default to safe skip
      };
    }

    const potentialMatch = existingProjects.find((ex) => {
      return ex.title.toLowerCase().includes(imp.title.toLowerCase()) || imp.title.toLowerCase().includes(ex.title.toLowerCase());
    });

    if (potentialMatch) {
      return {
        ...imp,
        duplicate_status: "potential",
        existing_project_id: potentialMatch.id,
        merge_action: "update_existing",
      };
    }

    return {
      ...imp,
      duplicate_status: "none",
      merge_action: "create_new",
    };
  });
}

/**
 * Detect Duplicate Education against existing portfolio records
 */
export function annotateEducationDuplicates(
  existingEdu: DbEducation[],
  importedEdu: ImportedEducation[]
): ImportedEducation[] {
  return importedEdu.map((imp) => {
    const match = existingEdu.find((ex) => {
      return ex.institution.toLowerCase().includes(imp.institution.toLowerCase()) ||
        imp.institution.toLowerCase().includes(ex.institution.toLowerCase());
    });

    if (match) {
      return {
        ...imp,
        duplicate_status: "potential",
        existing_education_id: match.id,
        merge_action: "skip",
      };
    }

    return {
      ...imp,
      duplicate_status: "none",
      merge_action: "create_new",
    };
  });
}

/**
 * Execute Approved Import Merge safely into Supabase Database
 */
export async function executePortfolioImportMerge(
  portfolioId: string,
  userId: string,
  payload: NormalizedImportPayload
): Promise<{ success: boolean; itemsImported: number; error?: string }> {
  const supabase = await createClient();

  // 1. Verify Portfolio Ownership
  const { data: portfolio, error: portError } = await supabase
    .from("portfolios")
    .select("id, user_id, profile_data")
    .eq("id", portfolioId)
    .single();

  if (portError || !portfolio || portfolio.user_id !== userId) {
    return { success: false, itemsImported: 0, error: "Portfolio not found or access denied" };
  }

  let count = 0;

  // 2. Profile Data Merge (if selected)
  if (payload.profile && payload.profile.selected) {
    const currentProfile = (portfolio.profile_data as Record<string, unknown>) || {};
    const updatedProfile = {
      ...currentProfile,
      full_name: payload.profile.full_name || currentProfile.full_name,
      headline: payload.profile.headline || currentProfile.headline,
      bio: payload.profile.bio || currentProfile.bio,
      email: payload.profile.email || currentProfile.email,
      phone: payload.profile.phone || currentProfile.phone,
      location: payload.profile.location || currentProfile.location,
    };

    await supabase
      .from("portfolios")
      .update({ profile_data: updatedProfile, updated_at: new Date().toISOString() })
      .eq("id", portfolioId);

    count += 1;
  }

  // 3. Skills Merge (avoiding duplicates)
  const selectedSkills = payload.skills.filter((s) => s.selected);
  if (selectedSkills.length > 0) {
    // Fetch existing skills section or content
    const { data: skillsSection } = await supabase
      .from("portfolio_sections")
      .select("id, content")
      .eq("portfolio_id", portfolioId)
      .eq("section_type", "skills")
      .single();

    const existingSkillNames: string[] = (skillsSection?.content?.skills as string[]) || [];
    const normalizedSet = new Set(existingSkillNames.map(normalizeSkillName));

    selectedSkills.forEach((s) => {
      const norm = normalizeSkillName(s.name);
      if (!normalizedSet.has(norm)) {
        normalizedSet.add(norm);
        count += 1;
      }
    });

    const updatedSkillList = Array.from(normalizedSet);

    if (skillsSection) {
      await supabase
        .from("portfolio_sections")
        .update({
          content: { ...skillsSection.content, skills: updatedSkillList },
          updated_at: new Date().toISOString(),
        })
        .eq("id", skillsSection.id);
    } else {
      await supabase.from("portfolio_sections").insert({
        portfolio_id: portfolioId,
        section_type: "skills",
        title: "Skills",
        is_visible: true,
        sort_order: 2,
        content: { skills: updatedSkillList },
      });
    }
  }

  // 4. Projects Merge
  const selectedProjects = payload.projects.filter((p) => p.selected && p.merge_action !== "skip");
  for (const proj of selectedProjects) {
    if (proj.merge_action === "create_new") {
      const { error: insertErr } = await supabase.from("projects").insert({
        portfolio_id: portfolioId,
        user_id: userId,
        title: proj.title,
        short_description: proj.short_description,
        detailed_description: proj.detailed_description || proj.short_description,
        technologies: proj.technologies || [],
        github_url: proj.github_url || null,
        live_demo_url: proj.live_demo_url || null,
        is_featured: false,
        sort_order: 10,
      });

      if (!insertErr) count += 1;
    } else if (proj.merge_action === "update_existing" && proj.existing_project_id) {
      await supabase
        .from("projects")
        .update({
          short_description: proj.short_description,
          detailed_description: proj.detailed_description || proj.short_description,
          technologies: proj.technologies,
          github_url: proj.github_url || null,
          live_demo_url: proj.live_demo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proj.existing_project_id)
        .eq("user_id", userId);

      count += 1;
    }
  }

  // 5. Education Merge
  const selectedEducation = payload.education.filter((e) => e.selected && e.merge_action !== "skip");
  for (const edu of selectedEducation) {
    if (edu.merge_action === "create_new") {
      const { error: eduErr } = await supabase.from("education").insert({
        portfolio_id: portfolioId,
        user_id: userId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study || "General Studies",
        start_year: edu.start_year || 2020,
        end_year: edu.end_year || 2024,
        is_current_status: false,
        cgpa: edu.cgpa || null,
        description: edu.description || null,
        sort_order: 10,
      });

      if (!eduErr) count += 1;
    }
  }

  // 6. Record Import History
  await supabase.from("import_history").insert({
    user_id: userId,
    portfolio_id: portfolioId,
    source: payload.source,
    status: "completed",
    items_imported_count: count,
    metadata: {
      raw_file_name: payload.raw_file_name || null,
      skills_count: selectedSkills.length,
      projects_count: selectedProjects.length,
    },
  });

  return { success: true, itemsImported: count };
}
