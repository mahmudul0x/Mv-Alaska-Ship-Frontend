import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Baby,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Gift,
  ImagePlus,
  Images,
  Info,
  Loader2,
  Plus,
  Save,
  Ticket,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { DialogShell, PageHeader, errorText, staffInputClass } from "@/components/staff/ui";
import {
  createStaffKidRule,
  deleteStaffKidRule,
  deleteStaffRoomImage,
  getStaffKidRules,
  getStaffRoomImages,
  getStaffRooms,
  getStaffRoomTypes,
  updateStaffKidRule,
  updateStaffRoomImage,
  updateStaffRoomType,
  uploadStaffRoomImage,
} from "@/lib/api/staff";
import { formatBDT } from "@/lib/money";
import type { StaffKidRule, StaffRoom, StaffRoomImage } from "@/lib/api/staffTypes";
import type { KidChargeType, RoomType } from "@/lib/api/types";

export const Route = createFileRoute("/staff/room-settings")({
  component: RoomSettingsPage,
});

const TABS = [
  { key: "room-types", label: "Room Types", hint: "Prices & pax limits", icon: BedDouble },
  { key: "kid-pricing", label: "Kid Pricing", hint: "Age-based fares", icon: Baby },
  { key: "room-photos", label: "Room Photos", hint: "Per-room gallery", icon: Images },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function RoomSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("room-types");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Room Settings"
        subtitle="Prices & pax limits — changes take effect immediately on every new booking."
      />

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map(({ key, label, hint, icon: Icon }) => {
          const active = key === activeTab;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`group flex items-center gap-2.5 px-4 py-3 -mb-px border-b-2 text-sm transition-colors ${
                active
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-gold" : "text-muted-foreground"}`} />
              <span>
                <span className="font-medium block leading-none">{label}</span>
                <span className="text-[10px] text-muted-foreground block mt-1">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "room-types" ? (
        <RoomTypesSection />
      ) : activeTab === "kid-pricing" ? (
        <KidPricingSection />
      ) : (
        <RoomPhotosSection />
      )}
    </div>
  );
}

/* ── Room types ───────────────────────────────────────────────────────────── */

function RoomTypesSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "room-types"],
    queryFn: getStaffRoomTypes,
  });
  const [savingId, setSavingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RoomType> }) => {
      setSavingId(id);
      return updateStaffRoomType(id, payload);
    },
    onSuccess: () => {
      toast.success("Room type updated.");
      queryClient.invalidateQueries({ queryKey: ["staff", "room-types"] });
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  return (
    <section className="space-y-4 pt-6">
      <p className="text-xs text-muted-foreground">
        Base price is charged once per room, on top of per-person fares. Pax limits are
        enforced by the booking API — the frontend cannot bypass them.
      </p>

      {isLoading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading room types…
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.map((rt) => (
            <RoomTypeCard
              key={rt.id}
              roomType={rt}
              saving={savingId === rt.id && mutation.isPending}
              onSave={(payload) => mutation.mutate({ id: rt.id, payload })}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RoomTypeCard({
  roomType,
  onSave,
  saving,
}: {
  roomType: RoomType;
  onSave: (payload: Partial<RoomType>) => void;
  saving: boolean;
}) {
  const [basePrice, setBasePrice] = useState(roomType.base_price);
  const [maxAdults, setMaxAdults] = useState(roomType.max_adults);
  const [maxKids, setMaxKids] = useState(roomType.max_kids);
  const dirty =
    basePrice !== roomType.base_price ||
    maxAdults !== roomType.max_adults ||
    maxKids !== roomType.max_kids;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-luxe ${
        dirty ? "border-gold/50 shadow-gold" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <BedDouble className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight truncate">{roomType.name}</div>
          <div className="text-[10px] text-muted-foreground">
            Sleeps up to {maxAdults} adult(s) + {maxKids} kid(s)
          </div>
        </div>
        {dirty && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/15 text-gold shrink-0">
            Unsaved
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            Base price per room
          </span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>
            <input
              type="number"
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className={`${staffInputClass} pl-8`}
            />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] mb-1.5 flex items-center gap-1">
              <Users className="size-3" /> Max adults
            </span>
            <input
              type="number"
              min={1}
              value={maxAdults}
              onChange={(e) => setMaxAdults(Number(e.target.value))}
              className={staffInputClass}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] mb-1.5 flex items-center gap-1">
              <Baby className="size-3" /> Max kids
            </span>
            <input
              type="number"
              min={0}
              value={maxKids}
              onChange={(e) => setMaxKids(Number(e.target.value))}
              className={staffInputClass}
            />
          </label>
        </div>

        {/* Capacity summary */}
        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">Base + capacity</span>
          <span className="font-medium">
            {formatBDT(basePrice || "0")} · up to {maxAdults + maxKids} pax
          </span>
        </div>

        <button
          disabled={!dirty || saving}
          onClick={() => onSave({ base_price: basePrice, max_adults: maxAdults, max_kids: maxKids })}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </div>
  );
}

/* ── Kid pricing ──────────────────────────────────────────────────────────── */

const CHARGE_META: Record<
  KidChargeType,
  { label: string; hint: string; icon: typeof Gift; badge: string }
> = {
  free: {
    label: "Free",
    hint: "No charge for this age range",
    icon: Gift,
    badge: "bg-emerald-500/10 text-emerald-700",
  },
  fixed: {
    label: "Fixed charge",
    hint: "Flat amount per kid in this age range",
    icon: Ticket,
    badge: "bg-gold/15 text-gold",
  },
  full_adult: {
    label: "Full adult fare",
    hint: "Charged the package's adult price",
    icon: UserRound,
    badge: "bg-ocean/10 text-ocean",
  },
};

function KidPricingSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["staff", "kid-rules"],
    queryFn: getStaffKidRules,
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["staff", "kid-rules"] });

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<StaffKidRule> }) => {
      setSavingId(id);
      return updateStaffKidRule(id, payload);
    },
    onSuccess: () => {
      toast.success("Kid pricing rule updated.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
    onSettled: () => setSavingId(null),
  });

  const createMutation = useMutation({
    mutationFn: createStaffKidRule,
    onSuccess: () => {
      toast.success("Kid pricing rule added.");
      setShowAdd(false);
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffKidRule,
    onSuccess: () => {
      toast.success("Kid pricing rule deleted.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <section className="space-y-4 pt-6">
      {isLoading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Loading kid pricing rules…
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">
            <Info className="size-4 text-gold shrink-0 mt-0.5" />
            <p>
              Age ranges are <strong className="text-foreground">min-inclusive, max-exclusive</strong>:
              a rule 3 → 8 covers kids aged 3, 4, … 7. To move the full-fare boundary from 8 to 9,
              set the fixed rule to 3 → 9 and the adult rule to 9 → 99 — no code change needed.
              Ranges must not overlap.
            </p>
          </div>

          {data && data.length > 0 && <AgeTimeline rules={data} />}

          <div className="flex items-center justify-between">
            <span className="eyebrow text-muted-foreground text-[10px]">
              {data?.length ?? 0} rule(s)
            </span>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold"
            >
              <Plus className="size-3.5" />
              Add rule
            </button>
          </div>

          {showAdd && (
            <AddKidRuleForm
              saving={createMutation.isPending}
              onCancel={() => setShowAdd(false)}
              onCreate={(payload) => createMutation.mutate(payload)}
            />
          )}

          {(!data || data.length === 0) && !showAdd && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No kid pricing rules yet. Bookings with children will fail until you add
              rules covering their ages. Click <strong>Add rule</strong> to start.
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.map((rule) => (
              <KidRuleCard
                key={rule.id}
                rule={rule}
                saving={savingId === rule.id && mutation.isPending}
                deleting={deleteMutation.isPending && deleteMutation.variables === rule.id}
                onSave={(payload) => mutation.mutate({ id: rule.id, payload })}
                onDelete={() => {
                  if (confirm("Delete this kid pricing rule?")) deleteMutation.mutate(rule.id);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Form to add a new kid pricing rule. Charge type drives whether an amount is
 * required (fixed only) — mirrors the backend serializer's validation. */
function AddKidRuleForm({
  onCreate,
  onCancel,
  saving,
}: {
  onCreate: (payload: Omit<StaffKidRule, "id">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(3);
  const [chargeType, setChargeType] = useState<KidChargeType>("free");
  const [amount, setAmount] = useState("");
  const isFixed = chargeType === "fixed";
  const valid = maxAge > minAge && (!isFixed || amount !== "");

  return (
    <div className="rounded-2xl border border-gold/50 bg-card shadow-gold p-5 space-y-4">
      <div className="font-display text-base">New kid pricing rule</div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            Age from (incl.)
          </span>
          <input
            type="number"
            min={0}
            value={minAge}
            onChange={(e) => setMinAge(Number(e.target.value))}
            className={staffInputClass}
          />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            Age to (excl.)
          </span>
          <input
            type="number"
            min={1}
            value={maxAge}
            onChange={(e) => setMaxAge(Number(e.target.value))}
            className={staffInputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
          Charge type
        </span>
        <select
          value={chargeType}
          onChange={(e) => setChargeType(e.target.value as KidChargeType)}
          className={staffInputClass}
        >
          <option value="free">Free — no charge</option>
          <option value="fixed">Fixed charge — flat amount per kid</option>
          <option value="full_adult">Full adult fare</option>
        </select>
      </label>

      {isFixed && (
        <label className="block">
          <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
            Charge per kid
          </span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${staffInputClass} pl-8`}
            />
          </div>
        </label>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold border border-border text-muted-foreground"
        >
          Cancel
        </button>
        <button
          disabled={!valid || saving}
          onClick={() =>
            onCreate({
              min_age: minAge,
              max_age: maxAge,
              charge_type: chargeType,
              amount: isFixed ? amount : null,
            })
          }
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Add rule
        </button>
      </div>
    </div>
  );
}

/* ── Room photos ──────────────────────────────────────────────────────────── */

function RoomPhotosSection() {
  const queryClient = useQueryClient();
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ["staff", "rooms"],
    queryFn: () => getStaffRooms(1),
  });
  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ["staff", "room-images"],
    queryFn: () => getStaffRoomImages(),
  });
  const [search, setSearch] = useState("");
  const [openRoomId, setOpenRoomId] = useState<number | null>(null);

  const byRoom = useMemo(() => {
    const map = new Map<number, StaffRoomImage[]>();
    for (const img of images ?? []) {
      const list = map.get(img.room);
      if (list) list.push(img);
      else map.set(img.room, [img]);
    }
    return map;
  }, [images]);

  const floors = useMemo(() => {
    const all = roomsData?.results ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q ? all.filter((r) => r.room_number.toLowerCase().includes(q)) : all;
    const grouped = new Map<number | null, StaffRoom[]>();
    for (const room of filtered) {
      const list = grouped.get(room.floor_number);
      if (list) list.push(room);
      else grouped.set(room.floor_number, [room]);
    }
    return [...grouped.entries()].sort(
      (a, b) => (a[0] === null ? 1 : 0) - (b[0] === null ? 1 : 0) || (a[0] ?? 0) - (b[0] ?? 0),
    );
  }, [roomsData, search]);

  const openRoom = (roomsData?.results ?? []).find((r) => r.id === openRoomId) ?? null;

  if (roomsLoading || imagesLoading) {
    return (
      <div className="p-16 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-gold" /> Loading room photos…
      </div>
    );
  }

  return (
    <section className="space-y-5 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find room number…"
          className={`${staffInputClass} max-w-xs`}
        />
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground max-w-md">
          <Info className="size-3.5 text-gold shrink-0 mt-0.5" />
          <p>
            Photos show on the customer room picker. Keep files under ~1 MB
            (hard limit 10 MB). Click a room to manage its gallery.
          </p>
        </div>
      </div>

      {floors.map(([floor, floorRooms]) => {
        const photoCount = floorRooms.reduce(
          (sum, r) => sum + (byRoom.get(r.id)?.length ?? 0),
          0,
        );
        return (
          <div key={floor ?? "none"} className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <span className="eyebrow text-muted-foreground text-[10px]">
                {floor === null ? "Unassigned floor" : `Floor ${floor}`}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {floorRooms.length} room(s) · {photoCount} photo(s)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {floorRooms.map((room) => (
                <RoomPhotoTile
                  key={room.id}
                  room={room}
                  images={byRoom.get(room.id) ?? []}
                  onOpen={() => setOpenRoomId(room.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {floors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No rooms match "{search}".
        </div>
      )}

      {openRoom && (
        <RoomGalleryDialog
          room={openRoom}
          images={byRoom.get(openRoom.id) ?? []}
          onClose={() => setOpenRoomId(null)}
          invalidate={() =>
            queryClient.invalidateQueries({ queryKey: ["staff", "room-images"] })
          }
        />
      )}
    </section>
  );
}

/** Compact grid tile: cover photo (or placeholder), room number, photo count.
 * All management happens in the dialog — the grid stays scannable. */
function RoomPhotoTile({
  room,
  images,
  onOpen,
}: {
  room: StaffRoom;
  images: StaffRoomImage[];
  onOpen: () => void;
}) {
  const cover = images[0];
  return (
    <button
      onClick={onOpen}
      className="group text-left rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-gold/50 hover:shadow-luxe focus:outline-none focus-visible:border-gold"
    >
      <div className="relative h-28 bg-ocean/5">
        {cover ? (
          <img
            src={cover.image_url}
            alt={`Room ${room.room_number}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full grid place-items-center text-ocean/25">
            <Images className="size-7" />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
            images.length
              ? "bg-black/55 text-white"
              : "bg-amber-100/95 text-amber-700"
          }`}
        >
          {images.length ? `${images.length} photo${images.length > 1 ? "s" : ""}` : "No photos"}
        </span>
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-ocean text-[10px] font-semibold uppercase tracking-[0.12em]">
            <ImagePlus className="size-3" /> Manage
          </span>
        </div>
      </div>
      <div className="px-3.5 py-2.5">
        <div className="font-display text-base leading-none">Room {room.room_number}</div>
        <div className="text-[10px] text-muted-foreground mt-1 truncate">
          {room.room_type_name}
        </div>
      </div>
    </button>
  );
}

/** Full gallery editor for one room, in a dialog: upload, reorder, caption, delete. */
function RoomGalleryDialog({
  room,
  images,
  onClose,
  invalidate,
}: {
  room: StaffRoom;
  images: StaffRoomImage[];
  onClose: () => void;
  invalidate: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploading(true);
      const nextOrder = images.length
        ? Math.max(...images.map((i) => i.sort_order)) + 1
        : 0;
      // Sequential, so sort_order stays deterministic and one failure
      // doesn't abort the files already uploaded.
      for (const [i, file] of files.entries()) {
        await uploadStaffRoomImage({ room: room.id, file, sort_order: nextOrder + i });
      }
      return files.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} photo(s) added to room ${room.room_number}.`);
      invalidate();
    },
    onError: (err) => {
      toast.error(errorText(err));
      invalidate(); // some files may have landed before the failure
    },
    onSettled: () => setUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffRoomImage,
    onSuccess: () => {
      toast.success("Photo deleted.");
      invalidate();
    },
    onError: (err) => toast.error(errorText(err)),
  });

  const captionMutation = useMutation({
    mutationFn: ({ id, caption }: { id: number; caption: string }) =>
      updateStaffRoomImage(id, { caption }),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  const moveMutation = useMutation({
    // Reassign sequential sort_orders with `index` and its neighbour swapped —
    // robust even when existing sort_orders are all 0 or have gaps.
    mutationFn: async ({ index, dir }: { index: number; dir: -1 | 1 }) => {
      const order = [...images];
      const target = index + dir;
      [order[index], order[target]] = [order[target], order[index]];
      await Promise.all(
        order
          .map((img, i) => (img.sort_order === i ? null : updateStaffRoomImage(img.id, { sort_order: i })))
          .filter(Boolean),
      );
    },
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(errorText(err)),
  });

  return (
    <DialogShell
      wide
      title={`Room ${room.room_number} — Photos`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {room.room_type_name}
            {room.floor_number ? ` · Floor ${room.floor_number}` : ""} ·{" "}
            {images.length} photo(s) — lower order shows first on the customer site.
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) uploadMutation.mutate(files);
              e.target.value = ""; // allow re-selecting the same file
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-40"
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ImagePlus className="size-3.5" />
            )}
            Add photos
          </button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <figure key={img.id} className="space-y-1.5">
                <div className="relative group rounded-xl overflow-hidden border border-border">
                  <img
                    src={img.image_url}
                    alt={img.caption || `Room ${room.room_number} photo`}
                    className="h-32 w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 left-1.5 size-5 grid place-items-center rounded-full bg-black/55 text-white text-[9px] font-semibold">
                    {index + 1}
                  </span>
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      title="Show earlier"
                      disabled={index === 0 || moveMutation.isPending}
                      onClick={() => moveMutation.mutate({ index, dir: -1 })}
                      className="size-7 grid place-items-center rounded-lg bg-white/90 text-ocean disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      title="Show later"
                      disabled={index === images.length - 1 || moveMutation.isPending}
                      onClick={() => moveMutation.mutate({ index, dir: 1 })}
                      className="size-7 grid place-items-center rounded-lg bg-white/90 text-ocean disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <button
                      title="Delete photo"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm("Delete this photo?")) deleteMutation.mutate(img.id);
                      }}
                      className="size-7 grid place-items-center rounded-lg bg-white/90 text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <CaptionInput
                  key={`${img.id}-${img.caption}`}
                  initial={img.caption}
                  onSave={(caption) => captionMutation.mutate({ id: img.id, caption })}
                />
              </figure>
            ))}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-border hover:border-gold/50 transition-colors p-10 text-center text-sm text-muted-foreground"
          >
            <Images className="size-8 mx-auto mb-2 text-ocean/25" />
            No photos yet — customers see this room without a gallery.
            <span className="block mt-1 text-xs text-gold font-medium">
              Click to upload the first photo
            </span>
          </button>
        )}
      </div>
    </DialogShell>
  );
}

/** Uncontrolled-ish caption field: saves on blur/Enter only when changed. */
function CaptionInput({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (caption: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const commit = () => {
    if (value.trim() !== initial) onSave(value.trim());
  };
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      placeholder="Caption (optional)"
      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-gold"
    />
  );
}

/** Solid segment color per charge type — mirrors CHARGE_META badges. */
const CHARGE_BAR: Record<KidChargeType, string> = {
  free: "bg-emerald-500",
  fixed: "bg-gold",
  full_adult: "bg-ocean",
};

/** Visual timeline of how the kid-pricing rules tile across ages 0→AXIS_MAX.
 * Surfaces gaps and overlaps that are hard to see as three number pairs. */
function AgeTimeline({ rules }: { rules: StaffKidRule[] }) {
  const AXIS_MAX = 18;
  const ordered = useMemo(
    () => [...rules].sort((a, b) => a.min_age - b.min_age),
    [rules],
  );

  // Detect coverage gaps between consecutive (sorted) rules within the axis.
  const gaps = useMemo(() => {
    const out: { from: number; to: number }[] = [];
    let cursor = 0;
    for (const r of ordered) {
      if (r.min_age > cursor) out.push({ from: cursor, to: Math.min(r.min_age, AXIS_MAX) });
      cursor = Math.max(cursor, r.max_age);
    }
    return out;
  }, [ordered]);

  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / AXIS_MAX) * 100))}%`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-muted-foreground text-[10px]">Age coverage</span>
        {gaps.length > 0 ? (
          <span className="text-[10px] font-semibold text-destructive">
            {gaps.length} gap(s) — some ages have no rule
          </span>
        ) : (
          <span className="text-[10px] font-medium text-emerald-600">Fully covered 0–{AXIS_MAX}</span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-9 rounded-lg bg-muted/60 overflow-hidden">
        {gaps.map((g, i) => (
          <div
            key={`gap-${i}`}
            className="absolute inset-y-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-destructive)_5px,var(--color-destructive)_6px)] opacity-30"
            style={{ left: pct(g.from), width: pct(g.to - g.from) }}
            title={`No rule for ages ${g.from}–${g.to}`}
          />
        ))}
        {ordered.map((r) => {
          const left = pct(r.min_age);
          const width = pct(Math.min(r.max_age, AXIS_MAX) - r.min_age);
          return (
            <div
              key={r.id}
              className={`absolute inset-y-1 rounded-md ${CHARGE_BAR[r.charge_type]} grid place-items-center text-[9px] font-semibold text-white/95 overflow-hidden`}
              style={{ left, width }}
              title={`${CHARGE_META[r.charge_type].label}: ${r.min_age}–${r.max_age}`}
            >
              {r.min_age}–{r.max_age}
            </div>
          );
        })}
      </div>

      {/* Axis ticks */}
      <div className="relative h-4 mt-1">
        {[0, 3, 6, 9, 12, 15, 18].map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 text-[9px] text-muted-foreground"
            style={{ left: pct(t) }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        {(Object.keys(CHARGE_BAR) as KidChargeType[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${CHARGE_BAR[k]}`} />
            {CHARGE_META[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function KidRuleCard({
  rule,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  rule: StaffKidRule;
  onSave: (payload: Partial<StaffKidRule>) => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const [minAge, setMinAge] = useState(rule.min_age);
  const [maxAge, setMaxAge] = useState(rule.max_age);
  const [amount, setAmount] = useState(rule.amount ?? "");
  const dirty =
    minAge !== rule.min_age || maxAge !== rule.max_age || (rule.amount ?? "") !== amount;
  const meta = CHARGE_META[rule.charge_type];
  const isFixed = rule.charge_type === "fixed";
  const MetaIcon = meta.icon;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-luxe ${
        dirty ? "border-gold/50 shadow-gold" : "border-border"
      }`}
    >
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center shrink-0">
          <MetaIcon className="size-4.5 text-ocean" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base leading-tight">{meta.label}</div>
          <div className="text-[10px] text-muted-foreground">{meta.hint}</div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${meta.badge}`}>
          {minAge}–{maxAge} yrs
        </span>
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Delete rule"
          className="size-7 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              Age from (incl.)
            </span>
            <input
              type="number"
              min={0}
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className={staffInputClass}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              Age to (excl.)
            </span>
            <input
              type="number"
              min={1}
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className={staffInputClass}
            />
          </label>
        </div>

        {isFixed && (
          <label className="block">
            <span className="eyebrow text-muted-foreground text-[10px] block mb-1.5">
              Charge per kid
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${staffInputClass} pl-8`}
              />
            </div>
          </label>
        )}

        <button
          disabled={!dirty || saving}
          onClick={() =>
            onSave({ min_age: minAge, max_age: maxAge, ...(isFixed ? { amount: String(amount) } : {}) })
          }
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold gradient-gold text-ocean shadow-gold disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {dirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </div>
  );
}
