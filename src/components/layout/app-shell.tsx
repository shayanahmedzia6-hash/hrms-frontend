"use client";

import type { ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "./user-menu";
import { useUi } from "./ui-provider";
import { useAuth } from "@/components/auth/auth-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUi();

  return (
    <div className={`app-shell${sidebarCollapsed ? " is-collapsed" : ""}`}>
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <div>
              <div className="top-title">Workspace overview</div>
              <div className="top-subtitle">HR, attendance, payroll and finance</div>
            </div>
          </div>

          <div className="topbar-right">
            <span className="status-pill">
              {session?.account.accountType === "platform" ? "Super Admin" : "Business Workspace"}
            </span>
            <ThemeToggle variant="icon" />
            <UserMenu variant="full" />
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
