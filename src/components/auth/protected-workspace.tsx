"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function ProtectedWorkspace({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  // Always render {children} so Next.js instant-navigation validation can see
  // every workspace segment (cacheComponents). Gate only the visible shell.
  if (status !== "authenticated") {
    return (
      <>
        <div className="auth-loading">
          {status === "loading" ? "Restoring your secure session…" : "Redirecting to login…"}
        </div>
        <div hidden aria-hidden="true">
          {children}
        </div>
      </>
    );
  }

  return children;
}
