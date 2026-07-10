import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBooking } from "@/lib/api/bookings";
import type { BookingCreateRequest } from "@/lib/api/types";

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingCreateRequest) => createBooking(payload),
    onSuccess: (_booking, variables) => {
      // Room availability just changed — refresh the room grid so a lost
      // race (409) or a successful booking is reflected immediately.
      queryClient.invalidateQueries({
        queryKey: ["packages", variables.package_id, "rooms"],
      });
    },
  });
}
