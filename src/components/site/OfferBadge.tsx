import { Tag } from "lucide-react";

import { formatBDT } from "@/lib/money";
import type { PackageOffer } from "@/lib/api/types";

/** What an offer is worth, in the fewest words that are still true.
 *
 *  A percentage is stated as-is. A fixed amount says "per cabin", because it
 *  comes off each cabin — a family taking three cabins gets it three times,
 *  and "৳1,500 off" alone would understate that as badly as it overstates a
 *  single-cabin booking's saving if we multiplied it here without knowing how
 *  many they will take. */
export function offerSummary(offer: PackageOffer): string {
  if (offer.type === "percent") {
    // "20.00" reads as a price, not a percentage. Trim to what was meant.
    return `${Number.parseFloat(offer.value)}% off`;
  }
  return `${formatBDT(offer.value)} off per cabin`;
}

/**
 * The offer chip for a package card.
 *
 * Deliberately does not restate the price. The card's "from / adult" figure is
 * one component of a cabin's cost, and the discount applies to the whole cabin
 * — so a struck-through per-adult price would be a number the customer is
 * never actually charged. The real money is shown on the booking page, where
 * the server has quoted it.
 */
export function OfferBadge({ offer, className = "" }: { offer: PackageOffer; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-text ring-1 ring-gold/35 ${className}`}
    >
      <Tag aria-hidden="true" className="size-3 shrink-0" />
      {offer.label ? `${offer.label} — ${offerSummary(offer)}` : offerSummary(offer)}
    </span>
  );
}
