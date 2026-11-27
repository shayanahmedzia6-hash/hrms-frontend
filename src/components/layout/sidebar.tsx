"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, LogOut, ShieldCheck } from "lucide-react";
import { modules, modulePermissions } from "@/lib/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { session, logout, can } = useAuth();
  const isPlatform = session?.account.accountType === "platform";
  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand-row" aria-label="HRMS dashboard">
        <span className="brand-mark"><Building2 size={19} /></span>
        <span>HRMS Workspace</span>
      </Link>
      <nav className="side-nav" aria-label="Main navigation">
        {isPlatform && <><Link href="/platform" className="nav-link" data-active={pathname === "/platform"}><ShieldCheck size={17} /> Platform Administration</Link><Link href="/settings" className="nav-link" data-active={pathname === "/settings"}>Account Security</Link></>}
        {modules.filter(({ slug }) => slug === "dashboard" || (!isPlatform && can(modulePermissions[slug] ?? "self.read"))).map(({ slug, name, icon: Icon }) => (
          <Link href={`/${slug}`} className="nav-link" data-active={pathname === `/${slug}`} key={slug}>
            <Icon size={17} strokeWidth={1.9} />{name}
          </Link>
        ))}
      </nav>
      <div className="side-foot">
        <ThemeToggle />
        <p className="side-foot-copy">{session?.account.email}</p>
        <button type="button" className="nav-link signout" onClick={() => void logout()}><LogOut size={16} /> Sign out</button>
      </div>
    </aside>
  );
}
