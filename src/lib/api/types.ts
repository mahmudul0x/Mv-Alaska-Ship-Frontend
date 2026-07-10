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

export interface PackageRoom {
  id: number;
  room_number: string;
  floor_number: number | null;
  room_type: RoomType;
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

export interface BookingQuoteRequest {
  package_id: number;
  room_id: number;
  adult_count: number;
  kid_details?: KidDetail[];
}

export interface PriceBreakdownKid {
  age: number;
  charge: Money;
}

export interface PriceBreakdown {
  room_base: Money;
  adult_price: Money;
  adult_count: number;
  adults_subtotal: Money;
  kids: PriceBreakdownKid[];
  kids_subtotal: Money;
  total: Money;
}

export interface BookingCreateRequest extends BookingQuoteRequest {
  customer_name: string;
  phone: string;
  email: string;
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

export interface BookingPublic {
  booking_code: string;
  status: BookingStatus;
  package: BookingPackageMini;
  room_number: string;
  customer_name: string;
  phone: string;
  email: string;
  adult_count: number;
  kid_details: KidDetail[];
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  // Only present on the create (201) response — absent on GET retrieve.
  price_breakdown?: PriceBreakdown;
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

export interface ApiFieldErrors {
  [field: string]: string[];
}

export interface ApiError {
  status: number;
  detail?: string;
  code?: string; // e.g. "room_unavailable"
  fieldErrors?: ApiFieldErrors;
}
