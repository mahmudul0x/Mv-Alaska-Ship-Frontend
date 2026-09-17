import { formatBDT } from "@/lib/money";
import type { Package } from "@/lib/api/types";

const SIZES = {
  sm: { now: "text-xl", was: "text-xs", label: "text-[9px]" },
  md: { now: "text-2xl", was: "text-sm", label: "text-[10px]" },
  lg: { now: "text-3xl", was: "text-base", label: "text-[10px]" },
} as const;

/**
 * The "From / adult" headline on a package card, with the pre-offer price
 * struck through when there is one.
 *
 * Both figures come from the server. The client never works out a discounted
 * price — a browser rounding money differently from the backend is a card that
 * advertises one number and a checkout that charges another.
 *
 * A fixed-amount offer has no "after" price here, and that is not an omission:
 * a flat discount comes off the whole cabin, so stating it against a per-adult
 * headline would show a family of four a quarter of their real saving. Those
 * offers are stated in their own terms on the badge beside this.
 */
export function PackagePrice({
  pkg,
  size = "md",
  tone = "default",
}: {
  pkg: Package;
  size?: keyof typeof SIZES;
  tone?: "default" | "gold";
}) {
  const s = SIZES[size];
  const was = pkg.offer?.adult_price_after ? pkg.offer.adult_price_before : null;
  const now = pkg.offer?.adult_price_after ?? pkg.adult_price;

  return (
    <div>
      <div className={`eyebrow text-muted-foreground ${s.label}`}>From / adult</div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <div
          className={`font-display leading-none ${s.now} ${
            tone === "gold" || was ? "text-gold-text" : "text-foreground"
          }`}
        >
          {formatBDT(now)}
        </div>
        {was && (
          <div className={`${s.was} text-muted-foreground line-through decoration-1`}>
            {formatBDT(was)}
          </div>
        )}
      </div>
    </div>
  );
}
