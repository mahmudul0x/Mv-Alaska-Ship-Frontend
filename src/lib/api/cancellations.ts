import { apiClient } from "./client";
import type {
  BookingLookupRequest,
  BookingPublic,
  CancellationPolicy,
  CancellationPreview,
  CancellationRequestPayload,
  CancellationRequestPublic,
} from "./types";

/** The published charge schedule, for the policy page.
 *
 *  Read from the API rather than hardcoded so the table a customer reads and
 *  the percentage the backend actually applies can never disagree. */
export async function getCancellationPolicy(): Promise<CancellationPolicy> {
  const { data } = await apiClient.get<CancellationPolicy>("/cancellation-policy/");
  return data;
}

/** "Find my booking" — booking code plus the last 4 digits of the phone on it.
 *
 *  The confirmation page reaches a booking with the code alone (the customer
 *  got that link in their own inbox). This form is on the public site, so it
 *  asks for the second factor; a 404 covers both a wrong code and a wrong
 *  number, deliberately. */
export async function lookupBooking(payload: BookingLookupRequest): Promise<BookingPublic> {
  const { data } = await apiClient.post<BookingPublic>("/bookings/lookup/", payload);
  return data;
}

/** What cancelling this booking would cost, right now. Writes nothing. */
export async function getCancellationPreview(bookingCode: string): Promise<CancellationPreview> {
  const { data } = await apiClient.get<CancellationPreview>(
    `/bookings/${bookingCode}/cancellation-preview/`,
  );
  return data;
}

/** Submit the cancellation request.
 *
 *  Note what is NOT in the payload: any amount. The server recomputes the
 *  charge from the booking and the schedule; `quote_token` only proves which
 *  figures the customer agreed to, so a moved quote is refused instead of
 *  silently applied. */
export async function requestCancellation(
  bookingCode: string,
  payload: CancellationRequestPayload,
): Promise<CancellationRequestPublic> {
  const { data } = await apiClient.post<CancellationRequestPublic>(
    `/bookings/${bookingCode}/cancellation-request/`,
    payload,
  );
  return data;
}
