import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "portfolio-builder-saas",
    version: "0.1.0",
    phase: "Phase 0 - Architecture & Baseline",
    timestamp: new Date().toISOString(),
  });
}
