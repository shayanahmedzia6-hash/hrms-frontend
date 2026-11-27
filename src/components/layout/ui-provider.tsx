"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

type UiContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
};

const STORAGE_KEY = "hrms-ui-sidebar-collapsed";
const CHANGE_EVENT = "hrms:sidebar-changed";
const UiContext = createContext<UiContextValue | null>(null);

function subscribeToSidebar(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(CHANGE_EVENT, listener); };
}

function getSidebarValue() {
  try { return localStorage.getItem(STORAGE_KEY) === "1"; }
  catch { return false; }
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useSyncExternalStore(subscribeToSidebar, getSidebarValue, () => false);

  const setSidebarCollapsed = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!getSidebarValue());
  }, [setSidebarCollapsed]);

  const value = useMemo(
    () => ({ sidebarCollapsed, setSidebarCollapsed, toggleSidebar }),
    [sidebarCollapsed, setSidebarCollapsed, toggleSidebar],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) throw new Error("useUi must be used inside UiProvider");
  return value;
}
