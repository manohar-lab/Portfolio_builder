/**
 * Database Schema Entity Types
 * Directly maps to PostgreSQL / Supabase Schema Tables
 */

export interface DbUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  is_available_for_work: boolean;
  resume_url: string | null;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  profile_type?: string;
  created_at: string;
  updated_at: string;
}

export interface DbConnectedAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  created_at: string;
}

export interface DbPortfolio {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  template_id: string;
  is_published: boolean;
  is_public: boolean;
  profile_data: Record<string, unknown>;
  theme_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbPortfolioSection {
  id: string;
  portfolio_id: string;
  section_type: string;
  title: string;
  is_visible: boolean;
  sort_order: number;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  portfolio_id: string;
  user_id: string;
  title: string;
  short_description: string;
  detailed_description: string | null;
  problem_statement: string | null;
  solution_approach: string | null;
  technologies: string[];
  image_url: string | null;
  github_url: string | null;
  live_demo_url: string | null;
  paper_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbResearch {
  id: string;
  portfolio_id: string;
  user_id: string;
  title: string;
  description: string;
  research_area: string;
  methodology: string | null;
  dataset: string | null;
  technologies: string[];
  paper_url: string | null;
  github_url: string | null;
  publication_status: string;
  publication_date: string | null;
  venue: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbEducation {
  id: string;
  portfolio_id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number | null;
  is_current_status: boolean;
  cgpa: string | null;
  max_cgpa: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbAcademicSemester {
  id: string;
  education_id: string;
  portfolio_id: string;
  user_id: string;
  semester_number: number;
  cgpa: string | null;
  subjects: string[];
  projects: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export interface DbUserFeedback {
  id: string;
  user_id?: string | null;
  category: "bug" | "feature_request" | "confusing_ux" | "template_feedback" | "other";
  message: string;
  contact_email?: string | null;
  created_at: string;
}

export interface DbImportHistory {
  id: string;
  user_id: string;
  portfolio_id?: string | null;
  source: "github" | "resume" | "manual";
  status: "completed" | "cancelled" | "failed";
  items_imported_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

