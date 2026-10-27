/**
 * Kalkulasi Rasio Kontras Warna Sesuai Standar WCAG 2.1
 * Memastikan QR Code memiliki kontras yang cukup untuk dipindai oleh sensor kamera.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return null;

  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export interface ContrastResult {
  ratio: number;
  isGood: boolean;
  level: 'EXCELLENT' | 'GOOD' | 'POOR';
  message: string;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): ContrastResult {
  const fg = hexToRgb(fgHex) || { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (brighter + 0.05) / (darker + 0.05);
  const roundedRatio = Math.round(ratio * 10) / 10;

  if (ratio >= 7.0) {
    return {
      ratio: roundedRatio,
      isGood: true,
      level: 'EXCELLENT',
      message: `Kontras Luar Biasa (${roundedRatio}:1). QR Code akan sangat mudah dibaca oleh semua kamera.`,
    };
  } else if (ratio >= 4.5) {
    return {
      ratio: roundedRatio,
      isGood: true,
      level: 'GOOD',
      message: `Kontras Baik (${roundedRatio}:1). Memenuhi standar scannability standar.`,
    };
  } else {
    return {
      ratio: roundedRatio,
      isGood: false,
      level: 'POOR',
      message: `Peringatan Kontras Rendah (${roundedRatio}:1). Kamera ponsel mungkin gagal memindai QR Code ini. Disarankan memilih warna yang lebih kontras.`,
    };
  }
}
