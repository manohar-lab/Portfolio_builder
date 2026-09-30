import { createClient } from "@/auth/server";
import { DbAnalyticsEvent } from "@/types/database";

export type AnalyticsEventType =
  | "user_signed_up"
  | "onboarding_completed"
  | "portfolio_created"
  | "template_selected"
  | "project_added"
  | "github_import_started"
  | "github_import_completed"
  | "resume_import_started"
  | "resume_import_completed"
  | "portfolio_published"
  | "portfolio_unpublished"
  | "share_clicked"
  | "link_copied"
  | "qr_generated"
  | "qr_downloaded"
  | "custom_domain_added"
  | "custom_domain_verified"
  | "ai_generation_requested"
  | "ai_generation_success"
  | "ai_generation_failed"
  | "ai_suggestion_accepted";

export interface TrackEventPayload {
  userId?: string | null;
  portfolioId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * FAIL-SAFE EVENT TRACKER:
 * Never throws an exception to calling code.
 * Ensures analytics failure never interrupts user workflow.
 */
export async function trackAnalyticsEvent(
  eventName: AnalyticsEventType,
  payload?: TrackEventPayload
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      user_id: payload?.userId || null,
      portfolio_id: payload?.portfolioId || null,
      metadata: payload?.metadata || {},
    });
  } catch (err) {
    // Fail-safe: Swallow error silently to preserve core product execution
    console.error(`Analytics tracking event '${eventName}' failed silently:`, err);
  }
}

export interface OwnerAnalyticsSummary {
  periodDays: number;
  totalUsers: number;
  newUsers: number;
  totalPortfolios: number;
  publishedPortfolios: number;
  publishRate: number; // percentage 0 - 100
  activeCustomDomains: number;
  funnel: {
    signedUp: number;
    completedOnboarding: number;
    createdPortfolio: number;
    selectedTemplate: number;
    publishedPortfolio: number;
  };
  templateUsage: Array<{ templateId: string; count: number; percentage: number }>;
  importStats: {
    githubImports: number;
    resumeImports: number;
    manualCreated: number;
  };
  sharingStats: {
    linkCopied: number;
    shareClicked: number;
    qrGenerated: number;
    qrDownloaded: number;
  };
  aiStats: {
    generationsRequested: number;
    generationsSuccessful: number;
    generationsFailed: number;
    suggestionsAccepted: number;
    acceptanceRate: number;
  };
  recentActivity: Array<{
    id: string;
    eventName: string;
    label: string;
    createdAt: string;
  }>;
}

/**
 * Server-side Aggregation Service for Owner Dashboard
 */
export async function getOwnerDashboardMetrics(
  periodDays: number = 30
): Promise<OwnerAnalyticsSummary> {
  const supabase = await createClient();
  const startDate = new Date();
  if (periodDays > 0) {
    startDate.setDate(startDate.getDate() - periodDays);
  } else {
    startDate.setFullYear(2020); // All time
  }
  const isoStartDate = startDate.toISOString();

  // 1. User Metrics
  const { count: totalUsersCount } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: newUsersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", isoStartDate);

  // 2. Portfolio Metrics
  const { count: totalPortfoliosCount } = await supabase.from("portfolios").select("*", { count: "exact", head: true });
  const { count: publishedPortfoliosCount } = await supabase
    .from("portfolios")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const totalPort = totalPortfoliosCount || 0;
  const pubPort = publishedPortfoliosCount || 0;
  const publishRate = totalPort > 0 ? Math.round((pubPort / totalPort) * 100) : 0;

  // 3. Active Custom Domains
  const { count: activeDomainsCount } = await supabase
    .from("custom_domains")
    .select("*", { count: "exact", head: true })
    .in("status", ["active", "verified"]);

  // 4. Portfolio Funnel Analysis
  const { count: completedOnboardingCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("onboarding_completed", true);

  const funnel = {
    signedUp: totalUsersCount || 0,
    completedOnboarding: completedOnboardingCount || 0,
    createdPortfolio: totalPort,
    selectedTemplate: totalPort,
    publishedPortfolio: pubPort,
  };

  // 5. Template Usage Distribution
  const { data: portfoliosData } = await supabase.from("portfolios").select("template_id");
  const templateCounts: Record<string, number> = {};
  if (portfoliosData) {
    portfoliosData.forEach((p) => {
      const tid = p.template_id || "minimal";
      templateCounts[tid] = (templateCounts[tid] || 0) + 1;
    });
  }

  const templateUsage = Object.entries(templateCounts).map(([templateId, count]) => ({
    templateId,
    count,
    percentage: totalPort > 0 ? Math.round((count / totalPort) * 100) : 0,
  }));

  // 6. Import Stats
  const { count: ghCount } = await supabase
    .from("import_history")
    .select("*", { count: "exact", head: true })
    .eq("source", "github");

  const { count: resCount } = await supabase
    .from("import_history")
    .select("*", { count: "exact", head: true })
    .eq("source", "resume");

  const importStats = {
    githubImports: ghCount || 0,
    resumeImports: resCount || 0,
    manualCreated: Math.max(0, totalPort - ((ghCount || 0) + (resCount || 0))),
  };

  // 7. Sharing Stats from Analytics Events
  const { data: shareEvents } = await supabase
    .from("analytics_events")
    .select("event_name")
    .in("event_name", ["link_copied", "share_clicked", "qr_generated", "qr_downloaded"]);

  const sharingStats = {
    linkCopied: 0,
    shareClicked: 0,
    qrGenerated: 0,
    qrDownloaded: 0,
  };

  if (shareEvents) {
    shareEvents.forEach((e) => {
      if (e.event_name === "link_copied") sharingStats.linkCopied++;
      if (e.event_name === "share_clicked") sharingStats.shareClicked++;
      if (e.event_name === "qr_generated") sharingStats.qrGenerated++;
      if (e.event_name === "qr_downloaded") sharingStats.qrDownloaded++;
    });
  }

  // 8. AI Stats from Analytics Events
  const { data: aiEvents } = await supabase
    .from("analytics_events")
    .select("event_name")
    .in("event_name", ["ai_generation_requested", "ai_generation_success", "ai_generation_failed", "ai_suggestion_accepted"]);

  const aiStats = {
    generationsRequested: 0,
    generationsSuccessful: 0,
    generationsFailed: 0,
    suggestionsAccepted: 0,
    acceptanceRate: 0,
  };

  if (aiEvents) {
    aiEvents.forEach((e) => {
      if (e.event_name === "ai_generation_requested") aiStats.generationsRequested++;
      if (e.event_name === "ai_generation_success") aiStats.generationsSuccessful++;
      if (e.event_name === "ai_generation_failed") aiStats.generationsFailed++;
      if (e.event_name === "ai_suggestion_accepted") aiStats.suggestionsAccepted++;
    });

    aiStats.acceptanceRate = aiStats.generationsSuccessful > 0
      ? Math.round((aiStats.suggestionsAccepted / aiStats.generationsSuccessful) * 100)
      : 0;
  }

  // 9. Recent Operational Activity Stream (last 15 events)
  const { data: recentEvents } = await supabase
    .from("analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  const recentActivity = ((recentEvents as DbAnalyticsEvent[]) || []).map((e) => ({
    id: e.id,
    eventName: e.event_name,
    label: formatEventLabel(e.event_name),
    createdAt: e.created_at,
  }));

  return {
    periodDays,
    totalUsers: totalUsersCount || 0,
    newUsers: newUsersCount || 0,
    totalPortfolios: totalPort,
    publishedPortfolios: pubPort,
    publishRate,
    activeCustomDomains: activeDomainsCount || 0,
    funnel,
    templateUsage,
    importStats,
    sharingStats,
    aiStats,
    recentActivity,
  };
}

function formatEventLabel(eventName: string): string {
  const map: Record<string, string> = {
    user_signed_up: "New User Registered",
    onboarding_completed: "User Completed Onboarding",
    portfolio_created: "Portfolio Created",
    template_selected: "Template Selected",
    project_added: "Project Added",
    github_import_started: "GitHub Import Initiated",
    github_import_completed: "GitHub Projects Imported",
    resume_import_started: "Resume Upload Initiated",
    resume_import_completed: "Resume Content Imported",
    portfolio_published: "Portfolio Published",
    portfolio_unpublished: "Portfolio Unpublished",
    share_clicked: "Portfolio Share Triggered",
    link_copied: "Public Link Copied",
    qr_generated: "QR Code Generated",
    qr_downloaded: "QR Code Downloaded",
    custom_domain_added: "Custom Domain Added",
    custom_domain_verified: "Custom Domain Verified & Active",
  };
  return map[eventName] || eventName.replace(/_/g, " ").toUpperCase();
}
