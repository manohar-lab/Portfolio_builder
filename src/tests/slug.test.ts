import { describe, it, expect } from "vitest";
import { generateSlug, isReservedSlug, isValidSlug } from "../utilities/slug";

describe("Slug Utility Functions", () => {
  it("should generate clean url-safe slugs", () => {
    expect(generateSlug("John Doe")).toBe("john-doe");
    expect(generateSlug("  AI / ML Engineer & Researcher  ")).toBe("ai-ml-engineer-researcher");
    expect(generateSlug("Jane_Doe-123!!!")).toBe("jane-doe-123");
  });

  it("should identify reserved platform slugs", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("api")).toBe(true);
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(isReservedSlug("auth")).toBe(true);
    expect(isReservedSlug("johndoe")).toBe(false);
  });

  it("should validate slugs according to length, format, and reservation rules", () => {
    expect(isValidSlug("ab")).toEqual({ valid: false, reason: "Slug must be at least 3 characters long." });
    expect(isValidSlug("admin")).toEqual({ valid: false, reason: 'The URL slug "admin" is reserved by the platform.' });
    expect(isValidSlug("john-doe")).toEqual({ valid: true });
  });
});
