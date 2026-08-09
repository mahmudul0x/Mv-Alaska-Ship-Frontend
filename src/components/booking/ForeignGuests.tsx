import { AnimatePresence, motion } from "framer-motion";
import { useId } from "react";
import { Baby, Globe, User } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { formatBDT } from "@/lib/money";
import { foreignGuestError, normalisePassport } from "@/lib/validation/foreignGuests";
import type { ForeignGuest } from "@/lib/api/types";

/** A foreign guest while the wizard is still open, bound to the seat it
 *  belongs to.
 *
 *  `slot` is UI-only and never sent: the API takes a flat list and only counts
 *  it. Keeping it client-side is what lets the passport fields sit under the
 *  specific guest the customer ticked, instead of in an anonymous list whose
 *  order means nothing. */
export type ForeignGuestDraft = ForeignGuest & { slot: number };

type Seat = {
  guest_type: ForeignGuest["guest_type"];
  slot: number;
  label: string;
  detail: string;
};

/** Foreign nationals in ONE cabin.
 *
 *  This used to be two counters ("Foreign adults: 1") sitting under the pax
 *  counters — two numbers for the same person, which read as extra guests on
 *  board no matter how much explanatory copy was piled on top. So the control
 *  is no longer a count at all: the cabin's actual occupants are listed, one
 *  row each, and the customer ticks the ones holding a foreign passport. There
 *  is nothing to add up, so there is nothing to misread.
 *
 *  Collapsed behind a single checkbox, because nearly every booking is
 *  domestic and those customers should never see a passport field.
 */
export function ForeignGuestsSection({
  roomNumber,
  adultCount,
  kidAges,
  guests,
  adultSurcharge,
  kidSurcharge,
  onChange,
}: {
  roomNumber: string;
  adultCount: number;
  kidAges: number[];
  guests: ForeignGuestDraft[];
  adultSurcharge: string;
  kidSurcharge: string;
  onChange: (guests: ForeignGuestDraft[]) => void;
}) {
  const toggleId = useId();
  const enabled = guests.length > 0;

  const adultRate = Number(adultSurcharge);
  const kidRate = Number(kidSurcharge);
  const rateFor = (type: ForeignGuest["guest_type"]) => (type === "kid" ? kidRate : adultRate);

  // One row per person actually travelling in this cabin.
  const seats: Seat[] = [
    ...Array.from({ length: adultCount }, (_, i) => ({
      guest_type: "adult" as const,
      slot: i,
      label: adultCount > 1 ? `Adult ${i + 1}` : "Adult",
      detail: "Ages 12+",
    })),
    ...kidAges.map((age, i) => ({
      guest_type: "kid" as const,
      slot: i,
      label: kidAges.length > 1 ? `Child ${i + 1}` : "Child",
      detail: `${age} year${age === 1 ? "" : "s"} old`,
    })),
  ];

  const guestAt = (seat: Seat) =>
    guests.find((g) => g.guest_type === seat.guest_type && g.slot === seat.slot);

  const toggleSeat = (seat: Seat) => {
    const existing = guestAt(seat);
    if (existing) {
      onChange(guests.filter((g) => g !== existing));
      return;
    }
    onChange([...guests, { guest_type: seat.guest_type, slot: seat.slot, passport_number: "" }]);
  };

  const updateSeat = (seat: Seat, patch: Partial<ForeignGuest>) =>
    onChange(
      guests.map((g) =>
        g.guest_type === seat.guest_type && g.slot === seat.slot ? { ...g, ...patch } : g,
      ),
    );

  // Turning the section off clears the list, which is what removes the
  // surcharge from the live quote.
  const toggleSection = (on: boolean) =>
    onChange(on ? [{ guest_type: "adult", slot: 0, passport_number: "" }] : []);

  const surchargeNote =
    adultRate > 0 || kidRate > 0
      ? [
          adultRate > 0 ? `${formatBDT(adultSurcharge)} per adult` : null,
          kidRate > 0 ? `${formatBDT(kidSurcharge)} per child` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <div className="px-5 py-4">
      <label htmlFor={toggleId} className="flex items-start gap-3 cursor-pointer select-none">
        <input
          id={toggleId}
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggleSection(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-border text-ocean focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean cursor-pointer"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-semibold leading-tight">
            <Globe className="size-3.5 text-ocean/70 shrink-0" />
            Any foreign nationals in this cabin?
          </span>
          <span className="block text-[11px] text-muted-foreground mt-0.5">
            Passport required for each
            {surchargeNote ? ` · surcharge ${surchargeNote}` : ""}
          </span>
        </span>
      </label>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border border-border/70 overflow-hidden">
              <div className="px-4 py-2.5 bg-ocean/4 text-[11px] text-muted-foreground border-b border-border/70">
                Tick each guest who holds a foreign passport.
              </div>
              <div className="divide-y divide-border/70">
                {seats.map((seat) => (
                  <SeatRow
                    key={`${seat.guest_type}-${seat.slot}`}
                    seat={seat}
                    roomNumber={roomNumber}
                    guest={guestAt(seat)}
                    rate={rateFor(seat.guest_type)}
                    onToggle={() => toggleSeat(seat)}
                    onChange={(patch) => updateSeat(seat, patch)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** One occupant of the cabin: a tick row that expands into their passport
 *  fields. Untouched rows stay a single quiet line, so a cabin of four with
 *  one foreign guest shows one form, not four. */
function SeatRow({
  seat,
  roomNumber,
  guest,
  rate,
  onToggle,
  onChange,
}: {
  seat: Seat;
  roomNumber: string;
  guest: ForeignGuestDraft | undefined;
  rate: number;
  onToggle: () => void;
  onChange: (patch: Partial<ForeignGuest>) => void;
}) {
  const rowId = useId();
  const SeatIcon = seat.guest_type === "kid" ? Baby : User;
  const selected = guest !== undefined;

  return (
    <div className={selected ? "bg-ocean/3" : ""}>
      <label
        htmlFor={rowId}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
      >
        <input
          id={rowId}
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="size-4 shrink-0 rounded border-border text-ocean focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean cursor-pointer"
        />
        <SeatIcon
          className={`size-4 shrink-0 ${selected ? "text-ocean/70" : "text-muted-foreground/50"}`}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-tight">{seat.label}</span>
          <span className="block text-[10px] text-muted-foreground">{seat.detail}</span>
        </span>
        {selected && rate > 0 && (
          <span className="shrink-0 rounded-full bg-gold/15 text-gold-text px-2.5 py-1 text-[10px] font-semibold tabular-nums">
            +{formatBDT(String(rate))}
          </span>
        )}
      </label>

      <AnimatePresence>
        {guest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <PassportFields seat={seat} roomNumber={roomNumber} guest={guest} onChange={onChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const field =
  "w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all";

function PassportFields({
  seat,
  roomNumber,
  guest,
  onChange,
}: {
  seat: Seat;
  roomNumber: string;
  guest: ForeignGuestDraft;
  onChange: (patch: Partial<ForeignGuest>) => void;
}) {
  const ids = {
    passport: useId(),
    name: useId(),
    nationality: useId(),
    expiry: useId(),
  };
  // Only complain once they have typed something. A blank passport on a row
  // just ticked is not a mistake to shout about — Confirm is disabled anyway.
  const error = guest.passport_number ? foreignGuestError(guest) : null;
  const errorId = `${ids.passport}-error`;

  return (
    <div className="px-4 pb-4 pl-11 grid sm:grid-cols-2 gap-2.5">
      <div className="sm:col-span-2">
        <label htmlFor={ids.passport} className="block text-[11px] text-muted-foreground mb-1">
          Passport number <span className="text-destructive">*</span>
        </label>
        <input
          id={ids.passport}
          value={guest.passport_number}
          // Normalised on entry so what the customer sees is exactly what is
          // stored and printed on the boarding manifest.
          onChange={(e) => onChange({ passport_number: normalisePassport(e.target.value) })}
          placeholder="A1234567"
          autoComplete="off"
          spellCheck={false}
          aria-label={`Passport number for ${seat.label} in room ${roomNumber}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${field} font-mono tracking-wide ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
          }`}
        />
        {error && (
          <p id={errorId} className="mt-1 text-[11px] text-destructive">
            {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={ids.name} className="block text-[11px] text-muted-foreground mb-1">
          Full name <span className="normal-case">(optional)</span>
        </label>
        <input
          id={ids.name}
          value={guest.full_name ?? ""}
          onChange={(e) => onChange({ full_name: e.target.value })}
          placeholder="As printed in the passport"
          maxLength={100}
          className={field}
        />
      </div>

      <div>
        <label htmlFor={ids.nationality} className="block text-[11px] text-muted-foreground mb-1">
          Nationality <span className="normal-case">(optional)</span>
        </label>
        <select
          id={ids.nationality}
          value={guest.nationality ?? ""}
          onChange={(e) => onChange({ nationality: e.target.value })}
          className={`${field} cursor-pointer`}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={ids.expiry} className="block text-[11px] text-muted-foreground mb-1">
          Passport expiry <span className="normal-case">(optional)</span>
        </label>
        <input
          id={ids.expiry}
          type="date"
          value={guest.passport_expiry ?? ""}
          onChange={(e) => onChange({ passport_expiry: e.target.value })}
          className={`${field} cursor-pointer`}
        />
      </div>

      <p className="sm:col-span-2 text-[10px] text-muted-foreground">
        Used only for the ship's boarding manifest and the port authority. Never shown in full on
        your confirmation page.
      </p>
    </div>
  );
}
