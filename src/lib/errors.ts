import type { ApiError } from "./api/types";

/**
 * One sentence a customer can act on, from whatever the API returned.
 *
 * This is the PUBLIC counterpart of the staff dashboard's errorText(). They are
 * deliberately separate: staff are told which database field is wrong so they
 * can fix the record, while a customer booking a cabin should never meet the
 * word "field", a serializer path, or an English DRF stock phrase written for
 * a programmer.
 *
 * Most messages our own validation produces are already real sentences ("This
 * package has already departed — please settle any balance with the guide on
 * board.") and are passed through untouched. What needs work is DRF's own
 * wording, and the shapes it wraps things in.
 */

/** Field names as a customer would say them. Anything unlisted falls back to
 *  no label at all rather than a guessed one — "Special requests is required"
 *  reads badly enough; "Foreign guests.0.passport number is required" is worse
 *  than saying nothing. */
const FIELD_LABELS: Record<string, string> = {
  adult_count: "Adults",
  kid_details: "Children",
  kid_ages: "Children",
  room_id: "Cabin",
  // Reads as the subject of a sentence, because that is the only place it is
  // used: an error on `rooms` itself, not on a cabin's own field.
  rooms: "A cabin",
  package_id: "Voyage",
  customer_name: "Full name",
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  amount: "Amount",
  payment_type: "Payment option",
  special_requests: "Special requests",
  foreign_guests: "Passport details",
  passport_number: "Passport number",
  nationality: "Nationality",
  full_name: "Guest name",
  age: "Age",
  booking_code: "Booking code",
  phone_last4: "Phone number",
};

/** "rooms.0.adult_count" → { cabin: 1, label: "Adults" } */
function describePath(path: string): { cabin: number | null; label: string } {
  const parts = path.split(".").filter(Boolean);
  // A numeric segment directly under "rooms" is the cabin's position in the
  // booking. Customers count from one.
  const roomsAt = parts.indexOf("rooms");
  const indexPart = roomsAt !== -1 ? parts[roomsAt + 1] : undefined;
  const cabin = indexPart !== undefined && /^\d+$/.test(indexPart) ? Number(indexPart) + 1 : null;
  const last = [...parts].reverse().find((p) => !/^\d+$/.test(p)) ?? "";
  return { cabin, label: FIELD_LABELS[last] ?? "" };
}

/** DRF's stock sentences, which name no field and read like a library talking
 *  to a programmer. Returns null for anything we did not write ourselves and
 *  do not recognise — that message is our own validation's and is already
 *  written for a person. */
function humanise(message: string, label: string): string | null {
  const named = label || "This";
  if (message === "This field is required.") return `${named} is required.`;
  if (message === "This field may not be null.") return `${named} is required.`;
  if (message === "This field may not be blank.") return `${named} cannot be empty.`;
  if (message === "A valid number is required.") return `${named} must be a number.`;
  if (message === "A valid integer is required.") return `${named} must be a whole number.`;
  if (message === "Enter a valid email address.") return "That email address doesn't look right.";
  // "Invalid pk "99999" - object does not exist." — the cabin was deleted, or
  // the page was left open across a change. Never show the customer a pk.
  if (/^Invalid pk /.test(message)) {
    return label === "Cabin"
      ? "That cabin is no longer available — please pick another."
      : `${named} is no longer available.`;
  }
  if (/^Ensure this field has no more than (\d+) characters/.test(message)) {
    const max = /no more than (\d+)/.exec(message)?.[1];
    return `${named} is too long (maximum ${max} characters).`;
  }
  const atLeast = /^Ensure this value is greater than or equal to (.+?)\.?$/.exec(message);
  if (atLeast) return `${named} cannot be less than ${atLeast[1]}.`;
  const atMost = /^Ensure this value is less than or equal to (.+?)\.?$/.exec(message);
  if (atMost) return `${named} cannot be more than ${atMost[1]}.`;
  if (message.startsWith('"') && message.includes("is not a valid choice")) {
    return `${named} is not one of the available options.`;
  }
  return null;
}

/** Status codes on their own, when the server said nothing useful. Codes are
 *  not something a customer should have to look up. */
const BY_STATUS: Record<number, string> = {
  0: "We couldn't reach the server. Check your internet connection and try again.",
  400: "Something in the form wasn't accepted. Please check your details and try again.",
  403: "That isn't allowed. If you think this is a mistake, please call us.",
  404: "We couldn't find that. It may have been changed or removed.",
  409: "Someone else just took that. Please choose again.",
  413: "That file is too large. Please try a smaller one.",
  429: "Too many attempts in a row. Please wait a minute and try again.",
  500: "Something went wrong on our side. Please try again in a moment.",
  502: "Our server is restarting. Please give it a moment and try again.",
  503: "Our server is restarting. Please give it a moment and try again.",
  504: "That took too long to answer. Please try again.",
};

/**
 * @param err      whatever was thrown — an ApiError, or anything at all.
 * @param fallback what to say when nothing better can be worked out. Write it
 *                 for the action the customer was taking ("Couldn't start your
 *                 payment…"), because that is the one piece of context this
 *                 function cannot know.
 * @param cabins   how many cabins the booking has, when the caller knows.
 *                 Errors are keyed by cabin index whether the booking holds
 *                 one cabin or four, so without this a single-cabin booking
 *                 would be told "Cabin 1: …" — and a four-cabin one would not
 *                 be told which cabin at all. Only the caller knows.
 */
export function customerError(err: unknown, fallback: string, cabins = 1): string {
  const apiError = err as ApiError | undefined;
  if (!apiError || typeof apiError !== "object") return fallback;

  if (apiError.fieldErrors) {
    const parts: string[] = [];
    for (const [path, messages] of Object.entries(apiError.fieldErrors)) {
      const { cabin, label } = describePath(path);
      for (const message of messages) {
        const text = humanise(message, label) ?? message;
        parts.push(cabin && cabins > 1 ? `Cabin ${cabin}: ${text}` : text);
      }
    }
    // Two problems read fine in one toast; five do not. Past three, the count
    // carries more than the list — and the form marks them all anyway.
    if (parts.length > 3) {
      const rest = parts.length - 3;
      return `${parts.slice(0, 3).join(" ")} (and ${rest} more ${
        rest === 1 ? "problem" : "problems"
      })`;
    }
    if (parts.length) return parts.join(" ");
  }

  // A `detail` from our own code is a sentence written for a person, so it
  // wins — but only where we are the ones writing it. On 429 and the 5xx range
  // the detail comes from DRF or the platform ("Request was throttled.") and
  // is jargon, so the status wording wins there instead. axios's own messages
  // ("Network Error", "Request failed with status code 500") never win.
  const platformOwned = apiError.status === 429 || apiError.status >= 500;
  if (
    apiError.detail &&
    !platformOwned &&
    !/^(Network Error|Request failed with status)/.test(apiError.detail)
  ) {
    return apiError.detail;
  }
  return BY_STATUS[apiError.status] ?? fallback;
}
