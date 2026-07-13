import { createFileRoute, Link } from "@tanstack/react-router";
import { Ban, Clock, Loader2 } from "lucide-react";

import { BookingLoadError } from "@/components/booking/BookingLoadError";
import { BookingStatusCard } from "@/components/booking/BookingStatusCard";
import { ResultShell } from "@/components/booking/ResultShell";
import { useBooking } from "@/hooks/queries/useBooking";

export const Route = createFileRoute("/payment/cancel")({
  component: PaymentCancelPage,
  validateSearch: (s: Record<string, unknown>) => ({
    booking: typeof s.booking === "string" ? s.booking : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment Cancelled — MV Alaska Cruise" }] }),
});

function PaymentCancelPage() {
  const { booking: bookingCode } = Route.useSearch();
  // The cancel headline holds regardless of the fetch; only the status card
  // below depends on it, so a failed load must say so rather than vanish.
  const { data: booking, isLoading, isError, refetch, isRefetching } = useBooking(bookingCode);

  return (
    <ResultShell
      tone="neutral"
      icon={<Ban className="size-8" strokeWidth={2.5} />}
      eyebrow="Payment cancelled"
      title="No charge was made"
      subtitle="You cancelled the payment. Your booking is still reserved — you can complete payment anytime before departure."
    >
      {bookingCode && isLoading && (
        <div className="rounded-2xl border border-border bg-card shadow-luxe p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading your booking…
        </div>
      )}
      {bookingCode && isError && (
        <BookingLoadError
          bookingCode={bookingCode}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      )}
      {booking && <BookingStatusCard booking={booking} />}

      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-start gap-3 text-sm text-muted-foreground">
        <div className="size-8 rounded-lg bg-ocean/8 grid place-items-center shrink-0">
          <Clock className="size-4 text-gold" />
        </div>
        <p className="leading-relaxed">
          You can return to your booking and pay whenever you're ready — your reference code is all
          you need.
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
            Complete Payment
          </Link>
        )}
      </div>
    </ResultShell>
  );
}
