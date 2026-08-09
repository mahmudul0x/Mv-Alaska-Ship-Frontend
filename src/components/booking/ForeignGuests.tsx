import { AnimatePresence, motion } from "framer-motion";
import { useId } from "react";
import { Globe, Minus, Plus } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { formatBDT } from "@/lib/money";
import {
  foreignGuestError,
  normalisePassport,
} from "@/lib/validation/foreignGuests";
import type { ForeignGuest } from "@/lib/api/types";

/** Foreign nationals in ONE cabin.
 *
 *  Collapsed to a single checkbox by default: the overwhelming majority of
 *  bookings are domestic, and putting passport fields in front of every
 *  customer would be friction for all of them to serve a few. Ticking the box
 *  reveals the counters, which in turn reveal one passport card per guest.
 *
 *  Foreign guests are a SUBSET of the cabin's pax — the counters are capped by
 *  the adults/kids already chosen above, mirroring the server's rule, so the
 *  customer cannot build a party the API will reject.
 */
export function ForeignGuestsSection({
  roomNumber,
  adultCount,
  kidCount,
  guests,
  adultSurcharge,
  kidSurcharge,
  onChange,
}: {
  roomNumber: string;
  adultCount: number;
  kidCount: number;
  guests: ForeignGuest[];
  adultSurcharge: string;
  kidSurcharge: string;
  onChange: (guests: ForeignGuest[]) => void;
}) {
  const toggleId = useId();
  const enabled = guests.length > 0;

  const foreignAdults = guests.filter((g) => g.guest_type === "adult");
  const foreignKids = guests.filter((g) => g.guest_type === "kid");

  const adultRate = Number(adultSurcharge);
  const kidRate = Number(kidSurcharge);

  /** Grow/shrink one fare type's guests, keeping the other type untouched.
   *  Shrinking drops from the END so the passports already typed into the
   *  earlier cards survive — removing from the front would silently reshuffle
   *  a customer's data. */
  const setCount = (type: ForeignGuest["guest_type"], next: number) => {
    const cap = type === "adult" ? adultCount : kidCount;
    const target = Math.max(0, Math.min(cap, next));
    const ofType = type === "adult" ? foreignAdults : foreignKids;
    const others = type === "adult" ? foreignKids : foreignAdults;
    const resized =
      target > ofType.length
        ? [
            ...ofType,
            ...Array.from({ length: target - ofType.length }, () => ({
              guest_type: type,
              passport_number: "",
            })),
          ]
        : ofType.slice(0, target);
    onChange(type === "adult" ? [...resized, ...others] : [...others, ...resized]);
  };

  const updateGuest = (index: number, patch: Partial<ForeignGuest>) =>
    onChange(guests.map((g, i) => (i === index ? { ...g, ...patch } : g)));

  const toggle = (on: boolean) =>
    // Turning it on seeds one adult so the customer sees a passport card
    // immediately; turning it off clears the list, which is what removes the
    // surcharge from the quote.
    onChange(on ? [{ guest_type: "adult", passport_number: "" }] : []);

  return (
    <div className="px-5 py-4">
      <label
        htmlFor={toggleId}
        className="flex items-start gap-3 cursor-pointer select-none"
      >
        <input
          id={toggleId}
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-border text-ocean focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean cursor-pointer"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-semibold leading-tight">
            <Globe className="size-3.5 text-ocean/70 shrink-0" />
            Any foreign nationals in this cabin?
          </span>
          <span className="block text-[11px] text-muted-foreground mt-0.5">
            {adultRate > 0 || kidRate > 0 ? (
              <>
                A passport is required for each, and a surcharge applies —{" "}
                {adultRate > 0 && <>{formatBDT(adultSurcharge)} per adult</>}
                {adultRate > 0 && kidRate > 0 && ", "}
                {kidRate > 0 && <>{formatBDT(kidSurcharge)} per child</>}.
              </>
            ) : (
              <>A passport is required for each foreign guest.</>
            )}
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
            <div className="mt-4 rounded-xl border border-border/70 bg-ocean/3 px-4 py-3 space-y-3">
              {/* The counters below look like they ADD people — two numbers on
                  one screen ("1 adult" and "1 foreign adult") read as two
                  guests. They are the same guests, so say so before the
                  customer can misread it. */}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                These are the <strong className="text-foreground">same guests</strong>{" "}
                you already added above — marking someone as a foreign national
                does not add another person to the cabin.
              </p>
              <FareCounter
                label="Adults holding a foreign passport"
                hint={`${foreignAdults.length} of the ${adultCount} adult${
                  adultCount > 1 ? "s" : ""
                } in this cabin`}
                value={foreignAdults.length}
                max={adultCount}
                onChange={(n) => setCount("adult", n)}
              />
              {kidCount > 0 && (
                <FareCounter
                  label="Children holding a foreign passport"
                  hint={`${foreignKids.length} of the ${kidCount} ${
                    kidCount > 1 ? "children" : "child"
                  } in this cabin`}
                  value={foreignKids.length}
                  max={kidCount}
                  onChange={(n) => setCount("kid", n)}
                />
              )}
              <p className="text-[11px] text-foreground border-t border-border/60 pt-2.5">
                Guests travelling in this cabin:{" "}
                <strong>
                  {adultCount + kidCount}
                  {adultCount + kidCount === 1 ? " person" : " people"}
                </strong>
                <span className="text-muted-foreground">
                  {" "}
                  ({adultCount} adult{adultCount > 1 ? "s" : ""}
                  {kidCount > 0
                    ? `, ${kidCount} ${kidCount > 1 ? "children" : "child"}`
                    : ""}
                  ) — unchanged.
                </span>
              </p>
            </div>

            <div className="mt-3 space-y-3">
              {guests.map((guest, i) => (
                <GuestCard
                  key={i}
                  index={i}
                  // Numbered WITHIN its fare type ("adult 2 of 2"), not across
                  // the whole list: "Foreign guest 3" on a cabin holding two
                  // people is the same double-counting illusion the counters
                  // above already had to fix.
                  ordinal={
                    guests
                      .slice(0, i + 1)
                      .filter((g) => g.guest_type === guest.guest_type).length
                  }
                  ofType={guests.filter((g) => g.guest_type === guest.guest_type).length}
                  roomNumber={roomNumber}
                  guest={guest}
                  onChange={(patch) => updateGuest(i, patch)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FareCounter({
  label,
  hint,
  value,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-xs font-semibold leading-tight">{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= 0}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="size-9 rounded-lg border border-border bg-card grid place-items-center hover:border-gold hover:text-gold-text transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
        >
          <Minus className="size-3" />
        </button>
        <span className="w-7 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`More ${label.toLowerCase()}`}
          className="size-9 rounded-lg border border-border bg-card grid place-items-center hover:border-gold hover:text-gold-text transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  );
}

const field =
  "w-full bg-background border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all";

function GuestCard({
  index,
  ordinal,
  ofType,
  roomNumber,
  guest,
  onChange,
}: {
  index: number;
  ordinal: number;
  ofType: number;
  roomNumber: string;
  guest: ForeignGuest;
  onChange: (patch: Partial<ForeignGuest>) => void;
}) {
  const ids = {
    passport: useId(),
    name: useId(),
    nationality: useId(),
    expiry: useId(),
  };
  // Only surface an error once the customer has typed something. An empty
  // passport on a card they have not reached yet is not a mistake to shout
  // about — Continue is disabled for it either way.
  const error = guest.passport_number ? foreignGuestError(guest) : null;
  const errorId = `${ids.passport}-error`;

  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
      <div className="text-[11px] font-semibold text-muted-foreground mb-2.5">
        Passport details ·{" "}
        <span className="normal-case font-normal">
          {guest.guest_type === "kid" ? "child" : "adult"}
          {ofType > 1 ? ` ${ordinal} of ${ofType}` : ""}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        <div className="sm:col-span-2">
          <label htmlFor={ids.passport} className="block text-[11px] text-muted-foreground mb-1">
            Passport number <span className="text-destructive">*</span>
          </label>
          <input
            id={ids.passport}
            value={guest.passport_number}
            // Normalise on entry so what the customer sees is exactly what is
            // stored and printed on the manifest.
            onChange={(e) => onChange({ passport_number: normalisePassport(e.target.value) })}
            placeholder="A1234567"
            autoComplete="off"
            spellCheck={false}
            aria-label={`Passport number for foreign guest ${index + 1} in room ${roomNumber}`}
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
      </div>

      <p className="mt-2.5 text-[10px] text-muted-foreground">
        Passport details are used only for the ship's boarding manifest and the
        port authority. They are never shown in full on your confirmation page.
      </p>
    </div>
  );
}
