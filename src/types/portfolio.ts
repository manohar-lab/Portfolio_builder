/**
 * Standardized Portfolio Domain Data Model - Phase 2 Extended
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * Portfolio data models are presentation-agnostic.
 * Templates consume this structure without embedding user-specific logic or hardcoded schemas.
 */

export type SectionType =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "education"
  | "academic_journey"
  | "experience"
  | "research"
  | "achievements"
  | "certifications"
  | "publications"
  | "services"
  | "contact"
  | "social_links";

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  order: number;
}

export interface UserProfile {
  fullName: string;
  headline: string;
  bio: string;
  detailedBio?: string;
  avatarUrl?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  isAvailableForWork: boolean;
  resumeUrl?: string;
}

export interface SocialLink {
  id: string;
  platform: string; // 'github' | 'linkedin' | 'twitter' | 'youtube' | 'instagram' | 'website' | 'medium' | 'scholar' | 'other'
  url: string;
  label?: string;
  iconName?: string;
  sortOrder?: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: "frontend" | "backend" | "ai_ml" | "devops" | "languages" | "design" | "tools" | "other";
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
  iconName?: string;
  sortOrder?: number;
}

export type ProjectStatus = "IDEA" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface ProjectItem {
  id: string;
  portfolioId?: string;
  title: string;
  shortDescription: string;
  detailedDescription?: string;
  problemStatement?: string;
  solutionApproach?: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  paperUrl?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  isCurrent: boolean;
  isFeatured: boolean;
  sortOrder?: number;
}

export interface EducationItem {
  id: string;
  portfolioId?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  isCurrentStatus: boolean;
  cgpa?: number | string;
  maxCgpa?: number | string;
  description?: string;
  sortOrder?: number;
}

export interface AcademicSemesterItem {
  id: string;
  educationId?: string;
  portfolioId?: string;
  semesterNumber: number; // 1 to 8
  cgpa?: number | string;
  subjects: string[];
  description?: string;
  projects?: string[];
  achievements?: string[];
  status?: "ENROLLED" | "COMPLETED" | "UPCOMING";
}

export interface ExperienceItem {
  id: string;
  portfolioId?: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  technologies?: string[];
  sortOrder?: number;
}

export interface ResearchItem {
  id: string;
  portfolioId?: string;
  title: string;
  description: string;
  detailedDescription?: string;
  researchArea: string;
  problemStatement?: string;
  methodology?: string;
  dataset?: string;
  technologies: string[];
  resultsSummary?: string;
  paperUrl?: string;
  githubUrl?: string;
  publicationStatus: "submitted" | "under_review" | "accepted" | "published" | "pre_print";
  publicationDate?: string;
  venue?: string;
  sortOrder?: number;
}

export interface AchievementItem {
  id: string;
  portfolioId?: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface CertificationItem {
  id: string;
  portfolioId?: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateUrl?: string;
  sortOrder?: number;
}

export interface PublicationItem {
  id: string;
  portfolioId?: string;
  title: string;
  authors: string[];
  publisher: string;
  publicationDate?: string;
  doiUrl?: string;
  abstract?: string;
  sortOrder?: number;
}

export interface ServiceItem {
  id: string;
  portfolioId?: string;
  title: string;
  description: string;
  iconName?: string;
  sortOrder?: number;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
  customNote?: string;
}

export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  fontFamily: "sans" | "serif" | "mono";
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  animationLevel: "none" | "subtle" | "full";
  layoutSpacing: "compact" | "spacious" | "comfortable";
}

export type PortfolioStatus = "DRAFT" | "PUBLISHED";

export interface PortfolioMeta {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  status: PortfolioStatus;
  isPublished: boolean;
  isPublic: boolean;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioData extends PortfolioMeta {
  profile: UserProfile;
  sections: SectionConfig[];
  socialLinks: SocialLink[];
  skills: SkillItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  academicJourney: AcademicSemesterItem[];
  experience: ExperienceItem[];
  research: ResearchItem[];
  achievements: AchievementItem[];
  certifications: CertificationItem[];
  publications: PublicationItem[];
  services: ServiceItem[];
  contact: ContactInfo;
  theme: ThemeConfig;
}
