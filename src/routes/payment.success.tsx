import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Loader2, Mail } from "lucide-react";

import { BookingLoadError } from "@/components/booking/BookingLoadError";
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
  const {
    data: booking,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBooking(bookingCode, { pollWhilePending: true });
  const isPolling = booking?.status === "pending";

  // The gateway's redirect is not proof of payment — only a booking we actually
  // fetched is. Until we have one, this page must not claim an outcome: with no
  // reference, or a failed fetch, it reports what it does and doesn't know.
  const unconfirmed = !bookingCode || isError;

  return (
    <ResultShell
      tone={unconfirmed ? "error" : "success"}
      icon={
        unconfirmed ? (
          <AlertTriangle className="size-8" strokeWidth={2.5} />
        ) : (
          <Check className="size-8" strokeWidth={2.5} />
        )
      }
      eyebrow={unconfirmed ? "Payment status unknown" : "Payment received"}
      title={
        unconfirmed ? (
          <>
            We couldn't <em className="not-italic">confirm</em> this.
          </>
        ) : (
          <>
            Thank you — <em className="not-italic">all set.</em>
          </>
        )
      }
      subtitle={
        isError
          ? "Your payment may well have succeeded — we just couldn't reach our system to verify it. Please check before paying again."
          : !bookingCode
            ? "We didn't receive a booking reference, so we can't look up your payment."
            : isPolling
              ? "Confirming your payment with the gateway — this takes a few seconds."
              : "Your payment has been recorded. Here's your latest booking status."
      }
    >
      {!bookingCode && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No booking reference was provided. If you've just paid, check your email for your
          booking code, or call us on{" "}
          <a href="tel:+8801831694307" className="text-gold hover:underline">
            +880 1831-694307
          </a>
          .
        </div>
      )}
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
            className="px-8 py-3 rounded-full gradient-gold text-ocean text-sm font-semibold text-center shadow-luxe hover-lift"
          >
            View Booking
          </Link>
        )}
      </div>
    </ResultShell>
  );
}
