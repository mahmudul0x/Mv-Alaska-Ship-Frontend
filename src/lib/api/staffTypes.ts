import type { BookingStatus, KidChargeType, KidDetail, Money, PaymentType } from "./types";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type GuideReportDensity = "compact" | "normal" | "large";

export interface StaffShip {
  id: number;
  name: string;
  status: string;
  /** Helpline numbers as stored (comma-separated); "" means use the default. */
  authority_phones: string;
  /** Resolved list actually printed on the PDFs (ship's, or system default). */
  authority_phone_list: string[];
  /** Inbox for website contact-form messages; "" means use the system default. */
  contact_notify_email: string;
  /** Guide report PDF text size / rows-per-page. */
  guide_report_density: GuideReportDensity;
}

export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactInquiryType = "general" | "family" | "corporate" | "charter";

export interface StaffContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  inquiry_type: ContactInquiryType;
  /** Human label for inquiry_type, e.g. "Full ship charter". */
  inquiry_type_display: string;
  message: string;
  departure_date: string | null;
  guests: number | null;
  status: ContactMessageStatus;
  created_at: string;
}

export type PackageStatus = "draft" | "open" | "closed" | "completed" | "cancelled";

export interface StaffPackage {
  id: number;
  ship: number;
  ship_name: string;
  start_date: string;
  end_date: string;
  booking_cutoff_datetime: string | null;
  adult_price: Money;
  status: PackageStatus;
  is_booking_open: boolean;
  marketing_title: string;
  marketing_description: string;
  hero_image: string | null;
  highlights: string[];
  bookings_count: number | null;
  paid_total: Money | null;
  due_total: Money | null;
  rooms_total: number | null;
  is_bookable: boolean;
}

export interface StaffPackageWrite {
  ship: number;
  start_date: string;
  end_date: string;
  adult_price: string;
  status: PackageStatus;
  is_booking_open: boolean;
  booking_cutoff_datetime?: string | null;
  marketing_title?: string;
  marketing_description?: string;
  highlights?: string[];
}

export interface StaffPayment {
  id: number;
  booking: number;
  booking_code: string;
  amount: Money;
  payment_type: PaymentType;
  gateway: string;
  transaction_id: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface StaffStatusLog {
  old_status: string;
  new_status: string;
  changed_by_username: string | null;
  created_at: string;
}

// One cabin of a staff-viewed booking, with that cabin's own party.
export interface StaffBookingRoom {
  room: number;
  room_number: string;
  room_type: string;
  adult_count: number;
  kid_details: KidDetail[];
  room_subtotal: Money;
  is_active: boolean;
}

export interface StaffBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  phone: string;
  email: string;
  package: number;
  package_title: string;
  // Every cabin the booking holds (a family may take several).
  rooms: StaffBookingRoom[];
  // Comma-joined room numbers for compact table columns, e.g. "201, 202".
  room_number: string;
  total_pax: number;
  /** Customer's free-text note from the booking wizard (dietary, accessibility,
   * anniversary, etc.). Empty string when none was given. */
  special_requests: string;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  status: BookingStatus;
  /** Money is owed back to this customer (cancelled with a deposit, or a
   * payment settled on a dead session). Refunds are manual — staff clear
   * the flag once the customer has been paid back. */
  refund_required: boolean;
  refund_note: string;
  created_at: string;
}

export interface StaffBookingDetail extends StaffBooking {
  payments: StaffPayment[];
  status_logs: StaffStatusLog[];
}

export interface StaffBookingSummary {
  count: number;
  /** Active bookings only — cancelled money is reported separately. */
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  /** Deposits sitting on cancelled bookings (the refund conversation). */
  cancelled_paid_amount: Money;
  refunds_owed_count: number;
  fully_paid_rate: string;
  by_status: Record<BookingStatus, number>;
}

export interface StaffRoom {
  id: number;
  ship: number;
  room_type: number;
  room_type_name: string;
  room_number: string;
  floor_number: number | null;
}

export interface StaffRoomImage {
  id: number;
  room: number;
  room_number: string;
  /** Storage URL (Cloudinary CDN in production) — the upload field itself is write-only. */
  image_url: string;
  caption: string;
  sort_order: number;
}

// ── Showcase cabins (public /cabins pages, staff-managed) ─────────────────

export interface StaffCabinImage {
  id: number;
  cabin: number;
  /** Storage URL (Cloudinary CDN in production) — the upload field itself is write-only. */
  image_url: string;
  caption: string;
  /** The public card/hero image. Only one per cabin — setting it clears the previous main. */
  is_main: boolean;
  sort_order: number;
}

export interface StaffCabin {
  id: number;
  ship: number;
  ship_name: string;
  room_type: number | null;
  room_type_name: string | null;
  /** Derived from the room type, e.g. "3 Adults + 1 Kids". */
  occupancy: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  size_label: string;
  features: string[];
  amenities: { label: string; value: string }[];
  highlights: { title: string; desc: string }[];
  is_active: boolean;
  sort_order: number;
  images: StaffCabinImage[];
}

export interface StaffCabinWrite {
  ship: number;
  room_type: number | null;
  slug?: string;
  name: string;
  tagline?: string;
  description?: string;
  size_label?: string;
  features?: string[];
  amenities?: { label: string; value: string }[];
  highlights?: { title: string; desc: string }[];
  is_active?: boolean;
  sort_order?: number;
}

// ── Public gallery (/gallery page, staff-managed) ─────────────────────────

export interface StaffGalleryImage {
  id: number;
  ship: number;
  ship_name: string;
  /** Storage URL (Cloudinary CDN in production) — the upload field itself is write-only. */
  image_url: string;
  /** Text staff write on the photo; shown on the public gallery. */
  caption: string;
  /** false hides the photo from the website without deleting it. */
  is_active: boolean;
  sort_order: number;
}

export type RoomAvailability = "available" | "booked" | "blocked" | "unavailable";

// The booking that holds one room in the package room-map. adult_count/
// kid_details are THIS room's party; total_pax is the whole booking's.
export interface StaffPackageRoomBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  phone: string;
  adult_count: number;
  kid_details: KidDetail[];
  /** This room's pax. */
  room_pax: number;
  /** The whole booking's pax across all its rooms. */
  total_pax: number;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  status: BookingStatus;
}

export interface StaffPackageRoom {
  id: number;
  room_id: number;
  room_number: string;
  floor_number: number | null;
  room_type: { id: number; name: string; max_adults: number; max_kids: number; base_price: Money };
  is_available: boolean;
  availability: RoomAvailability;
  booking: StaffPackageRoomBooking | null;
  /** Admin hold: withheld from sale on a live sailing. Shown to customers as
   *  plain "unavailable" (the reason never leaves the dashboard). */
  is_blocked: boolean;
  /** Internal note on why the room is held; "" when none was given. */
  block_reason: string;
  blocked_by_username: string | null;
  blocked_at: string | null;
}

export interface StaffKidRule {
  id: number;
  min_age: number;
  max_age: number;
  charge_type: KidChargeType;
  amount: Money | null;
}

export type FoodMenuDay = "day_1" | "day_2" | "day_3";
export type FoodMealType = "breakfast" | "snacks" | "lunch" | "dinner";

export interface StaffFoodMenuItem {
  id: number;
  ship: number;
  ship_name: string;
  day: FoodMenuDay;
  meal_type: FoodMealType;
  name: string;
  order: number;
  is_active: boolean;
}

export interface StaffFoodMenuItemWrite {
  ship: number;
  day: FoodMenuDay;
  meal_type: FoodMealType;
  name: string;
  order?: number;
  is_active?: boolean;
}

export interface StaffInvoice {
  id: number;
  /** Issued number, e.g. "INV-2026-00042" — stored, gapless, unique. */
  number: string;
  booking: number;
  booking_code: string;
  payment: number | null;
  /** The money this invoice states, frozen when it was issued. The booking's
   *  live totals move as the customer pays; the invoice does not. */
  total_amount: string;
  paid_amount: string;
  due_amount: string;
  booking_status: string;
  sent_via: string;
  sent_at: string | null;
  /** Authenticated API route — fetch via openInvoicePdf(), not a bare href. */
  pdf_url: string | null;
  created_at: string;
}

export interface StaffOverviewRecentBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  package_title: string;
  room_number: string;
  status: BookingStatus;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  created_at: string;
}

export interface StaffOverviewRecentPayment {
  id: number;
  booking_code: string;
  amount: Money;
  gateway: string;
  paid_at: string | null;
}

export interface StaffOverviewShip {
  ship_id: number;
  ship_name: string;
  upcoming_packages: number;
  active_bookings: number;
  paid_total: Money;
  due_total: Money;
}

export interface StaffOverviewPackage {
  id: number;
  title: string;
  start_date: string;
  status: PackageStatus;
  is_bookable: boolean;
  paid_total: Money;
  due_total: Money;
  bookings_count: number;
  occupancy_pct: string;
}

export interface StaffOverview {
  upcoming_packages: number;
  active_bookings: number;
  total_collected: Money;
  total_due: Money;
  total_revenue_expected: Money;
  collection_rate: string;
  pending_payment_bookings: number;
  /** Refunds-owed queue: money the company owes back to customers. */
  refunds_owed_count: number;
  refunds_owed_paid_total: Money;
  bookings_today: number;
  bookings_this_week: number;
  bookings_by_status: Record<BookingStatus, number>;
  recent_bookings: StaffOverviewRecentBooking[];
  recent_payments: StaffOverviewRecentPayment[];
  by_ship: StaffOverviewShip[];
  packages: StaffOverviewPackage[];
}
