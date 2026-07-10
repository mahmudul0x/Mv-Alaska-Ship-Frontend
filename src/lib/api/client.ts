import axios, { type AxiosError } from "axios";

import type { ApiError } from "./types";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Normalizes DRF's two error shapes — {detail, code} and {field: [msgs]} —
 * into one ApiError so callers can branch on `.code` or `.fieldErrors`. */
export function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as Record<string, unknown> | undefined;

  if (!data) {
    return { status, detail: error.message };
  }
  if (typeof data.detail === "string") {
    return { status, detail: data.detail, code: data.code as string | undefined };
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      fieldErrors[key] = value.map(String);
    } else if (typeof value === "string") {
      fieldErrors[key] = [value];
    }
  }
  return { status, fieldErrors };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
);
