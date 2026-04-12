const TOKEN_KEY = "office_portal_token";
const USER_KEY = "office_portal_user";

export type Role = "employee" | "admin";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  baseSalary?: number;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function getToken(): string | null {
  const storage = getStorage();
  return storage?.getItem(TOKEN_KEY) ?? null;
}

export function setSession(token: string, user: StoredUser) {
  const storage = getStorage();
  storage?.setItem(TOKEN_KEY, token);
  storage?.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  const storage = getStorage();
  storage?.removeItem(TOKEN_KEY);
  storage?.removeItem(USER_KEY);
}

export function getStoredUser(): StoredUser | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
