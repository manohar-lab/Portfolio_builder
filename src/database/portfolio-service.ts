import { createClient } from "@/auth/server";
import { requireAuth } from "@/auth/service";
import { PortfolioMeta, PortfolioData, SectionType, SkillItem, ResearchItem } from "@/types/portfolio";
import { isValidSlug, isReservedSlug } from "@/utilities/slug";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";
import { DEFAULT_PORTFOLIO_SECTIONS } from "@/config/constants";

/**
 * Checks if a requested portfolio slug is available in the database.
 */
export async function checkSlugAvailability(slug: string, excludePortfolioId?: string): Promise<{ available: boolean; reason?: string }> {
  const slugValidation = isValidSlug(slug);
  if (!slugValidation.valid) {
    return { available: false, reason: slugValidation.reason };
  }

  const supabase = await createClient();
  let query = supabase.from("portfolios").select("id").eq("slug", slug.toLowerCase().trim());
  
  if (excludePortfolioId) {
    query = query.neq("id", excludePortfolioId);
  }

  const { data } = await query.maybeSingle();

  if (data) {
    return { available: false, reason: `The slug "${slug}" is already taken by another portfolio.` };
  }

  return { available: true };
}

/**
 * Fetches all portfolios owned by the authenticated session user.
 */
export async function getUserPortfolios(): Promise<PortfolioMeta[]> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.internalUser?.id || user.authUser.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching user portfolios:", error.message);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    slug: p.slug,
    description: p.description || "",
    status: p.is_published ? "PUBLISHED" : "DRAFT",
    isPublished: p.is_published,
    isPublic: p.is_public,
    templateId: p.template_id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

/**
 * Retrieves a single portfolio by ID only if owned by authenticated user.
 */
export async function getPortfolioById(portfolioId: string): Promise<PortfolioMeta | null> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .eq("user_id", user.internalUser?.id || user.authUser.id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    slug: data.slug,
    description: data.description || "",
    status: data.is_published ? "PUBLISHED" : "DRAFT",
    isPublished: data.is_published,
    isPublic: data.is_public,
    templateId: data.template_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Creates a new portfolio entity for the authenticated session user.
 */
export async function createPortfolio(payload: { title: string; slug: string; templateId?: string; description?: string }): Promise<{ success: boolean; portfolio?: PortfolioMeta; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const availability = await checkSlugAvailability(payload.slug);
  if (!availability.available) {
    return { success: false, error: availability.reason || "Slug is unavailable." };
  }

  const { data: newPortfolio, error } = await supabase
    .from("portfolios")
    .insert({
      user_id: internalUserId,
      title: payload.title,
      slug: payload.slug.toLowerCase().trim(),
      template_id: payload.templateId || "developer",
      is_published: false, // Starts as DRAFT
      is_public: true,
    })
    .select()
    .single();

  if (error || !newPortfolio) {
    console.error("Error creating portfolio:", error?.message);
    return { success: false, error: error?.message || "Failed to create portfolio." };
  }

  // Provision default portfolio sections
  const defaultSections = DEFAULT_PORTFOLIO_SECTIONS.map((sec) => ({
    portfolio_id: newPortfolio.id,
    user_id: internalUserId,
    section_type: sec.type,
    title: sec.title,
    is_visible: sec.isVisible,
    sort_order: sec.order,
  }));

  await supabase.from("portfolio_sections").insert(defaultSections);

  return {
    success: true,
    portfolio: {
      id: newPortfolio.id,
      userId: newPortfolio.user_id,
      title: newPortfolio.title,
      slug: newPortfolio.slug,
      description: payload.description || "",
      status: "DRAFT",
      isPublished: false,
      isPublic: true,
      templateId: newPortfolio.template_id,
      createdAt: newPortfolio.created_at,
      updatedAt: newPortfolio.updated_at,
    },
  };
}

/**
 * Updates portfolio metadata (Status, Template, Title, Slug) safely with owner verification.
 */
export async function updatePortfolioMeta(portfolioId: string, updates: Partial<PortfolioMeta>): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  if (updates.slug) {
    const check = await checkSlugAvailability(updates.slug, portfolioId);
    if (!check.available) {
      return { success: false, error: check.reason };
    }
  }

  const payloadToUpdate: Record<string, unknown> = {};
  if (updates.title !== undefined) payloadToUpdate.title = updates.title;
  if (updates.slug !== undefined) payloadToUpdate.slug = updates.slug.toLowerCase().trim();
  if (updates.templateId !== undefined) payloadToUpdate.template_id = updates.templateId;
  if (updates.isPublished !== undefined) payloadToUpdate.is_published = updates.isPublished;

  const { error } = await supabase
    .from("portfolios")
    .update(payloadToUpdate)
    .eq("id", portfolioId)
    .eq("user_id", internalUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Fail-safe analytics event tracking
  if (updates.isPublished !== undefined) {
    try {
      const { trackAnalyticsEvent } = await import("@/services/analytics-service");
      const eventName = updates.isPublished ? "portfolio_published" : "portfolio_unpublished";
      await trackAnalyticsEvent(eventName, { userId: internalUserId, portfolioId });
    } catch {
      // Fail-safe swallow
    }
  }

  return { success: true };
}

/**
 * Deletes a portfolio entity owned by authenticated user.
 */
export async function deletePortfolio(portfolioId: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", portfolioId)
    .eq("user_id", internalUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Hydrates complete portfolio data (profile, projects, education, skills, research, etc.) for dashboard editing.
 */
export async function getPortfolioFullData(portfolioId: string): Promise<PortfolioData | null> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  // 1. Fetch Portfolio Meta
  const { data: p } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .eq("user_id", internalUserId)
    .single();

  if (!p) return null;

  // 2. Fetch User Profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", internalUserId).maybeSingle();

  // 3. Fetch Sections
  const { data: sections } = await supabase.from("portfolio_sections").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 4. Fetch Projects
  const { data: projects } = await supabase.from("projects").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 5. Fetch Education
  const { data: education } = await supabase.from("education").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 6. Fetch Skills
  const { data: skills } = await supabase.from("skills").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 7. Fetch Experience
  const { data: experience } = await supabase.from("experience").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 8. Fetch Research
  const { data: research } = await supabase.from("research").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 9. Fetch Achievements
  const { data: achievements } = await supabase.from("achievements").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 10. Fetch Certifications
  const { data: certifications } = await supabase.from("certifications").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  // 11. Fetch Social Links
  const { data: socialLinks } = await supabase.from("social_links").select("*").eq("portfolio_id", portfolioId).order("sort_order");

  return normalizePortfolioData({
    id: p.id,
    userId: p.user_id,
    slug: p.slug,
    title: p.title,
    templateId: p.template_id,
    isPublished: p.is_published,
    isPublic: p.is_public,
    profile: profile ? {
      fullName: profile.full_name,
      headline: profile.headline || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatar_url || "",
      location: profile.location || "",
      email: profile.email || "",
      phone: profile.phone || "",
      isAvailableForWork: profile.is_available_for_work ?? true,
      resumeUrl: profile.resume_url || "",
    } : undefined,
    sections: sections?.map((s) => ({
      id: s.id,
      type: s.section_type as SectionType,
      title: s.title,
      isVisible: s.is_visible,
      order: s.sort_order,
    })),
    projects: projects?.map((pr) => ({
      id: pr.id,
      title: pr.title,
      shortDescription: pr.short_description,
      detailedDescription: pr.detailed_description || "",
      problemStatement: pr.problem_statement || "",
      solutionApproach: pr.solution_approach || "",
      technologies: pr.technologies || [],
      imageUrl: pr.image_url || "",
      githubUrl: pr.github_url || "",
      liveDemoUrl: pr.live_demo_url || "",
      paperUrl: pr.paper_url || "",
      startDate: pr.start_date || "",
      endDate: pr.end_date || "",
      status: pr.is_current ? "IN_PROGRESS" : "COMPLETED",
      isCurrent: pr.is_current,
      isFeatured: pr.is_featured,
      sortOrder: pr.sort_order,
    })),
    education: education?.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.field_of_study,
      startYear: e.start_year,
      endYear: e.end_year,
      isCurrentStatus: e.is_current_status,
      cgpa: e.cgpa || "",
      maxCgpa: e.max_cgpa || "4.0",
      description: e.description || "",
      sortOrder: e.sort_order,
    })),
    skills: skills?.map((sk) => ({
      id: sk.id,
      name: sk.name,
      category: sk.category as SkillItem["category"],
      proficiency: sk.proficiency as SkillItem["proficiency"],
      iconName: sk.icon_name || "",
      sortOrder: sk.sort_order,
    })),
    experience: experience?.map((ex) => ({
      id: ex.id,
      company: ex.company,
      role: ex.role,
      location: ex.location || "",
      startDate: ex.start_date,
      endDate: ex.end_date || "",
      isCurrent: ex.is_current,
      description: ex.description,
      technologies: ex.technologies || [],
      sortOrder: ex.sort_order,
    })),
    research: research?.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      researchArea: r.research_area,
      methodology: r.methodology || "",
      dataset: r.dataset || "",
      technologies: r.technologies || [],
      paperUrl: r.paper_url || "",
      githubUrl: r.github_url || "",
      publicationStatus: r.publication_status as ResearchItem["publicationStatus"],
      publicationDate: r.publication_date || "",
      venue: r.venue || "",
      sortOrder: r.sort_order,
    })),
    achievements: achievements?.map((a) => ({
      id: a.id,
      title: a.title,
      issuer: a.issuer,
      date: a.date || "",
      description: a.description || "",
      url: a.url || "",
      sortOrder: a.sort_order,
    })),
    certifications: certifications?.map((c) => ({
      id: c.id,
      name: c.name,
      issuingOrganization: c.issuing_organization,
      issueDate: c.issue_date || "",
      expiryDate: c.expiry_date || "",
      credentialId: c.credential_id || "",
      credentialUrl: c.credential_url || "",
      sortOrder: c.sort_order,
    })),
    socialLinks: socialLinks?.map((s) => ({
      id: s.id,
      platform: s.platform,
      url: s.url,
      label: s.label || "",
      sortOrder: s.sort_order,
    })),
  });
}

/**
 * Public Data Retrieval Service (Phase 5)
 * Fetches published portfolio data without requiring authentication.
 * DRAFT PROTECTION: Returns null if is_published is false or slug is invalid/reserved.
 * PUBLIC DATA SAFETY: Strips sensitive user metadata and internal DB secrets.
 */
export async function getPublicPortfolioBySlug(slug: string): Promise<PortfolioData | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  if (isReservedSlug(normalizedSlug)) {
    return null;
  }

  const supabase = await createClient();

  // 1. Fetch Published Portfolio Meta
  const { data: p } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("is_published", true)
    .eq("is_public", true)
    .maybeSingle();

  if (!p) return null;

  const internalUserId = p.user_id;

  // 2. Fetch User Profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", internalUserId).maybeSingle();

  // 3. Fetch Sections
  const { data: sections } = await supabase.from("portfolio_sections").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 4. Fetch Projects
  const { data: projects } = await supabase.from("projects").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 5. Fetch Education
  const { data: education } = await supabase.from("education").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 6. Fetch Skills
  const { data: skills } = await supabase.from("skills").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 7. Fetch Experience
  const { data: experience } = await supabase.from("experience").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 8. Fetch Research
  const { data: research } = await supabase.from("research").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 9. Fetch Achievements
  const { data: achievements } = await supabase.from("achievements").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 10. Fetch Certifications
  const { data: certifications } = await supabase.from("certifications").select("*").eq("portfolio_id", p.id).order("sort_order");

  // 11. Fetch Social Links
  const { data: socialLinks } = await supabase.from("social_links").select("*").eq("portfolio_id", p.id).order("sort_order");

  return normalizePortfolioData({
    id: p.id,
    userId: "", // Strip internal user_id for public data safety
    slug: p.slug,
    title: p.title,
    templateId: p.template_id,
    isPublished: p.is_published,
    isPublic: p.is_public,
    profile: profile ? {
      fullName: profile.full_name,
      headline: profile.headline || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatar_url || "",
      location: profile.location || "",
      email: profile.email || "",
      phone: profile.phone || "",
      isAvailableForWork: profile.is_available_for_work ?? true,
      resumeUrl: profile.resume_url || "",
    } : undefined,
    sections: sections?.map((s) => ({
      id: s.id,
      type: s.section_type as SectionType,
      title: s.title,
      isVisible: s.is_visible,
      order: s.sort_order,
    })),
    projects: projects?.map((pr) => ({
      id: pr.id,
      title: pr.title,
      shortDescription: pr.short_description,
      detailedDescription: pr.detailed_description || "",
      problemStatement: pr.problem_statement || "",
      solutionApproach: pr.solution_approach || "",
      technologies: pr.technologies || [],
      imageUrl: pr.image_url || "",
      githubUrl: pr.github_url || "",
      liveDemoUrl: pr.live_demo_url || "",
      paperUrl: pr.paper_url || "",
      startDate: pr.start_date || "",
      endDate: pr.end_date || "",
      status: pr.is_current ? "IN_PROGRESS" : "COMPLETED",
      isCurrent: pr.is_current,
      isFeatured: pr.is_featured,
      sortOrder: pr.sort_order,
    })),
    education: education?.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.field_of_study,
      startYear: e.start_year,
      endYear: e.end_year,
      isCurrentStatus: e.is_current_status,
      cgpa: e.cgpa || "",
      maxCgpa: e.max_cgpa || "4.0",
      description: e.description || "",
      sortOrder: e.sort_order,
    })),
    skills: skills?.map((sk) => ({
      id: sk.id,
      name: sk.name,
      category: sk.category as SkillItem["category"],
      proficiency: sk.proficiency as SkillItem["proficiency"],
      iconName: sk.icon_name || "",
      sortOrder: sk.sort_order,
    })),
    experience: experience?.map((ex) => ({
      id: ex.id,
      company: ex.company,
      role: ex.role,
      location: ex.location || "",
      startDate: ex.start_date,
      endDate: ex.end_date || "",
      isCurrent: ex.is_current,
      description: ex.description,
      technologies: ex.technologies || [],
      sortOrder: ex.sort_order,
    })),
    research: research?.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      researchArea: r.research_area,
      methodology: r.methodology || "",
      dataset: r.dataset || "",
      technologies: r.technologies || [],
      paperUrl: r.paper_url || "",
      githubUrl: r.github_url || "",
      publicationStatus: r.publication_status as ResearchItem["publicationStatus"],
      publicationDate: r.publication_date || "",
      venue: r.venue || "",
      sortOrder: r.sort_order,
    })),
    achievements: achievements?.map((a) => ({
      id: a.id,
      title: a.title,
      issuer: a.issuer,
      date: a.date || "",
      description: a.description || "",
      url: a.url || "",
      sortOrder: a.sort_order,
    })),
    certifications: certifications?.map((c) => ({
      id: c.id,
      name: c.name,
      issuingOrganization: c.issuing_organization,
      issueDate: c.issue_date || "",
      expiryDate: c.expiry_date || "",
      credentialId: c.credential_id || "",
      credentialUrl: c.credential_url || "",
      sortOrder: c.sort_order,
    })),
    socialLinks: socialLinks?.map((s) => ({
      id: s.id,
      platform: s.platform,
      url: s.url,
      label: s.label || "",
      sortOrder: s.sort_order,
    })),
  });
}

/**
 * Updates public username/slug for an owned portfolio with availability validation.
 */
export async function updatePortfolioSlug(
  portfolioId: string,
  newSlug: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = await createClient();
  const internalUserId = user.internalUser?.id || user.authUser.id;

  const availability = await checkSlugAvailability(newSlug, portfolioId);
  if (!availability.available) {
    return { success: false, error: availability.reason || "Slug is unavailable." };
  }

  const { error } = await supabase
    .from("portfolios")
    .update({
      slug: newSlug.toLowerCase().trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId)
    .eq("user_id", internalUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

