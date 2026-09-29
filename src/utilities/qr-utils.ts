import QRCode from "qrcode";

export interface QrOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate PNG data URL for a given public portfolio URL
 */
export async function generateQrPngDataUrl(
  url: string,
  options?: QrOptions
): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: options?.width || 300,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.color?.dark || "#0f172a", // slate-900
        light: options?.color?.light || "#ffffff",
      },
    });
  } catch (err: unknown) {
    console.error("QR Code generation error:", err);
    throw new Error("Failed to generate QR code PNG data URL");
  }
}

/**
 * Generate SVG string for a given public portfolio URL
 */
export async function generateQrSvgString(
  url: string,
  options?: QrOptions
): Promise<string> {
  try {
    return await QRCode.toString(url, {
      type: "svg",
      width: options?.width || 300,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.color?.dark || "#0f172a",
        light: options?.color?.light || "#ffffff",
      },
    });
  } catch (err: unknown) {
    console.error("QR SVG generation error:", err);
    throw new Error("Failed to generate QR code SVG string");
  }
}

/**
 * Trigger file download of QR code in PNG or SVG format
 */
export async function downloadQrCode(
  url: string,
  filename: string,
  format: "png" | "svg" = "png",
  size: number = 300
): Promise<void> {
  if (typeof window === "undefined") return;

  if (format === "png") {
    const dataUrl = await generateQrPngDataUrl(url, { width: size });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const svgString = await generateQrSvgString(url, { width: size });
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }
}
