"use client";

import { ModuleCard } from "@/components/ui/module-card";
import { FloatButton } from "@/components/ui/float-button";
import { modules, modulePermissions } from "@/lib/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Users,
  UserMinus,
  Percent,
  UserCheck,
  Clock3,
  Wallet,
} from "lucide-react";

const kpiShells = [
  { label: "Total Employees", Icon: Users },
  { label: "Total Attritions", Icon: UserMinus },
  { label: "Attrition Rate", Icon: Percent },
  { label: "Active Employees", Icon: UserCheck },
  { label: "Avg Tenure", Icon: Clock3 },
  { label: "Avg Salary", Icon: Wallet },
] as const;

export default function Dashboard() {
  const { can, session } = useAuth();
  const platform = session?.account.accountType === "platform";
  const visible = platform
    ? []
    : modules.filter(({ slug }) => slug !== "dashboard" && can(modulePermissions[slug] ?? "self.read"));

  return (
    <>
      <p className="eyebrow">Multi-tenant HRMS</p>
      <h1 className="page-heading">
        {platform ? "Platform overview" : "People operations overview"}
      </h1>
      <p className="page-lead">
        {platform
          ? "Manage subscribed businesses, their branches and initial administrator access."
          : "Your visible modules are determined by verified business and branch permissions."}
      </p>

      <div className="info-banner">
        <strong>Development status:</strong> Authentication and tenant administration are connected.
        KPI and chart panels below are layout shells only—no fake employee or payroll totals are shown.
      </div>

      {platform && (
        <section className="admin-panel" style={{ marginBottom: 20 }}>
          <h2>Platform console</h2>
          <p>Manage businesses, branch limits and initial administrator invitations.</p>
          <div className="button-row">
            <FloatButton href="/settings" variant="outline">Account settings</FloatButton>
            <FloatButton href="/platform" variant="solid">Open Platform Administration</FloatButton>
          </div>
        </section>
      )}

      {!platform && (
        <>
          <div className="kpi-grid">
            {kpiShells.map(({ label, Icon }) => (
              <article className="kpi-card" key={label}>
                <span className="kpi-icon"><Icon size={16} strokeWidth={2} /></span>
                <span className="kpi-label">{label}</span>
                <span className="kpi-value">—</span>
                <span className="kpi-hint">Connected when HR data APIs ship</span>
              </article>
            ))}
          </div>

          <div className="panel-grid">
            <section className="chart-panel">
              <h3>Attrition trend</h3>
              <div className="chart-placeholder">Chart area reserved for live attendance &amp; attrition series</div>
            </section>
            <section className="chart-panel">
              <h3>Workforce mix</h3>
              <div className="chart-placeholder">Donut / breakdown widgets will use the same crimson palette</div>
            </section>
          </div>
        </>
      )}

      <div className="grid-header">
        <h2>Available modules</h2>
        <span className="grid-meta">{visible.length} feature areas</span>
      </div>
      <div className="module-grid">
        {visible.map((item) => (
          <ModuleCard key={item.slug} {...item} />
        ))}
      </div>
    </>
  );
}
