"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

function initialsFromEmail(email?: string) {
  if (!email) return "U";
  return (email.split("@")[0] ?? "U").slice(0, 2).toUpperCase();
}

export function UserMenu({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isPlatform = session?.account.accountType === "platform";
  const roleLabel = isPlatform ? "Super Admin" : "Business Workspace";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="user-menu">
      <button
        type="button"
        className={`user-menu-trigger${variant === "compact" ? " is-compact" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-avatar" aria-hidden>
          {initialsFromEmail(session?.account.email)}
        </span>
        {variant === "full" ? (
          <>
            <span className="user-meta">
              <span className="user-name">{session?.account.email ?? "User"}</span>
              <span className="user-role">{roleLabel}</span>
            </span>
            <ChevronDown size={16} className={`user-menu-chevron${open ? " is-open" : ""}`} />
          </>
        ) : null}
      </button>

      {open ? (
        <div role="menu" className="user-menu-dropdown">
          <Link
            href="/settings"
            role="menuitem"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} />
            Profile settings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="user-menu-item is-danger"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
