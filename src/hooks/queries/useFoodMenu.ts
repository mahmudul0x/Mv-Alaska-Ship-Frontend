import { useQuery } from "@tanstack/react-query";

import { getShipFoodMenu, getShips } from "@/lib/api/ships";

/** Single-ship deployment today, but resolves the ship dynamically instead
 * of hardcoding an id — safe as more ships are added. */
export function useFoodMenu() {
  const ships = useQuery({ queryKey: ["ships"], queryFn: getShips });
  const shipId = ships.data?.[0]?.id;

  const menu = useQuery({
    queryKey: ["ship-food-menu", shipId],
    queryFn: () => getShipFoodMenu(shipId!),
    enabled: shipId !== undefined,
  });

  return {
    data: menu.data,
    isLoading: ships.isLoading || menu.isLoading,
  };
}
