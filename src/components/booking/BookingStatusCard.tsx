import { Anchor, BedDouble, CalendarDays, Loader2, Mail, Phone, User } from "lucide-react";

import { formatBDT, parseMoney } from "@/lib/money";
import type { BookingPublic } from "@/lib/api/types";

const STATUS_LABEL: Record<BookingPublic["status"], string> = {
  pending: "Pending payment",
  partially_paid: "Partially paid",
  fully_paid: "Fully paid",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_COLOR: Record<BookingPublic["status"], string> = {
  pending: "bg-amber-50 border-amber-200 text-amber-700",
  partially_paid: "bg-amber-50 border-amber-200 text-amber-700",
  fully_paid: "bg-emerald-50 border-emerald-200 text-emerald-700",
  cancelled: "bg-destructive/10 border-destructive/30 text-destructive",
  completed: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

export function BookingStatusCard({
  booking,
  isPolling,
}: {
  booking: BookingPublic;
  isPolling?: boolean;
}) {
  const total = parseMoney(booking.total_amount);
  const paid = parseMoney(booking.paid_amount);
  const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  // A booking may hold several cabins; sum the party across all of them.
  const totalAdults = booking.rooms.reduce((n, r) => n + r.adult_count, 0);
  const totalKids = booking.rooms.reduce((n, r) => n + r.kid_details.length, 0);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden text-left">
      {/* Branded header */}
      <div className="relative bg-linear-to-br from-ocean via-ocean to-midnight px-6 py-5 overflow-hidden">
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-gold/10 blur-xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-full bg-gold/15 ring-1 ring-gold/25 grid place-items-center shrink-0">
              <Anchor className="size-4 text-gold-soft" />
            </div>
            <div>
              <div className="eyebrow text-gold-soft text-[9px]">Booking reference</div>
              <div className="font-display text-2xl text-background tracking-wide leading-tight">
                {booking.booking_code}
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold ${STATUS_COLOR[booking.status]}`}
          >
            {isPolling && <Loader2 className="size-3 animate-spin" />}
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment progress */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="eyebrow text-muted-foreground">Payment progress</span>
            <span className="font-semibold text-gold-text">{paidPct}% paid</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full gradient-gold rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>

        {/* Amount tiles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: formatBDT(booking.total_amount), accent: false },
            { label: "Paid", value: formatBDT(booking.paid_amount), accent: false },
            { label: "Due", value: formatBDT(booking.due_amount), accent: true },
          ].map((t) => (
            <div
              key={t.label}
              className={`rounded-xl border px-3 py-3 ${
                t.accent ? "border-gold/40 bg-ocean/4" : "border-border/70 bg-ocean/2"
              }`}
            >
              <div className="eyebrow text-[9px] text-muted-foreground">{t.label}</div>
              <div
                className={`font-display text-lg mt-1 leading-none ${t.accent ? "text-gold" : "text-foreground"}`}
              >
                {t.value}
              </div>
            </div>
          ))}
        </div>

        {/* Voyage + guest details */}
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-border text-sm">
          <div className="flex items-center gap-2.5 text-foreground min-w-0">
            <BedDouble className="size-3.5 text-gold shrink-0" />
            <span className="truncate">
              {booking.rooms.length > 1 ? "Rooms " : "Room "}
              {booking.rooms.map((r) => r.room_number).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground">
            <CalendarDays className="size-3.5 text-gold shrink-0" />
            {booking.package.start_date} – {booking.package.end_date}
          </div>
          <div className="flex items-center gap-2.5 text-foreground">
            <User className="size-3.5 text-gold shrink-0" />
            <span className="truncate">
              {booking.customer_name} · {totalAdults} adult
              {totalAdults > 1 ? "s" : ""}
              {totalKids ? `, ${totalKids} kid${totalKids > 1 ? "s" : ""}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground min-w-0">
            <Phone className="size-3.5 text-gold shrink-0" />
            <span className="truncate">{booking.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground min-w-0 sm:col-span-2">
            <Mail className="size-3.5 text-gold shrink-0" />
            <span className="truncate">{booking.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
