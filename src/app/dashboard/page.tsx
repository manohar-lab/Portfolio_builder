import React from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/auth/service";
import { getUserPortfolios } from "@/database/portfolio-service";
import { getUserOnboardingStatus } from "@/services/onboarding-service";
import { DashboardClientWorkspace } from "@/dashboard/DashboardClientWorkspace";

export default async function DashboardOverviewPage() {
  const userData = await requireAuth("/dashboard");
  const onboardingStatus = await getUserOnboardingStatus();
  const portfolios = await getUserPortfolios();

  // FIRST-TIME USER REDIRECT: If no portfolio exists and onboarding incomplete, redirect to /onboarding
  if (portfolios.length === 0 && !onboardingStatus.onboardingCompleted) {
    redirect("/onboarding");
  }

  const displayName =
    userData.profile?.full_name ||
    userData.internalUser?.full_name ||
    userData.authUser.email.split("@")[0];

  return (
    <DashboardClientWorkspace
      initialPortfolios={portfolios}
      displayName={displayName}
      onboardingStatus={onboardingStatus}
    />
  );
}
