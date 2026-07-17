import { apiClient } from "./client";
import type { CabinDetail, CabinSummary } from "./types";

export async function getCabins(): Promise<CabinSummary[]> {
  const { data } = await apiClient.get<CabinSummary[]>("/cabins/");
  return data;
}

export async function getCabin(slug: string): Promise<CabinDetail> {
  const { data } = await apiClient.get<CabinDetail>(`/cabins/${slug}/`);
  return data;
}
