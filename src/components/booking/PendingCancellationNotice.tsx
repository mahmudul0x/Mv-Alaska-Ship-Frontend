import { Clock3 } from "lucide-react";

import { formatBDT } from "@/lib/money";
import type { CancellationRequestPublic } from "@/lib/api/types";

/** Shown in place of the "Cancel booking" action once a request is open.
 *
 *  A pending request does not change the booking's status — the cabins stay
 *  held until staff decide — so without this the page looks exactly as it did
 *  before the customer pressed cancel. The two things they need to read are
 *  that we have it, and that their cabin is still theirs meanwhile. */
export function PendingCancellationNotice({ request }: { request: CancellationRequestPublic }) {
  const requested = new Date(request.requested_at);
  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5 space-y-3 text-left">
      <div className="flex items-center gap-2.5">
        <span className="size-9 rounded-full bg-gold/15 grid place-items-center shrink-0">
          <Clock3 className="size-4 text-gold" />
        </span>
        <div>
          <div className="font-display text-lg leading-tight">Cancellation request received</div>
          <div className="text-[11px] text-muted-foreground">
            Sent {requested.toLocaleDateString()} · awaiting review
          </div>
        </div>
      </div>

      <dl className="rounded-xl border border-border bg-card divide-y divide-border text-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <dt className="text-muted-foreground">Cancellation charge</dt>
          <dd className="font-semibold">{formatBDT(request.cancellation_charge)}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <dt className="text-muted-foreground">Refund due to you</dt>
          <dd className="font-display text-lg text-gold">{formatBDT(request.refund_amount)}</dd>
        </div>
        {request.refund_account_masked && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <dt className="text-muted-foreground">To be sent to</dt>
            <dd className="text-sm">
              {request.refund_method_label} {request.refund_account_masked}
            </dd>
          </div>
        )}
      </dl>

      <p className="text-xs text-muted-foreground leading-relaxed">
        These figures are fixed for your request and will not change while we review it.{" "}
        <strong>Your cabin stays reserved until we decide</strong>, and you will get an email either
        way — usually within one working day. Changed your mind? Just reply to the confirmation
        email we sent you.
      </p>
    </div>
  );
}
