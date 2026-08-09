import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Loader2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { DialogShell, StaffField, errorText, staffInputClass } from "./ui";
import { cancelDeparture } from "@/lib/api/staffRefunds";
import type { StaffDepartureCancelResult } from "@/lib/api/staffRefundTypes";
import type { StaffPackage } from "@/lib/api/staffTypes";
import { formatBDT } from "@/lib/money";

/** Cancelling a whole sailing: weather, a technical fault, or the passenger
 *  minimum not being met.
 *
 *  This is an INVOLUNTARY cancellation — the customer did not choose it — so
 *  the cancellation-charge schedule does not apply and every booking is
 *  refunded in full. Two guards, because this action ends dozens of people's
 *  holidays at once: it previews first (a dry run that touches nothing), and
 *  the real call has to be confirmed against the preview the operator just
 *  read.
 */
export function CancelDepartureDialog({
  pkg,
  onClose,
  onDone,
}: {
  pkg: StaffPackage;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<StaffDepartureCancelResult | null>(null);

  const dryRun = useMutation({
    mutationFn: () => cancelDeparture(pkg.id, { reason_note: reason, dry_run: true }),
    onSuccess: setPreview,
    onError: (err) => toast.error(errorText(err)),
  });

  const commit = useMutation({
    mutationFn: () =>
      cancelDeparture(pkg.id, {
        reason_note: reason,
        dry_run: false,
        confirm_package_id: pkg.id,
      }),
    onSuccess: (result) => {
      toast.success(
        `Departure cancelled — ${result.refunds_raised} refund(s) raised, ` +
          `${formatBDT(result.refund_total)} owed.`,
      );
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title="Cancel this departure" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex gap-3">
          <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            Every active booking on{" "}
            <strong>{pkg.marketing_title || `${pkg.start_date} – ${pkg.end_date}`}</strong> will be
            cancelled and <strong>refunded in full</strong> — no cancellation charge, because the
            customer did not choose this. Each one is emailed automatically.
          </div>
        </div>

        <StaffField label="Why is the departure being cancelled?">
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setPreview(null);
            }}
            rows={2}
            placeholder="e.g. Cyclone warning — port authority has suspended sailings"
            className={staffInputClass}
          />
        </StaffField>

        {!preview ? (
          <button
            onClick={() => dryRun.mutate()}
            disabled={dryRun.isPending || !reason.trim()}
            className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full border border-border text-sm font-semibold hover:border-gold hover:text-gold disabled:opacity-40"
          >
            {dryRun.isPending && <Loader2 className="size-4 animate-spin" />}
            Preview the impact
          </button>
        ) : (
          <>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                Nothing has happened yet — this is the preview
              </div>
              <div className="grid grid-cols-3 divide-x divide-border text-center">
                <Stat label="Bookings" value={String(preview.bookings)} />
                <Stat label="Guests" value={String(preview.pax)} icon={Users} />
                <Stat label="To refund" value={formatBDT(preview.refund_total)} icon={Wallet} />
              </div>
            </div>

            {preview.bookings === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active bookings on this departure — cancelling it affects nobody.
              </p>
            ) : null}

            <button
              onClick={() => commit.mutate()}
              disabled={commit.isPending}
              className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full bg-destructive text-white text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
            >
              {commit.isPending && <Loader2 className="size-4 animate-spin" />}
              Cancel departure and refund {formatBDT(preview.refund_total)}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">This cannot be undone.</p>
          </>
        )}
      </div>
    </DialogShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="px-4 py-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </div>
      <div className="font-display text-xl mt-1">{value}</div>
    </div>
  );
}
