/**
 * PortfolioCraft - Billing & Subscription Data Types (Phase 18)
 */
import { PlanTier, FeatureKey } from "@/config/plans";

export type SubscriptionStatus = "free" | "trialing" | "active" | "past_due" | "cancelled" | "expired";

export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface WebhookEventPayload {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface FeatureAccessCheck {
  allowed: boolean;
  userPlan: PlanTier;
  feature: FeatureKey;
  upgradeRequired: boolean;
  reason?: string;
}

export interface BillingActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
