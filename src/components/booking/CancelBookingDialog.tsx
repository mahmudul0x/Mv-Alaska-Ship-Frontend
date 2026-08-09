import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useCancellationPreview, useRequestCancellation } from "@/hooks/queries/useCancellation";
import { formatBDT } from "@/lib/money";
import type {
  ApiError,
  BookingPublic,
  CancellationBlockReason,
  CancellationReasonCode,
  RefundMethod,
} from "@/lib/api/types";

/** Why the online cancel form is closed. The API sends stable codes; the copy
 *  lives here so wording can change without touching the backend.
 *
 *  `in_progress` and `sailed` are the two that surprise people, so they say
 *  plainly what to do instead — the customer has a departed holiday and a
 *  payment on it, and "not allowed" with no next step is how support queues
 *  fill up. */
const BLOCK_COPY: Record<CancellationBlockReason, { title: string; body: string }> = {
  in_progress: {
    title: "Your tour has already started",
    body: "Online cancellation closes once a departure begins. If something has gone wrong, please call us — we can still help.",
  },
  sailed: {
    title: "This tour has finished",
    body: "There is nothing left to cancel. If you believe you were charged incorrectly, contact us and we will review it.",
  },
  already_cancelled: {
    title: "This booking is already cancelled",
    body: "If a refund is due, our team is processing it. Contact us if you have not heard from us.",
  },
  completed: {
    title: "This booking is complete",
    body: "The tour has been delivered. Contact us if you have a question about the payment.",
  },
  pending_request: {
    title: "We already have your request",
    body: "Your cancellation request is with our team. You will get an email as soon as it is reviewed.",
  },
  no_policy: {
    title: "We cannot quote this online",
    body: "Please contact our reservations desk and we will handle the cancellation for you.",
  },
};

const REASONS: { value: CancellationReasonCode; label: string }[] = [
  { value: "plans_changed", label: "My plans changed" },
  { value: "medical", label: "Illness or emergency" },
  { value: "date_change", label: "I want a different date" },
  { value: "booked_by_mistake", label: "I booked by mistake" },
  { value: "other", label: "Other" },
];

const METHODS: { value: RefundMethod; label: string }[] = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank_transfer", label: "Bank transfer" },
];

type Props = {
  booking: BookingPublic;
  open: boolean;
  onClose: () => void;
};

export function CancelBookingDialog({ booking, open, onClose }: Props) {
  const preview = useCancellationPreview(booking.booking_code, open);
  const submit = useRequestCancellation(booking.booking_code);

  const [step, setStep] = useState<"quote" | "form" | "done">("quote");
  const [phoneConfirm, setPhoneConfirm] = useState("");
  const [reasonCode, setReasonCode] = useState<CancellationReasonCode>("plans_changed");
  const [reasonNote, setReasonNote] = useState("");
  const [method, setMethod] = useState<RefundMethod>("bkash");
  const [accountName, setAccountName] = useState(booking.customer_name);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!open) return null;

  const quote = preview.data;
  const isBank = method === "bank_transfer";
  // Nothing paid → there is no payout to arrange, so the destination fields are
  // pointless friction. The server cancels this booking on the spot.
  const needsPayoutDetails = Boolean(quote?.requires_approval);

  function close() {
    setStep("quote");
    setFieldErrors({});
    setAcknowledged(false);
    onClose();
  }

  async function onSubmit() {
    if (!quote?.quote_token) return;
    setFieldErrors({});
    try {
      await submit.mutateAsync({
        phone_confirm: phoneConfirm,
        reason_code: reasonCode,
        reason_note: reasonNote,
        // Nothing paid → no payout, so these stay empty and the server ignores
        // them (it cancels the booking outright instead of queuing a request).
        refund_method: needsPayoutDetails ? method : undefined,
        refund_account_name: needsPayoutDetails ? accountName : "",
        refund_account_number: needsPayoutDetails ? accountNumber : "",
        bank_name: bankName,
        branch_name: branchName,
        acknowledged_charge: acknowledged,
        quote_token: quote.quote_token,
      });
      setStep("done");
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fieldErrors) {
        setFieldErrors(apiError.fieldErrors);
        return;
      }
      // 409: the quote moved (a tier boundary crossed, or a stale tab). The
      // server refuses rather than charging an amount the screen never showed —
      // so send the customer back to re-read the new figures.
      if (apiError.status === 409) {
        toast.error(apiError.detail ?? "Please review the updated figures.");
        await preview.refetch();
        setStep("quote");
        setAcknowledged(false);
        return;
      }
      toast.error(apiError.detail ?? "Something went wrong. Please try again.");
    }
  }

  const error = (field: string) => fieldErrors[field]?.[0];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-midnight/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-2xl border border-border bg-card shadow-luxe overflow-hidden">
        <div className="bg-linear-to-br from-ocean to-midnight px-6 py-5">
          <div className="eyebrow text-gold-soft text-[10px]">Cancel booking</div>
          <div className="font-display text-xl text-background mt-1">{booking.booking_code}</div>
        </div>

        <div className="p-6 space-y-5">
          {preview.isLoading && (
            <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-gold" /> Checking your booking…
            </div>
          )}

          {quote && !quote.allowed && quote.block_reason && (
            <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-2">
              <div className="flex items-center gap-2 font-display text-lg">
                <Info className="size-4 text-gold" />
                {BLOCK_COPY[quote.block_reason].title}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {BLOCK_COPY[quote.block_reason].body}
              </p>
            </div>
          )}

          {/* ── Step 1: the figures, before anything is committed ── */}
          {quote?.allowed && step === "quote" && (
            <>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/50 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  If you cancel today — {quote.tier_label}
                </div>
                <dl className="divide-y divide-border text-sm">
                  <Row label="You have paid" value={formatBDT(quote.paid_amount)} />
                  <Row
                    label={`Cancellation charge (${quote.charge_percent}%)`}
                    value={`− ${formatBDT(quote.cancellation_charge)}`}
                    muted
                  />
                  <Row label="Refund due to you" value={formatBDT(quote.refund_amount)} strong />
                </dl>
              </div>

              {quote.requires_approval ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We aim to send refunds within{" "}
                  <strong>{quote.refund_sla_days} working days</strong> of approval. Your cabin
                  stays reserved until our team reviews the request.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No payment has been received on this booking, so it will be cancelled straight
                  away. There is nothing to refund.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={close}
                  className="flex-1 min-h-11 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
                >
                  Keep my booking
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 min-h-11 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.16em] font-semibold hover-lift"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: reason, payout destination, confirmation ── */}
          {quote?.allowed && step === "form" && (
            <>
              <Field label="Last 4 digits of your phone number" error={error("phone_confirm")}>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={phoneConfirm}
                  onChange={(e) => setPhoneConfirm(e.target.value)}
                  placeholder="••••"
                  className={inputClass}
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  So we know it is really you.
                </p>
              </Field>

              <Field label="Why are you cancelling?" error={error("reason_note")}>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value as CancellationReasonCode)}
                  className={inputClass}
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder={
                    reasonCode === "other"
                      ? "Please tell us a little more"
                      : "Anything else we should know? (optional)"
                  }
                  className={`${inputClass} mt-2`}
                />
              </Field>

              {needsPayoutDetails && (
                <>
                  <div className="rounded-xl bg-ocean/4 border border-border p-4 space-y-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Where should we send {formatBDT(quote.refund_amount)}?
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {METHODS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMethod(m.value)}
                          className={`min-h-11 rounded-lg border text-xs font-semibold transition-colors ${
                            method === m.value
                              ? "border-gold text-gold bg-background"
                              : "border-border text-muted-foreground hover:border-gold/50"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <Field label="Account holder name" error={error("refund_account_name")}>
                      <input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label={isBank ? "Account number" : "Wallet mobile number"}
                      error={error("refund_account_number")}
                    >
                      <input
                        inputMode={isBank ? "text" : "numeric"}
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder={isBank ? "e.g. 1234567890123" : "01712345678"}
                        className={inputClass}
                      />
                      {!isBank && (
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          This does not have to be the number on your booking.
                        </p>
                      )}
                    </Field>

                    {isBank && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Bank name" error={error("bank_name")}>
                          <input
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Branch" error={error("branch_name")}>
                          <input
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                </>
              )}

              <label className="flex items-start gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-gold/50 transition-colors">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 size-4 accent-gold"
                />
                <span className="text-xs leading-relaxed">
                  I understand a cancellation charge of{" "}
                  <strong>{formatBDT(quote.cancellation_charge)}</strong> applies and that{" "}
                  <strong>{formatBDT(quote.refund_amount)}</strong> will be refunded to me.
                </span>
              </label>
              {error("acknowledged_charge") && (
                <p className="text-xs text-destructive">{error("acknowledged_charge")}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("quote")}
                  className="flex-1 min-h-11 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={onSubmit}
                  disabled={submit.isPending || !acknowledged}
                  className="flex-1 min-h-11 flex items-center justify-center gap-2 rounded-full bg-destructive text-white text-xs uppercase tracking-[0.16em] font-semibold hover-lift disabled:opacity-40 disabled:pointer-events-none"
                >
                  {submit.isPending && <Loader2 className="size-4 animate-spin" />}
                  {quote.requires_approval ? "Send request" : "Cancel booking"}
                </button>
              </div>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === "done" && (
            <div className="text-center space-y-3 py-6">
              <div className="size-12 rounded-full bg-gold/15 grid place-items-center mx-auto">
                <CheckCircle2 className="size-6 text-gold" />
              </div>
              <div className="font-display text-xl">
                {quote?.requires_approval ? "Request received" : "Your booking is cancelled"}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {quote?.requires_approval ? (
                  <>
                    We have emailed you a copy. Our team reviews every request — usually within one
                    working day — and <strong>your cabin stays reserved until then</strong>.
                  </>
                ) : (
                  <>No payment was taken, so there is nothing to refund.</>
                )}
              </p>
              <button
                onClick={close}
                className="mt-2 px-8 py-3 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {quote && !quote.allowed && (
            <button
              onClick={close}
              className="w-full min-h-11 rounded-full border border-border text-sm hover:border-gold hover:text-gold transition-colors"
            >
              Close
            </button>
          )}

          {step !== "done" && (
            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="size-3.5 text-gold shrink-0" />
              All amounts are calculated by our system from your booking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="eyebrow text-muted-foreground text-[10px] block mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1.5">
          <AlertTriangle className="size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className={`text-sm ${muted ? "text-muted-foreground" : ""}`}>{label}</dt>
      <dd
        className={
          strong
            ? "font-display text-lg text-gold"
            : `text-sm font-semibold ${muted ? "text-muted-foreground" : ""}`
        }
      >
        {value}
      </dd>
    </div>
  );
}
