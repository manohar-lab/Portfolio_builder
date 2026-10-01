import { NextResponse } from "next/server";
import { validateEnvironmentVariables } from "@/config/env-validator";

const START_TIME = Date.now();

export async function GET() {
  const envCheck = validateEnvironmentVariables();

  return NextResponse.json(
    {
      status: "ok",
      service: "PortfolioCraft SaaS",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      timestamp: new Date().toISOString(),
      config: {
        envValid: envCheck.valid,
        missingRequired: envCheck.missingRequired.length,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    }
  );
}
