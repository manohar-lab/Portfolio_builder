import { NextResponse } from "next/server";
import { createClient } from "@/auth/server";
import { validateEnvironmentVariables } from "@/config/env-validator";

export async function GET() {
  const startTime = Date.now();
  let dbHealthy = false;
  let dbLatencyMs = 0;

  try {
    const supabase = await createClient();
    const dbStart = Date.now();
    const { count, error } = await supabase
      .from("portfolios")
      .select("id", { count: "exact", head: true });

    dbLatencyMs = Date.now() - dbStart;
    if (!error && count !== null) {
      dbHealthy = true;
    }
  } catch {
    dbHealthy = false;
  }

  const envCheck = validateEnvironmentVariables();
  const isReady = dbHealthy && envCheck.valid;
  const status = isReady ? "ready" : "degraded";
  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      dependencies: {
        database: {
          required: true,
          status: dbHealthy ? "healthy" : "unhealthy",
          latencyMs: dbLatencyMs,
        },
        environmentConfig: {
          required: true,
          status: envCheck.valid ? "healthy" : "invalid",
          missingCount: envCheck.missingRequired.length,
        },
        gitHubIntegration: {
          required: false,
          status: envCheck.optionalStatus["GITHUB_CLIENT_ID"] === "configured" ? "configured" : "optional_missing",
        },
        openAiService: {
          required: false,
          status: envCheck.optionalStatus["OPENAI_API_KEY"] === "configured" ? "configured" : "optional_missing",
        },
        stripeBilling: {
          required: false,
          status: envCheck.optionalStatus["STRIPE_SECRET_KEY"] === "configured" ? "configured" : "optional_missing",
        },
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    }
  );
}
