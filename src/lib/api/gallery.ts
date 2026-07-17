import { apiClient } from "./client";
import type { GalleryImage } from "./types";

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const { data } = await apiClient.get<GalleryImage[]>("/gallery/");
  return data;
}
