import type { BookingStatus, KidChargeType, KidDetail, Money, PaymentType } from "./types";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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

export interface StaffBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  phone: string;
  email: string;
  package: number;
  package_title: string;
  room: number;
  room_number: string;
  adult_count: number;
  kid_details: KidDetail[];
  total_pax: number;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
  status: BookingStatus;
  created_at: string;
}

export interface StaffBookingDetail extends StaffBooking {
  payments: StaffPayment[];
  status_logs: StaffStatusLog[];
}

export interface StaffBookingSummary {
  count: number;
  total_amount: Money;
  paid_amount: Money;
  due_amount: Money;
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

export type RoomAvailability = "available" | "booked" | "unavailable";

export interface StaffPackageRoomBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  phone: string;
  adult_count: number;
  kid_details: KidDetail[];
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
  booking: number;
  booking_code: string;
  sent_via: string;
  sent_at: string | null;
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
  bookings_today: number;
  bookings_this_week: number;
  bookings_by_status: Record<BookingStatus, number>;
  recent_bookings: StaffOverviewRecentBooking[];
  recent_payments: StaffOverviewRecentPayment[];
  by_ship: StaffOverviewShip[];
  packages: StaffOverviewPackage[];
}
