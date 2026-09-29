import { createClient } from "./server";
import { redirect } from "next/navigation";
import { DbUser, DbProfile } from "@/types/database";

export interface AuthenticatedUserData {
  authUser: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
    app_metadata: Record<string, unknown>;
  };
  internalUser: DbUser | null;
  profile: DbProfile | null;
  providers: string[];
}

/**
 * Validates the authenticated session server-side.
 * Never relies on client-supplied IDs or headers.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUserData | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser || !authUser.email) {
    return null;
  }

  // Fetch or sync internal user record in PostgreSQL database
  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", authUser.email)
    .maybeSingle();

  // Fetch corresponding user profile
  let dbProfile: DbProfile | null = null;
  if (dbUser) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", dbUser.id)
      .maybeSingle();
    dbProfile = profileData;
  }

  // Fetch connected OAuth accounts
  const providers: string[] = [];
  if (dbUser) {
    const { data: accounts } = await supabase
      .from("connected_accounts")
      .select("provider")
      .eq("user_id", dbUser.id);
    if (accounts) {
      accounts.forEach((acc) => providers.push(acc.provider));
    }
  }

  if (providers.length === 0 && authUser.app_metadata?.provider) {
    providers.push(authUser.app_metadata.provider as string);
  }

  return {
    authUser: {
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata || {},
      app_metadata: authUser.app_metadata || {},
    },
    internalUser: dbUser as DbUser | null,
    profile: dbProfile as DbProfile | null,
    providers,
  };
}

/**
 * Server guard function: Ensures request has a valid authenticated session.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(redirectTo: string = "/dashboard"): Promise<AuthenticatedUserData> {
  const userData = await getAuthenticatedUser();

  if (!userData) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return userData;
}

/**
 * Helper to sync user profile and connected account record after OAuth callback
 */
export async function syncUserProfileFromAuth(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, authUser: { id: string; email: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }) {
  if (!authUser.email) return null;

  const fullName =
    (authUser.user_metadata?.full_name as string) ||
    (authUser.user_metadata?.name as string) ||
    authUser.email.split("@")[0];

  const avatarUrl =
    (authUser.user_metadata?.avatar_url as string) ||
    (authUser.user_metadata?.picture as string) ||
    "";

  const rawProvider = (authUser.app_metadata?.provider as string) || "oauth";
  const provider = rawProvider === "google" || rawProvider === "github" ? rawProvider : "other";

  // Base username generation
  const rawUsername =
    (authUser.user_metadata?.preferred_username as string) ||
    authUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

  const username = rawUsername.length >= 3 ? rawUsername : `${rawUsername}-user`;

  // 1. Upsert User in public.users
  const { data: userRecord, error: userError } = await supabase
    .from("users")
    .upsert(
      {
        email: authUser.email,
        full_name: fullName,
        avatar_url: avatarUrl,
        username: username,
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (userError || !userRecord) {
    console.error("Failed to sync user record:", userError);
    return null;
  }

  // 2. Upsert Profile in public.profiles
  await supabase.from("profiles").upsert(
    {
      user_id: userRecord.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      email: authUser.email,
    },
    { onConflict: "user_id" }
  );

  // 3. Upsert Connected Account
  if (provider === "google" || provider === "github") {
    await supabase.from("connected_accounts").upsert(
      {
        user_id: userRecord.id,
        provider: provider,
        provider_account_id: authUser.id,
      },
      { onConflict: "provider,provider_account_id" }
    );
  }

  return userRecord;
}
