import { parseISO } from "date-fns";

/** Parse a backend date-only field ("2026-08-01") as LOCAL midnight.
 *
 * `new Date("2026-08-01")` parses as UTC midnight per the ECMAScript spec,
 * so browsers west of UTC render it as the previous day (31 Jul) and a
 * calendar seeded with it can open on the wrong month. Package dates are
 * Bangladesh calendar dates and must display the same everywhere — always
 * parse them with this helper, never with `new Date(string)`.
 * (Full ISO datetimes like `created_at` carry an offset and are unaffected.)
 */
export function parseLocalDate(iso: string): Date {
  return parseISO(iso);
}
