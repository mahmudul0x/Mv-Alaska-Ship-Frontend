import { useMutation } from "@tanstack/react-query";

import { initiatePayment } from "@/lib/api/bookings";
import type { PaymentInitiateRequest } from "@/lib/api/types";

export function useInitiatePayment(bookingCode: string) {
  return useMutation({
    mutationFn: (payload: PaymentInitiateRequest) => initiatePayment(bookingCode, payload),
  });
}
