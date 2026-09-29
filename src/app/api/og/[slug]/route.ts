import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize standalone Supabase client for public route metadata queries
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Fetch portfolio profile data
    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("title, is_published, profile_data, template_id")
      .eq("slug", slug)
      .single();

    const profile = (portfolio?.profile_data as Record<string, string>) || {};
    const name = profile.full_name || portfolio?.title || "Portfolio Craft User";
    const headline = profile.headline || "Software Engineering & Academic Portfolio";
    const bio = profile.bio || "Explore projects, skills, research, and publications.";
    const templateName = (portfolio?.template_id || "minimal").toUpperCase();

    // Escape text for SVG XML safely
    const esc = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)" />

      <!-- Top Accent Bar -->
      <rect x="0" y="0" width="1200" height="8" fill="url(#accent)" />

      <!-- Grid lines graphic -->
      <path d="M0 100 H1200 M0 200 H1200 M0 300 H1200 M0 400 H1200 M0 500 H1200" stroke="#334155" stroke-opacity="0.15" stroke-width="1" />

      <!-- Content Container -->
      <g transform="translate(80, 100)">
        <!-- Badge -->
        <rect x="0" y="0" width="160" height="32" rx="16" fill="#6366f1" fill-opacity="0.15" stroke="#818cf8" stroke-opacity="0.3" stroke-width="1" />
        <text x="80" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#818cf8" text-anchor="middle" letter-spacing="1">
          ${esc(templateName)} TEMPLATE
        </text>

        <!-- Name -->
        <text x="0" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" fill="#ffffff" letter-spacing="-1">
          ${esc(name.slice(0, 35))}
        </text>

        <!-- Headline -->
        <text x="0" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#a5b4fc">
          ${esc(headline.slice(0, 55))}
        </text>

        <!-- Bio snippet -->
        <text x="0" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94a3b8">
          ${esc(bio.slice(0, 90))}...
        </text>

        <!-- Domain Footer -->
        <g transform="translate(0, 380)">
          <circle cx="20" cy="20" r="14" fill="#6366f1" />
          <path d="M14 20 L18 24 L26 16" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <text x="48" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#ffffff">
            PortfolioCraft <tspan fill="#64748b" font-weight="400">| portfoliocraft.app/u/${esc(slug)}</tspan>
          </text>
        </g>
      </g>
    </svg>`;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    // Fallback static error SVG
    const fallbackSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0f172a"/><text x="600" y="315" font-family="sans-serif" font-size="36" fill="#ffffff" text-anchor="middle">PortfolioCraft</text></svg>`;
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
