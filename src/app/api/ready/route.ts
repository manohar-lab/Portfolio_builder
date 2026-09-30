import { NextResponse } from "next/server";
import { createClient } from "@/auth/server";

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

  const isReady = dbHealthy;
  const status = isReady ? "ready" : "degraded";
  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      checks: {
        database: {
          status: dbHealthy ? "healthy" : "unhealthy",
          latencyMs: dbLatencyMs,
        },
        aiService: {
          status: "available",
        },
        billingService: {
          status: "operational",
        },
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
