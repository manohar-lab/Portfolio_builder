import { describe, it, expect } from "vitest";
import { getCanonicalPublicUrl, generateSocialShareLinks } from "../utilities/share-utils";
import { generateQrPngDataUrl, generateQrSvgString } from "../utilities/qr-utils";

describe("Phase 13 Public Identity & Sharing Tests", () => {
  it("should generate valid canonical public portfolio URLs", () => {
    const canonical = getCanonicalPublicUrl("naveen-kumar");
    expect(canonical).toContain("/u/naveen-kumar");
  });

  it("should generate correct social sharing intent URLs", () => {
    const url = "https://portfoliocraft.app/u/naveen-kumar";
    const title = "Naveen Kumar | AI/ML Developer";
    const desc = "Portfolio of Naveen Kumar — projects, skills, research.";

    const links = generateSocialShareLinks(url, title, desc);

    expect(links.linkedin).toContain("linkedin.com/sharing/share-offsite");
    expect(links.linkedin).toContain(encodeURIComponent(url));

    expect(links.whatsapp).toContain("api.whatsapp.com/send");
    expect(links.whatsapp).toContain(encodeURIComponent(url));

    expect(links.twitter).toContain("twitter.com/intent/tweet");
    expect(links.twitter).toContain(encodeURIComponent(url));

    expect(links.email).toContain("mailto:");
    expect(links.email).toContain(encodeURIComponent(title));
  });

  it("should generate valid scannable QR Code PNG data URLs and SVG strings", async () => {
    const testUrl = "https://portfoliocraft.app/u/naveen-kumar";

    const dataUrl = await generateQrPngDataUrl(testUrl, { width: 300 });
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);

    const svgString = await generateQrSvgString(testUrl, { width: 300 });
    expect(svgString).toContain("<svg");
    expect(svgString).toContain("</svg>");
  });
});
