import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CalendarRange,
  CheckCircle2,
  CloudOff,
  DoorOpen,
  Download,
  Loader2,
  Moon,
  Package as PackageIcon,
  Pencil,
  Plus,
  Search,
  Ship,
  Trash2,
  Upload,
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
import { GuideReportMenu } from "@/components/staff/GuideReportMenu";
import { CancelDepartureDialog } from "@/components/staff/CancelDepartureDialog";
import {
  clearStaffPackageHero,
  createStaffPackage,
  deleteStaffPackage,
  downloadGuideReport,
  generatePackageRooms,
  getStaffPackages,
  getStaffShips,
  togglePackageBooking,
  updateStaffPackage,
  uploadStaffPackageHero,
} from "@/lib/api/staff";
import { parseLocalDate } from "@/lib/dates";
import { formatBDT, parseMoney } from "@/lib/money";
import type {
  PackageGroup,
  PackageStatus,
  StaffPackage,
  StaffPackageWrite,
} from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/packages")({
  component: PackagesPage,
});

/** Every status a package can be set to, for the form's dropdown. */
const PACKAGE_STATUSES: PackageStatus[] = ["draft", "open", "closed", "completed", "cancelled"];

/** The subset worth filtering by inside the Active tab. "completed" and
 *  "cancelled" are missing on purpose: they are tabs of their own, so a chip
 *  for them would always come back empty. */
const ACTIVE_STATUSES: PackageStatus[] = ["draft", "open", "closed"];

/** An empty tab should say which emptiness it is. "No packages yet" under
 *  Cancelled reads as though the whole dashboard is empty. */
const EMPTY_BY_GROUP: Record<PackageGroup, string> = {
  active: "No packages yet.",
  past: "No sailings have finished yet.",
  cancelled: "Nothing has been cancelled — which is the way it should be.",
};

const GROUPS: { value: PackageGroup; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

function nightsBetween(start: string, end: string): number {
  const ms = parseLocalDate(end).getTime() - parseLocalDate(start).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function fmtDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("en-GB", {
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

/** True while the ship is out: departed, not yet returned.
 *
 *  These stay in Active on purpose. Booking is shut, but the sailing is very
 *  much live work — the guide report is printed from it and the balance is
 *  collected on board. Filing it under Past the moment its cutoff passed would
 *  hide it on the day staff need it most. */
function isSailingNow(p: StaffPackage): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(p.start_date) <= today && parseLocalDate(p.end_date) >= today;
}

function PackagesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  // Active by default: a sailing that has been and gone, or was called off, is
  // history — not something staff should have to scroll past to reach the work.
  const [group, setGroup] = useState<PackageGroup>("active");
  const [statusFilter, setStatusFilter] = useState<PackageStatus | "">("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StaffPackage | null>(null);
  const [creating, setCreating] = useState(false);
  const [cancellingDeparture, setCancellingDeparture] = useState<StaffPackage | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff", "packages", page, group],
    queryFn: () => getStaffPackages(page, group),
  });

  function changeGroup(next: PackageGroup) {
    setGroup(next);
    // Page 3 of Active is rarely page 3 of Cancelled, and an out-of-range page
    // comes back empty — which reads as "nothing here" rather than "wrong page".
    setPage(1);
    // The status chips only exist under Active; leaving one set would silently
    // narrow the tab the staffer just opened.
    setStatusFilter("");
  }

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

  async function handleReport(pkg: StaffPackage, scope: "booked" | "all" = "booked") {
    try {
      const blob = await downloadGuideReport(pkg.id, scope);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guide-report-${pkg.start_date}${scope === "all" ? "-all-rooms" : ""}.pdf`;
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
      <PageHeader title="Packages" subtitle={data ? `${data.count} package(s)` : "Loading…"}>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-luxe"
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
        {/* Active is the work; Past and Cancelled are the record. Kept apart
            rather than mixed with a status filter, because "cancelled" and
            "finished" are different news and staff reach for them for
            different reasons. */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-muted/60 border border-border">
          {GROUPS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => changeGroup(value)}
              aria-pressed={group === value}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                group === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Only under Active: the other two tabs ARE a status. */}
        {group === "active" && (
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip active={statusFilter === ""} onClick={() => setStatusFilter("")}>
              All
            </FilterChip>
            {ACTIVE_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter((cur) => (cur === s ? "" : s))}
              >
                <span className="capitalize">{s}</span>
              </FilterChip>
            ))}
          </div>
        )}
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
            {filtersActive ? "No packages match these filters." : EMPTY_BY_GROUP[group]}
          </p>
          {/* Only Active offers the create shortcut: "create your first
              package" under the Cancelled tab would be nonsense. */}
          {!filtersActive && group === "active" && (
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
                    onToggle={() => toggleMutation.mutate({ id: p.id, open: !p.is_booking_open })}
                    onGenerateRooms={() => roomsMutation.mutate(p.id)}
                    onReport={(scope) => handleReport(p, scope)}
                    onCancelDeparture={() => setCancellingDeparture(p)}
                    onDelete={() => {
                      if (confirm("Delete this package? This cannot be undone."))
                        deleteMutation.mutate(p.id);
                    }}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30 font-medium">
                  <td className="px-4 py-3 whitespace-nowrap" colSpan={4}>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Total · {filtered.length} package(s)
                    </span>
                    {/* Said out loud when it matters: these add up the rows on
                        screen, not every package in the tab. A footer that
                        looks like a grand total but is not is worse than no
                        footer. */}
                    {totalPages > 1 && (
                      <span className="ml-2 text-[10px] text-muted-foreground normal-case">
                        (this page only)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 whitespace-nowrap">
                    {formatBDT(
                      String(filtered.reduce((s, p) => s + parseMoney(p.paid_total ?? "0"), 0)),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gold whitespace-nowrap">
                    {formatBDT(
                      String(filtered.reduce((s, p) => s + parseMoney(p.due_total ?? "0"), 0)),
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

      {(creating || editing) && (
        <PackageFormDialog
          pkg={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {cancellingDeparture && (
        <CancelDepartureDialog
          pkg={cancellingDeparture}
          onClose={() => setCancellingDeparture(null)}
          onDone={() => {
            setCancellingDeparture(null);
            queryClient.invalidateQueries({ queryKey: ["staff", "packages"] });
            queryClient.invalidateQueries({ queryKey: ["staff", "refund-summary"] });
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

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 eyebrow text-[9px] text-muted-foreground font-medium ${className}`}>
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
  onCancelDeparture,
  onDelete,
}: {
  pkg: StaffPackage;
  onEdit: () => void;
  onToggle: () => void;
  onGenerateRooms: () => void;
  onReport: (scope: "booked" | "all") => void;
  onCancelDeparture: () => void;
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
            <span className="inline-flex items-center gap-1" title={notBookableReason(p)}>
              <Ban className="size-3" /> {notBookableReason(p)}
            </span>
          )}
          {isSailingNow(p) && (
            <span className="inline-flex items-center gap-1 text-gold-text font-medium">
              <Ship className="size-3" /> Sailing now
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
          <GuideReportMenu
            onSelect={onReport}
            trigger={(open) => (
              <span
                title="Guide report (PDF)"
                className={`size-8 rounded-lg grid place-items-center transition-colors ${
                  open ? "text-gold bg-gold/10" : "text-ocean/60 hover:text-gold hover:bg-gold/10"
                }`}
              >
                <Download className="size-4" />
              </span>
            )}
          />
          {/* Weather, a technical fault, or the passenger minimum not met.
              Involuntary, so every booking is refunded in full — hence its own
              action with a preview, not a status change. */}
          <RowAction
            title="Cancel departure (refund everyone)"
            onClick={onCancelDeparture}
            icon={CloudOff}
            destructive
          />
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

/** The cutoff is a Bangladesh business rule ("noon the day before departure"),
 * so the editor is pinned to Asia/Dhaka — a fixed UTC+6 zone with no DST —
 * instead of the staff browser's timezone. Browser-local rendering showed a
 * Dhaka-noon cutoff as "01:00" to a traveling admin, and re-parsing during a
 * DST fall-back hour shifted the stored instant by an hour on an untouched
 * save. Both helpers share this constant so display and parse can't disagree. */
const DHAKA_UTC_OFFSET_MIN = 6 * 60;

/** ISO datetime → Dhaka wall time for <input type="datetime-local"> (no seconds). */
function toDhakaInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + DHAKA_UTC_OFFSET_MIN * 60000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}:${pad(d.getUTCMinutes())}`;
}

/** Inverse: datetime-local value (Dhaka wall time) → UTC ISO instant. */
function fromDhakaInput(value: string): string {
  // datetime-local yields "YYYY-MM-DDTHH:mm" (or with ":ss" in some browsers).
  const seconds = value.length === 16 ? ":00" : "";
  return new Date(`${value}${seconds}+06:00`).toISOString();
}

function PackageFormDialog({ pkg, onClose }: { pkg: StaffPackage | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  // The ship's starting fare, for a NEW package only. Editing an existing one
  // must never show a figure other than what it is actually priced at.
  const { data: ships } = useQuery({
    queryKey: ["staff", "ships"],
    queryFn: getStaffShips,
    enabled: !pkg,
  });
  const shipId = pkg?.ship ?? 1;
  const defaultFare = ships?.find((s) => s.id === shipId)?.default_adult_price ?? "";

  const [form, setForm] = useState<StaffPackageWrite>({
    ship: shipId,
    start_date: pkg?.start_date ?? "",
    end_date: pkg?.end_date ?? "",
    adult_price: pkg?.adult_price ?? "",
    status: pkg?.status ?? "draft",
    is_booking_open: pkg?.is_booking_open ?? true,
    booking_cutoff_datetime: pkg?.booking_cutoff_datetime ?? null,
    marketing_title: pkg?.marketing_title ?? "",
    marketing_description: pkg?.marketing_description ?? "",
    highlights: pkg?.highlights ?? [],
    offer_label: pkg?.offer_label ?? "",
    discount_type: pkg?.discount_type ?? "none",
    discount_value: pkg?.discount_value ?? "0.00",
    offer_ends_at: pkg?.offer_ends_at ?? null,
  });

  const set = (patch: Partial<StaffPackageWrite>) => setForm((f) => ({ ...f, ...patch }));

  // The ships query resolves after the form mounts, so the default is applied
  // here rather than in the initial state. Only ever into an EMPTY field: once
  // a figure is on screen it is either what the package costs or what the
  // staffer typed, and overwriting either would be worse than asking.
  useEffect(() => {
    if (pkg || !defaultFare) return;
    setForm((f) => (f.adult_price ? f : { ...f, adult_price: defaultFare }));
  }, [pkg, defaultFare]);

  // The picked file, and what to show for it. `heroPreview` is a blob URL for a
  // new pick, the saved URL for an existing package, and null once removed —
  // which is why removal is its own state and not just `heroFile === null`.
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(pkg?.hero_image ?? null);
  const [heroCleared, setHeroCleared] = useState(false);

  // A blob URL is a handle the browser holds until it is told otherwise, so
  // each one is released when it stops being the preview.
  useEffect(() => {
    if (!heroFile) return;
    const url = URL.createObjectURL(heroFile);
    setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroFile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Create first, then the picture: a new package has no id to attach it
      // to, and the upload is a separate multipart request either way.
      const saved = pkg ? await updateStaffPackage(pkg.id, form) : await createStaffPackage(form);
      if (heroFile) return uploadStaffPackageHero(saved.id, heroFile);
      if (heroCleared && pkg?.hero_image) return clearStaffPackageHero(saved.id);
      return saved;
    },
    onSuccess: () => {
      toast.success(pkg ? "Package updated." : "Package created.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onClose();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const canSubmit = form.start_date && form.end_date && form.adult_price;

  return (
    <DialogShell
      title={pkg ? `Edit — ${pkg.marketing_title || pkg.start_date}` : "New package"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StaffField label="Start date">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => set({ start_date: e.target.value })}
              className={staffInputClass}
            />
          </StaffField>
          <StaffField label="End date">
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => set({ end_date: e.target.value })}
              className={staffInputClass}
            />
          </StaffField>
          <StaffField label="Adult price (BDT)">
            <input
              type="number"
              min={0}
              value={form.adult_price}
              onChange={(e) => set({ adult_price: e.target.value })}
              className={staffInputClass}
            />
          </StaffField>
          <StaffField label="Status">
            <select
              value={form.status}
              onChange={(e) => set({ status: e.target.value as PackageStatus })}
              className={staffInputClass}
            >
              {PACKAGE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </StaffField>
        </div>

        {/* The foreign-national surcharge is NOT here: it is one global policy
            (Room Settings → Foreigner Surcharge), not a per-sailing price. */}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_booking_open}
            onChange={(e) => set({ is_booking_open: e.target.checked })}
            className="accent-gold"
          />
          Booking open (manual override)
        </label>

        <StaffField label="Booking cutoff — Bangladesh time (UTC+6)">
          <input
            type="datetime-local"
            value={toDhakaInput(form.booking_cutoff_datetime)}
            onChange={(e) =>
              set({
                booking_cutoff_datetime: e.target.value ? fromDhakaInput(e.target.value) : null,
              })
            }
            className={staffInputClass}
          />
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Bookings close at this time (Bangladesh clock, wherever you are). Leave blank to
            auto-set to noon the day before departure.
          </span>
        </StaffField>

        <StaffField label="Marketing title">
          <input
            value={form.marketing_title}
            onChange={(e) => set({ marketing_title: e.target.value })}
            placeholder="e.g. Sundarbans Explorer"
            className={staffInputClass}
          />
        </StaffField>
        <StaffField label="Marketing description">
          <textarea
            rows={3}
            value={form.marketing_description}
            onChange={(e) => set({ marketing_description: e.target.value })}
            className={`${staffInputClass} resize-none`}
          />
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

        {/* The offer. Setting the type to anything but "No offer" is what
            turns it on; the amount alone does nothing, and the server refuses
            an amount left behind with no type so a dormant discount cannot
            reappear later as one nobody chose. */}
        <StaffField label="Offer">
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.discount_type ?? "none"}
                onChange={(e) => {
                  const next = e.target.value as StaffPackageWrite["discount_type"];
                  // Clearing the type clears the amount with it, because the
                  // server rejects the pair otherwise — better to keep the form
                  // valid than to explain the error afterwards.
                  set(
                    next === "none"
                      ? { discount_type: next, discount_value: "0.00" }
                      : { discount_type: next },
                  );
                }}
                className={staffInputClass}
              >
                <option value="none">No offer</option>
                <option value="percent">Percentage off</option>
                <option value="fixed">Taka off, per cabin</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={(form.discount_type ?? "none") === "none"}
                value={form.discount_value ?? ""}
                onChange={(e) => set({ discount_value: e.target.value })}
                placeholder={form.discount_type === "percent" ? "e.g. 20" : "e.g. 1500"}
                className={`${staffInputClass} disabled:opacity-40`}
              />
            </div>
            {(form.discount_type ?? "none") !== "none" && (
              <>
                <input
                  value={form.offer_label ?? ""}
                  onChange={(e) => set({ offer_label: e.target.value })}
                  placeholder="Offer name, e.g. Eid Offer"
                  className={staffInputClass}
                />
                <label className="block">
                  <span className="text-[10px] text-muted-foreground">
                    Ends at (optional — leave blank to run until you remove it)
                  </span>
                  <input
                    type="datetime-local"
                    value={form.offer_ends_at ? form.offer_ends_at.slice(0, 16) : ""}
                    onChange={(e) => set({ offer_ends_at: e.target.value ? e.target.value : null })}
                    className={`${staffInputClass} mt-1`}
                  />
                </label>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {form.discount_type === "percent"
                    ? "Comes off the whole cabin — base price, adult fares and kid fares together."
                    : "Comes off each cabin, so a 3-cabin booking gets it three times."}{" "}
                  Bookings already paid for keep the price they were given; ending an offer never
                  re-prices anyone.
                </p>
              </>
            )}
          </div>
        </StaffField>

        {/* The picture the public package card shows. Sits with the marketing
            copy because that is what it is — the card's photograph, not an
            operational setting. */}
        <StaffField label="Cover photo">
          <div className="flex items-start gap-3">
            <div className="size-20 rounded-xl overflow-hidden bg-muted grid place-items-center shrink-0 border border-border">
              {heroPreview ? (
                <img src={heroPreview} alt="" className="size-full object-cover" />
              ) : (
                <PackageIcon className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs cursor-pointer hover:border-gold transition-colors">
                <Upload className="size-3.5 shrink-0" />
                {heroPreview ? "Choose a different photo" : "Choose a photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    setHeroFile(file);
                    setHeroCleared(false);
                    // Let the same file be picked again after a removal —
                    // without this the input holds the old value and fires no
                    // change event.
                    e.target.value = "";
                  }}
                />
              </label>
              {heroPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setHeroFile(null);
                    setHeroPreview(null);
                    setHeroCleared(true);
                  }}
                  className="block text-[11px] text-destructive hover:underline"
                >
                  Remove photo
                </button>
              )}
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Shown on the package card, the booking page and the home page. Landscape works best.
                Without one the card falls back to a stock photograph.
              </p>
            </div>
          </div>
        </StaffField>

        <button
          disabled={!canSubmit || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.15em] font-semibold shadow-luxe disabled:opacity-40"
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
