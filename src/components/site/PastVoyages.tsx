import { useState } from "react";
import { Ban, ChevronDown, History, Loader2 } from "lucide-react";

import { useArchivedPackages } from "@/hooks/queries/usePackages";
import { parseLocalDate } from "@/lib/dates";
import type { Package } from "@/lib/api/types";
import fallbackImage from "@/assets/hero-cruise.jpg";

function dateRange(pkg: Package): string {
  const start = parseLocalDate(pkg.start_date);
  const end = parseLocalDate(pkg.end_date);
  const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${day(start)} – ${day(end)} ${end.getFullYear()}`;
}

/**
 * Sailings that have returned, and sailings that were called off.
 *
 * Collapsed by default, and the request is not made until it is opened — the
 * archive is context for someone who goes looking, not something every visitor
 * should wait for. Live voyages are what the page is for.
 *
 * Cancelled sailings are kept visually distinct from finished ones. Both are
 * "no longer bookable", but one is a voyage that happened and the other is one
 * that never did, and a reader who sailed on a date we later called off should
 * not have to work out which is which.
 */
export function PastVoyages() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useArchivedPackages(open);

  return (
    <section className="py-16 bg-muted/30 border-t border-border">
      <div className="container-luxe">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-4 text-left group"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="size-10 rounded-full bg-background border border-border grid place-items-center shrink-0">
              <History aria-hidden="true" className="size-4 text-gold" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl leading-tight">
                Past &amp; cancelled voyages
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Sailings that have already returned, and departures we had to call off
              </span>
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-5 shrink-0 text-muted-foreground transition-transform group-hover:text-gold ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="mt-8">
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground text-sm">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            )}
            {isError && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Couldn&rsquo;t load these right now — please try again shortly.
              </div>
            )}
            {data && data.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nothing here yet — every voyage we have run is still ahead of you.
              </div>
            )}
            {data && data.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((pkg) => {
                  const cancelled = pkg.archive_reason === "cancelled";
                  return (
                    <li
                      key={pkg.id}
                      className="rounded-2xl border border-border bg-card overflow-hidden flex"
                    >
                      <div className="relative w-28 shrink-0 bg-muted">
                        <img
                          src={pkg.hero_image || fallbackImage}
                          alt=""
                          loading="lazy"
                          // Drained of colour: these are a record, and full
                          // colour makes them compete with the voyages that
                          // are actually on sale above.
                          className="absolute inset-0 h-full w-full object-cover grayscale opacity-70"
                        />
                      </div>
                      <div className="flex-1 min-w-0 p-4">
                        <div className="font-medium text-sm truncate">
                          {pkg.marketing_title || `${pkg.ship.name} Voyage`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {dateRange(pkg)}
                        </div>
                        <span
                          className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ring-1 ${
                            cancelled
                              ? "bg-destructive/10 text-destructive ring-destructive/25"
                              : "bg-muted text-muted-foreground ring-border"
                          }`}
                        >
                          {cancelled && <Ban aria-hidden="true" className="size-2.5" />}
                          {cancelled ? "Cancelled" : "Completed"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
