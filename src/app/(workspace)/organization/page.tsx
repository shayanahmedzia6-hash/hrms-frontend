"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { OrganizationConsole } from "@/components/organization/organization-console";
import { PeopleConsole } from "@/components/organization/people-console";
import { useState } from "react";

export default function OrganizationPage() {
  const { can, session } = useAuth();
  const [section, setSection] = useState<"people" | "access">("people");
  if (session?.account.accountType !== "business" || !can("organization.read")) return <section className="empty-panel"><h2>Access denied</h2><p>You do not have organization access.</p></section>;
  const hasAccessAdmin = can("branches.manage") || can("users.read") || can("roles.read") || can("grants.manage");
  return <>
    <nav className="record-tabs" aria-label="Organization sections">
      <button type="button" aria-current={section === "people" ? "page" : undefined} onClick={() => setSection("people")}>People & departments</button>
      {hasAccessAdmin && <button type="button" aria-current={section === "access" ? "page" : undefined} onClick={() => setSection("access")}>Branches & access</button>}
    </nav>
    {section === "people" ? <PeopleConsole /> : <OrganizationConsole />}
  </>;
}
