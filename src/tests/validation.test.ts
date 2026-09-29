import { describe, it, expect } from "vitest";
import { UserProfileSchema, ProjectItemSchema, ThemeConfigSchema } from "../validation/portfolio.schema";

describe("Zod Portfolio Validation Schemas", () => {
  it("should validate UserProfileSchema correctly", () => {
    const validProfile = {
      fullName: "Alice Smith",
      headline: "AI/ML Engineer",
      bio: "Researcher specializing in Computer Vision.",
      avatarUrl: "https://example.com/avatar.jpg",
      isAvailableForWork: true,
    };

    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);

    const invalidProfile = {
      fullName: "", // required
      headline: "Architect",
    };
    const invalidResult = UserProfileSchema.safeParse(invalidProfile);
    expect(invalidResult.success).toBe(false);
  });

  it("should validate ProjectItemSchema correctly", () => {
    const validProject = {
      id: "p-100",
      title: "Distributed Cache Engine",
      shortDescription: "In-memory caching engine built with Rust.",
      technologies: ["Rust", "gRPC"],
      isCurrent: false,
      isFeatured: true,
    };

    const result = ProjectItemSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("should validate ThemeConfigSchema correctly", () => {
    const validTheme = {
      mode: "dark",
      primaryColor: "#6366f1",
      fontFamily: "sans",
      borderRadius: "lg",
      animationLevel: "full",
      layoutSpacing: "spacious",
    };

    const result = ThemeConfigSchema.safeParse(validTheme);
    expect(result.success).toBe(true);

    const invalidTheme = {
      mode: "invalid_mode",
      primaryColor: "not-a-hex",
    };
    const invalidResult = ThemeConfigSchema.safeParse(invalidTheme);
    expect(invalidResult.success).toBe(false);
  });
});
