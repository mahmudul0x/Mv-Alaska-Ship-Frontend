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
export type FoodMealType = "breakfast" | "snacks" | "lunch" | "dinner";

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

// One room within a booking request: which cabin, and that cabin's own party.
// A booking may hold several of these (a family taking 2–3 cabins).
export interface BookingRoomInput {
  room_id: number;
  adult_count: number;
  kid_details?: KidDetail[];
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

export type BookingStatus =
  | "pending"
  | "partially_paid"
  | "fully_paid"
  | "cancelled"
  | "completed";

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

export interface ApiFieldErrors {
  [field: string]: string[];
}

export interface ApiError {
  status: number;
  detail?: string;
  code?: string; // e.g. "room_unavailable"
  fieldErrors?: ApiFieldErrors;
}
