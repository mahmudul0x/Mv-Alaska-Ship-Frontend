import { staffClient } from "./staffClient";
import type { Paginated } from "./staffTypes";
import type {
  StaffCancellationRequest,
  StaffCancellationRequestDetail,
  StaffCancellationRequestSummary,
  StaffCancellationRule,
  StaffDepartureCancelResult,
  StaffRefund,
  StaffRefundCreate,
  StaffRefundSummary,
} from "./staffRefundTypes";

// ── Cancellation queue ────────────────────────────────────────────────────

export async function getCancellationRequests(params: {
  page?: number;
  status?: string;
  package?: number;
  search?: string;
}): Promise<Paginated<StaffCancellationRequest>> {
  const { data } = await staffClient.get("/staff/cancellation-requests/", { params });
  return data;
}

export async function getCancellationRequest(id: number): Promise<StaffCancellationRequestDetail> {
  const { data } = await staffClient.get(`/staff/cancellation-requests/${id}/`);
  return data;
}

export async function getCancellationRequestSummary(): Promise<StaffCancellationRequestSummary> {
  const { data } = await staffClient.get("/staff/cancellation-requests/summary/");
  return data;
}

/** Approve: cancels the booking and raises the payout.
 *
 *  Takes no amount — the figures were frozen when the customer submitted, and
 *  approving honours them. That is deliberate: staff decide, they do not price. */
export async function approveCancellation(id: number, note: string) {
  const { data } = await staffClient.post<{
    request: StaffCancellationRequestDetail;
    refund: StaffRefund | null;
  }>(`/staff/cancellation-requests/${id}/approve/`, { note });
  return data;
}

export async function rejectCancellation(id: number, note: string) {
  const { data } = await staffClient.post<StaffCancellationRequestDetail>(
    `/staff/cancellation-requests/${id}/reject/`,
    { note },
  );
  return data;
}

// ── Refund register ───────────────────────────────────────────────────────

export async function getRefunds(params: {
  page?: number;
  status?: string;
  reason?: string;
  search?: string;
  from?: string;
  to?: string;
}): Promise<Paginated<StaffRefund>> {
  const { data } = await staffClient.get("/staff/refunds/", { params });
  return data;
}

export async function getRefundSummary(): Promise<StaffRefundSummary> {
  const { data } = await staffClient.get("/staff/refunds/summary/");
  return data;
}

/** Raise a refund by hand: overpayment, duplicate settlement, goodwill.
 *  Cancellation refunds cannot be created here — they come from approving a
 *  request, so the charge schedule can never be bypassed by typing a number. */
export async function createRefund(payload: StaffRefundCreate): Promise<StaffRefund> {
  const { data } = await staffClient.post("/staff/refunds/", payload);
  return data;
}

export async function markRefundPaid(
  id: number,
  payload: { method: string; reference_no: string; note?: string },
): Promise<StaffRefund> {
  const { data } = await staffClient.post(`/staff/refunds/${id}/mark-paid/`, payload);
  return data;
}

export async function voidRefund(id: number, note: string): Promise<StaffRefund> {
  const { data } = await staffClient.post(`/staff/refunds/${id}/void/`, { note });
  return data;
}

/** The register as a file. PDF to file, CSV to reconcile against the gateway
 *  settlement — the person doing that works in a spreadsheet. */
export async function downloadRefundRegister(params: {
  from?: string;
  to?: string;
  status?: string;
  export?: "csv";
}): Promise<Blob> {
  const { data } = await staffClient.get("/staff/refunds/register/", {
    params,
    responseType: "blob",
  });
  return data;
}

// ── Cancelling on a customer's behalf, and cancelling a sailing ───────────

export async function getStaffCancelQuote(bookingId: number) {
  const { data } = await staffClient.get<{
    allowed: boolean;
    block_reason: string | null;
    tier_label: string;
    charge_percent: string;
    paid_amount: string;
    cancellation_charge: string;
    refund_amount: string;
    shortfall_amount: string;
    suggests_group: boolean;
    booking_type: "individual" | "group";
  }>(`/staff/bookings/${bookingId}/cancel/`);
  return data;
}

export async function staffCancelBooking(
  bookingId: number,
  payload: {
    reason_code: string;
    reason_note?: string;
    waive_charge?: boolean;
    refund_method?: string;
    refund_account_name?: string;
    refund_account_number?: string;
    bank_name?: string;
    branch_name?: string;
  },
): Promise<StaffCancellationRequestDetail> {
  const { data } = await staffClient.post(`/staff/bookings/${bookingId}/cancel/`, payload);
  return data;
}

/** Cancel an entire departure (weather, technical, minimum pax not met).
 *
 *  Always preview first: `dry_run` returns the counts and the total to be
 *  refunded without touching anything. The destructive call must echo the
 *  package id back, so a bulk action that cancels dozens of holidays cannot
 *  happen on one stray click. */
export async function cancelDeparture(
  packageId: number,
  payload: { reason_note: string; dry_run: boolean; confirm_package_id?: number },
): Promise<StaffDepartureCancelResult> {
  const { data } = await staffClient.post(
    `/staff/packages/${packageId}/cancel-departure/`,
    payload,
  );
  return data;
}

// ── Charge schedule ───────────────────────────────────────────────────────

export async function getCancellationRules(): Promise<StaffCancellationRule[]> {
  const { data } = await staffClient.get("/staff/cancellation-rules/");
  return data;
}

export async function updateCancellationRule(
  id: number,
  payload: Partial<StaffCancellationRule>,
): Promise<StaffCancellationRule> {
  const { data } = await staffClient.patch(`/staff/cancellation-rules/${id}/`, payload);
  return data;
}
