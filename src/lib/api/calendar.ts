import { apiClient } from "./client";
import type { CalendarResponse } from "./types";

export async function getCalendar(year: number, month: number): Promise<CalendarResponse> {
  const { data } = await apiClient.get<CalendarResponse>("/calendar/", {
    params: { year, month },
  });
  return data;
}
