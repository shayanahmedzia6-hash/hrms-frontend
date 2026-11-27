"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { modules } from "@/lib/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand-row" aria-label="HRMS dashboard">
        <span className="brand-mark"><Building2 size={19} /></span>
        <span>HRMS Workspace</span>
      </Link>
      <nav className="side-nav" aria-label="Main navigation">
        {modules.map(({ slug, name, icon: Icon }) => (
          <Link href={`/${slug}`} className="nav-link" data-active={pathname === `/${slug}`} key={slug}>
            <Icon size={17} strokeWidth={1.9} />{name}
          </Link>
        ))}
      </nav>
      <div className="side-foot">
        <ThemeToggle />
        <p className="side-foot-copy">Foundation preview. Login and live business data will be connected in the next phase.</p>
      </div>
    </aside>
  );
}
