import { useQuery } from "@tanstack/react-query";

import { getBooking } from "@/lib/api/bookings";
import type { BookingStatus } from "@/lib/api/types";

const PENDING_POLL_MS = 2000;
const MAX_PENDING_POLLS = 6;

export function useBooking(bookingCode: string | undefined, options?: { pollWhilePending?: boolean }) {
  return useQuery({
    queryKey: ["bookings", bookingCode],
    queryFn: () => getBooking(bookingCode!),
    enabled: bookingCode !== undefined,
    refetchInterval: options?.pollWhilePending
      ? (query) => {
          const status = query.state.data?.status as BookingStatus | undefined;
          const pollCount = query.state.dataUpdateCount;
          if (status === "pending" && pollCount < MAX_PENDING_POLLS) {
            return PENDING_POLL_MS;
          }
          return false;
        }
      : false,
  });
}
