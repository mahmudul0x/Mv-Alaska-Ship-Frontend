import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCancellationPolicy,
  getCancellationPreview,
  lookupBooking,
  requestCancellation,
} from "@/lib/api/cancellations";
import type { BookingLookupRequest, CancellationRequestPayload } from "@/lib/api/types";

/** The published charge schedule (policy page). Effectively static content —
 *  an admin edits it a couple of times a year — so it is cached hard. */
export function useCancellationPolicy() {
  return useQuery({
    queryKey: ["cancellation-policy"],
    queryFn: getCancellationPolicy,
    staleTime: 60 * 60 * 1000,
  });
}

/** What cancelling would cost. `enabled` is how the cancel dialog defers the
 *  call until it is actually opened — the figures must be fresh at the moment
 *  the customer reads them, not from when the page loaded. */
export function useCancellationPreview(bookingCode: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["cancellation-preview", bookingCode],
    queryFn: () => getCancellationPreview(bookingCode!),
    enabled: Boolean(bookingCode) && enabled,
    // The quote depends on today's date and on a signed token with a 30-minute
    // life. Never serve it from cache on reopen: a stale token is refused by
    // the server, which is safe but reads to the customer as a broken form.
    staleTime: 0,
    gcTime: 0,
  });
}

export function useRequestCancellation(bookingCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CancellationRequestPayload) => requestCancellation(bookingCode, payload),
    onSuccess: () => {
      // The booking may now be cancelled outright (nothing was paid) or simply
      // be carrying a pending request; either way both reads are stale.
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingCode] });
      queryClient.invalidateQueries({
        queryKey: ["cancellation-preview", bookingCode],
      });
    },
  });
}

export function useBookingLookup() {
  return useMutation({
    mutationFn: (payload: BookingLookupRequest) => lookupBooking(payload),
  });
}
