import axios, { type AxiosError } from "axios";

import type { ApiError } from "./types";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Collect every leaf message in a DRF error payload, keyed by its path.
 *
 *  DRF nests errors as deeply as the serializer nests, and it uses more than
 *  one shape for the same idea. A single booking can come back as any of:
 *
 *    {rooms: ["This field is required."]}                     flat
 *    {rooms: {"0": {adult_count: "…allows at most 2 adults."}}}  dict by index
 *    {rooms: [{room_id: ["Invalid pk …"]}]}                  list of dicts
 *
 *  The previous version handled only the first: an object value was skipped
 *  outright (leaving fieldErrors as {} — a truthy empty object, which is how a
 *  too-many-guests error showed the customer an EMPTY toast), and a list of
 *  dicts was String()-ed into "[object Object]". Both were reachable from the
 *  live API on ordinary mistakes.
 *
 *  Paths come out dotted — "rooms.0.adult_count" — so the humaniser can name
 *  the cabin and the field. */
function collect(value: unknown, path: string, out: Record<string, string[]>) {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    (out[path] ??= []).push(value);
    return;
  }
  if (Array.isArray(value)) {
    // A list of plain strings belongs to `path` itself; a list of objects is
    // DRF's per-item errors, so the index becomes part of the path.
    value.forEach((item, i) => {
      collect(item, typeof item === "string" ? path : `${path}.${i}`, out);
    });
    return;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      collect(child, path ? `${path}.${key}` : key, out);
    }
    return;
  }
  (out[path] ??= []).push(String(value));
}

/** Normalizes DRF's error shapes — {detail, code} and arbitrarily nested
 * {field: …} — into one ApiError so callers can branch on `.code` or
 * `.fieldErrors`. */
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
  collect(data, "", fieldErrors);
  // An empty object is truthy, so callers testing `if (err.fieldErrors)` would
  // render nothing at all. Hand back undefined when there is genuinely nothing
  // to say, and let them fall through to their own wording.
  return Object.keys(fieldErrors).length
    ? { status, fieldErrors }
    : { status, detail: error.message };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
);
