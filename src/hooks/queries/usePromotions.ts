import { useQuery } from "@tanstack/react-query";

import { getPromotions, type Promotion } from "@/lib/api/promotions";

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

/** The single promotion a given surface should show.
 *
 *  The modal and the hero strip are singular by nature — two modals is a
 *  broken site, and two stacked strips push the hero off the screen. Staff
 *  order promotions with `sort_order`, and the server returns them in that
 *  order, so "the first one that asked for this surface" is the whole rule. */
export function usePromotionFor(
  surface: "modal" | "hero" | "home_section",
): Promotion | undefined {
  const { data } = usePromotions();
  if (!data?.length) return undefined;

  const wants: Record<typeof surface, (p: Promotion) => boolean> = {
    modal: (p) => p.show_in_modal,
    hero: (p) => p.show_in_hero,
    home_section: (p) => p.show_in_home_section,
  };

  return data.find(wants[surface]);
}
