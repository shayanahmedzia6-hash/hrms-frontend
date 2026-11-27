"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { modulePermissions, modules } from "@/lib/navigation";
import { ShiftConsole } from "@/components/attendance/shift-console";

export function ModuleView({ slug }: { slug: string }) {
  const { can, session } = useAuth();
  const feature = modules.find((item) => item.slug === slug);
  if (!feature || session?.account.accountType === "platform" || !can(modulePermissions[slug] ?? "self.read")) {
    return <section className="empty-panel"><h2>Access denied</h2><p>This module is outside your assigned permissions.</p></section>;
  }
  if (slug === "attendance") return <ShiftConsole />;
  return <>
    <p className="eyebrow">System module</p>
    <h1 className="page-heading">{feature.name}</h1>
    <p className="page-lead">{feature.description}</p>
    <section className="empty-panel"><h2>Feature implementation scheduled</h2><p>Only authentication, business onboarding and branch/role administration are active in this phase. This feature does not yet load tenant data.</p></section>
  </>;
}
