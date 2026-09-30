import { PLAN_CONFIGS, FeatureKey, PlanTier } from "@/config/plans";
import { UserSubscriptionRecord, FeatureAccessCheck } from "@/types/billing";

/**
 * Evaluates feature entitlement for a user based on subscription state.
 * Default fallback is "free" plan.
 */
export function canUserAccessFeature(
  subscription: Partial<UserSubscriptionRecord> | null | undefined,
  feature: FeatureKey
): FeatureAccessCheck {
  const isSubActive = subscription?.status === "active" || subscription?.status === "trialing";
  const userPlan: PlanTier = isSubActive && subscription?.plan === "pro" ? "pro" : "free";

  const planConfig = PLAN_CONFIGS[userPlan];
  const allowed = planConfig.features[feature] ?? false;

  if (!allowed) {
    return {
      allowed: false,
      userPlan,
      feature,
      upgradeRequired: true,
      reason: `Feature '${feature}' requires a Pro subscription.`,
    };
  }

  return {
    allowed: true,
    userPlan,
    feature,
    upgradeRequired: false,
  };
}
