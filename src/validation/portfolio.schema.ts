import { z } from "zod";

export const SlugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(30, "Slug cannot exceed 30 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can only contain lowercase letters, numbers, and single hyphens"
  );

export const ThemeConfigSchema = z.object({
  mode: z.enum(["light", "dark", "system"]).default("system"),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex").default("#3b82f6"),
  fontFamily: z.enum(["sans", "serif", "mono"]).default("sans"),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).default("md"),
  animationLevel: z.enum(["none", "subtle", "full"]).default("subtle"),
  layoutSpacing: z.enum(["compact", "spacious", "comfortable"]).default("comfortable"),
});

export const CreatePortfolioSchema = z.object({
  title: z.string().min(1, "Portfolio title is required").max(100),
  slug: SlugSchema,
  templateId: z.string().min(1).default("developer"),
  description: z.string().max(500).optional(),
});

export const UserProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  headline: z.string().max(200).default(""),
  bio: z.string().max(2000).default(""),
  detailedBio: z.string().max(4000).optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  isAvailableForWork: z.boolean().default(true),
  resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
});

export const SocialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Invalid social link URL"),
  label: z.string().max(50).optional(),
  iconName: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const SkillItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required").max(50),
  category: z.enum(["frontend", "backend", "ai_ml", "devops", "languages", "design", "tools", "other"]),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  iconName: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const ProjectItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required").max(120),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  detailedDescription: z.string().max(4000).optional(),
  problemStatement: z.string().max(2000).optional(),
  solutionApproach: z.string().max(2000).optional(),
  technologies: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveDemoUrl: z.string().url().optional().or(z.literal("")),
  paperUrl: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["IDEA", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).default("COMPLETED"),
  isCurrent: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().optional(),
});

export const EducationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required").max(150),
  degree: z.string().min(1, "Degree is required").max(100),
  fieldOfStudy: z.string().min(1, "Field of study is required").max(100),
  startYear: z.number().int().min(1950).max(2100),
  endYear: z.number().int().min(1950).max(2100).optional(),
  isCurrentStatus: z.boolean().default(false),
  cgpa: z.union([z.number(), z.string()]).optional(),
  maxCgpa: z.union([z.number(), z.string()]).optional(),
  description: z.string().max(1000).optional(),
  sortOrder: z.number().int().optional(),
});

export const AcademicSemesterSchema = z.object({
  id: z.string().optional(),
  educationId: z.string().optional(),
  semesterNumber: z.number().int().min(1).max(12),
  cgpa: z.union([z.number(), z.string()]).optional(),
  subjects: z.array(z.string()).default([]),
  description: z.string().max(1000).optional(),
  projects: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  status: z.enum(["ENROLLED", "COMPLETED", "UPCOMING"]).default("COMPLETED"),
});

export const ExperienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Organization/Company is required").max(150),
  role: z.string().min(1, "Role is required").max(100),
  location: z.string().max(100).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1, "Description is required").max(2000),
  technologies: z.array(z.string()).default([]),
  sortOrder: z.number().int().optional(),
});

export const ResearchItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Research title is required").max(200),
  description: z.string().min(1, "Short description is required").max(2000),
  detailedDescription: z.string().max(4000).optional(),
  researchArea: z.string().min(1, "Research area is required").max(100),
  problemStatement: z.string().max(2000).optional(),
  methodology: z.string().max(1000).optional(),
  dataset: z.string().max(500).optional(),
  technologies: z.array(z.string()).default([]),
  resultsSummary: z.string().max(2000).optional(),
  paperUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  publicationStatus: z.enum(["submitted", "under_review", "accepted", "published", "pre_print"]),
  publicationDate: z.string().optional(),
  venue: z.string().max(150).optional(),
  sortOrder: z.number().int().optional(),
});

export const AchievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Achievement title is required").max(150),
  issuer: z.string().min(1, "Issuer/Organization is required").max(150),
  date: z.string().optional(),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
});

export const CertificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification name is required").max(150),
  issuingOrganization: z.string().min(1, "Issuing organization is required").max(150),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  certificateUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
});
