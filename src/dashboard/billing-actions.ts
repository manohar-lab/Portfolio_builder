"use server";

import { getAuthenticatedUser } from "@/auth/service";
import { BillingService } from "@/services/billing-service";
import { UserSubscriptionRecord, BillingActionResult } from "@/types/billing";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Get current user subscription
 */
export async function getUserSubscriptionAction(): Promise<BillingActionResult<UserSubscriptionRecord>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const billingService = new BillingService();
    const subscription = await billingService.getUserSubscription(auth.authUser.id);

    return { success: true, data: subscription };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load subscription";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Initiate Pro Upgrade Checkout Session
 */
export async function createProCheckoutSessionAction(
  returnUrl: string
): Promise<BillingActionResult<{ url: string }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const billingService = new BillingService();
    const session = await billingService.createCheckoutSession(auth.authUser.id, returnUrl);

    return { success: true, data: { url: session.url } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create checkout session";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Process Mock Webhook / Sandbox Activation
 */
export async function activateMockProSubscriptionAction(
  sessionId: string
): Promise<BillingActionResult<{ activated: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const billingService = new BillingService();
    const res = await billingService.processWebhookEvent({
      id: `evt_mock_${sessionId}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: `sub_mock_${sessionId}`,
          customer: `cus_mock_${auth.authUser.id.slice(0, 8)}`,
          client_reference_id: auth.authUser.id,
          metadata: { user_id: auth.authUser.id },
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account");

    return { success: true, data: { activated: res.processed } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to activate subscription";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Cancel Pro Subscription at Period End
 */
export async function cancelProSubscriptionAction(): Promise<BillingActionResult<{ cancelled: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access" };
    }

    const billingService = new BillingService();
    const cancelled = await billingService.cancelSubscription(auth.authUser.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account");

    return { success: true, data: { cancelled } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to cancel subscription";
    return { success: false, error: msg };
  }
}
