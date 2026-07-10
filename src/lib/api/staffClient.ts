import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  clearStaffSession,
  getAccessToken,
  getRefreshToken,
  setStaffSession,
} from "@/lib/staffAuth";
import { toApiError } from "./client";

/** Separate axios instance for the staff dashboard: Bearer token on every
 * request, silent refresh-and-retry on 401. The public client is untouched
 * so customer pages never redirect to the staff login. */
export const staffClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

staffClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${import.meta.env.VITE_API_BASE_URL}/staff/login/refresh/`,
    { refresh },
  );
  // Rotation is on server-side: a new refresh token comes back too.
  setStaffSession(data.access, data.refresh ?? refresh!);
  return data.access;
}

staffClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    if (error.response?.status === 401 && !original._retried && getRefreshToken()) {
      original._retried = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => {
          refreshing = null;
        });
        const access = await refreshing;
        original.headers.Authorization = `Bearer ${access}`;
        return staffClient(original);
      } catch {
        clearStaffSession();
        window.location.href = "/staff/login";
      }
    }
    return Promise.reject(toApiError(error));
  },
);
