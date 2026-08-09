import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  Plus,
  Ship,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  DialogShell,
  Info,
  PageHeader,
  SectionCard,
  StaffField,
  StatCard,
  errorText,
  staffInputClass,
} from "@/components/staff/ui";
import {
  approveCancellation,
  createRefund,
  downloadRefundRegister,
  getCancellationRequest,
  getCancellationRequestSummary,
  getCancellationRequests,
  getRefundSummary,
  getRefunds,
  markRefundPaid,
  rejectCancellation,
  voidRefund,
} from "@/lib/api/staffRefunds";
import type { StaffCancellationRequest, StaffRefund } from "@/lib/api/staffRefundTypes";
import { formatBDT } from "@/lib/money";

export const Route = createFileRoute("/staff/refunds")({
  component: RefundsPage,
});

const REQUEST_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

const REFUND_FILTERS = [
  { value: "pending", label: "Owed" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
  { value: "", label: "All" },
];

const PAYOUT_METHODS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "gateway", label: "Payment gateway" },
];

function RefundsPage() {
  const [tab, setTab] = useState<"queue" | "register">("queue");

  const requestSummary = useQuery({
    queryKey: ["staff", "cancellation-summary"],
    queryFn: getCancellationRequestSummary,
  });
  const refundSummary = useQuery({
    queryKey: ["staff", "refund-summary"],
    queryFn: getRefundSummary,
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Cancellations & refunds"
        subtitle="Decide cancellation requests, and record the money that goes back out."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting decision"
          value={String(requestSummary.data?.pending_count ?? 0)}
          icon={Clock3}
          highlight={(requestSummary.data?.pending_count ?? 0) > 0}
          hint={
            requestSummary.data
              ? `${formatBDT(requestSummary.data.pending_refund_total)} would be refunded`
              : undefined
          }
        />
        {/* The important number on this page: money promised and not yet sent.
            In accounting terms it is a debt the company is carrying, and it is
            invisible anywhere else in the system. */}
        <StatCard
          label="Refund liability"
          value={formatBDT(refundSummary.data?.liability_total ?? "0.00")}
          icon={Wallet}
          tone="destructive"
          hint={`${refundSummary.data?.liability_count ?? 0} payout(s) owed`}
        />
        <StatCard
          label="Overdue payouts"
          value={String(refundSummary.data?.overdue_count ?? 0)}
          icon={AlertTriangle}
          tone={refundSummary.data?.overdue_count ? "destructive" : "default"}
          hint="Past the refund promise we made"
        />
        <StatCard
          label="Paid out"
          value={formatBDT(refundSummary.data?.paid_total ?? "0.00")}
          icon={Banknote}
          tone="emerald"
          hint={`${refundSummary.data?.paid_count ?? 0} settled`}
        />
      </div>

      {(requestSummary.data?.departed_undecided_count ?? 0) > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <Ship className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>
              {requestSummary.data?.departed_undecided_count} request(s) are still undecided after
              their departure.
            </strong>{" "}
            <span className="text-muted-foreground">
              The customer filed in time, so the charge they were quoted still stands — this backlog
              is ours, not theirs.
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["queue", "register"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 min-h-11 rounded-full text-xs uppercase tracking-[0.14em] font-semibold transition-colors ${
              tab === value
                ? "bg-ocean text-background"
                : "border border-border text-muted-foreground hover:border-gold hover:text-gold"
            }`}
          >
            {value === "queue" ? "Cancellation queue" : "Refund register"}
          </button>
        ))}
      </div>

      {tab === "queue" ? <CancellationQueue /> : <RefundRegister />}
    </div>
  );
}

/* ── Cancellation queue ──────────────────────────────────────────────────── */

function CancellationQueue() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "cancellation-requests", status, search],
    queryFn: () =>
      getCancellationRequests({
        status: status || undefined,
        search: search || undefined,
      }),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["staff", "cancellation-requests"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "cancellation-summary"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "refund-summary"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "refunds"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "bookings"] });
  }

  const rows = data?.results ?? [];

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {REQUEST_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={`px-4 min-h-11 rounded-full text-xs font-semibold transition-colors ${
              status === f.value
                ? "bg-gold/15 text-gold border border-gold/40"
                : "border border-border text-muted-foreground hover:border-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Booking code, name or phone"
          className={`${staffInputClass} max-w-xs ml-auto`}
        />
      </div>

      <SectionCard bodyClassName="divide-y divide-border">
        {isLoading && (
          <div className="p-10 text-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin mx-auto" />
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">Nothing here.</div>
        )}
        {rows.map((row) => (
          <QueueRow key={row.id} row={row} onOpen={() => setOpenId(row.id)} />
        ))}
      </SectionCard>

      {openId !== null && (
        <RequestDialog
          id={openId}
          onClose={() => setOpenId(null)}
          onDecided={() => {
            setOpenId(null);
            refresh();
          }}
        />
      )}
    </>
  );
}

function QueueRow({ row, onOpen }: { row: StaffCancellationRequest; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-5 py-4 hover:bg-muted/40 transition-colors flex flex-wrap items-center gap-4"
    >
      <div className="min-w-[190px]">
        <div className="font-mono text-sm">{row.booking_code}</div>
        <div className="text-xs text-muted-foreground">
          {row.customer_name} · {row.phone}
        </div>
      </div>
      <div className="text-xs text-muted-foreground min-w-[150px]">
        <div>{row.reason_label}</div>
        <div>Departs {row.package_start_date}</div>
      </div>
      <div className="text-xs min-w-[170px]">
        <div className="text-muted-foreground">{row.tier_label}</div>
        <div>
          Paid {formatBDT(row.paid_amount)} · charge {formatBDT(row.cancellation_charge)}
        </div>
      </div>
      <div className="ml-auto text-right">
        <div className="font-display text-lg text-gold">{formatBDT(row.refund_amount)}</div>
        <div className="flex items-center gap-1.5 justify-end mt-0.5">
          {row.departure_passed && row.status === "pending" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
              Departed
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
            {row.status_label}
          </span>
        </div>
      </div>
    </button>
  );
}

function RequestDialog({
  id,
  onClose,
  onDecided,
}: {
  id: number;
  onClose: () => void;
  onDecided: () => void;
}) {
  const [note, setNote] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "cancellation-request", id],
    queryFn: () => getCancellationRequest(id),
  });

  const approve = useMutation({
    mutationFn: () => approveCancellation(id, note),
    onSuccess: () => {
      toast.success("Cancelled and refund raised.");
      onDecided();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const reject = useMutation({
    mutationFn: () => rejectCancellation(id, note),
    onSuccess: () => {
      toast.success("Request rejected — the customer has been emailed.");
      onDecided();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const pending = data?.status === "pending";
  const busy = approve.isPending || reject.isPending;

  return (
    <DialogShell title="Cancellation request" onClose={onClose}>
      {isLoading || !data ? (
        <div className="py-10 text-center">
          <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Info label="Booking" value={data.booking_code} />
            <Info label="Customer" value={`${data.customer_name} · ${data.phone}`} />
            <Info label="Departure" value={data.package_start_date} />
            <Info label="Requested" value={new Date(data.requested_at).toLocaleString()} />
            <Info label="Reason" value={data.reason_label} />
            <Info label="Source" value={data.source === "staff" ? "Staff" : "Website"} />
          </div>

          {data.reason_note && (
            <div className="rounded-xl bg-muted/50 p-3 text-sm">{data.reason_note}</div>
          )}

          {/* Frozen at submission — approving honours these, it does not
              recompute. Staff have no field to type an amount into. */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              Quoted {data.tier_label} — fixed when the customer submitted
            </div>
            <div className="divide-y divide-border text-sm">
              <MoneyRow label="Paid by customer" value={data.paid_amount} />
              <MoneyRow label="Cancellation charge" value={data.cancellation_charge} />
              <MoneyRow label="Refund due" value={data.refund_amount} strong />
              {data.shortfall_amount !== "0.00" && (
                <div className="px-4 py-2.5 text-xs text-muted-foreground">
                  Charge not covered by the deposit: {formatBDT(data.shortfall_amount)} — recorded
                  only, never billed.
                </div>
              )}
            </div>
          </div>

          {data.refund_account_number && (
            <div className="grid grid-cols-2 gap-4">
              <Info label="Payout to" value={data.refund_method} />
              <Info label="Account" value={data.refund_account_number} />
              <Info label="Account name" value={data.refund_account_name} />
              {data.bank_name && (
                <Info label="Bank" value={`${data.bank_name} — ${data.branch_name}`} />
              )}
            </div>
          )}

          {pending ? (
            <>
              <StaffField label="Note (required to reject, shown to the customer)">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className={staffInputClass}
                />
              </StaffField>
              <div className="flex gap-3">
                <button
                  onClick={() => reject.mutate()}
                  disabled={busy}
                  className="flex-1 min-h-11 rounded-full border border-border text-sm hover:border-destructive hover:text-destructive transition-colors disabled:opacity-40"
                >
                  Reject
                </button>
                <button
                  onClick={() => approve.mutate()}
                  disabled={busy}
                  className="flex-1 min-h-11 flex items-center justify-center gap-2 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  Approve & refund {formatBDT(data.refund_amount)}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Approving cancels the booking, releases the cabin and raises the payout. The
                customer is emailed automatically.
              </p>
            </>
          ) : (
            <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
              <div className="font-semibold">
                {data.status_label}
                {data.decided_by_name && ` by ${data.decided_by_name}`}
              </div>
              {data.decision_note && (
                <div className="text-muted-foreground">{data.decision_note}</div>
              )}
            </div>
          )}
        </div>
      )}
    </DialogShell>
  );
}

/* ── Refund register ─────────────────────────────────────────────────────── */

function RefundRegister() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [payFor, setPayFor] = useState<StaffRefund | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "refunds", status, search],
    queryFn: () => getRefunds({ status: status || undefined, search: search || undefined }),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["staff", "refunds"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "refund-summary"] });
  }

  async function download(kind: "pdf" | "csv") {
    try {
      const blob = await downloadRefundRegister(kind === "csv" ? { export: "csv" } : {});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `refund-register.${kind}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorText(err));
    }
  }

  const rows = data?.results ?? [];

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {REFUND_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={`px-4 min-h-11 rounded-full text-xs font-semibold transition-colors ${
              status === f.value
                ? "bg-gold/15 text-gold border border-gold/40"
                : "border border-border text-muted-foreground hover:border-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Booking, name, phone or reference"
          className={`${staffInputClass} max-w-xs ml-auto`}
        />
        <button
          onClick={() => setCreating(true)}
          className="min-h-11 px-4 rounded-full border border-border text-xs font-semibold hover:border-gold hover:text-gold flex items-center gap-2"
        >
          <Plus className="size-3.5" /> Raise refund
        </button>
        <button
          onClick={() => download("pdf")}
          className="min-h-11 px-4 rounded-full border border-border text-xs font-semibold hover:border-gold hover:text-gold flex items-center gap-2"
        >
          <FileText className="size-3.5" /> PDF
        </button>
        <button
          onClick={() => download("csv")}
          className="min-h-11 px-4 rounded-full border border-border text-xs font-semibold hover:border-gold hover:text-gold flex items-center gap-2"
        >
          <Download className="size-3.5" /> CSV
        </button>
      </div>

      <SectionCard bodyClassName="divide-y divide-border">
        {isLoading && (
          <div className="p-10 text-center">
            <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No refunds match this filter.
          </div>
        )}
        {rows.map((refund) => (
          <div key={refund.id} className="px-5 py-4 flex flex-wrap items-center gap-4">
            <div className="min-w-[190px]">
              <div className="font-mono text-sm">{refund.booking_code}</div>
              <div className="text-xs text-muted-foreground">
                {refund.customer_name} · {refund.phone}
              </div>
            </div>
            <div className="text-xs min-w-[160px]">
              <div>{refund.reason_label}</div>
              <div className="text-muted-foreground">
                Raised {refund.age_days}d ago by {refund.created_by_name}
              </div>
            </div>
            <div className="text-xs min-w-[170px] text-muted-foreground">
              {refund.status === "paid" ? (
                <>
                  <div>
                    {refund.method_label} · {refund.reference_no}
                  </div>
                  <div>by {refund.processed_by_name}</div>
                </>
              ) : (
                <div>
                  {refund.account_number
                    ? `${refund.method_label} ${refund.account_number}`
                    : "No payout destination recorded"}
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="font-display text-lg">{formatBDT(refund.amount)}</div>
                <div className="flex gap-1.5 justify-end">
                  {refund.overdue && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
                      Overdue
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      refund.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : refund.status === "pending"
                          ? "bg-gold/15 text-gold"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {refund.status_label}
                  </span>
                </div>
              </div>
              {refund.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPayFor(refund)}
                    className="min-h-11 px-4 rounded-full gradient-gold text-ocean text-[11px] uppercase tracking-wider font-semibold"
                  >
                    Mark paid
                  </button>
                  <VoidButton refund={refund} onDone={refresh} />
                </div>
              )}
            </div>
          </div>
        ))}
      </SectionCard>

      {payFor && (
        <MarkPaidDialog
          refund={payFor}
          onClose={() => setPayFor(null)}
          onDone={() => {
            setPayFor(null);
            refresh();
          }}
        />
      )}
      {creating && (
        <RaiseRefundDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}
    </>
  );
}

function VoidButton({ refund, onDone }: { refund: StaffRefund; onDone: () => void }) {
  const mutation = useMutation({
    mutationFn: (note: string) => voidRefund(refund.id, note),
    onSuccess: () => {
      toast.success("Refund voided.");
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <button
      onClick={() => {
        const note = window.prompt(
          "Why is this refund being voided? (raised in error, duplicate row, wrong booking)",
        );
        if (note?.trim()) mutation.mutate(note.trim());
      }}
      disabled={mutation.isPending}
      className="min-h-11 px-3 rounded-full border border-border text-[11px] text-muted-foreground hover:border-destructive hover:text-destructive"
    >
      <XCircle className="size-3.5" />
    </button>
  );
}

function MarkPaidDialog({
  refund,
  onClose,
  onDone,
}: {
  refund: StaffRefund;
  onClose: () => void;
  onDone: () => void;
}) {
  const [method, setMethod] = useState(refund.method || "bkash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      markRefundPaid(refund.id, {
        method,
        reference_no: reference,
        note,
      }),
    onSuccess: () => {
      toast.success("Recorded — the customer has been emailed the reference.");
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title={`Record payout — ${formatBDT(refund.amount)}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Info label="Booking" value={refund.booking_code} />
          <Info label="Customer" value={refund.customer_name} />
          {refund.account_number && (
            <Info label="Send to" value={`${refund.method_label} ${refund.account_number}`} />
          )}
          {refund.account_name && <Info label="Account name" value={refund.account_name} />}
        </div>

        <StaffField label="How was it sent?">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={staffInputClass}
          >
            {PAYOUT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </StaffField>

        <StaffField label="Transaction id">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. 9F7K2LM1QX"
            className={staffInputClass}
          />
        </StaffField>
        <p className="text-[11px] text-muted-foreground -mt-2">
          Required: without a reference this payout cannot be reconciled against the bKash or bank
          statement, and the register stops being an accounting document.
        </p>

        <StaffField label="Note (optional)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={staffInputClass}
          />
        </StaffField>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !reference.trim()}
          className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Mark as paid
        </button>
      </div>
    </DialogShell>
  );
}

function RaiseRefundDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [bookingCode, setBookingCode] = useState("");
  const [reason, setReason] = useState<
    "overpayment" | "duplicate_payment" | "goodwill" | "operator_cancellation"
  >("overpayment");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [override, setOverride] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createRefund({
        booking_code: bookingCode,
        reason,
        amount,
        note,
        allow_outside_claim_window: override,
      }),
    onSuccess: () => {
      toast.success("Refund raised.");
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title="Raise a refund" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          For money that was never ours (overpayment, a duplicate settlement) or a decision someone
          made (goodwill). Customer cancellations are not raised here — approving the request
          creates those, so the charge schedule cannot be bypassed.
        </p>

        <StaffField label="Booking code">
          <input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            placeholder="BK-…"
            className={`${staffInputClass} font-mono`}
          />
        </StaffField>

        <StaffField label="Reason">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as typeof reason)}
            className={staffInputClass}
          >
            <option value="overpayment">Overpayment</option>
            <option value="duplicate_payment">Duplicate payment</option>
            <option value="goodwill">Goodwill / service issue</option>
            <option value="operator_cancellation">Operator cancellation</option>
          </select>
        </StaffField>

        <StaffField label="Amount (BDT)">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={staffInputClass}
          />
        </StaffField>
        <p className="text-[11px] text-muted-foreground -mt-2">
          Checked server-side against what the booking actually received — a refund can never exceed
          the money that came in.
        </p>

        <StaffField label="Note">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className={staffInputClass}
          />
        </StaffField>

        <label className="flex items-start gap-2.5 text-xs">
          <input
            type="checkbox"
            checked={override}
            onChange={(e) => setOverride(e.target.checked)}
            className="mt-0.5 size-4 accent-gold"
          />
          <span>
            This sailing ended outside the normal claim window — override.
            <span className="text-muted-foreground">
              {" "}
              Reopens a closed accounting period, so the note is mandatory.
            </span>
          </span>
        </label>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !bookingCode || !amount}
          className="w-full min-h-11 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
        >
          {mutation.isPending ? "Saving…" : "Raise refund"}
        </button>
      </div>
    </DialogShell>
  );
}

function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-lg text-gold" : "font-semibold"}>
        {formatBDT(value)}
      </span>
    </div>
  );
}
