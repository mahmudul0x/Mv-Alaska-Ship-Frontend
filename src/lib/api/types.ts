// Types mirroring the Django REST backend's JSON shapes exactly.
// Money is always a Decimal serialized as a string (e.g. "11000.00") —
// never coerce with Number()/parseFloat() directly; use src/lib/money.ts.
export type Money = string;

export interface ShipMini {
  id: number;
  name: string;
}

export type BookingStatusFilter = "open" | "closed";

export interface Package {
  id: number;
  ship: ShipMini;
  start_date: string; // ISO date
  end_date: string;
  nights: number;
  days: number; // = nights + 1 unless admin-overridden; render as-is
  adult_price: Money;
  /** Fixed extra charge per foreign guest, on top of their ordinary fare.
   *  "0.00" means foreign nationals pay the same as local guests. */
  foreigner_adult_surcharge: Money;
  foreigner_kid_surcharge: Money;
  booking_cutoff_datetime: string; // ISO datetime
  is_bookable: boolean;
  booking_status: BookingStatusFilter;
  marketing_title: string;
  marketing_description: string;
  hero_image: string | null;
  highlights: string[];
}

export type KidChargeType = "free" | "fixed" | "full_adult";

export interface KidPricingRule {
  min_age: number;
  max_age: number;
  charge_type: KidChargeType;
  amount: Money | null;
}

export interface PackageDetail extends Package {
  kid_pricing_rules: KidPricingRule[];
}

export interface RoomType {
  id: number;
  name: string;
  max_adults: number;
  max_kids: number;
  base_price: Money;
}

export type RoomAvailability = "available" | "booked" | "unavailable";

export interface RoomImage {
  id: number;
  image: string;
  caption: string;
  sort_order: number;
}

export interface PackageRoom {
  id: number;
  room_number: string;
  floor_number: number | null;
  room_type: RoomType;
  images: RoomImage[];
  availability: RoomAvailability;
}

export interface CalendarPackageEntry {
  id: number;
  ship_name: string;
  start_date: string;
  end_date: string;
  is_bookable: boolean;
}

export interface CalendarDateEntry {
  date: string; // ISO date
  packages: CalendarPackageEntry[];
}

export interface CalendarResponse {
  year: number;
  month: number;
  dates: CalendarDateEntry[];
}

export interface ShipLayoutRoom {
  id: number;
  room_number: string;
  floor_number: number | null;
  room_type: RoomType;
}

export interface ShipLayoutFloor {
  floor_number: number | null;
  rooms: ShipLayoutRoom[];
}

export interface ShipLayout {
  id: number;
  name: string;
  layout_image: string | null;
  total_rooms: number;
  floors: ShipLayoutFloor[];
}

export type FoodMenuDay = "day_1" | "day_2" | "day_3";
export type FoodMealType = "breakfast" | "snacks" | "lunch" | "evening_snacks" | "dinner";

export interface FoodMenuMeal {
  meal_type: FoodMealType;
  meal_type_label: string;
  items: string[];
}

export interface FoodMenuDayGroup {
  day: FoodMenuDay;
  day_label: string;
  meals: FoodMenuMeal[];
}

export interface FoodMenu {
  id: number;
  name: string;
  layout_image: string | null;
  total_rooms: number;
  note: string;
  days: FoodMenuDayGroup[];
}

export interface KidDetail {
  age: number;
}

/** A foreign national travelling in a cabin — a SUBSET of that cabin's pax,
 *  never an extra person. Each one adds the package's fixed foreigner
 *  surcharge to the room total.
 *
 *  Only `passport_number` is required; the rest is captured when the guest
 *  offers it. On responses from the public booking endpoint the passport is
 *  MASKED ("****4567") — the full number never leaves the server to an
 *  unauthenticated caller. */
export interface ForeignGuest {
  guest_type: "adult" | "kid";
  passport_number: string;
  full_name?: string;
  /** ISO 3166-1 alpha-2, e.g. "US". Rejected server-side if not a real code. */
  nationality?: string;
  /** ISO date. Must be in the future — an expired passport cannot board. */
  passport_expiry?: string;
}

// One room within a booking request: which cabin, and that cabin's own party.
// A booking may hold several of these (a family taking 2–3 cabins).
export interface BookingRoomInput {
  room_id: number;
  adult_count: number;
  kid_details?: KidDetail[];
  foreign_guests?: ForeignGuest[];
}

export interface BookingQuoteRequest {
  package_id: number;
  rooms: BookingRoomInput[];
}

export interface PriceBreakdownKid {
  age: number;
  charge: Money;
}

// The priced breakdown for a SINGLE room. `room_number` is present on quote/
// create responses so the UI can label each cabin's line items.
export interface RoomPriceBreakdown {
  room_base: Money;
  adult_price: Money;
  adult_count: number;
  adults_subtotal: Money;
  kids: PriceBreakdownKid[];
  kids_subtotal: Money;
  // Foreign-national surcharge for this cabin. Counts AND rates come from the
  // server so the summary line reads "2 × ৳3,000" without the client ever
  // computing money. Zero on every domestic booking.
  foreign_adult_count: number;
  foreign_kid_count: number;
  foreigner_adult_surcharge: Money;
  foreigner_kid_surcharge: Money;
  foreigner_subtotal: Money;
  total: Money;
  room_number?: string;
}

// The whole (multi-room) booking's price: each room's breakdown plus the grand
// total the customer is charged — one payment, one invoice.
export interface PriceBreakdown {
  rooms: RoomPriceBreakdown[];
  grand_total: Money;
}

export interface BookingCreateRequest extends BookingQuoteRequest {
  customer_name: string;
  phone: string;
  email: string;
  // Optional free-text note (dietary, accessibility, etc.). Capped at 1000
  // chars server-side.
  special_requests?: string;
}

export type BookingStatus = "pending" | "partially_paid" | "fully_paid" | "cancelled" | "completed";

export interface BookingPackageMini {
  id: number;
  start_date: string;
  end_date: string;
}

// One cabin of a confirmed booking, with that cabin's own party.
export interface BookingRoomPublic {
  room_number: string;
  room_type: string;
  adult_count: number;
  kid_details: KidDetail[];
  /** Passports are masked on this endpoint — it is reached with a booking
   *  code alone, with no login. */
  foreign_guests: ForeignGuest[];
  room_subtotal: Money;
}

export interface BookingPublic {
  booking_code: string;
  status: BookingStatus;
  package: BookingPackageMini;
  // Every cabin the booking holds (one payment, one invoice for all of them).
  rooms: BookingRoomPublic[];
  total_pax: number;
  customer_name: string;
  phone: string;
  email: string;
  special_requests: string;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  // Server-computed floor for the FIRST payment (Package.min_deposit_percent
  // of the total). "0.01" once a deposit exists — top-ups have no floor.
  min_first_payment: Money;
  /** The customer's open cancellation request, or null.
   *
   *  A pending request deliberately does NOT change `status` — the booking
   *  keeps its cabins until staff decide — so this is the only signal that one
   *  exists. Pages must use it to replace the "Cancel booking" action, or the
   *  customer sees an unchanged booking and assumes their request vanished. */
  pending_cancellation: CancellationRequestPublic | null;
  // Only present on the create (201) response — absent on GET retrieve.
  price_breakdown?: PriceBreakdown;
}

/** An issued invoice. The figures are what the invoice STATES — frozen when it
 *  was issued — not the booking's live totals, which keep moving as the
 *  customer pays. */
export interface BookingInvoice {
  number: string;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  sent_at: string | null;
  created_at: string;
  /** Bears this invoice's capability token; no auth header needed. */
  download_url: string;
}

export type PaymentType = "full" | "partial";

export interface PaymentInitiateRequest {
  payment_type: PaymentType;
  amount?: string;
}

export interface PaymentInitiateResponse {
  gateway_url: string;
  tran_id: string;
  amount: Money;
  payment_type: PaymentType;
}

// ── Showcase cabins (/cabins pages) — staff-managed marketing content ─────

export interface CabinImage {
  id: number;
  image: string;
  caption: string;
  is_main: boolean;
  sort_order: number;
}

/** Card payload for the /cabins grid. Deliberately price-free — pricing
 *  belongs to the booking flow, never the showcase pages. */
export interface CabinSummary {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  size_label: string;
  /** Display string derived from the linked RoomType, e.g. "3 Adults + 1 Kids". */
  occupancy: string;
  features: string[];
  main_image: CabinImage | null;
}

export interface CabinDetail extends CabinSummary {
  description: string;
  amenities: { label: string; value: string }[];
  highlights: { title: string; desc: string }[];
  images: CabinImage[];
}

// ── Public gallery (/gallery page) — staff-managed photos ─────────────────

export interface GalleryImage {
  id: number;
  image: string;
  caption: string;
  sort_order: number;
}

// ── Cancellations & refunds ───────────────────────────────────────────────

/** One row of the published cancellation-charge schedule. Served from
 *  /cancellation-policy/ so the policy page prints the same table the backend
 *  charges from — it used to be a hardcoded array that could silently drift. */
export interface CancellationTier {
  days_before_start: number;
  label: string;
  /** Percent as a decimal string, e.g. "35.00". */
  individual_percent: string;
  group_percent: string;
}

export interface CancellationPolicy {
  ship: string;
  /** Working days quoted to the customer for a payout. */
  refund_sla_days: number;
  tiers: CancellationTier[];
}

/** Why a booking cannot be cancelled online right now. Stable codes — the copy
 *  lives in the frontend so wording changes need no API change. */
export type CancellationBlockReason =
  | "already_cancelled"
  | "completed"
  | "in_progress"
  | "sailed"
  | "pending_request"
  | "payment_in_progress"
  | "no_policy";

/** What cancelling would cost. Every figure is computed server-side; the client
 *  never sends an amount and never does this arithmetic. */
export interface CancellationQuote {
  allowed: boolean;
  block_reason: CancellationBlockReason | null;
  window: "upcoming" | "in_progress" | "sailed";
  days_until_start: number;
  booking_type: "individual" | "group";
  tier_label: string;
  charge_percent: string;
  total_amount: Money;
  paid_amount: Money;
  cancellation_charge: Money;
  refund_amount: Money;
  forfeited_amount: Money;
  /** False when nothing has been paid — the booking is cancelled on the spot
   *  instead of queuing for a human decision. */
  requires_approval: boolean;
}

export interface CancellationPreview extends CancellationQuote {
  /** Signed proof of the figures shown. Submitted back so the server can
   *  detect that they moved (a tier boundary crossed, a stale tab) and refuse
   *  rather than charge something the customer never saw. Null when blocked. */
  quote_token: string | null;
  refund_sla_days: number;
  pending_request: CancellationRequestPublic | null;
}

export type CancellationReasonCode =
  | "plans_changed"
  | "medical"
  | "date_change"
  | "booked_by_mistake"
  | "other";

export type RefundMethod = "bkash" | "nagad" | "bank_transfer";

export interface CancellationRequestPayload {
  /** Last 4 digits of the phone on the booking — the second factor. */
  phone_confirm: string;
  reason_code: CancellationReasonCode;
  reason_note?: string;
  /** Omitted when nothing has been paid — there is no payout to arrange, and
   *  the server ignores these fields in that case. */
  refund_method?: RefundMethod;
  refund_account_name?: string;
  refund_account_number?: string;
  bank_name?: string;
  branch_name?: string;
  acknowledged_charge: boolean;
  quote_token: string;
}

export interface CancellationRequestPublic {
  id: number;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  status_label: string;
  reason_code: CancellationReasonCode;
  reason_label: string;
  tier_label: string;
  total_amount: Money;
  paid_amount: Money;
  cancellation_charge: Money;
  refund_amount: Money;
  refund_method: RefundMethod | "";
  refund_method_label: string;
  /** Masked ("•••••••5678") — enough to confirm the right wallet was entered. */
  refund_account_masked: string;
  requested_at: string;
  decided_at: string | null;
  decision_note: string;
}

export interface BookingLookupRequest {
  booking_code: string;
  phone_last4: string;
}

export interface ApiFieldErrors {
  [field: string]: string[];
}

export interface ApiError {
  status: number;
  detail?: string;
  code?: string; // e.g. "room_unavailable"
  fieldErrors?: ApiFieldErrors;
}
