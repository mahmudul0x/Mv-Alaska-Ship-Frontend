import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Anchor, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { useCalendar } from "@/hooks/queries/useCalendar";
import { parseLocalDate } from "@/lib/dates";
import type { CalendarPackageEntry } from "@/lib/api/types";

type Props = {
  /** Called with the package for a clicked bookable date. */
  onSelectPackage: (packageId: number) => void;
  selectedPackageId?: number;
  /** ISO date (yyyy-MM-dd) — the calendar opens on this month. */
  initialMonth?: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function AvailabilityCalendar({ onSelectPackage, selectedPackageId, initialMonth }: Props) {
  const [month, setMonth] = useState(() =>
    initialMonth ? parseLocalDate(initialMonth) : new Date(),
  );

  // When the caller supplies/changes the target month (e.g. after choosing a
  // package), jump the calendar to that month.
  useEffect(() => {
    if (initialMonth) setMonth(parseLocalDate(initialMonth));
  }, [initialMonth]);

  const year = month.getFullYear();
  const monthNum = month.getMonth() + 1;
  const { data, isLoading } = useCalendar(year, monthNum);

  const packagesByDate = useMemo(() => {
    const map = new Map<string, CalendarPackageEntry[]>();
    for (const entry of data?.dates ?? []) {
      map.set(entry.date, entry.packages);
    }
    return map;
  }, [data]);

  const bookableCount = useMemo(
    () => [...packagesByDate.values()].filter((pkgs) => pkgs.some((p) => p.is_bookable)).length,
    [packagesByDate],
  );

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function handleDayClick(date: Date) {
    const packages = packagesByDate.get(toDateKey(date));
    const bookable = packages?.find((p) => p.is_bookable);
    if (bookable) onSelectPackage(bookable.id);
  }

  return (
    <div className="relative rounded-2xl border border-border bg-card shadow-luxe overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 grid place-items-center bg-card/70 backdrop-blur-[2px] z-10">
          <Loader2 className="size-5 animate-spin text-gold" />
        </div>
      )}

      {/* ── Header — branded emerald band with month navigation ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-ocean via-ocean to-midnight px-5 py-5">
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute -left-8 -bottom-12 size-28 rounded-full bg-teal/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="size-10 rounded-full grid place-items-center text-background/70 ring-1 ring-white/15 hover:bg-white/10 hover:text-gold-soft transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-center">
            <div className="font-display text-2xl md:text-[1.7rem] text-background font-light leading-none">
              {format(month, "MMMM")}
            </div>
            <div className="eyebrow text-gold-soft text-[9px] mt-1.5">
              {format(month, "yyyy")}
              {!isLoading && bookableCount > 0 && (
                <span className="text-background/50"> · {bookableCount} dates open</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="size-10 rounded-full grid place-items-center text-background/70 ring-1 ring-white/15 hover:bg-white/10 hover:text-gold-soft transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 md:px-5">
        {/* Weekday row */}
        <div className="grid grid-cols-7 border-b border-border/60 pb-2.5 mb-2">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day grid — voyages render as connected range bands across days */}
        <div className="grid grid-cols-7 gap-y-1.5 pb-4">
          {days.map((date) => {
            const dateKey = toDateKey(date);
            const packages = packagesByDate.get(dateKey);
            const inMonth = isSameMonth(date, month);

            // The voyage this cell belongs to — prefer the selected voyage,
            // then any bookable one, then a closed sailing.
            const selectedEntry = packages?.find((p) => p.id === selectedPackageId);
            const bookable = packages?.find((p) => p.is_bookable);
            const entry = selectedEntry ?? bookable ?? packages?.[0];

            const isSelectedVoyage = Boolean(selectedEntry);
            const isOpen = Boolean(bookable);
            const isClosed = Boolean(entry) && !isOpen;
            const isStart = entry?.start_date === dateKey;
            const isEnd = entry?.end_date === dateKey;
            const isEndpoint = isStart || isEnd;
            const today = isToday(date);

            return (
              <button
                key={dateKey}
                type="button"
                disabled={!bookable}
                onClick={() => handleDayClick(date)}
                title={
                  bookable
                    ? `${bookable.ship_name} — departs ${format(parseLocalDate(bookable.start_date), "d MMM")}`
                    : isClosed
                      ? "Sold out / booking closed"
                      : undefined
                }
                className={`group relative h-12 flex items-center justify-center
                  ${bookable && inMonth ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Range band — connects consecutive voyage days */}
                {entry && inMonth && (
                  <span
                    className={`absolute inset-y-1 z-0 transition-colors
                      ${isStart ? "left-1 rounded-l-full" : "-left-px"}
                      ${isEnd ? "right-1 rounded-r-full" : "-right-px"}
                      ${
                        isSelectedVoyage
                          ? "bg-gold/22 ring-1 ring-inset ring-gold/25"
                          : isOpen
                            ? "bg-gold/9 group-hover:bg-gold/18"
                            : "bg-muted/60"
                      }`}
                  />
                )}

                {/* Day numeral */}
                <span
                  className={`relative z-10 grid place-items-center size-9 rounded-full text-sm tabular-nums transition-all
                    ${
                      isSelectedVoyage && isEndpoint
                        ? "gradient-gold text-ocean font-bold shadow-gold"
                        : isSelectedVoyage
                          ? "font-semibold text-foreground"
                          : isOpen && inMonth
                            ? "font-medium text-foreground group-hover:bg-gold group-hover:text-ocean group-hover:font-bold"
                            : isClosed && inMonth
                              ? "text-muted-foreground/45 line-through decoration-muted-foreground/35"
                              : inMonth
                                ? "text-foreground/55 font-light"
                                : "text-muted-foreground/25 font-light"
                    }
                    ${today && !(isSelectedVoyage && isEndpoint) ? "ring-1 ring-ocean/35" : ""}`}
                >
                  {date.getDate()}
                </span>

                {/* Departure-day marker for open, non-selected voyages */}
                {isOpen && isStart && !isSelectedVoyage && inMonth && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-10 text-gold group-hover:opacity-0 transition-opacity">
                    <Anchor className="size-2.5" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend footer ── */}
      <div className="px-5 py-3.5 border-t border-border bg-ocean/3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full gradient-gold shadow-sm" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-full bg-gold/12 ring-1 ring-inset ring-gold/35 grid place-items-center">
              <Anchor className="size-2 text-gold" strokeWidth={2.5} />
            </span>
            Open voyage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-full bg-muted ring-1 ring-inset ring-border" /> Sold
            out
          </span>
        </div>
        <span className="hidden sm:block text-muted-foreground/70 italic font-display text-[11px]">
          Tap any open date to switch
        </span>
      </div>

      {!isLoading && bookableCount === 0 && (
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gold hover:bg-gold/5 border-t border-border px-2 py-3 transition-colors"
        >
          No sailings this month — view next month <ChevronRight className="size-3" />
        </button>
      )}
    </div>
  );
}
