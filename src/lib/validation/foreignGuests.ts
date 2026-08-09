import type { ForeignGuest } from "@/lib/api/types";

/** Client-side mirror of apps/bookings/guests.py.
 *
 *  UX ONLY — the server re-validates every rule here and is the authority. The
 *  point of duplicating it is that a customer should learn their passport is
 *  malformed while the field is focused, not after filling in the whole wizard
 *  and being bounced by a 400. Keep the two in step: the rules below are the
 *  same bounds, in the same order, as the Python module.
 */

/** "a 123-4567" and "A1234567" are one passport. Normalising on entry is what
 *  makes the duplicate check meaningful — and it is what the server stores, so
 *  the value shown back to the customer matches their booking. */
export function normalisePassport(value: string): string {
  return value.replace(/[\s\-/]/g, "").toUpperCase();
}

const PASSPORT_RE = /^[A-Z0-9]{5,20}$/;

/** Validation message for one guest, or null when the guest is acceptable.
 *  Only the passport can be invalid — every other field is optional. */
export function foreignGuestError(guest: ForeignGuest): string | null {
  const passport = normalisePassport(guest.passport_number ?? "");
  if (!passport) return "Passport number is required";
  if (!PASSPORT_RE.test(passport)) return "Use 5–20 letters and digits";
  if (guest.passport_expiry) {
    // Compare dates only. `new Date("2031-04-09")` is UTC midnight, so a
    // same-day comparison against a local `now` would wrongly read as expired
    // for anyone east of UTC — Dhaka included.
    const today = new Date().toISOString().slice(0, 10);
    if (guest.passport_expiry <= today) return "Passport has already expired";
  }
  return null;
}

/** Every blocking problem across a whole booking's guest lists, so the wizard
 *  can disable Continue and say why. Includes the cross-cabin duplicate the
 *  server enforces, which no single-guest check can see. */
export function foreignGuestIssues(
  rooms: { roomNumber: string; guests: ForeignGuest[] }[],
): string[] {
  const issues: string[] = [];
  const seen = new Map<string, string>();
  for (const room of rooms) {
    room.guests.forEach((guest, i) => {
      const error = foreignGuestError(guest);
      if (error) {
        issues.push(`Room ${room.roomNumber}, guest ${i + 1}: ${error}`);
        return;
      }
      const passport = normalisePassport(guest.passport_number);
      const already = seen.get(passport);
      if (already) {
        issues.push(
          `Passport ${passport} is listed on both room ${already} and room ${room.roomNumber}`,
        );
        return;
      }
      seen.set(passport, room.roomNumber);
    });
  }
  return issues;
}

/** Strip the empty optional fields before sending. The server treats "" as
 *  absent anyway, but sending blanks would store noise on the manifest. */
export function serialiseForeignGuests(guests: ForeignGuest[]): ForeignGuest[] {
  return guests.map((guest) => ({
    guest_type: guest.guest_type,
    passport_number: normalisePassport(guest.passport_number),
    ...(guest.full_name?.trim() ? { full_name: guest.full_name.trim() } : {}),
    ...(guest.nationality ? { nationality: guest.nationality } : {}),
    ...(guest.passport_expiry ? { passport_expiry: guest.passport_expiry } : {}),
  }));
}
