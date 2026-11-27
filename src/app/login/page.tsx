"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { FloatButton } from "@/components/ui/float-button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await login({ identifier, password, ...(mfaRequired ? { mfaCode } : {}) });
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      router.replace(result.account.accountType === "platform" ? "/platform" : "/dashboard");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand-bar">
        <ThemeToggle />
      </div>

      <div className="auth-shell">
        <aside className="auth-visual" aria-hidden="true">
          <div className="auth-visual-brand">
            <span className="brand-mark"><Building2 size={18} /></span>
            HRMS Workspace
          </div>
          <p className="auth-visual-headline">
            Run people operations with clarity and control.
          </p>
          <p className="auth-visual-foot">
            <strong>HRMS</strong>
            Attendance · Payroll · Finance · Branches
          </p>
        </aside>

        <section className="auth-card">
          <div className="auth-icon"><LockKeyhole size={20} strokeWidth={2} /></div>
          <p className="eyebrow">Secure access</p>
          <h1>Welcome back</h1>
          <p className="auth-intro">
            {mfaRequired
              ? "Enter your two-step verification code to continue."
              : "Sign in to manage HR, attendance, payroll and finance."}
          </p>

          <form onSubmit={(event) => void submit(event)} className="form-stack">
            {!mfaRequired ? (
              <>
                <label>
                  Username or email
                  <input
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    placeholder="Email or employee ID"
                  />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>
              </>
            ) : (
              <>
                <label>
                  Two-step verification code
                  <input
                    required
                    autoFocus
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    placeholder="Authenticator or recovery code"
                  />
                </label>
                <div className="button-row">
                  <FloatButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMfaRequired(false);
                      setMfaCode("");
                      setError("");
                    }}
                  >
                    Back to sign in
                  </FloatButton>
                  <FloatButton type="submit" variant="solid" disabled={busy}>
                    {busy ? "Please wait…" : "Verify and sign in"}
                  </FloatButton>
                </div>
              </>
            )}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {!mfaRequired ? (
              <FloatButton type="submit" variant="solid" disabled={busy}>
                {busy ? "Please wait…" : "Sign in"}
              </FloatButton>
            ) : null}
          </form>

          <p className="auth-note">
            New employee? Ask your HR administrator for an invitation.{" "}
            <Link href="/invite">Accept invitation</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
