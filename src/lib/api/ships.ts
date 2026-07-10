import { apiClient } from "./client";
import type { FoodMenu, RoomType, ShipLayout, ShipMini } from "./types";

export async function getShips(): Promise<ShipMini[]> {
  const { data } = await apiClient.get<ShipMini[]>("/ships/");
  return data;
}

export async function getShipLayout(shipId: number): Promise<ShipLayout> {
  const { data } = await apiClient.get<ShipLayout>(`/ships/${shipId}/layout/`);
  return data;
}

export async function getShipFoodMenu(shipId: number): Promise<FoodMenu> {
  const { data } = await apiClient.get<FoodMenu>(`/ships/${shipId}/food-menu/`);
  return data;
}

export async function getRoomTypes(): Promise<RoomType[]> {
  const { data } = await apiClient.get<RoomType[]>("/room-types/");
  return data;
}
