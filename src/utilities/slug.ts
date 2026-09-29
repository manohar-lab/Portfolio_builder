import { RESERVED_SLUGS } from "../config/constants";

/**
 * Normalizes input text into a clean, lowercased URL-friendly slug.
 */
export function generateSlug(input: string): string {
  if (!input) return "";
  
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove all non-word chars except space and hyphen
    .replace(/[\s_-]+/g, "-")  // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from ends
}

/**
 * Checks if a given slug is reserved or disallowed.
 */
export function isReservedSlug(slug: string): boolean {
  const normalized = slug.toLowerCase().trim();
  return RESERVED_SLUGS.has(normalized);
}

/**
 * Validates whether a slug conforms to URL safety rules and is not reserved.
 */
export function isValidSlug(slug: string): { valid: boolean; reason?: string } {
  const normalized = slug.toLowerCase().trim();

  if (normalized.length < 3) {
    return { valid: false, reason: "Slug must be at least 3 characters long." };
  }

  if (normalized.length > 30) {
    return { valid: false, reason: "Slug cannot exceed 30 characters." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    return { valid: false, reason: "Slug can only contain lowercase letters, numbers, and single hyphens." };
  }

  if (isReservedSlug(normalized)) {
    return { valid: false, reason: `The URL slug "${normalized}" is reserved by the platform.` };
  }

  return { valid: true };
}
