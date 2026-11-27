"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PlatformConsole } from "@/components/platform/platform-console";

export default function PlatformPage() {
  const { session } = useAuth();
  if (session?.account.accountType !== "platform") return <section className="empty-panel"><h2>Access denied</h2><p>Only the platform Super Admin can manage tenant businesses.</p></section>;
  return <PlatformConsole />;
}
