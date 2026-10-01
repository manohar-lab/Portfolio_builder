import React from "react";
import { requireAuth } from "@/auth/service";
import { getUserPortfolios } from "@/database/portfolio-service";
import { getGitHubConnectionStatus } from "@/services/github";
import { AccountSettingsClient } from "@/dashboard/AccountSettingsClient";

export default async function AccountPage() {
  const userData = await requireAuth("/dashboard/account");
  const portfolios = await getUserPortfolios();
  const githubStatus = await getGitHubConnectionStatus();

  return (
    <AccountSettingsClient
      userData={userData}
      portfoliosCount={portfolios.length}
      githubConnected={githubStatus.isConnected}
      githubUsername={githubStatus.username}
    />
  );
}

