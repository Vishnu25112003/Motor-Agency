// src/lib/auth.ts
import { UserType } from "@shared/schema";

export interface AuthUser {
  id: number | string;
  email: string;
  name?: string;
  type: UserType | string;
  role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = "motortest_auth";

export function getStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user ?? null,
        token: parsed.token ?? null,
        isAuthenticated: !!parsed.token,
      };
    }
  } catch (e) {
    // Failed to parse stored auth
  }
  return { user: null, token: null, isAuthenticated: false };
}

export function setStoredAuth(user: AuthUser, token: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  if (auth.token) {
    return { Authorization: `Bearer ${auth.token}` };
  }
  return {};
}
