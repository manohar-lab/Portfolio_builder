"use server";

import { createClient } from "./server";
import { redirect } from "next/navigation";

/**
 * Server action to initiate OAuth redirect flow for Google or GitHub
 */
export async function signInWithOAuthAction(provider: "google" | "github", redirectTo: string = "/dashboard") {
  const supabase = await createClient();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${appUrl}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl,
      queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
    },
  });

  if (error) {
    console.error(`OAuth error for provider ${provider}:`, error.message);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Server action to sign out current authenticated session
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
