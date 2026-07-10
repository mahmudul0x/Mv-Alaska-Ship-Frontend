import { useQuery } from "@tanstack/react-query";

import { quoteBooking } from "@/lib/api/bookings";
import type { BookingQuoteRequest } from "@/lib/api/types";

/** Live price quote — refetches whenever package/room/pax change. Also
 * doubles as client-side validation (pax limits, cutoff) before submission,
 * since the quote endpoint validates identically to create. */
export function useBookingQuote(request: BookingQuoteRequest | undefined) {
  return useQuery({
    queryKey: ["booking-quote", request],
    queryFn: () => quoteBooking(request!),
    enabled: request !== undefined,
    retry: false,
  });
}
