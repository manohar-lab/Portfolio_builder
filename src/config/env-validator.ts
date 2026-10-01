/**
 * PortfolioCraft - Environment Variable Startup Validator (Phase 30)
 * Validates required and optional environment variables safely at startup
 * without exposing secret values or credentials.
 */

export interface EnvValidationResult {
  valid: boolean;
  missingRequired: string[];
  optionalStatus: Record<string, "configured" | "missing">;
}

export const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

export const OPTIONAL_ENV_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

/**
 * Inspects environment variables safely and returns a validation summary.
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const missingRequired: string[] = [];
  const optionalStatus: Record<string, "configured" | "missing"> = {};

  REQUIRED_ENV_VARS.forEach((varName) => {
    const val = process.env[varName];
    if (!val || val.trim() === "" || val.includes("placeholder-anon-key")) {
      missingRequired.push(varName);
    }
  });

  OPTIONAL_ENV_VARS.forEach((varName) => {
    const val = process.env[varName];
    optionalStatus[varName] = val && val.trim() !== "" ? "configured" : "missing";
  });

  const valid = missingRequired.length === 0;

  return {
    valid,
    missingRequired,
    optionalStatus,
  };
}

/**
 * Asserts startup environment configuration.
 * Throws a clean, safe Error if required variables are missing (never leaking secret values).
 */
export function assertEnvironmentConfig(): void {
  const result = validateEnvironmentVariables();
  if (!result.valid) {
    throw new Error(
      `[Startup Error] Missing required environment variables: ${result.missingRequired.join(
        ", "
      )}. Please check your .env configuration.`
    );
  }
}
