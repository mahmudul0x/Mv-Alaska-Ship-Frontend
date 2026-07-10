import type { Money } from "./api/types";

/** Backend money is Decimal-as-string; parse only for arithmetic/comparison,
 * never for direct display (display via formatBDT to avoid float rounding). */
export function parseMoney(amount: Money): number {
  return Number.parseFloat(amount);
}

/** Formats a Decimal-as-string amount as "৳ 11,000.00". */
export function formatBDT(amount: Money): string {
  const value = parseMoney(amount);
  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `৳ ${formatted}`;
}
