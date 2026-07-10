import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CalendarRange,
  CheckCircle2,
  DoorOpen,
  Download,
  Loader2,
  Moon,
  Package as PackageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";

import {
  DialogShell,
  PackageStatusBadge,
  PageHeader,
  StaffField,
  StatCard,
  errorText,
  staffInputClass,
} from "@/components/staff/ui";
import {
  createStaffPackage,
  deleteStaffPackage,
  downloadGuideReport,
  generatePackageRooms,
  getStaffPackages,
  togglePackageBooking,
  updateStaffPackage,
} from "@/lib/api/staff";
import { formatBDT, parseMoney } from "@/lib/money";
import type { PackageStatus, StaffPackage, StaffPackageWrite } from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/packages")({
  component: PackagesPage,
});

const PACKAGE_STATUSES: PackageStatus[] = ["draft", "open", "closed", "completed", "cancelled"];

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Why a package isn't accepting new bookings — mirrors the backend's
 * is_bookable() so the "Closed" chip explains itself instead of contradicting
 * the (lifecycle) status badge. */
function notBookableReason(p: StaffPackage): string {
  if (p.status !== "open") return "Not open";
  if (!p.is_booking_open) return "Manually closed";
  if (!p.booking_cutoff_datetime) return "No cutoff set";
  if (new Date(p.booking_cutoff_datetime) <= new Date()) return "Cutoff passed";
  return "Closed";
}

function PackagesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "">("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StaffPackage | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "packages", page],
    queryFn: () => getStaffPackages(page),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  }

  const toggleMutation = useMutation({
    mutationFn: ({ id, open }: { id: number; open: boolean }) => togglePackageBooking(id, open),
    onSuccess: (_d, v) => {
      toast.success(v.open ? "Booking reopened." : "Booking closed.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const roomsMutation = useMutation({
    mutationFn: (id: number) => generatePackageRooms(id),
    onSuccess: (d) => {
      toast.success(d.detail);
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStaffPackage(id),
    onSuccess: () => {
      toast.success("Package deleted.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  async function handleReport(pkg: StaffPackage) {
    try {
      const blob = await downloadGuideReport(pkg.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guide-report-${pkg.start_date}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorText(err));
    }
  }

  const all = data?.results ?? [];

  // Summary reflects the whole loaded set (before status/search refinement).
  const summary = useMemo(() => {
    const collected = all.reduce((s, p) => s + parseMoney(p.paid_total ?? "0"), 0);
    const due = all.reduce((s, p) => s + parseMoney(p.due_total ?? "0"), 0);
    const openCount = all.filter((p) => p.is_bookable).length;
    return { count: data?.count ?? all.length, collected, due, openCount };
  }, [all, data?.count]);

  const filtered = all.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const hay = `${p.marketing_title} ${p.ship_name}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.count / 25)) : 1;
  const filtersActive = !!(statusFilter || search);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Packages"
        subtitle={data ? `${data.count} package(s)` : "Loading…"}
      >
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-gold"
        >
          <Plus className="size-4" /> New package
        </button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total packages" value={String(summary.count)} icon={PackageIcon} />
        <StatCard
          label="Open for booking"
          value={String(summary.openCount)}
          icon={CalendarRange}
          tone="emerald"
        />
        <StatCard
          label="Collected"
          value={formatBDT(String(summary.collected))}
          icon={Wallet}
          tone="emerald"
        />
        <StatCard
          label="Outstanding due"
          value={formatBDT(String(summary.due))}
          icon={Wallet}
          highlight
          hint="Across shown packages"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title / ship…"
            className="w-64 bg-card border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterChip active={statusFilter === ""} onClick={() => setStatusFilter("")}>
            All
          </FilterChip>
          {PACKAGE_STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter((cur) => (cur === s ? "" : s))}
            >
              <span className="capitalize">{s}</span>
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Package table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <PackageIcon className="size-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {filtersActive ? "No packages match these filters." : "No packages yet."}
          </p>
          {!filtersActive && (
            <button
              onClick={() => setCreating(true)}
              className="mt-4 text-xs text-gold hover:underline"
            >
              Create your first package →
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-220">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <Th>Package</Th>
                  <Th>Dates</Th>
                  <Th>Status</Th>
                  <Th className="w-40">Occupancy</Th>
                  <Th className="text-right">Collected</Th>
                  <Th className="text-right">Due</Th>
                  <Th className="text-right pr-5">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <PackageRow
                    key={p.id}
                    pkg={p}
                    onEdit={() => setEditing(p)}
                    onToggle={() =>
                      toggleMutation.mutate({ id: p.id, open: !p.is_booking_open })
                    }
                    onGenerateRooms={() => roomsMutation.mutate(p.id)}
                    onReport={() => handleReport(p)}
                    onDelete={() => {
                      if (confirm("Delete this package? This cannot be undone."))
                        deleteMutation.mutate(p.id);
                    }}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30 font-medium">
                  <td className="px-4 py-3" colSpan={4}>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {filtered.length} package(s) shown
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600">
                    {formatBDT(
                      String(
                        filtered.reduce((s, p) => s + parseMoney(p.paid_total ?? "0"), 0),
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gold">
                    {formatBDT(
                      String(
                        filtered.reduce((s, p) => s + parseMoney(p.due_total ?? "0"), 0),
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-full border border-border disabled:opacity-30">
            ← Prev
          </button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-full border border-border disabled:opacity-30">
            Next →
          </button>
        </div>
      )}

      {(creating || editing) && (
        <PackageFormDialog
          pkg={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "border-gold bg-gold/10 text-gold"
          : "border-border text-muted-foreground hover:border-gold/50"
      }`}
    >
      {children}
    </button>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 eyebrow text-[9px] text-muted-foreground font-medium ${className}`}
    >
      {children}
    </th>
  );
}

function PackageRow({
  pkg: p,
  onEdit,
  onToggle,
  onGenerateRooms,
  onReport,
  onDelete,
}: {
  pkg: StaffPackage;
  onEdit: () => void;
  onToggle: () => void;
  onGenerateRooms: () => void;
  onReport: () => void;
  onDelete: () => void;
}) {
  const rooms = p.rooms_total ?? 0;
  const bookings = p.bookings_count ?? 0;
  const occupancy = rooms > 0 ? Math.min(100, Math.round((bookings / rooms) * 100)) : 0;
  const nights = nightsBetween(p.start_date, p.end_date);

  return (
    <tr className="hover:bg-ocean/3 transition-colors align-middle">
      {/* Package */}
      <td className="px-4 py-3">
        <div className="font-medium">{p.marketing_title || `${p.ship_name} sailing`}</div>
        <div className="text-xs text-muted-foreground">
          {p.ship_name} · {formatBDT(p.adult_price)} / adult
        </div>
      </td>

      {/* Dates */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <CalendarRange className="size-3.5 text-ocean/40 shrink-0" />
          {fmtDate(p.start_date)} → {fmtDate(p.end_date)}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Moon className="size-3" /> {nights}N
          </span>
          {p.is_bookable ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="size-3" /> Bookable
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1"
              title={notBookableReason(p)}
            >
              <Ban className="size-3" /> {notBookableReason(p)}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <PackageStatusBadge status={p.status} />
      </td>

      {/* Occupancy */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" /> {bookings}/{rooms}
          </span>
          <span>{occupancy}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-ocean" style={{ width: `${occupancy}%` }} />
        </div>
      </td>

      {/* Collected */}
      <td className="px-4 py-3 text-right whitespace-nowrap text-emerald-600 font-medium">
        {formatBDT(p.paid_total ?? "0")}
      </td>

      {/* Due */}
      <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-gold">
        {formatBDT(p.due_total ?? "0")}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <RowAction title="Edit" onClick={onEdit} icon={Pencil} />
          <RowAction
            title={p.is_booking_open ? "Close booking" : "Reopen booking"}
            onClick={onToggle}
            icon={p.is_booking_open ? Ban : CheckCircle2}
          />
          <RowAction title="Generate rooms" onClick={onGenerateRooms} icon={DoorOpen} />
          <RowAction title="Guide report (PDF)" onClick={onReport} icon={Download} />
          <RowAction title="Delete" onClick={onDelete} icon={Trash2} destructive />
        </div>
      </td>
    </tr>
  );
}

function RowAction({
  title,
  onClick,
  icon: Icon,
  destructive,
}: {
  title: string;
  onClick: () => void;
  icon: typeof Pencil;
  destructive?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-8 rounded-lg grid place-items-center transition-colors ${
        destructive
          ? "text-destructive/60 hover:text-destructive hover:bg-destructive/10"
          : "text-ocean/60 hover:text-gold hover:bg-gold/10"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}

/** ISO datetime → value for <input type="datetime-local"> (local, no seconds). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function PackageFormDialog({ pkg, onClose }: { pkg: StaffPackage | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StaffPackageWrite>({
    ship: pkg?.ship ?? 1,
    start_date: pkg?.start_date ?? "",
    end_date: pkg?.end_date ?? "",
    adult_price: pkg?.adult_price ?? "",
    status: pkg?.status ?? "draft",
    is_booking_open: pkg?.is_booking_open ?? true,
    booking_cutoff_datetime: pkg?.booking_cutoff_datetime ?? null,
    marketing_title: pkg?.marketing_title ?? "",
    marketing_description: pkg?.marketing_description ?? "",
    highlights: pkg?.highlights ?? [],
  });

  const set = (patch: Partial<StaffPackageWrite>) => setForm((f) => ({ ...f, ...patch }));

  const saveMutation = useMutation({
    mutationFn: () => (pkg ? updateStaffPackage(pkg.id, form) : createStaffPackage(form)),
    onSuccess: () => {
      toast.success(pkg ? "Package updated." : "Package created.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const canSubmit = form.start_date && form.end_date && form.adult_price;

  return (
    <DialogShell title={pkg ? `Edit — ${pkg.marketing_title || pkg.start_date}` : "New package"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StaffField label="Start date">
            <input type="date" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} className={staffInputClass} />
          </StaffField>
          <StaffField label="End date">
            <input type="date" value={form.end_date} onChange={(e) => set({ end_date: e.target.value })} className={staffInputClass} />
          </StaffField>
          <StaffField label="Adult price (BDT)">
            <input type="number" min={0} value={form.adult_price} onChange={(e) => set({ adult_price: e.target.value })} className={staffInputClass} />
          </StaffField>
          <StaffField label="Status">
            <select value={form.status} onChange={(e) => set({ status: e.target.value as PackageStatus })} className={staffInputClass}>
              {PACKAGE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </StaffField>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_booking_open}
            onChange={(e) => set({ is_booking_open: e.target.checked })}
            className="accent-gold"
          />
          Booking open (manual override)
        </label>

        <StaffField label="Booking cutoff">
          <input
            type="datetime-local"
            value={toLocalInput(form.booking_cutoff_datetime)}
            onChange={(e) =>
              set({
                booking_cutoff_datetime: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            className={staffInputClass}
          />
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Bookings close at this time. Leave blank to auto-set to noon the day before
            departure.
          </span>
        </StaffField>

        <StaffField label="Marketing title">
          <input value={form.marketing_title} onChange={(e) => set({ marketing_title: e.target.value })}
            placeholder="e.g. Sundarbans Explorer" className={staffInputClass} />
        </StaffField>
        <StaffField label="Marketing description">
          <textarea rows={3} value={form.marketing_description}
            onChange={(e) => set({ marketing_description: e.target.value })}
            className={`${staffInputClass} resize-none`} />
        </StaffField>
        <StaffField label="Highlights (one per line)">
          <textarea
            rows={3}
            value={(form.highlights ?? []).join("\n")}
            onChange={(e) => set({ highlights: e.target.value.split("\n").filter(Boolean) })}
            placeholder={"Mangrove safari\nSunset dinner"}
            className={`${staffInputClass} resize-none`}
          />
        </StaffField>

        <button
          disabled={!canSubmit || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-gold disabled:opacity-40"
        >
          {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          {pkg ? "Save changes" : "Create package"}
        </button>
        {!pkg && (
          <p className="text-xs text-muted-foreground text-center">
            Cutoff auto-sets to noon the day before departure. Use “Generate rooms” after creating.
          </p>
        )}
      </div>
    </DialogShell>
  );
}
