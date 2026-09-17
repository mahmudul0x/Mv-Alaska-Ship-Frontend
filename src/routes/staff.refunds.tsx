import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
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
import { getPaymentsNeedingReview, resolveStaffPayment } from "@/lib/api/staff";
import type { PaymentResolution, StaffPayment } from "@/lib/api/staffTypes";
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
import type { StringKey } from "@/lib/i18n/strings";
import { currentLang, useLanguage, useT } from "@/lib/i18n";
import { date, dateTime, money, num } from "@/lib/i18n/format";
import { copyToClipboard } from "@/lib/clipboard";

export const Route = createFileRoute("/staff/refunds")({
  component: RefundsPage,
  // The sidebar bell links straight at a thing rather than at the page: a
  // notification you then have to go hunting for is a worse version of a
  // number. `request` opens that cancellation dialog; `tab` picks the tab.
  validateSearch: (s: Record<string, unknown>) => ({
    request: typeof s.request === "number" ? s.request : undefined,
    tab:
      s.tab === "queue" || s.tab === "register" || s.tab === "review"
        ? (s.tab as "queue" | "register" | "review")
        : undefined,
  }),
});

const REQUEST_FILTERS: { value: string; label: StringKey }[] = [
  { value: "pending", label: "rf.filterPending" },
  { value: "approved", label: "rf.filterApproved" },
  { value: "rejected", label: "rf.filterRejected" },
  { value: "", label: "common.all" },
];

const REFUND_FILTERS: { value: string; label: StringKey }[] = [
  { value: "pending", label: "rf.filterOwed" },
  { value: "paid", label: "rf.filterPaid" },
  { value: "void", label: "rf.filterVoid" },
  { value: "", label: "common.all" },
];

const PAYOUT_METHODS: { value: string; label: StringKey | "bKash" | "Nagad" }[] = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank_transfer", label: "rf.bankTransfer" },
  { value: "cash", label: "rf.cash" },
  { value: "gateway", label: "rf.paymentGateway" },
];

function RefundsPage() {
  const { t, lang } = useLanguage();
  const search = Route.useSearch();
  // A linked-to request is always in the queue, so the tab follows from it
  // without the link having to say both.
  const [tab, setTab] = useState<"queue" | "register" | "review">(
    search.request ? "queue" : (search.tab ?? "queue"),
  );

  const requestSummary = useQuery({
    queryKey: ["staff", "cancellation-summary"],
    queryFn: getCancellationRequestSummary,
  });
  const refundSummary = useQuery({
    queryKey: ["staff", "refund-summary"],
    queryFn: getRefundSummary,
  });
  // Fetched here rather than inside the tab so the tab itself can be hidden
  // when the queue is empty.
  const review = useQuery({
    queryKey: ["staff", "payments", "review"],
    queryFn: getPaymentsNeedingReview,
  });
  const reviewCount = review.data?.length ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title={t("rf.title")} subtitle={t("rf.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("rf.awaitingDecision")}
          value={String(requestSummary.data?.pending_count ?? 0)}
          icon={Clock3}
          highlight={(requestSummary.data?.pending_count ?? 0) > 0}
          hint={
            requestSummary.data
              ? t("rf.wouldBeRefunded", {
                  amount: money(requestSummary.data.pending_refund_total, lang),
                })
              : undefined
          }
        />
        {/* The important number on this page: money promised and not yet sent.
            In accounting terms it is a debt the company is carrying, and it is
            invisible anywhere else in the system. */}
        <StatCard
          label={t("rf.liability")}
          value={money(refundSummary.data?.liability_total ?? "0.00", lang)}
          icon={Wallet}
          tone="destructive"
          hint={t("rf.payoutsOwed", { n: num(refundSummary.data?.liability_count ?? 0, lang) })}
        />
        <StatCard
          label={t("rf.overduePayouts")}
          value={String(refundSummary.data?.overdue_count ?? 0)}
          icon={AlertTriangle}
          tone={refundSummary.data?.overdue_count ? "destructive" : "default"}
          hint={t("rf.overdueHint")}
        />
        <StatCard
          label={t("rf.paidOut")}
          value={money(refundSummary.data?.paid_total ?? "0.00", lang)}
          icon={Banknote}
          tone="emerald"
          hint={t("rf.settledCount", { n: num(refundSummary.data?.paid_count ?? 0, lang) })}
        />
      </div>

      {(requestSummary.data?.departed_undecided_count ?? 0) > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <Ship className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>
              {t("rf.undecidedCount", {
                n: num(requestSummary.data?.departed_undecided_count ?? 0, lang),
              })}
            </strong>{" "}
            <span className="text-muted-foreground">{t("rf.undecidedNote")}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["queue", "register", "review"] as const).map((value) =>
          // The review tab only exists when something is in it: a permanently
          // empty tab teaches people to stop looking at it.
          value === "review" && !reviewCount ? null : (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`px-4 min-h-11 rounded-full text-xs uppercase tracking-[0.14em] font-semibold transition-colors ${
                tab === value
                  ? "bg-ocean text-background"
                  : "border border-border text-muted-foreground hover:border-gold hover:text-gold"
              }`}
            >
              {value === "queue"
                ? t("rf.queueTab")
                : value === "register"
                  ? t("rf.registerTab")
                  : `${t("rv.title")} (${num(reviewCount, lang)})`}
            </button>
          ),
        )}
      </div>

      {tab === "queue" ? (
        <CancellationQueue openRequestId={search.request} />
      ) : tab === "review" ? (
        <ReviewQueue />
      ) : (
        <RefundRegister />
      )}
    </div>
  );
}

/* ── Payments the gateway flagged, or that we could not process ─────────── */

/** The manual-review queue, which until now existed only as a database flag
 *  and a log line.
 *
 *  Two different things land here and they need opposite reactions:
 *
 *  - **High risk.** SSLCommerz's own fraud check said so, and their document
 *    is explicit: hold the service and verify the customer. The money is real
 *    and stays credited — what is withheld is trust in it, so this is a
 *    "check who they are before they board", not a payment problem.
 *  - **Could not be processed.** The IPN threw, so the payment sits PENDING
 *    holding its cabin, and money may have been captured without being
 *    credited. Only the merchant panel can say which.
 */
function ReviewQueue() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [resolving, setResolving] = useState<StaffPayment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "payments", "review"],
    queryFn: getPaymentsNeedingReview,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["staff", "payments", "review"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["staff", "bookings"] });
  }

  const rows = data ?? [];

  return (
    <>
      <p className="text-xs text-muted-foreground max-w-2xl">{t("rv.subtitle")}</p>

      <SectionCard bodyClassName="divide-y divide-border">
        {isLoading && (
          <div className="p-10 text-center">
            <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">{t("rv.none")}</div>
        )}
        {rows.map((payment) => {
          const risky = payment.gateway_risk_level === 1;
          return (
            <div key={payment.id} className="px-5 py-4 space-y-2.5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[190px]">
                  <div className="font-mono text-sm">{payment.booking_code}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {payment.transaction_id}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    risky ? "bg-destructive/10 text-destructive" : "bg-gold/15 text-gold-text"
                  }`}
                >
                  {risky ? t("rv.highRisk") : t("rv.stuck")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("rv.attempts", { n: num(payment.reconcile_attempts, lang) })}
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <div className="font-display text-lg">{money(payment.amount, lang)}</div>
                  <button
                    onClick={() => setResolving(payment)}
                    className="min-h-11 px-4 rounded-full gradient-gold text-ocean text-[11px] uppercase tracking-wider font-semibold"
                  >
                    {t("rv.resolve")}
                  </button>
                </div>
              </div>

              {/* Why it is here, in the words written when it was flagged. */}
              {payment.last_reconcile_error && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {payment.last_reconcile_error}
                </p>
              )}
              <p className="text-[11px] text-gold-text leading-relaxed">
                {risky ? t("rv.riskNote") : t("rv.stuckNote")}
              </p>
            </div>
          );
        })}
      </SectionCard>

      {resolving && (
        <ResolvePaymentDialog
          payment={resolving}
          onClose={() => setResolving(null)}
          onDone={() => {
            setResolving(null);
            refresh();
          }}
        />
      )}
    </>
  );
}

/** Three outcomes, each written as what the panel showed rather than as a
 *  status name — "settle this payment" is a decision about someone's money,
 *  and the person clicking it should be answering a question of fact. */
function ResolvePaymentDialog({
  payment,
  onClose,
  onDone,
}: {
  payment: StaffPayment;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t, lang } = useLanguage();
  const [choice, setChoice] = useState<PaymentResolution | "">("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      resolveStaffPayment(payment.id, { status: choice as PaymentResolution, note }),
    onSuccess: () => {
      toast.success(t("rv.resolved"));
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const OPTIONS: { value: PaymentResolution; label: StringKey }[] = [
    { value: "success", label: "rv.moneyArrived" },
    { value: "failed", label: "rv.noMoney" },
    { value: "cancelled", label: "rv.customerCancelled" },
  ];

  function submit() {
    // Crediting money is the one choice here that cannot be walked back by
    // another click, so it asks first.
    if (choice === "success" && !confirm(t("rv.confirmSettle"))) return;
    mutation.mutate();
  }

  return (
    <DialogShell title={t("rv.resolve")} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t("bk.bookingCode")}</span>
            <span className="font-mono">{payment.booking_code}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t("rf.tranId")}</span>
            <span className="font-mono text-xs">{payment.transaction_id}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t("bk.amount")}</span>
            <span className="font-semibold">{money(payment.amount, lang)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="eyebrow text-muted-foreground text-[10px]">{t("rv.whatPanelShowed")}</div>
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
                choice === opt.value
                  ? "border-gold bg-ocean/4"
                  : "border-border hover:border-gold/50"
              }`}
            >
              <input
                type="radio"
                name="resolution"
                className="mt-0.5 size-4 shrink-0 accent-gold"
                checked={choice === opt.value}
                onChange={() => setChoice(opt.value)}
              />
              <span className="text-sm leading-snug">{t(opt.label)}</span>
            </label>
          ))}
        </div>

        <StaffField label={t("rv.noteLabel")}>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={staffInputClass}
          />
        </StaffField>

        <button
          disabled={!choice || mutation.isPending}
          onClick={submit}
          className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold disabled:opacity-40"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {t("rv.resolve")}
        </button>
      </div>
    </DialogShell>
  );
}

/* ── Cancellation queue ──────────────────────────────────────────────────── */

function CancellationQueue({ openRequestId }: { openRequestId?: number }) {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  // Seeded from the URL so a bell link lands on the open dialog, not on the
  // queue with the reader left to find the row again.
  const [openId, setOpenId] = useState<number | null>(openRequestId ?? null);

  // ...and re-opened when the link is followed from THIS page, where the
  // component never unmounts and the initial state above would never run
  // again. Guarded on the id so closing the dialog does not immediately
  // reopen it.
  useEffect(() => {
    if (openRequestId) setOpenId(openRequestId);
  }, [openRequestId]);

  /** Closing drops the id from the URL as well as from state. Leaving it there
   *  would mean the same bell link, followed twice, opened nothing the second
   *  time — the search param would not have changed, so the effect above would
   *  not fire. */
  function close() {
    setOpenId(null);
    if (openRequestId) {
      navigate({ to: "/staff/refunds", search: {}, replace: true });
    }
  }

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
            {t(f.label)}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("rf.searchRequest")}
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
          <div className="p-10 text-center text-sm text-muted-foreground">
            {t("common.nothingHere")}
          </div>
        )}
        {rows.map((row) => (
          <QueueRow key={row.id} row={row} onOpen={() => setOpenId(row.id)} />
        ))}
      </SectionCard>

      {openId !== null && (
        <RequestDialog
          id={openId}
          onClose={close}
          onDecided={() => {
            close();
            refresh();
          }}
        />
      )}
    </>
  );
}

function QueueRow({ row, onOpen }: { row: StaffCancellationRequest; onOpen: () => void }) {
  const { t, lang } = useLanguage();
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
          {t("bk.paidCharge", {
            paid: money(row.paid_amount, lang),
            charge: money(row.cancellation_charge, lang),
          })}
        </div>
      </div>
      <div className="ml-auto text-right">
        <div className="font-display text-lg text-gold">{money(row.refund_amount, lang)}</div>
        <div className="flex items-center gap-1.5 justify-end mt-0.5">
          {row.departure_passed && row.status === "pending" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
              {t("rf.departed")}
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
  const { t, lang } = useLanguage();
  const [note, setNote] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "cancellation-request", id],
    queryFn: () => getCancellationRequest(id),
  });

  const approve = useMutation({
    mutationFn: () => approveCancellation(id, note),
    onSuccess: () => {
      toast.success(t("rf.cancelledRaised"));
      onDecided();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const reject = useMutation({
    mutationFn: () => rejectCancellation(id, note),
    onSuccess: () => {
      toast.success(t("rf.rejected"));
      onDecided();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const pending = data?.status === "pending";
  const busy = approve.isPending || reject.isPending;

  return (
    <DialogShell title={t("rf.request")} onClose={onClose}>
      {isLoading || !data ? (
        <div className="py-10 text-center">
          <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Info label={t("rf.booking")} value={data.booking_code} />
            <Info label={t("rf.customer")} value={`${data.customer_name} · ${data.phone}`} />
            <Info label={t("rf.departure")} value={data.package_start_date} />
            <Info label={t("rf.requested")} value={dateTime(data.requested_at, lang)} />
            <Info label={t("bk.reason")} value={data.reason_label} />
            <Info label={t("rf.source")} value={data.source === "staff" ? "Staff" : "Website"} />
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
              <MoneyRow label={t("rf.paidByCustomer")} value={data.paid_amount} />
              <MoneyRow label={t("rf.charge")} value={data.cancellation_charge} />
              <MoneyRow label={t("rf.refundDue")} value={data.refund_amount} strong />
              {data.shortfall_amount !== "0.00" && (
                <div className="px-4 py-2.5 text-xs text-muted-foreground">
                  {t("rf.shortfallNote", { amount: money(data.shortfall_amount, lang) })}
                  only, never billed.
                </div>
              )}
            </div>
          </div>

          {data.refund_account_number && (
            <div className="grid grid-cols-2 gap-4">
              <Info label={t("rf.payoutTo")} value={data.refund_method} />
              <Info label={t("rf.account")} value={data.refund_account_number} />
              <Info label={t("payout.accountName")} value={data.refund_account_name} />
              {data.bank_name && (
                <Info label={t("rf.bank")} value={`${data.bank_name} — ${data.branch_name}`} />
              )}
            </div>
          )}

          {pending ? (
            <>
              <StaffField label={t("rf.noteReject")}>
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
                  {t("rf.reject")}
                </button>
                <button
                  onClick={() => approve.mutate()}
                  disabled={busy}
                  className="flex-1 min-h-11 flex items-center justify-center gap-2 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {t("rf.approveRefund", { amount: money(data.refund_amount, lang) })}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("rf.approveNote")}</p>
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
  const { t, lang } = useLanguage();
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
            {t(f.label)}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("rf.searchRefund")}
          className={`${staffInputClass} max-w-xs ml-auto`}
        />
        <button
          onClick={() => setCreating(true)}
          className="min-h-11 px-4 rounded-full border border-border text-xs font-semibold hover:border-gold hover:text-gold flex items-center gap-2"
        >
          <Plus className="size-3.5" /> {t("rf.raiseShort")}
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
          <div className="p-10 text-center text-sm text-muted-foreground">{t("rf.noMatch")}</div>
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
                    : t("rf.noDestination")}
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="font-display text-lg">{money(refund.amount, lang)}</div>
                <div className="flex gap-1.5 justify-end">
                  {refund.overdue && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
                      {t("rf.overdue")}
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
                    {t("rf.markPaid")}
                  </button>
                  <VoidButton refund={refund} onDone={refresh} />
                </div>
              )}
            </div>

            {refund.status === "pending" && <PanelTransactions refund={refund} />}
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
  const t = useT();
  const mutation = useMutation({
    mutationFn: (note: string) => voidRefund(refund.id, note),
    onSuccess: () => {
      toast.success(t("rf.voided"));
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <button
      onClick={() => {
        const note = window.prompt(t("rf.voidPrompt"));
        if (note?.trim()) mutation.mutate(note.trim());
      }}
      disabled={mutation.isPending}
      className="min-h-11 px-3 rounded-full border border-border text-[11px] text-muted-foreground hover:border-destructive hover:text-destructive"
    >
      <XCircle className="size-3.5" />
    </button>
  );
}

/** The transactions this payout has to be issued against, on the row itself.
 *
 *  SSLCommerz refunds a TRANSACTION; this ledger records a booking-level
 *  liability. Without the ids here the only route to them was Refund register
 *  → booking code → Bookings → find the booking → open it → copy the payment —
 *  six steps whose failure mode is refunding a different customer's money.
 *
 *  Shown only while a refund is still pending, which is exactly when someone
 *  is about to go and do it. Once paid, the reference number on the row is the
 *  record that matters.
 */
function PanelTransactions({ refund }: { refund: StaffRefund }) {
  const { t, lang } = useLanguage();
  const txns = refund.gateway_transactions;

  if (txns.length === 0) {
    // Nothing settled through the gateway: cash at the desk, or a booking
    // whose payment predates the payload being stored. The payout is still
    // owed — it just cannot be a gateway reversal.
    return (
      <div className="w-full rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        {t("rf.noGatewayTxn")}
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-muted/40 px-3 py-2.5 space-y-1.5">
      <div className="eyebrow text-[9px] text-muted-foreground">
        {txns.length > 1 ? t("rf.refundAgainstEach") : t("rf.refundAgainst")}
      </div>
      {txns.map((txn) => (
        <div key={txn.transaction_id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <CopyField label={t("rf.bankTranId")} value={txn.bank_tran_id} mono />
          <CopyField label={t("rf.tranId")} value={txn.transaction_id} mono />
          <span className="text-[11px] text-muted-foreground">
            {money(txn.amount, lang)}
            {txn.card_type ? ` · ${txn.card_type}` : ""}
            {txn.paid_at ? ` · ${date(txn.paid_at, lang)}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/** One id with a click-to-copy button. Copying beats selecting by hand: these
 *  are 27 characters of unbroken base-36 that a person will mis-transcribe. */
function CopyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <span className="text-[11px] text-muted-foreground">
        {label}: <span className="italic">{t("common.none")}</span>
      </span>
    );
  }

  async function copy() {
    if (await copyToClipboard(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error(t("rf.copyFailed"));
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={t("rf.copy")}
      className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:border-gold transition-colors"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
      {copied ? (
        <Check className="size-3 text-emerald-600" />
      ) : (
        <Copy className="size-3 text-muted-foreground group-hover:text-gold" />
      )}
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
  const { t, lang } = useLanguage();
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
      toast.success(t("rf.recorded"));
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell
      title={t("rf.recordPayout", { amount: money(refund.amount, lang) })}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Info label={t("rf.booking")} value={refund.booking_code} />
          <Info label={t("rf.customer")} value={refund.customer_name} />
          {refund.account_number && (
            <Info
              label={t("rf.sendTo")}
              value={`${refund.method_label} ${refund.account_number}`}
            />
          )}
          {refund.account_name && (
            <Info label={t("payout.accountName")} value={refund.account_name} />
          )}
        </div>

        <StaffField label={t("rf.howSent")}>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={staffInputClass}
          >
            {PAYOUT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label.includes(".") ? t(m.label as StringKey) : m.label}
              </option>
            ))}
          </select>
        </StaffField>

        <StaffField label={t("rf.transactionId")}>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="9F7K2LM1QX"
            className={staffInputClass}
          />
        </StaffField>
        <p className="text-[11px] text-muted-foreground -mt-2">{t("rf.referenceRequired")}</p>

        <StaffField label={t("rf.noteOptional")}>
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
          {t("rf.markPaid")}
        </button>
      </div>
    </DialogShell>
  );
}

function RaiseRefundDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const t = useT();
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
      toast.success(t("rf.raised"));
      onDone();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell title={t("rf.raise")} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">{t("rf.raiseNote")}</p>

        <StaffField label={t("bk.bookingCode")}>
          <input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            placeholder="BK-…"
            className={`${staffInputClass} font-mono`}
          />
        </StaffField>

        <StaffField label={t("bk.reason")}>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as typeof reason)}
            className={staffInputClass}
          >
            <option value="overpayment">{t("rfReason.overpayment")}</option>
            <option value="duplicate_payment">{t("rfReason.duplicate")}</option>
            <option value="goodwill">{t("rfReason.goodwill")}</option>
            <option value="operator_cancellation">{t("rfReason.operator")}</option>
          </select>
        </StaffField>

        <StaffField label={t("rf.amountBdt")}>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={staffInputClass}
          />
        </StaffField>
        <p className="text-[11px] text-muted-foreground -mt-2">{t("rf.amountNote")}</p>

        <StaffField label={t("common.notes")}>
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
            {t("rf.overrideWindow")}
            <span className="text-muted-foreground"> {t("rf.overrideNote")}</span>
          </span>
        </label>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !bookingCode || !amount}
          className="w-full min-h-11 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.14em] font-semibold disabled:opacity-40"
        >
          {mutation.isPending ? t("common.saving") : t("rf.raiseShort")}
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
        {money(value, currentLang())}
      </span>
    </div>
  );
}
