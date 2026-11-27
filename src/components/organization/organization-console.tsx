"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type Branch = { id: string; code: string; name: string; timezone: string };
type Role = { id: string; name: string; isSystem: boolean; permissions: string[] };
type User = { id: string; email: string; status: string };
type Invite = { email: string; invitationToken: string; expiresAt: string };

export function OrganizationConsole() {
  const { api, can, session } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [code, setCode] = useState(""); const [branchName, setBranchName] = useState(""); const [timezone, setTimezone] = useState("Asia/Karachi");
  const [email, setEmail] = useState(""); const [roleId, setRoleId] = useState("");
  const [scopeType, setScopeType] = useState<"business" | "branch">("branch"); const [branchId, setBranchId] = useState("");
  const [roleName, setRoleName] = useState(""); const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [invitation, setInvitation] = useState<Invite | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");

  const canWide = (permission: string) => can(permission) && Boolean(session && !("platform" in session.permissions) && session.permissions[permission]?.branchIds === null);
  const load = useCallback(async () => {
    if (can("branches.read")) setBranches(await api<Branch[]>("business/branches"));
    if (can("roles.read")) {
      const [loadedRoles, permissions] = await Promise.all([api<Role[]>("business/roles"), api<string[]>("business/permissions")]);
      setRoles(loadedRoles); setCatalog(permissions);
    }
    if (can("users.read")) setUsers(await api<User[]>("business/users"));
  }, [api, can]);
  useEffect(() => {
    let active = true;
    void Promise.all([
      can("branches.read") ? api<Branch[]>("business/branches") : Promise.resolve([]),
      can("roles.read") ? api<Role[]>("business/roles") : Promise.resolve([]),
      can("roles.read") ? api<string[]>("business/permissions") : Promise.resolve([]),
      can("users.read") ? api<User[]>("business/users") : Promise.resolve([]),
    ]).then(([availableBranches, availableRoles, availablePermissions, availableUsers]) => {
      if (!active) return;
      setBranches(availableBranches); setRoles(availableRoles); setCatalog(availablePermissions); setUsers(availableUsers);
    }).catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : "Could not load organization"); });
    return () => { active = false; };
  }, [api, can]);

  async function submit(event: FormEvent<HTMLFormElement>, action: () => Promise<void>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try { await action(); await load(); } catch (failure) { setError(failure instanceof Error ? failure.message : "Request failed"); }
    finally { setBusy(false); }
  }

  return <>
    <p className="eyebrow">Organization</p><h1 className="page-heading">Branches, users and roles</h1>
    <p className="page-lead">All records are loaded from your authenticated business scope. Branch users cannot see other branches.</p>
    {error && <p role="alert" className="form-error subsection">{error}</p>}
    {notice && <p className="form-success subsection">{notice}</p>}
    {invitation && <section className="admin-panel subsection"><h2>One-time invitation for {invitation.email}</h2><p>Copy the token now and share it securely. The user can enter it at /invite. It will not be available again.</p><div className="code-box">{invitation.invitationToken}</div><button type="button" className="secondary-button" onClick={() => void navigator.clipboard.writeText(invitation.invitationToken)}>Copy code</button></section>}
    <div className="admin-grid">
      <section className="admin-panel"><h2>Authorized branches</h2>
        <div className="admin-list">{branches.map((branch) => <div className="admin-list-item" key={branch.id}><div><strong>{branch.name}</strong><span>{branch.code} · {branch.timezone}</span></div></div>)}{branches.length === 0 && <p>No branches available for your role.</p>}</div>
        {canWide("branches.manage") && <form className="form-stack subsection" onSubmit={(event) => void submit(event, async () => { await api("business/branches", { method: "POST", body: JSON.stringify({ code, name: branchName, timezone }) }); setNotice("Branch created"); setCode(""); setBranchName(""); })}>
          <h3>Add branch</h3><div className="inline-fields"><label>Code<input required value={code} onChange={(e) => setCode(e.target.value)} /></label><label>Name<input required value={branchName} onChange={(e) => setBranchName(e.target.value)} /></label></div><label>Timezone<input required value={timezone} onChange={(e) => setTimezone(e.target.value)} /></label><button className="primary-button" disabled={busy}>Create branch</button>
        </form>}
      </section>
      <section className="admin-panel"><h2>Account invitations</h2>
        {can("users.read") && <div className="admin-list">{users.map((user) => <div key={user.id} className="admin-list-item"><div><strong>{user.email}</strong><span>Status: {user.status}</span></div></div>)}{users.length === 0 && <p>No business accounts yet.</p>}</div>}
        {canWide("users.invite") && <form className="form-stack subsection" onSubmit={(event) => void submit(event, async () => { const created = await api<Invite>("business/invitations", { method: "POST", body: JSON.stringify({ email, roleId, scopeType, ...(scopeType === "branch" ? { branchId } : {}) }) }); setInvitation(created); setNotice("Invitation issued"); setEmail(""); })}>
          <h3>Invite a user</h3><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Role<select required value={roleId} onChange={(e) => setRoleId(e.target.value)}><option value="">Choose role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
          <label>Grant scope<select value={scopeType} onChange={(e) => setScopeType(e.target.value as "business" | "branch")}><option value="branch">Specific branch</option><option value="business">Entire business</option></select></label>
          {scopeType === "branch" && <label>Branch<select required value={branchId} onChange={(e) => setBranchId(e.target.value)}><option value="">Choose branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>}
          <button className="primary-button" disabled={busy}>Issue invitation</button>
        </form>}
      </section>
      {canWide("roles.read") && <section className="admin-panel"><h2>Business roles</h2>
        <div className="admin-list">{roles.map((role) => <div key={role.id} className="admin-list-item"><div><strong>{role.name} {role.isSystem ? "(system)" : ""}</strong><span>{role.permissions.length} permissions</span></div></div>)}</div>
        {canWide("roles.manage") && <form className="form-stack subsection" onSubmit={(event) => void submit(event, async () => { await api("business/roles", { method: "POST", body: JSON.stringify({ name: roleName, permissions: selectedPerms }) }); setNotice("Custom role created"); setRoleName(""); setSelectedPerms([]); })}>
          <h3>Create custom role</h3><label>Role name<input required value={roleName} onChange={(e) => setRoleName(e.target.value)} /></label>
          <div className="check-grid">{catalog.map((permission) => <label key={permission}><input type="checkbox" checked={selectedPerms.includes(permission)} onChange={(e) => setSelectedPerms((old) => e.target.checked ? [...old, permission] : old.filter((item) => item !== permission))} />{permission}</label>)}</div>
          <button className="primary-button" disabled={busy || selectedPerms.length === 0}>Create role</button>
        </form>}
      </section>}
    </div>
  </>;
}
