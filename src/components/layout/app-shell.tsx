import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div><div className="top-title">Workspace overview</div><div className="top-subtitle">HR, attendance, payroll and finance</div></div>
          <span className="status-pill">Architecture foundation</span>
          <span className="mobile-theme"><ThemeToggle /></span>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
