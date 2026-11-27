"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, Settings, ShieldCheck } from "lucide-react";
import { modules, modulePermissions } from "@/lib/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useUi } from "./ui-provider";

function initialsFromEmail(email?: string) {
  if (!email) return "U";
  return (email.split("@")[0] ?? "U").slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { session, can } = useAuth();
  const { sidebarCollapsed } = useUi();
  const isPlatform = session?.account.accountType === "platform";
  const roleLabel = isPlatform ? "Super Admin" : "Business Workspace";

  return (
    <aside className={`sidebar${sidebarCollapsed ? " is-collapsed" : ""}`}>
      <Link
        href="/dashboard"
        className="brand-row"
        aria-label="HRMS dashboard"
        title="HRMS Workspace"
      >
        <span className="brand-mark"><Building2 size={18} strokeWidth={2} /></span>
        {!sidebarCollapsed ? <span>HRMS Workspace</span> : null}
      </Link>

      <nav className="side-nav" aria-label="Main navigation">
        {isPlatform && (
          <>
            <Link
              href="/platform"
              className="nav-link"
              data-active={pathname === "/platform" ? "true" : "false"}
              title="Platform Administration"
            >
              <ShieldCheck size={16} strokeWidth={1.75} />
              {!sidebarCollapsed ? "Platform Administration" : null}
            </Link>
            <Link
              href="/settings"
              className="nav-link"
              data-active={pathname === "/settings" ? "true" : "false"}
              title="Account Security"
            >
              <Settings size={16} strokeWidth={1.75} />
              {!sidebarCollapsed ? "Account Security" : null}
            </Link>
          </>
        )}
        {modules
          .filter(({ slug }) => slug === "dashboard" || (!isPlatform && can(modulePermissions[slug] ?? "self.read")))
          .map(({ slug, name, icon: Icon }) => (
            <Link
              href={`/${slug}`}
              className="nav-link"
              data-active={pathname === `/${slug}` ? "true" : "false"}
              key={slug}
              title={name}
            >
              <Icon size={16} strokeWidth={1.75} />
              {!sidebarCollapsed ? name : null}
            </Link>
          ))}
      </nav>

      {!sidebarCollapsed ? (
        <div className="side-foot">
          <div className="user-card">
            <span className="user-avatar" aria-hidden>
              {initialsFromEmail(session?.account.email)}
            </span>
            <span className="user-meta">
              <span className="user-name">{session?.account.email ?? "Signed in"}</span>
              <span className="user-role">{roleLabel}</span>
            </span>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
