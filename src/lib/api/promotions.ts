import { apiClient } from "./client";

/** How often one visitor is shown the modal. Decided by staff, enforced here —
 *  there is no visitor identity for the server to enforce it against. */
export type ModalFrequency = "once" | "daily" | "every_visit";

/** A staff-authored announcement.
 *
 *  Distinct from `PackageOffer`, which is a discount that changes what someone
 *  is charged. This only changes what they are shown. The two are separate all
 *  the way down so that editing a banner can never reprice a cabin.
 *
 *  The endpoint returns only promotions that are live right now, so there is
 *  no `is_active`, no start date and no end date to check on this side. */
export type Promotion = {
  id: number;
  badge_label: string;
  title: string;
  subtitle: string;
  /** Longer copy. Only the modal has room for it. */
  body: string;
  image_url: string | null;
  cta_label: string;
  /** Already resolved by the server — a linked package beats a typed URL. */
  cta_url: string;
  show_in_modal: boolean;
  show_in_hero: boolean;
  show_in_home_section: boolean;
  modal_frequency: ModalFrequency;
  modal_delay_seconds: number;
  /** Part of the dismissal key, so re-publishing edited copy reaches someone
   *  who already closed the previous version. */
  updated_at: string;
};

export async function getPromotions(): Promise<Promotion[]> {
  const { data } = await apiClient.get<Promotion[]>("/promotions/");
  return data;
}
