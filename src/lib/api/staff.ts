import { staffClient } from "./staffClient";
import type { RoomType } from "./types";
import type {
  Paginated,
  StaffBooking,
  StaffBookingDetail,
  StaffBookingSummary,
  StaffFoodMenuItem,
  StaffFoodMenuItemWrite,
  StaffInvoice,
  StaffKidRule,
  StaffOverview,
  StaffPackage,
  StaffPackageRoom,
  StaffPackageWrite,
  StaffPayment,
  StaffRoom,
} from "./staffTypes";

// ── Auth ──────────────────────────────────────────────────────────────────
export async function staffLogin(username: string, password: string) {
  const { data } = await staffClient.post<{
    access: string;
    refresh: string;
    user: { username: string; first_name: string; is_staff: boolean };
  }>("/staff/login/", { username, password });
  return data;
}

export async function staffLogout(refresh: string) {
  await staffClient.post("/staff/logout/", { refresh });
}

// ── Overview ──────────────────────────────────────────────────────────────
export async function getStaffOverview(): Promise<StaffOverview> {
  const { data } = await staffClient.get<StaffOverview>("/staff/overview/");
  return data;
}

// ── Packages ──────────────────────────────────────────────────────────────
export async function getStaffPackages(page = 1): Promise<Paginated<StaffPackage>> {
  const { data } = await staffClient.get("/staff/packages/", { params: { page } });
  return data;
}

export async function createStaffPackage(payload: StaffPackageWrite): Promise<StaffPackage> {
  const { data } = await staffClient.post("/staff/packages/", payload);
  return data;
}

export async function updateStaffPackage(
  id: number,
  payload: Partial<StaffPackageWrite>,
): Promise<StaffPackage> {
  const { data } = await staffClient.patch(`/staff/packages/${id}/`, payload);
  return data;
}

export async function deleteStaffPackage(id: number) {
  await staffClient.delete(`/staff/packages/${id}/`);
}

export async function togglePackageBooking(id: number, open: boolean) {
  await staffClient.post(`/staff/packages/${id}/${open ? "open" : "close"}-booking/`);
}

export async function generatePackageRooms(id: number) {
  const { data } = await staffClient.post<{ detail: string }>(
    `/staff/packages/${id}/generate-rooms/`,
  );
  return data;
}

export async function getStaffPackageRooms(id: number): Promise<StaffPackageRoom[]> {
  const { data } = await staffClient.get(`/staff/packages/${id}/rooms/`);
  return data;
}

export async function downloadGuideReport(id: number): Promise<Blob> {
  const { data } = await staffClient.get(`/staff/packages/${id}/guide-report/`, {
    responseType: "blob",
  });
  return data;
}

// ── Bookings ──────────────────────────────────────────────────────────────
export interface BookingFilters {
  page?: number;
  package?: number;
  status?: string;
  search?: string;
  /** "true" narrows to the refunds-owed queue (cancelled with money on it). */
  refund_required?: "true" | "false";
}

export async function getStaffBookings(
  filters: BookingFilters = {},
): Promise<Paginated<StaffBooking>> {
  const { data } = await staffClient.get("/staff/bookings/", { params: filters });
  return data;
}

export async function getStaffBookingsSummary(
  filters: Omit<BookingFilters, "page"> = {},
): Promise<StaffBookingSummary> {
  const { data } = await staffClient.get("/staff/bookings/summary/", { params: filters });
  return data;
}

export async function getStaffBooking(id: number): Promise<StaffBookingDetail> {
  const { data } = await staffClient.get(`/staff/bookings/${id}/`);
  return data;
}

export async function updateStaffBooking(
  id: number,
  payload: Partial<
    Pick<
      StaffBooking,
      "status" | "customer_name" | "phone" | "email" | "refund_required" | "refund_note"
    >
  >,
): Promise<StaffBookingDetail> {
  const { data } = await staffClient.patch(`/staff/bookings/${id}/`, payload);
  return data;
}

export interface StaffBookingCreatePayload {
  package_id: number;
  room_id: number;
  adult_count: number;
  kid_details: { age: number }[];
  customer_name: string;
  phone: string;
  email: string;
}

export async function createStaffBooking(payload: StaffBookingCreatePayload) {
  const { data } = await staffClient.post("/staff/bookings/", payload);
  return data;
}

// ── Payments ──────────────────────────────────────────────────────────────
export async function createStaffPayment(payload: {
  booking: number;
  amount: string;
  payment_type: "full" | "partial";
  gateway?: string;
}): Promise<StaffPayment> {
  const { data } = await staffClient.post("/staff/payments/", payload);
  return data;
}

// ── Invoices ──────────────────────────────────────────────────────────────
export async function getStaffInvoices(booking?: number): Promise<Paginated<StaffInvoice>> {
  const { data } = await staffClient.get("/staff/invoices/", { params: { booking } });
  return data;
}

export async function resendInvoice(id: number) {
  await staffClient.post(`/staff/invoices/${id}/resend/`);
}

/** Open an invoice PDF in a new tab.
 *
 * The PDF is served by an authenticated endpoint, so it must be fetched
 * through staffClient (which carries the JWT) — a plain <a href> sends no
 * Authorization header and would 401. Previously the link pointed straight at
 * the media file, which was served with no access check at all. */
export async function openInvoicePdf(id: number) {
  const { data } = await staffClient.get(`/staff/invoices/${id}/pdf/`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data as Blob);
  window.open(url, "_blank", "noopener");
  // Give the new tab time to load before releasing the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ── Settings resources ────────────────────────────────────────────────────
export async function getStaffRoomTypes(): Promise<RoomType[]> {
  const { data } = await staffClient.get("/staff/room-types/");
  return data;
}

export async function updateStaffRoomType(id: number, payload: Partial<RoomType>) {
  const { data } = await staffClient.patch(`/staff/room-types/${id}/`, payload);
  return data;
}

export async function getStaffRooms(page = 1): Promise<Paginated<StaffRoom>> {
  const { data } = await staffClient.get("/staff/rooms/", { params: { page, page_size: 100 } });
  return data;
}

export async function getStaffKidRules(): Promise<StaffKidRule[]> {
  const { data } = await staffClient.get("/staff/kid-pricing-rules/");
  return data;
}

export async function updateStaffKidRule(id: number, payload: Partial<StaffKidRule>) {
  const { data } = await staffClient.patch(`/staff/kid-pricing-rules/${id}/`, payload);
  return data;
}

export async function getStaffFoodMenuItems(): Promise<StaffFoodMenuItem[]> {
  const { data } = await staffClient.get("/staff/food-menu-items/");
  return data;
}

export async function createStaffFoodMenuItem(
  payload: StaffFoodMenuItemWrite,
): Promise<StaffFoodMenuItem> {
  const { data } = await staffClient.post("/staff/food-menu-items/", payload);
  return data;
}

export async function updateStaffFoodMenuItem(
  id: number,
  payload: Partial<StaffFoodMenuItemWrite>,
): Promise<StaffFoodMenuItem> {
  const { data } = await staffClient.patch(`/staff/food-menu-items/${id}/`, payload);
  return data;
}

export async function deleteStaffFoodMenuItem(id: number) {
  await staffClient.delete(`/staff/food-menu-items/${id}/`);
}
