// Random-print products (the scarf, the Radio Tsybulia tees) show every possible print in turn:
// hold one, crossfade into the next, loop. Each print is a look of ONE purchasable product,
// never an SKU variant.
export const SCARF_PRINT_SECONDS = 5;
export const SCARF_FADE_SECONDS = 1.4;
export const TEE_PRINT_SECONDS = 3.5;
export const TEE_FADE_SECONDS = 0.9;

export function printCycleAt(seconds: number, count: number, holdSeconds: number, fadeSeconds: number) {
  const time = Math.max(0, seconds);
  const total = Math.max(1, count);
  const current = Math.floor(time / holdSeconds) % total;
  const progress = ((time % holdSeconds) - (holdSeconds - fadeSeconds)) / fadeSeconds;
  const blend = Math.min(1, Math.max(0, progress));
  return { current, next: (current + 1) % total, blend: blend * blend * (3 - 2 * blend) };
}

export const scarfPrintAt = (seconds: number, count: number) =>
  printCycleAt(seconds, count, SCARF_PRINT_SECONDS, SCARF_FADE_SECONDS);
