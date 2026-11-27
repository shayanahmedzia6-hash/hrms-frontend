"use client";

import { ModuleCard } from "@/components/ui/module-card";
import { modules, modulePermissions } from "@/lib/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";

export default function Dashboard() {
  const { can, session } = useAuth();
  const platform = session?.account.accountType === "platform";
  const visible = platform ? [] : modules.filter(({ slug }) => slug !== "dashboard" && can(modulePermissions[slug] ?? "self.read"));
  return (
    <>
      <p className="eyebrow">Multi-tenant HRMS</p>
      <h1 className="page-heading">Your people operations,<br />all in one place.</h1>
      <p className="page-lead">{platform ? "Manage subscribed businesses, their branches and initial administrator access." : "Your visible modules are determined by verified business and branch permissions."}</p>
      <div className="info-banner"><strong>Development status:</strong> Authentication and tenant administration are connected. Attendance, payroll, and finance dashboards will be implemented in later phases—no fake totals are shown.</div>
      {platform && <section className="admin-panel"><h2>Platform console</h2><p>Manage businesses, branch limits and initial administrator invitations.</p><Link href="/platform" className="primary-button">Open Platform Administration</Link></section>}
      <div className="grid-header"><h2>Available modules</h2><span className="grid-meta">{visible.length} feature areas</span></div>
      <div className="module-grid">
        {visible.map((item) => <ModuleCard key={item.slug} {...item} />)}
      </div>
    </>
  );
}
