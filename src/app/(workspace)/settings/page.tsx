"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function SettingsPage() {
  const { api, logout, logoutAll, session } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    void api<{ enabled: boolean }>("auth/mfa").then((state) => { if (active) setMfaEnabled(state.enabled); });
    return () => { active = false; };
  }, [api]);

  async function beginMfa() {
    setError(""); setBusy(true);
    try {
      const result = await api<{ secret: string }>("auth/mfa/setup", { method: "POST", body: JSON.stringify({ currentPassword: mfaPassword }) });
      setMfaSecret(result.secret);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to start setup"); }
    finally { setBusy(false); }
  }

  async function activateMfa() {
    setError(""); setBusy(true);
    try {
      const result = await api<{ recoveryCodes: string[] }>("auth/mfa/activate", { method: "POST", body: JSON.stringify({ code: mfaCode }) });
      setRecoveryCodes(result.recoveryCodes); setMfaEnabled(true); setMfaSecret(""); setMfaPassword(""); setMfaCode("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to enable two-step verification"); }
    finally { setBusy(false); }
  }

  async function disableMfa() {
    setError(""); setBusy(true);
    try {
      await api("auth/mfa/disable", { method: "POST", body: JSON.stringify({ currentPassword: mfaPassword, code: mfaCode }) });
      await logoutAll().catch(() => undefined); router.replace("/login");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to disable two-step verification"); }
    finally { setBusy(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }); await logoutAll().catch(() => undefined); router.replace("/login"); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to change password"); }
    finally { setBusy(false); }
  }

  return <>
    <p className="eyebrow">Account security</p><h1 className="page-heading">My access & security</h1>
    <p className="page-lead">Change your password or revoke all active sessions. Role and branch access are managed by your business administrator.</p>
    {error && <p role="alert" className="form-error subsection">{error}</p>}
    <div className="admin-grid">
      <section className="admin-panel"><h2>My Access</h2>
        <p>Permissions are calculated from your active role grants on the backend. Changes made by your administrator apply to the next request.</p>
        {session?.account.accountType === "platform" ? <div className="admin-list-item"><strong>Platform Super Admin</strong><span>Platform-wide administration</span></div>
          : <div className="admin-list">{Object.entries(session?.permissions ?? {}).filter(([, scope]) => Boolean(scope)).map(([permission, scope]) => <div className="admin-list-item" key={permission}><div><strong>{permission}</strong><span>{scope && typeof scope === "object" && scope.branchIds === null ? "Entire business" : scope && typeof scope === "object" ? `${scope.branchIds?.length ?? 0} assigned branch(es)` : ""}</span></div></div>)}</div>}
      </section>
      <section className="admin-panel"><h2>Change password</h2><form className="form-stack" onSubmit={(event) => void changePassword(event)}>
        <label>Current password<input type="password" required value={currentPassword} autoComplete="current-password" onChange={(e) => setCurrentPassword(e.target.value)} /></label>
        <label>New password (12+ characters)<input type="password" minLength={12} required value={newPassword} autoComplete="new-password" onChange={(e) => setNewPassword(e.target.value)} /></label>
        <button disabled={busy} className="primary-button">Change password and sign out</button>
      </form></section>
      <section className="admin-panel"><h2>Sign out from all devices</h2><p>Revoke every refresh session and previously issued access token for your account. You must sign in again on each device.</p><button className="secondary-button" onClick={() => void logoutAll().then(() => router.replace("/login"))}>Sign out all devices</button></section>
      <section className="admin-panel"><h2>Two-step verification</h2>
        <p>Status: {mfaEnabled === null ? "Loading…" : mfaEnabled ? "Enabled" : "Not enabled"}. Use a standard TOTP authenticator app.</p>
        {recoveryCodes.length > 0 && <div><p>Save these recovery codes now. All older sessions have been invalidated; sign in again using your authenticator.</p><pre className="code-box">{recoveryCodes.join("\n")}</pre><button type="button" className="secondary-button" onClick={() => void logout().then(() => router.replace("/login"))}>I saved the codes — sign out</button></div>}
        <div className="form-stack">
          {!mfaEnabled && !mfaSecret && <><label>Current password<input type="password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} autoComplete="current-password" /></label><button type="button" disabled={busy || !mfaPassword} className="secondary-button" onClick={() => void beginMfa()}>Set up authenticator</button></>}
          {mfaSecret && <><p>Add this setup key to your authenticator. It changes every 30 seconds.</p><div className="code-box">{mfaSecret}</div><label>6-digit authenticator code<input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} autoComplete="one-time-code" /></label><button type="button" disabled={busy || mfaCode.length !== 6} className="primary-button" onClick={() => void activateMfa()}>Verify and enable</button></>}
          {mfaEnabled && <><label>Current password<input type="password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} autoComplete="current-password" /></label><label>Authenticator or recovery code<input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} autoComplete="one-time-code" /></label><button type="button" disabled={busy || !mfaPassword || !mfaCode} className="secondary-button" onClick={() => void disableMfa()}>Disable two-step verification</button></>}
        </div>
      </section>
    </div>
  </>;
}
