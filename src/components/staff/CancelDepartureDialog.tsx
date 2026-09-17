import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Loader2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { DialogShell, StaffField, errorText, staffInputClass } from "./ui";
import { cancelDeparture } from "@/lib/api/staffRefunds";
import type { StaffDepartureCancelResult } from "@/lib/api/staffRefundTypes";
import type { StaffPackage } from "@/lib/api/staffTypes";
import { useLanguage } from "@/lib/i18n";
import { money, num } from "@/lib/i18n/format";

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
  const { t, lang } = useLanguage();
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
        t("cd.done", {
          n: num(result.refunds_raised, lang),
          amount: money(result.refund_total, lang),
        }),
      );
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  // The sailing as the operator knows it: its marketing name, or its dates when
  // it has none.
  const trip = pkg.marketing_title || `${pkg.start_date} – ${pkg.end_date}`;

  return (
    <DialogShell title={t("cd.title")} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex gap-3">
          <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">{t("cd.warning", { trip })}</div>
        </div>

        <StaffField label={t("cd.reasonLabel")}>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setPreview(null);
            }}
            rows={2}
            placeholder={t("cd.reasonPlaceholder")}
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
            {t("cd.preview")}
          </button>
        ) : (
          <>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("cd.previewNote")}
              </div>
              <div className="grid grid-cols-3 divide-x divide-border text-center">
                <Stat label={t("cd.bookings")} value={num(preview.bookings, lang)} />
                <Stat label={t("cd.guests")} value={num(preview.pax, lang)} icon={Users} />
                <Stat
                  label={t("cd.toRefund")}
                  value={money(preview.refund_total, lang)}
                  icon={Wallet}
                />
              </div>
            </div>

            {preview.bookings === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cd.noBookings")}</p>
            ) : null}

            <button
              onClick={() => commit.mutate()}
              disabled={commit.isPending}
              className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full bg-destructive text-white text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
            >
              {commit.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("cd.confirm", { amount: money(preview.refund_total, lang) })}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">{t("cd.cannotUndo")}</p>
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
