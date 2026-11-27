"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Account = { id: string; email: string; businessId: string | null; accountType: "platform" | "business" };
export type Scope = { businessId: string; branchIds: string[] | null };
export type Session = { account: Account; permissions: Record<string, Scope | undefined> | { platform: true } };

type LoginValues = { email: string; password: string; accountType: "platform" | "business"; businessCode?: string; mfaCode?: string };
type AuthContextValue = {
  status: "loading" | "anonymous" | "authenticated";
  session: Session | null;
  login(values: LoginValues): Promise<void>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
  api<T>(path: string, init?: RequestInit): Promise<T>;
  can(permission: string): boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { message?: string | string[] };
    throw new Error(Array.isArray(error.message) ? error.message.join(", ") : error.message ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const accessToken = useRef<string | null>(null);
  const refreshing = useRef<Promise<string | null> | null>(null);

  const renew = useCallback(async () => {
    if (refreshing.current) return refreshing.current;
    const promise = (async () => {
      try {
        const result = await json<{ accessToken: string }>(await fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" }));
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
    return json<T>(response);
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

  const login = useCallback(async (values: LoginValues) => {
    const result = await json<{ accessToken: string }>(await fetch("/api/v1/auth/login", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
    }));
    accessToken.current = result.accessToken;
    const me = await api<Session>("auth/me");
    setSession(me);
    setStatus("authenticated");
  }, [api]);

  const logout = useCallback(async () => {
    try { await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }); }
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
