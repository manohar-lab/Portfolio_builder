import { NextResponse } from "next/server";
import { createClient } from "@/auth/server";
import { syncUserProfileFromAuth } from "@/auth/service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam || errorDescription) {
    const errorMsg = errorDescription || errorParam || "Authentication cancelled or failed.";
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData.user && sessionData.user.email) {
      // Synchronize internal DB user, profile, and connected account record
      await syncUserProfileFromAuth(supabase, {
        id: sessionData.user.id,
        email: sessionData.user.email,
        user_metadata: sessionData.user.user_metadata,
        app_metadata: sessionData.user.app_metadata,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    } else if (error) {
      console.error("Auth callback code exchange error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("No authorization code provided.")}`);
}
