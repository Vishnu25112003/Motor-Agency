// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser, AuthState, getStoredAuth, setStoredAuth, clearStoredAuth } from "@/lib/auth";
import { authApi } from "@/lib/services";
import { apiClient } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (email: string, password: string, type: "ADMIN" | "MSME" | "AGENCY") => Promise<{ token: string; user: AuthUser }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null, isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    setAuthState(stored);
    apiClient.setAuthToken(stored.token ?? null);
    setIsLoading(false);
    // eslint-disable-next-line no-console
    console.debug('[AuthProvider] initialized with stored auth:', stored);
  }, []);

  const login = useCallback(async (email: string, password: string, type: "ADMIN" | "MSME" | "AGENCY") => {
    const data = await authApi.login(email, password, type) as { token: string; user: AuthUser };
    setStoredAuth(data.user, data.token);
    apiClient.setAuthToken(data.token);
    setAuthState({ user: data.user, token: data.token, isAuthenticated: true });
    // eslint-disable-next-line no-console
    console.debug('[AuthProvider] login completed:', { user: data.user });
    return data;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    apiClient.setAuthToken(null);
    setAuthState({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const val = useContext(AuthContext);
  if (!val) throw new Error('useAuth must be used within AuthProvider');
  return val;
}
