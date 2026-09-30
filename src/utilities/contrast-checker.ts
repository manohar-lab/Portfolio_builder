/**
 * WCAG 2.1 Color Contrast Validation Utility
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace(/^#/, "");
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (fullHex.length !== 6) return null;

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function calculateRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const normalize = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export interface ContrastCheckResult {
  pass: boolean; // AA standard 4.5:1 ratio
  ratio: number;
  warning?: string;
}

export function validateColorContrast(textColor: string, bgColor: string): ContrastCheckResult {
  const textRgb = hexToRgb(textColor);
  const bgRgb = hexToRgb(bgColor);

  if (!textRgb || !bgRgb) {
    return { pass: true, ratio: 21 }; // Fallback safe
  }

  const lum1 = calculateRelativeLuminance(textRgb);
  const lum2 = calculateRelativeLuminance(bgRgb);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;

  if (ratio < 4.5) {
    return {
      pass: false,
      ratio,
      warning: `Low contrast warning: Selected text and background color may be difficult to read (contrast ratio ${ratio}:1 < 4.5:1).`,
    };
  }

  return { pass: true, ratio };
}

export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}
