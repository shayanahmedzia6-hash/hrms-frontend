"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { FloatButton } from "@/components/ui/float-button";
import { platformService, type Business, type InitialBranch, type CreatedBusiness } from "@/services/platform/platform.service";


export function PlatformConsole() {
  const { api } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [plan, setPlan] = useState("STARTER");
  const [limit, setLimit] = useState(1);
  const [adminEmail, setAdminEmail] = useState("");
  const [branches, setBranches] = useState<InitialBranch[]>([{ code: "MAIN", name: "Main Branch", timezone: "Asia/Karachi" }]);
  const [invitation, setInvitation] = useState<CreatedBusiness["adminInvitation"]>(null);
  const [newBranchBusiness, setNewBranchBusiness] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchTimezone, setBranchTimezone] = useState("Asia/Karachi");
  const [adminBusinessId, setAdminBusinessId] = useState("");
  const [laterAdminEmail, setLaterAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => setBusinesses(await platformService.listBusinesses(api)), [api]);
  useEffect(() => {
    let active = true;
    void platformService.listBusinesses(api)
      .then((data) => { if (active) setBusinesses(data); })
      .catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : "Could not load businesses"); });
    return () => { active = false; };
  }, [api]);

  function editBranch(index: number, key: keyof InitialBranch, value: string) {
    setBranches((old) => old.map((branch, idx) => idx === index ? { ...branch, [key]: value } : branch));
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true); setInvitation(null);
    try {
      const result = await platformService.createBusiness(api, { code, name, currency, timezone, subscriptionPlanCode: plan, branchLimit: limit, branches, ...(adminEmail ? { adminEmail } : {}) });
      setInvitation(result.adminInvitation);
      setNotice("Business created with its initial branches and default roles.");
      setCode(""); setName(""); setAdminEmail("");
      await load();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not create business"); }
    finally { setBusy(false); }
  }

  async function addBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      await platformService.addBranch(api, newBranchBusiness, { code: branchCode, name: branchName, timezone: branchTimezone });
      setNotice("Branch added successfully within the business limit."); setBranchCode(""); setBranchName(""); await load();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not add branch"); }
    finally { setBusy(false); }
  }

  async function inviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true); setInvitation(null);
    try {
      const result = await platformService.inviteAdmin(api, adminBusinessId, laterAdminEmail);
      setInvitation(result); setNotice("Business administrator invitation issued."); setLaterAdminEmail("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not invite administrator"); }
    finally { setBusy(false); }
  }

  return <>
    <p className="eyebrow">Platform Super Admin</p><h1 className="page-heading">Business onboarding</h1>
    <p className="page-lead">Create tenant businesses, configure branch limits and issue a one-time invitation to their first administrator.</p>
    {error && <p role="alert" className="form-error subsection">{error}</p>}
    {notice && <p className="form-success subsection">{notice}</p>}
    {invitation && (
      <section className="admin-panel subsection">
        <h2>Administrator invitation — save securely now</h2>
        <p>The invitation token is shown only once. Give it to {invitation.email} through a secure channel, not a public message.</p>
        <p className="code-box">{invitation.invitationToken}</p>
        <FloatButton type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(invitation.invitationToken)}>
          Copy invitation token
        </FloatButton>
      </section>
    )}
    <div className="admin-grid">
      <section className="admin-panel"><h2>Create a business</h2>
        <form onSubmit={(event) => void create(event)} className="form-stack">
          <div className="inline-fields"><label>Business code<input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="ASTER" /></label><label>Business name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aster Technologies" /></label></div>
          <div className="inline-fields"><label>Currency<input required maxLength={3} value={currency} onChange={(e) => setCurrency(e.target.value)} /></label><label>Timezone<input required value={timezone} onChange={(e) => setTimezone(e.target.value)} /></label></div>
          <div className="inline-fields"><label>Plan code (billing integration pending)<input required value={plan} onChange={(e) => setPlan(e.target.value)} /></label><label>Maximum active branches<input type="number" min={1} max={1000} required value={limit} onChange={(e) => setLimit(Number(e.target.value))} /></label></div>
          <label>Initial Business Admin email (optional)<input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@company.com" /></label>
          <div className="subsection"><h3>Initial branches ({branches.length})</h3>
            {branches.map((branch, i) => (
              <div key={i} className="subsection form-stack">
                <div className="inline-fields">
                  <label>Branch code<input required value={branch.code} onChange={(e) => editBranch(i, "code", e.target.value)} /></label>
                  <label>Branch name<input required value={branch.name} onChange={(e) => editBranch(i, "name", e.target.value)} /></label>
                </div>
                <label>Timezone<input required value={branch.timezone} onChange={(e) => editBranch(i, "timezone", e.target.value)} /></label>
                <FloatButton type="button" variant="outline" onClick={() => setBranches((old) => old.filter((_, idx) => idx !== i))}>
                  Remove branch
                </FloatButton>
              </div>
            ))}
            <div className="button-row">
              <FloatButton
                type="button"
                variant="outline"
                disabled={branches.length >= limit}
                onClick={() => setBranches((old) => [...old, { code: "", name: "", timezone }])}
              >
                Add initial branch
              </FloatButton>
              <FloatButton type="submit" variant="solid" disabled={busy || branches.length > limit}>
                {busy ? "Creating…" : "Create business"}
              </FloatButton>
            </div>
          </div>
        </form>
      </section>
      <div className="form-stack">
        <section className="admin-panel"><h2>Existing businesses</h2><div className="admin-list">
          {businesses.length === 0 && <p>No businesses have been created yet.</p>}
          {businesses.map((business) => <div className="admin-list-item" key={business.id}><div><strong>{business.name}</strong><span>{business.code} · {business.currency} · {business.subscriptionPlanCode}</span></div><div className="muted">{business.activeBranchCount}/{business.branchLimit} branches</div></div>)}
        </div></section>
        <section className="admin-panel"><h2>Add another branch</h2><p>Branch creation is blocked when the configured limit is reached.</p>
          <form className="form-stack" onSubmit={(event) => void addBranch(event)}>
            <label>Business<select required value={newBranchBusiness} onChange={(e) => setNewBranchBusiness(e.target.value)}><option value="">Choose a business</option>{businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select></label>
            <div className="inline-fields"><label>Code<input required value={branchCode} onChange={(e) => setBranchCode(e.target.value)} /></label><label>Name<input required value={branchName} onChange={(e) => setBranchName(e.target.value)} /></label></div>
            <label>Timezone<input required value={branchTimezone} onChange={(e) => setBranchTimezone(e.target.value)} /></label>
            <FloatButton type="submit" variant="solid" disabled={busy || !newBranchBusiness}>Add branch</FloatButton>
          </form>
        </section>
        <section className="admin-panel"><h2>Invite administrator to an existing business</h2><p>Useful when a business was created without an administrator or needs an additional one.</p>
          <form className="form-stack" onSubmit={(event) => void inviteAdmin(event)}>
            <label>Business<select required value={adminBusinessId} onChange={(e) => setAdminBusinessId(e.target.value)}><option value="">Choose a business</option>{businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select></label>
            <label>Administrator email<input type="email" required value={laterAdminEmail} onChange={(e) => setLaterAdminEmail(e.target.value)} /></label>
            <FloatButton type="submit" variant="solid" disabled={busy || !adminBusinessId}>Issue admin invitation</FloatButton>
          </form>
        </section>
      </div>
    </div>
  </>;
}
