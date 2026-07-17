import { useQuery } from "@tanstack/react-query";

import { getCabin, getCabins } from "@/lib/api/cabins";

export function useCabins() {
  return useQuery({ queryKey: ["cabins"], queryFn: getCabins });
}

export function useCabin(slug: string) {
  return useQuery({ queryKey: ["cabins", slug], queryFn: () => getCabin(slug) });
}
