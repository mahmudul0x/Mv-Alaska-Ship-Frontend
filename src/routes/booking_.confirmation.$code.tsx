import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CreditCard, Loader2, Lock, SearchX, Shield, Ticket } from "lucide-react";
import { toast } from "sonner";

import { BookingStatusCard } from "@/components/booking/BookingStatusCard";
import { ResultShell } from "@/components/booking/ResultShell";
import { useBooking } from "@/hooks/queries/useBooking";
import { useInitiatePayment } from "@/hooks/queries/useInitiatePayment";
import { formatBDT, parseMoney } from "@/lib/money";
import type { ApiError, PaymentType } from "@/lib/api/types";

export const Route = createFileRoute("/booking_/confirmation/$code")({
  component: BookingConfirmationPage,
  head: ({ params }) => ({
    meta: [{ title: `Booking ${params.code} — MV Alaska Cruise` }],
  }),
});

function BookingConfirmationPage() {
  const { code } = Route.useParams();
  const { data: booking, isLoading, isError } = useBooking(code);
  const initiatePayment = useInitiatePayment(code);
  const [paymentType, setPaymentType] = useState<PaymentType>("full");
  const [partialAmount, setPartialAmount] = useState("");

  async function payNow() {
    try {
      const payload =
        paymentType === "full"
          ? { payment_type: "full" as const }
          : { payment_type: "partial" as const, amount: partialAmount };
      const { gateway_url } = await initiatePayment.mutateAsync(payload);
      window.location.href = gateway_url;
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(
        apiError.fieldErrors
          ? Object.values(apiError.fieldErrors).flat().join(" ")
          : apiError.detail || "Couldn't start payment. Please try again.",
      );
    }
  }

  const canPay =
    booking &&
    !["cancelled", "completed"].includes(booking.status) &&
    booking.due_amount !== "0.00";

  const dueAmount = booking ? parseMoney(booking.due_amount) : 0;
  // Backend-computed deposit floor (UX mirror only — the API re-validates).
  // Applies to the first payment; top-ups can be any positive amount.
  const minPayment = booking
    ? Math.min(parseMoney(booking.min_first_payment ?? "0"), dueAmount)
    : 0;
  const partialNumber = Number.parseFloat(partialAmount || "0");
  const partialInvalid =
    paymentType === "partial" &&
    (!partialAmount ||
      partialNumber <= 0 ||
      partialNumber > dueAmount ||
      partialNumber < minPayment);
  const payingNow = paymentType === "partial" && partialNumber > 0 ? partialNumber : dueAmount;

  return (
    <ResultShell
      tone="neutral"
      icon={<Ticket className="size-7" />}
      eyebrow="Your reservation"
      title={
        <>
          Booking <em className="not-italic text-gradient-gold">{code}</em>
        </>
      }
      subtitle="Review your booking status below — and settle any outstanding balance in seconds."
    >
      {isLoading && (
        <div className="rounded-2xl border border-border bg-card shadow-luxe p-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading your booking…
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="size-12 rounded-full bg-muted grid place-items-center mx-auto">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <div className="font-display text-xl">No booking found</div>
          <p className="text-sm text-muted-foreground">
            We couldn't find a booking with that reference. Double-check the code from your
            confirmation, or contact our concierge.
          </p>
        </div>
      )}

      {booking && <BookingStatusCard booking={booking} />}

      {/* ── Payment panel ── */}
      {canPay && (
        <div className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden">
          <div className="relative bg-linear-to-br from-ocean via-ocean to-midnight px-6 py-5 overflow-hidden">
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-gold/10 blur-xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2 eyebrow text-gold-soft text-[10px]">
                <Lock className="size-3.5" /> Complete your payment
              </div>
              <div className="text-right">
                <span className="text-background/60 text-[10px] uppercase tracking-[0.14em] block">
                  Outstanding
                </span>
                <span className="font-display text-2xl text-background leading-none">
                  {formatBDT(booking!.due_amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {(["full", "partial"] as const).map((type) => {
                const checked = paymentType === type;
                return (
                  <label
                    key={type}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "border-gold bg-ocean/4 shadow-[0_0_0_1px_var(--gold)]"
                        : "border-border hover:border-gold/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      className="sr-only"
                      checked={checked}
                      onChange={() => setPaymentType(type)}
                    />
                    <div
                      className={`size-9 rounded-lg grid place-items-center shrink-0 transition-colors ${checked ? "gradient-gold" : "bg-muted"}`}
                    >
                      <CreditCard
                        className={`size-4 ${checked ? "text-ocean" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-semibold capitalize block">{type} payment</span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        {type === "full"
                          ? "Settle the full balance now"
                          : "Pay part of the balance"}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {paymentType === "partial" && (
              <div className="p-4 rounded-xl bg-ocean/3 border border-border space-y-3">
                <label className="eyebrow text-muted-foreground text-[10px] block">
                  Amount to pay now —{" "}
                  {minPayment > 1
                    ? `min ${formatBDT(String(minPayment))}, max ${formatBDT(booking!.due_amount)}`
                    : `max ${formatBDT(booking!.due_amount)}`}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={minPayment || 0}
                    max={dueAmount || undefined}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-background border border-border rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  />
                </div>
                {dueAmount > 0 && (
                  <div className="flex gap-2">
                    {[25, 50, 75].map((pct) => {
                      // Never quick-fill below the required deposit floor.
                      const amount = Math.max(
                        Math.round((dueAmount * pct) / 100),
                        Math.ceil(minPayment),
                      );
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPartialAmount(String(amount))}
                          className="flex-1 rounded-lg border border-border py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-gold hover:text-gold transition-colors"
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>
                )}
                {minPayment > 1 && (
                  <div className="text-[11px] text-muted-foreground">
                    Booking confirmation requires a{" "}
                    <strong>{formatBDT(String(minPayment))}</strong> minimum first
                    payment; the remaining balance must be settled before the journey.
                  </div>
                )}
                {partialAmount && partialInvalid && (
                  <div className="text-xs text-destructive">
                    {minPayment > 1 && partialNumber < minPayment
                      ? `The first payment must be at least ${formatBDT(String(minPayment))}.`
                      : "Enter an amount between 1 and the outstanding balance."}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={payNow}
              disabled={initiatePayment.isPending || partialInvalid}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-gold hover-lift disabled:opacity-40 disabled:pointer-events-none"
            >
              {initiatePayment.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-3.5" />
              )}
              {initiatePayment.isPending
                ? "Redirecting…"
                : payingNow > 0
                  ? `Pay ${formatBDT(String(payingNow))} now`
                  : "Pay Now"}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <Shield className="size-3.5 text-gold shrink-0" />
              Secured by SSLCommerz — bKash, cards &amp; more.
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link
          to="/"
          className="px-8 py-3 rounded-full border border-border text-sm text-center hover:border-gold hover:text-gold transition-colors"
        >
          ← Return Home
        </Link>
      </div>
    </ResultShell>
  );
}
