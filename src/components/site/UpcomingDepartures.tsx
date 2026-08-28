import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, BedDouble, CalendarDays, Clock, MapPin } from "lucide-react";

import { SectionHeader } from "./SectionHeader";
import { usePackages } from "@/hooks/queries/usePackages";
import { parseLocalDate } from "@/lib/dates";
import { formatBDT } from "@/lib/money";
import fallbackImage from "@/assets/hero-cruise.jpg";
import type { Package } from "@/lib/api/types";

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
                Upcoming <em className="not-italic">departures.</em>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcoming.map((pkg, i) => (
            <DepartureCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

const shortDate = (iso: string) =>
  parseLocalDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function DepartureCard({ pkg, index }: { pkg: Package; index: number }) {
  const start = parseLocalDate(pkg.start_date);
  const end = parseLocalDate(pkg.end_date);
  const sameYear = start.getFullYear() === end.getFullYear();
  const dateRange = `${
    sameYear ? shortDate(pkg.start_date) : `${shortDate(pkg.start_date)} ${start.getFullYear()}`
  } – ${shortDate(pkg.end_date)} ${end.getFullYear()}`;

  // Cabins are counted server-side by the same rule the deck plan paints tiles
  // with, so this number cannot promise more than the room picker will offer.
  const free = pkg.cabins_free;
  const almostGone = free > 0 && free <= 3;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex flex-col rounded-2xl border border-border bg-card shadow-luxe overflow-hidden hover-lift"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <img
          src={pkg.hero_image || fallbackImage}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-sm px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-500/30">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Booking open
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl font-light leading-tight">{dateRange}</h3>
          {/* The scarcity line, only when it is true. "0 cabins free" on a card
              headed "Booking open" is a contradiction, so a sold-out sailing
              says so instead. */}
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ring-1 whitespace-nowrap ${
              free === 0
                ? "bg-muted text-muted-foreground ring-border"
                : almostGone
                  ? "bg-gold/12 text-gold-text ring-gold/35"
                  : "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25"
            }`}
          >
            {free === 0 ? "Fully booked" : `${free} cabin${free === 1 ? "" : "s"} free`}
          </span>
        </div>

        <div className="mt-1.5 eyebrow text-gold-text text-[10px]">{pkg.ship.name}</div>

        {pkg.marketing_description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {pkg.marketing_description}
          </p>
        )}

        {/* Three facts, evenly weighted — the ones people compare sailings on. */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border">
          <Fact icon={Clock} label="Duration" value={`${pkg.days}D/${pkg.nights}N`} />
          <Fact icon={CalendarDays} label="Departs" value={shortDate(pkg.start_date)} />
          <Fact icon={BedDouble} label="Cabins" value={free === 0 ? "None" : `${free} free`} />
        </div>

        <div className="mt-5">
          <div className="eyebrow text-muted-foreground text-[10px]">From / adult</div>
          <div className="font-display text-2xl text-foreground">{formatBDT(pkg.adult_price)}</div>
        </div>

        {/* mt-auto: cards in a row have different description lengths, and the
            actions should still line up along the bottom edge. */}
        <div className="mt-5 pt-1 flex gap-3 mt-auto">
          <Link
            to="/booking"
            search={{ package: pkg.id }}
            className="flex-1 text-center px-4 py-3 rounded-full gradient-gold text-ocean text-[10px] uppercase tracking-[0.16em] font-semibold shadow-gold hover-lift"
          >
            Book now
          </Link>
          <Link
            to="/packages"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-border text-[10px] uppercase tracking-[0.16em] font-semibold hover:border-gold hover:text-gold transition-colors"
          >
            <MapPin className="size-3.5 shrink-0" />
            Itinerary
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="px-2 py-3.5 text-center">
      <Icon className="size-4 text-gold mx-auto" />
      <div className="eyebrow text-[9px] text-muted-foreground mt-1.5">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
