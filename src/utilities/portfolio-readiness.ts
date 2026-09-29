import { PortfolioData } from "@/types/portfolio";

export interface ReadinessCheckItem {
  id: string;
  label: string;
  isComplete: boolean;
  weight: number;
}

export interface PortfolioReadinessResult {
  score: number; // 0 to 100
  items: ReadinessCheckItem[];
  completedCount: number;
  totalCount: number;
}

/**
 * Calculates dynamic portfolio completion percentage and checklist items.
 */
export function calculatePortfolioReadiness(portfolio: PortfolioData): PortfolioReadinessResult {
  const items: ReadinessCheckItem[] = [
    {
      id: "name",
      label: "Full Name provided",
      isComplete: Boolean(portfolio.profile?.fullName && portfolio.profile.fullName.trim() !== ""),
      weight: 15,
    },
    {
      id: "headline",
      label: "Professional Headline added",
      isComplete: Boolean(portfolio.profile?.headline && portfolio.profile.headline.trim() !== ""),
      weight: 15,
    },
    {
      id: "bio",
      label: "About / Bio summary written",
      isComplete: Boolean(portfolio.profile?.bio && portfolio.profile.bio.trim() !== ""),
      weight: 10,
    },
    {
      id: "avatar",
      label: "Profile Image / Avatar added",
      isComplete: Boolean(portfolio.profile?.avatarUrl && portfolio.profile.avatarUrl.trim() !== ""),
      weight: 10,
    },
    {
      id: "projects",
      label: "At least 1 Project featured",
      isComplete: Boolean(portfolio.projects && portfolio.projects.length > 0),
      weight: 20,
    },
    {
      id: "skills",
      label: "Skills & Technologies added",
      isComplete: Boolean(portfolio.skills && portfolio.skills.length > 0),
      weight: 10,
    },
    {
      id: "education",
      label: "Education background added",
      isComplete: Boolean(portfolio.education && portfolio.education.length > 0),
      weight: 10,
    },
    {
      id: "socials",
      label: "Social links attached",
      isComplete: Boolean(portfolio.socialLinks && portfolio.socialLinks.length > 0),
      weight: 10,
    },
  ];

  const earnedWeight = items.reduce((acc, curr) => (curr.isComplete ? acc + curr.weight : acc), 0);
  const completedCount = items.filter((i) => i.isComplete).length;

  return {
    score: Math.min(100, earnedWeight),
    items,
    completedCount,
    totalCount: items.length,
  };
}
