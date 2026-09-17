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
      // Dark glass, not the pale gold chip this started as. Every card that
      // shows this puts it ON THE PHOTO, and bg-gold/15 is a tint meant for a
      // white card — over a bright picture it washed out until the text was
      // unreadable. Ocean at 85% with a blur gives the light gold something to
      // sit on whatever the photograph behind it happens to be.
      //
      // Measured rather than eyeballed. Old chip on a mid-tone photograph:
      // 1.65:1, which is why it read as invisible. This one is 5.23:1 against
      // the worst case (a white photograph) and better on everything darker,
      // so it clears WCAG AA on any picture the client uploads.
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full bg-ocean/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-soft shadow-sm ring-1 ring-gold/45 backdrop-blur-md ${className}`}
    >
      <Tag aria-hidden="true" className="size-3 shrink-0 text-gold" />
      <span className="truncate">
        {offer.label ? `${offer.label} — ${offerSummary(offer)}` : offerSummary(offer)}
      </span>
    </span>
  );
}
