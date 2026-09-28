import { staffClient } from "./staffClient";
import type { ModalFrequency } from "./promotions";

/** A promotion as the dashboard sees it: every field, plus `is_live`.
 *
 *  `is_live` is computed server-side and is the only honest answer to "is this
 *  showing right now?" — it folds together the manual switch, the schedule and
 *  whether a linked sailing has already departed. Recomputing it in the
 *  browser would be a second definition, free to drift from the one the public
 *  endpoint actually uses. */
export type StaffPromotion = {
  id: number;
  ship: number;
  ship_name: string;
  badge_label: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string | null;
  cta_label: string;
  cta_url: string;
  linked_package: number | null;
  linked_package_label: string;
  show_in_modal: boolean;
  show_in_hero: boolean;
  show_in_home_section: boolean;
  modal_frequency: ModalFrequency;
  modal_delay_seconds: number;
  /** ISO, or null for "start immediately" / "run until switched off". */
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
  is_live: boolean;
  created_at: string;
  updated_at: string;
};

/** What the form sends. `image` is a File only when staff picked a new one —
 *  omitting it leaves the existing artwork alone, which is what an edit that
 *  only fixes a typo should do. */
export type StaffPromotionWrite = Partial<
  Omit<StaffPromotion, "id" | "ship_name" | "image_url" | "is_live" | "created_at" | "updated_at" | "linked_package_label">
> & { image?: File | null };

export async function getStaffPromotions(): Promise<StaffPromotion[]> {
  const { data } = await staffClient.get<StaffPromotion[]>("/staff/promotions/");
  return data;
}

/** Multipart always, not JSON-unless-there-is-a-file.
 *
 *  One code path means the "with image" and "without image" cases cannot
 *  diverge — and a null/empty value has to be sent as the empty string rather
 *  than skipped, or clearing a field in the dashboard would silently leave the
 *  old value in place. */
function toFormData(payload: StaffPromotionWrite): FormData {
  const form = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (key === "image") continue;
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      form.append(key, value ? "true" : "false");
      continue;
    }
    form.append(key, value === null ? "" : String(value));
  }

  if (payload.image instanceof File) form.append("image", payload.image);

  return form;
}

export async function createStaffPromotion(
  payload: StaffPromotionWrite,
): Promise<StaffPromotion> {
  const { data } = await staffClient.post("/staff/promotions/", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateStaffPromotion(
  id: number,
  payload: StaffPromotionWrite,
): Promise<StaffPromotion> {
  const { data } = await staffClient.patch(
    `/staff/promotions/${id}/`,
    toFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function deleteStaffPromotion(id: number): Promise<void> {
  await staffClient.delete(`/staff/promotions/${id}/`);
}
