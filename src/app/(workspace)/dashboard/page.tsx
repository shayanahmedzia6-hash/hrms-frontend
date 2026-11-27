import { ModuleCard } from "@/components/ui/module-card";
import { modules } from "@/lib/navigation";

export default function Dashboard() {
  return (
    <>
      <p className="eyebrow">Multi-tenant HRMS</p>
      <h1 className="page-heading">Your people operations,<br />all in one place.</h1>
      <p className="page-lead">A modular workspace for multiple businesses and branches, with role-based access and one general ledger per business.</p>
      <div className="info-banner"><strong>Development status:</strong> This is the initial UI architecture, not a live dashboard. Counts and business records will appear only after MongoDB, authentication and APIs are connected.</div>
      <div className="grid-header"><h2>System modules</h2><span className="grid-meta">{modules.length - 1} feature areas</span></div>
      <div className="module-grid">
        {modules.filter(({ slug }) => slug !== "dashboard").map((item) => <ModuleCard key={item.slug} {...item} />)}
      </div>
    </>
  );
}
