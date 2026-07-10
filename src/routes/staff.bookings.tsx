import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  ClipboardList,
  Copy,
  Download,
  Loader2,
  Percent,
  Plus,
  RefreshCcw,
  Search,
  Wallet,
  X as XIcon,
} from "lucide-react";

import {
  DialogShell,
  Info,
  PageHeader,
  StatCard,
  StatusBadge,
  STATUS_LABEL,
  errorText,
} from "@/components/staff/ui";

import {
  createStaffBooking,
  createStaffPayment,
  getStaffBooking,
  getStaffBookings,
  getStaffBookingsSummary,
  getStaffPackages,
  resendInvoice,
  getStaffInvoices,
  updateStaffBooking,
} from "@/lib/api/staff";
import { getPackageRooms } from "@/lib/api/packages";
import { formatBDT, parseMoney } from "@/lib/money";
import type { BookingStatus } from "@/lib/api/types";
import type { StaffBooking } from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/bookings")({
  component: BookingsPage,
});

const STATUSES: BookingStatus[] = [
  "pending",
  "partially_paid",
  "fully_paid",
  "cancelled",
  "completed",
];

type SortKey = "created" | "total" | "due";

/** Two-letter initials for the avatar chip. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Compact relative time, e.g. "3d ago" — falls back to a date past a week. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          toast.success(`${label} copied`);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      title={`Copy ${label.toLowerCase()}`}
      className="text-muted-foreground hover:text-gold transition-colors"
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="size-9 rounded-full bg-ocean/10 text-ocean grid place-items-center text-xs font-semibold shrink-0">
      {initials(name)}
    </span>
  );
}

function PaymentProgress({ paid, total }: { paid: string; total: string }) {
  const t = parseMoney(total);
  const p = parseMoney(paid);
  const pct = t > 0 ? Math.min(100, Math.round((p / t) * 100)) : 0;
  const full = pct >= 100;
  return (
    <div className="w-28">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span>{formatBDT(paid)}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${full ? "bg-emerald-500" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function toCsv(rows: StaffBooking[]): string {
  const header = [
    "Code",
    "Customer",
    "Phone",
    "Email",
    "Package",
    "Room",
    "Pax",
    "Total",
    "Paid",
    "Due",
    "Status",
    "Created",
  ];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((b) =>
    [
      b.booking_code,
      b.customer_name,
      b.phone,
      b.email,
      b.package_title,
      b.room_number,
      b.total_pax,
      b.total_amount,
      b.paid_amount,
      b.due_amount,
      STATUS_LABEL[b.status],
      new Date(b.created_at).toLocaleString(),
    ]
      .map(escape)
      .join(","),
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

function BookingsPage() {
  const [page, setPage] = useState(1);
  const [packageFilter, setPackageFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filters = {
    package: packageFilter,
    status: statusFilter || undefined,
    search: search || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "bookings", { page, ...filters }],
    queryFn: () => getStaffBookings({ page, ...filters }),
  });
  // True totals across the whole filtered set (not just this page).
  const { data: summary } = useQuery({
    queryKey: ["staff", "bookings-summary", filters],
    queryFn: () => getStaffBookingsSummary(filters),
  });
  const { data: packages } = useQuery({
    queryKey: ["staff", "packages", 1],
    queryFn: () => getStaffPackages(1),
  });

  // "Due only" refines this page client-side; sort is applied on top.
  const rows = useMemo(() => {
    const list = (data?.results ?? []).filter(
      (b) => !dueOnly || Number(b.due_amount) > 0,
    );
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortKey === "total") {
        cmp = parseMoney(a.total_amount) - parseMoney(b.total_amount);
      } else {
        cmp = parseMoney(a.due_amount) - parseMoney(b.due_amount);
      }
      return cmp * dir;
    });
  }, [data?.results, dueOnly, sortKey, sortDir]);

  const filtersActive = !!(packageFilter || statusFilter || search || dueOnly);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function clearFilters() {
    setPackageFilter(undefined);
    setStatusFilter("");
    setSearch("");
    setSearchInput("");
    setDueOnly(false);
    setPage(1);
  }

  function exportCsv() {
    if (rows.length === 0) {
      toast.error("Nothing to export.");
      return;
    }
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.count / 25)) : 1;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Bookings"
        subtitle={data ? `${data.count} booking(s)` : "Loading…"}
      >
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-medium text-ocean hover:border-gold hover:text-gold transition-colors"
        >
          <Download className="size-4" /> Export CSV
        </button>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-gold"
        >
          <Plus className="size-4" /> New booking
        </button>
      </PageHeader>

      {/* Summary cards — true totals across the filtered set */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total bookings"
          value={summary ? String(summary.count) : "—"}
          icon={ClipboardList}
          hint={filtersActive ? "Matching current filters" : "All bookings"}
        />
        <StatCard
          label="Collected"
          value={summary ? formatBDT(summary.paid_amount) : "—"}
          icon={Banknote}
          tone="emerald"
          hint={summary ? `of ${formatBDT(summary.total_amount)} booked` : undefined}
        />
        <StatCard
          label="Outstanding due"
          value={summary ? formatBDT(summary.due_amount) : "—"}
          icon={Wallet}
          highlight
          hint="To collect"
        />
        <StatCard
          label="Fully-paid rate"
          value={summary ? `${summary.fully_paid_rate}%` : "—"}
          icon={Percent}
          hint="Of active bookings"
        />
      </div>

      {/* Status quick-filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setPage(1);
            setStatusFilter("");
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            statusFilter === ""
              ? "border-gold bg-gold/10 text-gold"
              : "border-border text-muted-foreground hover:border-gold/50"
          }`}
        >
          All{summary ? ` · ${Object.values(summary.by_status).reduce((a, b) => a + b, 0)}` : ""}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setPage(1);
              setStatusFilter((cur) => (cur === s ? "" : s));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "border-gold bg-gold/10 text-gold"
                : "border-border text-muted-foreground hover:border-gold/50"
            }`}
          >
            {STATUS_LABEL[s]}
            <span className="ml-1.5 text-[10px] opacity-70">
              {summary?.by_status[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
          className="relative"
        >
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search code / name / phone…"
            className="w-64 bg-card border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gold"
          />
        </form>
        <select
          value={packageFilter ?? ""}
          onChange={(e) => {
            setPage(1);
            setPackageFilter(e.target.value ? Number(e.target.value) : undefined);
          }}
          className="bg-card border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
        >
          <option value="">All packages</option>
          {packages?.results.map((p) => (
            <option key={p.id} value={p.id}>
              {p.marketing_title || `${p.ship_name} ${p.start_date}`}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="bg-card border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none ml-1">
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(e) => setDueOnly(e.target.checked)}
            className="accent-gold size-4"
          />
          Due only
        </label>
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <XIcon className="size-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <Th>Code</Th>
              <Th>Customer</Th>
              <Th>Package</Th>
              <Th>Room</Th>
              <Th>Pax</Th>
              <Th sortKey="total" active={sortKey} dir={sortDir} onSort={toggleSort}>
                Total
              </Th>
              <Th>Paid / Progress</Th>
              <Th sortKey="due" active={sortKey} dir={sortDir} onSort={toggleSort}>
                Due
              </Th>
              <Th>Status</Th>
              <Th sortKey="created" active={sortKey} dir={sortDir} onSort={toggleSort}>
                Created
              </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin inline text-gold" />
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  No bookings match these filters.
                </td>
              </tr>
            )}
            {rows.map((b) => (
              <tr
                key={b.id}
                onClick={() => setDetailId(b.id)}
                className="cursor-pointer hover:bg-ocean/3 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-ocean whitespace-nowrap">
                  {b.booking_code}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={b.customer_name} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{b.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-40 truncate">{b.package_title}</td>
                <td className="px-4 py-3">{b.room_number}</td>
                <td className="px-4 py-3">{b.total_pax}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatBDT(b.total_amount)}</td>
                <td className="px-4 py-3">
                  <PaymentProgress paid={b.paid_amount} total={b.total_amount} />
                </td>
                <td
                  className={`px-4 py-3 font-medium whitespace-nowrap ${
                    Number(b.due_amount) > 0 ? "text-gold" : ""
                  }`}
                >
                  {formatBDT(b.due_amount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(b.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-full border border-border disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-full border border-border disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {detailId !== null && (
        <BookingDetailDialog bookingId={detailId} onClose={() => setDetailId(null)} />
      )}
      {showCreate && <CreateBookingDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

/** Table header cell; sortable when a sortKey is passed. */
function Th({
  children,
  sortKey,
  active,
  dir,
  onSort,
}: {
  children: React.ReactNode;
  sortKey?: SortKey;
  active?: SortKey;
  dir?: "asc" | "desc";
  onSort?: (key: SortKey) => void;
}) {
  const isActive = sortKey && active === sortKey;
  if (!sortKey || !onSort) {
    return (
      <th className="px-4 py-3 eyebrow text-[9px] text-muted-foreground font-medium">
        {children}
      </th>
    );
  }
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 eyebrow text-[9px] font-medium transition-colors ${
          isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {children}
        <span className="text-[8px]">{isActive ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

/* ── Detail dialog ── */
function BookingDetailDialog({ bookingId, onClose }: { bookingId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: booking } = useQuery({
    queryKey: ["staff", "booking", bookingId],
    queryFn: () => getStaffBooking(bookingId),
  });
  const { data: invoices } = useQuery({
    queryKey: ["staff", "invoices", bookingId],
    queryFn: () => getStaffInvoices(bookingId),
  });
  const [payAmount, setPayAmount] = useState("");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  }

  const statusMutation = useMutation({
    mutationFn: (status: BookingStatus) => updateStaffBooking(bookingId, { status }),
    onSuccess: () => {
      toast.success("Status updated.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const paymentMutation = useMutation({
    mutationFn: () =>
      createStaffPayment({
        booking: bookingId,
        amount: payAmount,
        payment_type: "partial",
        gateway: "cash",
      }),
    onSuccess: () => {
      toast.success("Payment recorded — invoice email sent.");
      setPayAmount("");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const resendMutation = useMutation({
    mutationFn: (invoiceId: number) => resendInvoice(invoiceId),
    onSuccess: () => toast.success("Invoice email resent."),
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell onClose={onClose} title={booking?.booking_code ?? "Booking"}>
      {!booking ? (
        <div className="py-12 text-center">
          <Loader2 className="size-5 animate-spin inline text-gold" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Identity header */}
          <div className="flex items-center gap-3 pb-1">
            <Avatar name={booking.customer_name} />
            <div className="min-w-0">
              <div className="font-medium truncate">{booking.customer_name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-ocean">{booking.booking_code}</span>
                <CopyButton value={booking.booking_code} label="Booking code" />
              </div>
            </div>
            <div className="ml-auto">
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <Info label="Phone" value={booking.phone} />
              <CopyButton value={booking.phone} label="Phone" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <Info label="Email" value={booking.email} />
              <CopyButton value={booking.email} label="Email" />
            </div>
            <Info label="Room" value={booking.room_number} />
            <Info label="Package" value={booking.package_title} />
            <Info
              label="Pax"
              value={`${booking.adult_count} adult(s), ${booking.kid_details.length} kid(s)`}
            />
            <Info label="Total" value={formatBDT(booking.total_amount)} />
            <Info label="Paid" value={formatBDT(booking.paid_amount)} />
            <Info label="Due" value={formatBDT(booking.due_amount)} />
          </div>

          {/* Payment progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Collection progress</span>
              <span>
                {parseMoney(booking.total_amount) > 0
                  ? Math.round(
                      (parseMoney(booking.paid_amount) /
                        parseMoney(booking.total_amount)) *
                        100,
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  Number(booking.due_amount) <= 0 ? "bg-emerald-500" : "bg-gold"
                }`}
                style={{
                  width: `${
                    parseMoney(booking.total_amount) > 0
                      ? Math.min(
                          100,
                          (parseMoney(booking.paid_amount) /
                            parseMoney(booking.total_amount)) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Status change */}
          <div className="rounded-xl border border-border p-4">
            <div className="eyebrow text-muted-foreground text-[10px] mb-3">Change status</div>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={booking.status === s || statusMutation.isPending}
                  onClick={() => {
                    if (s === "cancelled" && !confirm("Cancel this booking? The room becomes available again.")) return;
                    statusMutation.mutate(s);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs capitalize border transition-colors ${
                    booking.status === s
                      ? "border-gold bg-gold/10 text-gold font-semibold"
                      : "border-border hover:border-gold/50"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Record payment */}
          {booking.status !== "cancelled" && Number(booking.due_amount) > 0 && (
            <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
              <div className="eyebrow text-gold text-[10px] mb-3">
                Record cash payment (due {formatBDT(booking.due_amount)})
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-background border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-gold"
                />
                <button
                  disabled={!payAmount || paymentMutation.isPending}
                  onClick={() => paymentMutation.mutate()}
                  className="px-5 py-2 rounded-full gradient-gold text-ocean text-xs font-semibold disabled:opacity-40"
                >
                  {paymentMutation.isPending ? "Saving…" : "Record"}
                </button>
              </div>
            </div>
          )}

          {/* Payments */}
          <div>
            <div className="eyebrow text-muted-foreground text-[10px] mb-2">Payments</div>
            {booking.payments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payments yet.</div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border text-sm">
                {booking.payments.map((p) => (
                  <div key={p.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{formatBDT(p.amount)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {p.gateway} · {p.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          {invoices && invoices.results.length > 0 && (
            <div>
              <div className="eyebrow text-muted-foreground text-[10px] mb-2">Invoices</div>
              <div className="divide-y divide-border rounded-xl border border-border text-sm">
                {invoices.results.map((inv) => (
                  <div key={inv.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      {inv.sent_at ? `Sent ${new Date(inv.sent_at).toLocaleString()}` : "Not sent"}
                    </div>
                    <div className="flex items-center gap-3">
                      {inv.pdf_url && (
                        <a href={inv.pdf_url} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline">
                          PDF
                        </a>
                      )}
                      <button
                        onClick={() => resendMutation.mutate(inv.id)}
                        className="text-xs text-ocean hover:underline flex items-center gap-1"
                      >
                        <RefreshCcw className="size-3" /> Resend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status history */}
          <div>
            <div className="eyebrow text-muted-foreground text-[10px] mb-2">Status history</div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {booking.status_logs.map((log, i) => (
                <div key={i}>
                  {new Date(log.created_at).toLocaleString()} — {log.old_status || "created"} →{" "}
                  <span className="font-medium text-foreground">{log.new_status}</span>
                  {log.changed_by_username ? ` by ${log.changed_by_username}` : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DialogShell>
  );
}

/* ── Create booking dialog ── */
function CreateBookingDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [packageId, setPackageId] = useState<number | undefined>();
  const [roomId, setRoomId] = useState<number | undefined>();
  const [adultCount, setAdultCount] = useState(2);
  const [kidAges, setKidAges] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { data: packages } = useQuery({
    queryKey: ["staff", "packages", 1],
    queryFn: () => getStaffPackages(1),
  });
  const { data: rooms } = useQuery({
    queryKey: ["packages", packageId, "rooms"],
    queryFn: () => getPackageRooms(packageId!),
    enabled: packageId !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createStaffBooking({
        package_id: packageId!,
        room_id: roomId!,
        adult_count: adultCount,
        kid_details: kidAges.map((age) => ({ age })),
        customer_name: name,
        phone,
        email,
      }),
    onSuccess: () => {
      toast.success("Booking created.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const canSubmit = packageId && roomId && name && phone && email;

  return (
    <DialogShell onClose={onClose} title="New manual booking">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Package</span>
            <select
              value={packageId ?? ""}
              onChange={(e) => {
                setPackageId(e.target.value ? Number(e.target.value) : undefined);
                setRoomId(undefined);
              }}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
            >
              <option value="">Select…</option>
              {packages?.results.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.marketing_title || `${p.ship_name} ${p.start_date}`}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Room</span>
            <select
              value={roomId ?? ""}
              onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : undefined)}
              disabled={!rooms}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold disabled:opacity-40"
            >
              <option value="">Select…</option>
              {rooms
                ?.filter((r) => r.availability === "available")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} · {r.room_type.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Adults</span>
            <input
              type="number"
              min={1}
              value={adultCount}
              onChange={(e) => setAdultCount(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              Kid ages (comma separated)
            </span>
            <input
              placeholder="e.g. 4, 7"
              onChange={(e) =>
                setKidAges(
                  e.target.value
                    .split(",")
                    .map((s) => Number.parseInt(s.trim(), 10))
                    .filter((n) => !Number.isNaN(n)),
                )
              }
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block col-span-2">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Customer name</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold" />
          </label>
        </div>

        <button
          disabled={!canSubmit || createMutation.isPending}
          onClick={() => createMutation.mutate()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-gold disabled:opacity-40"
        >
          {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Create booking
        </button>
      </div>
    </DialogShell>
  );
}

