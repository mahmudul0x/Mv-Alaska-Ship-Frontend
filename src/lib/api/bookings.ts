import { apiClient } from "./client";
import type {
  BookingCreateRequest,
  BookingPublic,
  BookingQuoteRequest,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PriceBreakdown,
} from "./types";

export async function quoteBooking(payload: BookingQuoteRequest): Promise<PriceBreakdown> {
  const { data } = await apiClient.post<PriceBreakdown>("/bookings/quote/", payload);
  return data;
}

export async function createBooking(payload: BookingCreateRequest): Promise<BookingPublic> {
  const { data } = await apiClient.post<BookingPublic>("/bookings/", payload);
  return data;
}

export async function getBooking(bookingCode: string): Promise<BookingPublic> {
  const { data } = await apiClient.get<BookingPublic>(`/bookings/${bookingCode}/`);
  return data;
}

export async function initiatePayment(
  bookingCode: string,
  payload: PaymentInitiateRequest,
): Promise<PaymentInitiateResponse> {
  const { data } = await apiClient.post<PaymentInitiateResponse>(
    `/bookings/${bookingCode}/pay/`,
    payload,
  );
  return data;
}
