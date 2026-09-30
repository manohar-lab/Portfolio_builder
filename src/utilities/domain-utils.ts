/**
 * Domain Normalization Utility
 */
export function normalizeDomain(input: string): string {
  if (!input) return "";

  let cleaned = input.trim().toLowerCase();

  // Strip protocol prefix if present
  cleaned = cleaned.replace(/^https?:\/\//i, "");

  // Strip path, query params, hash
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];

  // Strip port numbers
  cleaned = cleaned.split(":")[0];

  // Strip leading/trailing dots
  cleaned = cleaned.replace(/^\.+|\.+$/g, "");

  return cleaned;
}

export interface DomainValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

/**
 * Strict Domain Input Validation
 */
export function validateDomainInput(input: string): DomainValidationResult {
  const normalized = normalizeDomain(input);

  if (!normalized) {
    return { valid: false, normalized: "", error: "Please enter a custom domain." };
  }

  // Reject localhost or local loopback addresses
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  ) {
    return { valid: false, normalized, error: "Local development domains are not allowed." };
  }

  // Reject IPv4 and IPv6 addresses
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv4Regex.test(normalized) || ipv6Regex.test(normalized)) {
    return { valid: false, normalized, error: "IP addresses are not allowed. Please enter a valid domain name." };
  }

  // Reject input containing slashes, query parameters, spaces, or protocol prefixes that didn't normalize cleanly
  if (input.includes("/") && !input.startsWith("http://") && !input.startsWith("https://")) {
    return { valid: false, normalized, error: "Please enter only the domain name without paths or slashes." };
  }

  // Valid hostname regex according to RFC 1035 / RFC 1123
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  if (!domainRegex.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Invalid domain format. Example: example.com or portfolio.example.com",
    };
  }

  return { valid: true, normalized };
}

/**
 * Generate cryptographically secure verification token
 */
export function generateVerificationToken(): string {
  const uuid = typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `pc-verify-${uuid.replace(/-/g, "")}`;
}

/**
 * DNS Instructions Structure
 */
export interface DnsInstruction {
  type: "TXT";
  host: string;
  value: string;
  description: string;
}

export function getDnsInstructions(domain: string, token: string): DnsInstruction {
  return {
    type: "TXT",
    host: "_verification",
    value: `portfolio-craft-verify=${token}`,
    description: `Add a TXT record with host '_verification' and value 'portfolio-craft-verify=${token}' at your domain registrar.`,
  };
}
