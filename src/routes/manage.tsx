import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Download,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { BookingStatusCard } from "@/components/booking/BookingStatusCard";
import { CancelBookingDialog } from "@/components/booking/CancelBookingDialog";
import { ResultShell } from "@/components/booking/ResultShell";
import { useBookingLookup } from "@/hooks/queries/useCancellation";
import { getBookingInvoices } from "@/lib/api/bookings";
import { useQuery } from "@tanstack/react-query";
import { formatBDT } from "@/lib/money";
import type { ApiError, BookingPublic } from "@/lib/api/types";

export const Route = createFileRoute("/manage")({
  component: ManageBookingPage,
  head: () => ({
    meta: [
      { title: "Manage your booking — MV Alaska Cruise" },
      // The result renders someone's booking; it must never be indexed.
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
});

function ManageBookingPage() {
  const lookup = useBookingLookup();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<BookingPublic | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await lookup.mutateAsync({
        booking_code: code,
        phone_last4: phone,
      });
      setBooking(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.detail ??
          Object.values(apiError.fieldErrors ?? {})
            .flat()
            .join(" ") ??
          "We could not find that booking.",
      );
    }
  }

  return (
    <ResultShell
      tone="neutral"
      icon={<Search className="size-7" />}
      eyebrow="Manage your booking"
      title={<>Find your booking.</>}
      subtitle="Enter your booking code and we'll show you your cabins, dates, payments and invoices."
    >
      {!booking && (
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card shadow-luxe p-6 sm:p-8 space-y-5 text-left"
        >
          <div>
            <label className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              Booking code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BK-XXXXXXXXXXXXXXXX"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm font-mono tracking-wide focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              It's on your confirmation email and your invoice. Capitals and dashes don't matter.
            </p>
          </div>

          <div>
            <label className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              Last 4 digits of your phone number
            </label>
            <input
              inputMode="numeric"
              maxLength={4}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="••••"
              className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm tracking-[0.3em] focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={lookup.isPending || !code || phone.length < 4}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift disabled:opacity-40 disabled:pointer-events-none"
          >
            {lookup.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-3.5" />
            )}
            Find my booking
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-gold shrink-0" />
            We ask for both so a stray booking code alone can't open your details.
          </div>
        </form>
      )}

      {booking && (
        <>
          <BookingStatusCard booking={booking} />
          <BookingActions booking={booking} onCancel={() => setCancelOpen(true)} />
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setBooking(null);
                setCode("");
                setPhone("");
              }}
              className="px-8 py-3 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
            >
              Look up another booking
            </button>
            <Link
              to="/"
              className="px-8 py-3 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
            >
              ← Return Home
            </Link>
          </div>

          <CancelBookingDialog
            booking={booking}
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
          />
        </>
      )}
    </ResultShell>
  );
}

function BookingActions({ booking, onCancel }: { booking: BookingPublic; onCancel: () => void }) {
  const invoices = useQuery({
    queryKey: ["booking-invoices", booking.booking_code],
    queryFn: () => getBookingInvoices(booking.booking_code),
  });

  const departure = new Date(`${booking.package.start_date}T00:00:00`);
  const daysAway = Math.ceil((departure.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  const isOver = ["cancelled", "completed"].includes(booking.status);
  const hasDeparted = daysAway < 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden text-left">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
        <CalendarClock className="size-4 text-gold" />
        <span className="text-sm font-semibold">
          {isOver
            ? "This booking is closed"
            : hasDeparted
              ? "Your tour has departed"
              : daysAway === 0
                ? "Your tour departs today"
                : `${daysAway} day${daysAway === 1 ? "" : "s"} to departure`}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {/* Invoices — previously the customer had no way to re-obtain one. */}
        <div>
          <div className="eyebrow text-muted-foreground text-[10px] mb-2">Invoices</div>
          {invoices.isLoading && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </div>
          )}
          {invoices.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No invoice yet — one is issued as soon as a payment is received.
            </p>
          )}
          <div className="space-y-2">
            {invoices.data?.map((invoice) => (
              <a
                key={invoice.number}
                href={invoice.download_url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-gold transition-colors"
              >
                <span className="text-sm">
                  <span className="font-mono">{invoice.number}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatBDT(invoice.paid_amount)} paid
                  </span>
                </span>
                <Download className="size-4 text-gold shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {booking.due_amount !== "0.00" && !isOver && (
          <Link
            to="/booking/confirmation/$code"
            params={{ code: booking.booking_code }}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold hover-lift"
          >
            Pay the outstanding {formatBDT(booking.due_amount)}
          </Link>
        )}

        {/* The cancel entry point. Deliberately quiet, and hidden entirely once
            the booking is closed — the dialog explains the rest. */}
        {!isOver && (
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 min-h-11 rounded-full border border-border text-sm text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
          >
            <XCircle className="size-4" />
            Cancel this booking
          </button>
        )}

        {hasDeparted && !isOver && (
          <p className="text-[11px] text-muted-foreground flex items-start gap-2">
            <Clock3 className="size-3.5 shrink-0 mt-0.5" />
            Online cancellation closes when a departure begins. Please contact us if you need help.
          </p>
        )}
      </div>
    </div>
  );
}
