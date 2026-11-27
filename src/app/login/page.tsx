"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const result = await login({ identifier, password, ...(mfaRequired ? { mfaCode } : {}) });
      if (result.mfaRequired) { setMfaRequired(true); return; }
      router.replace(result.account.accountType === "platform" ? "/platform" : "/dashboard");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not sign in"); }
    finally { setBusy(false); }
  }

  return <div className="auth-page">
    <div className="auth-brand"><span className="brand-mark"><Building2 size={21} /></span><strong>HRMS Workspace</strong><ThemeToggle /></div>
    <section className="auth-card">
      <div className="auth-icon"><LockKeyhole size={23} /></div>
      <p className="eyebrow">Secure access</p><h1>Welcome back</h1>
      <p className="auth-intro">{mfaRequired ? "Enter your two-step verification code to continue." : "Sign in securely with your username and password."}</p>
      <form onSubmit={(event) => void submit(event)} className="form-stack">
        {!mfaRequired ? <>
          <label>Username or email<input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" placeholder="Email or employee ID" /></label>
          <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        </> : <>
          <label>Two-step verification code<input required autoFocus value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} autoComplete="one-time-code" inputMode="numeric" placeholder="Authenticator or recovery code" /></label>
          <button type="button" className="secondary-button" onClick={() => { setMfaRequired(false); setMfaCode(""); setError(""); }}>Back to sign in</button>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Please wait…" : mfaRequired ? "Verify and sign in" : "Sign in"}</button>
      </form>
      <p className="auth-note">New employee? Ask your HR administrator for an invitation. <Link href="/invite">Accept invitation</Link></p>
    </section>
  </div>;
}
