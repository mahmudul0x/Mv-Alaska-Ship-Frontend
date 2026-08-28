import { Anchor, ArrowUpRight } from "lucide-react";

import fallbackImage from "@/assets/109.jpeg";

/** The sister ship's own photo, served from public/ rather than imported.
 *
 *  A static import is resolved at build time, so a missing file fails the
 *  build; from public/ a missing file is just a broken <img>, which the
 *  onError below turns back into the bundled fallback. Drop the photo at
 *  public/mv-crown.jpg and it appears — no code change, no broken deploy in
 *  between. */
const SHIP_PHOTO = "/mv-crown.jpg";

/** The company's other vessel. Defined once so the name and the URL cannot
 *  drift apart across the three places that point at it. */
export const SISTER_SHIP = {
  name: "MV Crown Cruise",
  shortName: "MV Crown",
  url: "https://www.mvcrowncruise.com/",
} as const;

/**
 * Cross-link to the sister ship, for the moments a visitor is deciding between
 * vessels rather than between dates: the package step, where they may have
 * come looking for a sailing this ship does not run.
 *
 * It leaves the site, so it says so — a new tab, an outward arrow, and
 * rel="noopener" (a target=_blank link without it hands the opened page a
 * writable reference back to this one).
 */
export function SisterShipCard({ className = "" }: { className?: string }) {
  return (
    <a
      href={SISTER_SHIP.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-2xl border border-border bg-card shadow-luxe overflow-hidden hover-lift ${className}`}
    >
      <div className="relative h-36 overflow-hidden bg-ocean">
        <img
          src={SHIP_PHOTO}
          alt={SISTER_SHIP.name}
          loading="lazy"
          onError={(event) => {
            // Photo not added yet — fall back rather than showing a broken
            // tile. Clearing the handler first stops a loop if the fallback
            // itself ever fails.
            const img = event.currentTarget;
            if (img.src.endsWith(fallbackImage)) return;
            img.onerror = null;
            img.src = fallbackImage;
          }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ocean/95 via-ocean/35 to-transparent" />
        <div className="absolute bottom-2.5 left-4 right-4 flex items-start gap-2 eyebrow text-gold-soft text-[10px] leading-relaxed">
          <Anchor className="size-3.5 shrink-0 mt-0.5" />
          Same company, another ship
        </div>
      </div>

      <div className="p-5 space-y-2">
        <div className="font-display text-xl leading-tight">Sailing elsewhere?</div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Meet {SISTER_SHIP.name} — our sister ship&apos;s own voyages and departures.
        </p>
        <span className="inline-flex items-center gap-1.5 pt-1 text-gold-text text-xs uppercase tracking-[0.16em] font-semibold group-hover:gap-2.5 transition-all">
          Visit {SISTER_SHIP.name}
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </a>
  );
}
