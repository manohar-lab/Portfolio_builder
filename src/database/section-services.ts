import { createClient } from "@/auth/server";
import { requireAuth } from "@/auth/service";
import {
  ProjectItem,
  EducationItem,
  AcademicSemesterItem,
  SkillItem,
  ExperienceItem,
  ResearchItem,
  AchievementItem,
  CertificationItem,
  SocialLink,
  UserProfile,
} from "@/types/portfolio";

/**
 * Helper to verify that the target portfolio is owned by the current authenticated session.
 */
async function verifyPortfolioOwnership(portfolioId: string): Promise<{ authorized: boolean; userId: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const { data } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("user_id", internalUserId)
    .maybeSingle();

  return { authorized: !!data, userId: internalUserId };
}

/* =========================================================
 * 1. PROFILE SERVICES
 * ========================================================= */
export async function updateProfile(profileData: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: internalUserId,
      full_name: profileData.fullName,
      headline: profileData.headline,
      bio: profileData.bio,
      avatar_url: profileData.avatarUrl,
      location: profileData.location,
      email: profileData.email,
      phone: profileData.phone,
      is_available_for_work: profileData.isAvailableForWork,
      resume_url: profileData.resumeUrl,
    },
    { onConflict: "user_id" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
 * 2. PROJECT CRUD SERVICES
 * ========================================================= */
export async function saveProject(portfolioId: string, project: ProjectItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    title: project.title,
    short_description: project.shortDescription,
    detailed_description: project.detailedDescription || "",
    problem_statement: project.problemStatement || "",
    solution_approach: project.solutionApproach || "",
    technologies: project.technologies || [],
    image_url: project.imageUrl || "",
    github_url: project.githubUrl || "",
    live_demo_url: project.liveDemoUrl || "",
    paper_url: project.paperUrl || "",
    is_current: project.status === "IN_PROGRESS" || project.isCurrent,
    is_featured: project.isFeatured,
    sort_order: project.sortOrder || 0,
  };

  if (project.id) {
    const { error } = await supabase.from("projects").update(payload).eq("id", project.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("projects").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProject(portfolioId: string, projectId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
 * 3. EDUCATION & ACADEMIC JOURNEY SERVICES
 * ========================================================= */
export async function saveEducation(portfolioId: string, edu: EducationItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    institution: edu.institution,
    degree: edu.degree,
    field_of_study: edu.fieldOfStudy,
    start_year: edu.startYear,
    end_year: edu.endYear || null,
    is_current_status: edu.isCurrentStatus,
    cgpa: edu.cgpa ? String(edu.cgpa) : null,
    max_cgpa: edu.maxCgpa ? String(edu.maxCgpa) : "4.0",
    description: edu.description || "",
    sort_order: edu.sortOrder || 0,
  };

  if (edu.id) {
    const { error } = await supabase.from("education").update(payload).eq("id", edu.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("education").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteEducation(portfolioId: string, eduId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("education").delete().eq("id", eduId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function saveAcademicSemester(portfolioId: string, sem: AcademicSemesterItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    education_id: sem.educationId || "00000000-0000-0000-0000-000000000000",
    portfolio_id: portfolioId,
    user_id: userId,
    semester_number: sem.semesterNumber,
    cgpa: sem.cgpa ? String(sem.cgpa) : null,
    subjects: sem.subjects || [],
    projects: sem.projects || [],
    achievements: sem.achievements || [],
  };

  if (sem.id) {
    const { error } = await supabase.from("academic_semesters").update(payload).eq("id", sem.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("academic_semesters").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

/* =========================================================
 * 4. SKILLS SERVICES
 * ========================================================= */
export async function saveSkill(portfolioId: string, skill: SkillItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency || "intermediate",
    icon_name: skill.iconName || "",
    sort_order: skill.sortOrder || 0,
  };

  if (skill.id) {
    const { error } = await supabase.from("skills").update(payload).eq("id", skill.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("skills").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteSkill(portfolioId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("skills").delete().eq("id", skillId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
 * 5. EXPERIENCE SERVICES
 * ========================================================= */
export async function saveExperience(portfolioId: string, exp: ExperienceItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    company: exp.company,
    role: exp.role,
    location: exp.location || "",
    start_date: exp.startDate,
    end_date: exp.endDate || null,
    is_current: exp.isCurrent,
    description: exp.description,
    technologies: exp.technologies || [],
    sort_order: exp.sortOrder || 0,
  };

  if (exp.id) {
    const { error } = await supabase.from("experience").update(payload).eq("id", exp.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("experience").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteExperience(portfolioId: string, expId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("experience").delete().eq("id", expId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
 * 6. RESEARCH SERVICES
 * ========================================================= */
export async function saveResearch(portfolioId: string, res: ResearchItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    title: res.title,
    description: res.description,
    research_area: res.researchArea,
    methodology: res.methodology || "",
    dataset: res.dataset || "",
    technologies: res.technologies || [],
    paper_url: res.paperUrl || "",
    github_url: res.githubUrl || "",
    publication_status: res.publicationStatus,
    publication_date: res.publicationDate || null,
    venue: res.venue || "",
    sort_order: res.sortOrder || 0,
  };

  if (res.id) {
    const { error } = await supabase.from("research").update(payload).eq("id", res.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("research").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteResearch(portfolioId: string, resId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("research").delete().eq("id", resId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
 * 7. ACHIEVEMENTS & CERTIFICATIONS SERVICES
 * ========================================================= */
export async function saveAchievement(portfolioId: string, ach: AchievementItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    title: ach.title,
    issuer: ach.issuer,
    date: ach.date || null,
    description: ach.description || "",
    url: ach.url || "",
    sort_order: ach.sortOrder || 0,
  };

  if (ach.id) {
    const { error } = await supabase.from("achievements").update(payload).eq("id", ach.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("achievements").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteAchievement(portfolioId: string, achId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("achievements").delete().eq("id", achId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function saveCertification(portfolioId: string, cert: CertificationItem): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    name: cert.name,
    issuing_organization: cert.issuingOrganization,
    issue_date: cert.issueDate || null,
    expiry_date: cert.expiryDate || null,
    credential_id: cert.credentialId || "",
    credential_url: cert.credentialUrl || "",
    sort_order: cert.sortOrder || 0,
  };

  if (cert.id) {
    const { error } = await supabase.from("certifications").update(payload).eq("id", cert.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("certifications").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCertification(portfolioId: string, certId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("certifications").delete().eq("id", certId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
 * 8. SOCIAL LINKS SERVICES
 * ========================================================= */
export async function saveSocialLink(portfolioId: string, link: SocialLink): Promise<{ success: boolean; error?: string }> {
  const { authorized, userId } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const payload = {
    portfolio_id: portfolioId,
    user_id: userId,
    platform: link.platform,
    url: link.url,
    label: link.label || "",
    sort_order: link.sortOrder || 0,
  };

  if (link.id) {
    const { error } = await supabase.from("social_links").update(payload).eq("id", link.id).eq("portfolio_id", portfolioId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("social_links").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteSocialLink(portfolioId: string, linkId: string): Promise<{ success: boolean; error?: string }> {
  const { authorized } = await verifyPortfolioOwnership(portfolioId);
  if (!authorized) return { success: false, error: "Unauthorized portfolio access." };

  const supabase = await createClient();
  const { error } = await supabase.from("social_links").delete().eq("id", linkId).eq("portfolio_id", portfolioId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
