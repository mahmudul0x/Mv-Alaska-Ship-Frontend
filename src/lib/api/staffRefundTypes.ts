// Staff-side shapes for the cancellation queue and the refund register.
// Money is Decimal-as-string throughout — see money.ts, never Number() it for
// display.
import type { Money } from "./types";

export type CancellationRequestStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface StaffCancellationRequest {
  id: number;
  booking_code: string;
  customer_name: string;
  phone: string;
  package_start_date: string;
  /** The customer filed in time but nobody has decided and the ship has now
   *  sailed. The frozen charge still stands — this is our backlog, not theirs. */
  departure_passed: boolean;
  source: "customer" | "staff";
  status: CancellationRequestStatus;
  status_label: string;
  reason_code: string;
  reason_label: string;
  reason_note: string;
  booking_type: string;
  tier_label: string;
  total_amount: Money;
  paid_amount: Money;
  cancellation_charge: Money;
  refund_amount: Money;
  /** Charge the deposit did not cover. Recorded, never billed. */
  shortfall_amount: Money;
  refund_method: string;
  /** Masked in the list — the queue is the screen most likely to be on a shared
   *  desk. The full number is on the detail view. */
  refund_account_masked: string;
  requested_at: string;
  decided_at: string | null;
  decision_note: string;
}

export interface StaffCancellationRequestDetail extends StaffCancellationRequest {
  refund_account_number: string;
  refund_account_name: string;
  bank_name: string;
  branch_name: string;
  policy_snapshot: Record<string, unknown>;
  decided_by_name: string;
  refund_id: number | null;
}

export interface StaffCancellationRequestSummary {
  pending_count: number;
  pending_refund_total: Money;
  departed_undecided_count: number;
}

export type RefundStatus = "pending" | "paid" | "rejected" | "void";

export type RefundReason =
  | "customer_cancellation"
  | "operator_cancellation"
  | "overpayment"
  | "duplicate_payment"
  | "goodwill";

export interface StaffRefund {
  id: number;
  booking_code: string;
  customer_name: string;
  phone: string;
  package_start_date: string;
  reason: RefundReason;
  reason_label: string;
  amount: Money;
  cancellation_charge: Money;
  status: RefundStatus;
  status_label: string;
  method: string;
  method_label: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  branch_name: string;
  reference_no: string;
  note: string;
  created_by_name: string;
  processed_by_name: string;
  paid_at: string | null;
  created_at: string;
  age_days: number;
  /** Pending past the SLA the customer was promised — a broken promise, not
   *  merely a task. */
  overdue: boolean;
}

export interface StaffRefundCreate {
  booking_code: string;
  reason: Exclude<RefundReason, "customer_cancellation">;
  amount: string;
  method?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  branch_name?: string;
  note: string;
  allow_outside_claim_window?: boolean;
}

export interface StaffRefundSummary {
  /** Money promised and not yet sent — a debt the company is carrying. */
  liability_count: number;
  liability_total: Money;
  paid_count: number;
  paid_total: Money;
  overdue_count: number;
  overdue_total: Money;
}

export interface StaffCancellationRule {
  id: number;
  ship: number | null;
  ship_name: string | null;
  days_before_start: number;
  label: string;
  individual_percent: string;
  group_percent: string;
  is_active: boolean;
}

export interface StaffDepartureCancelResult {
  package_id: number;
  bookings: number;
  pax: number;
  refund_total: Money;
  refunds_raised: number;
  dry_run: boolean;
}
