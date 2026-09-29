/**
 * PortfolioCraft - Social Sharing & Public Identity Utilities
 */

export function getCanonicalPublicUrl(slug: string): string {
  const domain =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${domain.replace(/\/$/, "")}/u/${encodeURIComponent(slug)}`;
}

export interface ShareLinks {
  linkedin: string;
  whatsapp: string;
  twitter: string;
  email: string;
}

export function generateSocialShareLinks(
  url: string,
  title: string,
  description: string
): ShareLinks {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} — ${description}`);

  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function triggerNativeWebShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (typeof window !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err: unknown) {
      // Ignore AbortError if user cancels share dialog
      if (err instanceof Error && err.name === "AbortError") {
        return true;
      }
      return false;
    }
  }
  return false;
}
