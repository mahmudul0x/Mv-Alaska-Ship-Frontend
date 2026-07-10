const ACCESS_KEY = "staff_access_token";
const REFRESH_KEY = "staff_refresh_token";
const USER_KEY = "staff_user";

export type StaffUser = { username: string; first_name: string; is_staff: boolean };

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
