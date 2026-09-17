import { useQuery } from "@tanstack/react-query";

import { getArchivedPackages, getPackage, getPackages } from "@/lib/api/packages";

export function usePackages() {
  return useQuery({ queryKey: ["packages"], queryFn: getPackages });
}

/** Past and cancelled sailings. `enabled` is the point: nobody pays for this
 *  request until they ask to see the archive. */
export function useArchivedPackages(enabled: boolean) {
  return useQuery({
    queryKey: ["packages", "archive"],
    queryFn: getArchivedPackages,
    enabled,
  });
}

export function usePackage(id: number | undefined) {
  return useQuery({
    queryKey: ["packages", id],
    queryFn: () => getPackage(id!),
    enabled: id !== undefined,
  });
}
