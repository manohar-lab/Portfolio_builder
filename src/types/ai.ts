/**
 * PortfolioCraft - AI Assistant Data & API Types (Phase 17)
 */

export type AiActionType =
  | "generate_about"
  | "improve_about"
  | "generate_headline"
  | "improve_project"
  | "suggest_skills"
  | "extract_project_tech"
  | "generate_summary";

export type AiToneOption = "professional" | "technical" | "simple" | "concise";
export type AiLengthOption = "short" | "medium" | "detailed";

export interface SkillSuggestionItem {
  skill: string;
  category: "frontend" | "backend" | "ai_ml" | "devops" | "languages" | "design" | "tools" | "other";
  reason: string;
}

export interface AiRequestPayload {
  tone?: AiToneOption;
  length?: AiLengthOption;
  targetProjectId?: string;
  customPromptNotes?: string;
}

export interface AiGenerationResult {
  actionType: AiActionType;
  content?: string;
  headlineOptions?: string[];
  techTags?: string[];
  skillSuggestions?: SkillSuggestionItem[];
  suggestions?: string[];
  warnings?: string[];
  originalContent?: string;
}

export interface AiActionResult<T = AiGenerationResult> {
  success: boolean;
  data?: T;
  error?: string;
}
