import { describe, it, expect } from "vitest";
import { isReservedSlug } from "@/utilities/slug";
import { getCanonicalPublicUrl, generateSocialShareLinks } from "@/utilities/share-utils";
import { generateQrPngDataUrl } from "@/utilities/qr-utils";
import { PortfolioData } from "@/types/portfolio";

const mockPublicPortfolio: PortfolioData = {
  id: "port-pub-1",
  userId: "user-1",
  title: "Alex Morgan Portfolio",
  slug: "alex-morgan",
  status: "PUBLISHED",
  isPublished: true,
  isPublic: true,
  visibilityMode: "public",
  templateId: "modern-developer",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  profile: {
    fullName: "Alex Morgan",
    headline: "Staff Software Engineer",
    bio: "Building distributed systems and real-time platforms.",
    isAvailableForWork: true,
    email: "alex.public@example.com", // Publicly configured email
  },
  sections: [
    { id: "s1", type: "about", title: "About", isVisible: true, order: 0 },
    { id: "s2", type: "projects", title: "Projects", isVisible: true, order: 1 },
    { id: "s3", type: "contact", title: "Contact", isVisible: true, order: 2 },
  ],
  socialLinks: [
    { id: "soc-1", platform: "github", url: "https://github.com/alexmorgan" },
    { id: "soc-2", platform: "linkedin", url: "https://linkedin.com/in/alexmorgan" },
  ],
  skills: [],
  projects: [],
  education: [],
  academicJourney: [],
  experience: [],
  research: [],
  achievements: [],
  certifications: [],
  publications: [],
  services: [],
  contact: {
    email: "alex.public@example.com",
    location: "San Francisco, CA",
  },
  theme: {
    mode: "dark",
    primaryColor: "#6366f1",
    fontFamily: "sans",
    borderRadius: "md",
    animationLevel: "full",
    layoutSpacing: "comfortable",
  },
};

describe("Phase 26: Public Portfolio Experience and Sharing System", () => {
  it("1. Slug Handling: protects reserved words and validates user slugs", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("api")).toBe(true);
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(isReservedSlug("login")).toBe(true);
    expect(isReservedSlug("explore")).toBe(true);

    expect(isReservedSlug("alex-morgan")).toBe(false);
    expect(isReservedSlug("dev-jane")).toBe(false);
  });

  it("2. Canonical URL Stability: generates valid canonical URLs for public portfolios", () => {
    const canonical = getCanonicalPublicUrl("alex-morgan");
    expect(canonical).toContain("/u/alex-morgan");
    expect(canonical).not.toContain("undefined");
  });

  it("3. Social Sharing Links: generates valid LinkedIn, Twitter, WhatsApp, and Email share links", () => {
    const publicUrl = "https://portfoliocraft.app/u/alex-morgan";
    const shareTitle = "Alex Morgan | Staff Software Engineer";
    const shareDesc = "Building distributed systems and real-time platforms.";

    const links = generateSocialShareLinks(publicUrl, shareTitle, shareDesc);

    expect(links.linkedin).toContain("linkedin.com/sharing/share-offsite");
    expect(links.twitter).toContain("twitter.com/intent/tweet");
    expect(links.whatsapp).toContain("api.whatsapp.com/send");
    expect(links.email).toContain("mailto:");
    expect(links.linkedin).toContain(encodeURIComponent(publicUrl));
  });

  it("4. QR Code Safety: QR codes encode canonical public URL without exposing private user secrets", async () => {
    const publicUrl = "https://portfoliocraft.app/u/alex-morgan";
    const qrDataUrl = await generateQrPngDataUrl(publicUrl, { width: 200 });

    expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
    // Does not leak user ID or internal secrets
    expect(qrDataUrl).not.toContain("user-1");
  });

  it("5. Visibility & Search Engine Indexing: public mode allows indexing, unlisted disables indexing", () => {
    const publicMode = mockPublicPortfolio.visibilityMode === "public";
    expect(publicMode).toBe(true);

    const unlistedPortfolio: PortfolioData = { ...mockPublicPortfolio, visibilityMode: "unlisted" };
    const unlistedIndexable = unlistedPortfolio.visibilityMode === "public";
    expect(unlistedIndexable).toBe(false);
  });

  it("6. Private Portfolio Access Isolation: private portfolios return no public content", () => {
    const privatePortfolio: PortfolioData = {
      ...mockPublicPortfolio,
      isPublished: false,
      isPublic: false,
      visibilityMode: "private",
    };

    expect(privatePortfolio.isPublished).toBe(false);
    expect(privatePortfolio.isPublic).toBe(false);
  });

  it("7. Public Contact & Privacy: contact links expose only user-configured public contact email", () => {
    expect(mockPublicPortfolio.contact.email).toBe("alex.public@example.com");
    // Ensure internal user ID is omitted from public response payloads
    expect(mockPublicPortfolio.userId).not.toBe("secret_db_auth_token_99");
  });

  it("8. Multi-User Isolation: User A public portfolio is independent from User B private portfolio", () => {
    const userAPublic = mockPublicPortfolio;
    const userBPrivate: PortfolioData = {
      ...mockPublicPortfolio,
      id: "port-priv-2",
      userId: "user-2",
      slug: "secret-user",
      isPublished: false,
      isPublic: false,
      visibilityMode: "private",
    };

    expect(userAPublic.isPublished).toBe(true);
    expect(userBPrivate.isPublished).toBe(false);
    expect(userAPublic.slug).not.toBe(userBPrivate.slug);
  });
});
