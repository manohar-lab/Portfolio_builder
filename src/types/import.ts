/**
 * Portfolio Craft - Import System Data Types
 */

export interface ImportedProfile {
  full_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  email?: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedProject {
  id: string;
  title: string;
  short_description: string;
  detailed_description?: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  stars_count?: number;
  forks_count?: number;
  repo_name?: string;
  duplicate_status?: "none" | "potential" | "exact";
  existing_project_id?: string;
  merge_action?: "create_new" | "update_existing" | "keep_existing" | "skip";
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedSkill {
  id: string;
  name: string;
  category?: string;
  duplicate_status?: "none" | "exact";
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  cgpa?: string;
  description?: string;
  duplicate_status?: "none" | "potential";
  existing_education_id?: string;
  merge_action?: "create_new" | "update_existing" | "keep_existing" | "skip";
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedExperience {
  id: string;
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedResearch {
  id: string;
  title: string;
  venue_or_journal?: string;
  publication_year?: number;
  abstract?: string;
  paper_url?: string;
  github_url?: string;
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedAchievement {
  id: string;
  title: string;
  description?: string;
  year?: string;
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedCertification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_year?: string;
  credential_url?: string;
  uncertain?: boolean;
  selected?: boolean;
}

export interface ImportedSocial {
  id: string;
  platform: string;
  url: string;
  selected?: boolean;
}

export interface FieldConflict {
  field: string;
  currentValue: string;
  importedValue: string;
  resolution: "keep_current" | "use_imported" | "edited";
  editedValue?: string;
}

export interface ExistingProfileContext {
  fullName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  email?: string;
}

export interface ImportMergeResultSummary {
  itemsImported: number;
  itemsSkipped: number;
  duplicatesCount: number;
  warningsCount: number;
}

export interface NormalizedImportPayload {
  source: "github" | "resume" | "manual";
  raw_file_name?: string;
  existingContext?: ExistingProfileContext;
  profileConflicts?: FieldConflict[];
  profile?: ImportedProfile;
  projects: ImportedProject[];
  skills: ImportedSkill[];
  education: ImportedEducation[];
  experience: ImportedExperience[];
  research: ImportedResearch[];
  achievements: ImportedAchievement[];
  certifications: ImportedCertification[];
  socials: ImportedSocial[];
}

