import { apiClient } from "./client";
import type {
  BookingCreateRequest,
  BookingInvoice,
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

/** The customer's own invoices for a booking, newest first.
 *
 * Each carries a download_url bearing that invoice's capability token, so a
 * booking code never exposes anyone else's invoice. */
export async function getBookingInvoices(bookingCode: string): Promise<BookingInvoice[]> {
  const { data } = await apiClient.get<BookingInvoice[]>(
    `/bookings/${bookingCode}/invoices/`,
  );
  return data;
}
