const ACCESS_KEY = "staff_access_token";
const REFRESH_KEY = "staff_refresh_token";
const USER_KEY = "staff_user";

export type StaffRole = "admin" | "booking";

export type StaffUser = {
  username: string;
  first_name: string;
  is_staff: boolean;
  role?: StaffRole;
  is_admin?: boolean;
  /** What this account may do, as sent at login. Administrators get the full
   *  list, so nothing here has to re-derive "admin means everything". */
  capabilities?: string[];
};

/** Whether this session may reach the administrator-only screens.
 *
 *  Used to hide what an account cannot use. That is courtesy, not security:
 *  every endpoint enforces the role itself, so a hidden screen reached by
 *  typing its URL still returns 403.
 *
 *  Defaults to TRUE when the field is missing. A session stored before roles
 *  existed has no role on it, and its owner is an administrator — treating
 *  the absence as "restricted" would blank the dashboard for the very person
 *  who installed this, until they worked out they had to log in again. */
export function isStaffAdmin(user: StaffUser | null = getStaffUser()): boolean {
  if (!user) return false;
  if (typeof user.is_admin === "boolean") return user.is_admin;
  if (user.role) return user.role === "admin";
  return true;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStaffUser(): StaffUser | null {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? (JSON.parse(raw) as StaffUser) : null;
  } catch {
    return null;
  }
}

export function setStaffSession(access: string, refresh: string, user?: StaffUser) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStaffSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isStaffLoggedIn() {
  return Boolean(getRefreshToken());
}

/** Whether this session was given any of the named capabilities.
 *
 *  "Any of", matching the server's HasCapability.of(...): a screen that two
 *  jobs both legitimately use is shown to either.
 *
 *  Courtesy, not security — the API enforces every one of these itself. It
 *  decides what to SHOW, so nobody is offered a screen that will refuse them.
 *
 *  A session stored before capabilities existed carries no list. Its owner
 *  was an administrator at the time (booking staff did not exist yet), so the
 *  absence falls back to the admin check rather than to "nothing" — which
 *  would blank the dashboard for exactly the person who installed this. */
export function hasCapability(...keys: string[]): boolean {
  const user = getStaffUser();
  if (!user) return false;
  if (isStaffAdmin(user)) return true;
  const held = user.capabilities ?? [];
  return keys.some((k) => held.includes(k));
}
