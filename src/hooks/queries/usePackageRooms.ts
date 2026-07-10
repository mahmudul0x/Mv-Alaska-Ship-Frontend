import { useQuery } from "@tanstack/react-query";

import { getPackageRooms } from "@/lib/api/packages";

export function usePackageRooms(packageId: number | undefined) {
  return useQuery({
    queryKey: ["packages", packageId, "rooms"],
    queryFn: () => getPackageRooms(packageId!),
    enabled: packageId !== undefined,
  });
}
