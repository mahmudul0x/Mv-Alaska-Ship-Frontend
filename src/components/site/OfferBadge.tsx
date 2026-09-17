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
      // Solid gold, the same accent the primary buttons use — a discount is
      // the loudest thing a card has to say, and it should not have to compete
      // with the photograph behind it. This started as a pale gold tint
      // (bg-gold/15) meant for a white card, which on a mid-tone photo came
      // out at 1.65:1 and was effectively invisible, then as dark glass, which
      // was legible but blended into the picture.
      //
      // Text is MIDNIGHT, not ocean: measured on the gradient's darkest end,
      // ocean gives 4.25:1 — under the 4.5:1 floor for text this size —
      // while midnight gives 5.58:1, and 6.80:1 on the light end. The
      // background is opaque, so unlike the earlier versions the contrast does
      // not depend on which photograph the client uploaded.
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full gradient-gold px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-midnight shadow-luxe ring-1 ring-gold-soft/60 ${className}`}
    >
      <Tag aria-hidden="true" className="size-3 shrink-0" />
      {/* The campaign name and the saving are not equally important. Run
          together in one weight — "EID OFFER — 19.97% OFF" — the pill reads as
          one long shout and the number, which is the part anyone actually
          wants, gets no emphasis at all. The name steps back; the figure is
          the thing. */}
      {offer.label && (
        <>
          {/* Weight carries the hierarchy, NOT opacity: fading this to 75%
              dropped it to 2.77:1 on gold and undid the whole point. */}
          <span className="truncate font-medium">{offer.label}</span>
          <span aria-hidden="true" className="opacity-45">
            ·
          </span>
        </>
      )}
      <span className="shrink-0 font-extrabold">{offerSummary(offer)}</span>
    </span>
  );
}
