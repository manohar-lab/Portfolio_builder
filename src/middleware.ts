import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeDomain } from "@/utilities/domain-utils";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Baseline security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const rawHost = request.headers.get("host") || "";
  const requestHost = normalizeDomain(rawHost);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const platformHost = normalizeDomain(appUrl);

  // CUSTOM DOMAIN ROUTING RESOLUTION
  const isCustomDomain =
    requestHost &&
    requestHost !== platformHost &&
    requestHost !== "localhost" &&
    !requestHost.includes("127.0.0.1") &&
    !requestHost.includes("vercel.app");

  if (isCustomDomain) {
    // Lookup custom domain mapping
    const { data: domainRecord } = await supabase
      .from("custom_domains")
      .select("portfolio_id, status, portfolios(slug, is_published)")
      .eq("domain", requestHost)
      .in("status", ["verified", "active"])
      .maybeSingle();

    const portfolio = domainRecord?.portfolios as unknown as { slug: string; is_published: boolean } | null;

    if (domainRecord && portfolio && portfolio.is_published) {
      // Rewrite custom domain root or path to public portfolio path
      const url = request.nextUrl.clone();
      if (url.pathname === "/" || url.pathname === "") {
        url.pathname = `/u/${portfolio.slug}`;
      } else {
        url.pathname = `/u/${portfolio.slug}${url.pathname}`;
      }
      return NextResponse.rewrite(url);
    } else {
      // Unrecognized or unpublished custom domain: return 404 cleanly
      const url = request.nextUrl.clone();
      url.pathname = "/_not-found";
      return NextResponse.rewrite(url, { status: 404 });
    }
  }

  // Standard platform auth & routing logic
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/account");
  const isPrivatePage = isProtectedRoute || pathname === "/login" || pathname === "/onboarding";

  if (isPrivatePage) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (isProtectedRoute && !user) {
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
