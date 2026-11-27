"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authService, type Account, type LoginCredentials } from "@/services/auth/auth.service";
import { responseJson } from "@/services/shared/api";

export type { Account };
export type Scope = { businessId: string; branchIds: string[] | null };
export type Session = { account: Account; permissions: Record<string, Scope | undefined> | { platform: true } };

type LoginResult = { mfaRequired: true } | { mfaRequired: false; account: Account };
type AuthContextValue = {
  status: "loading" | "anonymous" | "authenticated";
  session: Session | null;
  login(values: LoginCredentials): Promise<LoginResult>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  api<T>(path: string, init?: RequestInit): Promise<T>;
  can(permission: string): boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const accessToken = useRef<string | null>(null);
  const refreshing = useRef<Promise<string | null> | null>(null);

  const renew = useCallback(async () => {
    if (refreshing.current) return refreshing.current;
    const promise = (async () => {
      try {
        const result = await authService.refresh();
        accessToken.current = result.accessToken;
        return result.accessToken;
      } catch {
        accessToken.current = null;
        return null;
      }
    })();
    refreshing.current = promise;
    try { return await promise; } finally { refreshing.current = null; }
  }, []);

  const api = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const request = async (token: string | null) => fetch(`/api/v1/${path.replace(/^\//, "")}`, {
      ...init,
      credentials: "include",
      headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    let token = accessToken.current;
    if (!token) token = await renew();
    let response = await request(token);
    if (response.status === 401 && token) {
      const renewed = await renew();
      if (renewed) response = await request(renewed);
    }
    return responseJson<T>(response);
  }, [renew]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await renew();
      if (!token) { if (!cancelled) setStatus("anonymous"); return; }
      try {
        const me = await api<Session>("auth/me");
        if (!cancelled) { setSession(me); setStatus("authenticated"); }
      } catch {
        if (!cancelled) { setSession(null); setStatus("anonymous"); }
      }
    })();
    return () => { cancelled = true; };
  }, [renew, api]);

  const login = useCallback(async (values: LoginCredentials): Promise<LoginResult> => {
    const result = await authService.login(values);
    if (result.mfaRequired) return { mfaRequired: true };
    accessToken.current = result.accessToken;
    const me = await api<Session>("auth/me");
    setSession(me);
    setStatus("authenticated");
    return { mfaRequired: false, account: me.account };
  }, [api]);

  const logout = useCallback(async () => {
    try { await authService.logout(); }
    finally { accessToken.current = null; setSession(null); setStatus("anonymous"); }
  }, []);

  const logoutAll = useCallback(async () => {
    try { await api<void>("auth/logout-all", { method: "POST" }); }
    finally { accessToken.current = null; setSession(null); setStatus("anonymous"); }
  }, [api]);

  const can = useCallback((permission: string) => Boolean(session && ("platform" in session.permissions || session.permissions[permission])), [session]);
  const value = useMemo(() => ({ status, session, login, logout, logoutAll, api, can }), [status, session, login, logout, logoutAll, api, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be inside AuthProvider");
  return value;
}
