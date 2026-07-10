import { useQuery } from "@tanstack/react-query";

import { getRoomTypes } from "@/lib/api/ships";

export function useRoomTypes() {
  return useQuery({ queryKey: ["room-types"], queryFn: getRoomTypes });
}
