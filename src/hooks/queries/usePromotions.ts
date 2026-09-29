import { useQuery } from "@tanstack/react-query";

import { getPromotions, type Promotion } from "@/lib/api/promotions";

export type PromotionSurface = "modal" | "top_bar" | "home_section";

/** Every promotion the server considers live right now.
 *
 *  Kept fresh for five minutes: a promotion is marketing copy, not a price or
 *  an availability count, so a visitor already on the page seeing last
 *  minute's version costs nothing — and refetching on every focus change would
 *  make the modal eligible to reopen each time someone switched tabs. */
export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: getPromotions,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

const WANTS: Record<PromotionSurface, (p: Promotion) => boolean> = {
  modal: (p) => p.show_in_modal,
  top_bar: (p) => p.show_in_top_bar,
  home_section: (p) => p.show_in_home_section,
};

/** Every live promotion that asked for this surface, in the order staff set.
 *
 *  Three sailings can each carry their own offer at the same time, and they
 *  are not alternatives to each other — a visitor interested in the October
 *  departure is not served by being shown only the one for December. The
 *  surfaces differ in what they can do about that:
 *
 *  - the home section lays them all out, because it has the room;
 *  - the top bar cycles through them, because it has one line;
 *  - the modal shows one, because two modals is a broken site.
 *
 *  Returns a stable empty array while loading so callers can map over it
 *  without a null check. */
export function usePromotionsFor(surface: PromotionSurface): Promotion[] {
  const { data } = usePromotions();
  if (!data?.length) return EMPTY;
  return data.filter(WANTS[surface]);
}

const EMPTY: Promotion[] = [];

/** The single promotion a surface that can only hold one should show.
 *
 *  Staff order promotions with `sort_order` and the server returns them in
 *  that order, so "the first one that asked for this surface" is the whole
 *  rule. */
export function usePromotionFor(surface: PromotionSurface): Promotion | undefined {
  return usePromotionsFor(surface)[0];
}
