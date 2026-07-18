import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BedDouble,
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  FileDown,
  Layers,
  Loader2,
  Lock,
  LockOpen,
  Phone,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import { DialogShell, Info, PageHeader, StatCard } from "@/components/staff/ui";
import { GuideReportMenu } from "@/components/staff/GuideReportMenu";
import {
  blockPackageRoom,
  createStaffPayment,
  downloadGuideReport,
  getStaffPackageRooms,
  getStaffPackages,
  getStaffRooms,
  unblockPackageRoom,
} from "@/lib/api/staff";
import { formatBDT, parseMoney } from "@/lib/money";
import type { StaffPackage, StaffPackageRoom } from "@/lib/api/staffTypes";

export const Route = createFileRoute("/staff/rooms")({
  component: RoomsPage,
});

const INVENTORY = "inventory" as const;

type RoomFilter = "all" | "available" | "booked" | "blocked" | "due";

function RoomsPage() {
  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ["staff", "packages", 1],
    queryFn: () => getStaffPackages(1),
  });

  const packages = packagesData?.results ?? [];
  // Default to the first bookable (upcoming/open) package, else the latest.
  const defaultId = packages.find((p) => p.is_bookable)?.id ?? packages[0]?.id;
  const [selected, setSelected] = useState<number | typeof INVENTORY | null>(null);
  const activeSelection = selected ?? defaultId ?? INVENTORY;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Rooms"
        subtitle="Live room map — see which rooms are booked or free per package."
      >
        <label className="block min-w-64">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">Viewing</span>
          <select
            value={String(activeSelection)}
            onChange={(e) =>
              setSelected(e.target.value === INVENTORY ? INVENTORY : Number(e.target.value))
            }
            className="w-full bg-card border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
          >
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {packageLabel(p)}
              </option>
            ))}
            <option value={INVENTORY}>Ship inventory — all rooms</option>
          </select>
        </label>
      </PageHeader>

      {packagesLoading ? (
        <Loading label="Loading packages…" />
      ) : activeSelection === INVENTORY ? (
        <InventoryView />
      ) : (
        <PackageRoomMap
          pkg={packages.find((p) => p.id === activeSelection)}
          packageId={activeSelection}
        />
      )}
    </div>
  );
}

function packageLabel(p: StaffPackage) {
  const title = p.marketing_title || `${p.ship_name} sailing`;
  return `${title} · ${p.start_date}`;
}

function Loading({ label }: { label: string }) {
  return (
    <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-5 animate-spin text-gold" /> {label}
    </div>
  );
}

/* ── Package room map ────────────────────────────────────────────────────── */

function PackageRoomMap({ pkg, packageId }: { pkg: StaffPackage | undefined; packageId: number }) {
  const queryClient = useQueryClient();
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["staff", "package-rooms", packageId],
    queryFn: () => getStaffPackageRooms(packageId),
  });
  const [inspecting, setInspecting] = useState<StaffPackageRoom | null>(null);
  const [managing, setManaging] = useState<StaffPackageRoom | null>(null);
  const [filter, setFilter] = useState<RoomFilter>("all");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Rooms can only be held/released while the sailing is live — a cancelled or
  // completed package is read-only (mirrors the backend guard).
  const canManageBlocks = pkg?.status !== "cancelled" && pkg?.status !== "completed";

  const blockMutation = useMutation({
    mutationFn: ({ roomId, reason }: { roomId: number; reason: string }) =>
      blockPackageRoom(packageId, roomId, reason),
    onSuccess: () => {
      toast.success("Room blocked — hidden from customers.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setManaging(null);
    },
    onError: (err: unknown) => toast.error(blockError(err)),
  });

  const unblockMutation = useMutation({
    mutationFn: (roomId: number) => unblockPackageRoom(packageId, roomId),
    onSuccess: () => {
      toast.success("Room released — back on sale.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setManaging(null);
    },
    onError: () => toast.error("Could not release the room."),
  });

  const stats = useMemo(() => {
    const total = rooms?.length ?? 0;
    const booked = rooms?.filter((r) => r.availability === "booked").length ?? 0;
    const available = rooms?.filter((r) => r.availability === "available").length ?? 0;
    const blocked = rooms?.filter((r) => r.availability === "blocked").length ?? 0;
    const unavailable = total - booked - available - blocked;
    const dueTotal =
      rooms?.reduce((sum, r) => sum + (r.booking ? parseMoney(r.booking.due_amount) : 0), 0) ?? 0;
    return { total, booked, available, blocked, unavailable, dueTotal };
  }, [rooms]);

  // A room "matches" the active search + status filter. Non-matching rooms are
  // dimmed rather than removed, so the physical layout stays intact.
  function matches(room: StaffPackageRoom): boolean {
    if (filter === "available" && room.availability !== "available") return false;
    if (filter === "booked" && room.availability !== "booked") return false;
    if (filter === "blocked" && room.availability !== "blocked") return false;
    if (filter === "due" && !(room.booking && parseMoney(room.booking.due_amount) > 0))
      return false;
    if (search) {
      const q = search.toLowerCase();
      const hay =
        `${room.room_number} ${room.booking?.customer_name ?? ""} ${room.block_reason ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  const floors = useMemo(() => groupByFloor(rooms ?? []), [rooms]);

  async function handleExport(scope: "booked" | "all" = "booked") {
    setExporting(true);
    try {
      const blob = await downloadGuideReport(packageId, scope);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `room-manifest-${pkg?.start_date ?? packageId}${
        scope === "all" ? "-all-rooms" : ""
      }.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not generate the room manifest.");
    } finally {
      setExporting(false);
    }
  }

  if (isLoading) return <Loading label="Loading room map…" />;

  if (!rooms || rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-3">
        <BedDouble className="size-8 mx-auto text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No rooms are attached to this package yet.</p>
        <Link to="/staff/packages" className="inline-block text-xs text-gold hover:underline">
          Go to Packages and use “Generate rooms” →
        </Link>
      </div>
    );
  }

  const occupancy = stats.total ? Math.round((stats.booked / stats.total) * 100) : 0;
  const matchCount = rooms.filter(matches).length;

  return (
    <div className="space-y-6">
      {/* Stat cards (shared) */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total rooms" value={String(stats.total)} icon={Layers} />
        <StatCard
          label="Booked"
          value={String(stats.booked)}
          icon={DoorClosed}
          hint={stats.dueTotal > 0 ? `${formatBDT(String(stats.dueTotal))} due` : "All dues clear"}
        />
        <StatCard
          label="Available"
          value={String(stats.available)}
          icon={DoorOpen}
          tone="emerald"
          hint={
            stats.blocked > 0
              ? `${stats.blocked} blocked by admin`
              : stats.unavailable > 0
                ? `${stats.unavailable} unavailable`
                : undefined
          }
        />
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-muted-foreground text-[10px]">Occupancy</span>
            <span className="font-display text-lg text-gold">{occupancy}%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-gold transition-all"
              style={{ width: `${occupancy}%` }}
            />
          </div>
          {pkg && (
            <div className="text-[10px] text-muted-foreground mt-2">
              {pkg.start_date} → {pkg.end_date} ·{" "}
              {pkg.is_bookable ? "booking open" : "booking closed"}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar: search · filters · export */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find room / guest…"
            className="w-56 bg-card border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              ["all", "All"],
              ["available", "Available"],
              ["booked", "Booked"],
              ["blocked", "Blocked"],
              ["due", "Due only"],
            ] as [RoomFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === key
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {(filter !== "all" || search) && (
          <span className="text-xs text-muted-foreground">{matchCount} match(es)</span>
        )}
        <div className="ml-auto">
          <GuideReportMenu
            onSelect={handleExport}
            trigger={() => (
              <span
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-medium text-ocean hover:border-gold hover:text-gold transition-colors data-disabled:opacity-50"
                data-disabled={exporting || undefined}
              >
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Export manifest (PDF)
              </span>
            )}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
        <LegendDot className="bg-emerald-500" label="Available" />
        <LegendDot className="bg-gold" label="Booked" />
        <LegendDot className="bg-indigo-500" label="Blocked by admin" />
        <LegendDot className="bg-muted-foreground/40" label="Unavailable" />
      </div>

      {/* Floor sections */}
      {floors.map(({ floor, items }) => {
        const bookedOnFloor = items.filter((r) => r.availability === "booked").length;
        const floorPct = items.length ? Math.round((bookedOnFloor / items.length) * 100) : 0;
        return (
          <section
            key={floor ?? "other"}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-4">
              <div className="font-display text-base shrink-0">
                {floor === null ? "Unassigned floor" : `Floor ${floor}`}
              </div>
              <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                <div className="h-1.5 w-28 rounded-full bg-muted overflow-hidden hidden sm:block">
                  <div className="h-full rounded-full bg-ocean" style={{ width: `${floorPct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {bookedOnFloor}/{items.length} booked
                </span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  dimmed={!matches(room)}
                  onInspect={() => setInspecting(room)}
                  onManage={canManageBlocks ? () => setManaging(room) : undefined}
                />
              ))}
            </div>
          </section>
        );
      })}

      {inspecting?.booking && (
        <BookingDialog room={inspecting} onClose={() => setInspecting(null)} />
      )}

      {managing && (
        <ManageRoomDialog
          room={managing}
          onClose={() => setManaging(null)}
          onBlock={(reason) => blockMutation.mutate({ roomId: managing.room_id, reason })}
          onUnblock={() => unblockMutation.mutate(managing.room_id)}
          isBusy={blockMutation.isPending || unblockMutation.isPending}
        />
      )}
    </div>
  );
}

/** Turn a block-room 400 (e.g. booked room, dead package) into a readable
 *  toast, falling back to a generic message. */
function blockError(err: unknown): string {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (data) {
    const first = data.room_id ?? data.detail ?? Object.values(data)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === "string") return first;
  }
  return "Could not block the room.";
}

function groupByFloor(rooms: StaffPackageRoom[]) {
  const map = new Map<number | null, StaffPackageRoom[]>();
  for (const room of rooms) {
    const key = room.floor_number;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(room);
  }
  // Numbered floors first (ascending), unassigned last.
  return [...map.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a - b))
    .map(([floor, items]) => ({ floor, items }));
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function RoomCard({
  room,
  onInspect,
  onManage,
  dimmed = false,
}: {
  room: StaffPackageRoom;
  onInspect: () => void;
  /** Open the block/unblock dialog — only for available/blocked rooms while
   *  the package is live. Undefined = read-only (no click). */
  onManage?: () => void;
  dimmed?: boolean;
}) {
  const booked = room.availability === "booked";
  const blocked = room.availability === "blocked";
  const unavailable = room.availability === "unavailable";
  const available = room.availability === "available";
  const due = room.booking ? parseMoney(room.booking.due_amount) : 0;

  const base =
    "rounded-xl border p-3.5 text-left transition-all w-full h-full flex flex-col gap-2 hover:-translate-y-0.5";
  const look = booked
    ? "border-gold/50 bg-gold/8 hover:border-gold hover:shadow-luxe cursor-pointer"
    : blocked
      ? "border-indigo-500/40 bg-indigo-500/8 hover:border-indigo-500"
      : unavailable
        ? "border-dashed border-border bg-muted/30 opacity-70"
        : "border-emerald-500/30 bg-emerald-500/4 hover:border-emerald-500/60";

  const dot = booked
    ? "bg-gold"
    : blocked
      ? "bg-indigo-500"
      : unavailable
        ? "bg-muted-foreground/40"
        : "bg-emerald-500";

  const card = (
    <div className={`${base} ${look} ${dimmed ? "opacity-25 saturate-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-lg leading-none">{room.room_number}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{room.room_type.name}</div>
        </div>
        <span className={`size-2.5 rounded-full mt-1 shrink-0 ${dot}`} />
      </div>

      {booked && room.booking ? (
        <div className="mt-auto space-y-1">
          <div className="text-xs font-medium truncate">{room.booking.customer_name}</div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Users className="size-3" /> {room.booking.total_pax} pax
            </span>
            {due > 0 ? (
              <span className="font-semibold text-destructive">
                Due {formatBDT(room.booking.due_amount)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="size-3" /> Paid
              </span>
            )}
          </div>
        </div>
      ) : blocked ? (
        <div className="mt-auto space-y-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-500">
            <Lock className="size-3" /> Blocked by admin
          </span>
          {room.block_reason && (
            <div className="text-[10px] text-muted-foreground truncate">{room.block_reason}</div>
          )}
        </div>
      ) : (
        <div className="mt-auto text-[10px] font-medium">
          {unavailable ? (
            <span className="text-muted-foreground">Unavailable</span>
          ) : (
            <span className="text-emerald-600">Available</span>
          )}
        </div>
      )}
    </div>
  );

  // Booked → inspect booking. Available/blocked → manage (block/unblock) when
  // allowed. Unavailable and read-only cards are plain.
  if (booked) {
    return (
      <button onClick={onInspect} className="text-left">
        {card}
      </button>
    );
  }
  if (onManage && (available || blocked)) {
    return (
      <button onClick={onManage} className="text-left">
        {card}
      </button>
    );
  }
  return card;
}

/** Block an available room (with an optional internal reason) or release a
 *  blocked one. Booked/unavailable rooms never reach here. */
function ManageRoomDialog({
  room,
  onClose,
  onBlock,
  onUnblock,
  isBusy,
}: {
  room: StaffPackageRoom;
  onClose: () => void;
  onBlock: (reason: string) => void;
  onUnblock: () => void;
  isBusy: boolean;
}) {
  const blocked = room.availability === "blocked";
  const [reason, setReason] = useState("");

  return (
    <DialogShell
      title={`Room ${room.room_number} — ${blocked ? "release hold" : "block room"}`}
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Info label="Room type" value={room.room_type.name} />
          <Info
            label="Floor"
            value={room.floor_number === null ? "—" : String(room.floor_number)}
          />
        </div>

        {blocked ? (
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/5 p-4 space-y-2">
            <div className="eyebrow text-indigo-500 text-[10px] flex items-center gap-1.5">
              <Lock className="size-3.5" /> Currently blocked by admin
            </div>
            {room.block_reason && <p className="text-sm text-foreground">{room.block_reason}</p>}
            <p className="text-[11px] text-muted-foreground">
              {room.blocked_by_username ? `Held by ${room.blocked_by_username}` : "Held"}
              {room.blocked_at ? ` · ${new Date(room.blocked_at).toLocaleString()}` : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Releasing puts this room back on sale — customers will be able to book it again.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Blocking hides this room from customers (it shows as taken on the booking page,
              exactly like a booked room) without removing it from the sailing. You can release it
              again at any time. The reason is internal — customers never see it.
            </p>
            <label className="block">
              <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
                Reason (optional)
              </span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
                placeholder="e.g. crew cabin, maintenance, VIP hold"
                className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-gold"
              />
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-border text-xs text-muted-foreground hover:border-gold hover:text-gold transition-colors"
          >
            Cancel
          </button>
          {blocked ? (
            <button
              disabled={isBusy}
              onClick={onUnblock}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full gradient-gold text-ocean text-xs font-semibold disabled:opacity-40"
            >
              <LockOpen className="size-3.5" />
              {isBusy ? "Releasing…" : "Release room"}
            </button>
          ) : (
            <button
              disabled={isBusy}
              onClick={() => onBlock(reason)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40"
            >
              <Lock className="size-3.5" />
              {isBusy ? "Blocking…" : "Block room"}
            </button>
          )}
        </div>
      </div>
    </DialogShell>
  );
}

function BookingDialog({ room, onClose }: { room: StaffPackageRoom; onClose: () => void }) {
  const booking = room.booking!;
  const kids = booking.kid_details?.length ?? 0;
  const due = parseMoney(booking.due_amount);

  const queryClient = useQueryClient();
  const [payAmount, setPayAmount] = useState("");

  const payMutation = useMutation({
    mutationFn: () =>
      createStaffPayment({
        booking: booking.id,
        amount: payAmount,
        payment_type: "partial",
        gateway: "cash",
      }),
    onSuccess: () => {
      toast.success("Payment recorded — invoice email sent.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onClose();
    },
    onError: () => toast.error("Could not record the payment."),
  });

  return (
    <DialogShell title={`Room ${room.room_number} — ${booking.booking_code}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Info label="Customer" value={booking.customer_name} />
          <Info label="Status" value={booking.status} />
          <Info label="Phone" value={booking.phone} />
          <Info
            label="Guests in this room"
            value={
              `${booking.adult_count} adult(s)${kids ? ` · ${kids} kid(s)` : ""}` +
              (booking.total_pax > booking.room_pax
                ? ` · booking total ${booking.total_pax} pax`
                : "")
            }
          />
          <Info label="Room type" value={room.room_type.name} />
          <Info
            label="Floor"
            value={room.floor_number === null ? "—" : String(room.floor_number)}
          />
        </div>

        <div className="rounded-xl border border-border divide-y divide-border text-sm">
          <AmountRow label="Total" value={formatBDT(booking.total_amount)} />
          <AmountRow label="Paid" value={formatBDT(booking.paid_amount)} />
          <AmountRow label="Due" value={formatBDT(booking.due_amount)} highlight={due > 0} />
        </div>

        {/* Quick collect-due */}
        {due > 0 && booking.status !== "cancelled" && (
          <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
            <div className="eyebrow text-gold text-[10px] mb-3 flex items-center gap-1.5">
              <Wallet className="size-3.5" /> Collect cash payment (due{" "}
              {formatBDT(booking.due_amount)})
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={due}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 bg-background border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-gold"
              />
              <button
                onClick={() => setPayAmount(booking.due_amount)}
                className="px-3 rounded-xl border border-border text-xs text-muted-foreground hover:border-gold hover:text-gold transition-colors"
              >
                Full
              </button>
              <button
                disabled={!payAmount || payMutation.isPending}
                onClick={() => payMutation.mutate()}
                className="px-5 py-2 rounded-full gradient-gold text-ocean text-xs font-semibold disabled:opacity-40"
              >
                {payMutation.isPending ? "Saving…" : "Record"}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <a
            href={`tel:${booking.phone}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold"
          >
            <Phone className="size-3.5" /> {booking.phone}
          </a>
          <Link to="/staff/bookings" className="text-xs font-semibold text-gold hover:underline">
            Manage in Bookings →
          </Link>
        </div>
      </div>
    </DialogShell>
  );
}

function AmountRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-medium ${highlight ? "text-destructive" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Ship inventory (no package context) ─────────────────────────────────── */

function InventoryView() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "rooms"],
    queryFn: () => getStaffRooms(1),
  });

  const floors = useMemo(() => {
    const map = new Map<number | null, NonNullable<typeof data>["results"]>();
    for (const room of data?.results ?? []) {
      const key = room.floor_number;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(room);
    }
    return [...map.entries()].sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a - b));
  }, [data]);

  if (isLoading) return <Loading label="Loading rooms…" />;

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Physical rooms on the ship ({data?.count ?? 0}). Select a package above to see live booking
        status.
      </p>
      {floors.map(([floor, items]) => (
        <section
          key={floor ?? "other"}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-border font-display text-base">
            {floor === null ? "Unassigned floor" : `Floor ${floor}`}
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((room) => (
              <div key={room.id} className="rounded-xl border border-border p-3.5">
                <div className="font-display text-lg leading-none">{room.room_number}</div>
                <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <BedDouble className="size-3" /> {room.room_type_name}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
