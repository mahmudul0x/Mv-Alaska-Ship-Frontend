import { staffClient } from "./staffClient";
import type { StaffRole } from "@/lib/staffAuth";

/** A dashboard account, as an administrator manages it.
 *
 *  `password` is write-only on the server and never comes back — not even
 *  straight after being set. An account list that can be made to reveal
 *  passwords is one screenshot away from being a leak; resetting is how a
 *  forgotten one is dealt with. */
export type StaffAccount = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: StaffRole;
  role_display: string;
  /** What was ticked for this account. Empty for administrators. */
  capabilities: string[];
  /** What it can actually do — the full list for an administrator. */
  effective_capabilities: string[];
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
};

export type StaffAccountWrite = {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: StaffRole;
  capabilities?: string[];
  is_active?: boolean;
  /** Only when creating, or deliberately resetting. Omit to leave unchanged. */
  password?: string;
};

export async function getStaffAccounts(): Promise<StaffAccount[]> {
  const { data } = await staffClient.get<StaffAccount[]>("/staff/users/");
  return data;
}

export async function createStaffAccount(
  payload: StaffAccountWrite,
): Promise<StaffAccount> {
  const { data } = await staffClient.post("/staff/users/", payload);
  return data;
}

export async function updateStaffAccount(
  id: number,
  payload: StaffAccountWrite,
): Promise<StaffAccount> {
  const { data } = await staffClient.patch(`/staff/users/${id}/`, payload);
  return data;
}

/** Deactivates rather than deletes — the account is referenced by the bookings
 *  it created and the status changes it signed. */
export async function deactivateStaffAccount(id: number): Promise<void> {
  await staffClient.delete(`/staff/users/${id}/`);
}

/** One thing an account can be given, as the server defines it. */
export type CapabilityInfo = {
  key: string;
  label: string;
  description: string;
  group: string;
  /** Costs money or reaches the public — the form says so before ticking. */
  sensitive: boolean;
};

export type CapabilityCatalogue = {
  capabilities: CapabilityInfo[];
  /** Pre-ticked on a new account: the desk job. */
  defaults: string[];
};

/** Served, not duplicated: the boxes an administrator ticks come from the same
 *  list the endpoints enforce, so a box can never grant nothing. */
export async function getCapabilityCatalogue(): Promise<CapabilityCatalogue> {
  const { data } = await staffClient.get<CapabilityCatalogue>("/staff/capabilities/");
  return data;
}
