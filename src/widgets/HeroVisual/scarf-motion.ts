// All eight prints belong to one random-print product, never to SKU variants.
export const SCARF_PRINT_SECONDS = 5;
export const SCARF_FADE_SECONDS = 1.4;

export function scarfPrintAt(seconds: number, count: number) {
  const time = Math.max(0, seconds);
  const current = Math.floor(time / SCARF_PRINT_SECONDS) % Math.max(1, count);
  const progress =
    ((time % SCARF_PRINT_SECONDS) - (SCARF_PRINT_SECONDS - SCARF_FADE_SECONDS)) / SCARF_FADE_SECONDS;
  const blend = Math.min(1, Math.max(0, progress));
  return { current, next: (current + 1) % Math.max(1, count), blend: blend * blend * (3 - 2 * blend) };
}
