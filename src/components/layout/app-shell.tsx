"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";
import { LogOut } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div><div className="top-title">Workspace overview</div><div className="top-subtitle">HR, attendance, payroll and finance</div></div>
          <span className="status-pill">{session?.account.accountType === "platform" ? "Super Admin" : "Business Workspace"}</span>
          <span className="mobile-theme"><ThemeToggle /></span>
          <button type="button" className="topbar-logout" aria-label="Sign out" title="Sign out" onClick={() => void logout()}><LogOut size={17} /></button>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
