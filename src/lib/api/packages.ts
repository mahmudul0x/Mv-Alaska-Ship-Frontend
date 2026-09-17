import { apiClient } from "./client";
import type { Package, PackageDetail, PackageRoom } from "./types";

export async function getPackages(): Promise<Package[]> {
  const { data } = await apiClient.get<Package[]>("/packages/");
  return data;
}

/** Sailings that have returned or were called off. Its own endpoint, not a
 *  flag on the list: the list feeds the booking wizard, where a cancelled
 *  departure must never appear. */
export async function getArchivedPackages(): Promise<Package[]> {
  const { data } = await apiClient.get<Package[]>("/packages/archive/");
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
