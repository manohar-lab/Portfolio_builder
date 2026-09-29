import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const { data: publishedPortfolios } = await supabase
      .from("portfolios")
      .select("slug, updated_at")
      .eq("is_published", true)
      .eq("is_public", true);

    if (publishedPortfolios && publishedPortfolios.length > 0) {
      const dynamicEntries: MetadataRoute.Sitemap = publishedPortfolios.map((p) => ({
        url: `${baseUrl}/u/${encodeURIComponent(p.slug)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }));

      return [...staticEntries, ...dynamicEntries];
    }
  } catch {
    // Fallback static entries on error
  }

  return staticEntries;
}
