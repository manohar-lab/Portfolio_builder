/**
 * PortfolioCraft SaaS - Centralized Subscription Plan Configuration (Phase 18)
 */

export type PlanTier = "free" | "pro";

export type FeatureKey =
  | "basic_templates"
  | "premium_templates"
  | "basic_customization"
  | "advanced_customization"
  | "github_import"
  | "resume_import"
  | "public_platform_url"
  | "custom_domain"
  | "ai_assistant_basic"
  | "ai_assistant_unlimited"
  | "branding_removal";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthly: number; // in USD
  priceAnnual?: number;
  currency: string; // e.g. "USD"
  description: string;
  stripePriceId?: string;
  features: Record<FeatureKey, boolean>;
  featureList: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    id: "free",
    name: "Free Plan",
    priceMonthly: 0,
    currency: "USD",
    description: "Essential portfolio builder to showcase your professional work.",
    features: {
      basic_templates: true,
      premium_templates: false,
      basic_customization: true,
      advanced_customization: false,
      github_import: true,
      resume_import: true,
      public_platform_url: true,
      custom_domain: false,
      ai_assistant_basic: true,
      ai_assistant_unlimited: false,
      branding_removal: false,
    },
    featureList: [
      "Full Portfolio Editor",
      "Standard Templates (Minimal, Developer, Research)",
      "Basic Color & Mode Customization",
      "GitHub & Resume Data Import",
      "Public Platform URL (portfoliocraft.com/u/you)",
      "QR Code & Social Sharing",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    priceMonthly: 12,
    currency: "USD",
    description: "For professionals requiring custom domain branding and premium features.",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly_mock",
    features: {
      basic_templates: true,
      premium_templates: true,
      basic_customization: true,
      advanced_customization: true,
      github_import: true,
      resume_import: true,
      public_platform_url: true,
      custom_domain: true,
      ai_assistant_basic: true,
      ai_assistant_unlimited: true,
      branding_removal: true,
    },
    featureList: [
      "Everything in Free Plan",
      "Custom Domain Hosting (yourdomain.com)",
      "Premium Templates & Advanced Customization",
      "Full Typography & Design Token Scaling",
      "Priority AI Assistant Generation",
      "Remove Platform Footer Branding",
    ],
  },
};
