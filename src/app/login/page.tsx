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
  const [accountType, setAccountType] = useState<"platform" | "business">("business");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessCode, setBusinessCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      await login({ accountType, email, password, ...(accountType === "business" ? { businessCode } : {}), ...(mfaCode ? { mfaCode } : {}) });
      router.replace(accountType === "platform" ? "/platform" : "/dashboard");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not sign in"); }
    finally { setBusy(false); }
  }

  return <div className="auth-page">
    <div className="auth-brand"><span className="brand-mark"><Building2 size={21} /></span><strong>HRMS Workspace</strong><ThemeToggle /></div>
    <section className="auth-card">
      <div className="auth-icon"><LockKeyhole size={23} /></div>
      <p className="eyebrow">Secure access</p><h1>Welcome back</h1>
      <p className="auth-intro">Sign in to your business and branch workspace.</p>
      <form onSubmit={(event) => void submit(event)} className="form-stack">
        <label>Workspace type<select value={accountType} onChange={(e) => setAccountType(e.target.value as "platform" | "business")}><option value="business">Business workspace</option><option value="platform">Platform Super Admin</option></select></label>
        {accountType === "business" && <label>Business code<input required value={businessCode} onChange={(e) => setBusinessCode(e.target.value)} placeholder="e.g. ASTER" autoComplete="organization" /></label>}
        <label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="name@company.com" /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <label>Two-step code (if enabled)<input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} autoComplete="one-time-code" inputMode="numeric" placeholder="Authenticator or recovery code" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="auth-note">New employee? Ask your HR administrator for an invitation. <Link href="/invite">Accept invitation</Link></p>
    </section>
  </div>;
}
