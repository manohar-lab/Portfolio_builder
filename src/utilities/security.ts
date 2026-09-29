/**
 * Security & Sanitization Utilities
 * Prevents XSS, unsafe URL protocols, and handles rate limiting.
 */

/**
 * Sanitizes URLs to prevent XSS payloads (e.g. javascript:, data:, vbscript:).
 * Only allows safe protocols: http:, https:, mailto:, tel:.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Check for dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  // Ensure relative or valid HTTP/HTTPS/mailto/tel URL
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }

  // Default fallback: prepend https:// if missing protocol
  return `https://${trimmed}`;
}

/**
 * Escapes HTML entity special characters to prevent raw script injection.
 */
export function sanitizeHtmlText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * In-memory sliding window rate limiter for API routes & server actions.
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return { allowed: true, remaining: limit - 1, resetTime: newEntry.resetTime };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}
