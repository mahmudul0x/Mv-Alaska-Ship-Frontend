import { apiClient } from "./client";
import type { Package, PackageDetail, PackageRoom } from "./types";

export async function getPackages(): Promise<Package[]> {
  const { data } = await apiClient.get<Package[]>("/packages/");
  return data;
}

export async function getPackage(id: number): Promise<PackageDetail> {
  const { data } = await apiClient.get<PackageDetail>(`/packages/${id}/`);
  return data;
}

export async function getPackageRooms(id: number): Promise<PackageRoom[]> {
  const { data } = await apiClient.get<PackageRoom[]>(`/packages/${id}/rooms/`);
  return data;
}
