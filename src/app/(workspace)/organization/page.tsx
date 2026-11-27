"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { OrganizationConsole } from "@/components/organization/organization-console";

export default function OrganizationPage() {
  const { can, session } = useAuth();
  if (session?.account.accountType !== "business" || !can("organization.read")) return <section className="empty-panel"><h2>Access denied</h2><p>You do not have organization access.</p></section>;
  return <OrganizationConsole />;
}
