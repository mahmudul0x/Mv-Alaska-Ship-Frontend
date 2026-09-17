import { useQuery } from "@tanstack/react-query";

import { getPackage, getPackages } from "@/lib/api/packages";

export function usePackages() {
  return useQuery({ queryKey: ["packages"], queryFn: getPackages });
}

export function usePackage(id: number | undefined) {
  return useQuery({
    queryKey: ["packages", id],
    queryFn: () => getPackage(id!),
    enabled: id !== undefined,
  });
}
