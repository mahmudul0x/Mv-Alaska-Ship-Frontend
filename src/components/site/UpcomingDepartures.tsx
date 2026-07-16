import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Anchor, ArrowUpRight, Clock } from "lucide-react";

import { SectionHeader } from "./SectionHeader";
import { usePackages } from "@/hooks/queries/usePackages";
import { parseLocalDate } from "@/lib/dates";
import { formatBDT } from "@/lib/money";

/** Live "next sailings" strip on the homepage — the fastest route from landing
 * to the booking wizard. Renders nothing while loading or when no voyage is
 * open, so the page never shows an empty shell. */
export function UpcomingDepartures() {
  const { data: packages } = usePackages();
  // API is ordered by start_date, so the first bookable ones are the soonest.
  const upcoming = (packages ?? []).filter((p) => p.is_bookable).slice(0, 3);
  if (!upcoming.length) return null;

  return (
    <section className="relative py-20 md:py-24 bg-background border-b border-border">
      <div className="container-luxe">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <SectionHeader
            eyebrow="Now boarding"
            title={
              <>
                Upcoming <em className="not-italic text-gradient-gold">departures.</em>
              </>
            }
            description="Real sailing dates, open for booking right now — pick one and reserve your room in minutes."
          />
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-ocean text-sm uppercase tracking-[0.18em] hover:text-gold transition-colors border-b border-ocean/30 hover:border-gold pb-1 self-start"
          >
            All packages <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {upcoming.map((pkg, i) => {
            const start = parseLocalDate(pkg.start_date);
            const end = parseLocalDate(pkg.end_date);
            const title = pkg.marketing_title || `${pkg.ship.name} Voyage`;
            return (
              <motion.article
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-border bg-card shadow-luxe overflow-hidden hover-lift"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    {/* Depart → return, boarding-pass style */}
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="font-display text-3xl leading-none">
                          {start.toLocaleDateString("en-GB", { day: "2-digit" })}
                        </div>
                        <div className="eyebrow text-[9px] text-gold-text mt-1">
                          {start.toLocaleDateString("en-GB", { month: "short" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gold/70">
                        <span className="h-px w-4 bg-gold/50" />
                        <Anchor className="size-3" />
                        <span className="h-px w-4 bg-gold/50" />
                      </div>
                      <div className="text-center">
                        <div className="font-display text-3xl leading-none">
                          {end.toLocaleDateString("en-GB", { day: "2-digit" })}
                        </div>
                        <div className="eyebrow text-[9px] text-gold-text mt-1">
                          {end.toLocaleDateString("en-GB", { month: "short" })}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600 ring-1 ring-emerald-500/30">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Booking open
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-light leading-tight">{title}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-gold" />
                    {pkg.nights} Days · {pkg.nights - 1} Nights · {pkg.ship.name}
                  </div>

                  <div className="mt-6 pt-5 border-t border-border flex items-end justify-between">
                    <div>
                      <div className="eyebrow text-muted-foreground text-[10px]">From / adult</div>
                      <div className="font-display text-2xl text-foreground">
                        {formatBDT(pkg.adult_price)}
                      </div>
                    </div>
                    <Link
                      to="/booking"
                      search={{ package: pkg.id }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-gold text-ocean text-[10px] uppercase tracking-[0.2em] font-semibold shadow-gold"
                    >
                      Reserve <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
