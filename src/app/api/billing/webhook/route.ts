import { NextResponse } from "next/server";
import { BillingService } from "@/services/billing-service";
import { WebhookEventPayload } from "@/types/billing";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || req.headers.get("x-signature") || "";

    let eventPayload: WebhookEventPayload;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const billingService = new BillingService();
    const result = await billingService.processWebhookEvent(eventPayload, signature);

    return NextResponse.json({ received: true, status: result.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
