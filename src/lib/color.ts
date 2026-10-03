function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim().replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: [number, number, number] = [255, 255, 255];
const INK: [number, number, number] = [15, 23, 42];

const toHex = (rgb: [number, number, number]) =>
  `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

const scale = (rgb: [number, number, number], factor: number) =>
  rgb.map((c) => c * factor) as [number, number, number];

export type ChipColors = { background: string; foreground: string };

/**
 * Picks a background/foreground pair that clears 4.5:1 for a filled chip.
 *
 * Category colours come from the database, so no single hardcoded foreground
 * works for every hue. Mid-tone colours (a mid violet, for instance) are the
 * awkward case: white and dark ink both miss the threshold, so the background
 * itself is darkened until white text passes.
 */
export function readableChip(hex: string, minRatio = 4.5): ChipColors | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;

  if (contrastRatio(rgb, WHITE) >= minRatio) {
    return { background: hex, foreground: toHex(WHITE) };
  }
  if (contrastRatio(rgb, INK) >= minRatio) {
    return { background: hex, foreground: toHex(INK) };
  }

  for (let factor = 0.95; factor >= 0.2; factor -= 0.05) {
    const darkened = scale(rgb, factor);
    if (contrastRatio(darkened, WHITE) >= minRatio) {
      return { background: toHex(darkened), foreground: toHex(WHITE) };
    }
  }
  return { background: toHex(scale(rgb, 0.2)), foreground: toHex(WHITE) };
}
/** Inline style for a filled chip, or undefined when the colour is unusable. */
export function chipStyle(
  hex: string,
): { backgroundColor: string; color: string } | undefined {
  const chip = readableChip(hex);
  return chip
    ? { backgroundColor: chip.background, color: chip.foreground }
    : undefined;
}
