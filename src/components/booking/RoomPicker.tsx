import { useId, useState } from "react";

import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  ArrowUpDown,
  BedDouble,
  Check,
  Compass,
  ConciergeBell,
  Crown,
  Users,
  Waves,
} from "lucide-react";

import { usePackageRooms } from "@/hooks/queries/usePackageRooms";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatBDT } from "@/lib/money";
import type { PackageRoom, RoomAvailability } from "@/lib/api/types";

type Props = {
  packageId: number | undefined;
  selectedRoomId?: number;
  onSelectRoom: (room: PackageRoom) => void;
};

const AVAILABILITY_LABEL: Record<RoomAvailability, string> = {
  available: "Available",
  booked: "Booked",
  unavailable: "Unavailable",
};

/* ── Deck-plan data ─────────────────────────────────────────────────────────
 * Presentational layout only (docs/Alaska Room Layout for corporate.pdf),
 * drawn top-down like the ship's architecture. On md+ screens the ship lies
 * horizontally (stern left, bow right); on mobile the same deck is drawn
 * vertically (bow top, stern bottom) so it fits the viewport without
 * horizontal scrolling.
 * Rooms are matched by room_number against the API data; any ship/room
 * without a plan below falls back to an auto-generated deck, so new ships
 * render without code changes.
 */

type PlanCell =
  | { kind: "room"; number: string }
  | { kind: "feature"; label: string; icon: LucideIcon; span?: number };

type DeckPlan = {
  floor: number;
  name: string;
  /** Aft common area drawn across the stern (pool / reception). */
  aft?: { label: string; icon: LucideIcon; variant: "pool" | "lounge" };
  /** Port cabin row/column, listed aft → bow. */
  port: PlanCell[];
  /** Starboard cabin row/column, listed aft → bow. */
  starboard: PlanCell[];
};

const room = (number: string): PlanCell => ({ kind: "room", number });
const feature = (label: string, icon: LucideIcon, span?: number): PlanCell => ({
  kind: "feature",
  label,
  icon,
  span,
});

const SHIP_DECK_PLANS: DeckPlan[] = [
  {
    floor: 2,
    name: "Upper Deck",
    aft: { label: "Swimming Pool", icon: Waves, variant: "pool" },
    port: [
      room("309"),
      room("310"),
      room("311"),
      room("312"),
      room("313"),
      room("314"),
      feature("Mini Lounge", Armchair),
      feature("Owners Suite", Crown, 2),
    ],
    starboard: [
      room("301"),
      room("302"),
      room("303"),
      room("304"),
      room("305"),
      room("306"),
      feature("Stair", ArrowUpDown),
      room("307"),
      room("308"),
    ],
  },
  {
    floor: 1,
    name: "Main Deck",
    aft: { label: "Reception & Main Lounge", icon: ConciergeBell, variant: "lounge" },
    port: [
      room("209"),
      room("210"),
      room("211"),
      room("212"),
      room("213"),
      room("214"),
      room("215"),
      room("216"),
      room("217"),
    ],
    starboard: [
      room("201"),
      room("202"),
      room("203"),
      room("204"),
      room("205"),
      room("206"),
      feature("Stair", ArrowUpDown),
      room("207"),
      room("208"),
    ],
  },
];

/* One grid unit of the plan, in px. */
const ROW_H = 64;
const ROW_GAP = 6;
/* Narrowest a cabin tile may get before the deck scrolls instead. Sized to fit
 * a 3-digit room number plus the capacity/price line, and to clear the 44px
 * minimum touch target. */
const MIN_CELL_W = 64;
const cellSize = (span = 1) => span * ROW_H + (span - 1) * ROW_GAP;

/* Wooden deck planking — seams run along the ship's axis. */
const woodDeck = (orientation: "h" | "v") =>
  `repeating-linear-gradient(${orientation === "h" ? "0deg" : "90deg"}, rgba(92,58,26,0.10) 0px, rgba(92,58,26,0.10) 1.5px, transparent 1.5px, transparent 12px), linear-gradient(${orientation === "h" ? "180deg" : "90deg"}, #d4aa79 0%, #c3945f 50%, #b5854f 100%)`;

const rowUnits = (cells: PlanCell[]) =>
  cells.reduce((n, c) => n + (c.kind === "feature" ? (c.span ?? 1) : 1), 0);

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

/** Auto-generate a two-row deck for floors that have no drawn plan. */
function autoDeckPlan(floor: number | null, floorRooms: PackageRoom[]): DeckPlan {
  const sorted = [...floorRooms].sort((a, b) =>
    a.room_number.localeCompare(b.room_number, undefined, { numeric: true }),
  );
  const half = Math.ceil(sorted.length / 2);
  return {
    floor: floor ?? 0,
    name: floor !== null ? `Deck ${floor}` : "Deck",
    starboard: sorted.slice(0, half).map((r) => room(r.room_number)),
    port: sorted.slice(half).map((r) => room(r.room_number)),
  };
}

/* ── Skeleton: hull outlines while rooms load ──
 *
 * Heights mirror what the real deck will occupy, so the page doesn't lurch when
 * rooms arrive. The mobile hull in particular is ~920px tall (a 9-cell column
 * plus bow, aft block and stern label) — the old 560px placeholder shifted the
 * layout ~360px on load. */
const MOBILE_DECK_H =
  112 + // bow padding (pt-28)
  9 * ROW_H +
  8 * ROW_GAP + // tallest cabin column
  8 +
  80 + // aft block + gap
  40 + // stern label
  24; // pb-6

function RoomsSkeleton({ mobile }: { mobile: boolean }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-40 rounded bg-muted" />
      {mobile ? (
        <div
          style={{ height: MOBILE_DECK_H }}
          className="mx-auto w-full max-w-80 rounded-[50%_50%_56px_56px/120px_120px_56px_56px] border border-border bg-muted/40"
        />
      ) : (
        [0, 1].map((i) => (
          <div
            key={i}
            className="h-60 rounded-[40px_50%_50%_40px/40px_50%_50%_40px] border border-border bg-muted/40"
          />
        ))
      )}
    </div>
  );
}

/* ── Cabin tile ── */
function RoomCell({
  room,
  checked,
  onSelect,
}: {
  room: PackageRoom;
  checked: boolean;
  onSelect: () => void;
}) {
  const selectable = room.availability === "available";
  const capacity =
    room.room_type.max_adults + (room.room_type.max_kids ? `+${room.room_type.max_kids}` : "");
  /* Spoken name. The tile's visible text ("309", "2+1 · ৳12,000") reads as a
   * meaningless run of numbers to a screen reader, so state the whole thing. */
  const label = selectable
    ? `Room ${room.room_number}, ${room.room_type.name}, up to ${room.room_type.max_adults} adult${
        room.room_type.max_adults > 1 ? "s" : ""
      }${room.room_type.max_kids ? ` and ${room.room_type.max_kids} kid${room.room_type.max_kids > 1 ? "s" : ""}` : ""}, ${formatBDT(room.room_type.base_price)}, available`
    : `Room ${room.room_number}, ${AVAILABILITY_LABEL[room.availability]}`;
  return (
    /* .focus-ring-within (styles.css): the radio is sr-only (1×1px), so the UA
     * paints its focus ring on a box clipped to nothing and the *visible* tile
     * got no focus treatment at all — keyboard users tabbed across 31 rooms with
     * an invisible cursor. The ring is ocean, not gold, so focus stays
     * distinguishable from the gold `checked` state. */
    <label
      title={
        selectable
          ? `Room ${room.room_number} · ${room.room_type.name} · ${formatBDT(room.room_type.base_price)}`
          : `Room ${room.room_number} · ${AVAILABILITY_LABEL[room.availability]}`
      }
      style={{ height: cellSize() }}
      className={`focus-ring-within relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border shadow-sm px-1 text-center transition-all ${
        !selectable
          ? "cursor-not-allowed border-red-400/80 bg-red-50/95"
          : checked
            ? "cursor-pointer border-gold bg-amber-50 shadow-[0_0_0_1.5px_var(--gold)]"
            : "cursor-pointer border-emerald-500/45 bg-emerald-50/95 hover:border-emerald-600/70 hover:bg-emerald-100 hover:-translate-y-0.5 hover:shadow-luxe"
      }`}
    >
      <input
        type="radio"
        name="room"
        className="sr-only"
        aria-label={label}
        checked={checked}
        disabled={!selectable}
        onChange={() => selectable && onSelect()}
      />
      {checked && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 size-4 rounded-full gradient-gold grid place-items-center shadow-luxe"
        >
          <Check className="size-2.5 text-ocean" strokeWidth={3} />
        </span>
      )}
      {/* aria-hidden: the tile's visual text is a terse duplicate of the radio's
          aria-label above — announcing both would read the room twice. */}
      <span
        aria-hidden="true"
        className={`font-display text-lg leading-none ${!selectable ? "text-red-900/70 line-through decoration-red-500/70" : ""}`}
      >
        {room.room_number}
      </span>
      {selectable ? (
        <span
          aria-hidden="true"
          className="flex max-w-full items-center gap-1 text-[9px] text-muted-foreground leading-none"
        >
          <Users className="size-2.5 shrink-0" />
          <span className="truncate">
            {capacity} · {formatBDT(room.room_type.base_price)}
          </span>
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="text-[8px] font-semibold uppercase tracking-[0.14em] text-red-900/70 leading-none"
        >
          {AVAILABILITY_LABEL[room.availability]}
        </span>
      )}
    </label>
  );
}

/* ── Non-bookable areas: lounges, suite, stairs ── */
function FeatureCell({
  label,
  icon: Icon,
  span,
  vertical = false,
}: {
  label: string;
  icon: LucideIcon;
  span?: number;
  vertical?: boolean;
}) {
  return (
    <div
      style={
        vertical
          ? { height: cellSize(span) }
          : {
              height: cellSize(),
              ...(span ? { gridColumn: `span ${span} / span ${span}` } : undefined),
            }
      }
      className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/70 bg-[#f7f0e2]/95 shadow-sm px-1 text-center"
    >
      <Icon className="size-3.5 text-[#8a6a42]" />
      <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#7c5a36] leading-tight">
        {label}
      </span>
    </div>
  );
}

/* ── One deck: horizontal hull on md+, vertical hull on mobile ── */
function Deck({
  plan,
  roomsByNumber,
  selectedRoomId,
  onSelectRoom,
  vertical,
}: {
  plan: DeckPlan;
  roomsByNumber: Map<string, PackageRoom>;
  selectedRoomId?: number;
  onSelectRoom: (room: PackageRoom) => void;
  /** Draw the ship bow-up (mobile) rather than bow-right. Only the chosen hull
   * is rendered — the other must not be left in the DOM. */
  vertical: boolean;
}) {
  const deckHeadingId = useId();
  const deckRooms = [...plan.port, ...plan.starboard]
    .filter((c): c is Extract<PlanCell, { kind: "room" }> => c.kind === "room")
    .map((c) => roomsByNumber.get(c.number))
    .filter((r): r is PackageRoom => !!r);
  const availableCount = deckRooms.filter((r) => r.availability === "available").length;
  const columns = Math.max(rowUnits(plan.port), rowUnits(plan.starboard), 1);

  /* Width at which every cabin still clears MIN_CELL_W, derived from the hull's
   * fixed furniture rather than hardcoded — a ship with more cabins per deck
   * (or no aft block) gets the right number without code changes. */
  const HULL_CHROME =
    8 * 2 + // hull p-2
    16 + // deck pl-4
    112 + // deck pr-28 (bow)
    14 + // stern label
    8 + // flex gap
    (plan.aft ? 80 + 8 : 0); // aft block + gap
  const hullMinWidth =
    HULL_CHROME + columns * MIN_CELL_W + (columns - 1) * ROW_GAP;

  const renderCell = (cell: PlanCell, i: number, vertical: boolean) => {
    if (cell.kind === "feature") {
      return (
        <FeatureCell
          key={`f-${i}`}
          label={cell.label}
          icon={cell.icon}
          span={cell.span}
          vertical={vertical}
        />
      );
    }
    const r = roomsByNumber.get(cell.number);
    if (!r) {
      return (
        <div
          key={cell.number}
          style={{ height: cellSize() }}
          className="rounded-lg border border-dashed border-border/60"
        />
      );
    }
    return (
      <RoomCell
        key={cell.number}
        room={r}
        checked={selectedRoomId === r.id}
        onSelect={() => onSelectRoom(r)}
      />
    );
  };

  /* Horizontal (md+): cells run aft → bow, left → right.
   *
   * The floor of MIN_CELL_W is load-bearing: with `minmax(0, 1fr)` the cabins
   * absorbed every pixel the hull's fixed furniture (stern label, aft block,
   * bow) didn't leave them, collapsing to ~18px at 1024px — narrower than the
   * room number they must show, so the numbers overlapped illegibly. Cells now
   * refuse to shrink past a readable, tappable width and the hull scrolls
   * instead (see the overflow-x wrapper below). */
  const renderRow = (cells: PlanCell[]) => (
    <div
      className="grid"
      style={{
        gap: ROW_GAP,
        gridTemplateColumns: `repeat(${columns}, minmax(${MIN_CELL_W}px, 1fr))`,
      }}
    >
      {cells.map((cell, i) => renderCell(cell, i, false))}
    </div>
  );

  /* Vertical (mobile): bow first, so cells render in reverse order. */
  const renderColumn = (cells: PlanCell[]) => (
    <div className="flex flex-1 flex-col" style={{ gap: ROW_GAP }}>
      {[...cells].reverse().map((cell, i) => renderCell(cell, i, true))}
    </div>
  );

  const aftBlockContent = plan.aft && (
    <div className="flex flex-col items-center gap-1.5">
      <plan.aft.icon
        className={`size-4 ${plan.aft.variant === "pool" ? "text-white/95" : "text-[#8a6a42]"}`}
      />
      <span
        className={`text-[8px] font-semibold uppercase tracking-[0.16em] leading-relaxed ${
          plan.aft.variant === "pool" ? "text-white/95 drop-shadow-sm" : "text-[#7c5a36]"
        }`}
      >
        {plan.aft.label}
      </span>
    </div>
  );
  const aftVariantClasses =
    plan.aft?.variant === "pool"
      ? "border-[3px] border-white/90 bg-linear-to-b from-sky-300 to-sky-500 shadow-inner"
      : "border border-white/70 bg-[#f7f0e2]/95 shadow-sm";

  const waves = (
    <>
      <div className="pointer-events-none absolute left-8 bottom-4 h-2 w-36 rounded-full bg-white/50 blur-[1px]" />
      <div className="pointer-events-none absolute right-16 top-5 h-2 w-24 rounded-full bg-white/40 blur-[1px]" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-1.5 w-28 rounded-full bg-white/30 blur-[1px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-8 h-1.5 w-20 rounded-full bg-white/35 blur-[1px]" />
    </>
  );

  const compassRose = (
    <>
      <div className="size-10 rounded-full bg-white/90 ring-2 ring-white shadow-md grid place-items-center">
        <Compass className="size-5 text-ocean/70" />
      </div>
      <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/95 drop-shadow-sm">
        Bow
      </span>
    </>
  );

  return (
    /* min-w-0: without it this box takes its content's min-width (the hull's),
     * which propagates out to the page and scrolls the whole document sideways
     * instead of scrolling the deck.
     *
     * role=radiogroup + aria-labelledby: the room radios share a `name` but had
     * no grouping element, so a screen reader announced "radio button, 1 of 31"
     * with no statement of what was being chosen or which deck it was on. */
    <div
      className="min-w-0"
      role="radiogroup"
      aria-labelledby={deckHeadingId}
    >
      {/* Deck header */}
      <div className="flex items-baseline justify-between px-2 mb-2">
        <span id={deckHeadingId} className="eyebrow text-[10px] text-ocean flex items-center gap-1.5">
          <BedDouble aria-hidden="true" className="size-3 text-gold" />
          {plan.name} · {ordinal(plan.floor)} Floor
        </span>
        <span className="text-[10px] text-muted-foreground">
          <span className="font-semibold text-emerald-700">{availableCount}</span> of{" "}
          {deckRooms.length} rooms available
        </span>
      </div>

      {/* ── md+: horizontal ship on water — stern left, bow right ──
       * The hull scrolls horizontally on narrow desktops/tablets rather than
       * crushing the cabins: HULL_MIN_W is the width at which every tile still
       * meets MIN_CELL_W, so below that the deck pans instead of collapsing. */}
      {!vertical && (
      <div className="relative rounded-[36px] bg-linear-to-b from-sky-200/60 via-sky-100/50 to-sky-300/45 p-4 lg:p-6 overflow-x-auto overflow-y-hidden">
        {waves}

        {/* White hull */}
        <div
          className="relative rounded-[52px_150px_150px_52px/52px_50%_50%_52px] border border-slate-300/80 bg-linear-to-b from-white via-slate-50 to-slate-200 shadow-[0_18px_40px_-18px_rgba(15,45,60,0.5)] p-2"
          style={{ minWidth: hullMinWidth }}
        >
          {/* Wooden deck */}
          <div
            className="relative rounded-[44px_140px_140px_44px/44px_50%_50%_44px] p-3 pl-4 pr-28"
            style={{ background: woodDeck("h") }}
          >
            <div className="flex items-stretch gap-2">
              <div className="flex items-center shrink-0">
                <span className="[writing-mode:vertical-rl] rotate-180 text-[8px] font-semibold uppercase tracking-[0.3em] text-white/80 px-0.5">
                  Stern
                </span>
              </div>

              {plan.aft && (
                <div
                  className={`w-20 shrink-0 flex flex-col items-center justify-center rounded-l-[30px] rounded-r-xl px-2 text-center ${aftVariantClasses}`}
                >
                  {aftBlockContent}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {renderRow(plan.port)}
                <div className="my-1.5 rounded-full border border-white/60 bg-[#efe0c5]/90 py-1 text-center text-[8px] font-semibold uppercase tracking-[0.35em] text-[#8a6a42]">
                  {ordinal(plan.floor)} floor corridor
                </div>
                {renderRow(plan.starboard)}
              </div>
            </div>

            {/* Bow: compass rose on open deck */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
              {compassRose}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Mobile: vertical ship on water — bow top, stern bottom ── */}
      {vertical && (
      <div className="relative rounded-[32px] bg-linear-to-b from-sky-200/60 via-sky-100/50 to-sky-300/45 p-4 overflow-hidden">
        {waves}

        {/* White hull */}
        <div className="relative mx-auto w-full max-w-80 rounded-[50%_50%_64px_64px/160px_160px_64px_64px] border border-slate-300/80 bg-linear-to-b from-white via-slate-50 to-slate-200 shadow-[0_18px_40px_-18px_rgba(15,45,60,0.5)] p-2">
          {/* Wooden deck */}
          <div
            className="relative rounded-[50%_50%_56px_56px/152px_152px_56px_56px] px-3 pb-6 pt-28"
            style={{ background: woodDeck("v") }}
          >
            {/* Bow: compass rose on open deck */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
              {compassRose}
            </div>

            <div className="flex" style={{ gap: ROW_GAP }}>
              {renderColumn(plan.port)}

              {/* Corridor */}
              <div className="relative w-7 shrink-0 self-stretch">
                <div className="absolute inset-y-1 left-1/2 border-l border-dashed border-white/60" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rounded-full border border-white/60 bg-[#efe0c5]/95 px-0.5 py-2 text-[8px] font-semibold uppercase tracking-[0.35em] text-[#8a6a42]">
                  Corridor
                </span>
              </div>

              {renderColumn(plan.starboard)}
            </div>

            {/* Aft common area */}
            {plan.aft && (
              <div
                className={`mt-2 h-20 rounded-2xl grid place-items-center text-center px-3 ${aftVariantClasses}`}
              >
                {aftBlockContent}
              </div>
            )}

            {/* Stern label */}
            <div className="mt-3 text-center text-[8px] font-semibold uppercase tracking-[0.3em] text-white/80">
              Stern
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export function RoomPicker({ packageId, selectedRoomId, onSelectRoom }: Props) {
  const { data: rooms, isLoading, isError } = usePackageRooms(packageId);
  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  // Matches the md breakpoint the deck layouts are keyed to — used to mount one
  // deck rather than render both and hide one.
  const isMobile = useIsMobile();

  if (!packageId) {
    return (
      <div className="p-10 rounded-2xl border border-dashed border-border text-sm text-muted-foreground text-center">
        Choose a sailing date first to see room availability.
      </div>
    );
  }
  if (isLoading) {
    return <RoomsSkeleton mobile={isMobile} />;
  }
  if (isError || !rooms) {
    return (
      <div className="p-10 rounded-2xl border border-dashed border-border text-sm text-muted-foreground text-center">
        Couldn't load rooms for this voyage — please try again.
      </div>
    );
  }

  const roomsByNumber = new Map(rooms.map((r) => [r.room_number, r]));
  const availableCount = rooms.filter((r) => r.availability === "available").length;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Use the drawn plan for decks whose rooms exist in this ship's data;
  // everything else gets an auto-generated deck so any ship still renders.
  const drawnPlans = SHIP_DECK_PLANS.filter((plan) =>
    [...plan.port, ...plan.starboard].some((c) => c.kind === "room" && roomsByNumber.has(c.number)),
  );
  const drawnNumbers = new Set(
    drawnPlans.flatMap((p) =>
      [...p.port, ...p.starboard].flatMap((c) => (c.kind === "room" ? [c.number] : [])),
    ),
  );
  const leftover = rooms.filter((r) => !drawnNumbers.has(r.room_number));
  const leftoverFloors = Array.from(new Set(leftover.map((r) => r.floor_number)));
  const autoPlans = leftoverFloors.map((floor) =>
    autoDeckPlan(
      floor,
      leftover.filter((r) => r.floor_number === floor),
    ),
  );

  // Lowest floor first: tabs read 1st Floor, 2nd Floor, …
  const decks = [...drawnPlans, ...autoPlans].sort((a, b) => a.floor - b.floor);
  const activeDeck = decks.find((d) => d.floor === activeFloor) ?? decks[0];

  const deckAvailable = (plan: DeckPlan) =>
    [...plan.port, ...plan.starboard].filter(
      (c) =>
        c.kind === "room" && roomsByNumber.get(c.number)?.availability === "available",
    ).length;
  const tabLabel = (plan: DeckPlan) => (plan.floor > 0 ? `${ordinal(plan.floor)} Floor` : plan.name);

  return (
    <div className="space-y-6">
      {/* Counts + legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow text-muted-foreground text-[10px]">
          {decks.length} {decks.length === 1 ? "Deck" : "Decks"} · {rooms.length} Rooms ·{" "}
          <span className="text-emerald-600">{availableCount} available</span>
        </span>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full gradient-gold" /> Selected
          </span>
        </div>
      </div>

      {/* Only the deck for the current breakpoint is mounted. Rendering both and
       * hiding one with CSS put every room in the DOM ~3× — including live radio
       * inputs on offscreen tiles, which keyboard and screen-reader users could
       * still reach. */}

      {/* md+: both decks stacked, upper deck first */}
      {!isMobile && (
        <div className="min-w-0 space-y-8">
          {[...decks].reverse().map((plan) => (
            <Deck
              key={`${plan.name}-${plan.floor}`}
              plan={plan}
              roomsByNumber={roomsByNumber}
              selectedRoomId={selectedRoomId}
              onSelectRoom={onSelectRoom}
              vertical={false}
            />
          ))}
        </div>
      )}

      {/* Mobile: floor tabs + the active deck only, so no long scrolling */}
      {isMobile && (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {decks.map((plan) => {
            const active = plan.floor === activeDeck?.floor;
            return (
              <button
                type="button"
                key={`${plan.name}-${plan.floor}`}
                onClick={() => setActiveFloor(plan.floor)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "bg-ocean text-background shadow-luxe"
                    : "border border-border bg-card text-muted-foreground hover:border-gold/60 hover:text-foreground cursor-pointer"
                }`}
              >
                {tabLabel(plan)}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${
                    active ? "bg-gold/20 text-gold-soft" : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {deckAvailable(plan)}
                </span>
              </button>
            );
          })}
        </div>
        {activeDeck && (
          <Deck
            key={`${activeDeck.name}-${activeDeck.floor}`}
            plan={activeDeck}
            roomsByNumber={roomsByNumber}
            selectedRoomId={selectedRoomId}
            onSelectRoom={onSelectRoom}
            vertical
          />
        )}
      </div>
      )}

      {/* Selected room recap */}
      {selectedRoom && (
        <div className="rounded-2xl border border-gold/40 bg-ocean/4 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl gradient-gold grid place-items-center shrink-0 shadow-luxe">
              <BedDouble className="size-4.5 text-ocean" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Room {selectedRoom.room_number} · {selectedRoom.room_type.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Up to {selectedRoom.room_type.max_adults} adult
                {selectedRoom.room_type.max_adults > 1 ? "s" : ""}
                {selectedRoom.room_type.max_kids
                  ? ` and ${selectedRoom.room_type.max_kids} kid${selectedRoom.room_type.max_kids > 1 ? "s" : ""}`
                  : ""}
                {selectedRoom.floor_number !== null ? ` · Floor ${selectedRoom.floor_number}` : ""}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="eyebrow text-[9px] text-muted-foreground">Room base</div>
            <div className="font-display text-xl text-gold-text leading-none mt-0.5">
              {formatBDT(selectedRoom.room_type.base_price)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
