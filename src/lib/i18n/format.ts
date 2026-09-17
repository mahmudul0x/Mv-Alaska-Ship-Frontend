import { parseLocalDate } from "@/lib/dates";
import { parseMoney } from "@/lib/money";
import type { Money } from "@/lib/api/types";
import type { Lang } from "./index";

/**
 * Money, numbers and dates in the reader's own script.
 *
 * Bangla is a full locale here, not a translated label on English figures: a
 * dashboard that says "১২টি বুকিং" beside "12" reads as half-finished. Intl
 * does the digits, so ৳ 20,000.00 becomes ৳ ২০,০০০.০০ without a lookup table.
 *
 * These are the STAFF formatters. The public site stays English — the same
 * money helper is shared, and defaulting it to Bangla would change every page
 * a customer sees.
 */
const LOCALE: Record<Lang, string> = { en: "en-BD", bn: "bn-BD" };

/** "৳ 20,000.00" / "৳ ২০,০০০.০০" */
export function money(amount: Money, lang: Lang): string {
  const value = parseMoney(amount);
  const formatted = new Intl.NumberFormat(LOCALE[lang], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
  return `৳ ${formatted}`;
}

/** A plain count: "12" / "১২" */
export function num(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang]).format(value);
}

/** "17 Sept 2026" / "১৭ সেপ্টেম্বর ২০২৬" */
export function date(iso: string, lang: Lang): string {
  return parseLocalDate(iso).toLocaleDateString(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** A full timestamp, for logs and audit rows. */
export function dateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "45%" / "৪৫%" — the percent sign is the same glyph in both. */
export function percent(value: number | string, lang: Lang): string {
  return `${num(Number(value), lang)}%`;
}
