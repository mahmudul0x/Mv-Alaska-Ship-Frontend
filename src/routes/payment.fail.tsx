import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, X } from "lucide-react";

import { BookingStatusCard } from "@/components/booking/BookingStatusCard";
import { ResultShell } from "@/components/booking/ResultShell";
import { useBooking } from "@/hooks/queries/useBooking";

export const Route = createFileRoute("/payment/fail")({
  component: PaymentFailPage,
  validateSearch: (s: Record<string, unknown>) => ({
    booking: typeof s.booking === "string" ? s.booking : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment Failed — MV Alaska Cruise" }] }),
});

function PaymentFailPage() {
  const { booking: bookingCode } = Route.useSearch();
  // Terminal state — the backend already marked this payment FAILED before
  // redirecting here, so a single fetch (no polling) is enough.
  const { data: booking } = useBooking(bookingCode);

  return (
    <ResultShell
      tone="error"
      icon={<X className="size-8" strokeWidth={2.5} />}
      eyebrow="Payment unsuccessful"
      title="Payment failed"
      subtitle="Your payment could not be completed — no money was taken. Your booking is still reserved, so you can simply try again."
    >
      {booking && <BookingStatusCard booking={booking} />}

      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-start gap-3 text-sm text-muted-foreground">
        <div className="size-8 rounded-lg bg-ocean/8 grid place-items-center shrink-0">
          <Phone className="size-4 text-gold" />
        </div>
        <p className="leading-relaxed">
          Payments can fail due to bank limits or a timeout. If it keeps happening, call us at{" "}
          <a href="tel:+8801831694307" className="font-medium text-foreground hover:text-gold">
            +880 1831-694307
          </a>{" "}
          and we'll help you complete it.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="px-8 py-3 rounded-full border border-border text-sm text-center hover:border-gold hover:text-gold transition-colors"
        >
          ← Return Home
        </Link>
        {bookingCode && (
          <Link
            to="/booking/confirmation/$code"
            params={{ code: bookingCode }}
            className="px-8 py-3 rounded-full gradient-gold text-ocean text-sm font-semibold text-center shadow-gold hover-lift"
          >
            Try Payment Again
          </Link>
        )}
      </div>
    </ResultShell>
  );
}
