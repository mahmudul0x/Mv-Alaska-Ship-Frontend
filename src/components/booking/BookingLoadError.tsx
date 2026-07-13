import { AlertTriangle, Phone, RotateCw } from "lucide-react";

/**
 * Shown on payment-outcome pages when the booking fetch fails.
 *
 * These pages must never imply an outcome they could not confirm: a failed
 * fetch means we do not know the payment's real state, so we say exactly that
 * and keep the booking code in front of the customer to quote to support.
 */
export function BookingLoadError({
  bookingCode,
  onRetry,
  retrying,
}: {
  bookingCode?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="size-9 rounded-lg bg-destructive/10 grid place-items-center shrink-0">
          <AlertTriangle className="size-4.5 text-destructive" />
        </div>
        <div className="space-y-1.5">
          <div className="font-display text-xl leading-tight">
            We couldn't load your booking
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your payment may still have gone through — we just couldn't reach our system to
            confirm it. Please don't pay again until you've checked.
          </p>
        </div>
      </div>

      {bookingCode && (
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="eyebrow text-[9px] text-muted-foreground">Your booking reference</div>
          <div className="font-display text-2xl text-ocean tracking-wide mt-0.5">
            {bookingCode}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-11 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.18em] font-semibold shadow-gold disabled:opacity-50"
          >
            <RotateCw className={`size-3.5 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Checking…" : "Try again"}
          </button>
        )}
        <a
          href="tel:+8801831694307"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-11 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
        >
          <Phone className="size-3.5" /> Call +880 1831-694307
        </a>
      </div>
    </div>
  );
}
