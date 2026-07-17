import { apiClient } from "./client";

export type InquiryType = "general" | "family" | "corporate" | "charter";

export const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
  { value: "general", label: "General inquiry" },
  { value: "family", label: "Family trip" },
  { value: "corporate", label: "Corporate / group trip" },
  { value: "charter", label: "Full ship charter" },
];

export interface ContactMessageRequest {
  name: string;
  email?: string;
  phone?: string;
  inquiry_type?: InquiryType;
  message: string;
  departure_date?: string; // ISO date
  guests?: number;
}

export interface ContactMessageResponse extends ContactMessageRequest {
  id: number;
}

/** Submit an inquiry from the public contact form. The backend stores it for
 * the staff dashboard and emails a notification to the reservations inbox. */
export async function submitContactMessage(
  payload: ContactMessageRequest,
): Promise<ContactMessageResponse> {
  const { data } = await apiClient.post<ContactMessageResponse>(
    "/contact-messages/",
    payload,
  );
  return data;
}
