import { ArrowRight, CalendarDays, Check, Clock, MapPin, Moon } from "lucide-react";

import { usePackages } from "@/hooks/queries/usePackages";
import { parseLocalDate } from "@/lib/dates";
import { formatBDT } from "@/lib/money";
import type { Package } from "@/lib/api/types";
import fallbackImg from "@/assets/110.jpeg";

type Props = {
  selectedPackageId?: number;
  onSelectPackage: (pkg: Package) => void;
};

function formatRange(start: string, end: string) {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const startFmt = s.toLocaleDateString("en-GB", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const endFmt = e.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${startFmt} – ${endFmt}`;
}

/* Skeleton card shown while voyages load — mirrors the real card's bones. */
function PackageSkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="bg-card p-5 space-y-3">
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex items-end justify-between pt-3 border-t border-dashed border-border">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-8 w-24 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function PackagePicker({ selectedPackageId, onSelectPackage }: Props) {
  const { data: packages, isLoading, isError } = usePackages();

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <PackageSkeleton />
        <PackageSkeleton />
      </div>
    );
  }

  if (isError || !packages) {
    return (
      <div className="p-10 rounded-2xl border border-dashed border-border text-sm text-muted-foreground text-center">
        Couldn't load voyages right now — please refresh and try again.
      </div>
    );
  }

  const bookable = packages.filter((p) => p.is_bookable);
  const closed = packages.filter((p) => !p.is_bookable);
  const ordered = [...bookable, ...closed];

  if (ordered.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-border text-center space-y-2">
        <div className="font-display text-xl text-foreground">No voyages published yet</div>
        <p className="text-sm text-muted-foreground">
          Please check back soon, or contact our concierge for the next departure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs">
        <span className="eyebrow text-muted-foreground text-[10px]">
          {ordered.length} voyage{ordered.length === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {bookable.length} open for booking
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {ordered.map((pkg) => {
          const selected = pkg.id === selectedPackageId;
          const disabled = !pkg.is_bookable;
          return (
            <button
              key={pkg.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelectPackage(pkg)}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                disabled
                  ? "cursor-not-allowed opacity-55 border-border grayscale-35"
                  : selected
                    ? "border-gold shadow-luxe ring-1 ring-gold cursor-pointer"
                    : "border-border hover:border-gold/60 hover:shadow-luxe hover:-translate-y-1 cursor-pointer"
              }`}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={pkg.hero_image || fallbackImg}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
                    !disabled && "group-hover:scale-105"
                  }`}
                />
                <div className="absolute inset-0 bg-linear-to-t from-ocean/90 via-ocean/25 to-transparent" />

                {/* Status pill */}
                <div className="absolute top-3 left-3">
                  {pkg.is_bookable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 backdrop-blur-md px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-200 ring-1 ring-emerald-400/40">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                      <Clock className="size-2.5" /> Closed
                    </span>
                  )}
                </div>

                {/* Selected check */}
                {selected && (
                  <div className="absolute top-3 right-3 size-7 rounded-full gradient-gold grid place-items-center shadow-luxe">
                    <Check className="size-4 text-ocean" strokeWidth={3} />
                  </div>
                )}

                {/* Title over image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-1.5 text-gold-soft text-[10px] eyebrow">
                    <MapPin className="size-3" /> {pkg.ship.name}
                  </div>
                  <div className="font-display text-xl leading-tight text-background mt-0.5 line-clamp-1">
                    {pkg.marketing_title || `${pkg.ship.name} Voyage`}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-3 bg-card p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-gold" />
                    {formatRange(pkg.start_date, pkg.end_date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Moon className="size-3.5 text-gold" />
                    {pkg.days} {pkg.days === 1 ? "day" : "days"} · {pkg.nights}{" "}
                    {pkg.nights === 1 ? "night" : "nights"}
                  </span>
                </div>

                {pkg.marketing_description && (
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {pkg.marketing_description}
                  </p>
                )}

                {pkg.highlights?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.highlights.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="rounded-full bg-ocean/5 px-2.5 py-1 text-[10px] font-medium text-ocean/80"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-end justify-between border-t border-dashed border-border pt-3.5">
                  <div>
                    <div className="eyebrow text-[9px] text-muted-foreground">From / adult</div>
                    <div className="font-display text-xl text-gold-text leading-none mt-1">
                      {formatBDT(pkg.adult_price)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                      disabled
                        ? "bg-muted text-muted-foreground"
                        : selected
                          ? "gradient-gold text-ocean shadow-luxe"
                          : "bg-ocean/8 text-ocean group-hover:bg-ocean group-hover:text-background"
                    }`}
                  >
                    {disabled ? (
                      <>
                        <Clock className="size-3" /> Closed
                      </>
                    ) : selected ? (
                      <>
                        <Check className="size-3" /> Selected
                      </>
                    ) : (
                      <>
                        Select <ArrowRight className="size-3" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
