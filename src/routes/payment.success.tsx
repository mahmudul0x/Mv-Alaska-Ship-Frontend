import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Loader2, Mail } from "lucide-react";

import { BookingStatusCard } from "@/components/booking/BookingStatusCard";
import { ResultShell } from "@/components/booking/ResultShell";
import { useBooking } from "@/hooks/queries/useBooking";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
  validateSearch: (s: Record<string, unknown>) => ({
    booking: typeof s.booking === "string" ? s.booking : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment Successful — MV Alaska Cruise" }] }),
});

function PaymentSuccessPage() {
  const { booking: bookingCode } = Route.useSearch();
  // The redirect itself is never trusted — the real payment outcome was
  // already settled server-side; we just fetch (and briefly poll) the
  // booking's real status here, since the IPN can lag a couple of seconds
  // behind the browser landing on this page.
  const { data: booking, isLoading } = useBooking(bookingCode, { pollWhilePending: true });
  const isPolling = booking?.status === "pending";

  return (
    <ResultShell
      tone="success"
      icon={<Check className="size-8" strokeWidth={2.5} />}
      eyebrow="Payment received"
      title={
        <>
          Thank you — <em className="not-italic text-gradient-gold">all set.</em>
        </>
      }
      subtitle={
        isPolling
          ? "Confirming your payment with the gateway — this takes a few seconds."
          : "Your payment has been recorded. Here's your latest booking status."
      }
    >
      {!bookingCode && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No booking reference was provided.
        </div>
      )}
      {bookingCode && isLoading && (
        <div className="rounded-2xl border border-border bg-card shadow-luxe p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading your booking…
        </div>
      )}
      {booking && <BookingStatusCard booking={booking} isPolling={isPolling} />}

      {booking && !isPolling && (
        <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-start gap-3 text-sm text-muted-foreground">
          <div className="size-8 rounded-lg bg-ocean/8 grid place-items-center shrink-0">
            <Mail className="size-4 text-gold" />
          </div>
          <p className="leading-relaxed">
            Your PDF invoice is on its way to{" "}
            <span className="font-medium text-foreground">{booking.email}</span>. Keep your booking
            reference handy on boarding day.
          </p>
        </div>
      )}

      {booking?.status === "pending" && !isPolling && (
        <div className="text-center text-sm text-muted-foreground">
          Still processing — please check your email shortly, or{" "}
          <a href="mailto:mvalaskacruise@gmail.com" className="text-gold hover:underline">
            contact us
          </a>{" "}
          if this doesn't update.
        </div>
      )}

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
            View Booking
          </Link>
        )}
      </div>
    </ResultShell>
  );
}
